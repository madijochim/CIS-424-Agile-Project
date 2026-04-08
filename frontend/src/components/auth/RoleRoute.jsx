import { Navigate } from "react-router-dom";

function RoleRoute({ user, allow, children }) {
  if (!allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default RoleRoute;
