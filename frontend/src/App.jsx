import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import StaffPage from "./pages/StaffPage";
import EditEmployeePage from "./pages/EditEmployeePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PayrollPage from "./pages/PayrollPage";
import RunPayrollPage from "./pages/RunPayrollPage";
import EmployeeTaxPage from "./pages/EmployeeTaxPage";

import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleRoute from "./components/auth/RoleRoute";

/** Route tree only — wrap with BrowserRouter */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Home */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            {({ user }) => <HomePage user={user} />}
          </ProtectedRoute>
        }
      />

      {/* Staff (bypassed auth for now for testing) */}
      <Route path="/staff" element={<StaffPage user={{ role: "Manager" }} />} />

      {/* Run Payroll (INPUT + CALCULATION) */}
      <Route
        path="/run-payroll"
        element={
          <ProtectedRoute>
            {({ user }) => (
              <RoleRoute user={user} allow={["Admin", "Manager"]}>
                <RunPayrollPage />
              </RoleRoute>
            )}
          </ProtectedRoute>
        }
      />

      {/* Payroll (RESULTS VIEW) */}
      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            {({ user }) => (
              <RoleRoute user={user} allow={["Admin", "Manager"]}>
                <PayrollPage />
              </RoleRoute>
            )}
          </ProtectedRoute>
        }
      />

      {/* Edit Employee */}
      <Route
        path="/edit-employee/:id"
        element={
          <ProtectedRoute>
            {({ user }) => (
              <RoleRoute user={user} allow={["Admin", "Manager"]}>
                <EditEmployeePage user={user} />
              </RoleRoute>
            )}
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee/:id/tax"
        element={
          <ProtectedRoute>
            {({ user }) => (
              <RoleRoute user={user} allow={["Admin", "Manager"]}>
                <EmployeeTaxPage />
              </RoleRoute>
            )}
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
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