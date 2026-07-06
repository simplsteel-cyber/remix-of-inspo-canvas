-- Lean Kitchen schema + seed (generated from the Master Menu Excel).
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

-- Users must not grant themselves admin.
create or replace function public.prevent_role_escalation()
returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role
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
  ('Seared Seabass Creamy Basil Sauce', 'Continental', 'Non-Veg', false, 'Wholewheat Spaghetti', 'Grilled Vegetables', 550, '550', 660, 42, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Seared seabass finished in a silky basil cream. Served with wholewheat spaghetti and grilled vegetables.', 'Pan Seared Fish with Stir Fried Veggies.jpg', true),
  ('Grilled Chicken Breast In Sauce Provencale', 'Continental', 'Non-Veg', false, 'Yam Fries(Baked)', 'Sauteed Vegetables', 500, '500', 650, 44, array['High-Protein']::text[], 'Balanced Plates', 'Grilled chicken in a herbed Provencal tomato sauce. Served with yam fries(baked) and sauteed vegetables.', 'Grilled Chicken Steak.jpg', true),
  ('Grilled Fish In Saffron Sauce', 'Continental', 'Non-Veg', false, 'Brown Herbed Rice', 'Stir-Fried Vegetables', 550, '550', 580, 41, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Grilled fish bathed in a fragrant saffron sauce. Served with brown herbed rice and stir-fried vegetables.', 'Sumac Grilled Fish.jpg', true),
  ('Prawns In Puttanesca Sauce', 'Continental', 'Non-Veg', false, 'Wholewheat Spaghetti', 'Thyme-Infused Vegetables', 600, '600', 600, 38, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Prawns tossed in a tangy olive-and-caper puttanesca. Served with wholewheat spaghetti and thyme-infused vegetables.', 'Gamberi Alla Bushra.jpg', true),
  ('Grilled Chicken Pomodoro', 'Continental', 'Non-Veg', false, 'Couscous', 'Veg. Au Gratin', 500, '500', 600, 43, array['High-Protein']::text[], 'Balanced Plates', 'Grilled chicken in a sun-ripened pomodoro sauce. Served with couscous and veg. au gratin.', 'Chicken Cacciatore.jpg', true),
  ('Grilled Tenderloin In Chimichurri Sauce', 'Continental', 'Non-Veg', false, 'Sweet Potato Rosti', 'Grilled Vegetables', 650, '650', 620, 40, array['High-Protein']::text[], 'High-Protein Power', 'Grilled Tenderloin In Chimichurri Sauce. Served with sweet potato rosti and grilled vegetables.', 'Crushed Herb Buff Steak.jpg', true),
  ('Buff Burrito Bowl', 'Continental', 'Non-Veg', false, 'Brown Rice', 'Salsa', 650, '650', 700, 41, array['High-Protein']::text[], 'High-Protein Power', 'Buff Burrito Bowl. Served with brown rice and salsa.', null, false),
  ('Dill And Lemon Zest Crusted Fish (Baked)', 'Continental', 'Non-Veg', false, 'Lemon Rice', 'Sauteed Vegetables', 550, '550', 580, 41, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Oven-baked fish crusted with dill and lemon zest, oven-baked. Served with lemon rice and sauteed vegetables.', 'Fish in Lemon Butter Sauce.jpg', true),
  ('Chicken/Lamb Meat Balls In Ragu Sauce', 'Continental', 'Non-Veg', false, 'Wholewheat Spaghetti', 'Sauteed Mushroom And Spinach', 500, '500/750', 780, 40, array['High-Protein']::text[], 'High-Protein Power', 'Lamb simmered in a slow-cooked tomato ragu. Served with wholewheat spaghetti and sauteed mushroom and spinach.', 'Meat Balls Spaghetti.jpg', true),
  ('Acqua Pazza Fish', 'Continental', 'Non-Veg', false, 'Stir-Fried Veg Quinoa', null, null, null, 560, 44, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Fish poached in a light herb-tomato broth. Served with stir-fried veg quinoa.', 'Fish Florentine.jpg', false),
  ('Amritsari Fish', 'Indian', 'Non-Veg', false, 'Saffron Rice', 'Gobhi Matar Sabzi', 550, '550', 610, 41, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Fish crisp Amritsari-spiced and fried. Served with saffron rice and gobhi matar sabzi.', 'Amritsari Fish Fry 1.jpg', true),
  ('Murgh Dhaniya Adraki', 'Indian', 'Non-Veg', false, 'Bajra Roti', 'Beans Sabzi', 500, '500', 590, 41, array['High-Protein']::text[], 'Balanced Plates', 'Chicken in a coriander-and-ginger gravy. Served with bajra roti and beans sabzi.', 'Chicken Methi Malai.jpg', true),
  ('Kadai Chicken', 'Indian', 'Non-Veg', false, 'Multigrain Chapati', 'Til-Wali Bhindi', 500, '500', 590, 41, array['High-Protein']::text[], 'Balanced Plates', 'Chicken tossed in a spicy kadai masala. Served with multigrain chapati and til-wali bhindi.', 'Chicken kadai.jpg', true),
  ('Homestyle Chicken Curry', 'Indian', 'Non-Veg', false, 'Jowar Chapati', 'Lahsooni Palak', 500, '500', 620, 41, array['High-Protein']::text[], 'Balanced Plates', 'Chicken in a comforting homestyle gravy. Served with jowar chapati and lahsooni palak.', 'Homestye Chicken Curry.jpg', true),
  ('Shorshe Bata Macher Jhol', 'Indian', 'Non-Veg', false, 'Sticky Rice', 'Begun Bhaja', 550, '550', 640, 41, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Fish in a light Bengali-style mustard curry. Served with sticky rice and begun bhaja.', 'Mawani Fish Curry 1.jpg', true),
  ('Chicken Keema Matar', 'Indian', 'Non-Veg', false, 'Wholewheat Pav', 'Kachumber Salad', 500, '500', 590, 41, array['High-Protein']::text[], 'Balanced Plates', 'Chicken minced and cooked with peas. Served with wholewheat pav and kachumber salad.', 'Mutton Keema.jpg', true),
  ('Fish Goan Curry', 'Indian', 'Non-Veg', false, 'Brown Rice', 'Veg Foogath', 650, '650', 640, 41, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Fish in a coconut-laced Goan curry. Served with brown rice and veg foogath.', 'Goan Fish Curry.jpg', true),
  ('Murgh Nizami Handi', 'Indian', 'Non-Veg', false, 'Ragi Chapati', 'Adraki Gobhi', 500, '500', 620, 41, array['High-Protein']::text[], 'Balanced Plates', 'Chicken in a rich Nizami-style handi. Served with ragi chapati and adraki gobhi.', 'Chicken Lababdar.jpg', true),
  ('Smoke Mutton Handi', 'Indian', 'Non-Veg', false, 'Bajra Roti', 'Carrot Beans Sabzi', 700, '700', 700, 37, array['High-Protein']::text[], 'High-Protein Power', 'Smoked mutton slow-cooked in a smoky handi. Served with bajra roti and carrot beans sabzi.', 'Mutton Korma.jpg', true),
  ('Mutton Do Piyaza', 'Indian', 'Non-Veg', false, 'Kutu Chapati', 'Beetroot Capsicum Sabzi', 700, '700', 680, 37, array['High-Protein']::text[], 'High-Protein Power', 'Mutton with caramelised onions, do-pyaza style. Served with kutu chapati and beetroot capsicum sabzi.', 'Mutton Rogan Josh.jpg', true),
  ('Chicken And Vegitables Chilli Garlic Noodles', 'Asian', 'Non-Veg', false, 'Soba Noodles', null, 500, '500', 640, 45, array['High-Protein']::text[], 'Balanced Plates', 'Chicken wok-tossed in a punchy chilli-garlic sauce. Served with soba noodles.', 'Chicken Chilli Garlic Noodles.jpg', true),
  ('Oyster Basil Chicken', 'Asian', 'Non-Veg', false, 'Chilli Crisp Fried Rice', 'Stir-Fried Vegetables', 550, '550', 700, 43, array['High-Protein']::text[], 'Balanced Plates', 'Oyster Basil Chicken. Served with chilli crisp fried rice and stir-fried vegetables.', 'Chilli Basil Chicken.jpg', true),
  ('Chicken And Veg Thai Curry', 'Asian', 'Non-Veg', false, 'Jasmine Rice', null, 550, '550', 670, 40, array['High-Protein']::text[], 'Balanced Plates', 'Chicken in an aromatic Thai coconut curry. Served with jasmine rice.', 'Chicken Green Thai Curry.jpg', true),
  ('Tsing Hoi Chicken', 'Asian', 'Non-Veg', false, 'Mixed Veg Fried Rice', null, 500, '500', 670, 42, array['High-Protein']::text[], 'Balanced Plates', 'Chicken stir-fried Cantonese-style. Served with mixed veg fried rice.', 'Stir Fried Chicken Exotic.jpg', true),
  ('Lemon Coriander Fish', 'Asian', 'Non-Veg', false, 'Steam Rice', 'Stir-Fried Vegetables', 550, '550', 610, 41, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Fish in a zingy lemon-coriander sauce. Served with steam rice and stir-fried vegetables.', 'Steamed Fish with Greens.jpg', true),
  ('Tobanjan Buff', 'Asian', 'Non-Veg', false, 'Soba Noodles', 'Sauteed Vegetables', 700, '700', 700, 46, array['High-Protein']::text[], 'High-Protein Power', 'Buff in a Japanese chilli-bean glaze. Served with soba noodles and sauteed vegetables.', 'Grilled Buff Chilli.jpg', true),
  ('Roast Lamb Chilli', 'Asian', 'Non-Veg', false, 'Sticky Rice', 'Steamed Vegetables', 750, '750', 740, 36, array['High-Protein']::text[], 'High-Protein Power', 'Roast Lamb Chilli. Served with sticky rice and steamed vegetables.', null, false),
  ('Gochujang Fish', 'Asian', 'Non-Veg', false, 'Veg Soba Noodles', null, 650, '650', 580, 45, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Fish lacquered in spicy Korean gochujang. Served with veg soba noodles.', 'Fish Schezwan Gravy.jpg', true),
  ('Black Pepper Fish', 'Asian', 'Non-Veg', false, 'Egg Fried Rice', 'Sauteed Greens', 650, '650', 640, 43, array['High-Protein', 'Omega-3']::text[], 'Lean & Light', 'Fish in a glossy black-pepper sauce. Served with egg fried rice and sauteed greens.', 'Black Pepper Fish.jpg', true),
  ('Buff Bulgogi', 'Asian', 'Non-Veg', false, 'Sesame Rice', 'Stir-Fried Vegetables', 750, '750', 700, 41, array['High-Protein']::text[], 'High-Protein Power', 'Buff marinated Korean bulgogi-style. Served with sesame rice and stir-fried vegetables.', 'Soya Glazed Buff Tenderloin.jpg', true),
  ('Grilled Cottage Cheese In Paprika Sauce', 'Continental', 'Veg', false, 'Brown Rice', 'Grilled Vegetables', 500, '500', 670, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Grilled paneer glazed in a smoky paprika sauce. Served with brown rice and grilled vegetables.', 'Paneer tikka.jpg', true),
  ('Pan Seared Tofu In Curry Sauce', 'Continental', 'Veg', true, 'Quinoa', 'Stir-Fried Vegetables', 500, '500', 500, 27, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Pan-seared tofu in a gently spiced curry sauce. Served with quinoa and stir-fried vegetables.', null, false),
  ('Chickpeas And Cottage Cheese Steak', 'Continental', 'Veg', false, 'Spaghetti', 'Roasted Vegetables', 550, '550', 660, 26, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Chickpea & Paneer seared into a hearty steak. Served with spaghetti and roasted vegetables.', 'Cottage Cheese Steak.jpg', true),
  ('Cottage Cheese In Chimichurri Sauce', 'Continental', 'Veg', false, 'Sweet Potato Mash', 'Sauteed Vegetables', 500, '500', 580, 26, array['Balanced', 'Vegetarian']::text[], 'Vegetarian Favourites', 'Cottage Cheese In Chimichurri Sauce. Served with sweet potato mash and sauteed vegetables.', 'Pesto Grilled Cottage Cheese.jpg', true),
  ('Veg Burrito Bowl', 'Continental', 'Veg', false, 'Mexican Rice', 'Guacamole And Sour Cream And Salsa', 550, '550', 620, 27, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Veg Burrito Bowl built into a loaded burrito bowl. Served with mexican rice and guacamole and sour cream and salsa.', null, false),
  ('Healthy Mediterranean Bowl', 'Continental', 'Veg', false, 'Couscous', 'Hummus, Fattoush, Labneh', 550, '550', 620, 28, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Healthy Mediterranean Bowl. Served with couscous and hummus, fattoush, labneh.', 'Healthy Mediterranean Bowl.jpg', true),
  ('Mushroom Burger', 'Continental', 'Veg', true, 'Multigrain/Gluten Free Bun', 'Yam Fries', 450, '450/550', 440, 14, array['Weight-Loss', 'Vegan']::text[], 'Plant-Based & Vegan', 'Mushroom stacked into a wholesome burger. Served with multigrain/gluten free bun and yam fries.', 'Classic Veggie Burger.jpg', true),
  ('Bolognese ( Soya Granules)', 'Continental', 'Veg', true, 'Spaghetti(Wholewheat)', 'Herb-Infused Vegetables', 500, '500', 600, 35, array['High-Protein', 'Vegan']::text[], 'Plant-Based & Vegan', 'Soya in a rich plant-based bolognese. Served with spaghetti(wholewheat) and herb-infused vegetables.', 'Veg Arabiata Pasta.jpg', true),
  ('Cottage Cheese & Veg Penne Provencale', 'Continental', 'Veg', false, 'Wholewheat Penne', null, 500, '500', 730, 32, array['High-Protein', 'Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer in a herbed Provencal tomato sauce. Served with wholewheat penne.', 'Veg Mamarosa Pasta.jpg', true),
  ('Sundried Tomato Pesto Grilled Tofu', 'Continental', 'Veg', true, 'Vegetables Quinoa', null, 550, '550', 470, 26, array['Weight-Loss', 'Vegan']::text[], 'Plant-Based & Vegan', 'Grilled tofu marinated in basil pesto and chargrilled. Served with vegetables quinoa.', 'Grilled Tofu.jpg', true),
  ('Paneer Bhurjee', 'Indian', 'Veg', false, 'Multigrain Chapati', 'Gobhi Matar Sabzi', 500, '500', 620, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer Bhurjee. Served with multigrain chapati and gobhi matar sabzi.', 'Paneer Bhurjee 1.jpg', true),
  ('Paneer Dhaniya Adraki', 'Indian', 'Veg', false, 'Bajra Roti', 'Beans Sabzi', 500, '500', 620, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer in a coriander-and-ginger gravy. Served with bajra roti and beans sabzi.', 'Methi malai paneer _1.jpg', true),
  ('Kadai Tofu', 'Indian', 'Veg', true, 'Multigrain Chapati', 'Til-Wali Bhindi', 500, '500', 480, 23, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Tofu tossed in a spicy kadai masala. Served with multigrain chapati and til-wali bhindi.', 'Kadhai paneer .jpg', true),
  ('Chana Masala', 'Indian', 'Veg', true, 'Jowar Chapati', 'Lahsooni Palak', 450, '450', 600, 22, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Chickpea in a tangy chana masala. Served with jowar chapati and lahsooni palak.', 'Chole.jpg', true),
  ('Shorshe Bata Paneer', 'Indian', 'Veg', false, 'Sticky Rice', 'Begun Bhaja', 500, '500', 700, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Shorshe Bata Paneer. Served with sticky rice and begun bhaja.', 'Paneer Makhanwaa.jpg', true),
  ('Soya Keema Matar', 'Indian', 'Veg', true, 'Wholewheat Pav', 'Kachumber Salad', 450, '450', 520, 31, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Soya minced and cooked with peas. Served with wholewheat pav and kachumber salad.', null, false),
  ('Paneer Cafreal', 'Indian', 'Veg', false, 'Brown Rice', 'Veg Foogath', 500, '500', 700, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer in a green Goan cafreal masala. Served with brown rice and veg foogath.', 'Paak Paneer.jpg', true),
  ('Paneer Nizami Handi', 'Indian', 'Veg', false, 'Ragi Chapati', 'Adraki Gobhi', 500, '500', 660, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer in a rich Nizami-style handi. Served with ragi chapati and adraki gobhi.', 'Paneer Lababdar.jpg', true),
  ('Smoke Tofu Handi', 'Indian', 'Veg', true, 'Bajra Roti', 'Carrot Beans Sabzi', 500, '500', 500, 23, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Smoked tofu slow-cooked in a smoky handi. Served with bajra roti and carrot beans sabzi.', null, false),
  ('Paneer Do Piyaza', 'Indian', 'Veg', false, 'Kutu Chapati', 'Beetroot Capsicum Sabzi', 500, '500', 620, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer with caramelised onions, do-pyaza style. Served with kutu chapati and beetroot capsicum sabzi.', 'Matar Paneer.jpg', true),
  ('Tofu And Vegitables Chilli Garlic Noodles', 'Asian', 'Veg', true, 'Soba Noodles', null, 550, '550', 520, 27, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Tofu wok-tossed in a punchy chilli-garlic sauce. Served with soba noodles.', 'Veg Chilli Garlic Noodles.jpg', true),
  ('Oyster Basil Cottage Cheese', 'Asian', 'Veg', false, 'Chilli Crisp Fried Rice', 'Stir-Fried Vegetables', 500, '500', 730, 31, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Oyster Basil Cottage Cheese. Served with chilli crisp fried rice and stir-fried vegetables.', 'Chilli Basil Paneer.jpg', true),
  ('Tofu And Veg Thai Curry', 'Asian', 'Veg', true, 'Jasmine Rice', null, 550, '550', 560, 22, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Tofu in an aromatic Thai coconut curry. Served with jasmine rice.', 'Veg Green Thai Curry.jpg', true),
  ('Tsing Hoi Tofu', 'Asian', 'Veg', true, 'Mixed Veg Fried Rice', null, 550, '550', 560, 24, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Tofu stir-fried Cantonese-style. Served with mixed veg fried rice.', 'Veg Wok.jpg', true),
  ('Lemon Coriander Cottage Cheese', 'Asian', 'Veg', false, 'Steam Rice', 'Stir-Fried Vegetables', 500, '500', 700, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer in a zingy lemon-coriander sauce. Served with steam rice and stir-fried vegetables.', null, false),
  ('Tobanjan Tofu', 'Asian', 'Veg', true, 'Soba Noodles', 'Sauteed Vegetables', 550, '550', 540, 28, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Tofu in a Japanese chilli-bean glaze. Served with soba noodles and sauteed vegetables.', null, false),
  ('Paneer In Blackbean Sauce', 'Asian', 'Veg', false, 'Sticky Rice', 'Steamed Vegetables', 500, '500', 700, 29, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer In Blackbean Sauce. Served with sticky rice and steamed vegetables.', 'Paneer Black Bean Sauce.jpg', true),
  ('Gochujang Tofu', 'Asian', 'Veg', true, 'Veg Soba Noodles', null, 550, '550', 520, 27, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Tofu lacquered in spicy Korean gochujang. Served with veg soba noodles.', null, false),
  ('Black Pepper Paneer', 'Asian', 'Veg', false, 'Egg Fried Rice', 'Sauteed Greens', 500, '500', 730, 31, array['Vegetarian']::text[], 'Vegetarian Favourites', 'Paneer in a glossy black-pepper sauce. Served with egg fried rice and sauteed greens.', 'Black Pepper Paneer.jpg', true),
  ('Korean Tofu Bowl', 'Asian', 'Veg', true, 'Sesame Rice', 'Stir-Fried Vegetables', 550, '550', 550, 23, array['Balanced', 'Vegan']::text[], 'Plant-Based & Vegan', 'Tofu served as a Korean-style rice bowl. Served with sesame rice and stir-fried vegetables.', 'Veg Korean Rice.jpg', true)
on conflict (name) do update set
  cuisine = excluded.cuisine, diet = excluded.diet, vegan = excluded.vegan,
  base = excluded.base, side = excluded.side, price = excluded.price, price_raw = excluded.price_raw,
  kcal = excluded.kcal, protein = excluded.protein, tags = excluded.tags,
  section = excluded.section, description = excluded.description, image = excluded.image,
  availability = excluded.availability, updated_at = now();
