-- ─────────────────────────────────────────────────────────────────────
-- 0020_fix_review_queue.sql
-- Fix bug: la review_queue escludeva submissions con feedback in DRAFT.
-- Marco apre una take, lascia un draft e poi torna indietro → la take
-- spariva dalla coda anche se non era stata pubblicata.
--
-- Nuova logica: la take è in coda finché non c'è un feedback con
-- status='sent'. I draft non la rimuovono dalla coda.
-- ─────────────────────────────────────────────────────────────────────

drop view if exists review_queue;

create view review_queue as
select
  s.id as submission_id,
  s.exercise_id,
  s.student_id,
  s.video_storage_path,
  s.duration_seconds,
  s.submitted_at,
  e.title as exercise_title,
  e.bpm,
  e.assigned_by_coach_id as coach_id,
  p.full_name as student_name,
  p.initials as student_initials,
  extract(epoch from (now() - s.submitted_at)) / 3600 as hours_waiting,
  -- expose se c'è già un draft del feedback (utile per il client)
  (f.id is not null and f.status = 'draft') as has_draft
from submissions s
join exercises e on e.id = s.exercise_id
join profiles p on p.id = s.student_id
left join feedbacks f on f.submission_id = s.id
where f.id is null or f.status = 'draft'
order by s.submitted_at asc;
