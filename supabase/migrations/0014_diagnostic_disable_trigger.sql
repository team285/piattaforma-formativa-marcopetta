-- ─────────────────────────────────────────────────────────────────────
-- 0014_diagnostic_disable_trigger.sql
-- Test diagnostico: disabilita temporaneamente il trigger handle_new_user
-- per vedere se l'errore "Database error saving new user" sparisce.
--
-- Esegui, poi prova l'invite. Possibili esiti:
--   A) Invite funziona → trigger era il colpevole, lo rifaremo step by step
--   B) Invite fallisce ancora → problema è altrove (RLS, permessi auth, mailer)
-- ─────────────────────────────────────────────────────────────────────

-- 1) Drop trigger e riassocia con un body MINIMALE assoluto
drop trigger if exists on_auth_user_created on auth.users;

create or replace function handle_new_user()
returns trigger as $$
begin
  -- Body completamente vuoto: solo log + return
  raise warning 'handle_new_user invocato per email %', new.email;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2) Test diagnostico: prova INSERT manuale in profiles per vedere se RLS
--    blocca anche da postgres role
do $$
declare
  v_test_id uuid := gen_random_uuid();
begin
  insert into profiles (id, email, full_name, initials, role)
  values (v_test_id, 'test_diagnostic_' || extract(epoch from now()) || '@test.it', 'Test Diag', 'TD', 'student');

  -- Pulizia immediata
  delete from profiles where id = v_test_id;

  raise notice '✓ INSERT manuale in profiles RIUSCITO — RLS non blocca';
exception when others then
  raise notice '✗ INSERT manuale in profiles FALLITO: %', sqlerrm;
end $$;
