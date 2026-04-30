/**
 * ResetPassword — pagina destinazione del link "reset password" arrivato via email.
 *
 * Flusso completo:
 *  1. Utente clicca "Password dimenticata?" su /login → /forgot-password
 *  2. Inserisce email → resetPasswordForEmail con redirectTo=/auth/callback
 *  3. Riceve email con link contenente type=recovery + access_token
 *  4. Clicca link → /auth/callback?type=recovery&...
 *  5. AuthCallback rileva type=recovery → naviga a /auth/reset-password
 *  6. (qui) → form per impostare nuova password
 *  7. updateUser({ password }) → redirect home
 *
 * Quando questa pagina è raggiunta direttamente, l'utente è gia' loggato
 * con un token di recovery. Se nessuna sessione, mostriamo errore.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [pwd, setPwd] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setHasSession(!!data.session);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (pwd.length < 8) {
      setErrorMsg("La password deve avere almeno 8 caratteri.");
      return;
    }
    if (pwd !== pwdConfirm) {
      setErrorMsg("Le due password non coincidono.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSubmitting(false);
    if (error) {
      setErrorMsg(`Errore: ${error.message}`);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/", { replace: true }), 1500);
  };

  if (hasSession === false) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-5 md:px-10">
        <div className="max-w-md text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember mb-3">
            Sessione non valida
          </div>
          <h1 className="font-editorial text-[40px] md:text-[48px] mb-5 leading-tight">
            Il link è <span className="italic-ember">scaduto</span>.
          </h1>
          <p className="text-smoke-2 text-[14px] mb-7 leading-relaxed">
            Il link di reset password è scaduto o è già stato usato. I link di
            recupero sono validi per 1 ora.
          </p>
          <button
            onClick={() => navigate("/forgot-password", { replace: true })}
            className="h-11 px-6 rounded-[2px] bg-amber text-ink font-display tracking-wider text-[13px] uppercase hover:bg-amber-2 transition"
            style={{ fontWeight: 700 }}
          >
            Richiedi nuovo link
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-5 md:px-10">
        <div className="max-w-md text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber mb-3">
            Fatto
          </div>
          <h1 className="font-editorial text-[40px] md:text-[48px] mb-5 leading-tight">
            Password <span className="italic-ember">aggiornata</span>.
          </h1>
          <p className="text-smoke-2 text-[14px]">Ti reindirizzo alla home…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-5 md:px-10">
      <div className="max-w-md w-full">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber mb-3">
          Reset password · ultimo passo
        </div>
        <h1 className="font-editorial text-[40px] md:text-[56px] leading-[1.02] mb-5">
          Imposta la nuova <span className="italic-ember">password</span>.
        </h1>
        <p className="text-smoke-2 text-[14px] leading-relaxed mb-8">
          Minimo 8 caratteri. Sarà la tua password definitiva — la userai per
          accedere d'ora in poi.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label
              htmlFor="pwd"
              className="block font-mono text-[10px] uppercase tracking-[0.22em] text-smoke-2 mb-2"
            >
              Nuova password
            </label>
            <div className="relative">
              <input
                id="pwd"
                type={showPwd ? "text" : "password"}
                autoFocus
                autoComplete="new-password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="min 8 caratteri"
                className="w-full bg-ink-2 border border-line-dark rounded-[2px] pl-3 pr-20 h-11 text-paper outline-none focus:border-amber transition font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-smoke-2 hover:text-amber font-mono text-[10px] uppercase tracking-wider"
              >
                {showPwd ? "nascondi" : "mostra"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="pwdc"
              className="block font-mono text-[10px] uppercase tracking-[0.22em] text-smoke-2 mb-2"
            >
              Conferma password
            </label>
            <input
              id="pwdc"
              type={showPwd ? "text" : "password"}
              autoComplete="new-password"
              value={pwdConfirm}
              onChange={(e) => setPwdConfirm(e.target.value)}
              placeholder="ripeti la nuova password"
              className="w-full bg-ink-2 border border-line-dark rounded-[2px] px-3 h-11 text-paper outline-none focus:border-amber transition font-mono"
            />
          </div>

          {errorMsg && <div className="text-ember text-sm">{errorMsg}</div>}

          <button
            type="submit"
            disabled={submitting || !pwd || !pwdConfirm}
            className="w-full h-11 rounded-[2px] bg-amber text-ink font-display tracking-wider text-[14px] uppercase hover:bg-amber-2 transition disabled:opacity-50"
            style={{ fontWeight: 700 }}
          >
            {submitting ? "Aggiorno…" : "Imposta password"}
          </button>
        </form>
      </div>
    </div>
  );
}
