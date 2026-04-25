import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deactivateEmployee } from "../services/employeeService";

function StaffPage({ user }) {
  const [form, setForm] = useState({
    name: "",
    ssn: "",
    department: "",
    rate: "",
    payType: "hourly",
    salary: "",
    payFrequency: "",
  });

  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState("");
  /** Text in the search box (draft until user searches). */
  const [searchDraft, setSearchDraft] = useState("");
  /** Value sent to the API (updated by Search button or Enter). */
  const [searchApplied, setSearchApplied] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();

      if (searchApplied) {
        params.append("search", searchApplied);
      }

      if (departmentFilter) {
        params.append("department", departmentFilter);
      }

      if (statusFilter) {
        params.append("status", statusFilter);
      }

      const res = await fetch(`http://localhost:5000/api/employees?${params.toString()}`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || data.error || "Failed to fetch employees.");
        return;
      }

      setEmployees(data);
    } catch (err) {
      console.error("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchApplied, departmentFilter, statusFilter]);

  const runSearch = () => {
    setSearchApplied(searchDraft.trim());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "payType") {
      setForm({
        ...form,
        payType: value,
        rate: "",
        salary: "",
        payFrequency: "",
      });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.ssn || !form.department || !form.payType) {
      alert("All fields are required.");
      return;
    }

    if (form.payType === "hourly" && !form.rate) {
      alert("Hourly rate is required.");
      return;
    }

    if (form.payType === "salary" && (!form.salary || !form.payFrequency)) {
      alert("Salary and pay frequency are required.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch("http://localhost:5000/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          ssn: form.ssn,
          department: form.department,
          payType: form.payType,
          rate: form.payType === "hourly" ? Number(form.rate) : null,
          salary: form.payType === "salary" ? Number(form.salary) : null,
          payFrequency: form.payType === "salary" ? form.payFrequency : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || data.error || "Failed to add employee.");
        return;
      }

      alert("Employee added successfully!");

      setForm({
        name: "",
        ssn: "",
        department: "",
        rate: "",
        payType: "hourly",
        salary: "",
        payFrequency: "",
      });

      await fetchEmployees();
    } catch (err) {
      console.error(err);
      alert("Server error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (employeeId, employeeName) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${employeeName}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeactivatingId(employeeId);

      await deactivateEmployee(employeeId);

      alert("Employee deactivated successfully.");

      await fetchEmployees();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to deactivate employee.");
    } finally {
      setDeactivatingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
          ← Home
        </Link>

        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Trojan Payroll Solutions
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Staff</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Add employees below, then use search and filters to find people in the list.
        </p>

        <h2 className="mt-8 text-lg font-semibold text-slate-900">Add employee</h2>

        {user && (
          <p className="mt-2 text-sm text-slate-600">
            Signed in as <span className="font-semibold">{user.role}</span>
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <input
            name="name"
            value={form.name}
            placeholder="Name"
            onChange={handleChange}
            className="w-full border p-2"
          />
          <input
            name="ssn"
            value={form.ssn}
            placeholder="SSN"
            onChange={handleChange}
            className="w-full border p-2"
          />
          <input
            name="department"
            value={form.department}
            placeholder="Department"
            onChange={handleChange}
            className="w-full border p-2"
          />

          <select
            name="payType"
            value={form.payType}
            onChange={handleChange}
            className="w-full border p-2"
          >
            <option value="hourly">Hourly</option>
            <option value="salary">Salary</option>
          </select>

          {form.payType === "hourly" && (
            <input
              name="rate"
              value={form.rate}
              placeholder="Hourly Rate"
              onChange={handleChange}
              className="w-full border p-2"
            />
          )}

          {form.payType === "salary" && (
            <>
              <input
                name="salary"
                value={form.salary}
                placeholder="Annual Salary"
                onChange={handleChange}
                className="w-full border p-2"
              />

              <select
                name="payFrequency"
                value={form.payFrequency}
                onChange={handleChange}
                className="w-full border p-2"
              >
                <option value="">Select Frequency</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Biweekly</option>
              </select>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Employee"}
          </button>
        </form>

        <div className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-semibold text-slate-900">Employee list</h2>
          <p className="mt-1 text-sm text-slate-600">
            Type a name (or part of a name), then click <strong>Search</strong> or press Enter.
            Department and status apply as soon as you change them.
          </p>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-stretch">
              <input
                type="search"
                placeholder="Search by employee name…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    runSearch();
                  }
                }}
                className="min-h-[42px] min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={runSearch}
                className="min-h-[42px] shrink-0 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                Search
              </button>
            </div>

            <div className="flex flex-wrap gap-3 lg:ml-auto">
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="min-h-[42px] min-w-[160px] rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="">All departments</option>
                <option value="Operations">Operations</option>
                <option value="Disabled">Disabled</option>
                <option value="North Holland">North Holland</option>
                <option value="O'Hare">O'Hare</option>
                <option value="South Lake">South Lake</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="min-h-[42px] min-w-[140px] rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              >
                <option value="active">Active only</option>
                <option value="inactive">Inactive only</option>
                <option value="all">All statuses</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  setSearchDraft("");
                  setSearchApplied("");
                  setDepartmentFilter("");
                  setStatusFilter("active");
                }}
                className="min-h-[42px] rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
              >
                Clear all
              </button>
            </div>
          </div>

          {searchApplied ? (
            <p className="mt-2 text-xs text-slate-500">
              Showing results for name containing: <span className="font-medium text-slate-700">&quot;{searchApplied}&quot;</span>
            </p>
          ) : null}

          {employees.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No employees found.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {employees.map((emp) => (
                <li key={emp._id} className="rounded border p-3">
                  <div className="font-medium">{emp.name}</div>
                  <div className="text-sm text-slate-600">
                    SSN: {emp.ssn} | Dept: {emp.department} | Pay Type: {emp.payType} |{" "}
                    {emp.payType === "hourly" ? (
                      <>Rate: ${emp.rate}</>
                    ) : (
                      <>Salary: ${Number(emp.salary || 0).toLocaleString()} | Frequency: {emp.payFrequency || "N/A"}</>
                    )}{" "}
                    | Status: {emp.isActive ? "Active" : "Inactive"}
                  </div>

                  {emp.isActive && (
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeactivate(emp._id, emp.name)}
                        disabled={deactivatingId === emp._id}
                        className="rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {deactivatingId === emp._id ? "Deactivating..." : "Deactivate"}
                      </button>

                      <Link
                        to={`/edit-employee/${emp._id}`}
                        className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                      >
                        Edit Information
                      </Link>

                      <Link
                        to={`/employee/${emp._id}/tax`}
                        className="rounded bg-slate-700 px-3 py-2 text-sm text-white hover:bg-slate-800"
                      >
                        Tax settings
                      </Link>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default StaffPage;