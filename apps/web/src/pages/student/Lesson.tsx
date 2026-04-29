/**
 * Student Lesson — lista lezioni published della libreria di Marco.
 *
 * Quando lo studente clicca su una lezione, in v2 si aprirà il player dark
 * con tab/note/risorse. Per ora MVP: mostra catalogo della libreria
 * (lessons.status='published'), raggruppato per categoria, con thumb e durata.
 *
 * Empty state quando libreria vuota.
 */

import { useEffect, useState } from "react";
import { supabase, withTimeout } from "../../lib/supabase";
import { EditorialH, Icon, Tag, Thumb, toast } from "../../components/ui";

interface Lesson {
  id: string;
  title: string;
  duration_seconds: number | null;
  views_count: number;
  module_title: string;
  category_title: string;
}

const formatDuration = (s: number | null) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export function StudentLesson() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [catsRes, modsRes, lessonsRes] = await Promise.all([
        withTimeout(
          supabase.from("library_categories").select("id,title,position").order("position"),
          5000,
          { data: [] as Array<{ id: string; title: string; position: number }>, error: null },
          "lesson.cats"
        ),
        withTimeout(
          supabase.from("library_modules").select("id,title,category_id,position").order("position"),
          5000,
          { data: [] as Array<{ id: string; title: string; category_id: string; position: number }>, error: null },
          "lesson.mods"
        ),
        withTimeout(
          supabase
            .from("lessons")
            .select("id,title,duration_seconds,views_count,module_id,status,position")
            .eq("status", "published")
            .order("position"),
          5000,
          { data: [] as Array<{ id: string; title: string; duration_seconds: number | null; views_count: number; module_id: string; status: string; position: number }>, error: null },
          "lesson.lessons"
        ),
      ]);
      if (cancelled) return;

      const catById = new Map<string, string>();
      (catsRes.data ?? []).forEach((c) => catById.set(c.id, c.title));

      const modById = new Map<string, { title: string; category_id: string }>();
      (modsRes.data ?? []).forEach((m) => modById.set(m.id, { title: m.title, category_id: m.category_id }));

      const rows: Lesson[] = (lessonsRes.data ?? []).map((l) => {
        const m = modById.get(l.module_id);
        return {
          id: l.id,
          title: l.title,
          duration_seconds: l.duration_seconds,
          views_count: l.views_count,
          module_title: m?.title ?? "—",
          category_title: m ? catById.get(m.category_id) ?? "—" : "—",
        };
      });
      setLessons(rows);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-12 py-12">
        <div className="mb-10">
          <EditorialH kicker="Le tue lezioni">
            La libreria di <span className="italic-ember">Marco</span>.
          </EditorialH>
          <p className="text-[14px] text-smoke max-w-[560px] mt-3 leading-relaxed">
            Tutte le lezioni che Marco ha pubblicato. Niente scroll infinito di YouTube — ogni lezione
            è scelta e collegata al tuo percorso.
          </p>
        </div>

        {loading ? (
          <div className="bg-paper-2 border border-line rounded-[3px] p-10 text-center text-smoke text-[13px]">
            Caricamento libreria…
          </div>
        ) : lessons.length === 0 ? (
          <div className="bg-paper-2 border border-line rounded-[3px] p-16 text-center">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
              Libreria vuota
            </div>
            <h2 className="font-editorial text-[28px] mb-3">
              Marco non ha ancora <span className="italic-ember">caricato</span> lezioni.
            </h2>
            <p className="text-smoke text-[14px] max-w-md mx-auto leading-relaxed">
              Quando l'upload video sarà attivo (Supabase Storage), qui vedrai tutte le lezioni del
              metodo P.G.T.: tecnica, linguaggio, tempo, brani.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {lessons.map((l) => (
              <button
                key={l.id}
                onClick={() => toast(`Player lezione "${l.title}" · in arrivo`, "info")}
                className="text-left group"
              >
                <Thumb label={`lezione · ${formatDuration(l.duration_seconds)}`} dark aspect="16/10">
                  <div className="absolute top-3 right-3">
                    <div className="w-10 h-10 rounded-full bg-paper/95 flex items-center justify-center text-ink group-hover:bg-[var(--ember)] group-hover:text-white transition">
                      <Icon name="play" size={14} />
                    </div>
                  </div>
                </Thumb>
                <div className="mt-4 flex items-center gap-2 mb-1.5">
                  <Tag>{l.category_title.toLowerCase()}</Tag>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">
                    {l.module_title}
                  </span>
                </div>
                <div className="font-display text-[22px] leading-[1.15] mb-2">{l.title}</div>
                <div className="font-mono text-[10px] text-smoke flex items-center gap-1">
                  <Icon name="eye" size={10} /> {l.views_count}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
