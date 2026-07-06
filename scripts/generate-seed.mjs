// Generates supabase/migrations/00000000000001_lean_kitchen.sql from the
// Master Menu Excel. Usage:
//   node scripts/generate-seed.mjs "path/to/MP_SAP.xlsx"
// Run the resulting SQL once in the Supabase SQL Editor (or `supabase db push`).
import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { parseMasterMenu } from '../src/lib/importMenu.js';

const src = process.argv[2];
if (!src) { console.error('Usage: node scripts/generate-seed.mjs <xlsx path>'); process.exit(1); }

const wb = XLSX.read(readFileSync(src));
const { meals, issues } = parseMasterMenu(wb);
console.log(`Parsed ${meals.length} meals; ${issues.length} data notes.`);
issues.forEach((i) => console.log('  note:', i));

const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(', ')}]::text[]`;

const mealValues = meals.map((m) =>
  `(${q(m.name)}, ${q(m.cuisine)}, ${q(m.diet)}, ${m.vegan}, ${q(m.base)}, ${q(m.side)}, ${m.price ?? 'null'}, ${q(m.price_raw)}, ${m.kcal ?? 'null'}, ${m.protein ?? 'null'}, ${arr(m.tags)}, ${q(m.section)}, ${q(m.description)}, ${q(m.image)}, ${m.availability})`
).join(',\n  ');

const sql = `-- Lean Kitchen schema + seed (generated from the Master Menu Excel).
-- Safe to re-run: tables use "if not exists", seed upserts on name.

create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  cuisine text,
  diet text,
  vegan boolean not null default false,
  base text,
  side text,
  price integer,
  price_raw text,
  kcal integer,
  protein integer,
  tags text[] not null default '{}',
  section text,
  description text,
  image text,
  availability boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.plans (
  id text primary key,
  name text not null,
  meals integer not null,
  per_meal integer not null,
  duration text,
  best_for text,
  description text,
  benefits text[] not null default '{}',
  included text[] not null default '{}',
  dietitian boolean not null default false,
  popular boolean not null default false,
  sort integer not null default 0
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  age text not null default '',
  gender text not null default '',
  height text not null default '',
  weight text not null default '',
  goal text not null default '',
  diet_pref text not null default 'No preference',
  allergies text not null default '',
  meals_per_week integer not null default 12,
  nutritionist_ref text not null default '',
  delivery_address text not null default '',
  pincode text not null default '',
  role text not null default 'customer',
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Logged-in app users must not grant themselves admin. Changes made
-- from the SQL editor / service role (no auth.uid()) are allowed so the
-- first admin can be bootstrapped; RLS already blocks anonymous updates.
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end $$;
drop trigger if exists profiles_role_guard on public.profiles;
create trigger profiles_role_guard before update on public.profiles
  for each row execute function public.prevent_role_escalation();

alter table public.meals enable row level security;
alter table public.plans enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "meals are public" on public.meals;
create policy "meals are public" on public.meals for select using (true);
drop policy if exists "admins manage meals" on public.meals;
create policy "admins manage meals" on public.meals for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "plans are public" on public.plans;
create policy "plans are public" on public.plans for select using (true);
drop policy if exists "admins manage plans" on public.plans;
create policy "admins manage plans" on public.plans for all
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "own profile select" on public.profiles;
create policy "own profile select" on public.profiles for select using (id = auth.uid());
drop policy if exists "own profile insert" on public.profiles;
create policy "own profile insert" on public.profiles for insert with check (id = auth.uid());
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (id = auth.uid());

-- ── Seed: plans ──────────────────────────────────────────────
insert into public.plans (id, name, meals, per_meal, duration, best_for, description, benefits, included, dietitian, popular, sort) values
  ('starter', 'Starter Week', 6, 549, '1 week', 'Trying us out',
   'Six chef-crafted meals to try us out. Pick any dishes you like.',
   array['Pick any 6 dishes from the menu', 'No commitment beyond one week', 'Free delivery within 5 km'],
   array['6 chef-crafted meals', 'Nutrition details with every dish', 'WhatsApp support'],
   false, false, 1),
  ('weekly', 'Weekly Plan', 12, 499, 'Renews every week', 'Everyday routine',
   'Lunch and dinner, six days a week. The menu rotates so it never repeats.',
   array['₹50 less per meal than Starter', 'Rotating menu — never repeats', 'Pause, swap, or adjust any week'],
   array['12 chef-crafted meals a week', 'Menu planned around your goal', 'Priority WhatsApp support'],
   false, true, 2),
  ('monthly', 'Monthly Plan', 24, 449, '4 weeks', 'Committed goals',
   'A month of meals matched to your goal, with a dietitian consultation included.',
   array['Best price — ₹100 less per meal than Starter', 'Dietitian consultation included', 'Pause, swap, or adjust any week'],
   array['24 chef-crafted meals', 'One dietitian consultation', 'Monthly progress check-in'],
   true, false, 3)
on conflict (id) do update set
  name = excluded.name, meals = excluded.meals, per_meal = excluded.per_meal,
  duration = excluded.duration, best_for = excluded.best_for, description = excluded.description,
  benefits = excluded.benefits, included = excluded.included,
  dietitian = excluded.dietitian, popular = excluded.popular, sort = excluded.sort;

-- ── Seed: meals (from the Master Menu sheet) ─────────────────
insert into public.meals (name, cuisine, diet, vegan, base, side, price, price_raw, kcal, protein, tags, section, description, image, availability) values
  ${mealValues}
on conflict (name) do update set
  cuisine = excluded.cuisine, diet = excluded.diet, vegan = excluded.vegan,
  base = excluded.base, side = excluded.side, price = excluded.price, price_raw = excluded.price_raw,
  kcal = excluded.kcal, protein = excluded.protein, tags = excluded.tags,
  section = excluded.section, description = excluded.description, image = excluded.image,
  availability = excluded.availability, updated_at = now();
`;

mkdirSync('supabase/migrations', { recursive: true });
const out = 'supabase/migrations/00000000000001_lean_kitchen.sql';
writeFileSync(out, sql);
console.log('Wrote', out);
