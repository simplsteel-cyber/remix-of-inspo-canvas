// ─────────────────────────────────────────────────────────────
// Lean Kitchen — shared constants and helpers.
// Menu data lives in Supabase (see lib/menu.js); constants here
// are UI configuration and offline fallbacks only.
// ─────────────────────────────────────────────────────────────

export const WHATSAPP_NUMBER = '919892572408';

// Offline/bootstrap fallback — the live plans come from the
// `plans` table. Confirm real pricing with the kitchen.
export const FALLBACK_PLANS = [
  {
    id: 'starter', name: 'Starter Week', meals: 6, perMeal: 549, duration: '1 week', bestFor: 'Trying us out',
    desc: 'Six chef-crafted meals to try us out. Pick any dishes you like.',
    benefits: ['Pick any 6 dishes from the menu', 'No commitment beyond one week', 'Free delivery within 5 km'],
    included: ['6 chef-crafted meals', 'Nutrition details with every dish', 'WhatsApp support'],
    dietitian: false,
  },
  {
    id: 'weekly', name: 'Weekly Plan', meals: 12, perMeal: 499, duration: 'Renews every week', bestFor: 'Everyday routine', popular: true,
    desc: 'Lunch and dinner, six days a week. The menu rotates so it never repeats.',
    benefits: ['₹50 less per meal than Starter', 'Rotating menu — never repeats', 'Pause, swap, or adjust any week'],
    included: ['12 chef-crafted meals a week', 'Menu planned around your goal', 'Priority WhatsApp support'],
    dietitian: false,
  },
  {
    id: 'monthly', name: 'Monthly Plan', meals: 24, perMeal: 449, duration: '4 weeks', bestFor: 'Committed goals',
    desc: 'A month of meals matched to your goal, with a dietitian consultation included.',
    benefits: ['Best price — ₹100 less per meal than Starter', 'Dietitian consultation included', 'Pause, swap, or adjust any week'],
    included: ['24 chef-crafted meals', 'One dietitian consultation', 'Monthly progress check-in'],
    dietitian: true,
  },
];

export const C = {
  white: '#FFFFFF', warm: '#FCFBF8', grey: '#F5F6F7', sage: '#8DBB74',
  mint: '#DFF3E3', cta: '#6BAA4E', orange: '#F4A261', ink: '#2D2D2D',
  mute: '#7A7F78', line: '#ECEDEA', veg: '#2e7d32', nonveg: '#a03c2e', wa: '#1faa53',
};
export const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
export const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

// Nutrition figures are kitchen estimates; carbs/fat are derived.
export const macros = (d) => {
  if (!d.kcal || !d.protein) return { carbs: null, fat: null };
  const rem = Math.max(d.kcal - d.protein * 4, 0);
  return { carbs: Math.round((rem * 0.6) / 4), fat: Math.round((rem * 0.4) / 9) };
};
export const waLink = (t) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`;
export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export const TRENDING = ['Healthy Mediterranean Bowl', 'Grilled Chicken Pomodoro', 'Paneer In Blackbean Sauce', 'Fish Goan Curry', 'Korean Tofu Bowl', 'Smoke Mutton Handi', 'Sundried Tomato Pesto Grilled Tofu', 'Chicken And Veg Thai Curry'];

export const CATS = {
  'Trending': (d) => TRENDING.includes(d.name),
  'High Protein': (d) => d.protein >= 38,
  'Vegan': (d) => d.vegan,
  'Bowls': (d) => /bowl/i.test(d.name),
  'Chicken': (d) => /chicken/i.test(d.name),
  'Seafood': (d) => /fish|seabass|prawn|gamberi/i.test(d.name),
  'Indian': (d) => d.cuisine === 'Indian',
  'Continental': (d) => d.cuisine === 'Continental',
  'Asian': (d) => d.cuisine === 'Asian',
  "Chef's Picks": (d) => TRENDING.includes(d.name),
  'Plant Powered': (d) => d.vegan,
  'Everyday Wellness': (d) => d.kcal && d.kcal <= 550,
  'Performance': (d) => d.protein >= 42,
  'Mediterranean': (d) => /mediterranean|pesto|sumac/i.test(d.name + d.desc),
  'Indian Classics': (d) => d.cuisine === 'Indian',
  'Asian Bowls': (d) => d.cuisine === 'Asian',
};
export const MENU_CHIPS = ['Trending', 'High Protein', 'Vegan', 'Bowls', 'Chicken', 'Seafood', 'Indian', 'Continental', 'Asian'];
export const HOME_TILES = ["Chef's Picks", 'High Protein', 'Plant Powered', 'Everyday Wellness', 'Performance', 'Mediterranean', 'Indian Classics', 'Asian Bowls'];

// Category cards for the Meals page. `image` is a representative dish
// name resolved against the bundled photo map (IMG).
export const CATEGORY_CARDS = [
  { key: 'High Protein', title: 'High protein', subtitle: 'Build and recover', image: 'Grilled Chicken Pomodoro' },
  { key: 'Vegan', title: 'Vegan', subtitle: 'Fully plant-based', image: 'Korean Tofu Bowl' },
  { key: 'Seafood', title: 'Seafood', subtitle: 'Omega-rich fish & prawns', image: 'Fish Goan Curry' },
  { key: 'Chicken', title: 'Chicken', subtitle: 'Lean, high-protein mains', image: 'Kadai Chicken' },
  { key: 'Indian', title: 'Indian', subtitle: 'Regional home-style plates', image: 'Paneer Do Piyaza' },
  { key: 'Continental', title: 'Continental', subtitle: 'Grills, pasta & bowls', image: 'Seared Seabass Creamy Basil Sauce' },
  { key: 'Asian', title: 'Asian', subtitle: 'Wok-tossed & aromatic', image: 'Black Pepper Paneer' },
];

// Meal counting + plan-allowance overage.
export const cartMealCount = (items) => items.reduce((s, i) => s + (i.qty || 1), 0);
export const planOverage = (plan, count) => (plan && count > plan.meals ? count - plan.meals : 0);

// Some dishes carry '500/750' (two portion prices) or '' — take the base price.
export const priceOf = (d) => parseInt(d.price, 10) || null;

// Filter groups for the category pages. Each option is a predicate.
export const FILTER_GROUPS = {
  cuisine: {
    label: 'Cuisine',
    options: {
      'Indian': (d) => d.cuisine === 'Indian',
      'Continental': (d) => d.cuisine === 'Continental',
      'Asian': (d) => d.cuisine === 'Asian',
    },
  },
  type: {
    label: 'Meal type',
    options: {
      'Lean & Light': (d) => d.section === 'Lean & Light',
      'Balanced Plates': (d) => d.section === 'Balanced Plates',
      'High-Protein Power': (d) => d.section === 'High-Protein Power',
      'Vegetarian Favourites': (d) => d.section === 'Vegetarian Favourites',
      'Plant-Based & Vegan': (d) => d.section === 'Plant-Based & Vegan',
    },
  },
  protein: {
    label: 'Protein',
    options: {
      '30g or more': (d) => d.protein >= 30,
      '40g or more': (d) => d.protein >= 40,
      '45g or more': (d) => d.protein >= 45,
    },
  },
  kcal: {
    label: 'Calories',
    options: {
      'Under 550': (d) => d.kcal && d.kcal <= 550,
      '550 to 650': (d) => d.kcal > 550 && d.kcal <= 650,
      'Over 650': (d) => d.kcal > 650,
    },
  },
  price: {
    label: 'Price',
    options: {
      'Under ₹500': (d) => priceOf(d) !== null && priceOf(d) < 500,
      '₹500 to ₹600': (d) => priceOf(d) !== null && priceOf(d) >= 500 && priceOf(d) <= 600,
      'Over ₹600': (d) => priceOf(d) !== null && priceOf(d) > 600,
    },
  },
};

export const SORTS = {
  'Menu order': () => 0,
  'Highest protein': (a, b) => b.protein - a.protein,
  'Price: low to high': (a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity),
  'Calories: low to high': (a, b) => (a.kcal ?? Infinity) - (b.kcal ?? Infinity),
};

// Which plans a dish rotates through. Premium dishes (₹650+) only
// appear in the larger plans — confirm the rule with the kitchen.
export const plansForDish = (d, plans) => {
  const p = priceOf(d);
  return p !== null && p >= 650 ? plans.filter((x) => x.id !== 'starter') : plans;
};

// Profile-aware picks: respect diet preference, then bias toward the
// user's goal, and fall back to the full pool when it runs thin.
export const recommendDishes = (profile = {}, dishes = [], limit = 6) => {
  const goalRule = {
    'Weight loss': (d) => d.kcal && d.kcal <= 550,
    'Muscle gain': (d) => d.protein >= 40,
    'Athletic performance': (d) => d.protein >= 42,
    'Everyday wellness': (d) => d.kcal && d.kcal <= 650,
  }[profile.goal];
  const dietOk = (d) =>
    profile.dietPref === 'Vegetarian' ? d.diet === 'Veg'
      : profile.dietPref === 'Vegan' ? d.vegan
        : profile.dietPref === 'Non-vegetarian' ? d.diet === 'Non-Veg'
          : true;
  const pool = dishes.filter(dietOk);
  const primary = goalRule ? pool.filter(goalRule) : pool;
  const list = primary.length >= limit ? primary : pool;
  return [...list].sort(SORTS['Highest protein']).slice(0, limit);
};

// ── WhatsApp order builder — the entire "checkout" ───────────
// Cart items: [{ dish, qty, notes }]
export const orderEnquiry = ({ profile = {}, plan = null, items = [], delivery = null, payExtras = false }) => {
  const where = [profile.deliveryAddress, delivery?.pincode && `PIN ${delivery.pincode}`].filter(Boolean).join(' · ');
  const count = items.reduce((s, { qty }) => s + qty, 0);

  const lines = ['Hi Lean Kitchen! I would like to order.', ''];
  if (profile.name) lines.push(`Name: ${profile.name}`);
  if (profile.goal) lines.push(`Goal: ${profile.goal}`);
  lines.push(`Delivery: ${where || 'to be confirmed'}`);

  lines.push('', `Plan: ${plan ? `${plan.name} — ${plan.meals} meals at ${inr(plan.perMeal)}/meal` : 'None selected'}`);

  if (items.length) {
    lines.push('', 'Meals:');
    items.forEach(({ dish, qty }, i) => lines.push(`${i + 1}. ${dish.name}${qty > 1 ? ` x${qty}` : ''}`));
  }

  const notes = [];
  items.forEach(({ dish, notes: n }) => { if (n) notes.push(`${dish.name}: ${n}`); });
  if (plan && count > plan.meals) {
    const extra = count - plan.meals;
    notes.push(`${extra} meal(s) over the ${plan.name} allowance — ${payExtras ? 'will pay for extras' : 'please advise on pricing'}`);
  }
  if (profile.nutritionistRef) notes.push(`Nutritionist reference: ${profile.nutritionistRef}`);
  if (notes.length) { lines.push('', 'Note(s):'); notes.forEach((n) => lines.push(`- ${n}`)); }

  return lines.join('\n');
};
