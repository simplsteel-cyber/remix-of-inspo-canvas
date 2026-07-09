// ─────────────────────────────────────────────────────────────
// Authentication — real Supabase Auth.
//
// Email uses password sign-in with automatic account creation on
// first use; if the project requires email confirmation, sign-up
// returns { pendingConfirmation } so the UI can prompt the user to
// check their inbox. Google uses OAuth redirect (requires the
// provider enabled in Supabase).
// ─────────────────────────────────────────────────────────────
import { supabase } from './supabase.js';

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email).trim());

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
      const signUp = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (signUp.error) {
        if (/already registered/i.test(signUp.error.message)) throw new Error('Wrong password for this email');
        throw new Error(signUp.error.message);
      }
      // No session means the project requires email confirmation.
      if (!signUp.data.session) return { pendingConfirmation: true, email: email.trim() };
      return toAppUser(signUp.data.user);
    }
    throw new Error(signIn.error.message);
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
