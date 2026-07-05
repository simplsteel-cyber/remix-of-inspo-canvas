// ─────────────────────────────────────────────────────────────
// Lean Kitchen — shared constants and helpers
// ─────────────────────────────────────────────────────────────
import dishes from '../data/dishes.json';

export const DISHES = dishes;

export const WHATSAPP_NUMBER = '919892572408';

// Placeholder plan pricing — confirm real numbers before launch
export const PLANS = [
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

// Pre-filled WhatsApp enquiry for a subscription — this is the whole
// "checkout": every plan ends in a personal conversation, not a payment.
export const subscriptionEnquiry = ({ profile = {}, plan, delivery = null }) => {
  const where = [profile.deliveryAddress, delivery?.pincode && `PIN ${delivery.pincode}`].filter(Boolean).join(' · ');
  return [
    `Hi Lean Kitchen! I'd like to subscribe to the ${plan.name} — ${plan.meals} meals at ${inr(plan.perMeal)} per meal.`,
    profile.name && `Name: ${profile.name}`,
    profile.goal && `Goal: ${profile.goal}`,
    profile.dietPref && profile.dietPref !== 'No preference' && `Diet preference: ${profile.dietPref}`,
    where && `Delivery: ${where}`,
    profile.nutritionistRef && `Nutritionist reference: ${profile.nutritionistRef}`,
  ].filter(Boolean).join('\n');
};

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
