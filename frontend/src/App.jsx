import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import StaffPage from "./pages/StaffPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";


/** Route tree only — wrap with `BrowserRouter` (app) or `MemoryRouter` (tests). */
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {({ user }) => <HomePage user={user} />}
          </ProtectedRoute>
        }
      />
      <Route path="/staff" element={<StaffPage user={{ role: "Manager" }} />} />
      {/* <Route
        path="/staff"
        element={
          <ProtectedRoute>
            {({ user }) => (
              <RoleRoute user={user} allow={["Admin", "Manager"]}>
                <StaffPage user={user} />
              </RoleRoute>
            )}
          </ProtectedRoute>
        }
      /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
