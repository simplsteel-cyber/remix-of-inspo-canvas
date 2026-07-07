import { supabase } from './supabase.js';

// ─────────────────────────────────────────────────────────────
// Per-user meal-plan persistence in Supabase (`meal_plans`).
// Stores the chosen meals, selected plan, and pay-extras flag as a
// single row so it survives across devices. Best-effort: if the
// table isn't there yet, load returns null and save no-ops.
// ─────────────────────────────────────────────────────────────

export async function loadMealPlan(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase.from('meal_plans').select('*').eq('user_id', userId).maybeSingle();
    if (error || !data) return null;
    return {
      items: Array.isArray(data.items) ? data.items : [],
      planId: data.plan_id || null,
      payExtras: !!data.pay_extras,
    };
  } catch {
    return null;
  }
}

export async function saveMealPlan(userId, { items = [], planId = null, payExtras = false }) {
  if (!userId) return;
  try {
    await supabase.from('meal_plans').upsert({
      user_id: userId,
      items,
      plan_id: planId,
      pay_extras: payExtras,
      updated_at: new Date().toISOString(),
    });
  } catch { /* table may not exist yet */ }
}
