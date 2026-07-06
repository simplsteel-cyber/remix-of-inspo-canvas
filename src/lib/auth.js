// ─────────────────────────────────────────────────────────────
// Authentication — real Supabase Auth.
//
// Email uses password sign-in with automatic account creation on
// first use. Phone uses SMS OTP (two steps: send, then verify —
// requires an SMS provider configured in Supabase). Google uses
// OAuth redirect (requires the provider enabled in Supabase).
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase.js';

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());
export const validatePhone = (phone) => /^[+]?[\d\s()-]{10,16}$/.test(String(phone).trim());

const toAppUser = (u) => u && {
  id: u.id,
  method: u.app_metadata?.provider === 'google' ? 'google' : u.phone ? 'phone' : 'email',
  email: u.email || '',
  phone: u.phone || '',
};

export const auth = {
  async getSession() {
    const { data } = await supabase.auth.getSession();
    return toAppUser(data.session?.user ?? null);
  },

  onAuthChange(callback) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(toAppUser(session?.user ?? null));
    });
    return () => data.subscription.unsubscribe();
  },

  // Sign in; if the account doesn't exist yet, create it.
  async signInWithEmail(email, password) {
    if (!validateEmail(email)) throw new Error('Enter a valid email address');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
    const signIn = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (!signIn.error) return toAppUser(signIn.data.user);

    if (/invalid login credentials/i.test(signIn.error.message)) {
      const signUp = await supabase.auth.signUp({ email: email.trim(), password });
      if (signUp.error) {
        if (/already registered/i.test(signUp.error.message)) throw new Error('Wrong password for this email');
        throw new Error(signUp.error.message);
      }
      if (!signUp.data.session) throw new Error('Account created — check your email to confirm, then sign in again.');
      return toAppUser(signUp.data.user);
    }
    throw new Error(signIn.error.message);
  },

  // Step 1: send the SMS code.
  async sendPhoneOtp(phone) {
    if (!validatePhone(phone)) throw new Error('Enter a valid phone number');
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.replace(/[\s()-]/g, '') });
    if (error) throw new Error(error.message);
    return true;
  },

  // Step 2: verify it.
  async verifyPhoneOtp(phone, token) {
    const { data, error } = await supabase.auth.verifyOtp({ phone: phone.replace(/[\s()-]/g, ''), token: token.trim(), type: 'sms' });
    if (error) throw new Error(error.message);
    return toAppUser(data.user);
  },

  // Full-page redirect; the session is picked up on return.
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) throw new Error(error.message);
    return null; // redirecting
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};
