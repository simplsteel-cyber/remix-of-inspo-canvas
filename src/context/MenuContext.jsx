import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { fetchMeals, fetchPlans } from '../lib/menu.js';
import { FALLBACK_PLANS } from '../lib/core.js';

// ─────────────────────────────────────────────────────────────
// Menu state: dishes and plans loaded from Supabase with loading
// flags. Screens render skeletons while this resolves.
// ─────────────────────────────────────────────────────────────

const Ctx = createContext(null);

export function MenuProvider({ children }) {
  const [dishes, setDishes] = useState([]);
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuSource, setMenuSource] = useState(null);

  const refreshMenu = useCallback(async () => {
    setMenuLoading(true);
    const [m, p] = await Promise.all([fetchMeals(), fetchPlans()]);
    setDishes(m.dishes);
    setPlans(p.plans);
    setMenuSource(m.source);
    setMenuLoading(false);
  }, []);

  useEffect(() => { refreshMenu(); }, [refreshMenu]);

  return <Ctx.Provider value={{ dishes, plans, menuLoading, menuSource, refreshMenu }}>{children}</Ctx.Provider>;
}

export const useMenu = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMenu must be used inside <MenuProvider>');
  return ctx;
};
