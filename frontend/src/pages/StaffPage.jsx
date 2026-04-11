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
  });

  const [employees, setEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fetchEmployees = async () => {
  try {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.append("search", debouncedSearch);
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
}, [debouncedSearch, departmentFilter, statusFilter]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 400);

  return () => clearTimeout(timer);
 }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.ssn || !form.department || !form.rate || !form.payType) {
      alert("All fields are required.");
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
          ...form,
          rate: Number(form.rate),
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
      <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 shadow">
        <Link to="/" className="text-indigo-600">
          ← Home
        </Link>

        <h1 className="mt-2 text-xl font-semibold">Add Employee</h1>

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
          <input
            name="rate"
            value={form.rate}
            placeholder="Rate"
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

          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Add Employee"}
          </button>
        </form>

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Employee List</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
  <input
    type="text"
    placeholder="Search by name"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="rounded border p-2"
  />

  <select
    value={departmentFilter}
    onChange={(e) => setDepartmentFilter(e.target.value)}
    className="rounded border p-2"
  >
    <option value="">All Departments</option>
    <option value="Operations">Operations</option>
    <option value="Disabled">Disabled</option>
    <option value="North Holland">North Holland</option>
    <option value="O'Hare">O'Hare</option>
  </select>

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded border p-2"
  >
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
    <option value="all">All Statuses</option>
  </select>

  <button
    type="button"
    onClick={() => {
      setSearch("");
      setDepartmentFilter("");
      setStatusFilter("active");
    }}
    className="rounded bg-slate-200 px-4 py-2 text-sm text-slate-800 hover:bg-slate-300"
  >
    Clear Filters
  </button>
</div>

          {employees.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No employees found.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {employees.map((emp) => (
                <li key={emp._id} className="rounded border p-3">
                  <div className="font-medium">{emp.name}</div>
                  <div className="text-sm text-slate-600">
                    SSN: {emp.ssn} | Dept: {emp.department} | Pay Type: {emp.payType} | Rate: ${emp.rate}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeactivate(emp._id, emp.name)}
                    disabled={deactivatingId === emp._id}
                    className="mt-3 rounded bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deactivatingId === emp._id ? "Deactivating..." : "Deactivate"}
                  </button>
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