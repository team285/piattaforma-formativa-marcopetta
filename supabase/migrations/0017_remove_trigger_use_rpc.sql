-- ─────────────────────────────────────────────────────────────────────
-- 0017_remove_trigger_use_rpc.sql
-- Strategia nuova: drop del trigger handle_new_user (era fragile,
-- causava rollback della transazione di auth.users insert in modo opaco).
--
-- Sostituiamo con una RPC `ensure_profile()` che il frontend chiamerà
-- dopo il primo login. Pattern "lazy profile creation":
--   1) auth.users viene creato pulito da Supabase Auth
--   2) Magic link arriva, utente clicca, viene loggato
--   3) Frontend rileva che non ha profile (query profiles where id = auth.uid())
--   4) Frontend chiama supabase.rpc('ensure_profile') che lo crea
--   5) Tutto via auth.uid() autenticato → funziona con RLS senza tricks
-- ─────────────────────────────────────────────────────────────────────

-- 1) Drop completo del trigger problematico
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists handle_new_user() cascade;

-- 2) Pulizia dati orfani (se ci sono)
delete from auth.users where email like '%lucagiampaoletti%';

-- 3) RPC: ensure_profile (chiamata dal frontend dopo login)
-- Crea profilo + (se invitation pending) popola anche students, assignments, ecc.
create or replace function ensure_profile()
returns json as $$
declare
  v_user_id uuid := auth.uid();
  v_user_email text;
  v_user_meta jsonb;
  v_invitation invitations%rowtype;
  v_full_name text;
  v_initials text;
  v_existing_profile profiles%rowtype;
begin
  -- Validazione: serve un utente autenticato
  if v_user_id is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  -- Profilo esiste già? Restituisci subito.
  select * into v_existing_profile from profiles where id = v_user_id;
  if v_existing_profile.id is not null then
    return json_build_object('ok', true, 'created', false, 'role', v_existing_profile.role);
  end if;

  -- Recupera email e metadata da auth.users
  select email, raw_user_meta_data into v_user_email, v_user_meta
  from auth.users where id = v_user_id;

  v_full_name := coalesce(
    nullif(trim(v_user_meta->>'full_name'), ''),
    split_part(v_user_email, '@', 1)
  );

  -- Cerca invitation pending
  select * into v_invitation
  from invitations
  where lower(email) = lower(v_user_email) and status = 'pending'
  order by created_at desc
  limit 1;

  if v_invitation.id is not null then
    v_full_name := coalesce(v_invitation.full_name, v_full_name);
  end if;

  v_initials := upper(
    coalesce(substring(split_part(v_full_name, ' ', 1) from 1 for 1), '') ||
    coalesce(substring(split_part(v_full_name, ' ', 2) from 1 for 1), '')
  );
  if v_initials is null or v_initials = '' then v_initials := 'XX'; end if;

  -- Crea profilo
  insert into profiles (id, email, full_name, initials, role, phone)
  values (v_user_id, v_user_email, v_full_name, v_initials, 'student', v_invitation.phone);

  -- Se c'è invitation, popola il resto
  if v_invitation.id is not null then
    insert into students (id, level, instrument, path_label, path_start_date, path_end_date, artists_ref, goals, genres)
    values (
      v_user_id,
      coalesce(v_invitation.level, 'Base'),
      coalesce(v_invitation.instrument, 'Chitarra elettrica'),
      case when v_invitation.duration_months is not null then 'Percorso ' || v_invitation.duration_months || ' mesi' else null end,
      v_invitation.start_date,
      case
        when v_invitation.start_date is not null and v_invitation.duration_months is not null
        then v_invitation.start_date + (v_invitation.duration_months || ' months')::interval
        else null
      end,
      v_invitation.artists_ref,
      case when v_invitation.goal is not null then array[v_invitation.goal] else '{}' end,
      coalesce(v_invitation.genres, '{}')
    );

    insert into student_coach_assignments (student_id, coach_id, assigned_by, status)
    values (v_user_id, v_invitation.invited_by_coach_id, v_invitation.invited_by_coach_id, 'active');

    insert into skill_radar (student_id) values (v_user_id);

    insert into chat_threads (student_id, coach_id) values (v_user_id, v_invitation.invited_by_coach_id);

    update invitations
    set status = 'accepted', accepted_at = now(), accepted_user_id = v_user_id
    where id = v_invitation.id;
  end if;

  return json_build_object('ok', true, 'created', true, 'role', 'student');
exception when others then
  return json_build_object('ok', false, 'error', sqlerrm, 'sqlstate', sqlstate);
end;
$$ language plpgsql security definer;

-- Permetti a tutti gli utenti autenticati di chiamare la RPC
grant execute on function ensure_profile() to authenticated;
