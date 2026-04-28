/**
 * Coach Impostazioni — porting nativo (coach_settings.jsx) connesso al DB.
 *
 * 3 sezioni:
 *  1. Profilo coach (mostra dati auth utente loggato)
 *  2. Account studenti — REALE: modifica nome, reset password via RPC
 *     admin_set_password definita in migration 0018
 *  3. Notifiche (toggles, mock per ora)
 *
 * RLS-safe: founder edita tutti i profili, coach edita solo i propri.
 */

import { useEffect, useState } from "react";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar, Icon, toast } from "../../components/ui";

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  initials: string;
  coach_id: string | null;
  coach_name: string | null;
  level: string;
}

interface CoachOption {
  id: string;
  full_name: string;
}

function generateTempPassword(): string {
  const a = ["blues", "rock", "funk", "jazz", "note", "riff", "ritmo", "groove", "luce", "vento"];
  const b = ["mare", "sera", "vita", "alba", "ponte", "festa", "onda", "spazio"];
  const x = a[Math.floor(Math.random() * a.length)];
  const y = b[Math.floor(Math.random() * b.length)];
  const n = Math.floor(Math.random() * 90) + 10;
  return `${x}${y}${n}!`;
}

export function CoachImpostazioni() {
  const { profile } = useAuth();
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [search, setSearch] = useState("");
  const [coachFilter, setCoachFilter] = useState<"all" | string>("all");
  const [editing, setEditing] = useState<StudentRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // 1. Lista coach
      const coachRes = await withTimeout(
        supabase.from("profiles").select("id,full_name").in("role", ["coach", "founder"]),
        6000,
        { data: [] as Array<{ id: string; full_name: string }>, error: null },
        "imp.coaches"
      );
      if (cancelled) return;
      setCoaches((coachRes.data ?? []) as CoachOption[]);

      // 2. Lista students (no join)
      const studentsRes = await withTimeout(
        supabase.from("students").select("id,level"),
        6000,
        { data: [] as Array<{ id: string; level: string }>, error: null },
        "imp.students"
      );
      if (cancelled) return;
      const studentsRaw = studentsRes.data ?? [];

      if (studentsRaw.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = studentsRaw.map((s) => s.id);

      // 3. Profiles studenti
      const profilesRes = await withTimeout(
        supabase
          .from("profiles")
          .select("id,full_name,email,initials")
          .in("id", studentIds),
        6000,
        { data: [] as Array<{ id: string; full_name: string; email: string; initials: string }>, error: null },
        "imp.profiles"
      );
      if (cancelled) return;
      const profileById = new Map<string, { full_name: string; email: string; initials: string }>();
      (profilesRes.data ?? []).forEach((p) => {
        profileById.set(p.id, { full_name: p.full_name, email: p.email, initials: p.initials });
      });

      // 4. Assignments attive
      const assignsRes = await withTimeout(
        supabase
          .from("student_coach_assignments")
          .select("student_id,coach_id,status")
          .in("student_id", studentIds)
          .eq("status", "active"),
        6000,
        { data: [] as Array<{ student_id: string; coach_id: string; status: string }>, error: null },
        "imp.assignments"
      );
      if (cancelled) return;
      const assignByStudent = new Map<string, string>();
      const coachIdsSet = new Set<string>();
      (assignsRes.data ?? []).forEach((a) => {
        assignByStudent.set(a.student_id, a.coach_id);
        coachIdsSet.add(a.coach_id);
      });

      // 5. Profili coach
      const coachIds = Array.from(coachIdsSet);
      const coachProfileById = new Map<string, { full_name: string }>();
      if (coachIds.length > 0) {
        const coachProfilesRes = await withTimeout(
          supabase.from("profiles").select("id,full_name").in("id", coachIds),
          6000,
          { data: [] as Array<{ id: string; full_name: string }>, error: null },
          "imp.coach_profiles"
        );
        if (cancelled) return;
        (coachProfilesRes.data ?? []).forEach((p) => {
          coachProfileById.set(p.id, { full_name: p.full_name });
        });
      }

      const rows: StudentRow[] = studentsRaw.map((s) => {
        const p = profileById.get(s.id);
        const coachId = assignByStudent.get(s.id) ?? null;
        const coach = coachId ? coachProfileById.get(coachId) : null;
        return {
          id: s.id,
          full_name: p?.full_name ?? "—",
          email: p?.email ?? "",
          initials: p?.initials ?? "??",
          coach_id: coachId,
          coach_name: coach?.full_name ?? null,
          level: s.level ?? "Base",
        };
      });
      setStudents(rows);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const q = search.trim().toLowerCase();
  const filtered = students.filter((s) => {
    if (coachFilter !== "all" && s.coach_id !== coachFilter) return false;
    if (!q) return true;
    return (
      s.full_name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-10 py-10">
        {/* Header */}
        <div className="flex items-end justify-between pb-6 border-b border-line mb-10">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
              Impostazioni
            </div>
            <h1 className="font-editorial text-[56px]">
              Gestisci <span className="italic-ember">la tua scuola</span>.
            </h1>
            <div className="text-[14px] text-smoke mt-3 max-w-[560px]">
              Profilo, account degli studenti, preferenze di notifica.
            </div>
          </div>
        </div>

        {/* SEZIONE 1: Profilo Coach */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)]">
              01 · Profilo
            </div>
            <div className="flex-1 border-t border-line" />
          </div>
          <div className="bg-paper-2 border border-line rounded-[3px] p-6 flex items-start gap-6">
            <Avatar initials={profile?.initials ?? "MP"} size={72} tone="ember" />
            <div className="flex-1 min-w-0">
              <div className="font-editorial text-[28px]">{profile?.full_name ?? "—"}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-1">
                {profile?.role === "founder" ? "Fondatore · Metodo P.G.T." : "Coach"}
              </div>
              <div className="mt-4 text-[13px]">
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mb-1">Email</div>
                <div className="font-mono">{profile?.email ?? ""}</div>
              </div>
            </div>
          </div>
        </div>

        {/* SEZIONE 2: Account studenti */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)]">
              02 · Account studenti
            </div>
            <div className="flex-1 border-t border-line" />
          </div>

          <div className="bg-ink text-paper rounded-[3px] p-6 mb-5 flex items-start gap-5">
            <div className="w-10 h-10 rounded-full bg-[var(--amber)]/10 border border-[var(--amber)]/30 flex items-center justify-center flex-shrink-0">
              <Icon name="warning" size={18} className="text-[var(--amber)]" />
            </div>
            <div>
              <div className="font-display text-[18px] mb-1.5">
                Solo tu puoi modificare gli account dei tuoi studenti.
              </div>
              <div className="text-[13px] text-[#C9BDB1] leading-[1.45] max-w-[640px]">
                Se uno studente dimentica la password, generala da qui: gli arriverà via email (quando avremo SMTP configurato) o gliela comunichi tu.
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-2 bg-paper-2 border border-line rounded-[3px] px-3 h-10 flex-1 min-w-[280px] max-w-[420px]">
              <Icon name="search" size={14} className="text-smoke" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cerca per nome o email…"
                className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-smoke"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-smoke hover:text-ink">
                  <Icon name="x" size={13} />
                </button>
              )}
            </div>
            {coaches.length > 1 && (
              <div className="flex items-center gap-1 bg-paper-2 border border-line rounded-[3px] p-1 ml-auto">
                <button
                  onClick={() => setCoachFilter("all")}
                  className={
                    "h-8 px-3 text-[11px] font-mono uppercase tracking-wider rounded-[2px] " +
                    (coachFilter === "all" ? "bg-ink text-paper" : "text-smoke hover:text-ink")
                  }
                >
                  Tutti
                </button>
                {coaches.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCoachFilter(c.id)}
                    className={
                      "h-8 px-3 text-[11px] font-mono uppercase tracking-wider rounded-[2px] " +
                      (coachFilter === c.id ? "bg-ink text-paper" : "text-smoke hover:text-ink")
                    }
                  >
                    {c.full_name.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tabella studenti */}
          {loading ? (
            <div className="bg-paper-2 border border-line rounded-[3px] p-10 text-center text-smoke text-[13px]">
              Caricamento…
            </div>
          ) : students.length === 0 ? (
            <div className="bg-paper-2 border border-line rounded-[3px] p-12 text-center">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
                Nessuno studente
              </div>
              <p className="text-smoke text-[14px] max-w-md mx-auto">
                Quando inviterai studenti, li gestirai qui (modifica nome, reset password).
              </p>
            </div>
          ) : (
            <div className="bg-paper-2 border border-line rounded-[3px] overflow-hidden">
              <div className="grid grid-cols-[1.2fr_1.4fr_0.9fr_auto] gap-4 items-center px-5 py-3 border-b border-line bg-paper">
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">Studente</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">Email</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-smoke">Coach</div>
                <div className="w-[96px]" />
              </div>
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="grid grid-cols-[1.2fr_1.4fr_0.9fr_auto] gap-4 items-center px-5 py-4 border-b border-line last:border-b-0 hover:bg-paper transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar initials={s.initials} size={36} tone="ink" />
                    <div className="min-w-0">
                      <div className="text-[14px] truncate">{s.full_name}</div>
                      <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-0.5">
                        {s.level}
                      </div>
                    </div>
                  </div>
                  <div className="text-[12px] truncate font-mono text-smoke">{s.email}</div>
                  <div className="text-[12px] truncate text-smoke">
                    {s.coach_name?.split(" ")[0] ?? "—"}
                  </div>
                  <button
                    onClick={() => setEditing(s)}
                    className="h-8 px-3 rounded-[2px] border border-line text-[11px] text-smoke hover:border-ink hover:text-ink transition font-mono uppercase tracking-wider inline-flex items-center gap-1.5"
                  >
                    <Icon name="pencil" size={11} /> Modifica
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEZIONE 3: Notifiche (placeholder) */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)]">
              03 · Notifiche
            </div>
            <div className="flex-1 border-t border-line" />
          </div>
          <div className="bg-paper-2 border border-line rounded-[3px] p-8 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
              In arrivo
            </div>
            <p className="text-smoke text-[14px] max-w-lg mx-auto">
              Preferenze notifiche email + push saranno configurabili appena Resend SMTP sarà attivo.
            </p>
          </div>
        </div>
      </div>

      {editing && (
        <EditStudentDrawer
          student={editing}
          onClose={() => setEditing(null)}
          onSaved={() => setTick((t) => t + 1)}
        />
      )}
    </div>
  );
}

// ─── Drawer ─────────────────────────────────────────────────────────
function EditStudentDrawer({
  student,
  onClose,
  onSaved,
}: {
  student: StudentRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const parts = student.full_name.split(" ");
    setNome(parts[0] || "");
    setCognome(parts.slice(1).join(" "));
    setTempPassword(null);
  }, [student]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const generatePassword = async () => {
    const newPwd = generateTempPassword();
    setSaving(true);
    const { error } = await supabase.rpc("admin_set_password", {
      p_email: student.email,
      p_new_password: newPwd,
    });
    setSaving(false);
    if (error) {
      toast(`Errore: ${error.message}`, "warn");
      return;
    }
    setTempPassword(newPwd);
    toast("Password generata e salvata. Comunicala allo studente.", "ok");
  };

  const copyPassword = () => {
    if (!tempPassword) return;
    try {
      navigator.clipboard.writeText(tempPassword);
      toast("Password copiata negli appunti", "ok");
    } catch {
      toast("Selezionala a mano e copiala", "info");
    }
  };

  const save = async () => {
    if (!nome.trim() || !cognome.trim()) {
      toast("Nome e cognome richiesti", "warn");
      return;
    }
    const fullName = `${nome.trim()} ${cognome.trim()}`;
    const initials = ((nome.trim()[0] || "") + (cognome.trim()[0] || "")).toUpperCase() || "??";
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, initials })
      .eq("id", student.id);
    setSaving(false);
    if (error) {
      toast(`Errore salvataggio: ${error.message}`, "warn");
      return;
    }
    toast(`Account di ${nome.trim()} aggiornato`, "ok");
    onSaved();
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-[9000]" style={{ animation: "fadeIn 0.25s" }}>
      <div onClick={onClose} className="absolute inset-0 bg-ink/60" style={{ backdropFilter: "blur(2px)" }} />
      <div
        className="absolute top-0 right-0 h-full w-full max-w-[560px] bg-paper text-ink shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.32s cubic-bezier(.2,.7,.2,1)" }}
      >
        <div className="flex-shrink-0 px-8 pt-7 pb-5 border-b border-line bg-paper">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">
                Modifica account
              </div>
              <h2 className="font-editorial text-[32px] leading-[1.02] truncate">{student.full_name}</h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-smoke hover:text-ink hover:border-ink transition flex-shrink-0"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-1.5">
            01 · Nome
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">Nome *</div>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"
              />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">Cognome *</div>
              <input
                value={cognome}
                onChange={(e) => setCognome(e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink transition"
              />
            </div>
          </div>

          <div className="my-7 border-t border-line" />

          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-1.5">
            02 · Email
          </div>
          <div className="text-[12px] text-smoke mb-3">
            Email di login (modifica disponibile dopo Edge Function admin).
          </div>
          <input
            type="email"
            value={student.email}
            readOnly
            className="w-full h-10 px-3 bg-sand border border-line rounded-[2px] text-[13px] font-mono text-smoke"
          />

          <div className="my-7 border-t border-line" />

          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-1.5">
            03 · Password
          </div>
          <div className="text-[12px] text-smoke mb-3">
            Genera una password temporanea che lo studente userà per il primo login. Salvata nel DB con bcrypt.
          </div>

          <button
            onClick={generatePassword}
            disabled={saving}
            className="h-9 px-3 rounded-[2px] border border-[var(--ember)]/40 text-[11px] text-[var(--ember)] hover:bg-[var(--ember)] hover:text-white transition font-mono uppercase tracking-wider inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Icon name="loop" size={11} /> {saving ? "Genero…" : "Genera password temporanea"}
          </button>

          {tempPassword && (
            <div className="mt-4 bg-ink text-paper rounded-[3px] p-4 border border-[var(--amber)]/30">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-2">
                Nuova password generata e salvata
              </div>
              <div className="flex items-center gap-3 mb-2">
                <code className="font-mono text-[20px] text-paper tracking-wide select-all flex-1">
                  {tempPassword}
                </code>
                <button
                  onClick={copyPassword}
                  className="h-8 px-3 rounded-[2px] border border-[var(--amber)]/40 text-[10px] text-[var(--amber)] hover:bg-[var(--amber)] hover:text-ink transition font-mono uppercase tracking-wider"
                >
                  Copia
                </button>
              </div>
              <div className="text-[11px] text-[#C9BDB1] leading-[1.4]">
                Comunicala a <strong>{student.full_name.split(" ")[0]}</strong> via canale sicuro. Verrà nascosta quando chiudi questa vista.
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-8 py-5 border-t border-line bg-paper-2 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="h-10 px-4 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink transition"
          >
            Annulla
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="h-10 px-5 rounded-[2px] bg-ink text-paper text-[13px] font-display uppercase tracking-wider hover:bg-ink-2 transition inline-flex items-center gap-2 disabled:opacity-50"
            style={{ fontWeight: 700 }}
          >
            <Icon name="check" size={13} /> {saving ? "Salvo…" : "Salva modifiche"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}
