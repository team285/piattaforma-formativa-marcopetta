-- ─────────────────────────────────────────────────────────────────────
-- 0013_fix_trigger_and_views.sql
-- Fix per:
--   1) Trigger handle_new_user fallisce silenzioso → "Database error
--      saving new user". Rifatto in modo difensivo con on conflict +
--      exception handler.
--   2) Views chat_unread_counts / feedback_avg_rating / review_queue
--      sono SECURITY DEFINER per default → Security Advisor warning.
--      Convertite a security_invoker=true (Postgres 15+).
-- ─────────────────────────────────────────────────────────────────────

-- ─── 1) handle_new_user — versione robusta ──────────────────────────
create or replace function handle_new_user()
returns trigger as $$
declare
  v_invitation invitations%rowtype;
  v_full_name text;
  v_initials text;
begin
  -- Default fallback dal nome auth metadata o dalla parte locale dell'email
  v_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );

  -- Cerca invitation pending per questa email (case-insensitive)
  select * into v_invitation
  from invitations
  where lower(email) = lower(new.email) and status = 'pending'
  order by created_at desc
  limit 1;

  -- Se c'è invito, override del nome dal payload dell'invito
  if v_invitation.id is not null then
    v_full_name := coalesce(v_invitation.full_name, v_full_name);
  end if;

  -- Calcola initials da nome (max 2 caratteri, fallback "XX")
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

  -- STEP 1: SEMPRE crea il profilo minimo (default: student)
  -- on conflict do nothing protegge da retry/race
  insert into profiles (id, email, full_name, initials, role, phone)
  values (new.id, new.email, v_full_name, v_initials, 'student',
          coalesce(v_invitation.phone, null))
  on conflict (id) do nothing;

  -- STEP 2: solo se c'è invitation, popola il resto in modo difensivo
  if v_invitation.id is not null then
    begin
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
    exception when others then
      raise warning 'handle_new_user: students insert failed for %: %', new.email, sqlerrm;
    end;

    -- Assignment al coach invitante
    begin
      insert into student_coach_assignments (
        student_id, coach_id, assigned_by, status
      ) values (
        new.id, v_invitation.invited_by_coach_id, v_invitation.invited_by_coach_id, 'active'
      );
    exception when others then
      raise warning 'handle_new_user: assignment insert failed for %: %', new.email, sqlerrm;
    end;

    -- Skill radar (zero iniziale)
    begin
      insert into skill_radar (student_id) values (new.id) on conflict (student_id) do nothing;
    exception when others then
      raise warning 'handle_new_user: skill_radar insert failed for %: %', new.email, sqlerrm;
    end;

    -- Thread chat
    begin
      insert into chat_threads (student_id, coach_id)
      values (new.id, v_invitation.invited_by_coach_id)
      on conflict (student_id, coach_id) do nothing;
    exception when others then
      raise warning 'handle_new_user: chat_thread insert failed for %: %', new.email, sqlerrm;
    end;

    -- Marca invitation accepted (best-effort)
    update invitations
    set status = 'accepted', accepted_at = now(), accepted_user_id = new.id
    where id = v_invitation.id;
  end if;

  return new;
exception when others then
  -- Last resort: logga ma non bloccare la creazione di auth.users
  raise warning 'handle_new_user fallback for %: %', new.email, sqlerrm;
  return new;
end;
$$ language plpgsql security definer;

-- Riassocia il trigger (idempotente)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ─── 2) Views: convert a security_invoker=true ───────────────────────
-- (Postgres 15+: la view applica RLS del caller, non del creator)

alter view chat_unread_counts set (security_invoker = true);
alter view feedback_avg_rating set (security_invoker = true);
alter view review_queue set (security_invoker = true);

-- ─── 3) Permessi espliciti per il trigger ────────────────────────────
-- (Belt-and-suspenders: anche se il trigger è SECURITY DEFINER, garantiamo
-- che postgres role abbia tutti i permessi necessari)
grant insert, update on profiles to postgres;
grant insert, update on students to postgres;
grant insert, update on student_coach_assignments to postgres;
grant insert, update on skill_radar to postgres;
grant insert, update on chat_threads to postgres;
grant update on invitations to postgres;
