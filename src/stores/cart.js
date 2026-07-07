import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────
// Shopping cart. `items` is the canonical cart used by the
// storefront, order, and WhatsApp message ({ name, qty, notes }).
// `order` is a flat, reorderable list of meal instances
// ({ id, name }) — one per unit of quantity — that drives the
// day-by-day layout on the meal-plan page and can be dragged
// around. The two are kept in sync. Both persist across refreshes.
// ─────────────────────────────────────────────────────────────

let _seq = 0;
const uid = () => 'm' + (++_seq) + Math.random().toString(36).slice(2, 6);

// Reconcile `order` with item quantities, preserving the existing
// arrangement; any new instances are appended at the end.
const syncOrder = (items, order) => {
  const want = {}; items.forEach((it) => { want[it.name] = it.qty; });
  const seen = {};
  const kept = [];
  for (const o of order) {
    const c = seen[o.name] || 0;
    if (c < (want[o.name] || 0)) { seen[o.name] = c + 1; kept.push(o); }
  }
  for (const it of items) {
    for (let k = (seen[it.name] || 0); k < it.qty; k++) kept.push({ id: uid(), name: it.name });
  }
  return kept;
};

export const useCart = create(persist(
  (set, get) => ({
    items: [], // [{ name, qty, notes }]
    order: [], // [{ id, name }]  — one entry per meal instance

    add: (name) => set((s) => {
      const existing = s.items.find((i) => i.name === name);
      const items = existing
        ? s.items.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i))
        : [...s.items, { name, qty: 1, notes: '' }];
      return { items, order: syncOrder(items, s.order) };
    }),

    setQty: (name, qty) => set((s) => {
      const items = qty <= 0
        ? s.items.filter((i) => i.name !== name)
        : s.items.find((i) => i.name === name)
          ? s.items.map((i) => (i.name === name ? { ...i, qty } : i))
          : [...s.items, { name, qty, notes: '' }];
      return { items, order: syncOrder(items, s.order) };
    }),

    setNotes: (name, notes) => set((s) => ({ items: s.items.map((i) => (i.name === name ? { ...i, notes } : i)) })),

    remove: (name) => set((s) => {
      const items = s.items.filter((i) => i.name !== name);
      return { items, order: syncOrder(items, s.order) };
    }),

    clear: () => set({ items: [], order: [] }),

    // Replace the cart wholesale (used when hydrating from Supabase).
    hydrate: (items) => set((s) => ({ items, order: syncOrder(items, s.order) })),

    // ── meal-plan (day layout) operations, keyed by instance id ──
    reorder: (activeId, overId) => set((s) => {
      const from = s.order.findIndex((o) => o.id === activeId);
      const to = s.order.findIndex((o) => o.id === overId);
      if (from === -1 || to === -1 || from === to) return {};
      const order = [...s.order];
      const [m] = order.splice(from, 1);
      order.splice(to, 0, m);
      return { order };
    }),

    removeInstance: (id) => set((s) => {
      const entry = s.order.find((o) => o.id === id);
      if (!entry) return {};
      const order = s.order.filter((o) => o.id !== id);
      const items = s.items.map((i) => (i.name === entry.name ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0);
      return { items, order };
    }),

    replaceInstance: (id, newName) => set((s) => {
      const idx = s.order.findIndex((o) => o.id === id);
      if (idx === -1) return {};
      const oldName = s.order[idx].name;
      const order = [...s.order]; order[idx] = { id: uid(), name: newName };
      let items = s.items.map((i) => (i.name === oldName ? { ...i, qty: i.qty - 1 } : i)).filter((i) => i.qty > 0);
      const ex = items.find((i) => i.name === newName);
      items = ex ? items.map((i) => (i.name === newName ? { ...i, qty: i.qty + 1 } : i)) : [...items, { name: newName, qty: 1, notes: '' }];
      return { items, order };
    }),

    qtyOf: (name) => get().items.find((i) => i.name === name)?.qty || 0,
  }),
  {
    name: 'leankitchen.cart',
    // Rebuild `order` from items on load so older saved carts (and any
    // drift) always yield a valid day layout.
    merge: (persisted, current) => {
      const merged = { ...current, ...(persisted || {}) };
      merged.order = syncOrder(merged.items || [], merged.order || []);
      return merged;
    },
  }
));

export const cartCount = (items) => items.reduce((s, i) => s + i.qty, 0);
