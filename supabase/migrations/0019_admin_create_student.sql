-- ─────────────────────────────────────────────────────────────────────
-- 0019_admin_create_student.sql
-- RPC `admin_create_student` per la drawer "Invita studente" del coach.
--
-- Bypassa magic-link / SMTP (non ancora configurato) creando direttamente:
--  1) record in auth.users con password bcrypt
--  2) record in profiles con role='student'
--  3) record in students con dati percorso
--  4) record in student_coach_assignments
--  5) record in skill_radar (per dashboard analytics)
--  6) record in chat_threads col coach
--
-- Lo studente potrà loggarsi con email + temp password subito.
-- Il coach (founder o coach attivo) chiama via supabase.rpc().
-- ─────────────────────────────────────────────────────────────────────

create or replace function admin_create_student(
  p_email text,
  p_full_name text,
  p_password text,
  p_phone text default null,
  p_level text default 'Base',
  p_instrument text default 'Chitarra elettrica',
  p_duration_months int default null,
  p_start_date date default null,
  p_artists_ref text default null,
  p_genres text[] default '{}'::text[],
  p_notes text default null
)
returns json as $$
declare
  v_caller_id uuid := auth.uid();
  v_caller_role text;
  v_new_user_id uuid := gen_random_uuid();
  v_initials text;
  v_normalized_email text := lower(trim(p_email));
  v_path_label text;
  v_path_end_date date;
begin
  -- 1. Auth: deve essere chiamata da founder o coach
  if v_caller_id is null then
    return json_build_object('ok', false, 'error', 'not_authenticated');
  end if;

  select role into v_caller_role from profiles where id = v_caller_id;
  if v_caller_role not in ('founder', 'coach') then
    return json_build_object('ok', false, 'error', 'unauthorized: only coach/founder');
  end if;

  -- 2. Validazioni input
  if v_normalized_email is null or v_normalized_email = '' or v_normalized_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    return json_build_object('ok', false, 'error', 'email non valida');
  end if;

  if p_password is null or length(p_password) < 8 then
    return json_build_object('ok', false, 'error', 'password troppo corta (min 8 caratteri)');
  end if;

  if p_full_name is null or length(trim(p_full_name)) < 2 then
    return json_build_object('ok', false, 'error', 'nome richiesto');
  end if;

  -- 3. Email già presente?
  if exists (select 1 from auth.users where lower(email) = v_normalized_email) then
    return json_build_object('ok', false, 'error', 'email gia registrata');
  end if;

  -- 4. Calcola initials
  v_initials := upper(
    coalesce(substring(split_part(trim(p_full_name), ' ', 1) from 1 for 1), '') ||
    coalesce(substring(split_part(trim(p_full_name), ' ', 2) from 1 for 1), '')
  );
  if v_initials is null or v_initials = '' then v_initials := 'XX'; end if;

  -- 5. Crea record in auth.users (security definer: ha permesso)
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    is_super_admin,
    is_anonymous
  ) values (
    '00000000-0000-0000-0000-000000000000',
    v_new_user_id,
    'authenticated',
    'authenticated',
    v_normalized_email,
    crypt(p_password, gen_salt('bf', 10)),
    now(),
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', trim(p_full_name)),
    now(),
    now(),
    false,
    false
  );

  -- 6. Crea identity record (necessario per login email/password)
  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) values (
    gen_random_uuid(),
    v_new_user_id,
    jsonb_build_object('sub', v_new_user_id::text, 'email', v_normalized_email),
    'email',
    v_normalized_email,
    null,
    now(),
    now()
  );

  -- 7. Crea profile
  insert into profiles (id, email, full_name, initials, role, phone)
  values (v_new_user_id, v_normalized_email, trim(p_full_name), v_initials, 'student', p_phone);

  -- 8. Crea students con percorso
  v_path_label := case when p_duration_months is not null then 'Percorso ' || p_duration_months || ' mesi' else null end;
  v_path_end_date := case
    when p_start_date is not null and p_duration_months is not null
    then p_start_date + (p_duration_months || ' months')::interval
    else null
  end;

  insert into students (id, level, instrument, path_label, path_start_date, path_end_date, artists_ref, genres)
  values (
    v_new_user_id,
    coalesce(p_level, 'Base'),
    coalesce(p_instrument, 'Chitarra elettrica'),
    v_path_label,
    p_start_date,
    v_path_end_date,
    p_artists_ref,
    coalesce(p_genres, '{}')
  );

  -- 9. Assegna al coach chiamante
  insert into student_coach_assignments (student_id, coach_id, assigned_by, status)
  values (v_new_user_id, v_caller_id, v_caller_id, 'active');

  -- 10. Skill radar vuoto (per analytics)
  begin
    insert into skill_radar (student_id) values (v_new_user_id);
  exception when undefined_table then
    null; -- skill_radar è opzionale
  end;

  -- 11. Chat thread col coach
  begin
    insert into chat_threads (student_id, coach_id) values (v_new_user_id, v_caller_id);
  exception when undefined_table then
    null;
  end;

  -- 12. Crea anche record invitations (status accepted) per audit trail
  insert into invitations (
    email, invited_by_coach_id, full_name, phone,
    instrument, level, duration_months, start_date,
    artists_ref, genres, commercial_notes,
    privacy_gdpr_accepted, status, accepted_at, accepted_user_id
  )
  values (
    v_normalized_email, v_caller_id, trim(p_full_name), p_phone,
    p_instrument, p_level, p_duration_months, p_start_date,
    p_artists_ref, coalesce(p_genres, '{}'), p_notes,
    true, 'accepted', now(), v_new_user_id
  );

  return json_build_object(
    'ok', true,
    'user_id', v_new_user_id,
    'email', v_normalized_email,
    'temp_password', p_password
  );
exception when others then
  return json_build_object('ok', false, 'error', sqlerrm, 'sqlstate', sqlstate);
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function admin_create_student(text, text, text, text, text, text, int, date, text, text[], text) to authenticated;
