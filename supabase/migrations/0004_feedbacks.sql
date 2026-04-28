-- ─────────────────────────────────────────────────────────────────────
-- 0004_feedbacks.sql — Feedback del coach su submission
-- ─────────────────────────────────────────────────────────────────────
-- Killer feature: annotazioni al secondo (OK / TIP / WARN / VIDEO)
-- + valutazione su 5 metriche (radar) + eventuale video-risposta del coach.
-- ─────────────────────────────────────────────────────────────────────

create type annotation_type as enum ('ok', 'tip', 'warning', 'video');
create type feedback_status as enum ('draft', 'sent');

-- ─────────────────────────────────────────────────────────────────────
-- feedbacks — un feedback per submission (1:1)
-- ─────────────────────────────────────────────────────────────────────
create table feedbacks (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions (id) on delete cascade unique,
  coach_id uuid not null references coaches (id),
  summary text,                                -- nota riassuntiva del coach
  status feedback_status not null default 'draft',
  sent_at timestamptz,                         -- null se ancora draft
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feedbacks_coach_idx on feedbacks (coach_id, sent_at desc);

-- ─────────────────────────────────────────────────────────────────────
-- annotations — marker al secondo con tipo e nota
-- ─────────────────────────────────────────────────────────────────────
create table annotations (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references feedbacks (id) on delete cascade,
  at_seconds int not null,                     -- es. 24 = 0:24
  annotation_type annotation_type not null,
  note text not null,
  -- Per type='video': allegato video-risposta del coach
  video_storage_path text,                     -- bucket "feedback-videos"
  video_duration_seconds int,
  position int not null default 0,             -- per ordinamento manuale (di solito = at_seconds)
  created_at timestamptz not null default now()
);

create index annotations_feedback_idx on annotations (feedback_id, at_seconds);

-- ─────────────────────────────────────────────────────────────────────
-- feedback_ratings — 5 metriche del radar (Tempo/Tono/Tecnica/Groove/Espressione)
-- ─────────────────────────────────────────────────────────────────────
create table feedback_ratings (
  feedback_id uuid primary key references feedbacks (id) on delete cascade,
  tempo numeric(3,1) not null check (tempo between 0 and 5),
  tono numeric(3,1) not null check (tono between 0 and 5),
  tecnica numeric(3,1) not null check (tecnica between 0 and 5),
  groove numeric(3,1) not null check (groove between 0 and 5),
  espressione numeric(3,1) not null check (espressione between 0 and 5),
  created_at timestamptz not null default now()
);

-- View di comodo: rating medio per feedback
create view feedback_avg_rating as
select
  feedback_id,
  round((tempo + tono + tecnica + groove + espressione) / 5.0, 2) as avg_rating
from feedback_ratings;

-- ─────────────────────────────────────────────────────────────────────
-- skill_radar — mappa competenze studente (6 metriche, slow-moving)
-- Aggiornata aggregando i feedback_ratings nel tempo (edge function nightly)
-- ─────────────────────────────────────────────────────────────────────
create table skill_radar (
  student_id uuid primary key references students (id) on delete cascade,
  ritmica numeric(3,1) not null default 0,
  tecnica numeric(3,1) not null default 0,
  teoria numeric(3,1) not null default 0,
  orecchio numeric(3,1) not null default 0,
  improvvisazione numeric(3,1) not null default 0,
  performance numeric(3,1) not null default 0,
  updated_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
-- bookmarks — capitoli salvati dallo studente
-- ─────────────────────────────────────────────────────────────────────
create table lesson_bookmarks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  lesson_id uuid not null references lessons (id) on delete cascade,
  chapter_id uuid references lesson_chapters (id) on delete cascade,
  at_seconds int,                              -- bookmark a punto specifico se non un capitolo
  note text,                                   -- nota personale dello studente
  created_at timestamptz not null default now()
);

create index lesson_bookmarks_student_idx on lesson_bookmarks (student_id);

-- Vincolo: stesso studente non può bookmark lo stesso capitolo due volte
create unique index lesson_bookmarks_unique
  on lesson_bookmarks (student_id, lesson_id, chapter_id)
  where chapter_id is not null;

-- ─────────────────────────────────────────────────────────────────────
-- review_queue (view) — la coda dei coach
-- Submissions senza feedback associato, ordinate per "in attesa da X ore"
-- (Definita qui invece che in 0003 perché dipende da `feedbacks`)
-- ─────────────────────────────────────────────────────────────────────
create view review_queue as
select
  s.id as submission_id,
  s.exercise_id,
  s.student_id,
  s.video_storage_path,
  s.duration_seconds,
  s.submitted_at,
  e.title as exercise_title,
  e.bpm,
  e.assigned_by_coach_id as coach_id,
  p.full_name as student_name,
  p.initials as student_initials,
  extract(epoch from (now() - s.submitted_at)) / 3600 as hours_waiting
from submissions s
join exercises e on e.id = s.exercise_id
join profiles p on p.id = s.student_id
left join feedbacks f on f.submission_id = s.id
where f.id is null
order by s.submitted_at asc;

-- ─────────────────────────────────────────────────────────────────────
-- Trigger updated_at
-- ─────────────────────────────────────────────────────────────────────
create trigger feedbacks_updated_at
  before update on feedbacks
  for each row execute function set_updated_at();

create trigger skill_radar_updated_at
  before update on skill_radar
  for each row execute function set_updated_at();
