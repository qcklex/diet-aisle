-- DietAisle cloud sync schema
-- One row per user holding their full app state as JSONB.
-- RLS ensures users can only ever read/write their own row.

create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "own state select" on public.app_state;
create policy "own state select" on public.app_state
  for select using (auth.uid() = user_id);

drop policy if exists "own state insert" on public.app_state;
create policy "own state insert" on public.app_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "own state update" on public.app_state;
create policy "own state update" on public.app_state
  for update using (auth.uid() = user_id);
