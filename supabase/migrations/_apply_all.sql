-- ═══════════════════════════════════════════════════════════════════
-- MPCoach — Initial database setup
-- Concatenazione di tutte le migrations 0001-0012 in un unico file.
-- Eseguire UNA SOLA VOLTA su un progetto pulito (Supabase SQL Editor).
-- ═══════════════════════════════════════════════════════════════════


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0001_init.sql
-- ═══════════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────────────────────────────────
-- 0001_init.sql — Schema base: profili, coach, studenti, assegnazioni
-- ─────────────────────────────────────────────────────────────────────
-- Modello dati MPCoach:
-- - `profiles` estende auth.users con ruolo + metadati pubblici
-- - `coaches` aggiunge dettagli specifici dei coach (Marco + Paolo + futuri)
-- - `students` aggiunge dettagli studenti (livello, percorso, progresso)
-- - `student_coach_assignments` traccia chi segue chi nel tempo (storico)
-- ─────────────────────────────────────────────────────────────────────

-- Tipi enum centrali
create type user_role as enum ('student', 'coach', 'founder');
create type coach_tone as enum ('ink', 'ember', 'sand');
create type assignment_status as enum ('active', 'handed_off', 'paused');

-- ─────────────────────────────────────────────────────────────────────
-- profiles — riga creata automaticamente al signup via trigger (vedi 0012)
-- ─────────────────────────────────────────────────────────────────────
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text not null,
  initials text not null,
  role user_role not null default 'student',
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);

-- ─────────────────────────────────────────────────────────────────────
-- coaches — dettagli per chi ha role in ('coach', 'founder')
-- ─────────────────────────────────────────────────────────────────────
create table coaches (
  id uuid primary key references profiles (id) on delete cascade,
  job_title text not null,                     -- es. "Coach senior", "Fondatore"
  tagline text,
  bio text,
  tone coach_tone not null default 'ink',
  specialties text[] not null default '{}',
  locked boolean not null default false,       -- true solo per Marco
  max_students int not null default 10,
  avg_response_time text,                      -- "8h", "14h" — display, non calcolato
  feedback_this_week int not null default 0,   -- aggiornato da edge function nightly
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
-- students — dettagli per chi ha role 'student'
-- ─────────────────────────────────────────────────────────────────────
create table students (
  id uuid primary key references profiles (id) on delete cascade,
  level text not null default 'Base',
  instrument text not null default 'Chitarra elettrica',
  path_label text,                             -- es. "Percorso 6 mesi — Linguaggio & Tempo"
  path_start_date date,
  path_end_date date,
  progress_pct int not null default 0,         -- 0-100, calcolato lato client al display
  flag text,                                   -- es. "1 feedback da fare", "in pausa"
  last_active_at timestamptz,
  artists_ref text,                            -- artisti di riferimento (note didattiche)
  goals text[] not null default '{}',          -- es. ['suonare in band', 'tecnica pura']
  genres text[] not null default '{}',         -- es. ['blues', 'rock']
  internal_notes text,                         -- note private del coach (non visibili allo studente)
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
-- student_coach_assignments — chi segue chi nel tempo
-- Permette storico (assegnato a Paolo dal 2026-01 al 2026-04, poi Marco)
-- ─────────────────────────────────────────────────────────────────────
create table student_coach_assignments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  coach_id uuid not null references coaches (id) on delete restrict,
  assigned_by uuid not null references profiles (id),    -- chi ha fatto l'assegnamento
  status assignment_status not null default 'active',
  started_at timestamptz not null default now(),
  ended_at timestamptz,                                  -- null se ancora attivo
  created_at timestamptz not null default now()
);

create index sca_student_active_idx
  on student_coach_assignments (student_id)
  where status = 'active';

create index sca_coach_active_idx
  on student_coach_assignments (coach_id)
  where status = 'active';

-- Vincolo: ogni studente ha al massimo UN coach attivo alla volta
create unique index sca_one_active_per_student
  on student_coach_assignments (student_id)
  where status = 'active';

-- ─────────────────────────────────────────────────────────────────────
-- Trigger: aggiorna updated_at automaticamente
-- ─────────────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0002_lessons.sql
-- ═══════════════════════════════════════════════════════════════════
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


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0003_exercises.sql
-- ═══════════════════════════════════════════════════════════════════
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


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0004_feedbacks.sql
-- ═══════════════════════════════════════════════════════════════════
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


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0005_chat.sql
-- ═══════════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────────────────────────────────
-- 0005_chat.sql — Chat 1:1 studente ⇄ coach
-- ─────────────────────────────────────────────────────────────────────
-- Modello: ogni coppia studente+coach ha UN thread permanente.
-- Realtime via Supabase channels.
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- chat_threads — un thread per ogni coppia studente-coach
-- ─────────────────────────────────────────────────────────────────────
create table chat_threads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  coach_id uuid not null references coaches (id) on delete restrict,
  last_message_at timestamptz,
  last_message_preview text,                   -- denormalizzato per inbox
  created_at timestamptz not null default now()
);

-- Vincolo: una coppia studente+coach ha un solo thread
create unique index chat_threads_pair_unique
  on chat_threads (student_id, coach_id);

create index chat_threads_coach_idx on chat_threads (coach_id, last_message_at desc);
create index chat_threads_student_idx on chat_threads (student_id);

-- ─────────────────────────────────────────────────────────────────────
-- chat_messages — messaggi del thread
-- ─────────────────────────────────────────────────────────────────────
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads (id) on delete cascade,
  sender_id uuid not null references profiles (id),    -- chi ha scritto
  body text not null,
  attachment_storage_path text,                -- bucket "chat-attachments"
  attachment_type text,                        -- 'video' | 'audio' | 'image' | 'file'
  attachment_filename text,
  attachment_duration_seconds int,             -- per video/audio
  created_at timestamptz not null default now(),
  read_at timestamptz                          -- null = non letto dal destinatario
);

create index chat_messages_thread_idx on chat_messages (thread_id, created_at);

-- ─────────────────────────────────────────────────────────────────────
-- chat_unread_counts (view) — non letti per thread, per ogni utente
-- ─────────────────────────────────────────────────────────────────────
create view chat_unread_counts as
select
  m.thread_id,
  m.sender_id,
  count(*) filter (where m.read_at is null) as unread_count
from chat_messages m
group by m.thread_id, m.sender_id;

-- ─────────────────────────────────────────────────────────────────────
-- Trigger: aggiorna last_message_at + preview su chat_threads quando
-- arriva un nuovo messaggio
-- ─────────────────────────────────────────────────────────────────────
create or replace function update_thread_on_message()
returns trigger as $$
begin
  update chat_threads
  set
    last_message_at = new.created_at,
    last_message_preview = case
      when length(new.body) > 80 then substring(new.body for 77) || '...'
      else new.body
    end
  where id = new.thread_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger chat_messages_update_thread
  after insert on chat_messages
  for each row execute function update_thread_on_message();

-- ─────────────────────────────────────────────────────────────────────
-- Realtime: abilita la replica per il pannello Realtime di Supabase
-- ─────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table chat_threads;


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0006_invitations.sql
-- ═══════════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────────────────────────────────
-- 0006_invitations.sql — Inviti studenti (invite-only access)
-- ─────────────────────────────────────────────────────────────────────
-- Marco vende il coaching offline (gestionale esterno per contratto+pagamento).
-- Da app: apre drawer → registra studente → manda magic link via email.
-- Niente signup pubblica. Niente flussi di pagamento qui.
-- ─────────────────────────────────────────────────────────────────────

create type invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');

create table invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_by_coach_id uuid not null references coaches (id),
  -- Anagrafica raccolta dal drawer (popolerà profiles + students al primo login)
  full_name text not null,
  phone text,
  birth_date date,
  city text,
  -- Profilo musicale
  instrument text,
  level text,
  years_experience int,
  goal text,
  artists_ref text,
  genres text[] not null default '{}',
  -- Piano (durata percorso, NON contratto/pagamento — quelli stanno nel gestionale esterno)
  plan_code text,                              -- "m3" | "m6" | "m12" | "custom"
  duration_months int,
  start_date date,
  -- Source / note commerciali per il CRM didattico
  acquisition_source text,                     -- "Instagram" | "Passaparola" | ...
  commercial_notes text,
  -- Upsell hooks
  interested_masterclass boolean not null default false,
  interested_retreat boolean not null default false,
  available_for_public_takes boolean not null default false,
  upsell_tags text,
  -- Privacy
  privacy_gdpr_accepted boolean not null,
  marketing_consent boolean not null default false,
  -- Stato e tracking
  status invitation_status not null default 'pending',
  accepted_at timestamptz,
  accepted_user_id uuid references profiles (id),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

create index invitations_email_idx on invitations (email);
create index invitations_coach_idx on invitations (invited_by_coach_id, created_at desc);
create index invitations_status_idx on invitations (status) where status = 'pending';

-- Vincolo: una sola invitation pending per email
create unique index invitations_pending_email_unique
  on invitations (email)
  where status = 'pending';


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0010_rls_policies.sql
-- ═══════════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────────────────────────────────
-- 0010_rls_policies.sql — Row Level Security policies
-- ─────────────────────────────────────────────────────────────────────
-- Modello di accesso:
-- - student: vede solo i propri dati + la libreria pubblicata
-- - coach: vede solo gli studenti che ha attualmente assegnati
-- - founder (Marco): accesso totale a tutto
-- - service_role: bypassa RLS (usato da Edge Functions)
--
-- Nota: tutte le tabelle hanno RLS attivo. Senza policy esplicita, nessuno
-- può leggere/scrivere — neanche il proprio user. Quindi serve almeno una
-- policy per ogni tabella per ogni operazione (SELECT/INSERT/UPDATE/DELETE).
-- ─────────────────────────────────────────────────────────────────────

-- Helper functions per policies riutilizzabili
create or replace function auth_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_founder()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'founder'
  );
$$ language sql stable security definer;

create or replace function is_coach_of(target_student_id uuid)
returns boolean as $$
  select exists (
    select 1 from student_coach_assignments
    where student_id = target_student_id
      and coach_id = auth.uid()
      and status = 'active'
  );
$$ language sql stable security definer;

-- ─────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;

-- Tutti gli utenti autenticati possono vedere il proprio profilo
create policy profiles_select_own on profiles
  for select using (auth.uid() = id);

-- I coach vedono i profili degli studenti che seguono
create policy profiles_select_coach_students on profiles
  for select using (
    auth_role() in ('coach', 'founder')
    and (role = 'student' and (is_founder() or is_coach_of(id)))
  );

-- Tutti gli utenti vedono i profili dei coach (servono per "chi mi segue")
create policy profiles_select_coaches on profiles
  for select using (role in ('coach', 'founder'));

-- Solo il founder può creare/modificare/eliminare profili
-- (l'auto-creazione studente avviene via trigger su auth.users, vedi 0012)
create policy profiles_insert_founder on profiles
  for insert with check (is_founder());

create policy profiles_update_own on profiles
  for update using (auth.uid() = id);

create policy profiles_update_founder on profiles
  for update using (is_founder());

create policy profiles_delete_founder on profiles
  for delete using (is_founder());

-- ─────────────────────────────────────────────────────────────────────
-- coaches
-- ─────────────────────────────────────────────────────────────────────
alter table coaches enable row level security;

-- Tutti gli utenti autenticati vedono i coach
create policy coaches_select_all on coaches
  for select using (auth.uid() is not null);

-- Solo il founder gestisce i coach
create policy coaches_modify_founder on coaches
  for all using (is_founder()) with check (is_founder());

-- ─────────────────────────────────────────────────────────────────────
-- students
-- ─────────────────────────────────────────────────────────────────────
alter table students enable row level security;

create policy students_select_own on students
  for select using (auth.uid() = id);

create policy students_select_their_coach on students
  for select using (is_founder() or is_coach_of(id));

create policy students_update_own on students
  for update using (auth.uid() = id);

create policy students_update_their_coach on students
  for update using (is_founder() or is_coach_of(id));

create policy students_modify_founder on students
  for all using (is_founder()) with check (is_founder());

-- ─────────────────────────────────────────────────────────────────────
-- student_coach_assignments
-- ─────────────────────────────────────────────────────────────────────
alter table student_coach_assignments enable row level security;

create policy sca_select_involved on student_coach_assignments
  for select using (
    is_founder()
    or auth.uid() = student_id
    or auth.uid() = coach_id
  );

-- Solo il founder può assegnare/spostare studenti
create policy sca_modify_founder on student_coach_assignments
  for all using (is_founder()) with check (is_founder());

-- ─────────────────────────────────────────────────────────────────────
-- lessons + library tree
-- ─────────────────────────────────────────────────────────────────────
alter table library_categories enable row level security;
alter table library_modules enable row level security;
alter table lessons enable row level security;
alter table lesson_chapters enable row level security;
alter table lesson_resources enable row level security;
alter table lesson_views enable row level security;
alter table lesson_bookmarks enable row level security;

-- Tutti gli utenti vedono il tree della libreria
create policy library_categories_select on library_categories
  for select using (auth.uid() is not null);

create policy library_modules_select on library_modules
  for select using (auth.uid() is not null);

-- Lezioni: solo published per studenti, tutto per coach/founder
create policy lessons_select_published on lessons
  for select using (
    status = 'published'
    or auth_role() in ('coach', 'founder')
  );

create policy lesson_chapters_select on lesson_chapters
  for select using (auth.uid() is not null);

create policy lesson_resources_select on lesson_resources
  for select using (auth.uid() is not null);

-- Solo founder gestisce la libreria
create policy library_categories_modify on library_categories
  for all using (is_founder()) with check (is_founder());

create policy library_modules_modify on library_modules
  for all using (is_founder()) with check (is_founder());

create policy lessons_modify on lessons
  for all using (is_founder()) with check (is_founder());

create policy lesson_chapters_modify on lesson_chapters
  for all using (is_founder()) with check (is_founder());

create policy lesson_resources_modify on lesson_resources
  for all using (is_founder()) with check (is_founder());

-- lesson_views: studente vede e scrive le proprie, coach vede quelle dei suoi
create policy lesson_views_select_own on lesson_views
  for select using (
    auth.uid() = student_id
    or is_founder()
    or is_coach_of(student_id)
  );

create policy lesson_views_insert_own on lesson_views
  for insert with check (auth.uid() = student_id);

create policy lesson_views_update_own on lesson_views
  for update using (auth.uid() = student_id);

-- lesson_bookmarks: solo lo studente
create policy lesson_bookmarks_select_own on lesson_bookmarks
  for select using (auth.uid() = student_id);

create policy lesson_bookmarks_modify_own on lesson_bookmarks
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- ─────────────────────────────────────────────────────────────────────
-- exercises + submissions
-- ─────────────────────────────────────────────────────────────────────
alter table exercises enable row level security;
alter table submissions enable row level security;

-- Studente vede i propri esercizi, il suo coach pure, founder tutto
create policy exercises_select_own on exercises
  for select using (
    auth.uid() = student_id
    or is_founder()
    or is_coach_of(student_id)
  );

-- Solo il coach può creare/modificare esercizi (e il founder)
create policy exercises_modify_coach on exercises
  for all using (
    is_founder()
    or (auth.uid() = assigned_by_coach_id and is_coach_of(student_id))
  ) with check (
    is_founder()
    or (auth.uid() = assigned_by_coach_id and is_coach_of(student_id))
  );

-- Submissions: studente vede le proprie, coach quelle dei suoi studenti
create policy submissions_select_own on submissions
  for select using (
    auth.uid() = student_id
    or is_founder()
    or is_coach_of(student_id)
  );

create policy submissions_insert_own on submissions
  for insert with check (auth.uid() = student_id);

-- Lo studente non può modificare/cancellare le proprie submission una volta inviate
-- (per integrità dei feedback associati)

-- ─────────────────────────────────────────────────────────────────────
-- feedbacks + annotations + ratings
-- ─────────────────────────────────────────────────────────────────────
alter table feedbacks enable row level security;
alter table annotations enable row level security;
alter table feedback_ratings enable row level security;
alter table skill_radar enable row level security;

-- Lo studente vede i feedback sulle sue submission (solo se status='sent')
create policy feedbacks_select_student on feedbacks
  for select using (
    status = 'sent'
    and exists (
      select 1 from submissions s where s.id = submission_id and s.student_id = auth.uid()
    )
  );

-- Coach vede i propri feedback (anche draft) + founder tutto
create policy feedbacks_select_coach on feedbacks
  for select using (auth.uid() = coach_id or is_founder());

create policy feedbacks_modify_coach on feedbacks
  for all using (auth.uid() = coach_id or is_founder())
  with check (auth.uid() = coach_id or is_founder());

-- Annotations: stessa logica del feedback parent
create policy annotations_select on annotations
  for select using (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id
        and (
          (f.status = 'sent' and exists (
            select 1 from submissions s where s.id = f.submission_id and s.student_id = auth.uid()
          ))
          or auth.uid() = f.coach_id
          or is_founder()
        )
    )
  );

create policy annotations_modify_coach on annotations
  for all using (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id and (auth.uid() = f.coach_id or is_founder())
    )
  ) with check (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id and (auth.uid() = f.coach_id or is_founder())
    )
  );

-- feedback_ratings: stessa logica
create policy feedback_ratings_select on feedback_ratings
  for select using (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id
        and (
          (f.status = 'sent' and exists (
            select 1 from submissions s where s.id = f.submission_id and s.student_id = auth.uid()
          ))
          or auth.uid() = f.coach_id
          or is_founder()
        )
    )
  );

create policy feedback_ratings_modify on feedback_ratings
  for all using (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id and (auth.uid() = f.coach_id or is_founder())
    )
  ) with check (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id and (auth.uid() = f.coach_id or is_founder())
    )
  );

-- skill_radar: studente vede il proprio, coach dei propri, founder tutto
create policy skill_radar_select on skill_radar
  for select using (
    auth.uid() = student_id
    or is_founder()
    or is_coach_of(student_id)
  );

create policy skill_radar_modify on skill_radar
  for all using (is_founder() or is_coach_of(student_id))
  with check (is_founder() or is_coach_of(student_id));

-- ─────────────────────────────────────────────────────────────────────
-- chat_threads + chat_messages
-- ─────────────────────────────────────────────────────────────────────
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;

create policy chat_threads_select on chat_threads
  for select using (
    is_founder()
    or auth.uid() = student_id
    or auth.uid() = coach_id
  );

create policy chat_threads_insert on chat_threads
  for insert with check (is_founder() or auth.uid() = coach_id);

create policy chat_messages_select on chat_messages
  for select using (
    exists (
      select 1 from chat_threads t
      where t.id = thread_id
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id or is_founder())
    )
  );

create policy chat_messages_insert on chat_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from chat_threads t
      where t.id = thread_id
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id)
    )
  );

create policy chat_messages_update_read on chat_messages
  for update using (
    exists (
      select 1 from chat_threads t
      where t.id = thread_id
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id)
        and auth.uid() <> sender_id  -- solo il destinatario può marcare come letto
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- invitations — solo founder/coach gestiscono, nessuno legge da frontend
-- ─────────────────────────────────────────────────────────────────────
alter table invitations enable row level security;

create policy invitations_select_coach on invitations
  for select using (
    is_founder() or auth.uid() = invited_by_coach_id
  );

create policy invitations_modify_coach on invitations
  for all using (is_founder() or auth.uid() = invited_by_coach_id)
  with check (is_founder() or auth.uid() = invited_by_coach_id);


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0011_storage_buckets.sql
-- ═══════════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────────────────────────────────
-- 0011_storage_buckets.sql — Bucket Storage + RLS
-- ─────────────────────────────────────────────────────────────────────
-- Bucket privati (signed URL con TTL):
-- - lesson-videos: video lezioni Marco
-- - submission-videos: take studenti
-- - feedback-videos: video-risposte coach
-- - chat-attachments: media inviati in chat
-- - lesson-resources: PDF/MP3 scaricabili (privati)
--
-- Bucket pubblici (CDN diretta):
-- - lesson-thumbnails: miniature lezioni (visibili nelle card)
-- - avatars: foto profilo (futura)
-- ─────────────────────────────────────────────────────────────────────

-- Crea i bucket (idempotente)
insert into storage.buckets (id, name, public)
values
  ('lesson-videos',       'lesson-videos',       false),
  ('submission-videos',   'submission-videos',   false),
  ('feedback-videos',     'feedback-videos',     false),
  ('chat-attachments',    'chat-attachments',    false),
  ('lesson-resources',    'lesson-resources',    false),
  ('lesson-thumbnails',   'lesson-thumbnails',   true),
  ('avatars',             'avatars',             true)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Policies storage.objects per bucket
-- ─────────────────────────────────────────────────────────────────────

-- lesson-videos: solo coach/founder upload, solo studenti assegnati possono leggere
-- (in pratica: chiunque autenticato — la lezione è published o no è già gestito a DB level)
create policy "lesson-videos read auth"
  on storage.objects for select
  using (bucket_id = 'lesson-videos' and auth.uid() is not null);

create policy "lesson-videos write founder"
  on storage.objects for insert
  with check (bucket_id = 'lesson-videos' and is_founder());

create policy "lesson-videos update founder"
  on storage.objects for update
  using (bucket_id = 'lesson-videos' and is_founder());

create policy "lesson-videos delete founder"
  on storage.objects for delete
  using (bucket_id = 'lesson-videos' and is_founder());

-- submission-videos: studente carica le proprie, suo coach legge
-- Naming convention: paths come "{student_id}/{exercise_id}/{take_n}.mp4"
create policy "submission-videos read involved"
  on storage.objects for select
  using (
    bucket_id = 'submission-videos'
    and (
      is_founder()
      or (storage.foldername(name))[1] = auth.uid()::text
      or is_coach_of(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "submission-videos write own"
  on storage.objects for insert
  with check (
    bucket_id = 'submission-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- feedback-videos: coach upload sulle proprie submission
create policy "feedback-videos read auth"
  on storage.objects for select
  using (bucket_id = 'feedback-videos' and auth.uid() is not null);

create policy "feedback-videos write coach"
  on storage.objects for insert
  with check (
    bucket_id = 'feedback-videos'
    and auth_role() in ('coach', 'founder')
  );

-- chat-attachments: solo i partecipanti del thread
-- Naming convention: paths come "{thread_id}/{filename}"
create policy "chat-attachments read involved"
  on storage.objects for select
  using (
    bucket_id = 'chat-attachments'
    and exists (
      select 1 from chat_threads t
      where t.id::text = (storage.foldername(name))[1]
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id or is_founder())
    )
  );

create policy "chat-attachments write involved"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-attachments'
    and exists (
      select 1 from chat_threads t
      where t.id::text = (storage.foldername(name))[1]
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id)
    )
  );

-- lesson-resources: tutti gli autenticati possono leggere, solo founder upload
create policy "lesson-resources read auth"
  on storage.objects for select
  using (bucket_id = 'lesson-resources' and auth.uid() is not null);

create policy "lesson-resources write founder"
  on storage.objects for insert
  with check (bucket_id = 'lesson-resources' and is_founder());

-- Bucket pubblici (lesson-thumbnails, avatars) hanno read aperto via "public:true"
-- ma serve comunque policy per insert
create policy "lesson-thumbnails write founder"
  on storage.objects for insert
  with check (bucket_id = 'lesson-thumbnails' and is_founder());

create policy "avatars write own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars update own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- ═══════════════════════════════════════════════════════════════════
-- FILE: 0012_triggers.sql
-- ═══════════════════════════════════════════════════════════════════
-- ─────────────────────────────────────────────────────────────────────
-- 0012_triggers.sql — Automazioni server-side
-- ─────────────────────────────────────────────────────────────────────
-- 1) Quando viene creato un auth.users (= signup completato via magic link):
--    a) Crea row in profiles (con ruolo + nome dall'invito)
--    b) Se ruolo = student, crea row in students + assignment al coach invitante
--    c) Marca l'invitation come 'accepted'
--
-- 2) Quando il founder cambia il ruolo di un profilo a 'coach', crea la row
--    corrispondente in coaches (idempotente).
--
-- 3) Helper: deriva initials dal nome
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- Helper: estrai initials da full_name ("Luca Bianchi" → "LB")
-- ─────────────────────────────────────────────────────────────────────
create or replace function derive_initials(full_name text)
returns text as $$
  select upper(
    coalesce(substring(split_part(full_name, ' ', 1) from 1 for 1), '') ||
    coalesce(substring(split_part(full_name, ' ', 2) from 1 for 1), '')
  );
$$ language sql immutable;

-- ─────────────────────────────────────────────────────────────────────
-- Trigger: handle_new_user
-- Cerca l'invitation associata all'email, crea profiles + students,
-- e collega l'assignment al coach invitante.
-- ─────────────────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
declare
  v_invitation invitations%rowtype;
  v_full_name text;
  v_initials text;
begin
  -- Cerca invitation pending per questa email
  select * into v_invitation
  from invitations
  where lower(email) = lower(new.email) and status = 'pending'
  order by created_at desc
  limit 1;

  if v_invitation.id is null then
    -- Nessun invito? Crea un profilo "orfano" — il founder dovrà attivarlo
    -- (o si può rifiutare il signup, decidere in seguito)
    v_full_name := coalesce(new.raw_user_meta_data->>'full_name', new.email);
    v_initials := derive_initials(v_full_name);

    insert into profiles (id, email, full_name, initials, role)
    values (new.id, new.email, v_full_name, v_initials, 'student');

    return new;
  end if;

  -- Invito trovato: popola profilo da dati invito
  v_full_name := v_invitation.full_name;
  v_initials := derive_initials(v_full_name);

  insert into profiles (id, email, full_name, initials, role, phone)
  values (new.id, new.email, v_full_name, v_initials, 'student', v_invitation.phone);

  insert into students (
    id, level, instrument, path_label, path_start_date, path_end_date,
    artists_ref, goals, genres
  ) values (
    new.id,
    coalesce(v_invitation.level, 'Base'),
    coalesce(v_invitation.instrument, 'Chitarra elettrica'),
    case
      when v_invitation.duration_months is not null
      then 'Percorso ' || v_invitation.duration_months || ' mesi'
      else null
    end,
    v_invitation.start_date,
    case
      when v_invitation.start_date is not null and v_invitation.duration_months is not null
      then v_invitation.start_date + (v_invitation.duration_months || ' months')::interval
      else null
    end,
    v_invitation.artists_ref,
    case when v_invitation.goal is not null then array[v_invitation.goal] else '{}' end,
    v_invitation.genres
  );

  -- Crea assignment al coach invitante
  insert into student_coach_assignments (
    student_id, coach_id, assigned_by, status
  ) values (
    new.id,
    v_invitation.invited_by_coach_id,
    v_invitation.invited_by_coach_id,
    'active'
  );

  -- Inizializza skill_radar (tutti zero)
  insert into skill_radar (student_id) values (new.id);

  -- Marca l'invitation come accepted
  update invitations
  set status = 'accepted', accepted_at = now(), accepted_user_id = new.id
  where id = v_invitation.id;

  -- Crea il thread chat con il coach invitante
  insert into chat_threads (student_id, coach_id)
  values (new.id, v_invitation.invited_by_coach_id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─────────────────────────────────────────────────────────────────────
-- Trigger: handle_role_promoted_to_coach
-- Quando un profilo viene promosso a 'coach' o 'founder', crea row in coaches
-- ─────────────────────────────────────────────────────────────────────
create or replace function handle_coach_role()
returns trigger as $$
begin
  if new.role in ('coach', 'founder') and (old is null or old.role <> new.role) then
    insert into coaches (id, job_title, locked, max_students)
    values (
      new.id,
      case when new.role = 'founder' then 'Fondatore' else 'Coach' end,
      new.role = 'founder',  -- founder è locked
      case when new.role = 'founder' then 25 else 10 end
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger profiles_role_change
  after insert or update of role on profiles
  for each row execute function handle_coach_role();

-- ─────────────────────────────────────────────────────────────────────
-- Trigger updated_at su students
-- ─────────────────────────────────────────────────────────────────────
create trigger students_updated_at
  before update on students
  for each row execute function set_updated_at();

