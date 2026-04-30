import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth";
import { NotificationsProvider } from "./lib/notifications";

/**
 * ScrollToTop — al cambio di pathname, riporta lo scroll a 0.
 * React Router non lo fa di default e l'utente arriva su una pagina nuova
 * con lo scroll della precedente, sembra un bug.
 *
 * Eccezione: se l'URL ha un hash (#anchor) il browser lo gestisce nativamente.
 */
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);
  return null;
}
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
 * RequireRole — auth + check ruolo. Redirect alla home appropriata se l'utente
 * non ha il ruolo richiesto. Evita che uno studente acceda a /coach/* via URL
 * diretto vedendo l'UI coach (anche se RLS blocca i dati, l'UI vuota è
 * confondente).
 */
function RequireRole({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles: Array<"student" | "coach" | "founder">;
}) {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
        <div className="text-smoke-2 font-mono text-sm">Caricamento…</div>
      </div>
    );
  }
  if (!session) return <Navigate to="/login" replace />;
  // Profile non ancora caricato — il fallback Home gestisce con timeout
  if (!profile) return <Navigate to="/" replace />;
  if (!roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

/**
 * RoleGate — sceglie l'home a seconda del ruolo:
 *  - coach / founder → vista nativa TSX (Preview / sidebar)
 *  - student         → iframe del prototipo (finché non portiamo le student views)
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
        <ScrollToTop />
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
              <RequireRole roles={["coach", "founder"]}>
                <Preview />
              </RequireRole>
            }
          />
          <Route
            path="/student/*"
            element={
              <RequireRole roles={["student"]}>
                <Student />
              </RequireRole>
            }
          />
          <Route
            path="/preview/*"
            element={
              <RequireRole roles={["coach", "founder"]}>
                <Preview />
              </RequireRole>
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
