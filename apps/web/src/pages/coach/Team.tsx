/**
 * Coach Team — porting nativo (coach_team.jsx) connesso al DB.
 *
 * Mostra grid dei coach del team. Strategia query: niente nested join,
 * query separate + .in() + Map. withTimeout su tutto così la UI non
 * si blocca su "Caricamento…" infinito.
 */

import { useEffect, useState } from "react";
import { supabase, withTimeout } from "../../lib/supabase";
import { usePageTitle } from "../../lib/hooks";
import { Avatar, EmberButton, Icon, Tag, toast } from "../../components/ui";

interface CoachRow {
  id: string;
  full_name: string;
  initials: string;
  role: string;
  job_title: string;
  tagline: string | null;
  bio: string | null;
  tone: "ink" | "ember" | "sand";
  specialties: string[];
  locked: boolean;
  max_students: number;
  avg_response_time: string | null;
  feedback_this_week: number;
  students_count: number;
}

export function CoachTeam() {
  usePageTitle("Team coach");
  const [team, setTeam] = useState<CoachRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      // 1. Lista coach (no join)
      const coachesRes = await withTimeout(
        supabase
          .from("coaches")
          .select("id,job_title,tagline,bio,tone,specialties,locked,max_students,avg_response_time,feedback_this_week"),
        6000,
        {
          data: [] as Array<{
            id: string; job_title: string | null; tagline: string | null; bio: string | null;
            tone: string | null; specialties: string[] | null; locked: boolean | null;
            max_students: number | null; avg_response_time: string | null; feedback_this_week: number | null;
          }>,
          error: null,
        },
        "team.coaches"
      );
      if (cancelled) return;
      const coachesRaw = coachesRes.data ?? [];

      if (coachesRaw.length === 0) {
        setTeam([]);
        setLoading(false);
        return;
      }

      const coachIds = coachesRaw.map((c) => c.id);

      // 2. Profiles dei coach
      const profilesRes = await withTimeout(
        supabase
          .from("profiles")
          .select("id,full_name,initials,role")
          .in("id", coachIds),
        6000,
        { data: [] as Array<{ id: string; full_name: string; initials: string; role: string }>, error: null },
        "team.profiles"
      );
      if (cancelled) return;
      const profileById = new Map<string, { full_name: string; initials: string; role: string }>();
      (profilesRes.data ?? []).forEach((p) => {
        profileById.set(p.id, { full_name: p.full_name, initials: p.initials, role: p.role });
      });

      // 3. Tutte le assignments attive (coach_id) → count via aggregazione client
      const assignsRes = await withTimeout(
        supabase
          .from("student_coach_assignments")
          .select("coach_id,status")
          .in("coach_id", coachIds)
          .eq("status", "active"),
        6000,
        { data: [] as Array<{ coach_id: string; status: string }>, error: null },
        "team.assignments"
      );
      if (cancelled) return;
      const countByCoach = new Map<string, number>();
      (assignsRes.data ?? []).forEach((a) => {
        countByCoach.set(a.coach_id, (countByCoach.get(a.coach_id) ?? 0) + 1);
      });

      const rows: CoachRow[] = coachesRaw.map((c) => {
        const p = profileById.get(c.id);
        return {
          id: c.id,
          full_name: p?.full_name ?? "—",
          initials: p?.initials ?? "??",
          role: p?.role ?? "coach",
          job_title: c.job_title ?? "Coach",
          tagline: c.tagline,
          bio: c.bio,
          tone: ((c.tone as "ink" | "ember" | "sand") ?? "ink"),
          specialties: c.specialties ?? [],
          locked: !!c.locked,
          max_students: c.max_students ?? 10,
          avg_response_time: c.avg_response_time,
          feedback_this_week: c.feedback_this_week ?? 0,
          students_count: countByCoach.get(c.id) ?? 0,
        };
      });

      setTeam(rows);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentsTotal = team.reduce((acc, c) => acc + c.students_count, 0);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-5 md:px-10 py-8 md:py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-5 md:pb-6 border-b border-line mb-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
              {loading
                ? "Caricamento…"
                : `${team.length} ${team.length === 1 ? "coach attivo" : "coach attivi"} · ${studentsTotal} studenti totali`}
            </div>
            <h1 className="font-editorial text-[36px] md:text-[56px] leading-[1.05]">
              Il tuo <span className="italic-ember">team</span>.
            </h1>
            <div className="text-[14px] text-smoke mt-3 max-w-[520px]">
              Gestisci i coach del metodo. Tu resti il fondatore — gli altri coprono i primi mesi o
              specializzazioni.
            </div>
          </div>
          <EmberButton
            icon="plus"
            onClick={() =>
              toast("Aggiunta coach via Edge Function · in arrivo", "info")
            }
          >
            Aggiungi coach
          </EmberButton>
        </div>

        {!loading && team.length === 0 && (
          <div className="bg-paper-2 border border-line rounded-[3px] p-16 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
              Nessun coach
            </div>
            <h2 className="font-editorial text-[28px] mb-3">
              Il tuo team è <span className="italic-ember">vuoto</span>.
            </h2>
            <p className="text-smoke text-[14px] max-w-md mx-auto leading-relaxed">
              Quando il tuo profilo sarà completato come founder, sarai il primo coach del team. Poi
              potrai aggiungere altri come Paolo Marchetti.
            </p>
          </div>
        )}

        {team.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((c) => {
              const fill = Math.min(100, Math.round((c.students_count / c.max_students) * 100));
              const full = c.students_count >= c.max_students;
              return (
                <button
                  key={c.id}
                  onClick={() => toast("Drill-down coach · in arrivo", "info")}
                  className="text-left bg-paper-2 border border-line rounded-[3px] p-5 hover:border-ink transition group"
                >
                  <div className="flex items-start gap-4">
                    <Avatar initials={c.initials} size={52} tone={c.tone} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-display text-[22px] leading-[1.05] truncate">
                            {c.full_name}
                          </div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-smoke mt-1">
                            {c.job_title}
                          </div>
                        </div>
                        {c.locked && <Tag>fondatore</Tag>}
                      </div>
                    </div>
                  </div>

                  {c.tagline && (
                    <div className="mt-4 text-[13px] text-smoke leading-[1.4]">{c.tagline}</div>
                  )}

                  {c.specialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.specialties.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="font-mono text-[9px] uppercase tracking-wider text-smoke bg-paper border border-line rounded-[2px] px-2 py-0.5"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">
                        studenti
                      </span>
                      <span className="font-mono text-[11px] text-ink">
                        {c.students_count} / {c.max_students}
                      </span>
                    </div>
                    <div className="h-[3px] bg-line rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: fill + "%",
                          background: full ? "var(--ember)" : "var(--amber)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-line grid grid-cols-2 gap-3 text-[12px]">
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wider text-smoke">
                        feedback sett.
                      </div>
                      <div className="text-[14px] mt-0.5">{c.feedback_this_week}</div>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] uppercase tracking-wider text-smoke">
                        risposta media
                      </div>
                      <div className="text-[14px] mt-0.5">{c.avg_response_time ?? "—"}</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-[12px]">
                    <span className="text-smoke group-hover:text-ink transition">Apri team & assegna</span>
                    <Icon name="chevron" size={13} className="text-smoke group-hover:text-ink transition" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
