# Lean Kitchen — by Black Olive · Chef Ali

Mobile-first React web app (PWA-ready) for the Lean Kitchen meal subscription MVP.
Menu browsing, onboarding, plans, in-app cart/checkout (simulated payment), nutrition
basics, and WhatsApp for support, questions, and dietitian booking.

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
│       └── meals/*.webp          # 51 dish photos (800×600 webp)
├── src/
│   ├── App.jsx                   # shell: stage/tab routing, cart, nav
│   ├── main.jsx                  # entry point
│   ├── index.css                 # Tailwind + global styles
│   ├── components/
│   │   ├── ui.jsx                # Btn, Img, DietDot, Stars, QtyOrAdd, Sheet, Field
│   │   └── meals.jsx             # MealCard, MealDetail, SearchOverlay
│   ├── screens/
│   │   ├── Onboarding.jsx        # Welcome (login/guest), Register, 4-step onboarding
│   │   ├── Home.jsx              # hero, badges, plans, most loved, categories, testimonials, promo
│   │   ├── Meals.jsx             # category chips + diet filter + meal list
│   │   ├── Orders.jsx            # cart → checkout → confirmation (payment simulated)
│   │   └── Extras.jsx            # Nutrition (BMI, water), Account (profile, support)
│   ├── lib/
│   │   └── core.js               # palette, plans, categories, helpers, WhatsApp number
│   └── data/
│       ├── dishes.json           # 60 dishes from the master menu spreadsheet
│       └── images.js             # dish name → image path (auto-generated)
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Before launch — placeholders to replace

1. **Plan pricing** — `PLANS` in `src/lib/core.js` (₹549/₹499/₹449 per meal are placeholders).
2. **Testimonials & reviews** — `TESTIMONIALS` in `src/lib/core.js` and the review quotes in
   `src/components/meals.jsx`. Replace with real customer quotes (fabricated reviews are
   prohibited under Indian consumer-protection rules).
3. **Carbs/fat figures** — estimated from calories and protein in `macros()` (`src/lib/core.js`),
   labelled "approx" in the UI. Replace with kitchen-verified grammage values in `dishes.json`.
4. **Social proof numbers** — "4,800+ customers / 95% renewal" in `src/screens/Home.jsx`;
   verify before publishing.
5. **Sign-in** — Google/Apple buttons are simulated; wire up real auth (e.g. Firebase Auth).
6. **Payment** — checkout is simulated; integrate Razorpay/Cashfree for UPI + subscriptions.
7. **Persistence** — profile/cart/orders are in-memory only; add a backend or local storage.

## Updating the menu

`src/data/dishes.json` mirrors the master menu spreadsheet (name, cuisine, diet, vegan flag,
base, side, price, kcal, protein, tags, section, description). Add new dish photos to
`public/images/meals/` as `<dish-name-slug>.webp` and register them in `src/data/images.js`.

## WhatsApp

The business number lives in `src/lib/core.js` (`WHATSAPP_NUMBER`). All WhatsApp links use
`wa.me` deep links with pre-filled text — no Business API approval needed.
