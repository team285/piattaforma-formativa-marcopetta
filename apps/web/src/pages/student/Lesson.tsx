/**
 * Student Lesson — catalogo libreria + bookmarks personali.
 *
 * Mostra:
 *  - "I miei bookmarks" (se almeno uno) come sezione in alto
 *  - Catalogo lezioni published, con bottone bookmark cliccabile su ogni card
 *
 * Bookmark = lesson_bookmarks (chapter_id null = bookmark dell'intera lezione).
 * RLS gestisce permessi: studente vede/scrive solo i propri.
 */

import { useEffect, useState } from "react";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { usePageTitle } from "../../lib/hooks";
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
  usePageTitle("Lezioni");
  const { profile } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [catsRes, modsRes, lessonsRes, bookmarksRes] = await Promise.all([
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
        profile?.id
          ? withTimeout(
              supabase
                .from("lesson_bookmarks")
                .select("lesson_id")
                .eq("student_id", profile.id)
                .is("chapter_id", null),
              5000,
              { data: [] as Array<{ lesson_id: string }>, error: null },
              "lesson.bookmarks"
            )
          : Promise.resolve({ data: [] as Array<{ lesson_id: string }>, error: null }),
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
      setBookmarkedIds(new Set((bookmarksRes.data ?? []).map((b) => b.lesson_id)));
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  const toggleBookmark = async (lessonId: string) => {
    if (!profile?.id) return;
    const isBookmarked = bookmarkedIds.has(lessonId);
    if (isBookmarked) {
      const { error } = await supabase
        .from("lesson_bookmarks")
        .delete()
        .eq("student_id", profile.id)
        .eq("lesson_id", lessonId)
        .is("chapter_id", null);
      if (error) {
        toast(`Errore: ${error.message}`, "warn");
        return;
      }
      setBookmarkedIds((cur) => {
        const next = new Set(cur);
        next.delete(lessonId);
        return next;
      });
      toast("Rimosso dai preferiti", "info");
    } else {
      const { error } = await supabase
        .from("lesson_bookmarks")
        .insert({ student_id: profile.id, lesson_id: lessonId });
      if (error) {
        toast(`Errore: ${error.message}`, "warn");
        return;
      }
      setBookmarkedIds((cur) => new Set(cur).add(lessonId));
      toast("Aggiunto ai preferiti", "ok");
    }
  };

  const bookmarked = lessons.filter((l) => bookmarkedIds.has(l.id));

  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1280px] mx-auto px-5 md:px-12 py-8 md:py-12">
        <div className="mb-10">
          <EditorialH kicker="Le tue lezioni">
            La libreria di <span className="italic-ember">Marco</span>.
          </EditorialH>
          <p className="text-[14px] text-smoke max-w-[560px] mt-3 leading-relaxed">
            Tutte le lezioni che Marco ha pubblicato. Niente scroll infinito di YouTube — ogni lezione
            è scelta e collegata al tuo percorso. Salva quelle che vuoi rivedere.
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
              metodo P.G.T.
            </p>
          </div>
        ) : (
          <>
            {/* Sezione bookmarks */}
            {bookmarked.length > 0 && (
              <div className="mb-12">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-4 flex items-center gap-2">
                  <Icon name="bookmark" size={12} /> I tuoi preferiti ({bookmarked.length})
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                  {bookmarked.map((l) => (
                    <LessonCard
                      key={`bm-${l.id}`}
                      lesson={l}
                      isBookmarked
                      onBookmarkToggle={() => toggleBookmark(l.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-4">
              Catalogo · {lessons.length} {lessons.length === 1 ? "lezione" : "lezioni"}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {lessons.map((l) => (
                <LessonCard
                  key={l.id}
                  lesson={l}
                  isBookmarked={bookmarkedIds.has(l.id)}
                  onBookmarkToggle={() => toggleBookmark(l.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  isBookmarked,
  onBookmarkToggle,
}: {
  lesson: Lesson;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
}) {
  return (
    <div className="text-left group relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkToggle();
        }}
        title={isBookmarked ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
        className={
          "absolute top-3 left-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition " +
          (isBookmarked
            ? "bg-[var(--amber)] text-ink hover:bg-[var(--amber-2)]"
            : "bg-paper/80 backdrop-blur-sm text-smoke hover:bg-paper hover:text-ink opacity-0 group-hover:opacity-100")
        }
      >
        <Icon name="bookmark" size={14} />
      </button>
      <button
        type="button"
        onClick={() => toast(`Player lezione "${lesson.title}" · in arrivo`, "info")}
        className="w-full text-left"
      >
        <Thumb label={`lezione · ${formatDuration(lesson.duration_seconds)}`} dark aspect="16/10">
          <div className="absolute top-3 right-3">
            <div className="w-10 h-10 rounded-full bg-paper/95 flex items-center justify-center text-ink group-hover:bg-[var(--ember)] group-hover:text-white transition">
              <Icon name="play" size={14} />
            </div>
          </div>
        </Thumb>
        <div className="mt-4 flex items-center gap-2 mb-1.5">
          <Tag>{lesson.category_title.toLowerCase()}</Tag>
          <span className="font-mono text-[10px] uppercase tracking-wider text-smoke">
            {lesson.module_title}
          </span>
        </div>
        <div className="font-display text-[22px] leading-[1.15] mb-2">{lesson.title}</div>
        <div className="font-mono text-[10px] text-smoke flex items-center gap-1">
          <Icon name="eye" size={10} /> {lesson.views_count}
        </div>
      </button>
    </div>
  );
}
