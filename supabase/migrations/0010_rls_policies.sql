-- ─────────────────────────────────────────────────────────────────────
-- 0010_rls_policies.sql — Row Level Security policies
-- ─────────────────────────────────────────────────────────────────────
-- Modello di accesso:
-- - student: vede solo i propri dati + la libreria pubblicata
-- - coach: vede solo gli studenti che ha attualmente assegnati
-- - founder (Marco): accesso totale a tutto
-- - service_role: bypassa RLS (usato da Edge Functions)
--
-- Nota: tutte le tabelle hanno RLS attivo. Senza policy esplicita, nessuno
-- può leggere/scrivere — neanche il proprio user. Quindi serve almeno una
-- policy per ogni tabella per ogni operazione (SELECT/INSERT/UPDATE/DELETE).
-- ─────────────────────────────────────────────────────────────────────

-- Helper functions per policies riutilizzabili
create or replace function auth_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql stable security definer;

create or replace function is_founder()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'founder'
  );
$$ language sql stable security definer;

create or replace function is_coach_of(target_student_id uuid)
returns boolean as $$
  select exists (
    select 1 from student_coach_assignments
    where student_id = target_student_id
      and coach_id = auth.uid()
      and status = 'active'
  );
$$ language sql stable security definer;

-- ─────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────
alter table profiles enable row level security;

-- Tutti gli utenti autenticati possono vedere il proprio profilo
create policy profiles_select_own on profiles
  for select using (auth.uid() = id);

-- I coach vedono i profili degli studenti che seguono
create policy profiles_select_coach_students on profiles
  for select using (
    auth_role() in ('coach', 'founder')
    and (role = 'student' and (is_founder() or is_coach_of(id)))
  );

-- Tutti gli utenti vedono i profili dei coach (servono per "chi mi segue")
create policy profiles_select_coaches on profiles
  for select using (role in ('coach', 'founder'));

-- Solo il founder può creare/modificare/eliminare profili
-- (l'auto-creazione studente avviene via trigger su auth.users, vedi 0012)
create policy profiles_insert_founder on profiles
  for insert with check (is_founder());

create policy profiles_update_own on profiles
  for update using (auth.uid() = id);

create policy profiles_update_founder on profiles
  for update using (is_founder());

create policy profiles_delete_founder on profiles
  for delete using (is_founder());

-- ─────────────────────────────────────────────────────────────────────
-- coaches
-- ─────────────────────────────────────────────────────────────────────
alter table coaches enable row level security;

-- Tutti gli utenti autenticati vedono i coach
create policy coaches_select_all on coaches
  for select using (auth.uid() is not null);

-- Solo il founder gestisce i coach
create policy coaches_modify_founder on coaches
  for all using (is_founder()) with check (is_founder());

-- ─────────────────────────────────────────────────────────────────────
-- students
-- ─────────────────────────────────────────────────────────────────────
alter table students enable row level security;

create policy students_select_own on students
  for select using (auth.uid() = id);

create policy students_select_their_coach on students
  for select using (is_founder() or is_coach_of(id));

create policy students_update_own on students
  for update using (auth.uid() = id);

create policy students_update_their_coach on students
  for update using (is_founder() or is_coach_of(id));

create policy students_modify_founder on students
  for all using (is_founder()) with check (is_founder());

-- ─────────────────────────────────────────────────────────────────────
-- student_coach_assignments
-- ─────────────────────────────────────────────────────────────────────
alter table student_coach_assignments enable row level security;

create policy sca_select_involved on student_coach_assignments
  for select using (
    is_founder()
    or auth.uid() = student_id
    or auth.uid() = coach_id
  );

-- Solo il founder può assegnare/spostare studenti
create policy sca_modify_founder on student_coach_assignments
  for all using (is_founder()) with check (is_founder());

-- ─────────────────────────────────────────────────────────────────────
-- lessons + library tree
-- ─────────────────────────────────────────────────────────────────────
alter table library_categories enable row level security;
alter table library_modules enable row level security;
alter table lessons enable row level security;
alter table lesson_chapters enable row level security;
alter table lesson_resources enable row level security;
alter table lesson_views enable row level security;
alter table lesson_bookmarks enable row level security;

-- Tutti gli utenti vedono il tree della libreria
create policy library_categories_select on library_categories
  for select using (auth.uid() is not null);

create policy library_modules_select on library_modules
  for select using (auth.uid() is not null);

-- Lezioni: solo published per studenti, tutto per coach/founder
create policy lessons_select_published on lessons
  for select using (
    status = 'published'
    or auth_role() in ('coach', 'founder')
  );

create policy lesson_chapters_select on lesson_chapters
  for select using (auth.uid() is not null);

create policy lesson_resources_select on lesson_resources
  for select using (auth.uid() is not null);

-- Solo founder gestisce la libreria
create policy library_categories_modify on library_categories
  for all using (is_founder()) with check (is_founder());

create policy library_modules_modify on library_modules
  for all using (is_founder()) with check (is_founder());

create policy lessons_modify on lessons
  for all using (is_founder()) with check (is_founder());

create policy lesson_chapters_modify on lesson_chapters
  for all using (is_founder()) with check (is_founder());

create policy lesson_resources_modify on lesson_resources
  for all using (is_founder()) with check (is_founder());

-- lesson_views: studente vede e scrive le proprie, coach vede quelle dei suoi
create policy lesson_views_select_own on lesson_views
  for select using (
    auth.uid() = student_id
    or is_founder()
    or is_coach_of(student_id)
  );

create policy lesson_views_insert_own on lesson_views
  for insert with check (auth.uid() = student_id);

create policy lesson_views_update_own on lesson_views
  for update using (auth.uid() = student_id);

-- lesson_bookmarks: solo lo studente
create policy lesson_bookmarks_select_own on lesson_bookmarks
  for select using (auth.uid() = student_id);

create policy lesson_bookmarks_modify_own on lesson_bookmarks
  for all using (auth.uid() = student_id) with check (auth.uid() = student_id);

-- ─────────────────────────────────────────────────────────────────────
-- exercises + submissions
-- ─────────────────────────────────────────────────────────────────────
alter table exercises enable row level security;
alter table submissions enable row level security;

-- Studente vede i propri esercizi, il suo coach pure, founder tutto
create policy exercises_select_own on exercises
  for select using (
    auth.uid() = student_id
    or is_founder()
    or is_coach_of(student_id)
  );

-- Solo il coach può creare/modificare esercizi (e il founder)
create policy exercises_modify_coach on exercises
  for all using (
    is_founder()
    or (auth.uid() = assigned_by_coach_id and is_coach_of(student_id))
  ) with check (
    is_founder()
    or (auth.uid() = assigned_by_coach_id and is_coach_of(student_id))
  );

-- Submissions: studente vede le proprie, coach quelle dei suoi studenti
create policy submissions_select_own on submissions
  for select using (
    auth.uid() = student_id
    or is_founder()
    or is_coach_of(student_id)
  );

create policy submissions_insert_own on submissions
  for insert with check (auth.uid() = student_id);

-- Lo studente non può modificare/cancellare le proprie submission una volta inviate
-- (per integrità dei feedback associati)

-- ─────────────────────────────────────────────────────────────────────
-- feedbacks + annotations + ratings
-- ─────────────────────────────────────────────────────────────────────
alter table feedbacks enable row level security;
alter table annotations enable row level security;
alter table feedback_ratings enable row level security;
alter table skill_radar enable row level security;

-- Lo studente vede i feedback sulle sue submission (solo se status='sent')
create policy feedbacks_select_student on feedbacks
  for select using (
    status = 'sent'
    and exists (
      select 1 from submissions s where s.id = submission_id and s.student_id = auth.uid()
    )
  );

-- Coach vede i propri feedback (anche draft) + founder tutto
create policy feedbacks_select_coach on feedbacks
  for select using (auth.uid() = coach_id or is_founder());

create policy feedbacks_modify_coach on feedbacks
  for all using (auth.uid() = coach_id or is_founder())
  with check (auth.uid() = coach_id or is_founder());

-- Annotations: stessa logica del feedback parent
create policy annotations_select on annotations
  for select using (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id
        and (
          (f.status = 'sent' and exists (
            select 1 from submissions s where s.id = f.submission_id and s.student_id = auth.uid()
          ))
          or auth.uid() = f.coach_id
          or is_founder()
        )
    )
  );

create policy annotations_modify_coach on annotations
  for all using (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id and (auth.uid() = f.coach_id or is_founder())
    )
  ) with check (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id and (auth.uid() = f.coach_id or is_founder())
    )
  );

-- feedback_ratings: stessa logica
create policy feedback_ratings_select on feedback_ratings
  for select using (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id
        and (
          (f.status = 'sent' and exists (
            select 1 from submissions s where s.id = f.submission_id and s.student_id = auth.uid()
          ))
          or auth.uid() = f.coach_id
          or is_founder()
        )
    )
  );

create policy feedback_ratings_modify on feedback_ratings
  for all using (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id and (auth.uid() = f.coach_id or is_founder())
    )
  ) with check (
    exists (
      select 1 from feedbacks f
      where f.id = feedback_id and (auth.uid() = f.coach_id or is_founder())
    )
  );

-- skill_radar: studente vede il proprio, coach dei propri, founder tutto
create policy skill_radar_select on skill_radar
  for select using (
    auth.uid() = student_id
    or is_founder()
    or is_coach_of(student_id)
  );

create policy skill_radar_modify on skill_radar
  for all using (is_founder() or is_coach_of(student_id))
  with check (is_founder() or is_coach_of(student_id));

-- ─────────────────────────────────────────────────────────────────────
-- chat_threads + chat_messages
-- ─────────────────────────────────────────────────────────────────────
alter table chat_threads enable row level security;
alter table chat_messages enable row level security;

create policy chat_threads_select on chat_threads
  for select using (
    is_founder()
    or auth.uid() = student_id
    or auth.uid() = coach_id
  );

create policy chat_threads_insert on chat_threads
  for insert with check (is_founder() or auth.uid() = coach_id);

create policy chat_messages_select on chat_messages
  for select using (
    exists (
      select 1 from chat_threads t
      where t.id = thread_id
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id or is_founder())
    )
  );

create policy chat_messages_insert on chat_messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from chat_threads t
      where t.id = thread_id
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id)
    )
  );

create policy chat_messages_update_read on chat_messages
  for update using (
    exists (
      select 1 from chat_threads t
      where t.id = thread_id
        and (auth.uid() = t.student_id or auth.uid() = t.coach_id)
        and auth.uid() <> sender_id  -- solo il destinatario può marcare come letto
    )
  );

-- ─────────────────────────────────────────────────────────────────────
-- invitations — solo founder/coach gestiscono, nessuno legge da frontend
-- ─────────────────────────────────────────────────────────────────────
alter table invitations enable row level security;

create policy invitations_select_coach on invitations
  for select using (
    is_founder() or auth.uid() = invited_by_coach_id
  );

create policy invitations_modify_coach on invitations
  for all using (is_founder() or auth.uid() = invited_by_coach_id)
  with check (is_founder() or auth.uid() = invited_by_coach_id);
