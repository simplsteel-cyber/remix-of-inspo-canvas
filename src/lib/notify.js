import { supabase } from './supabase.js';
import { priceOf } from './core.js';

// ─────────────────────────────────────────────────────────────
// Meal-plan change notifications. Every call does two best-effort
// things and never throws into the UI:
//   1. logs the change to `meal_plan_events` (audit trail), and
//   2. invokes the `notify-meal-plan` edge function to email the
//      kitchen (saporifer@gmail.com).
// If the tables/function aren't set up yet, it silently no-ops.
// ─────────────────────────────────────────────────────────────

export async function notifyMealPlanChange({ event = 'meal_plan_updated', user, profile = {}, items = [], plan = null, overage = null }) {
  const subtotal = items.reduce((s, i) => s + (priceOf(i) || 0) * (i.qty || 1), 0);
  const lineItems = items.map((i) => ({ name: i.name, qty: i.qty || 1, notes: i.notes || '', kcal: i.kcal ?? null, protein: i.protein ?? null }));
  const customer = { name: profile.name || '', email: user?.email || '', phone: profile.phone || user?.phone || '', goal: profile.goal || '', dietPref: profile.dietPref || '' };
  const payload = { event, customer, items: lineItems, plan: plan && { name: plan.name, meals: plan.meals, perMeal: plan.perMeal }, subtotal, overage };

  // 1. Audit log (RLS allows own / guest inserts).
  try {
    await supabase.from('meal_plan_events').insert({ user_id: user?.id ?? null, email: customer.email || null, event, payload });
  } catch { /* table may not exist yet */ }

  // 2. Email via edge function.
  try {
    await supabase.functions.invoke('notify-meal-plan', { body: payload });
  } catch { /* function may not be deployed yet */ }
}

// Debounce so a burst of taps sends one "you finished selecting" email.
export function makeDebouncedNotifier(delay = 2500) {
  let t;
  return (args) => {
    clearTimeout(t);
    t = setTimeout(() => notifyMealPlanChange(args), delay);
  };
}
