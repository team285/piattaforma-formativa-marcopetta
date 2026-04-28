import { useState, FormEvent } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false, // solo invite-only
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber mb-3">
          MPCoach · accesso riservato
        </div>
        <h1 className="font-editorial text-[54px] leading-[1.05] mb-6">
          Smetti di suonare a caso.
          <br />
          <span className="italic text-amber">Inizia a capire.</span>
        </h1>

        {status === "sent" ? (
          <div className="bg-ink-2 border border-line-dark rounded-[3px] p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber mb-2">
              Email inviata
            </div>
            <p className="text-paper">
              Controlla <strong>{email}</strong>: ti abbiamo mandato un link per
              entrare. Cliccalo entro 1 ora.
            </p>
            <p className="text-smoke-2 text-sm mt-3">
              Non hai ricevuto nulla? Controlla la cartella spam, oppure
              <button
                onClick={() => setStatus("idle")}
                className="text-amber hover:underline ml-1"
              >
                prova con un'altra email
              </button>
              .
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-smoke-2 text-sm mb-5">
              Solo studenti e coach con invito ricevuto da Marco possono entrare.
            </p>

            <div>
              <label
                htmlFor="email"
                className="block font-mono text-[10px] uppercase tracking-[0.22em] text-smoke-2 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@esempio.it"
                className="w-full bg-ink-2 border border-line-dark rounded-[2px] px-3 h-11 text-paper outline-none focus:border-amber transition"
              />
            </div>

            {errorMsg && (
              <div className="text-ember text-sm font-mono">{errorMsg}</div>
            )}

            <button
              type="submit"
              disabled={status === "sending" || !email.trim()}
              className="w-full h-11 bg-amber text-ink font-display tracking-wider text-[14px] uppercase rounded-[2px] hover:bg-amber-2 transition disabled:opacity-50"
              style={{ fontWeight: 700 }}
            >
              {status === "sending" ? "Invio in corso…" : "Inviami il link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
