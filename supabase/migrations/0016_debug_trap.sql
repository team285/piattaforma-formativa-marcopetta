-- ─────────────────────────────────────────────────────────────────────
-- 0016_debug_trap.sql
-- Trappola di debug: il trigger logga ogni step in tabella _debug_log
-- così possiamo vedere ESATTAMENTE quale operazione fallisce.
-- ─────────────────────────────────────────────────────────────────────

-- 1) Tabella di debug (RLS disabilitata, accessibile a postgres)
create table if not exists _debug_log (
  id serial primary key,
  ts timestamptz default now(),
  event text,
  data jsonb
);

-- Pulisci i log precedenti
truncate _debug_log;

-- 2) Cleanup utente test (se rimasto)
delete from auth.users where email in ('lucagiampaoletti3@gmail.com');

-- 3) Trigger super-minimale con logging granulare
create or replace function handle_new_user()
returns trigger as $$
declare
  v_full_name text;
begin
  insert into _debug_log (event, data) values (
    'trigger_start',
    jsonb_build_object('user_id', new.id, 'email', new.email, 'meta', new.raw_user_meta_data)
  );

  v_full_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );

  insert into _debug_log (event, data) values (
    'before_profile_insert',
    jsonb_build_object('user_id', new.id, 'full_name', v_full_name)
  );

  begin
    insert into public.profiles (id, email, full_name, initials, role)
    values (new.id, new.email, v_full_name, 'XX', 'student');

    insert into _debug_log (event, data) values (
      'profile_inserted_ok',
      jsonb_build_object('user_id', new.id)
    );
  exception when others then
    insert into _debug_log (event, data) values (
      'profile_insert_FAILED',
      jsonb_build_object(
        'user_id', new.id,
        'sqlstate', sqlstate,
        'error', sqlerrm
      )
    );
    -- Non re-raise, lascia che auth.users venga creato comunque
  end;

  return new;
end;
$$ language plpgsql security definer;

-- 4) Riassocia trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
