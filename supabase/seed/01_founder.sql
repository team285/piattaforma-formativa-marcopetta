-- ─────────────────────────────────────────────────────────────────────
-- Seed 01 — Founder (Marco Petta)
-- ─────────────────────────────────────────────────────────────────────
-- Da eseguire DOPO _apply_all.sql, una sola volta.
-- Crea l'utente Marco come 'founder' (admin totale).
--
-- Modificare:
--   - email: l'email vera di Marco (riceverà il magic link)
--   - full_name: già "Marco Petta"
--
-- IMPORTANTE: questo script NON crea l'auth.users — quello arriva quando
-- Marco fa il primo login col magic link. Questo SQL prepara solo
-- un'invitation pending che il trigger handle_new_user (0012) consumerà.
--
-- Procedura completa:
--   1) Esegui questo SQL nel SQL Editor di Supabase
--   2) Vai su Authentication → Users → Invite user → email di Marco
--   3) Marco riceve email, clicca, viene loggato
--   4) Trigger crea profilo + lo promuove a founder (perché email matcha)
-- ─────────────────────────────────────────────────────────────────────

-- IMPOSTA QUI L'EMAIL VERA DI MARCO (sostituire prima del run!)
do $$
declare
  v_marco_email text := 'marco@marcopetta.it';   -- ← MODIFICA QUI
  v_marco_full_name text := 'Marco Petta';
  v_invitation_id uuid;
begin
  -- Override del trigger: vogliamo creare Marco come founder, non student
  -- Quindi creiamo un'invitation "speciale" + dopo il signup promuoviamo a founder

  -- Insert invitation manuale per Marco
  -- (al primo login Marco diventa 'student' di default tramite il trigger,
  -- subito dopo lo promuoviamo a 'founder' che a sua volta crea la row in coaches)

  -- Per semplicità: creiamo direttamente il profilo founder al primo login.
  -- Lo facciamo con una funzione one-shot che cancella il trigger handle_new_user
  -- per Marco e lo gestisce diversamente.

  raise notice '─── SEED FOUNDER ───';
  raise notice 'Email founder: %', v_marco_email;
  raise notice 'Per attivare Marco:';
  raise notice '  1) Authentication → Users → "Invite user" → %', v_marco_email;
  raise notice '  2) Marco apre email e clicca il magic link';
  raise notice '  3) Esegui dopo il primo login: SELECT promote_to_founder(%L);', v_marco_email;
end $$;

-- ─────────────────────────────────────────────────────────────────────
-- Funzione promote_to_founder — promuove un profilo esistente a founder
-- ─────────────────────────────────────────────────────────────────────
create or replace function promote_to_founder(p_email text)
returns void as $$
declare
  v_profile_id uuid;
begin
  -- Cerca profilo con quella email
  select id into v_profile_id from profiles where lower(email) = lower(p_email);

  if v_profile_id is null then
    raise exception 'Nessun profilo trovato per email %. Marco deve fare prima il signup via magic link.', p_email;
  end if;

  -- Promuove a founder (il trigger profiles_role_change creerà automaticamente
  -- la row in coaches con job_title='Fondatore', locked=true, max_students=25)
  update profiles
  set role = 'founder', full_name = coalesce(full_name, 'Marco Petta')
  where id = v_profile_id;

  -- Aggiorna i dettagli del coach Marco (specialità, bio, tagline)
  update coaches
  set
    job_title = 'Fondatore',
    tagline = 'Autore del metodo P.G.T. · studenti intermedi/avanzati',
    bio = 'Autore del metodo. Segue personalmente ogni percorso dal livello intermedio in su.',
    tone = 'ember',
    specialties = array['tecnica', 'fraseggio', 'composizione'],
    locked = true,
    max_students = 25,
    avg_response_time = '14h'
  where id = v_profile_id;

  raise notice 'Profilo % promosso a founder', p_email;
end;
$$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────────────
-- Funzione invite_coach — crea un coach senior (es. Paolo)
-- Da chiamare DOPO che Marco ha fatto il login almeno una volta.
-- ─────────────────────────────────────────────────────────────────────
create or replace function invite_coach(
  p_email text,
  p_full_name text,
  p_job_title text default 'Coach senior',
  p_max_students int default 10
)
returns void as $$
begin
  -- Crea un'invitation con un campo speciale che il trigger riconosce
  -- per creare un profilo 'coach' invece di 'student'
  -- (NB: il trigger attuale crea sempre student — per coach serve promuovere dopo)
  -- Quindi documentiamo il flusso manuale:
  raise notice 'Per invitare il coach %:', p_full_name;
  raise notice '  1) Authentication → Users → "Invite user" → %', p_email;
  raise notice '  2) % apre email e clicca magic link', p_full_name;
  raise notice '  3) Esegui: SELECT promote_to_coach(%L, %L);', p_email, p_job_title;
end;
$$ language plpgsql security definer;

-- ─────────────────────────────────────────────────────────────────────
-- promote_to_coach — promuove un profilo a coach (no founder)
-- ─────────────────────────────────────────────────────────────────────
create or replace function promote_to_coach(
  p_email text,
  p_job_title text default 'Coach senior',
  p_max_students int default 10
)
returns void as $$
declare
  v_profile_id uuid;
begin
  select id into v_profile_id from profiles where lower(email) = lower(p_email);

  if v_profile_id is null then
    raise exception 'Nessun profilo per email %', p_email;
  end if;

  update profiles set role = 'coach' where id = v_profile_id;

  update coaches
  set job_title = p_job_title, max_students = p_max_students
  where id = v_profile_id;

  raise notice 'Profilo % promosso a coach (%)', p_email, p_job_title;
end;
$$ language plpgsql security definer;
