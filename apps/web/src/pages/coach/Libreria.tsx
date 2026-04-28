/**
 * Coach Libreria — porting parziale: tree dal DB ma senza UI di gestione (per ora).
 */

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { EditorialH, EmberButton, Icon, Tag, Thumb, toast } from "../../components/ui";

interface Lesson {
  id: string;
  title: string;
  duration_seconds: number | null;
  views_count: number;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Category {
  id: string;
  title: string;
  modules: Module[];
}

const formatDuration = (s: number | null) => {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

export function CoachLibreria() {
  const [tree, setTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data: cats } = await supabase
          .from("library_categories")
          .select("id,title,position")
          .order("position");
        if (cancelled) return;

        const { data: mods } = await supabase
          .from("library_modules")
          .select("id,title,position,category_id")
          .order("position");

        const { data: lessons } = await supabase
          .from("lessons")
          .select("id,title,duration_seconds,views_count,module_id,status")
          .eq("status", "published");

        if (cancelled) return;

        const cs = (cats ?? []).map((c) => ({
          id: c.id as string,
          title: c.title as string,
          modules: ((mods ?? []) as Array<{ id: string; title: string; category_id: string }>)
            .filter((m) => m.category_id === c.id)
            .map((m) => ({
              id: m.id,
              title: m.title,
              lessons: ((lessons ?? []) as Array<{ id: string; title: string; duration_seconds: number | null; views_count: number; module_id: string }>)
                .filter((l) => l.module_id === m.id)
                .map((l) => ({
                  id: l.id,
                  title: l.title,
                  duration_seconds: l.duration_seconds,
                  views_count: l.views_count,
                })),
            })),
        }));
        setTree(cs);
      } catch (e) {
        console.error("[Libreria] load:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const totalLessons = tree.reduce((acc, c) => acc + c.modules.reduce((a, m) => a + m.lessons.length, 0), 0);

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1400px] mx-auto px-10 py-8">
        <div className="flex items-end justify-between mb-2">
          <EditorialH kicker="La tua libreria">
            L'<span className="italic-ember">IP</span> di Marco
          </EditorialH>
          <EmberButton
            icon="plus"
            onClick={() => toast("Caricamento lezione · richiede backend video", "info")}
          >
            Carica nuova lezione
          </EmberButton>
        </div>

        {loading ? (
          <div className="bg-paper-2 border border-line rounded-[3px] p-10 text-center text-smoke text-[13px] mt-8">
            Caricamento libreria…
          </div>
        ) : totalLessons === 0 ? (
          <div className="bg-paper-2 border border-line rounded-[3px] p-16 text-center mt-8">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
              Libreria vuota
            </div>
            <h2 className="font-editorial text-[28px] mb-3">
              Nessuna <span className="italic-ember">lezione</span> caricata.
            </h2>
            <p className="text-smoke text-[14px] max-w-md mx-auto leading-relaxed">
              La libreria delle lezioni è vuota. Quando configureremo l'upload video (Supabase Storage),
              potrai caricare le tue lezioni qui — categorie, moduli, capitoli e risorse scaricabili.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {tree.map((c) => (
              <div key={c.id} className="bg-paper-2 border border-line rounded-[3px] p-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
                  {c.title}
                </div>
                {c.modules.map((m) => (
                  <div key={m.id} className="mb-4">
                    <div className="font-display text-[18px] mb-2">{m.title}</div>
                    <div className="grid grid-cols-3 gap-3">
                      {m.lessons.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => toast(`Anteprima: ${l.title}`, "info")}
                          className="cursor-pointer group"
                        >
                          <Thumb label={`lezione · ${formatDuration(l.duration_seconds)}`} dark aspect="16/10">
                            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-paper/95 flex items-center justify-center text-ink opacity-0 group-hover:opacity-100 transition">
                              <Icon name="play" size={12} />
                            </div>
                          </Thumb>
                          <div className="mt-3 flex items-center justify-between mb-1">
                            <Tag>{c.title.toLowerCase()}</Tag>
                            <span className="font-mono text-[10px] text-smoke flex items-center gap-1">
                              <Icon name="eye" size={10} /> {l.views_count}
                            </span>
                          </div>
                          <div className="font-display text-[18px] leading-tight">{l.title}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
