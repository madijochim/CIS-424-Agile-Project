import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  const sendResetLink = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("A password reset link has been sent to your email.");
        setCountdown(60);
      } else {
        setMessage("");
        setError(data.error || "Something went wrong.");
      }
    } catch (error) {
      console.error("Forgot password fetch error:", error);
      setMessage("");
      setError("Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendResetLink();
  };

  const handleResend = async () => {
    if (countdown > 0 || isSubmitting) return;

    setIsSubmitting(true);

    setTimeout(async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage("A password reset link has been sent to your email.");
          setCountdown(60);
          setError("");
        } else {
          setMessage("");
          setError(data.error || "Something went wrong.");
        }
      } catch (error) {
        console.error("Forgot password fetch error:", error);
        setMessage("");
        setError("Request failed.");
      } finally {
        setIsSubmitting(false);
      }
    }, 700);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="mb-6 text-center text-xl font-semibold text-slate-900">
          Forgot Password
        </h2>

        {message ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-green-600">
              {message}
            </p>

            {countdown > 0 ? (
              <p className="text-sm text-slate-600">
                You can resend the link in {countdown}s
              </p>
            ) : (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isSubmitting}
                  className="rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? "Resending..." : "Resend Reset Link"}
                </button>
              </div>
            )}

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-700"
              >
                Back to Login
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <p className="mb-4 text-center text-sm text-red-600">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;