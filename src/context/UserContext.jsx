import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { auth } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';
import { checkDelivery } from '../lib/delivery.js';
import { storage } from '../lib/storage.js';
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
  const { plans } = useMenu();
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [delivery, setDelivery] = useState(null);
  const [planId, setPlanId] = useState(null);
  const [favs, setFavs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [deliverySkipped, setDeliverySkipped] = useState(false);
  const [route, setRoute] = useState(HOME);
  const userRef = useRef(null);
  const profileSynced = useRef(false);

  const plan = plans.find((p) => p.id === planId) || null;

  // Pull the server profile and decide where a fresh sign-in lands.
  const onFreshSignIn = useCallback(async (u, { redirect } = { redirect: true }) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
    if (!error && data) {
      setIsAdmin(data.role === 'admin');
      if (data.name) setProfile((p) => ({ ...p, ...fromDbProfile(data) }));
    }
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
      setDeliverySkipped(storage.get('deliverySkipped', false));

      const u = await auth.getSession();
      if (u) {
        userRef.current = u;
        setUser(u);
        const saved = storage.get('route');
        setRoute(saved && saved.stage !== 'welcome' ? { ...saved, anchor: null } : HOME);
        onFreshSignIn(u, { redirect: !saved || saved.stage === 'welcome' });
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
  useEffect(() => { if (!booting) storage.set('deliverySkipped', deliverySkipped); }, [booting, deliverySkipped]);
  useEffect(() => { if (!booting && user) storage.set('route', route); }, [booting, user, route]);

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
    booting, user, isAdmin, profile, delivery, plan, route, favs, recent, deliverySkipped,

    // Authentication (see lib/auth.js for provider details)
    signInWithEmail: (email, password) => auth.signInWithEmail(email, password),
    sendPhoneOtp: (phone) => auth.sendPhoneOtp(phone),
    verifyPhoneOtp: (phone, token) => auth.verifyPhoneOtp(phone, token),
    signInWithGoogle: () => auth.signInWithGoogle(),
    signOut: async () => {
      await auth.signOut();
      ['profile', 'delivery', 'planId', 'route', 'favs', 'recent', 'deliverySkipped'].forEach((k) => storage.remove(k));
      userRef.current = null;
      profileSynced.current = false;
      setUser(null);
      setIsAdmin(false);
      setProfile(EMPTY_PROFILE);
      setDelivery(null);
      setPlanId(null);
      setFavs([]);
      setRecent([]);
      setDeliverySkipped(false);
      setRoute(HOME);
    },

    // Profile & delivery
    updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
    runDeliveryCheck: async (input) => {
      const result = await checkDelivery(input);
      setDelivery(result);
      return result;
    },
    skipDeliveryGate: () => setDeliverySkipped(true),

    // Favourites & recently viewed (dish names)
    toggleFav: (name) => setFavs((f) => (f.includes(name) ? f.filter((n) => n !== name) : [name, ...f])),
    trackViewed: (name) => setRecent((r) => [name, ...r.filter((n) => n !== name)].slice(0, 10)),

    // Plans — selecting one opens the order page.
    choosePlan: (p) => {
      setPlanId(p.id);
      setRoute({ ...HOME, tab: 'orders' });
    },
    clearPlan: () => setPlanId(null),

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
