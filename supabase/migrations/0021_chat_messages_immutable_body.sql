-- ─────────────────────────────────────────────────────────────────────
-- 0021_chat_messages_immutable_body.sql
-- Hardening RLS chat_messages.
--
-- BUG: la policy chat_messages_update_read permette al destinatario di
-- aggiornare la riga del peer per marcarla come letta. Però senza un
-- WITH CHECK e senza vincolo sulle colonne, lo studente potrebbe
-- modificare anche `body`, `attachment_*`, `sender_id`, ecc. del messaggio
-- del coach (potenziale modifica/falsificazione di conversazioni).
--
-- FIX: trigger BEFORE UPDATE che permette di toccare SOLO `read_at`.
-- Tutti gli altri campi vengono ripristinati al valore precedente.
-- L'autore del messaggio (sender) potrebbe legittimamente modificare
-- altre cose in futuro? Per ora no — i messaggi sono immutabili una
-- volta inviati.
-- ─────────────────────────────────────────────────────────────────────

create or replace function enforce_chat_message_immutability()
returns trigger as $$
begin
  -- Permetti solo l'aggiornamento di read_at. Qualsiasi altro tentativo
  -- di modifica resta silenziosamente ignorato (campi vecchi ripristinati).
  new.thread_id := old.thread_id;
  new.sender_id := old.sender_id;
  new.body := old.body;
  new.attachment_storage_path := old.attachment_storage_path;
  new.attachment_type := old.attachment_type;
  new.attachment_filename := old.attachment_filename;
  new.attachment_duration_seconds := old.attachment_duration_seconds;
  new.created_at := old.created_at;
  return new;
end;
$$ language plpgsql;

drop trigger if exists chat_messages_immutable on chat_messages;
create trigger chat_messages_immutable
  before update on chat_messages
  for each row execute function enforce_chat_message_immutability();

-- Bonus: aggiungiamo anche un WITH CHECK alla policy esistente per
-- garantire che il sender non possa essere "cambiato" (anche se il
-- trigger sopra basta come difesa-in-profondità).
drop policy if exists chat_messages_update_read on chat_messages;
create policy chat_messages_update_read on chat_messages
  for update using (
    exists (
      select 1 from chat_threads t
      where t.id = thread_id
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id)
        and auth.uid() <> sender_id
    )
  ) with check (
    exists (
      select 1 from chat_threads t
      where t.id = thread_id
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id)
        and auth.uid() <> sender_id
    )
  );
