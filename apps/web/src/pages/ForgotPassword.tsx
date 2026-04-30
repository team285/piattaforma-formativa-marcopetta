/**
 * ForgotPassword — pagina pubblica per richiedere il reset password via email.
 *
 * Usa supabase.auth.resetPasswordForEmail. Senza SMTP configurato il flusso
 * non spedirà l'email, ma la pagina mostrerà comunque il messaggio di
 * conferma per non rivelare quali email sono registrate (anti-enumeration).
 *
 * Quando Resend SMTP sarà attivo, l'utente riceverà l'email con il link che
 * porta a /auth/callback → AuthCallback completa il flow e l'utente potrà
 * cambiare password da /student/account o /coach/impostazioni.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      setError("Inserisci una email valida");
      return;
    }
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });
    setLoading(false);
    // Mostriamo sempre conferma per evitare email enumeration
    if (err && err.message.toLowerCase().includes("rate")) {
      setError("Troppe richieste. Riprova tra qualche minuto.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-5 md:px-10">
        <div className="max-w-md text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-3">
            Email inviata
          </div>
          <h1 className="font-editorial text-[40px] md:text-[56px] leading-[1.02] mb-5">
            Controlla la tua <span className="italic-ember">posta</span>.
          </h1>
          <p className="text-[#C9C9D0] text-[14px] leading-relaxed mb-7">
            Se l'email è registrata, riceverai a breve un link per reimpostare la password. Controlla
            anche la cartella spam.
          </p>
          <p className="text-[#8A8A92] text-[12px] mb-8 leading-relaxed">
            Se non arriva nulla entro qualche minuto, contatta Marco direttamente — il sistema email
            (SMTP) potrebbe ancora non essere attivo. In quel caso Marco può resettarti la password
            manualmente dalle sue impostazioni.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-[2px] border border-line-dark text-[13px] font-mono uppercase tracking-wider text-[#C9BDB1] hover:text-paper hover:border-[#4A3A32] transition"
          >
            Torna al login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-5 md:px-10">
      <div className="max-w-md w-full">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-3">
          Reset password
        </div>
        <h1 className="font-editorial text-[40px] md:text-[56px] leading-[1.02] mb-5">
          Hai dimenticato la <span className="italic-ember">password</span>?
        </h1>
        <p className="text-[#C9C9D0] text-[14px] leading-relaxed mb-8">
          Inserisci la tua email e ti invieremo un link per reimpostarla.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-[#8A8A92]">
              Email
            </div>
            <input
              type="email"
              autoFocus
              autoComplete="username email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@esempio.com"
              className="w-full h-11 px-3 bg-ink-2 border border-line-dark rounded-[2px] text-[14px] font-mono text-paper focus:outline-none focus:border-[var(--amber)]"
            />
          </div>

          {error && (
            <div className="text-[12px] text-[var(--ember)] font-mono">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-[2px] bg-[var(--amber)] text-ink text-[13px] font-display uppercase tracking-wider hover:bg-[var(--amber-2)] transition disabled:opacity-50"
            style={{ fontWeight: 700 }}
          >
            {loading ? "Invio…" : "Invia link di reset"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="text-[12px] font-mono uppercase tracking-wider text-[#8A8A92] hover:text-paper transition"
          >
            ← Torna al login
          </Link>
        </div>
      </div>
    </div>
  );
}
