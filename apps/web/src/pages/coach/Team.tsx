/**
 * Coach Team — porting nativo (coach_team.jsx) connesso al DB.
 *
 * Mostra grid dei coach del team (Marco fondatore + Paolo + altri futuri),
 * letta da tabella `coaches` JOIN profiles. Drill-down placeholder.
 */

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
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
  const [team, setTeam] = useState<CoachRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        // Lista coach: JOIN coaches × profiles
        const { data: coachesData, error } = await supabase
          .from("coaches")
          .select(
            `
            id,
            job_title,
            tagline,
            bio,
            tone,
            specialties,
            locked,
            max_students,
            avg_response_time,
            feedback_this_week,
            profile:profiles!inner(full_name,initials,role)
          `
          );
        if (error) {
          console.error("[Team] load error:", error);
          if (!cancelled) setTeam([]);
          return;
        }

        // Per ogni coach, count studenti assegnati attivamente
        const rows: CoachRow[] = await Promise.all(
          (coachesData ?? []).map(async (c) => {
            const { count } = await supabase
              .from("student_coach_assignments")
              .select("*", { count: "exact", head: true })
              .eq("coach_id", c.id as string)
              .eq("status", "active");
            const profile = (c as { profile: { full_name: string; initials: string; role: string } | { full_name: string; initials: string; role: string }[] }).profile;
            const p = Array.isArray(profile) ? profile[0] : profile;
            return {
              id: c.id as string,
              full_name: p?.full_name ?? "—",
              initials: p?.initials ?? "??",
              role: p?.role ?? "coach",
              job_title: (c.job_title as string) ?? "Coach",
              tagline: (c.tagline as string | null) ?? null,
              bio: (c.bio as string | null) ?? null,
              tone: (c.tone as "ink" | "ember" | "sand") ?? "ink",
              specialties: (c.specialties as string[] | null) ?? [],
              locked: !!c.locked,
              max_students: (c.max_students as number) ?? 10,
              avg_response_time: (c.avg_response_time as string | null) ?? null,
              feedback_this_week: (c.feedback_this_week as number) ?? 0,
              students_count: count ?? 0,
            };
          })
        );

        if (!cancelled) setTeam(rows);
      } catch (e) {
        console.error("[Team] exception:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const studentsTotal = team.reduce((acc, c) => acc + c.students_count, 0);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-10 py-10">
        {/* Hero */}
        <div className="flex items-end justify-between pb-6 border-b border-line mb-8">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-2">
              {loading
                ? "Caricamento…"
                : `${team.length} ${team.length === 1 ? "coach attivo" : "coach attivi"} · ${studentsTotal} studenti totali`}
            </div>
            <h1 className="font-editorial text-[56px]">
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

        {/* Empty state */}
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

        {/* Grid coach */}
        {team.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
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
