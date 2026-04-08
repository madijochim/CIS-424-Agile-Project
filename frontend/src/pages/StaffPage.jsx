import { Link } from "react-router-dom";

function StaffPage({ user }) {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">
          <Link to="/" className="text-indigo-600 hover:underline">
            ← Home
          </Link>
        </p>
        <h1 className="mt-2 text-xl font-semibold text-slate-900">Staff area</h1>
        <p className="mt-2 text-slate-700">
          You have access as <span className="font-semibold">{user.role}</span>. Employee management APIs will connect
          here in upcoming stories.
        </p>
      </div>
    </div>
  );
}

export default StaffPage;
