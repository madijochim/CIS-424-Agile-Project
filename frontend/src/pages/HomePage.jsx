import { Link } from "react-router-dom";
import { logoutUser } from "../services/authService";

const dashboardLinks = [
  {
    to: "/staff",
    title: "Staff",
    description: "Add employees, search and filter the roster, edit profiles, and open tax settings.",
    cta: "Open staff area",
    accent: "from-indigo-500 to-violet-600",
  },
  {
    to: "/run-payroll",
    title: "Run payroll",
    description: "Enter hours, salary, and bonus by employee with live gross and tax preview.",
    cta: "Run payroll",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    to: "/payroll",
    title: "Payroll results",
    description: "Review gross pay, withholdings, and net pay for the current saved inputs.",
    cta: "View results",
    accent: "from-amber-500 to-orange-600",
  },
  {
    to: "/register",
    title: "Register",
    description: "Create another administrator or manager account when onboarding a teammate.",
    cta: "Go to register",
    accent: "from-slate-500 to-slate-700",
  },
];

function HomePage({ user }) {
  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">
              Trojan Payroll Solutions
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 sm:text-base">
              Welcome back—use the shortcuts below to move between staff, payroll runs, and
              results.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 self-start rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 sm:self-center"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900">Your account</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200/60">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Signed in as</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{user.name}</p>
              <p className="mt-0.5 text-sm text-slate-600 break-all">{user.email}</p>
            </div>
            <div className="rounded-xl bg-indigo-50/80 p-4 ring-1 ring-indigo-100">
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">Role</p>
              <p className="mt-1 text-2xl font-bold text-indigo-950">{user.role}</p>
              <p className="mt-2 text-sm text-indigo-900/80">
                Permissions follow this role for staff, payroll, and tax pages.
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 sm:col-span-2 lg:col-span-1">
              <p className="text-sm font-medium text-slate-800">Tip</p>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                Set each employee&apos;s tax profile under <strong>Tax settings</strong> from the
                staff list so federal and FICA previews stay accurate.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Quick access</h2>
              <p className="text-sm text-slate-600">
                Jump to the tools you use most—this layout scales on wide screens.
              </p>
            </div>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {dashboardLinks.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div
                    className={`h-2 bg-gradient-to-r ${item.accent}`}
                    aria-hidden
                  />
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
                      {item.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                      {item.description}
                    </p>
                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-800">
                      {item.cta}
                      <span className="ml-1 transition group-hover:translate-x-0.5" aria-hidden>
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="mt-12 border-t border-slate-200 pt-6 text-center text-sm text-slate-500">
          <span className="font-medium text-slate-700">Trojan Payroll Solutions</span>
          <span className="mx-2 text-slate-300" aria-hidden>
            ·
          </span>
          <span>Internal payroll dashboard</span>
        </footer>
      </main>
    </div>
  );
}

export default HomePage;
