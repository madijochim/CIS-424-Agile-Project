import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function formatMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "—";
  return x.toFixed(2);
}

function PayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("http://localhost:5000/api/payroll/runs", {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to fetch payroll.");
      }

      setEmployees(data.employees || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl rounded-xl border bg-white p-6 shadow">
        <Link to="/" className="text-indigo-600">
          ← Home
        </Link>

        <h1 className="mt-2 text-xl font-semibold">Payroll Runs</h1>

        {loading && <p className="mt-4 text-slate-600">Loading payroll...</p>}
        {error && <p className="mt-4 text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="mt-6 space-y-3">
            {employees.length === 0 ? (
              <p className="text-slate-500">No active employees found.</p>
            ) : (
              employees.map((emp) => (
                <div key={emp._id} className="rounded border p-4">
                  <div className="font-medium">{emp.name}</div>
                  <div className="text-sm text-slate-600">
                    Department: {emp.department} | Pay Type: {emp.payType}
                  </div>

                  {emp.payroll?.error ? (
                    <p className="mt-2 text-sm text-red-600">
                      {emp.payroll.error}
                    </p>
                  ) : (
                    <div className="mt-2 text-sm text-slate-700">
                      {emp.payroll?.payType === "hourly" && (
                        <>
                          <div>Hours Worked: {emp.payroll.hoursWorked}</div>
                          <div>Overtime Hours: {emp.payroll.overtimeHours}</div>
                          <div>Hourly Rate: ${emp.payroll.hourlyRate}</div>
                          <div className="mt-1 font-semibold">
                            Gross Standard Pay: ${emp.payroll.normalPay}
                          </div>
                          <div className="mt-1 font-semibold">
                            Gross Overtime Pay: ${emp.payroll.overtimePay}
                          </div>

                        </>
                      )}

                      {emp.payroll?.payType === "salary" && (
                        <>
                          <div>Annual Salary: ${emp.payroll.annualSalary}</div>
                          <div>Pay Frequency: {emp.payroll.payFrequency}</div>
                          <div>Periods: {emp.payroll.periods}</div>
                        </>
                      )}

                      <div className="mt-1 font-semibold">
                        Bonus Pay: ${emp.payroll?.bonusPay}
                      </div>
                      <div className="mt-1 font-semibold">
                        Total Gross Pay: ${formatMoney(emp.payroll?.grossPay)}
                      </div>

                      {emp.payroll?.tax?.error ? (
                        <p className="mt-2 text-sm text-amber-800">{emp.payroll.tax.error}</p>
                      ) : emp.payroll?.tax ? (
                        <div className="mt-3 border-t border-slate-200 pt-2 text-sm">
                          <div className="font-medium text-slate-900">Taxes &amp; net (tax year {emp.payroll.tax.taxYear})</div>
                          <div className="mt-1 text-slate-700">
                            Filing: {emp.payroll.tax.filingStatus}
                            {emp.payroll.tax.periodsPerYear != null && (
                              <> · Periods/yr: {emp.payroll.tax.periodsPerYear}</>
                            )}
                          </div>
                          <div className="mt-1">Federal withholding: ${formatMoney(emp.payroll.tax.federalWithholding)}</div>
                          <div>Social Security: ${formatMoney(emp.payroll.tax.socialSecurity)}</div>
                          <div>Medicare: ${formatMoney(emp.payroll.tax.medicare)}</div>
                          <div className="font-semibold text-slate-900">
                            Total deductions: ${formatMoney(emp.payroll.tax.totalDeductions)}
                          </div>
                          <div className="font-semibold text-indigo-800">
                            Net pay: ${formatMoney(emp.payroll.tax.netPay)}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PayrollPage;
