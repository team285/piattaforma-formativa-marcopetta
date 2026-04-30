import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

type Mode = "password" | "magiclink";

export default function Login() {
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setStatus("error");
      // Messaggi più amichevoli (Supabase di default dice "Invalid login credentials")
      if (error.message.toLowerCase().includes("invalid")) {
        setErrorMsg("Email o password non corretti.");
      } else if (error.message.toLowerCase().includes("not confirmed")) {
        setErrorMsg(
          "Account non ancora confermato. Controlla la mail di benvenuto o usa il magic link."
        );
      } else {
        setErrorMsg(error.message);
      }
    } else {
      // Il listener onAuthStateChange in AuthProvider farà il redirect
      setStatus("idle");
    }
  };

  const handleMagicLink = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: false,
      },
    });

    if (error) {
      setStatus("error");
      if (error.message.toLowerCase().includes("rate limit")) {
        setErrorMsg(
          "Troppe email inviate negli ultimi minuti. Riprova fra 30-60 minuti, o usa la password."
        );
      } else {
        setErrorMsg(error.message);
      }
    } else {
      setStatus("sent");
    }
  };

  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber mb-3">
          MPCoach · accesso riservato
        </div>
        <h1 className="font-editorial text-[44px] sm:text-[54px] leading-[1.05] mb-6">
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
              Non arriva nulla? Controlla spam, oppure
              <button
                onClick={() => {
                  setStatus("idle");
                  setMode("password");
                }}
                className="text-amber hover:underline ml-1"
              >
                accedi con password
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="text-smoke-2 text-sm mb-5">
              Solo gli account registrati da Marco possono accedere.
            </p>

            {mode === "password" ? (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                    autoComplete="username"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@esempio.it"
                    className="w-full bg-ink-2 border border-line-dark rounded-[2px] px-3 h-11 text-paper outline-none focus:border-amber transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block font-mono text-[10px] uppercase tracking-[0.22em] text-smoke-2 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-ink-2 border border-line-dark rounded-[2px] pl-3 pr-12 h-11 text-paper outline-none focus:border-amber transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-smoke-2 hover:text-amber font-mono text-[10px] uppercase tracking-wider"
                    >
                      {showPassword ? "nascondi" : "mostra"}
                    </button>
                  </div>
                </div>

                {errorMsg && (
                  <div className="text-ember text-sm">{errorMsg}</div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending" || !email.trim() || !password}
                  className="w-full h-11 bg-amber text-ink font-display tracking-wider text-[14px] uppercase rounded-[2px] hover:bg-amber-2 transition disabled:opacity-50"
                  style={{ fontWeight: 700 }}
                >
                  {status === "sending" ? "Accesso in corso…" : "Accedi"}
                </button>

                <div className="pt-3 border-t border-line-dark text-center space-y-2">
                  <Link
                    to="/forgot-password"
                    className="block text-smoke-2 hover:text-amber font-mono text-xs uppercase tracking-wider"
                  >
                    Password dimenticata? Reset via email
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("magiclink");
                      setErrorMsg("");
                      setStatus("idle");
                    }}
                    className="text-smoke-2 hover:text-amber font-mono text-xs uppercase tracking-wider"
                  >
                    Oppure entra con magic link
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label
                    htmlFor="email-magic"
                    className="block font-mono text-[10px] uppercase tracking-[0.22em] text-smoke-2 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email-magic"
                    type="email"
                    autoComplete="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nome@esempio.it"
                    className="w-full bg-ink-2 border border-line-dark rounded-[2px] px-3 h-11 text-paper outline-none focus:border-amber transition"
                  />
                </div>

                <p className="text-smoke-2 text-xs">
                  Ti manderemo un link cliccabile via email per entrare senza
                  password.
                </p>

                {errorMsg && (
                  <div className="text-ember text-sm">{errorMsg}</div>
                )}

                <button
                  type="submit"
                  disabled={status === "sending" || !email.trim()}
                  className="w-full h-11 bg-amber text-ink font-display tracking-wider text-[14px] uppercase rounded-[2px] hover:bg-amber-2 transition disabled:opacity-50"
                  style={{ fontWeight: 700 }}
                >
                  {status === "sending" ? "Invio in corso…" : "Inviami il link"}
                </button>

                <div className="pt-3 border-t border-line-dark text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode("password");
                      setErrorMsg("");
                      setStatus("idle");
                    }}
                    className="text-smoke-2 hover:text-amber font-mono text-xs uppercase tracking-wider"
                  >
                    ← Torna al login con password
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
