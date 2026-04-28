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
