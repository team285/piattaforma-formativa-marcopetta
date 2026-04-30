import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { NotificationsProvider } from "./lib/notifications";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Home from "./pages/Home";
import Preview from "./pages/Preview";
import Student from "./pages/Student";
import NotFound from "./pages/NotFound";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
        <div className="text-smoke-2 font-mono text-sm">Caricamento…</div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * RoleGate — sceglie l'home a seconda del ruolo:
 *  - coach / founder → vista nativa TSX (Preview / sidebar)
 *  - student         → iframe del prototipo (finche' non portiamo le student views)
 *
 * Dev users (Luca) possono forzare l'iframe via /iframe per testare.
 */
function RoleGate() {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
        <div className="text-smoke-2 font-mono text-sm">Caricamento…</div>
      </div>
    );
  }

  if (!profile) {
    // Profile not yet loaded → show iframe Home (gestisce timeout/retry interno)
    return <Home />;
  }

  if (profile.role === "coach" || profile.role === "founder") {
    return <Navigate to="/coach/dashboard" replace />;
  }

  // student → vista nativa TSX
  return <Navigate to="/student/home" replace />;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
        <div className="text-smoke-2 font-mono text-sm">Caricamento…</div>
      </div>
    );
  }

  if (session) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectIfAuth>
                <Login />
              </RedirectIfAuth>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RedirectIfAuth>
                <ForgotPassword />
              </RedirectIfAuth>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route
            path="/coach/*"
            element={
              <RequireAuth>
                <Preview />
              </RequireAuth>
            }
          />
          <Route
            path="/student/*"
            element={
              <RequireAuth>
                <Student />
              </RequireAuth>
            }
          />
          <Route
            path="/preview/*"
            element={
              <RequireAuth>
                <Preview />
              </RequireAuth>
            }
          />
          <Route
            path="/iframe"
            element={
              <RequireAuth>
                <Home />
              </RequireAuth>
            }
          />
          <Route
            path="/"
            element={
              <RequireAuth>
                <RoleGate />
              </RequireAuth>
            }
          />
          <Route
            path="*"
            element={
              <RequireAuth>
                <NotFound />
              </RequireAuth>
            }
          />
        </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
