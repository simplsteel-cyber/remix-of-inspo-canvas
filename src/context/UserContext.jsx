import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { auth } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';
import { checkDelivery } from '../lib/delivery.js';
import { storage } from '../lib/storage.js';
import { loadMealPlan, saveMealPlan } from '../lib/mealPlan.js';
import { recommendDishes } from '../lib/core.js';
import { useCart } from '../stores/cart.js';
import { useMenu } from './MenuContext.jsx';

// ─────────────────────────────────────────────────────────────
// Central user state: Supabase session, profile (synced to the
// `profiles` table), delivery, selected plan, routing, favourites,
// and recently viewed. Local storage keeps everything working
// offline and for guests; Supabase is authoritative when signed in.
// ─────────────────────────────────────────────────────────────

export const EMPTY_PROFILE = {
  name: '', age: '', gender: '', height: '', weight: '', goal: '',
  dietPref: 'No preference', allergies: '', mealsPerWeek: 12,
  nutritionistRef: '', deliveryAddress: '', pincode: '',
};

const toDbProfile = (p) => ({
  name: p.name, age: p.age, gender: p.gender, height: p.height, weight: p.weight,
  goal: p.goal, diet_pref: p.dietPref, allergies: p.allergies,
  meals_per_week: parseInt(p.mealsPerWeek, 10) || 12,
  nutritionist_ref: p.nutritionistRef, delivery_address: p.deliveryAddress, pincode: p.pincode,
});
const fromDbProfile = (r) => ({
  name: r.name ?? '', age: r.age ?? '', gender: r.gender ?? '', height: r.height ?? '', weight: r.weight ?? '',
  goal: r.goal ?? '', dietPref: r.diet_pref ?? 'No preference', allergies: r.allergies ?? '',
  mealsPerWeek: r.meals_per_week ?? 12, nutritionistRef: r.nutritionist_ref ?? '',
  deliveryAddress: r.delivery_address ?? '', pincode: r.pincode ?? '',
});

// The homepage is public — guests land here and sign in when ready.
// stage: welcome | register | registered | onboard | app
const HOME = { stage: 'app', tab: 'home', cat: null, step: 0, anchor: null };

const Ctx = createContext(null);

export function UserProvider({ children }) {
  const { plans, dishes } = useMenu();
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [delivery, setDelivery] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [favs, setFavs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [payExtras, setPayExtras] = useState(false);
  const [route, setRoute] = useState(HOME);
  const cartItems = useCart((s) => s.items);
  const userRef = useRef(null);
  const profileSynced = useRef(false);
  const planLoaded = useRef(false);
  const poppingRef = useRef(false);
  const routeKeyRef = useRef('');

  const plan = plans.find((p) => p.id === planId) || null;

  // ── Browser history integration ──────────────────────────────
  // Every meaningful navigation (stage/tab/category/step change) is
  // pushed into browser history, and back/forward restores it — so
  // the back button returns to the previous screen instead of
  // leaving the app. Anchor changes are transient and not pushed.
  useEffect(() => {
    if (booting || window.location.pathname.startsWith('/admin')) return;
    const key = JSON.stringify({ s: route.stage, t: route.tab, c: route.cat, p: route.step });
    if (key === routeKeyRef.current) return;
    routeKeyRef.current = key;
    if (poppingRef.current) { poppingRef.current = false; return; }
    const state = { lk: true, route: { ...route, anchor: null } };
    if (window.history.state?.lk) window.history.pushState(state, '');
    else window.history.replaceState(state, '');
  }, [booting, route]);

  useEffect(() => {
    const onPop = (e) => {
      if (e.state?.lk && e.state.route) {
        poppingRef.current = true;
        routeKeyRef.current = JSON.stringify({ s: e.state.route.stage, t: e.state.route.tab, c: e.state.route.cat, p: e.state.route.step });
        setRoute(e.state.route);
      }
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Pull the server profile + saved meal plan, and decide where a
  // fresh sign-in lands.
  const onFreshSignIn = useCallback(async (u, { redirect } = { redirect: true }) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
    if (!error && data) {
      setIsAdmin(data.role === 'admin');
      if (data.name) setProfile((p) => ({ ...p, ...fromDbProfile(data) }));
    }
    const mp = await loadMealPlan(u.id);
    if (mp) {
      useCart.getState().hydrate(mp.items || []);
      setPlanId(mp.planId || null);
      setPayExtras(!!mp.payExtras);
    }
    planLoaded.current = true;
    profileSynced.current = true;
    if (redirect) setRoute(data?.name ? HOME : { ...HOME, stage: 'register' });
  }, []);

  // Boot: restore local state, then resolve the Supabase session.
  useEffect(() => {
    let unsub;
    (async () => {
      setProfile({ ...EMPTY_PROFILE, ...storage.get('profile', {}) });
      setDelivery(storage.get('delivery'));
      setPlanId(storage.get('planId'));
      setFavs(storage.get('favs', []));
      setRecent(storage.get('recent', []));
      setPayExtras(storage.get('payExtras', false));

      const u = await auth.getSession();
      if (u) {
        userRef.current = u;
        setUser(u);
        // Resume only if the user left off mid-onboarding; an ordinary
        // refresh lands on Home rather than the last tab they were on.
        const saved = storage.get('route');
        const resumingOnboarding = saved && ['register', 'registered', 'onboard'].includes(saved.stage);
        setRoute(resumingOnboarding ? { ...saved, anchor: null } : HOME);
        onFreshSignIn(u, { redirect: false });
      }
      setBooting(false);

      unsub = auth.onAuthChange((next) => {
        const prev = userRef.current;
        userRef.current = next;
        setUser(next);
        if (next && (!prev || prev.id !== next.id)) onFreshSignIn(next);
        if (!next && prev) setIsAdmin(false);
      });
    })();
    return () => unsub?.();
  }, [onFreshSignIn]);

  // Persist locally on every change once booted.
  useEffect(() => { if (!booting) storage.set('profile', profile); }, [booting, profile]);
  useEffect(() => { if (!booting) storage.set('delivery', delivery); }, [booting, delivery]);
  useEffect(() => { if (!booting) storage.set('planId', planId); }, [booting, planId]);
  useEffect(() => { if (!booting) storage.set('favs', favs); }, [booting, favs]);
  useEffect(() => { if (!booting) storage.set('recent', recent); }, [booting, recent]);
  useEffect(() => { if (!booting) storage.set('payExtras', payExtras); }, [booting, payExtras]);
  useEffect(() => { if (!booting && user) storage.set('route', route); }, [booting, user, route]);

  // Save the meal plan (chosen meals + plan + pay-extras) to Supabase,
  // debounced, once signed in and hydrated.
  useEffect(() => {
    if (booting || !user || !planLoaded.current) return;
    const t = setTimeout(() => { saveMealPlan(user.id, { items: cartItems, planId, payExtras }); }, 800);
    return () => clearTimeout(t);
  }, [booting, user, cartItems, planId, payExtras]);

  // Sync the profile to Supabase, debounced, once signed in.
  useEffect(() => {
    if (booting || !user || !profileSynced.current) return;
    const t = setTimeout(async () => {
      const { error } = await supabase.from('profiles').upsert({ id: user.id, ...toDbProfile(profile) });
      if (error) console.warn('[profile] sync failed:', error.message);
    }, 800);
    return () => clearTimeout(t);
  }, [booting, user, profile]);

  const value = {
    booting, user, isAdmin, profile, delivery, plan, route, favs, recent, payExtras,

    // Authentication (see lib/auth.js for provider details)
    signInWithEmail: (email, password) => auth.signInWithEmail(email, password),
    signInWithGoogle: () => auth.signInWithGoogle(),
    signOut: async () => {
      await auth.signOut();
      ['profile', 'delivery', 'planId', 'route', 'favs', 'recent', 'deliverySkipped', 'payExtras'].forEach((k) => storage.remove(k));
      userRef.current = null;
      profileSynced.current = false;
      planLoaded.current = false;
      useCart.getState().clear();
      setUser(null);
      setIsAdmin(false);
      setProfile(EMPTY_PROFILE);
      setDelivery(null);
      setPlanId(null);
      setFavs([]);
      setRecent([]);
      setPayExtras(false);
      setRoute(HOME);
    },

    // Profile & delivery
    updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
    runDeliveryCheck: async (input) => {
      const result = await checkDelivery(input);
      setDelivery(result);
      return result;
    },

    // Favourites & recently viewed (dish names)
    toggleFav: (name) => setFavs((f) => (f.includes(name) ? f.filter((n) => n !== name) : [name, ...f])),
    trackViewed: (name) => setRecent((r) => [name, ...r.filter((n) => n !== name)].slice(0, 10)),

    // Plans — selecting one opens the My Plan (cart) view, even when
    // empty. A new plan resets any prior pay-for-extras agreement.
    choosePlan: (p) => {
      setPlanId(p.id);
      setPayExtras(false);
      setRoute({ ...HOME, tab: 'nutrition' });
    },
    // Post-signup: pick the plan and go straight to choosing meals.
    startWithPlan: (p) => {
      setPlanId(p.id);
      setPayExtras(false);
      setRoute({ ...HOME, tab: 'meals' });
    },
    // "Start with Starter Week": pre-fill the plan with 6 editable
    // meals matched to the profile, then open My Plan.
    quickStartStarter: () => {
      const starter = plans.find((p) => p.id === 'starter') || plans[0];
      if (!starter) return;
      setPlanId(starter.id);
      setPayExtras(false);
      const picks = recommendDishes(profile, dishes, starter.meals || 6);
      useCart.getState().hydrate(picks.map((d) => ({ name: d.name, qty: 1, notes: '' })));
      setRoute({ ...HOME, tab: 'nutrition' });
    },
    clearPlan: () => { setPlanId(null); setPayExtras(false); },
    acknowledgeExtras: () => setPayExtras(true),

    // Routing. 'plans' is a virtual target: the Plans section of Home.
    go: (tab, cat) => setRoute((r) => ({
      ...r,
      stage: 'app',
      tab: tab === 'plans' ? 'home' : tab,
      cat: cat !== undefined ? cat : r.cat,
      anchor: tab === 'plans' ? 'plans' : null,
    })),
    // Hierarchical back: category → meals hub → home. Tabs → home.
    goBack: () => setRoute((r) => {
      if (r.cat) return { ...r, cat: null, anchor: null };
      if (r.tab !== 'home') return { ...r, tab: 'home', anchor: null };
      return r;
    }),
    clearAnchor: () => setRoute((r) => (r.anchor ? { ...r, anchor: null } : r)),
    setStage: (stage) => setRoute((r) => ({ ...r, stage })),
    setStep: (step) => setRoute((r) => ({ ...r, step })),
    completeOnboarding: () => setRoute(HOME),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useUser = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
};
