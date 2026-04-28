-- ─────────────────────────────────────────────────────────────────────
-- 0003_exercises.sql — Esercizi assegnati + take inviate dagli studenti
-- ─────────────────────────────────────────────────────────────────────
-- Flusso: coach assegna esercizio a studente → studente registra take
-- (Supabase Storage video) → coach lascia feedback con annotazioni (0004).
-- ─────────────────────────────────────────────────────────────────────

create type exercise_status as enum ('assigned', 'submitted', 'reviewed', 'skipped');
create type submission_source as enum ('webcam', 'upload', 'mobile_camera');

-- ─────────────────────────────────────────────────────────────────────
-- exercises — esercizio assegnato a uno specifico studente
-- ─────────────────────────────────────────────────────────────────────
create table exercises (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  assigned_by_coach_id uuid not null references coaches (id),
  lesson_id uuid references lessons (id) on delete set null,  -- esercizio collegato a lezione (opzionale)
  title text not null,
  instructions text,                           -- istruzioni del coach allo studente
  bpm int,
  due_date date,
  status exercise_status not null default 'assigned',
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index exercises_student_idx on exercises (student_id, status);
create index exercises_coach_idx on exercises (assigned_by_coach_id);
create index exercises_due_idx on exercises (due_date) where status = 'assigned';

-- ─────────────────────────────────────────────────────────────────────
-- submissions — take inviate (uno studente può fare più tentativi)
-- ─────────────────────────────────────────────────────────────────────
create table submissions (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references exercises (id) on delete cascade,
  student_id uuid not null references students (id) on delete cascade,
  take_number int not null default 1,          -- 1, 2, 3...
  video_storage_path text not null,            -- bucket "submission-videos" (privato)
  thumbnail_storage_path text,                 -- generata client-side dal frame
  duration_seconds int,
  size_bytes bigint,
  source submission_source not null default 'webcam',
  student_note text,                           -- es. "Ho difficoltà al 0:40"
  submitted_at timestamptz not null default now()
);

create index submissions_exercise_idx on submissions (exercise_id, take_number);
create index submissions_student_idx on submissions (student_id, submitted_at desc);

-- Vincolo: take_number unico per esercizio
create unique index submissions_take_unique
  on submissions (exercise_id, take_number);

-- NB: la view `review_queue` (submissions senza feedback) è creata in 0004
-- DOPO la creazione della tabella `feedbacks`. Ordine importa.

-- ─────────────────────────────────────────────────────────────────────
-- Trigger updated_at
-- ─────────────────────────────────────────────────────────────────────
create trigger exercises_updated_at
  before update on exercises
  for each row execute function set_updated_at();
