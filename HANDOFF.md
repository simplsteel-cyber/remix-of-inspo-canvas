# Lean Kitchen — session handoff

Paste the **"Handoff prompt"** section below into a fresh Claude Code chat
opened in this folder. This session's focus is **tweaks and finalization**,
not rebuilds.

---

## Quick status

Mobile-first React PWA for a Mumbai meal-subscription business
(**Lean Kitchen — by Black Olive · Chef Ali Azan**). Guests browse a
Supabase-backed menu, build a weekly plan, and **order via WhatsApp**
(no in-app payment). The core app is built and working; what remains is
finishing touches plus a few external setup steps.

### Outstanding items
1. **Google OAuth** — Google Cloud Console side is **done**. Remaining: paste
   the Client ID + Client Secret into Supabase → Auth → Providers → Google,
   toggle it on, and set Auth → URL Configuration (Site URL + Redirect URLs).
   No app code change needed unless debugging the flow.
2. **Email confirmation (SMTP)** — code is ready. To enable: toggle
   "Confirm email" ON in Supabase, paste `supabase/email-templates/confirm-signup.html`
   into the Confirm-signup template, and configure custom SMTP (Resend) for volume.
3. **Kitchen notification email** — edge function `notify-meal-plan` deployed +
   Resend key valid, but Resend's free tier only delivers to the account owner
   until a sending domain is verified. Deferred.
4. **Day-layout persistence** — the drag-reordered day order is localStorage-only,
   not saved to Supabase. Deferred (needs a `meal_plans` column).

### Housekeeping (user)
- Delete throwaway test users (`lk.*@gmail.com`, `leankitchen.testuser01@gmail.com`)
  in Supabase → Authentication → Users.
- Rotate the Supabase secret key that was pasted in an earlier chat (nothing uses it).
- Disconnect Lovable from the repo so it stops auto-pushing to `main`.

---

## Handoff prompt

You are picking up an in-progress app called "Lean Kitchen" — a mobile-first meal-subscription storefront. The previous session built it out; this session is for TWEAKS AND FINALIZATION, not rebuilds. Read this context fully before acting, and read the repo's key files before changing them.

PROJECT
- Purpose: guest-first storefront for a Mumbai meal-subscription business (brand: "Lean Kitchen — by Black Olive · Chef Ali Azan"). Kitchen in Lower Oshiwara, pincode 400102. Ordering is WhatsApp-only (wa.me/919892572408); there is NO in-app payment. Nutrition figures are kitchen ESTIMATES (labeled approx); there are deliberately no fabricated testimonials/ratings.
- Location on disk: C:\Users\sausa\Downloads\lean-kitchen-app\lean-kitchen-app  (note: doubly-nested folder). Windows; use PowerShell or the Bash tool.
- Tech stack: React 18 + Vite + Tailwind v4 + Supabase (@supabase/supabase-js) + Zustand + @dnd-kit + xlsx. IMPORTANT: this is NOT Remix — the GitHub repo is named "remix-of-inspo-canvas" but that's a Lovable artifact. Do NOT introduce @remix-run/react or any router; navigation is state-based via UserContext, and the browser back button is wired through the History API (pushState/popstate synced to route state in UserContext.jsx).

GIT / DEPLOY
- Repo: https://github.com/simplsteel-cyber/remix-of-inspo-canvas (public, branch main). Work is committed directly to main and pushed; Vercel (Hobby) auto-deploys main.
- There is NO global git identity. Commit with: git -c user.name="Lean Kitchen" -c user.email="govani.aimann@gmail.com" commit -m "..."
- Lovable may still be connected and can auto-push to main. Before pushing, always: git fetch origin, then merge origin/main. LF→CRLF warnings on Windows are normal — ignore them.
- gh CLI is installed at "/c/Program Files/GitHub CLI/gh.exe" (not on PATH), authed as simplsteel-cyber.

SUPABASE (backend — already set up and live)
- Project ref: wyvgexbccmkyggyltycy (https://wyvgexbccmkyggyltycy.supabase.co). The publishable/anon key is in .env and as a fallback in src/lib/supabase.js (safe, public). Do NOT put the secret key anywhere.
- Tables (all with RLS): meals (60 rows, 50 available), plans (3), profiles, meal_plans (per-user cart+plan), meal_plan_events (audit + email trigger). SQL lives in supabase/migrations/0001 and 0002; regenerate seed via scripts/generate-seed.mjs.
- Menu is served dynamically from Supabase (src/lib/menu.js, src/context/MenuContext.jsx); bundled src/data/dishes.json is only an offline fallback.
- Admin: /admin route (lazy-loaded) gated on profiles.role='admin', uploads the "Master Menu" sheet of an Excel and upserts meals. To grant admin, run in Supabase SQL editor: update profiles set role='admin' where id='<auth user id>';
- Email confirmation is currently OFF in the dashboard (signups log in immediately). The code already handles it being turned ON (auth returns {pendingConfirmation}; Welcome shows a "check your email" state; template at supabase/email-templates/confirm-signup.html).

ARCHITECTURE (read these before editing)
- src/App.jsx: shell — fixed brand header ("The Lean Kitchen") with top-right sign-in/create-account icons for guests (person / person-plus) or profile icon when signed in; bottom tabs Home/Meals/Order/My Plan/Profile; floating WhatsApp button; a debounced "meal plan changed" notifier; the /admin route; MealDetail overlay.
- src/context/UserContext.jsx: session (Supabase), profile (synced to profiles table), delivery, selected plan, routing + History API back-button integration, favourites, recentlyViewed, payExtras. Actions: choosePlan (→ My Plan tab), startWithPlan (post-signup → Meals), quickStartStarter (pre-fill 6 meals → My Plan), autofillPlan (fill remaining slots with recommendDishes), go/goBack, setStage/setStep.
- src/context/MenuContext.jsx: dishes + plans + loading state.
- src/stores/cart.js (Zustand, persisted): items [{name,qty,notes}] is the cart; order [{id,name}] is a reorderable per-instance list driving the day-wise plan view. Kept in sync; hydrated from Supabase on sign-in.
- src/lib/: supabase.js; auth.js (Google OAuth + Email/password only — phone was removed); menu.js (toAppDish adds a cleaned `title`); core.js (palette C, plans fallback, filters, recommendDishes, orderEnquiry + planUpdateMessage WhatsApp builders, cleanName/fixSpelling/titleOf, CATEGORY_CARDS, cartMealCount/planOverage, waLink, inr); delivery.js (SERVICE_AREAS pincode rule, Maps-API-ready shape); storage.js; mealPlan.js; notify.js (writes meal_plan_events + invokes edge function); importMenu.js (Excel parser).
- src/screens/: Onboarding.jsx (Welcome auth + Register + RegisterSuccess + 5-step Onboarding), Home.jsx (hero → plans → feature pointers → recommended/most-loved), Meals.jsx (hub with category image-cards + PlanTicker; dedicated CategoryScreen with filters/collapsing sticky bar), Subscription.jsx (the "Order" cart screen), Extras.jsx (MealPlanScreen = "My Meal Plan" day-wise drag-and-drop planner + Save Changes toast; AccountScreen = "Profile"), Admin.jsx.
- src/components/: ui.jsx (Btn, Img, Skeleton, DietDot, Sheet, BackBtn, SearchInput, cardStyle), meals.jsx (MealCard, MiniMealCard, MealDetail, CartControl "Add to Plan"), delivery.jsx (DeliveryForm with "Use my location" geolocation + reverse geocode), plans.jsx (PlanCompareSheet).
- supabase/functions/notify-meal-plan/index.ts: Deno edge function that emails the kitchen via Resend.

KEY BEHAVIORS / INVARIANTS — preserve these
- GUEST-FIRST: never force login to browse, build a plan, reorder, or Save Changes. Registration is only nudged near the final order/save step. Delivery check is NON-BLOCKING (a chip, never a gate).
- Dish DISPLAY names use dish.title (cleaned: fixes "Vegitables"->"Vegetables", spacing, and lowercases mid-title connectors). dish.name stays RAW and is the identity key for images (src/data/images.js IMG map), TRENDING matching, and cart keys. Never render dish.name directly in UI — use dish.title || dish.name.
- WhatsApp order message format (orderEnquiry in core.js): greeting, then Name/Goal/Delivery, then Plan, then Meals, then Note(s). planUpdateMessage lists added/removed diffs.
- Plan overage: if selected meals exceed plan.meals, prompt to change plan or "pay for extras" (payExtras flag); the WhatsApp note reflects the choice.

DEV / VERIFICATION WORKFLOW
- Use the preview tools. Typical loop: preview_start (server name "lean-kitchen-app"), preview_eval to clear localStorage + reload, drive the UI via preview_eval (state-based app, so programmatic clicks work well), check preview_console_logs for errors, preview_screenshot to confirm. Reset viewport after using mobile preset.
- If a stray node process holds port 5173, kill it before preview_start.
- If `vite` fails with "Cannot find native binding" (Tailwind v4 on Node 18), run: npm install --no-save @tailwindcss/oxide-win32-x64-msvc@<installed version>. Screenshots occasionally time out transiently — just retry.
- Always run `npm run build` to catch errors before committing.

OUTSTANDING ITEMS (finalization)
1. Google OAuth: code is ready (auth.signInWithGoogle) and the Google Cloud Console side is DONE. Remaining is dashboard-only: paste Client ID + Secret into Supabase -> Auth -> Providers -> Google, enable it, and set Auth -> URL Configuration. No code change unless debugging.
2. Email confirmation: to enable, the user toggles "Confirm email" ON in Supabase, pastes supabase/email-templates/confirm-signup.html into the Confirm-signup template, and configures custom SMTP (Resend) for volume. Code already handles it.
3. Kitchen notification email: edge function deployed + Resend key valid, but Resend free tier only delivers to the account owner until a sending domain is verified. Deferred until domain verification.
4. The drag-reordered day layout persists in localStorage only (not to Supabase) — deferred; would need a meal_plans column.

CRITICAL WORKING STYLE
- You CANNOT see external dashboards (Google Cloud Console, Supabase dashboard, Vercel, GoDaddy, Resend). For anything in those, either say plainly "I'm not certain of the current UI" or ask the user for a screenshot and react to what's actually shown — do NOT guess at menu labels or click paths. The user is sensitive to this (a prior session wasted time guessing). Code changes you can verify in the browser; external UIs you cannot.
- Prefer small, verified changes. Confirm each change in the browser (or with a build) before committing and pushing.

Start by confirming you've read this, then ask me what tweak to tackle first — or if I've given a task, verify current state with the preview tools before changing anything.
