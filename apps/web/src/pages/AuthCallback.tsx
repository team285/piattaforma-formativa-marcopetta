import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Errori dal redirect (es. magic link scaduto/già usato)
    const url = new URL(window.location.href);
    const errParam = url.searchParams.get("error");
    const errDesc = url.searchParams.get("error_description");
    if (errParam) {
      setErrorMsg(errDesc || errParam);
      return;
    }

    // type=recovery → flusso reset password (link da resetPasswordForEmail).
    // Quando il client processa la sessione, l'utente è "loggato" con un token
    // di recovery, ma deve impostare una nuova password prima di proseguire.
    // Cerchiamo il flag sia in query string che in hash (Supabase può usare
    // entrambi a seconda del flowType).
    const isRecovery =
      url.searchParams.get("type") === "recovery" ||
      window.location.hash.includes("type=recovery");

    // Subscribe a cambi auth: appena la session è pronta naviga.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" && session) {
        cancelled = true;
        sub.subscription.unsubscribe();
        navigate("/auth/reset-password", { replace: true });
        return;
      }
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        cancelled = true;
        sub.subscription.unsubscribe();
        navigate(isRecovery ? "/auth/reset-password" : "/", { replace: true });
      }
    });

    // Polling fallback: se il client aveva già processato la session prima
    // del mount (HMR/refresh), onAuthStateChange potrebbe non re-firare
    const checkExisting = async () => {
      // breve attesa per dare tempo al client di processare l'URL
      await new Promise((r) => setTimeout(r, 500));
      if (cancelled) return;

      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        cancelled = true;
        sub.subscription.unsubscribe();
        navigate(isRecovery ? "/auth/reset-password" : "/", { replace: true });
        return;
      }

      // Nessuna session ancora — diamo tempo al subscribe (timeout 4s totale)
      setTimeout(() => {
        if (!cancelled) {
          cancelled = true;
          sub.subscription.unsubscribe();
          setErrorMsg(
            "Nessuna sessione trovata. Il link potrebbe essere scaduto o già usato. Richiedi un nuovo magic link."
          );
        }
      }, 4000);
    };

    checkExisting();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        {errorMsg ? (
          <>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-3">
              Errore
            </div>
            <p className="text-paper mb-4 break-words">{errorMsg}</p>
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="text-amber hover:underline font-mono text-sm"
            >
              ← Torna al login
            </button>
          </>
        ) : (
          <>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber mb-3">
              Accesso in corso…
            </div>
            <div className="text-smoke-2 text-sm">
              Verifica del magic link, un attimo.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
