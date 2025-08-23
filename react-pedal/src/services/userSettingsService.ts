// LocalStorage-backed user settings (e.g., private account)
// Keyed per-userId

const LS_KEY = 'pedal_user_settings_v1';

type Settings = {
  isPrivate?: boolean;
};

type Store = Record<string, Settings>; // userId -> settings

function load(): Store {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(store: Store) {
  localStorage.setItem(LS_KEY, JSON.stringify(store));
}

export const userSettingsService = {
  get(userId: string): Settings {
    if (!userId) return {};
    const store = load();
    return store[userId] || {};
  },
  set(userId: string, settings: Partial<Settings>): Settings {
    if (!userId) return {};
    const store = load();
    const prev = store[userId] || {};
    const next = { ...prev, ...settings };
    store[userId] = next;
    save(store);
    // cross-tab notify via storage event implicitly
    window.dispatchEvent(new CustomEvent('realtime:user_settings', { detail: { userId, settings: next, ts: Date.now() } }));
    return next;
  },
  isPrivate(userId: string): boolean {
    return !!this.get(userId).isPrivate;
  },
};

export default userSettingsService;
