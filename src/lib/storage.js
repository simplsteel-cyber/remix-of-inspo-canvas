// ─────────────────────────────────────────────────────────────
// Namespaced localStorage wrapper. All persisted app state goes
// through here so a future backend can replace it in one place.
// ─────────────────────────────────────────────────────────────
const PREFIX = 'leankitchen.';

export const storage = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Storage full or blocked — the app still works, it just won't persist.
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // ignore
    }
  },
};
