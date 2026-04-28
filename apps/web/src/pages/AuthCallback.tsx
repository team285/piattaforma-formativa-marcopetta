import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [debug, setDebug] = useState<string>("Inizio…");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const url = new URL(window.location.href);
        setDebug("URL letto");

        // Errori dal redirect (es. magic link scaduto)
        const errorParam = url.searchParams.get("error");
        const errorDesc = url.searchParams.get("error_description");
        if (errorParam) {
          setErrorMsg(errorDesc || errorParam);
          return;
        }

        // PKCE flow: code in query string
        const code = url.searchParams.get("code");
        if (code) {
          setDebug("Scambio code per session…");
          const { error: exchErr } = await supabase.auth.exchangeCodeForSession(
            code
          );
          if (exchErr) {
            setErrorMsg(`exchange: ${exchErr.message}`);
            return;
          }
          setDebug("Code scambiato");
        }

        // Implicit flow: hash con access_token (legacy ma supportato)
        // Il client gestisce l'hash automaticamente con detectSessionInUrl=true.
        // Aspettiamo un attimo per dargli tempo.
        await new Promise((r) => setTimeout(r, 300));

        setDebug("Controllo session…");
        const { data, error: sessErr } = await supabase.auth.getSession();
        if (sessErr) {
          setErrorMsg(`session: ${sessErr.message}`);
          return;
        }

        if (data.session) {
          setDebug("Session OK, redirect home");
          navigate("/", { replace: true });
        } else {
          setErrorMsg(
            "Nessuna sessione trovata. Il link potrebbe essere scaduto o già usato."
          );
        }
      } catch (e: any) {
        setErrorMsg(`Errore inatteso: ${e?.message || String(e)}`);
      }
    };

    handleCallback();
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
            <div className="text-smoke-2 text-sm">{debug}</div>
          </>
        )}
      </div>
    </div>
  );
}
