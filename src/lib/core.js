// ─────────────────────────────────────────────────────────────
// Lean Kitchen — shared constants and helpers
// ─────────────────────────────────────────────────────────────
import dishes from '../data/dishes.json';

export const DISHES = dishes;

export const WHATSAPP_NUMBER = '919892572408';

// Placeholder plan pricing — confirm real numbers before launch
export const PLANS = [
  { id: 'starter', name: 'Starter Week', meals: 6, perMeal: 549, desc: 'Six chef-crafted meals to try us out. Pick any dishes you like.' },
  { id: 'weekly', name: 'Weekly Plan', meals: 12, perMeal: 499, desc: 'Lunch and dinner, six days a week. The menu rotates so it never repeats.', popular: true },
  { id: 'monthly', name: 'Monthly Plan', meals: 24, perMeal: 449, desc: 'A month of meals matched to your goal, with a dietitian consultation included.' },
];

export const C = {
  white: '#FFFFFF', warm: '#FCFBF8', grey: '#F5F6F7', sage: '#8DBB74',
  mint: '#DFF3E3', cta: '#6BAA4E', orange: '#F4A261', ink: '#2D2D2D',
  mute: '#7A7F78', line: '#ECEDEA', veg: '#2e7d32', nonveg: '#a03c2e', wa: '#1faa53',
};

// Dark palette — used by the Home (landing/dashboard) screen
export const CD = {
  bg: '#14150F', card: '#1E211A', card2: '#262A21',
  line: '#333831', ink: '#F2F3EE', mute: '#9BA398',
};
export const serif = { fontFamily: "'Cormorant Garamond', Georgia, serif" };
export const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

export const hash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
export const rating = (d) => (4.2 + (hash(d.name) % 8) / 10).toFixed(1);
export const reviews = (d) => 18 + (hash(d.name) % 120);
export const macros = (d) => {
  if (!d.kcal || !d.protein) return { carbs: null, fat: null };
  const rem = Math.max(d.kcal - d.protein * 4, 0);
  return { carbs: Math.round((rem * 0.6) / 4), fat: Math.round((rem * 0.4) / 9) };
};
export const waLink = (t) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(t)}`;
export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');

export const TRENDING = ['Healthy Mediterranean Bowl', 'Grilled Chicken Steak', 'Chilli Basil Paneer', 'Goan Fish Curry', 'Veg Korean Rice', 'Mutton Rogan Josh', 'Pesto Grilled Cottage Cheese', 'Chicken Green Thai Curry'];

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
export const POPULAR_SEARCHES = ['Paneer', 'High protein', 'Thai curry', 'Bowls', 'Fish', 'Vegan'];

// Placeholder testimonials — replace with real customer quotes before launch
export const TESTIMONIALS = [
  { name: 'Riya S.', text: 'The meals actually taste like a restaurant made them — because one did. Hitting my protein target has never been this easy.' },
  { name: 'Kunal M.', text: 'Clean food without the sad-salad feeling. Delivery is on time every single day.' },
  { name: 'Ayesha F.', text: 'I told them my goal and allergies once. Every meal since has just… fit.' },
];
