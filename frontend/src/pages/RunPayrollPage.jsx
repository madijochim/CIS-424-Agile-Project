import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function formatMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(2);
}

function RunPayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inputsById, setInputsById] = useState({});
  /** @type {Record<string, object>} */
  const [taxPayrollById, setTaxPayrollById] = useState({});

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/payroll/runs", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to load payroll employees.");
      }

      setEmployees(data.employees || []);

      const initialInputs = {};
      (data.employees || []).forEach((emp) => {
        initialInputs[emp._id] = {
          totalHours: emp.hoursWorked ?? "",
          salary: emp.salary ?? "",
          payFrequency: emp.payFrequency ?? "",
          bonusPay: emp.bonusPay ?? "",
        };
      });

      setInputsById(initialInputs);

      const taxSeed = {};
      (data.employees || []).forEach((e) => {
        if (e._id && e.payroll) taxSeed[e._id] = e.payroll;
      });
      setTaxPayrollById(taxSeed);
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!employees.length) {
      setTaxPayrollById({});
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const lines = employees.map((emp) => ({
          employeeId: emp._id,
          totalHours: inputsById[emp._id]?.totalHours,
          salary: inputsById[emp._id]?.salary,
          payFrequency: inputsById[emp._id]?.payFrequency,
          bonusPay: inputsById[emp._id]?.bonusPay,
        }));

        const res = await fetch("http://localhost:5000/api/payroll/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ lines }),
        });

        const data = await res.json();
        if (!res.ok) return;

        const next = {};
        (data.employees || []).forEach((row) => {
          if (row._id) next[row._id] = row.payroll;
        });
        setTaxPayrollById(next);
      } catch {
        /* ignore preview errors */
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [employees, inputsById]);

  const handleInputChange = (employeeId, field, value) => {
    setInputsById((prev) => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value,
      },
    }));
  };

  const payrollRows = useMemo(() => {
    return employees.map((emp) => {
      const currentInputs = inputsById[emp._id] || {};

      if (emp.payType === "hourly") {
        const totalHours = Number(currentInputs.totalHours ?? emp.hoursWorked ?? 0);
        const regularHours = totalHours > 40 ? 40 : totalHours;
        const otHours = totalHours > 40 ? totalHours - 40 : 0;
        const rate = Number(emp.rate ?? 0);

        const standardGrossPay =
          Number.isNaN(regularHours) || Number.isNaN(rate) || regularHours < 0 || rate < 0
          ? null
          : regularHours * rate;

        const overtimeGrossPay = 
          Number.isNaN(otHours) || Number.isNaN(rate) || otHours < 0 || rate < 0
          ? null
          : otHours * rate * 1.5;

        const bonusPay = Number(currentInputs.bonusPay ?? emp.bonusPay ?? 0);

        const totalGrossPay =
          Number.isNaN(regularHours) || Number.isNaN(rate) || regularHours < 0 || rate < 0 || otHours < 0
            ? null
            : (regularHours * rate) + (otHours * rate * 1.5) + bonusPay;

        return {
          ...emp,
          payrollPreview: {
            payType: "hourly",
            totalHours: Number.isNaN(totalHours) ? "" : totalHours,
            regularHours: Number.isNaN(regularHours) ? "" : regularHours,
            otHours: Number.isNaN(otHours) ? "" : otHours,
            hourlyRate: rate,
            standardGrossPay,
            overtimeGrossPay,
            bonusPay,
            totalGrossPay,
          },
        };
      }

      if (emp.payType === "salary") {
        const salary = Number(currentInputs.salary ?? emp.salary ?? 0);
        const payFrequency = currentInputs.payFrequency ?? emp.payFrequency ?? "";

        let periods = 0;
        if (payFrequency === "weekly") periods = 52;
        if (payFrequency === "biweekly") periods = 26;

        const bonusPay = Number(currentInputs.bonusPay ?? emp.bonusPay ?? 0);

        const totalGrossPay =
          Number.isNaN(salary) || salary < 0 || periods <= 0
            ? null
            : (salary / periods) + bonusPay;

        return {
          ...emp,
          payrollPreview: {
            payType: "salary",
            annualSalary: Number.isNaN(salary) ? "" : salary,
            payFrequency,
            periods,
            bonusPay,
            totalGrossPay,
          },
        };
      }

      return {
        ...emp,
        payrollPreview: {
          error: "Unknown pay type.",
        },
      };
    });
  }, [employees, inputsById]);

  const handleSaveInputs = async () => {
    try {
      setSaving(true);

      for (const emp of employees) {
        const currentInputs = inputsById[emp._id] || {};

        const payload = {
          name: emp.name,
          ssn: emp.ssn,
          department: emp.department,
          payType: emp.payType,
          jobTitle: emp.jobTitle ?? null,
          email: emp.email ?? null,
          phone: emp.phone ?? null,
          hireDate: emp.hireDate ? String(emp.hireDate).split("T")[0] : null,
        };

        if (emp.payType === "hourly") {
          payload.rate = emp.rate;
          payload.hoursWorked =
            currentInputs.totalHours === "" ? 0 : Number(currentInputs.totalHours);
          payload.salary = null;
          payload.payFrequency = null;
          payload.bonusPay =
            currentInputs.bonusPay === "" ? 0 : Number(currentInputs.bonusPay);
        }

        if (emp.payType === "salary") {
          payload.rate = null;
          payload.hoursWorked = 0;
          payload.salary =
            currentInputs.salary === "" ? null : Number(currentInputs.salary);
          payload.payFrequency = currentInputs.payFrequency || null;
          payload.bonusPay =
            currentInputs.bonusPay === "" ? 0 : Number(currentInputs.bonusPay);
        }

        const res = await fetch(`http://localhost:5000/api/employees/${emp._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || data.error || `Failed to save ${emp.name}`);
        }
      }

      alert("Payroll inputs saved successfully.");
      await fetchEmployees();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save payroll inputs.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl rounded-xl border bg-white p-6 shadow">
        <div>
          <Link to="/" className="text-indigo-600">
            ← Home
          </Link>

          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Run Payroll</h1>
          <p className="mt-2 text-sm text-slate-600">
            Enter payroll inputs by employee. Federal and FICA amounts update automatically (preview)
            as you type; save inputs to persist hours, salary, and bonus to the employee record.
          </p>
        </div>

        {loading && <p className="mt-6 text-slate-600">Loading employees...</p>}
        {error && <p className="mt-6 text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 overflow-x-auto">
            {payrollRows.length === 0 ? (
              <p className="text-slate-500">No active employees found.</p>
            ) : (
              <>
                <table className="min-w-full border border-slate-200 text-sm">
                  <thead className="bg-slate-100 text-slate-700">
                    <tr>
                      <th className="border px-3 py-2 text-left">Name</th>
                      <th className="border px-3 py-2 text-left">Department</th>
                      <th className="border px-3 py-2 text-left">Pay Type</th>
                      <th className="border px-3 py-2 text-left">Total Hours</th>
                      <th className="border px-3 py-2 text-left">Standard Hours</th>
                      <th className="border px-3 py-2 text-left">Overtime Hours</th>
                      <th className="border px-3 py-2 text-left">Rate</th>
                      <th className="border px-3 py-2 text-left">Salary</th>
                      <th className="border px-3 py-2 text-left">Frequency</th>
                      <th className="border px-3 py-2 text-left">Standard Gross</th>
                      <th className="border px-3 py-2 text-left">Overtime Gross</th>
                      <th className="border px-3 py-2 text-left">Bonus Pay</th>
                      <th className="border px-3 py-2 text-left">Total Gross</th>
                      <th className="border px-3 py-2 text-left">Federal</th>
                      <th className="border px-3 py-2 text-left">SS</th>
                      <th className="border px-3 py-2 text-left">Medicare</th>
                      <th className="border px-3 py-2 text-left">Net pay</th>
                      <th className="border px-3 py-2 text-left">Tax</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payrollRows.map((emp) => (
                      <tr key={emp._id}>
                        <td className="border px-3 py-2">{emp.name}</td>
                        <td className="border px-3 py-2">{emp.department}</td>
                        <td className="border px-3 py-2">{emp.payType}</td>

                        <td className="border px-3 py-2">
                          {emp.payType === "hourly" ? (
                            <input
                              type="number"
                              value={inputsById[emp._id]?.totalHours ?? emp.hoursWorked ?? ""}
                              onChange={(e) =>
                                handleInputChange(emp._id, "totalHours", e.target.value)
                              }
                              className="border p-1 w-20"
                            />
                          ) : "—"}
                        </td>

                        <td className="border px-3 py-2">
                          {emp.payType === "hourly"
                            ? emp.payrollPreview?.regularHours ?? "-"
                            : "-"}
                        </td>

                        <td className="border px-3 py-2">
                          {emp.payType === "hourly"
                            ? emp.payrollPreview?.otHours ?? "-"
                            : "-"}
                        </td>

                        <td className="border px-3 py-2">
                          {emp.payType === "hourly" ? `$${emp.rate}` : "—"}
                        </td>

                        <td className="border px-3 py-2">
                          {emp.payType === "salary" ? (
                            <input
                              type="number"
                              value={inputsById[emp._id]?.salary ?? emp.salary ?? ""}
                              onChange={(e) =>
                                handleInputChange(emp._id, "salary", e.target.value)
                              }
                              className="border p-1 w-24"
                            />
                          ) : "—"}
                        </td>

                        <td className="border px-3 py-2">
                          {emp.payType === "salary" ? (
                            <select
                              value={inputsById[emp._id]?.payFrequency ?? emp.payFrequency ?? ""}
                              onChange={(e) =>
                                handleInputChange(emp._id, "payFrequency", e.target.value)
                              }
                            >
                              <option value="">Select</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Biweekly</option>
                            </select>
                          ) : "—"}
                        </td>

                        <td className="border px-3 py-2">
                          {emp.payrollPreview?.standardGrossPay
                            ? `$${emp.payrollPreview.standardGrossPay.toFixed(2)}`
                            : "-"}
                        </td>

                        <td className="border px-3 py-2">
                          {emp.payrollPreview?.overtimeGrossPay
                            ? `$${emp.payrollPreview.overtimeGrossPay.toFixed(2)}`
                            : "-"}
                        </td>

                        <td className="border px-3 py-2">
                          <input
                            type="number"
                            value={inputsById[emp._id]?.bonusPay ?? emp.bonusPay ?? ""}
                            onChange={(e) =>
                              handleInputChange(emp._id, "bonusPay", e.target.value)
                            }
                            className="border p-1 w-20"
                          />
                        </td>

                        <td className="border px-3 py-2">
                          {emp.payrollPreview?.totalGrossPay
                            ? `$${emp.payrollPreview.totalGrossPay.toFixed(2)}`
                            : "-"}
                        </td>

                        <td className="border px-3 py-2 text-slate-800">
                          {taxPayrollById[emp._id]?.tax && !taxPayrollById[emp._id].tax.error
                            ? `$${formatMoney(taxPayrollById[emp._id].tax.federalWithholding)}`
                            : "—"}
                        </td>
                        <td className="border px-3 py-2 text-slate-800">
                          {taxPayrollById[emp._id]?.tax && !taxPayrollById[emp._id].tax.error
                            ? `$${formatMoney(taxPayrollById[emp._id].tax.socialSecurity)}`
                            : "—"}
                        </td>
                        <td className="border px-3 py-2 text-slate-800">
                          {taxPayrollById[emp._id]?.tax && !taxPayrollById[emp._id].tax.error
                            ? `$${formatMoney(taxPayrollById[emp._id].tax.medicare)}`
                            : "—"}
                        </td>
                        <td className="border px-3 py-2 font-medium text-indigo-900">
                          {taxPayrollById[emp._id]?.tax && !taxPayrollById[emp._id].tax.error
                            ? `$${formatMoney(taxPayrollById[emp._id].tax.netPay)}`
                            : "—"}
                        </td>
                        <td className="border px-3 py-2">
                          <Link
                            to={`/employee/${emp._id}/tax`}
                            className="text-indigo-600 hover:underline"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleSaveInputs}
                    disabled={saving}
                    className="bg-indigo-600 text-white px-6 py-2 rounded"
                  >
                    {saving ? "Saving..." : "Save Inputs"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RunPayrollPage;