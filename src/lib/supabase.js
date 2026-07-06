import { createClient } from '@supabase/supabase-js';

// Publishable (anon) credentials — safe to ship in the client bundle.
// Env vars take precedence so staging/production can point elsewhere.
const url = import.meta.env.VITE_SUPABASE_URL || 'https://wyvgexbccmkyggyltycy.supabase.co';
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_-xqJGhKIudc-3jkqmwW8NQ_xozNJEQw';

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
