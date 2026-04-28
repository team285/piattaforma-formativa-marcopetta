-- ─────────────────────────────────────────────────────────────────────
-- 0005_chat.sql — Chat 1:1 studente ⇄ coach
-- ─────────────────────────────────────────────────────────────────────
-- Modello: ogni coppia studente+coach ha UN thread permanente.
-- Realtime via Supabase channels.
-- ─────────────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────────────
-- chat_threads — un thread per ogni coppia studente-coach
-- ─────────────────────────────────────────────────────────────────────
create table chat_threads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  coach_id uuid not null references coaches (id) on delete restrict,
  last_message_at timestamptz,
  last_message_preview text,                   -- denormalizzato per inbox
  created_at timestamptz not null default now()
);

-- Vincolo: una coppia studente+coach ha un solo thread
create unique index chat_threads_pair_unique
  on chat_threads (student_id, coach_id);

create index chat_threads_coach_idx on chat_threads (coach_id, last_message_at desc);
create index chat_threads_student_idx on chat_threads (student_id);

-- ─────────────────────────────────────────────────────────────────────
-- chat_messages — messaggi del thread
-- ─────────────────────────────────────────────────────────────────────
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references chat_threads (id) on delete cascade,
  sender_id uuid not null references profiles (id),    -- chi ha scritto
  body text not null,
  attachment_storage_path text,                -- bucket "chat-attachments"
  attachment_type text,                        -- 'video' | 'audio' | 'image' | 'file'
  attachment_filename text,
  attachment_duration_seconds int,             -- per video/audio
  created_at timestamptz not null default now(),
  read_at timestamptz                          -- null = non letto dal destinatario
);

create index chat_messages_thread_idx on chat_messages (thread_id, created_at);

-- ─────────────────────────────────────────────────────────────────────
-- chat_unread_counts (view) — non letti per thread, per ogni utente
-- ─────────────────────────────────────────────────────────────────────
create view chat_unread_counts as
select
  m.thread_id,
  m.sender_id,
  count(*) filter (where m.read_at is null) as unread_count
from chat_messages m
group by m.thread_id, m.sender_id;

-- ─────────────────────────────────────────────────────────────────────
-- Trigger: aggiorna last_message_at + preview su chat_threads quando
-- arriva un nuovo messaggio
-- ─────────────────────────────────────────────────────────────────────
create or replace function update_thread_on_message()
returns trigger as $$
begin
  update chat_threads
  set
    last_message_at = new.created_at,
    last_message_preview = case
      when length(new.body) > 80 then substring(new.body for 77) || '...'
      else new.body
    end
  where id = new.thread_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger chat_messages_update_thread
  after insert on chat_messages
  for each row execute function update_thread_on_message();

-- ─────────────────────────────────────────────────────────────────────
-- Realtime: abilita la replica per il pannello Realtime di Supabase
-- ─────────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table chat_messages;
alter publication supabase_realtime add table chat_threads;
