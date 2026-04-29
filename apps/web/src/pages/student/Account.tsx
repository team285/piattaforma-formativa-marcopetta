/**
 * Student Account — pagina settings personali studente.
 *
 * Permette di:
 *  - Aggiornare nome (profiles.full_name + initials ricalcolate)
 *  - Cambiare password (supabase.auth.updateUser)
 *  - Vedere email (read-only)
 *
 * Non c'è voce nav: si raggiunge cliccando l'avatar in StudentSidebar footer.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar, Icon, toast } from "../../components/ui";

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "??";
}

export function StudentAccount() {
  const { profile, refreshProfile } = useAuth();
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState("");
  const [pwdConfirm, setPwdConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const parts = profile.full_name.split(/\s+/);
    setNome(parts[0] ?? "");
    setCognome(parts.slice(1).join(" "));
  }, [profile]);

  const saveProfile = async () => {
    if (!profile) return;
    if (!nome.trim() || !cognome.trim()) {
      toast("Nome e cognome richiesti", "warn");
      return;
    }
    setSavingProfile(true);
    const fullName = `${nome.trim()} ${cognome.trim()}`;
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, initials: deriveInitials(fullName) })
      .eq("id", profile.id);
    setSavingProfile(false);
    if (error) {
      toast(`Errore: ${error.message}`, "warn");
      return;
    }
    toast("Profilo aggiornato", "ok");
    await refreshProfile();
  };

  const savePassword = async () => {
    if (pwd.length < 8) {
      toast("Password troppo corta (min 8 caratteri)", "warn");
      return;
    }
    if (pwd !== pwdConfirm) {
      toast("Le due password non coincidono", "warn");
      return;
    }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSavingPwd(false);
    if (error) {
      toast(`Errore: ${error.message}`, "warn");
      return;
    }
    setPwd("");
    setPwdConfirm("");
    toast("Password aggiornata. Al prossimo login usa la nuova.", "ok");
  };

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[760px] mx-auto px-5 md:px-12 py-8 md:py-14">
        <Link
          to="/student/home"
          className="flex items-center gap-2 text-[13px] text-smoke hover:text-ink mb-6"
        >
          <Icon name="chevronl" size={13} /> Torna al piano
        </Link>

        <div className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
            Account
          </div>
          <h1 className="font-editorial text-[36px] md:text-[48px] leading-[1.05]">
            Le tue <span className="italic-ember">impostazioni</span>.
          </h1>
        </div>

        {/* Sezione 1: Profilo */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)]">
              01 · Profilo
            </div>
            <div className="flex-1 border-t border-line" />
          </div>

          <div className="bg-paper-2 border border-line rounded-[3px] p-5 md:p-6 flex items-start gap-5">
            <Avatar initials={profile?.initials ?? "??"} size={64} tone="ember" />
            <div className="flex-1 min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mb-1">
                Email di login
              </div>
              <div className="font-mono text-[13px] text-ink break-all">{profile?.email ?? ""}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">
                Nome
              </div>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">
                Cognome
              </div>
              <input
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={saveProfile}
              disabled={savingProfile}
              className="h-10 px-5 rounded-[2px] bg-ink text-paper text-[13px] font-display uppercase tracking-wider hover:bg-ink-2 transition disabled:opacity-50"
              style={{ fontWeight: 700 }}
            >
              {savingProfile ? "Salvo…" : "Salva profilo"}
            </button>
          </div>
        </div>

        {/* Sezione 2: Password */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)]">
              02 · Password
            </div>
            <div className="flex-1 border-t border-line" />
          </div>

          <div className="bg-paper-2 border border-line rounded-[3px] p-5 md:p-6">
            <p className="text-[13px] text-smoke leading-[1.5] mb-5">
              Cambia la password che usi per entrare. Minimo 8 caratteri.
            </p>

            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">
                Nuova password
              </div>
              <div className="relative">
                <input
                  type={showPwd ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="min 8 caratteri"
                  className="w-full h-10 px-3 pr-12 bg-paper border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
                />
                <button
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-smoke hover:text-ink text-[10px] font-mono uppercase tracking-wider"
                >
                  {showPwd ? "nascondi" : "mostra"}
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">
                Conferma password
              </div>
              <input
                type={showPwd ? "text" : "password"}
                value={pwdConfirm}
                onChange={(e) => setPwdConfirm(e.target.value)}
                placeholder="ripeti la nuova password"
                className="w-full h-10 px-3 bg-paper border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={savePassword}
                disabled={savingPwd || !pwd || !pwdConfirm}
                className="h-10 px-5 rounded-[2px] bg-[var(--ember)] text-white text-[13px] font-display uppercase tracking-wider hover:bg-[var(--ember-2)] transition disabled:opacity-50 inline-flex items-center gap-2"
                style={{ fontWeight: 700 }}
              >
                <Icon name="check" size={13} /> {savingPwd ? "Aggiorno…" : "Aggiorna password"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
