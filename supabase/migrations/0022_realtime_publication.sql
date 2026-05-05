-- ─────────────────────────────────────────────────────────────────────
-- 0022_realtime_publication.sql
-- Aggiunge submissions, exercises, feedbacks alla publication realtime.
--
-- Bug: il client (NotificationsProvider) tenta di subscrivere a
-- postgres_changes su queste 3 tabelle ma falliscono con WebSocket error
-- perché non sono nella publication. Risultato: niente notifiche realtime
-- per "nuova take da correggere", "nuovo feedback", "nuovo esercizio
-- assegnato" + spam errori in console.
--
-- chat_messages e chat_threads erano già in publication da 0005.
-- ─────────────────────────────────────────────────────────────────────

-- DO block per gestire idempotenza: se la tabella è già membro,
-- ALTER PUBLICATION ADD TABLE solleva errore. Il blocco lo ignora.

do $$
begin
  alter publication supabase_realtime add table submissions;
exception when duplicate_object then
  null; -- già in publication, ok
end $$;

do $$
begin
  alter publication supabase_realtime add table exercises;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table feedbacks;
exception when duplicate_object then
  null;
end $$;

-- Annotations e feedback_ratings: utili per realtime live updates durante
-- review. Per ora lo studente non li ascolta (riceve l'UPDATE su feedbacks
-- quando status='sent' e ricarica), ma un domani potrebbe.

do $$
begin
  alter publication supabase_realtime add table annotations;
exception when duplicate_object then
  null;
end $$;
