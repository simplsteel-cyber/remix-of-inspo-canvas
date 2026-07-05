// ─────────────────────────────────────────────────────────────
// Authentication service
//
// The UI only talks to `auth`. `LocalAuthProvider` simulates a
// backend on this device; to move to Firebase or Supabase, write
// an adapter with the same `signIn` / `signOut` methods and swap
// it into `provider` below — nothing else changes.
// ─────────────────────────────────────────────────────────────
import { storage } from './storage.js';

const SESSION_KEY = 'session';
const simulate = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
export const validatePhone = (phone) => /^[+]?[\d\s()-]{10,16}$/.test(String(phone).trim());

const LocalAuthProvider = {
  async signIn({ method, email = '', phone = '' }) {
    await simulate(700); // stand-in for the network round trip
    return {
      id: 'user-' + Math.random().toString(36).slice(2, 10),
      method,
      email: method === 'email' ? email.trim() : method === 'google' ? 'you@gmail.com' : '',
      phone: method === 'phone' ? phone.trim() : '',
      createdAt: new Date().toISOString(),
    };
  },
  async signOut() {
    await simulate(200);
  },
};

const provider = LocalAuthProvider;

const persist = (user) => {
  storage.set(SESSION_KEY, user);
  return user;
};

export const auth = {
  getSession: () => storage.get(SESSION_KEY),

  async signInWithEmail(email) {
    if (!validateEmail(email)) throw new Error('Enter a valid email address');
    return persist(await provider.signIn({ method: 'email', email }));
  },

  async signInWithPhone(phone) {
    if (!validatePhone(phone)) throw new Error('Enter a valid phone number');
    return persist(await provider.signIn({ method: 'phone', phone }));
  },

  async signInWithGoogle() {
    return persist(await provider.signIn({ method: 'google' }));
  },

  async signOut() {
    await provider.signOut();
    storage.remove(SESSION_KEY);
  },
};
