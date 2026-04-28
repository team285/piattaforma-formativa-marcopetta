-- ─────────────────────────────────────────────────────────────────────
-- 0011_storage_buckets.sql — Bucket Storage + RLS
-- ─────────────────────────────────────────────────────────────────────
-- Bucket privati (signed URL con TTL):
-- - lesson-videos: video lezioni Marco
-- - submission-videos: take studenti
-- - feedback-videos: video-risposte coach
-- - chat-attachments: media inviati in chat
-- - lesson-resources: PDF/MP3 scaricabili (privati)
--
-- Bucket pubblici (CDN diretta):
-- - lesson-thumbnails: miniature lezioni (visibili nelle card)
-- - avatars: foto profilo (futura)
-- ─────────────────────────────────────────────────────────────────────

-- Crea i bucket (idempotente)
insert into storage.buckets (id, name, public)
values
  ('lesson-videos',       'lesson-videos',       false),
  ('submission-videos',   'submission-videos',   false),
  ('feedback-videos',     'feedback-videos',     false),
  ('chat-attachments',    'chat-attachments',    false),
  ('lesson-resources',    'lesson-resources',    false),
  ('lesson-thumbnails',   'lesson-thumbnails',   true),
  ('avatars',             'avatars',             true)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- Policies storage.objects per bucket
-- ─────────────────────────────────────────────────────────────────────

-- lesson-videos: solo coach/founder upload, solo studenti assegnati possono leggere
-- (in pratica: chiunque autenticato — la lezione è published o no è già gestito a DB level)
create policy "lesson-videos read auth"
  on storage.objects for select
  using (bucket_id = 'lesson-videos' and auth.uid() is not null);

create policy "lesson-videos write founder"
  on storage.objects for insert
  with check (bucket_id = 'lesson-videos' and is_founder());

create policy "lesson-videos update founder"
  on storage.objects for update
  using (bucket_id = 'lesson-videos' and is_founder());

create policy "lesson-videos delete founder"
  on storage.objects for delete
  using (bucket_id = 'lesson-videos' and is_founder());

-- submission-videos: studente carica le proprie, suo coach legge
-- Naming convention: paths come "{student_id}/{exercise_id}/{take_n}.mp4"
create policy "submission-videos read involved"
  on storage.objects for select
  using (
    bucket_id = 'submission-videos'
    and (
      is_founder()
      or (storage.foldername(name))[1] = auth.uid()::text
      or is_coach_of(((storage.foldername(name))[1])::uuid)
    )
  );

create policy "submission-videos write own"
  on storage.objects for insert
  with check (
    bucket_id = 'submission-videos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- feedback-videos: coach upload sulle proprie submission
create policy "feedback-videos read auth"
  on storage.objects for select
  using (bucket_id = 'feedback-videos' and auth.uid() is not null);

create policy "feedback-videos write coach"
  on storage.objects for insert
  with check (
    bucket_id = 'feedback-videos'
    and auth_role() in ('coach', 'founder')
  );

-- chat-attachments: solo i partecipanti del thread
-- Naming convention: paths come "{thread_id}/{filename}"
create policy "chat-attachments read involved"
  on storage.objects for select
  using (
    bucket_id = 'chat-attachments'
    and exists (
      select 1 from chat_threads t
      where t.id::text = (storage.foldername(name))[1]
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id or is_founder())
    )
  );

create policy "chat-attachments write involved"
  on storage.objects for insert
  with check (
    bucket_id = 'chat-attachments'
    and exists (
      select 1 from chat_threads t
      where t.id::text = (storage.foldername(name))[1]
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id)
    )
  );

-- lesson-resources: tutti gli autenticati possono leggere, solo founder upload
create policy "lesson-resources read auth"
  on storage.objects for select
  using (bucket_id = 'lesson-resources' and auth.uid() is not null);

create policy "lesson-resources write founder"
  on storage.objects for insert
  with check (bucket_id = 'lesson-resources' and is_founder());

-- Bucket pubblici (lesson-thumbnails, avatars) hanno read aperto via "public:true"
-- ma serve comunque policy per insert
create policy "lesson-thumbnails write founder"
  on storage.objects for insert
  with check (bucket_id = 'lesson-thumbnails' and is_founder());

create policy "avatars write own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars update own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
