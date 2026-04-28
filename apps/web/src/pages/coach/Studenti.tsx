/**
 * Coach Studenti — porting nativo connesso al DB Supabase reale.
 *
 * Strategia query: niente nested join PostgREST (fragili con FK custom),
 * usiamo query separate + lookup via .in() + Map. Ogni query è wrappata
 * in withTimeout cosi' la UI non si blocca mai su "Caricamento…" infinito.
 *
 * RLS-safe: founder vede tutti, coach vede solo i propri assegnati.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { Avatar, EmberButton, Icon, toast } from "../../components/ui";

interface StudentRow {
  id: string;
  full_name: string;
  email: string;
  initials: string;
  level: string;
  progress_pct: number;
  flag: string | null;
  last_active_at: string | null;
  coach_id: string | null;
  coach_name: string | null;
}

interface CoachOption {
  id: string;
  full_name: string;
  initials: string;
}

export function CoachStudenti() {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [coaches, setCoaches] = useState<CoachOption[]>([]);
  const [search, setSearch] = useState("");
  const [coachFilter, setCoachFilter] = useState<"all" | string>("all");
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // 1. Lista coach (per chip filter)
      const coachRes = await withTimeout(
        supabase
          .from("profiles")
          .select("id,full_name,initials,role")
          .in("role", ["coach", "founder"])
          .order("full_name"),
        6000,
        { data: [] as Array<{ id: string; full_name: string; initials: string; role: string }>, error: null },
        "studenti.coaches"
      );
      if (cancelled) return;
      setCoaches(
        (coachRes.data ?? []).map((c) => ({
          id: c.id,
          full_name: c.full_name,
          initials: c.initials,
        }))
      );

      // 2. Lista students (no join)
      const studentsRes = await withTimeout(
        supabase
          .from("students")
          .select("id,level,progress_pct,flag,last_active_at"),
        6000,
        { data: [] as Array<{ id: string; level: string; progress_pct: number; flag: string | null; last_active_at: string | null }>, error: null },
        "studenti.students"
      );
      if (cancelled) return;
      const studentsRaw = studentsRes.data ?? [];

      if (studentsRaw.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = studentsRaw.map((s) => s.id);

      // 3. Profiles dei studenti (lookup)
      const profilesRes = await withTimeout(
        supabase
          .from("profiles")
          .select("id,full_name,email,initials")
          .in("id", studentIds),
        6000,
        { data: [] as Array<{ id: string; full_name: string; email: string; initials: string }>, error: null },
        "studenti.profiles"
      );
      if (cancelled) return;
      const profileById = new Map<string, { full_name: string; email: string; initials: string }>();
      (profilesRes.data ?? []).forEach((p) => {
        profileById.set(p.id, { full_name: p.full_name, email: p.email, initials: p.initials });
      });

      // 4. Assignments attive per questi studenti
      const assignsRes = await withTimeout(
        supabase
          .from("student_coach_assignments")
          .select("student_id,coach_id,status")
          .in("student_id", studentIds)
          .eq("status", "active"),
        6000,
        { data: [] as Array<{ student_id: string; coach_id: string; status: string }>, error: null },
        "studenti.assignments"
      );
      if (cancelled) return;
      const assignByStudent = new Map<string, string>();
      const coachIdsSet = new Set<string>();
      (assignsRes.data ?? []).forEach((a) => {
        assignByStudent.set(a.student_id, a.coach_id);
        coachIdsSet.add(a.coach_id);
      });

      // 5. Profili dei coach (lookup nome)
      const coachIds = Array.from(coachIdsSet);
      const coachProfileById = new Map<string, { full_name: string }>();
      if (coachIds.length > 0) {
        const coachProfilesRes = await withTimeout(
          supabase
            .from("profiles")
            .select("id,full_name")
            .in("id", coachIds),
          6000,
          { data: [] as Array<{ id: string; full_name: string }>, error: null },
          "studenti.coach_profiles"
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
          level: s.level ?? "Base",
          progress_pct: s.progress_pct ?? 0,
          flag: s.flag,
          last_active_at: s.last_active_at,
          coach_id: coachId,
          coach_name: coach?.full_name ?? null,
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
      s.full_name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.level.toLowerCase().includes(q)
    );
  });

  const flaggedCount = students.filter((s) => s.flag).length;

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1400px] mx-auto px-10 py-8">
        <div className="flex items-end justify-between pb-6 border-b border-line">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
              {loading ? "Caricamento…" : `${students.length} studenti totali · ${flaggedCount} richiedono attenzione`}
            </div>
            <h1 className="font-editorial text-[52px]">
              I tuoi <span className="italic-ember">studenti</span>.
            </h1>
          </div>
          <EmberButton
            icon="plus"
            outline
            onClick={() => setInviteOpen(true)}
          >
            Invita studente
          </EmberButton>
        </div>

        <div className="mt-6 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-paper-2 border border-line rounded-[3px] px-3 h-10 flex-1 min-w-[280px] max-w-[420px]">
            <Icon name="search" size={14} className="text-smoke" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per nome, email, livello…"
              className="flex-1 bg-transparent outline-none text-[13px] text-ink placeholder:text-smoke"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-smoke hover:text-ink">
                <Icon name="x" size={13} />
              </button>
            )}
          </div>

          {coaches.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mr-1">Coach</span>
              <button
                onClick={() => setCoachFilter("all")}
                className={
                  "h-8 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider border " +
                  (coachFilter === "all"
                    ? "bg-ink text-paper border-ink"
                    : "border-line text-smoke hover:border-ink")
                }
              >
                Tutti ({students.length})
              </button>
              {coaches.map((c) => {
                const n = students.filter((s) => s.coach_id === c.id).length;
                const active = coachFilter === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCoachFilter(c.id)}
                    className={
                      "h-8 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider border inline-flex items-center gap-2 " +
                      (active ? "bg-ink text-paper border-ink" : "border-line text-smoke hover:border-ink")
                    }
                  >
                    <Avatar initials={c.initials} size={18} tone="ink" />
                    {c.full_name.split(" ")[0]} ({n})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
          {filtered.length} {filtered.length === 1 ? "risultato" : "risultati"}
        </div>

        {!loading && students.length === 0 && (
          <div className="bg-paper-2 border border-line rounded-[3px] p-16 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
              Nessuno studente ancora
            </div>
            <h2 className="font-editorial text-[28px] mb-3">
              Inizia <span className="italic-ember">invitando</span> il primo studente.
            </h2>
            <p className="text-smoke text-[14px] max-w-md mx-auto leading-relaxed">
              Quando aggiungerai uno studente, lo vedrai qui con il suo livello, progresso del percorso
              e coach assegnato.
            </p>
          </div>
        )}

        {!loading && students.length > 0 && filtered.length === 0 && (
          <div className="py-20 text-center text-smoke text-[14px]">
            Nessuno studente corrisponde ai filtri.
          </div>
        )}

        {filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((s) => (
              <Link
                key={s.id}
                to={`/coach/studenti/${s.id}`}
                className="text-left bg-paper-2 border border-line rounded-[3px] p-5 hover:border-ink transition group"
              >
                <div className="flex items-start gap-4">
                  <Avatar initials={s.initials} size={52} tone={s.flag ? "ember" : "ink"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-display text-[22px] leading-[1.05] truncate">{s.full_name}</div>
                      {s.flag && <span className="w-2 h-2 rounded-full bg-[var(--ember)] flex-shrink-0 mt-2" />}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-1">
                      {s.level}
                      {s.last_active_at && (
                        <> · {new Date(s.last_active_at).toLocaleDateString("it-IT")}</>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">Percorso</span>
                    <span className="font-mono text-[11px] text-ink">{s.progress_pct}%</span>
                  </div>
                  <div className="h-[3px] bg-line rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--ember)] rounded-full"
                      style={{ width: s.progress_pct + "%" }}
                    />
                  </div>
                </div>

                {s.flag && (
                  <div className="mt-4 text-[12px] text-[var(--ember)] inline-flex items-center gap-1.5">
                    <Icon name="inbox" size={12} /> {s.flag}
                  </div>
                )}

                {s.coach_name && (
                  <div className="mt-4 pt-4 border-t border-line flex items-center gap-2">
                    <Avatar
                      initials={s.coach_name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                      size={20}
                      tone="ink"
                    />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">
                      Coach: {s.coach_name.split(" ")[0]}
                    </span>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-line flex items-center justify-between text-[12px]">
                  <span className="text-smoke group-hover:text-ink transition">Apri profilo</span>
                  <Icon name="chevron" size={13} className="text-smoke group-hover:text-ink transition" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {inviteOpen && (
        <InviteStudentDrawer
          onClose={() => setInviteOpen(false)}
          onCreated={() => {
            setInviteOpen(false);
            setTick((t) => t + 1);
          }}
        />
      )}
    </div>
  );
}

// ─── Drawer Invita Studente ────────────────────────────────────────
function generateTempPassword(): string {
  const a = ["blues", "rock", "funk", "jazz", "note", "riff", "ritmo", "groove", "luce", "vento"];
  const b = ["mare", "sera", "vita", "alba", "ponte", "festa", "onda", "spazio"];
  const x = a[Math.floor(Math.random() * a.length)];
  const y = b[Math.floor(Math.random() * b.length)];
  const n = Math.floor(Math.random() * 90) + 10;
  return `${x}${y}${n}!`;
}

function InviteStudentDrawer({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [level, setLevel] = useState("Base");
  const [instrument, setInstrument] = useState("Chitarra elettrica");
  const [duration, setDuration] = useState<3 | 6 | 12 | 0>(6);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [artistsRef, setArtistsRef] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [tempPwd] = useState(generateTempPassword);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);

  const toggleGenre = (g: string) => {
    setGenres((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));
  };

  const submit = async () => {
    if (!nome.trim() || !cognome.trim()) {
      toast("Nome e cognome richiesti", "warn");
      return;
    }
    if (!email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(email.trim())) {
      toast("Email non valida", "warn");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.rpc("admin_create_student", {
      p_email: email.trim().toLowerCase(),
      p_full_name: `${nome.trim()} ${cognome.trim()}`,
      p_password: tempPwd,
      p_phone: phone.trim() || null,
      p_level: level,
      p_instrument: instrument,
      p_duration_months: duration === 0 ? null : duration,
      p_start_date: startDate || null,
      p_artists_ref: artistsRef.trim() || null,
      p_genres: genres,
      p_notes: notes.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast(`Errore: ${error.message}`, "warn");
      return;
    }
    const result = data as { ok: boolean; error?: string; email?: string; temp_password?: string };
    if (!result?.ok) {
      toast(`Errore: ${result?.error ?? "creazione fallita"}`, "warn");
      return;
    }
    setCreated({ email: result.email!, password: result.temp_password! });
    toast("Studente creato con successo", "ok");
  };

  const copyPassword = () => {
    if (!created) return;
    try {
      navigator.clipboard.writeText(created.password);
      toast("Password copiata", "ok");
    } catch {
      toast("Selezionala a mano", "info");
    }
  };

  const close = () => {
    if (created) onCreated();
    else onClose();
  };

  return (
    <div className="fixed inset-0 z-[9000]" style={{ animation: "fadeIn 0.25s" }}>
      <div onClick={close} className="absolute inset-0 bg-ink/60" style={{ backdropFilter: "blur(2px)" }} />
      <div
        className="absolute top-0 right-0 h-full w-full max-w-[640px] bg-paper text-ink shadow-2xl flex flex-col"
        style={{ animation: "slideInRight 0.32s cubic-bezier(.2,.7,.2,1)" }}
      >
        <div className="flex-shrink-0 px-8 pt-7 pb-5 border-b border-line bg-paper">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-1.5">
                Nuovo studente
              </div>
              <h2 className="font-editorial text-[32px] leading-[1.02]">
                Invita uno <span className="italic-ember">studente</span>.
              </h2>
            </div>
            <button
              onClick={close}
              className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-smoke hover:text-ink hover:border-ink transition flex-shrink-0"
            >
              <Icon name="x" size={14} />
            </button>
          </div>
        </div>

        {created ? (
          <div className="flex-1 overflow-y-auto px-8 py-8 no-scrollbar">
            <div className="bg-ink text-paper rounded-[3px] p-6 border border-[var(--amber)]/30">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--amber)] mb-3">
                Account creato
              </div>
              <div className="text-[13px] text-[#C9BDB1] leading-[1.5] mb-5">
                Comunica queste credenziali allo studente via canale sicuro (WhatsApp, email personale,
                a voce). Quando avremo SMTP configurato, partirà automaticamente.
              </div>
              <div className="space-y-3">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#C9BDB1] mb-1">
                    Email login
                  </div>
                  <code className="font-mono text-[15px] text-paper select-all">{created.email}</code>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wider text-[#C9BDB1] mb-1">
                    Password temporanea
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="font-mono text-[18px] text-paper tracking-wide select-all flex-1">
                      {created.password}
                    </code>
                    <button
                      onClick={copyPassword}
                      className="h-8 px-3 rounded-[2px] border border-[var(--amber)]/40 text-[10px] text-[var(--amber)] hover:bg-[var(--amber)] hover:text-ink transition font-mono uppercase tracking-wider"
                    >
                      Copia
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 text-[13px] text-smoke leading-[1.5]">
              Lo studente potrà loggarsi subito con queste credenziali. Al primo login potrà cambiare
              password dalle impostazioni del proprio account.
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">
            {/* Sezione 1 — Anagrafica */}
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-4">
              01 · Anagrafica
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nome *">
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
                />
              </Field>
              <Field label="Cognome *">
                <input
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <Field label="Email *">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="studente@esempio.com"
                  className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink font-mono"
                />
              </Field>
              <Field label="Telefono">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+39 ..."
                  className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink font-mono"
                />
              </Field>
            </div>

            <div className="my-7 border-t border-line" />

            {/* Sezione 2 — Profilo musicale */}
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-4">
              02 · Profilo musicale
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Strumento">
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
                >
                  <option>Chitarra elettrica</option>
                  <option>Chitarra acustica</option>
                  <option>Chitarra classica</option>
                  <option>Basso elettrico</option>
                </select>
              </Field>
              <Field label="Livello">
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
                >
                  <option>Base</option>
                  <option>Intermedio</option>
                  <option>Avanzato</option>
                </select>
              </Field>
            </div>
            <Field label="Artisti di riferimento">
              <input
                value={artistsRef}
                onChange={(e) => setArtistsRef(e.target.value)}
                placeholder="es. SRV, Hendrix, Gilmour…"
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
              />
            </Field>
            <Field label="Generi (multi-select)">
              <div className="flex flex-wrap gap-2">
                {["Blues", "Rock", "Funk", "Jazz", "Metal", "Pop", "Country"].map((g) => {
                  const on = genres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGenre(g)}
                      className={
                        "h-7 px-3 rounded-[2px] text-[11px] font-mono uppercase tracking-wider border " +
                        (on ? "bg-ink text-paper border-ink" : "border-line text-smoke hover:border-ink")
                      }
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </Field>

            <div className="my-7 border-t border-line" />

            {/* Sezione 3 — Percorso */}
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-4">
              03 · Percorso
            </div>
            <Field label="Durata percorso">
              <div className="flex gap-2">
                {([3, 6, 12, 0] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={
                      "flex-1 h-10 px-3 rounded-[2px] text-[12px] font-mono uppercase tracking-wider border " +
                      (duration === m
                        ? "bg-ink text-paper border-ink"
                        : "border-line text-smoke hover:border-ink")
                    }
                  >
                    {m === 0 ? "Custom" : `${m} mesi`}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Data inizio">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full h-10 px-3 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink"
              />
            </Field>

            <div className="my-7 border-t border-line" />

            {/* Sezione 4 — Note interne */}
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-4">
              04 · Note interne (opzionali)
            </div>
            <Field label="Note commerciali / didattiche">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Da dove arriva, obiettivi, contesto…"
                rows={3}
                className="w-full px-3 py-2 bg-paper-2 border border-line rounded-[2px] text-[13px] focus:outline-none focus:border-ink resize-none"
              />
            </Field>

            <div className="mt-8 bg-paper-2 border border-line rounded-[3px] p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
                Password temporanea
              </div>
              <div className="font-mono text-[16px] text-ink select-all">{tempPwd}</div>
              <div className="text-[12px] text-smoke mt-2 leading-[1.4]">
                Generata casualmente. Verrà mostrata in chiaro dopo la creazione cosi' la potrai
                comunicare allo studente.
              </div>
            </div>
          </div>
        )}

        <div className="flex-shrink-0 px-8 py-5 border-t border-line bg-paper-2 flex items-center justify-between gap-3">
          <button
            onClick={close}
            className="h-10 px-4 rounded-[2px] border border-line text-[13px] text-smoke hover:text-ink hover:border-ink transition"
          >
            {created ? "Chiudi" : "Annulla"}
          </button>
          {!created && (
            <button
              onClick={submit}
              disabled={submitting}
              className="h-10 px-5 rounded-[2px] bg-ink text-paper text-[13px] font-display uppercase tracking-wider hover:bg-ink-2 transition inline-flex items-center gap-2 disabled:opacity-50"
              style={{ fontWeight: 700 }}
            >
              <Icon name="check" size={13} /> {submitting ? "Creo studente…" : "Crea account studente"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="font-mono text-[10px] uppercase tracking-wider mb-1.5 text-smoke">{label}</div>
      {children}
    </div>
  );
}
