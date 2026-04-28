-- ─────────────────────────────────────────────────────────────────────
-- 0002_lessons.sql — Libreria didattica (IP di Marco)
-- ─────────────────────────────────────────────────────────────────────
-- Struttura tree: categorie → moduli → lezioni
-- Le lezioni hanno video (Supabase Storage), capitoli, risorse scaricabili.
-- ─────────────────────────────────────────────────────────────────────

create type lesson_status as enum ('draft', 'published', 'archived');

-- ─────────────────────────────────────────────────────────────────────
-- library_categories — primo livello (es. "Tecnica", "Linguaggio", "Tempo & Groove")
-- ─────────────────────────────────────────────────────────────────────
create table library_categories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  position int not null default 0,             -- ordinamento manuale
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
-- library_modules — secondo livello (es. "Mano destra", "Blues", "Modale")
-- ─────────────────────────────────────────────────────────────────────
create table library_modules (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references library_categories (id) on delete cascade,
  title text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create index library_modules_category_idx on library_modules (category_id);

-- ─────────────────────────────────────────────────────────────────────
-- lessons — terzo livello, contenuto effettivo
-- ─────────────────────────────────────────────────────────────────────
create table lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references library_modules (id) on delete restrict,
  title text not null,
  description text,
  duration_seconds int,                        -- es. 24*60+10 = 1450
  level text,                                  -- "Base" | "Intermedio" | "Avanzato"
  thumbnail_storage_path text,                 -- bucket "lesson-thumbnails"
  video_storage_path text,                     -- bucket "lesson-videos" (privato)
  status lesson_status not null default 'draft',
  created_by uuid not null references coaches (id),
  published_at timestamptz,
  views_count int not null default 0,          -- denormalizzato per leaderboard
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lessons_module_idx on lessons (module_id);
create index lessons_status_idx on lessons (status) where status = 'published';

-- ─────────────────────────────────────────────────────────────────────
-- lesson_chapters — capitoli all'interno di una lezione (timestamp + titolo)
-- ─────────────────────────────────────────────────────────────────────
create table lesson_chapters (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons (id) on delete cascade,
  position int not null,
  start_seconds int not null,
  title text not null,
  created_at timestamptz not null default now()
);

create index lesson_chapters_lesson_idx on lesson_chapters (lesson_id, position);

-- ─────────────────────────────────────────────────────────────────────
-- lesson_resources — file scaricabili (PDF tab, mp3 backing track, etc.)
-- ─────────────────────────────────────────────────────────────────────
create table lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons (id) on delete cascade,
  filename text not null,                      -- es. "polso-libero-tab.pdf"
  storage_path text not null,                  -- bucket "lesson-resources"
  size_bytes bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index lesson_resources_lesson_idx on lesson_resources (lesson_id);

-- ─────────────────────────────────────────────────────────────────────
-- lesson_views — log di chi ha guardato cosa, per analytics
-- ─────────────────────────────────────────────────────────────────────
create table lesson_views (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references lessons (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  watched_seconds int not null default 0,      -- quanto guardato
  completed boolean not null default false,
  last_position_seconds int not null default 0,
  viewed_at timestamptz not null default now()
);

create index lesson_views_student_idx on lesson_views (student_id, viewed_at desc);
create index lesson_views_lesson_idx on lesson_views (lesson_id);

-- ─────────────────────────────────────────────────────────────────────
-- Trigger updated_at su lessons
-- ─────────────────────────────────────────────────────────────────────
create trigger lessons_updated_at
  before update on lessons
  for each row execute function set_updated_at();
