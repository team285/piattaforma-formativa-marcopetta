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
