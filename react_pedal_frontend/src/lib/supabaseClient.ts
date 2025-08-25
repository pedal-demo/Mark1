// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any;

// Read env for CRA/webpack and optional window injection; avoid import.meta entirely
const craEnv: any = (typeof process !== 'undefined' ? (process as any).env : undefined);
const winEnv: any = (typeof window !== 'undefined' ? (window as any).__env : undefined);

const supabaseUrl = (craEnv && (craEnv.VITE_SUPABASE_URL || craEnv.REACT_APP_SUPABASE_URL))
  || (winEnv && winEnv.VITE_SUPABASE_URL) as string | undefined;

const supabaseAnonKey = (craEnv && (craEnv.VITE_SUPABASE_ANON_KEY || craEnv.REACT_APP_SUPABASE_ANON_KEY))
  || (winEnv && winEnv.VITE_SUPABASE_ANON_KEY) as string | undefined;

let _supabase: any = null;
function ensureClient(): any {
  if (_supabase) return _supabase;
  try {
    const mod = require('@supabase/supabase-js');
    _supabase = mod.createClient(supabaseUrl as string, supabaseAnonKey as string);
  } catch (e) {
    _supabase = null;
  }
  return _supabase;
}

export const supabase = (supabaseUrl && supabaseAnonKey) ? ensureClient() : null;

export const hasSupabase = Boolean(supabase);
