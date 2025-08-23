// Avoid top-level import of supabaseClient to prevent circular/initialization issues during HMR

export type AnalyticsEvent = {
  type: string; // e.g., 'post.create', 'profile.cover.change', 'message.send'
  user_id?: string | null;
  session_id?: string | null;
  path?: string; // window.location.pathname
  payload?: Record<string, any> | null;
};

export async function trackEvent(evt: AnalyticsEvent) {
  try {
    const { supabase } = await import('./supabaseClient');
    if (!supabase) return; // noop if not configured
    const { error } = await supabase.from('analytics_events').insert({
      type: evt.type,
      user_id: evt.user_id ?? null,
      session_id: evt.session_id ?? null,
      path: evt.path ?? (typeof window !== 'undefined' ? window.location.pathname : null),
      payload: evt.payload ?? null,
    });
    if (error) console.warn('trackEvent error:', error.message);
  } catch (e) {
    console.warn('trackEvent failed:', e);
  }
}
