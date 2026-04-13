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
    jobTitle: "",
    email: "",
    phone: "",
    hireDate: "",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/employees/${id}`,
          { credentials: "include" }
        );

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
          jobTitle: data.jobTitle || "",
          email: data.email || "",
          phone: data.phone || "",
          hireDate: data.hireDate
            ? data.hireDate.split("T")[0] // format for date input
            : "",
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
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };
  
  const validateForm = () => {
    const errors = {};

    // Name (letters, spaces, hyphens, apostrophes allowed — must start/end with a letter)
    if (!form.name.trim()) {
        errors.name = "Name is required";
    } else if (!/^[A-Za-z]+([A-Za-z\s'-]*[A-Za-z]+)?$/.test(form.name.trim())) {
        errors.name =
        "Name must contain only letters, spaces, hyphens, or apostrophes, and start/end with a letter";
    }

    // Department
    if (!form.department.trim()) {
        errors.department = "Department is required";
    }

    // Pay Type
    if (!form.payType) {
        errors.payType = "Pay type is required";
    } else if (!["hourly", "salary"].includes(form.payType)) {
        errors.payType = "Pay type must be either hourly or salary";
    }

    // Rate
    const rateValue = Number(form.rate);

    if (form.rate === "" || form.rate === null || form.rate === undefined) {
        errors.rate = "Rate is required";
    } else if (isNaN(rateValue)) {
        errors.rate = "Rate must be a number";
    } else if (rateValue < 0) {
        errors.rate = "Rate cannot be negative";
    } else if (!/^\d+(\.\d{1,2})?$/.test(form.rate)) {
        errors.rate = "Rate can only have up to 2 decimal places";
    }

    // Hire Date
    if (!form.hireDate) {
        errors.hireDate = "Hire date is required";
    } else {
        const selectedDate = new Date(form.hireDate);
        const today = new Date();

        // Normalize to remove time portion
        selectedDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (isNaN(selectedDate.getTime())) {
            errors.hireDate = "Invalid date format";
        } else if (selectedDate > today) {
            errors.hireDate = "Hire date cannot be in the future";
        } else if (selectedDate < new Date("1900-01-01")) {
            errors.hireDate = "Hire date is too far in the past";
        }
    }

    // Phone (optional, but must be valid if provided)
    if (form.phone && form.phone.trim() !== "") {
        const phoneValue = form.phone.trim();

        // Allows formats like:
        // 1234567890
        // (123) 456-7890
        // 123-456-7890
        // +1 123-456-7890
        if (!/^\+?[0-9\s()-]{7,20}$/.test(phoneValue)) {
            errors.phone = "Invalid phone number format";
        }
    }

    // Email (optional, but must be valid if provided)
    if (form.email && form.email.trim() !== "") {
        const emailValue = form.email.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(emailValue)) {
            errors.email = "Invalid email address";
        }
    }

    // Job Title (optional, but must be valid if provided)
    if (form.jobTitle && form.jobTitle.trim() !== "") {
        const title = form.jobTitle.trim();

        // Allows letters, spaces, hyphens, apostrophes, ampersands
        if (!/^[A-Za-z0-9\s&',.-]+$/.test(title)) {
            errors.jobTitle = "Job title contains invalid characters";
        }
    }

    return errors;
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
        const res = await fetch(
        `http://localhost:5000/api/employees/${id}`,
        {
            method: "PUT",
            headers: {
            "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
            ...form,
            rate: Number(form.rate),
            hireDate: form.hireDate || null,
            jobTitle: form.jobTitle || null,
            email: form.email || null,
            phone: form.phone || null,
            }),
        }
        );

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


  if (!form.name && !loading)
    return <p className="p-6">Employee not found.</p>;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-xl border bg-white p-6 shadow">
        <Link to="/staff" className="text-indigo-600">
          ← Staff Area
        </Link>

        <h1 className="mt-2 text-xl font-semibold">Edit Employee</h1>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Name */}
          <div>
            <label className="font-medium">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${
                errors.name ? "border-red-500" : ""
              }`}
            />
            {errors.name && (
             <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* SSN */}
          <div>
            <label className="font-medium">SSN</label>
            <input
              name="ssn"
              value={form.ssn}
              disabled
              className="mt-1 w-full border p-2 bg-slate-100 cursor-not-allowed"
            />
            {errors.ssn && (
             <p className="text-red-500 text-sm">{errors.ssn}</p>
            )}
          </div>

          {/* Job Title */}
          <div>
            <label className="font-medium">Job Title</label>
            <input
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${
                errors.jobTitle ? "border-red-500" : ""
              }`}
            />
            {errors.jobTitle && (
             <p className="text-red-500 text-sm">{errors.jobTitle}</p>
            )}
          </div>

          {/* Department */}
          <div>
            <label className="font-medium">Department</label>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${
                errors.department ? "border-red-500" : ""
              }`}
            />
            {errors.department && (
             <p className="text-red-500 text-sm">{errors.department}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="font-medium">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${
                errors.email ? "border-red-500" : ""
              }`}
            />
            {errors.email && (
             <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="font-medium">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${
                errors.phone ? "border-red-500" : ""
              }`}
            />
            {errors.phone && (
             <p className="text-red-500 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Hire Date */}
          <div>
            <label className="font-medium">Hire Date</label>
            <input
              name="hireDate"
              type="date"
              value={form.hireDate}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${
                errors.hireDate ? "border-red-500" : ""
              }`}
            />
            {errors.hireDate && (
             <p className="text-red-500 text-sm">{errors.hireDate}</p>
            )}
          </div>

          {/* Pay Type */}
          <div>
            <label className="font-medium">Pay Type</label>
            <select
              name="payType"
              value={form.payType}
              onChange={handleChange}
              className={`mt-1 w-full border p-2 ${
                errors.payType ? "border-red-500" : ""
              }`}
            >
            <option value="">Select pay type</option>
            <option value="hourly">Hourly</option>
            <option value="salary">Salary</option>
            </select>
            {errors.payType && (
             <p className="text-red-500 text-sm">{errors.payType}</p>
            )}
          </div>

          {/* Rate */}
          <div>
            <label className="font-medium">Rate</label>
            <div className={`mt-1 w-full border p-2 ${
                errors.rate ? "border-red-500" : ""}`}>
              <span className="text-slate-500">$</span>
              <input
                name="rate"
                type="number"
                value={form.rate}
                onChange={handleChange}
              />
            {errors.rate && (
             <p className="text-red-500 text-sm">{errors.rate}</p>
            )}
            </div>
          </div>
          <button type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditEmployeePage;
