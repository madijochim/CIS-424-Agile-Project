import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchMe } from "../../services/authService";

function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, user: null });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await fetchMe();
        if (!cancelled) setState({ loading: false, user: data.user });
      } catch {
        if (!cancelled) setState({ loading: false, user: null });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        Checking session…
      </div>
    );
  }

  if (!state.user) {
    return <Navigate to="/login" replace />;
  }

  return children({ user: state.user });
}

export default ProtectedRoute;
