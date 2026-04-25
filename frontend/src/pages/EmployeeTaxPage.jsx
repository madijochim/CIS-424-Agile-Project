import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

function formatMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(2);
}

function EmployeeTaxPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [emp, setEmp] = useState(null);
  const [payrollPreview, setPayrollPreview] = useState(null);
  const [tax, setTax] = useState({
    federalFilingStatus: "single",
    federalAdditionalWithholding: "",
    ytdSocialSecurityWages: "",
    ytdMedicareWages: "",
  });

  const fetchPayrollPreview = async (employeeDoc) => {
    if (!employeeDoc?._id) return;
    try {
      const res = await fetch("http://localhost:5000/api/payroll/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          lines: [
            {
              employeeId: employeeDoc._id,
              totalHours: employeeDoc.payType === "hourly" ? employeeDoc.hoursWorked : undefined,
              salary: employeeDoc.payType === "salary" ? employeeDoc.salary : undefined,
              payFrequency: employeeDoc.payFrequency || undefined,
              bonusPay: employeeDoc.bonusPay,
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayrollPreview(null);
        return;
      }
      const row = (data.employees || [])[0];
      setPayrollPreview(row?.payroll || null);
    } catch {
      setPayrollPreview(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to load employee.");
        }
        setEmp(data);
        setTax({
          federalFilingStatus: data.federalFilingStatus === "married" ? "married" : "single",
          federalAdditionalWithholding:
            data.federalAdditionalWithholding != null ? String(data.federalAdditionalWithholding) : "0",
          ytdSocialSecurityWages:
            data.ytdSocialSecurityWages != null ? String(data.ytdSocialSecurityWages) : "0",
          ytdMedicareWages: data.ytdMedicareWages != null ? String(data.ytdMedicareWages) : "0",
        });
        await fetchPayrollPreview(data);
      } catch (e) {
        setError(e.message || "Server error.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleTaxChange = (e) => {
    const { name, value } = e.target;
    setTax((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emp) return;

    const addWh = tax.federalAdditionalWithholding === "" ? 0 : Number(tax.federalAdditionalWithholding);
    const ytdSs = tax.ytdSocialSecurityWages === "" ? 0 : Number(tax.ytdSocialSecurityWages);
    const ytdMed = tax.ytdMedicareWages === "" ? 0 : Number(tax.ytdMedicareWages);

    if ([addWh, ytdSs, ytdMed].some((n) => Number.isNaN(n) || n < 0)) {
      alert("Tax amounts must be valid non-negative numbers.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: emp.name,
          ssn: emp.ssn,
          department: emp.department,
          payType: emp.payType,
          rate: emp.payType === "hourly" ? emp.rate : null,
          hoursWorked: emp.payType === "hourly" ? emp.hoursWorked ?? 0 : 0,
          bonusPay: emp.bonusPay ?? 0,
          salary: emp.payType === "salary" ? emp.salary : null,
          payFrequency: emp.payType === "salary" ? emp.payFrequency : null,
          jobTitle: emp.jobTitle ?? null,
          email: emp.email ?? null,
          phone: emp.phone ?? null,
          hireDate: emp.hireDate ? String(emp.hireDate).split("T")[0] : null,
          federalFilingStatus: tax.federalFilingStatus,
          federalAdditionalWithholding: addWh,
          ytdSocialSecurityWages: ytdSs,
          ytdMedicareWages: ytdMed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save tax settings.");
      }
      setEmp(data);
      await fetchPayrollPreview(data);
      alert("Tax settings saved.");
    } catch (err) {
      alert(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 shadow">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link to="/staff" className="text-indigo-600">
            ← Staff
          </Link>
          {emp && (
            <Link to={`/edit-employee/${id}`} className="text-indigo-600">
              Edit employee
            </Link>
          )}
        </div>

        <h1 className="mt-3 text-xl font-semibold text-slate-900">Tax withholding &amp; YTD</h1>
        <p className="mt-2 text-sm text-slate-600">
          Federal filing status and extra withholding feed into payroll runs. YTD Social Security wages
          are used to apply the SS wage base cap; Medicare uses gross each period (YTD stored for
          reporting consistency).
        </p>

        {loading && <p className="mt-6 text-slate-600">Loading…</p>}
        {error && <p className="mt-6 text-red-600">{error}</p>}

        {!loading && !error && emp && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="font-medium text-slate-900">{emp.name}</div>
              <div>Department: {emp.department}</div>
              <div>Pay type: {emp.payType}</div>
            </div>

            <div>
              <label className="font-medium text-slate-800">Federal filing status</label>
              <select
                name="federalFilingStatus"
                value={tax.federalFilingStatus}
                onChange={handleTaxChange}
                className="mt-1 w-full border border-slate-300 p-2"
              >
                <option value="single">Single</option>
                <option value="married">Married</option>
              </select>
            </div>

            <div>
              <label className="font-medium text-slate-800">Additional federal withholding ($ / period)</label>
              <input
                name="federalAdditionalWithholding"
                type="number"
                min="0"
                step="0.01"
                value={tax.federalAdditionalWithholding}
                onChange={handleTaxChange}
                className="mt-1 w-full border border-slate-300 p-2"
              />
            </div>

            <div>
              <label className="font-medium text-slate-800">YTD Social Security wages ($)</label>
              <input
                name="ytdSocialSecurityWages"
                type="number"
                min="0"
                step="0.01"
                value={tax.ytdSocialSecurityWages}
                onChange={handleTaxChange}
                className="mt-1 w-full border border-slate-300 p-2"
              />
              <p className="mt-1 text-xs text-slate-500">
                Used with the configured SS wage base so Social Security tax stops after the cap.
              </p>
            </div>

            <div>
              <label className="font-medium text-slate-800">YTD Medicare wages ($)</label>
              <input
                name="ytdMedicareWages"
                type="number"
                min="0"
                step="0.01"
                value={tax.ytdMedicareWages}
                onChange={handleTaxChange}
                className="mt-1 w-full border border-slate-300 p-2"
              />
            </div>

            <div className="rounded border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-900">
              <div className="font-medium">Current-period estimate (saved pay data)</div>
              {payrollPreview?.error ? (
                <p className="mt-1 text-red-700">{payrollPreview.error}</p>
              ) : payrollPreview?.tax?.error ? (
                <p className="mt-1 text-red-700">{payrollPreview.tax.error}</p>
              ) : payrollPreview?.tax ? (
                <ul className="mt-2 space-y-1 text-indigo-950">
                  <li>Gross (this period): ${formatMoney(payrollPreview.grossPay)}</li>
                  <li>Federal withholding: ${formatMoney(payrollPreview.tax.federalWithholding)}</li>
                  <li>Social Security: ${formatMoney(payrollPreview.tax.socialSecurity)}</li>
                  <li>Medicare: ${formatMoney(payrollPreview.tax.medicare)}</li>
                  <li className="font-semibold">Net pay: ${formatMoney(payrollPreview.tax.netPay)}</li>
                </ul>
              ) : (
                <p className="mt-1 text-slate-600">Could not load preview (check pay inputs and login).</p>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save tax settings"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default EmployeeTaxPage;
