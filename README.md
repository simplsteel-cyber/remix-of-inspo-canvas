# Lean Kitchen — by Black Olive · Chef Ali Azan

Mobile-first React PWA for the Lean Kitchen meal subscription business.
The menu lives in **Supabase** and is managed by uploading the master
Excel workbook at `/admin`. Customers browse meals, build a cart, pick a
plan, and place the order over **WhatsApp** — there is no in-app payment.

## Quick start

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # preview the production build
```

Requires Node.js 18+.

## One-time Supabase setup

1. Open the Supabase project's **SQL Editor** and run
   `supabase/migrations/00000000000001_lean_kitchen.sql`. This creates
   `meals`, `plans`, and `profiles` (with row-level security), and seeds
   both plans and all 60 dishes parsed from the Master Menu Excel.
2. Grant yourself admin (SQL editor):
   `update profiles set role = 'admin' where id = '<your auth user id>';`
3. In **Authentication → Providers**, Email (password) is enabled by
   default. The project currently requires email confirmation — new
   users must click the link in their inbox before signing in; disable
   “Confirm email” in Auth settings for instant sign-ups. Google and
   Phone (SMS) are supported by the app but need their providers
   configured; until then those buttons surface Supabase's error.
4. To refresh the SQL seed after the Excel changes:
   `node scripts/generate-seed.mjs "path/to/MP_SAP.xlsx"`.

## Updating the menu (kitchen admins)

Sign in with an admin account, open `/admin`, and upload the Excel.
The **Master Menu** sheet is parsed (headers: Dish, Cuisine, Diet,
Carb / Base, Vegetable Side, Price (INR), Calories (approx),
Protein g (approx), Dietary Tags, Brochure Section, Description,
Has Photo?, Matched Image (file)), previewed with data notes, then
upserted by dish name. Dishes marked **“Needs photo”** or missing a
price are imported with `availability = false` and hidden from the
storefront until fixed. Dual prices like `500/750` store the base price
(the raw value is kept in `price_raw`).

## Architecture

```
src/
├── App.jsx                   # shell: routes /admin, tabs, cart badge, floating WhatsApp
├── main.jsx                  # MenuProvider + UserProvider, service-worker registration
├── context/
│   ├── MenuContext.jsx       # meals + plans from Supabase, loading states, bundled fallback
│   └── UserContext.jsx       # session, profile (synced to `profiles`), delivery, routing
├── stores/
│   └── cart.js               # Zustand cart: items {name, qty, notes}, persisted
├── lib/
│   ├── supabase.js           # client (env-driven, publishable key)
│   ├── auth.js               # Supabase Auth: email+password, phone OTP, Google OAuth
│   ├── menu.js               # meals/plans fetch + row → UI mapping
│   ├── importMenu.js         # Master Menu Excel parser (shared by /admin and the seed script)
│   ├── delivery.js           # SERVICE_AREAS pincode rule (Maps-API-ready shape)
│   ├── core.js               # palette, categories, filters, WhatsApp order builder
│   └── storage.js            # namespaced localStorage
├── screens/                  # Home, Meals (hub + category pages), Subscription (order), Extras, Onboarding, Admin
└── components/               # ui primitives, meal cards, delivery form, plan compare
scripts/generate-seed.mjs     # Excel → supabase/migrations SQL
supabase/migrations/          # schema + RLS + seed
```

- **Menu**: Supabase `meals` (only `availability = true` rows are shown).
  If the database is unreachable or unseeded, the bundled
  `src/data/dishes.json` keeps the storefront rendering (with a console
  warning) — Supabase remains the source of truth.
- **Ordering**: the cart (meals + optional plan + notes) compiles into a
  single pre-filled `wa.me/919892572408` message including nutrition
  estimates, subtotal, and the customer's profile details.
- **Auth**: real Supabase sessions; the profile is upserted to
  `profiles` (debounced) and restored on any device after sign-in.
- **PWA**: `manifest.webmanifest` + a minimal service worker
  (network-first navigation, cache-first images) make the app
  installable.

## Honest-marketing notes

- Nutrition values are kitchen **estimates** for a cooked gym portion;
  the UI labels them as approximate everywhere.
- There are no fabricated testimonials, ratings, review counts, or
  customer statistics in the app. Add real ones only.

## Before launch

1. Confirm plan pricing (`plans` table) and dish pricing with the kitchen.
2. Configure Google and SMS providers in Supabase if those sign-in
   methods should work.
3. Photograph the 9 “Needs photo” dishes and re-import.
4. Delivery is a pincode rule (`SERVICE_AREAS` in `src/lib/delivery.js`);
   swap in a Distance Matrix/Places lookup when ready.
