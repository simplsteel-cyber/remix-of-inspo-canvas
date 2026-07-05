import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/auth.js';
import { checkDelivery } from '../lib/delivery.js';
import { storage } from '../lib/storage.js';
import { PLANS } from '../lib/core.js';

// ─────────────────────────────────────────────────────────────
// Central user state: session, profile, delivery, plan, routing,
// favourites, and recently viewed. Everything is persisted per
// device — including for guests — so a refresh resumes exactly
// where the user left off. Screens never touch localStorage or
// the auth provider directly; they use this hook.
// ─────────────────────────────────────────────────────────────

export const EMPTY_PROFILE = {
  name: '', age: '', gender: '', height: '', weight: '', goal: '',
  dietPref: 'No preference', allergies: '', mealsPerWeek: 12,
  nutritionistRef: '', deliveryAddress: '', pincode: '',
};

// The homepage is public — guests land here and sign in when ready.
// stage: welcome | register | registered | onboard | app
// anchor: transient scroll target consumed by the destination screen.
const HOME = { stage: 'app', tab: 'home', cat: null, step: 0, anchor: null };

const Ctx = createContext(null);

export function UserProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [delivery, setDelivery] = useState(null);
  const [plan, setPlan] = useState(null);
  const [favs, setFavs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [deliverySkipped, setDeliverySkipped] = useState(false);
  const [route, setRoute] = useState(HOME);

  // Boot: restore persisted state. Guest state (profile draft,
  // delivery, favourites) survives refresh too; only the journey
  // position (route) requires a session.
  useEffect(() => {
    setProfile({ ...EMPTY_PROFILE, ...storage.get('profile', {}) });
    setDelivery(storage.get('delivery'));
    setPlan(PLANS.find((p) => p.id === storage.get('planId')) || null);
    setFavs(storage.get('favs', []));
    setRecent(storage.get('recent', []));
    setDeliverySkipped(storage.get('deliverySkipped', false));
    const session = auth.getSession();
    if (session) {
      setUser(session);
      const saved = storage.get('route');
      setRoute(saved && saved.stage !== 'welcome' ? { ...saved, anchor: null } : { ...HOME, stage: 'register' });
    }
    setBooting(false);
  }, []);

  // Persist on every change once booted.
  useEffect(() => { if (!booting) storage.set('profile', profile); }, [booting, profile]);
  useEffect(() => { if (!booting) storage.set('delivery', delivery); }, [booting, delivery]);
  useEffect(() => { if (!booting) storage.set('planId', plan ? plan.id : null); }, [booting, plan]);
  useEffect(() => { if (!booting) storage.set('favs', favs); }, [booting, favs]);
  useEffect(() => { if (!booting) storage.set('recent', recent); }, [booting, recent]);
  useEffect(() => { if (!booting) storage.set('deliverySkipped', deliverySkipped); }, [booting, deliverySkipped]);
  useEffect(() => { if (!booting && user) storage.set('route', route); }, [booting, user, route]);

  // Returning users go straight to the homepage; new users register first.
  const finishSignIn = useCallback((signedIn) => {
    setUser(signedIn);
    const onboarded = storage.get('route')?.stage === 'app';
    setRoute(onboarded ? HOME : { ...HOME, stage: 'register' });
    return signedIn;
  }, []);

  const value = {
    booting, user, profile, delivery, plan, route, favs, recent, deliverySkipped,

    // Authentication
    signInWithEmail: (email) => auth.signInWithEmail(email).then(finishSignIn),
    signInWithPhone: (phone) => auth.signInWithPhone(phone).then(finishSignIn),
    signInWithGoogle: () => auth.signInWithGoogle().then(finishSignIn),
    signOut: async () => {
      await auth.signOut();
      ['profile', 'delivery', 'planId', 'route', 'favs', 'recent', 'deliverySkipped'].forEach((k) => storage.remove(k));
      setUser(null);
      setProfile(EMPTY_PROFILE);
      setDelivery(null);
      setPlan(null);
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

    // Plans — selecting one opens the subscription details page.
    choosePlan: (p) => {
      setPlan(p);
      setRoute({ ...HOME, tab: 'orders' });
    },

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
