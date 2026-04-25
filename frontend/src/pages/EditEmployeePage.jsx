import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";

function EditEmployeePage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    ssn: "",
    department: "",
    payType: "",
    rate: "",
    salary: "",
    payFrequency: "",
    jobTitle: "",
    email: "",
    phone: "",
    hireDate: "",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok) {
          console.error(data.message || "Failed to fetch employee");
          return;
        }

        setForm({
          name: data.name || "",
          ssn: data.ssn || "",
          department: data.department || "",
          payType: data.payType || "",
          rate: data.rate ?? "",
          salary: data.salary ?? "",
          payFrequency: data.payFrequency || "",
          jobTitle: data.jobTitle || "",
          email: data.email || "",
          phone: data.phone || "",
          hireDate: data.hireDate ? data.hireDate.split("T")[0] : "",
        });
      } catch (err) {
        console.error("Error fetching employee:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

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

    setForm({
      ...form,
      [name]: value,
    });
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Name is required";
    } else if (!/^[A-Za-z]+([A-Za-z\s'-]*[A-Za-z]+)?$/.test(form.name.trim())) {
      nextErrors.name =
        "Name must contain only letters, spaces, hyphens, or apostrophes, and start/end with a letter";
    }

    if (!form.department.trim()) {
      nextErrors.department = "Department is required";
    }

    if (!form.payType) {
      nextErrors.payType = "Pay type is required";
    } else if (!["hourly", "salary"].includes(form.payType)) {
      nextErrors.payType = "Pay type must be either hourly or salary";
    }

    if (form.payType === "hourly") {
      const rateValue = Number(form.rate);

      if (form.rate === "" || form.rate === null || form.rate === undefined) {
        nextErrors.rate = "Hourly rate is required";
      } else if (isNaN(rateValue)) {
        nextErrors.rate = "Hourly rate must be a number";
      } else if (rateValue < 0) {
        nextErrors.rate = "Hourly rate cannot be negative";
      } else if (!/^\d+(\.\d{1,2})?$/.test(String(form.rate))) {
        nextErrors.rate = "Hourly rate can only have up to 2 decimal places";
      }
    }

    if (form.payType === "salary") {
      const salaryValue = Number(form.salary);

      if (form.salary === "" || form.salary === null || form.salary === undefined) {
        nextErrors.salary = "Salary is required";
      } else if (isNaN(salaryValue)) {
        nextErrors.salary = "Salary must be a number";
      } else if (salaryValue < 0) {
        nextErrors.salary = "Salary cannot be negative";
      } else if (!/^\d+(\.\d{1,2})?$/.test(String(form.salary))) {
        nextErrors.salary = "Salary can only have up to 2 decimal places";
      }

      if (!form.payFrequency) {
        nextErrors.payFrequency = "Pay frequency is required";
      } else if (!["weekly", "biweekly"].includes(form.payFrequency)) {
        nextErrors.payFrequency = "Pay frequency must be weekly or biweekly";
      }
    }

    if (!form.hireDate) {
      nextErrors.hireDate = "Hire date is required";
    } else {
      const selectedDate = new Date(form.hireDate);
      const today = new Date();

      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (isNaN(selectedDate.getTime())) {
        nextErrors.hireDate = "Invalid date format";
      } else if (selectedDate > today) {
        nextErrors.hireDate = "Hire date cannot be in the future";
      } else if (selectedDate < new Date("1900-01-01")) {
        nextErrors.hireDate = "Hire date is too far in the past";
      }
    }

    if (form.phone && form.phone.trim() !== "") {
      const phoneValue = form.phone.trim();

      if (!/^\+?[0-9\s()-]{7,20}$/.test(phoneValue)) {
        nextErrors.phone = "Invalid phone number format";
      }
    }

    if (form.email && form.email.trim() !== "") {
      const emailValue = form.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(emailValue)) {
        nextErrors.email = "Invalid email address";
      }
    }

    if (form.jobTitle && form.jobTitle.trim() !== "") {
      const title = form.jobTitle.trim();

      if (!/^[A-Za-z0-9\s&',.-]+$/.test(title)) {
        nextErrors.jobTitle = "Job title contains invalid characters";
      }
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: "PUT",
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
          hireDate: form.hireDate || null,
          jobTitle: form.jobTitle || null,
          email: form.email || null,
          phone: form.phone || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error(data.message || "Failed to update employee");
        alert(data.message || "Failed to update employee");
        return;
      }

      alert("Employee updated successfully");
    } catch (err) {
      console.error("Error updating employee:", err);
      alert("Something went wrong");
    }
  };

  if (!form.name && !loading) {
    return <p className="p-6">Employee not found.</p>;
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 shadow">
        <Link to="/staff" className="text-indigo-600">
          ← Staff Area
        </Link>

        <h1 className="mt-2 text-xl font-semibold">Edit Employee</h1>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${errors.name ? "border-red-500" : ""}`}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="font-medium">SSN</label>
            <input
              name="ssn"
              value={form.ssn}
              disabled
              className="mt-1 w-full cursor-not-allowed border bg-slate-100 p-2"
            />
          </div>

          <div>
            <label className="font-medium">Job Title</label>
            <input
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${errors.jobTitle ? "border-red-500" : ""}`}
            />
            {errors.jobTitle && <p className="text-sm text-red-500">{errors.jobTitle}</p>}
          </div>

          <div>
            <label className="font-medium">Department</label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${errors.department ? "border-red-500" : ""}`}
            />
            {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${errors.email ? "border-red-500" : ""}`}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${errors.phone ? "border-red-500" : ""}`}
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="font-medium">Hire Date</label>
            <input
              name="hireDate"
              type="date"
              value={form.hireDate}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${errors.hireDate ? "border-red-500" : ""}`}
            />
            {errors.hireDate && <p className="text-sm text-red-500">{errors.hireDate}</p>}
          </div>

          <div>
            <label className="font-medium">Pay Type</label>
            <select
              name="payType"
              value={form.payType}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${errors.payType ? "border-red-500" : ""}`}
            >
              <option value="">Select pay type</option>
              <option value="hourly">Hourly</option>
              <option value="salary">Salary</option>
            </select>
            {errors.payType && <p className="text-sm text-red-500">{errors.payType}</p>}
          </div>

          {form.payType === "hourly" && (
            <div>
              <label className="font-medium">Hourly Rate</label>
              <div className={`mt-1 w-full border p-2 ${errors.rate ? "border-red-500" : ""}`}>
                <span className="text-slate-500">$</span>
                <input
                  name="rate"
                  type="number"
                  value={form.rate}
                  onChange={handleChange}
                  className="ml-2 w-[90%] outline-none"
                />
              </div>
              {errors.rate && <p className="text-sm text-red-500">{errors.rate}</p>}
            </div>
          )}

          {form.payType === "salary" && (
            <>
              <div>
                <label className="font-medium">Annual Salary</label>
                <div className={`mt-1 w-full border p-2 ${errors.salary ? "border-red-500" : ""}`}>
                  <span className="text-slate-500">$</span>
                  <input
                    name="salary"
                    type="number"
                    value={form.salary}
                    onChange={handleChange}
                    className="ml-2 w-[90%] outline-none"
                  />
                </div>
                {errors.salary && <p className="text-sm text-red-500">{errors.salary}</p>}
              </div>

              <div>
                <label className="font-medium">Pay Frequency</label>
                <select
                  name="payFrequency"
                  value={form.payFrequency}
                  onChange={handleChange}
                  className={`mt-1 w-full border p-2 ${errors.payFrequency ? "border-red-500" : ""}`}
                >
                  <option value="">Select frequency</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                </select>
                {errors.payFrequency && (
                  <p className="text-sm text-red-500">{errors.payFrequency}</p>
                )}
              </div>
            </>
          )}

          <div className="rounded border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <span className="font-medium text-slate-900">Tax withholding &amp; YTD wages</span>
            <p className="mt-1 text-slate-600">
              Filing status, extra federal withholding, and YTD wages for FICA caps are on a separate
              page so this form stays focused on core employment data.
            </p>
            <Link
              to={`/employee/${id}/tax`}
              className="mt-2 inline-block font-medium text-indigo-600 hover:underline"
            >
              Open tax settings →
            </Link>
          </div>

          <button
            type="submit"
            className="w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditEmployeePage;