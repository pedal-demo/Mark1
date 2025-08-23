// LocalStorage-backed notifications per user
// Emits 'realtime:notification' when a new notification is added

const KEY = 'pedal_notifications_v1';

export type NotificationItem = {
  id: string;
  userId: string; // recipient
  type: 'follow_request' | 'message_request' | 'generic';
  message: string;
  createdAt: number;
  read?: boolean;
  meta?: Record<string, any>;
};

type Store = NotificationItem[];

function load(): Store {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : []; } catch { return []; }
}
function save(items: Store) { localStorage.setItem(KEY, JSON.stringify(items)); }

function uid() { return Math.random().toString(36).slice(2) + Date.now().toString(36); }

export const notificationService = {
  add(recipientId: string, type: NotificationItem['type'], message: string, meta?: Record<string, any>): NotificationItem {
    const items = load();
    const notif: NotificationItem = { id: uid(), userId: recipientId.toLowerCase(), type, message, createdAt: Date.now(), read: false, meta };
    items.push(notif);
    save(items);
    window.dispatchEvent(new CustomEvent('realtime:notification', { detail: notif }));
    return notif;
  },
  list(userId: string): NotificationItem[] {
    const items = load();
    const id = userId.toLowerCase();
    return items.filter(n => n.userId === id).sort((a,b)=>b.createdAt - a.createdAt);
  },
  countUnread(userId: string): number {
    return this.list(userId).filter(n => !n.read).length;
  },
  markAllRead(userId: string) {
    const id = userId.toLowerCase();
    const items = load();
    let changed = false;
    items.forEach(n => { if (n.userId === id && !n.read) { n.read = true; changed = true; } });
    if (changed) save(items);
  }
};

export default notificationService;
