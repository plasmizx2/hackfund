-- Run in Supabase SQL Editor or: supabase db push (if using Supabase CLI)
-- Enables hackathons, projects, awards with RLS for login-only app.

create table public.hackathons (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  timezone text not null default 'UTC',
  venue_name text,
  address_line text,
  city text,
  region text,
  country text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  website_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index hackathons_starts_at_idx on public.hackathons (starts_at);
create index hackathons_city_idx on public.hackathons (city);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  title text not null,
  tagline text,
  description text,
  demo_url text,
  repo_url text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_hackathon_id_idx on public.projects (hackathon_id);

create table public.awards (
  id uuid primary key default gen_random_uuid(),
  hackathon_id uuid not null references public.hackathons (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  placement int,
  label text,
  category text,
  prize_amount_cents bigint not null default 0,
  currency text not null default 'USD',
  announced_at timestamptz,
  created_at timestamptz not null default now()
);

create index awards_hackathon_id_idx on public.awards (hackathon_id);

alter table public.hackathons enable row level security;
alter table public.projects enable row level security;
alter table public.awards enable row level security;

create policy "hackathons_select_auth"
  on public.hackathons for select to authenticated using (true);

create policy "hackathons_insert_own"
  on public.hackathons for insert to authenticated
  with check (organizer_id = auth.uid());

create policy "hackathons_update_own"
  on public.hackathons for update to authenticated
  using (organizer_id = auth.uid());

create policy "hackathons_delete_own"
  on public.hackathons for delete to authenticated
  using (organizer_id = auth.uid());

create policy "projects_select_auth"
  on public.projects for select to authenticated using (true);

create policy "projects_insert_own"
  on public.projects for insert to authenticated
  with check (created_by = auth.uid());

create policy "projects_update_own"
  on public.projects for update to authenticated
  using (created_by = auth.uid());

create policy "projects_delete_own"
  on public.projects for delete to authenticated
  using (created_by = auth.uid());

create policy "awards_select_auth"
  on public.awards for select to authenticated using (true);

create policy "awards_insert_organizer"
  on public.awards for insert to authenticated
  with check (
    exists (
      select 1 from public.hackathons h
      where h.id = hackathon_id and h.organizer_id = auth.uid()
    )
  );

create policy "awards_update_organizer"
  on public.awards for update to authenticated
  using (
    exists (
      select 1 from public.hackathons h
      where h.id = hackathon_id and h.organizer_id = auth.uid()
    )
  );

create policy "awards_delete_organizer"
  on public.awards for delete to authenticated
  using (
    exists (
      select 1 from public.hackathons h
      where h.id = hackathon_id and h.organizer_id = auth.uid()
    )
  );
