-- Lean Kitchen — meal-plan persistence + change events.
-- Safe to re-run. Run in the Supabase SQL Editor after migration 0001.

-- Each user's saved weekly plan: chosen meals (as JSON), subscription
-- plan, and whether they've agreed to pay for meals beyond the plan.
create table if not exists public.meal_plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  items jsonb not null default '[]',        -- [{ name, qty, notes }]
  plan_id text,                             -- references plans.id (soft)
  pay_extras boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Audit log of meal-plan changes. Also the source that drives the
-- email notification (a database webhook can fire on insert here).
create table if not exists public.meal_plan_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  email text,
  event text not null,                      -- e.g. 'meal_plan_updated'
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.meal_plans enable row level security;
alter table public.meal_plan_events enable row level security;

drop policy if exists "own meal plan" on public.meal_plans;
create policy "own meal plan" on public.meal_plans for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Anyone may record their own change event (signed-in or guest);
-- reads are restricted to the owner.
drop policy if exists "insert own events" on public.meal_plan_events;
create policy "insert own events" on public.meal_plan_events for insert
  with check (user_id = auth.uid() or user_id is null);
drop policy if exists "read own events" on public.meal_plan_events;
create policy "read own events" on public.meal_plan_events for select
  using (user_id = auth.uid());

grant insert on public.meal_plan_events to anon, authenticated;
