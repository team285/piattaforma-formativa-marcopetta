/**
 * Coach Studenti — porting nativo da prototipo (coach_students.jsx + parts of coach_team)
 * connesso al DB Supabase reale.
 *
 * Funzionalità:
 *  - Lista studenti via JOIN students × profiles × student_coach_assignments
 *  - Search per nome/email
 *  - Filtro per coach assegnato (visibile se ci sono >= 2 coach)
 *  - Click card → /preview/coach/studenti/:id (drill-down placeholder)
 *  - Bottone "+ Invita studente" (drawer placeholder per ora)
 *  - Empty state pulito quando DB vuoto
 *
 * RLS-safe: founder vede tutti, coach vede solo i propri assegnati.
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Avatar, EmberButton, Icon } from "../../components/ui";

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

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Coaches list (per chip filter)
        const { data: coachData } = await supabase
          .from("profiles")
          .select("id,full_name,initials,role")
          .in("role", ["coach", "founder"])
          .order("full_name");

        if (cancelled) return;
        setCoaches((coachData ?? []).map((c) => ({ id: c.id, full_name: c.full_name, initials: c.initials })));

        // Students con join: profiles + assignment attivo + coach
        const { data: studentsData, error } = await supabase
          .from("students")
          .select(
            `
            id,
            level,
            progress_pct,
            flag,
            last_active_at,
            profile:profiles!inner(id,full_name,email,initials),
            assignment:student_coach_assignments!inner(
              coach_id,
              coach:profiles!student_coach_assignments_coach_id_fkey(full_name,initials)
            )
          `
          )
          .eq("assignment.status", "active");

        if (error) {
          console.error("[CoachStudenti] load error:", error);
          if (!cancelled) setStudents([]);
        } else if (!cancelled) {
          const rows: StudentRow[] = (studentsData ?? []).map((s) => {
            const profile = (s as { profile: { id: string; full_name: string; email: string; initials: string } | { id: string; full_name: string; email: string; initials: string }[] }).profile;
            const p = Array.isArray(profile) ? profile[0] : profile;
            const assignment = (s as { assignment: { coach_id: string; coach: { full_name: string; initials: string } | { full_name: string; initials: string }[] } | { coach_id: string; coach: { full_name: string; initials: string } | { full_name: string; initials: string }[] }[] }).assignment;
            const a = Array.isArray(assignment) ? assignment[0] : assignment;
            const coachProfile = a?.coach;
            const c = Array.isArray(coachProfile) ? coachProfile[0] : coachProfile;
            return {
              id: s.id as string,
              full_name: p?.full_name ?? "—",
              email: p?.email ?? "",
              initials: p?.initials ?? "??",
              level: (s.level as string) ?? "Base",
              progress_pct: (s.progress_pct as number) ?? 0,
              flag: (s.flag as string | null) ?? null,
              last_active_at: (s.last_active_at as string | null) ?? null,
              coach_id: a?.coach_id ?? null,
              coach_name: c?.full_name ?? null,
            };
          });
          setStudents(rows);
        }
      } catch (e) {
        console.error("[CoachStudenti] exception:", e);
        if (!cancelled) setStudents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

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
        {/* Header editoriale */}
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
            onClick={() => {
              window.dispatchEvent(new CustomEvent("mp-toast", {
                detail: { message: "Drawer invito studente in arrivo", tone: "info" }
              }));
            }}
          >
            Invita studente
          </EmberButton>
        </div>

        {/* Toolbar: search + filtro coach */}
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

        {/* Risultati count */}
        <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
          {filtered.length} {filtered.length === 1 ? "risultato" : "risultati"}
        </div>

        {/* Empty state */}
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

        {/* Grid studenti */}
        {filtered.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((s) => (
              <Link
                key={s.id}
                to={`/preview/coach/studenti/${s.id}`}
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

                {/* Progresso percorso */}
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
    </div>
  );
}
