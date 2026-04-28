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
