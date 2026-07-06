import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────
// Shopping cart. Items reference dishes by name (the menu's
// natural key); quantities and per-item notes ride along. The
// cart persists across refreshes and feeds the WhatsApp order.
// ─────────────────────────────────────────────────────────────

export const useCart = create(persist(
  (set, get) => ({
    items: [], // [{ name, qty, notes }]

    add: (name) => set((s) => {
      const existing = s.items.find((i) => i.name === name);
      if (existing) return { items: s.items.map((i) => (i.name === name ? { ...i, qty: i.qty + 1 } : i)) };
      return { items: [...s.items, { name, qty: 1, notes: '' }] };
    }),

    setQty: (name, qty) => set((s) => ({
      items: qty <= 0
        ? s.items.filter((i) => i.name !== name)
        : s.items.map((i) => (i.name === name ? { ...i, qty } : i)),
    })),

    setNotes: (name, notes) => set((s) => ({
      items: s.items.map((i) => (i.name === name ? { ...i, notes } : i)),
    })),

    remove: (name) => set((s) => ({ items: s.items.filter((i) => i.name !== name) })),
    clear: () => set({ items: [] }),

    qtyOf: (name) => get().items.find((i) => i.name === name)?.qty || 0,
  }),
  { name: 'leankitchen.cart' }
));

export const cartCount = (items) => items.reduce((s, i) => s + i.qty, 0);
