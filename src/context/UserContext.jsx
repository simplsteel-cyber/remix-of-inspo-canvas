import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/auth.js';
import { checkDelivery } from '../lib/delivery.js';
import { storage } from '../lib/storage.js';
import { PLANS } from '../lib/core.js';

// ─────────────────────────────────────────────────────────────
// Central user state: session, profile, delivery, plan, routing.
// Everything is persisted per device, so a refresh resumes exactly
// where the user left off — including mid-onboarding.
// ─────────────────────────────────────────────────────────────

export const EMPTY_PROFILE = {
  name: '', age: '', gender: '', height: '', weight: '', goal: '',
  dietPref: 'No preference', allergies: '', mealsPerWeek: 12,
  nutritionistRef: '', deliveryAddress: '', pincode: '',
};

// The homepage is public — guests land here and sign in when ready.
const HOME = { stage: 'app', tab: 'home', cat: null, step: 0 };

const Ctx = createContext(null);

export function UserProvider({ children }) {
  const [booting, setBooting] = useState(true);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [delivery, setDelivery] = useState(null);
  const [plan, setPlan] = useState(null);
  const [route, setRoute] = useState(HOME);

  // Boot: restore the persisted session and journey.
  useEffect(() => {
    const session = auth.getSession();
    if (session) {
      setUser(session);
      setProfile({ ...EMPTY_PROFILE, ...storage.get('profile', {}) });
      setDelivery(storage.get('delivery'));
      setPlan(PLANS.find((p) => p.id === storage.get('planId')) || null);
      const saved = storage.get('route');
      setRoute(saved && saved.stage !== 'welcome' ? saved : { ...HOME, stage: 'register' });
    }
    setBooting(false);
  }, []);

  // Persist on every change while signed in — this is what makes
  // onboarding progress and login survive a refresh.
  useEffect(() => { if (!booting && user) storage.set('profile', profile); }, [booting, user, profile]);
  useEffect(() => { if (!booting && user) storage.set('delivery', delivery); }, [booting, user, delivery]);
  useEffect(() => { if (!booting && user) storage.set('planId', plan ? plan.id : null); }, [booting, user, plan]);
  useEffect(() => { if (!booting && user) storage.set('route', route); }, [booting, user, route]);

  const finishSignIn = useCallback((signedIn) => {
    setUser(signedIn);
    // Returning users land on the homepage; new users register first.
    const onboarded = storage.get('route')?.stage === 'app';
    setRoute(onboarded ? HOME : { ...HOME, stage: 'register' });
    return signedIn;
  }, []);

  const value = {
    booting, user, profile, delivery, plan, route,

    // Authentication
    signInWithEmail: (email) => auth.signInWithEmail(email).then(finishSignIn),
    signInWithPhone: (phone) => auth.signInWithPhone(phone).then(finishSignIn),
    signInWithGoogle: () => auth.signInWithGoogle().then(finishSignIn),
    signOut: async () => {
      await auth.signOut();
      ['profile', 'delivery', 'planId', 'route'].forEach((k) => storage.remove(k));
      setUser(null);
      setProfile(EMPTY_PROFILE);
      setDelivery(null);
      setPlan(null);
      setRoute(HOME);
    },

    // Profile & delivery
    updateProfile: (patch) => setProfile((p) => ({ ...p, ...patch })),
    runDeliveryCheck: async (input) => {
      const result = await checkDelivery(input);
      setDelivery(result);
      return result;
    },

    // Plans — selecting one opens the subscription details page.
    choosePlan: (p) => {
      setPlan(p);
      setRoute({ ...HOME, tab: 'orders' });
    },

    // Routing
    go: (tab, cat) => setRoute((r) => ({
      ...r,
      stage: 'app',
      tab: tab === 'plans' ? 'home' : tab,
      cat: cat !== undefined ? cat : r.cat,
    })),
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
