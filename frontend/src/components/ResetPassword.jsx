import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Password updated successfully. Redirecting to login...");

        setTimeout(() => {
          navigate("/login");
        }, 5000);
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Reset password fetch error:", error);
      setError("Request failed.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-center text-xl font-semibold text-slate-900">
          Reset Password
        </h2>

        {message && (
          <div className="mb-4 text-center">
            <p className="mb-2 text-sm text-green-600">
              {message}
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
            >
              Go to Login Now
            </button>
          </div>
        )}

        {error && (
          <p className="mb-4 text-center text-sm text-red-600">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;