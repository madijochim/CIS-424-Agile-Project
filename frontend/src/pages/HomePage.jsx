import { Link } from "react-router-dom";
import { logoutUser } from "../services/authService";

function HomePage({ user }) {
  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-semibold text-slate-900">Trojan Payroll</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <p className="text-slate-700">
          Signed in as <span className="font-medium">{user.name}</span> ({user.email})
        </p>
        <p className="text-slate-600">
          Role: <span className="font-semibold text-slate-900">{user.role}</span>
        </p>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 font-medium text-slate-900">Quick links</h2>

          <ul className="list-inside list-disc space-y-1 text-sm text-indigo-700">
            <li>
              <Link to="/register" className="hover:underline">
                Register another account
              </Link>
            </li>

            <li>
              <Link to="/staff" className="hover:underline">
                Staff area (Managers &amp; Admins only)
              </Link>
            </li>

            <li>
              <Link to="/run-payroll" className="hover:underline">
                Run Payroll
              </Link>
            </li>

            <li>
              <Link to="/payroll" className="hover:underline">
                View Payroll Results
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}

export default HomePage;