-- Tracks hackathons a user joined / attended (for "My hackathons").
-- Run in Supabase SQL Editor after 001_initial_schema.sql.

create table public.hackathon_participations (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (hackathon_id, user_id)
);

create index hackathon_participations_user_id_idx on public.hackathon_participations (user_id);
create index hackathon_participations_hackathon_id_idx on public.hackathon_participations (hackathon_id);

alter table public.hackathon_participations enable row level security;

create policy "participations_select_own"
  on public.hackathon_participations for select to authenticated
  using (user_id = auth.uid());

create policy "participations_insert_own"
  on public.hackathon_participations for insert to authenticated
  with check (user_id = auth.uid());

create policy "participations_delete_own"
  on public.hackathon_participations for delete to authenticated
  using (user_id = auth.uid());
