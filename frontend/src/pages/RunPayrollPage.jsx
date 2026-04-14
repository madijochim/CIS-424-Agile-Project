import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function RunPayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [inputsById, setInputsById] = useState({});

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
          regularHours: emp.hoursWorked ?? "",
          salary: emp.salary ?? "",
          payFrequency: emp.payFrequency ?? "",
        };
      });

      setInputsById(initialInputs);
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
        const regularHours = Number(currentInputs.regularHours ?? emp.hoursWorked ?? 0);
        const rate = Number(emp.rate ?? 0);

        const grossPay =
          Number.isNaN(regularHours) || Number.isNaN(rate) || regularHours < 0 || rate < 0
            ? null
            : regularHours * rate;

        return {
          ...emp,
          payrollPreview: {
            payType: "hourly",
            regularHours: Number.isNaN(regularHours) ? "" : regularHours,
            hourlyRate: rate,
            grossPay,
          },
        };
      }

      if (emp.payType === "salary") {
        const salary = Number(currentInputs.salary ?? emp.salary ?? 0);
        const payFrequency = currentInputs.payFrequency ?? emp.payFrequency ?? "";

        let periods = 0;
        if (payFrequency === "weekly") periods = 52;
        if (payFrequency === "biweekly") periods = 26;

        const grossPay =
          Number.isNaN(salary) || salary < 0 || periods <= 0
            ? null
            : salary / periods;

        return {
          ...emp,
          payrollPreview: {
            payType: "salary",
            annualSalary: Number.isNaN(salary) ? "" : salary,
            payFrequency,
            periods,
            grossPay,
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
            currentInputs.regularHours === "" ? 0 : Number(currentInputs.regularHours);
          payload.salary = null;
          payload.payFrequency = null;
        }

        if (emp.payType === "salary") {
          payload.rate = null;
          payload.hoursWorked = 0;
          payload.salary =
            currentInputs.salary === "" ? null : Number(currentInputs.salary);
          payload.payFrequency = currentInputs.payFrequency || null;
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
            Enter payroll inputs by employee.
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
                      <th className="border px-3 py-2 text-left">Hours</th>
                      <th className="border px-3 py-2 text-left">Rate</th>
                      <th className="border px-3 py-2 text-left">Salary</th>
                      <th className="border px-3 py-2 text-left">Frequency</th>
                      <th className="border px-3 py-2 text-left">Gross</th>
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
                              value={inputsById[emp._id]?.regularHours ?? emp.hoursWorked ?? ""}
                              onChange={(e) =>
                                handleInputChange(emp._id, "regularHours", e.target.value)
                              }
                              className="border p-1 w-20"
                            />
                          ) : "—"}
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
                          {emp.payrollPreview?.grossPay
                            ? `$${emp.payrollPreview.grossPay.toFixed(2)}`
                            : "-"}
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