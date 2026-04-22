import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

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
                        Total Gross Pay: ${emp.payroll?.grossPay}
                      </div>
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
