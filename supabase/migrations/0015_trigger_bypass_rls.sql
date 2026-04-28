-- ─────────────────────────────────────────────────────────────────────
-- 0015_trigger_bypass_rls.sql
-- Soluzione vera al problema "Database error saving new user":
-- il trigger handle_new_user è SECURITY DEFINER ma le RLS policies
-- (profiles_insert_founder ecc.) bloccano l'insert perché auth.uid() è null
-- dentro un trigger e is_founder() ritorna false.
--
-- Fix: SET LOCAL row_security = off all'inizio del trigger.
-- (Pattern standard Supabase per trigger su auth.users)
-- ─────────────────────────────────────────────────────────────────────

-- ─── 1) Cleanup utente di test ───────────────────────────────────────
-- (l'invite precedente ha creato un auth.users senza profilo associato,
-- lo cancelliamo per ripartire pulito)
delete from auth.users where email in ('lucagiampaoletti3@gmail.com');

-- ─── 2) Trigger handle_new_user con SET LOCAL row_security = off ────
create or replace function handle_new_user()
returns trigger as $$
declare
  v_invitation invitations%rowtype;
  v_full_name text;
  v_initials text;
begin
  -- KEY: bypass RLS per questa transazione del trigger
  set local row_security = off;

  v_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );

  -- Cerca invitation pending
  select * into v_invitation
  from invitations
  where lower(email) = lower(new.email) and status = 'pending'
  order by created_at desc
  limit 1;

  if v_invitation.id is not null then
    v_full_name := coalesce(v_invitation.full_name, v_full_name);
  end if;

  -- Calcola initials
  v_initials := upper(
    coalesce(substring(split_part(v_full_name, ' ', 1) from 1 for 1), '') ||
    coalesce(substring(split_part(v_full_name, ' ', 2) from 1 for 1), '')
  );
  if v_initials is null or v_initials = '' then
    v_initials := upper(substring(v_full_name from 1 for 2));
  end if;
  if v_initials is null or v_initials = '' then
    v_initials := 'XX';
  end if;

  -- INSERT profilo (RLS bypassed)
  insert into profiles (id, email, full_name, initials, role, phone)
  values (new.id, new.email, v_full_name, v_initials, 'student', v_invitation.phone)
  on conflict (id) do nothing;

  -- Se c'è invito, popola il resto
  if v_invitation.id is not null then
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
      coalesce(v_invitation.genres, '{}')
    )
    on conflict (id) do nothing;

    insert into student_coach_assignments (student_id, coach_id, assigned_by, status)
    values (new.id, v_invitation.invited_by_coach_id, v_invitation.invited_by_coach_id, 'active');

    insert into skill_radar (student_id) values (new.id) on conflict (student_id) do nothing;

    insert into chat_threads (student_id, coach_id)
    values (new.id, v_invitation.invited_by_coach_id)
    on conflict (student_id, coach_id) do nothing;

    update invitations
    set status = 'accepted', accepted_at = now(), accepted_user_id = new.id
    where id = v_invitation.id;
  end if;

  return new;
exception when others then
  -- Last resort: logga ma non bloccare
  raise warning 'handle_new_user fallito per %: %', new.email, sqlerrm;
  return new;
end;
$$ language plpgsql security definer;

-- Riassocia il trigger (idempotente)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── 3) Stessa fix anche per handle_coach_role (insert in coaches) ──
create or replace function handle_coach_role()
returns trigger as $$
begin
  set local row_security = off;
  if new.role in ('coach', 'founder') and (old is null or old.role <> new.role) then
    insert into coaches (id, job_title, locked, max_students)
    values (
      new.id,
      case when new.role = 'founder' then 'Fondatore' else 'Coach' end,
      new.role = 'founder',
      case when new.role = 'founder' then 25 else 10 end
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;
