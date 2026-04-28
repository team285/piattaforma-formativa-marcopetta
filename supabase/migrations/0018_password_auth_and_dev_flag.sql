-- ─────────────────────────────────────────────────────────────────────
-- 0018_password_auth_and_dev_flag.sql
-- 1) Aggiunge profiles.is_dev (TRUE solo per Luca, ViewSwitch del
--    prototipo visibile solo a chi ha questo flag = vero modo dev)
-- 2) Imposta password bcrypt per Luca (founder, dev) via pgcrypto
-- 3) Riporta esempio per impostare password ad altri utenti in futuro
-- ─────────────────────────────────────────────────────────────────────

-- Estensione necessaria per crypt() bcrypt (di solito già attiva su Supabase)
create extension if not exists pgcrypto;

-- ─── 1) Colonna is_dev su profiles ──────────────────────────────────
alter table profiles add column if not exists is_dev boolean not null default false;

-- Imposta is_dev=true per Luca (l'unico account dev/admin)
update profiles
set is_dev = true
where lower(email) = 'lucagiampaoletti3@gmail.com';

-- ─── 2) Imposta password Luca via auth.users.encrypted_password ────
-- Password generata: MpFounder.LucaG-2026!
-- Usata bcrypt cost factor 10 (default Supabase Auth).
-- Dopo questa update, Luca può loggarsi con email + password.

update auth.users
set encrypted_password = crypt('MpFounder.LucaG-2026!', gen_salt('bf', 10)),
    email_confirmed_at = coalesce(email_confirmed_at, now())
where lower(email) = 'lucagiampaoletti3@gmail.com';

-- ─── 3) Funzione admin per impostare password a un utente esistente ─
-- Marco userà questa (in seguito via UI Settings) per resettare/impostare
-- password agli studenti. Per ora chiamabile solo manualmente da SQL editor.
create or replace function admin_set_password(p_email text, p_new_password text)
returns void as $$
declare
  v_user_id uuid;
begin
  -- Trova utente
  select id into v_user_id from auth.users where lower(email) = lower(p_email);
  if v_user_id is null then
    raise exception 'Utente con email % non trovato', p_email;
  end if;

  -- Validazione minima: password >= 8 caratteri
  if length(p_new_password) < 8 then
    raise exception 'Password troppo corta (min 8 caratteri)';
  end if;

  -- Set password bcrypt + conferma email se non già confermata
  update auth.users
  set encrypted_password = crypt(p_new_password, gen_salt('bf', 10)),
      email_confirmed_at = coalesce(email_confirmed_at, now())
  where id = v_user_id;

  raise notice 'Password impostata per %', p_email;
end;
$$ language plpgsql security definer;

-- ─── Verifica ───────────────────────────────────────────────────────
-- Output di controllo: vediamo che Luca abbia is_dev=true e password set
select
  p.email,
  p.full_name,
  p.role,
  p.is_dev,
  case when u.encrypted_password is not null then 'YES' else 'NO' end as has_password,
  u.email_confirmed_at is not null as email_confirmed
from profiles p
join auth.users u on u.id = p.id;
