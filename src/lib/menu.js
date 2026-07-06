import { supabase } from './supabase.js';
import { FALLBACK_PLANS } from './core.js';
import fallbackDishes from '../data/dishes.json';

// DB row (snake_case) → the dish shape the UI components consume.
// Lives here (not in importMenu.js) so the xlsx parser stays out
// of the main bundle — it loads only with the /admin chunk.
const toAppDish = (m) => ({
  name: m.name,
  cuisine: m.cuisine || '',
  diet: m.diet || '',
  vegan: !!m.vegan,
  base: m.base || '',
  side: m.side || '',
  price: m.price ?? '',
  kcal: m.kcal ?? null,
  protein: m.protein ?? null,
  tags: m.tags || [],
  section: m.section || '',
  desc: m.description || '',
  image: m.image || null,
  availability: m.availability !== false,
});

// ─────────────────────────────────────────────────────────────
// Menu data access. Supabase is the source of truth; the bundled
// JSON is an offline/bootstrap fallback so the storefront never
// renders empty if the database is unreachable or not yet seeded.
// ─────────────────────────────────────────────────────────────

export async function fetchMeals() {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('availability', true)
    .order('name');
  if (error || !data?.length) {
    if (error) console.warn('[menu] meals fetch failed, using bundled fallback:', error.message);
    return { dishes: fallbackDishes, source: 'fallback' };
  }
  return { dishes: data.map(toAppDish), source: 'supabase' };
}

const toAppPlan = (p) => ({
  id: p.id, name: p.name, meals: p.meals, perMeal: p.per_meal,
  duration: p.duration, bestFor: p.best_for, desc: p.description,
  benefits: p.benefits || [], included: p.included || [],
  dietitian: !!p.dietitian, popular: !!p.popular,
});

export async function fetchPlans() {
  const { data, error } = await supabase.from('plans').select('*').order('sort');
  if (error || !data?.length) {
    if (error) console.warn('[menu] plans fetch failed, using bundled fallback:', error.message);
    return { plans: FALLBACK_PLANS, source: 'fallback' };
  }
  return { plans: data.map(toAppPlan), source: 'supabase' };
}
