# Lean Kitchen — by Black Olive · Chef Ali Azan

Mobile-first React web app (PWA-ready) for the Lean Kitchen meal subscription MVP.
Menu browsing, authentication, onboarding, delivery eligibility, plan comparison,
nutrition basics, and a WhatsApp-first subscription enquiry flow — there is no
in-app payment; every plan ends in a personal WhatsApp conversation.

## Quick start

```bash
npm install
npm run dev        # local dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # preview the production build
```

Requires Node.js 18+.

## Project structure

```
lean-kitchen-app/
├── public/
│   └── images/
│       ├── hero.webp             # home/welcome hero
│       └── meals/*.webp          # dish photos (800×600 webp)
├── src/
│   ├── App.jsx                   # shell: stage/tab rendering, nav, overlays
│   ├── main.jsx                  # entry point (wraps App in UserProvider)
│   ├── index.css                 # Tailwind + global styles
│   ├── context/
│   │   └── UserContext.jsx       # central state: session, profile, delivery, plan, routing (persisted)
│   ├── lib/
│   │   ├── core.js               # palette, plans, categories, helpers, WhatsApp enquiry builder
│   │   ├── auth.js               # auth service — swap LocalAuthProvider for Firebase/Supabase
│   │   ├── delivery.js           # delivery eligibility — swap rule for Maps Distance Matrix/Places
│   │   └── storage.js            # namespaced localStorage wrapper
│   ├── components/
│   │   ├── ui.jsx                # Btn, Img, Skeleton, DietDot, Stars, Sheet, Field
│   │   ├── delivery.jsx          # DeliveryForm + DeliveryStatus (shared eligibility UI)
│   │   └── meals.jsx             # MealCard, MealDetail, SearchOverlay
│   ├── screens/
│   │   ├── Onboarding.jsx        # Welcome (email/phone/Google), Register, success, onboarding steps
│   │   ├── Home.jsx              # hero, delivery badge, plan comparison, most loved, categories
│   │   ├── Meals.jsx             # category chips + diet filter + meal list
│   │   ├── Subscription.jsx      # plan details, benefits, WhatsApp enquiry CTA
│   │   └── Extras.jsx            # Nutrition (BMI, water), Account (editable profile, support)
│   └── data/
│       ├── dishes.json           # 60 dishes from the master menu spreadsheet
│       └── images.js             # dish name → image path (auto-generated)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Architecture notes

- **Authentication** — `src/lib/auth.js` exposes `auth.signInWithEmail/Phone/Google`.
  The current `LocalAuthProvider` simulates a backend on-device; implement the same
  `signIn`/`signOut` interface against Firebase or Supabase and swap one constant.
  Sessions persist in localStorage, so returning users stay signed in and land on
  the homepage.
- **Delivery eligibility** — `src/lib/delivery.js#checkDelivery` is async and returns
  `{ status, freeDelivery, pincode, label, detail }`. Today it's a pincode rule
  (400102 → free delivery; anything else → confirmed after enquiry); replace the
  body with a Google Maps Distance Matrix / Places lookup without touching callers.
- **State & routing** — `src/context/UserContext.jsx` owns session, profile, delivery,
  selected plan, and the route (stage/tab/step). Everything is persisted, so a
  refresh resumes mid-onboarding.
- **Subscriptions** — there is no cart or checkout. Selecting a plan opens the
  Subscription page; the only CTA is a WhatsApp message pre-filled by
  `subscriptionEnquiry()` in `core.js` (name, plan, goal, diet preference,
  delivery, nutritionist reference).

## Before launch — placeholders to replace

1. **Plan pricing** — `PLANS` in `src/lib/core.js` (₹549/₹499/₹449 per meal are placeholders).
2. **Testimonials & reviews** — `TESTIMONIALS` in `src/lib/core.js` and the review quotes in
   `src/components/meals.jsx`. Replace with real customer quotes (fabricated reviews are
   prohibited under Indian consumer-protection rules).
3. **Carbs/fat figures** — estimated from calories and protein in `macros()` (`src/lib/core.js`),
   labelled "approx" in the UI. Replace with kitchen-verified grammage values in `dishes.json`.
4. **Social proof numbers** — "4,800+ customers / 95% renewal" in `src/screens/Home.jsx`;
   verify before publishing.
5. **Sign-in** — simulated on-device; wire `src/lib/auth.js` to Firebase Auth or Supabase.
6. **Delivery radius** — pincode rule only; wire `src/lib/delivery.js` to a distance API.
7. **Persistence** — profile/plan/delivery live in localStorage; move to a backend
   when auth goes live.

## Updating the menu

`src/data/dishes.json` mirrors the master menu spreadsheet (name, cuisine, diet, vegan flag,
base, side, price, kcal, protein, tags, section, description). Add new dish photos to
`public/images/meals/` as `<dish-name-slug>.webp` and register them in `src/data/images.js`.

## WhatsApp

The business number lives in `src/lib/core.js` (`WHATSAPP_NUMBER`). All WhatsApp links use
`wa.me` deep links with pre-filled text — no Business API approval needed.
