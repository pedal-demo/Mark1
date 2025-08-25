import React, { useEffect, useMemo, useState } from 'react';
import { supabase, hasSupabase } from '../lib/supabaseClient';
import { Funnel, RefreshCcw, Wifi, WifiOff, Activity } from 'lucide-react';

interface AnalyticsRow {
  id: string;
  created_at?: string;
  type: string;
  user_id?: string | null;
  session_id?: string | null;
  path?: string | null;
  payload?: any;
}

const BackendDashboard: React.FC = () => {
  const [rows, setRows] = useState<AnalyticsRow[]>([]);
  const [live, setLive] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [pathFilter, setPathFilter] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return rows.filter(r => {
      const typeOk = !typeFilter || r.type?.toLowerCase().includes(typeFilter.toLowerCase());
      const pathOk = !pathFilter || (r.path || '').toLowerCase().includes(pathFilter.toLowerCase());
      return typeOk && pathOk;
    });
  }, [rows, typeFilter, pathFilter]);

  useEffect(() => {
    if (!hasSupabase || !supabase) return;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const fetchInitial = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      if (!error && data) setRows(data as AnalyticsRow[]);
      setLoading(false);
    };

    fetchInitial();

    channel = supabase
      .channel('realtime-analytics')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'analytics_events' },
        (payload: any) => {
          if (!live) return;
          setRows(prev => [payload.new as AnalyticsRow, ...prev].slice(0, 500));
        }
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [live]);

  if (!hasSupabase) {
    return (
      <div className="p-6 text-app-text-primary">
        <h1 className="text-2xl font-bold mb-2">Backend Dashboard</h1>
        <p className="text-app-text-muted">Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-orange-500" />
          <h1 className="text-xl font-semibold text-app-text-primary">Backend Dashboard</h1>
          {live ? (
            <span className="inline-flex items-center gap-1 text-green-400 text-sm"><Wifi className="w-4 h-4"/> Live</span>
          ) : (
            <span className="inline-flex items-center gap-1 text-gray-400 text-sm"><WifiOff className="w-4 h-4"/> Paused</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={()=>setLive(v=>!v)} className="px-3 py-1.5 rounded-md border border-gray-700 text-sm text-gray-200 hover:bg-gray-800">
            {live ? 'Pause' : 'Resume'}
          </button>
          <button onClick={()=>window.location.reload()} className="px-3 py-1.5 rounded-md border border-gray-700 text-sm text-gray-200 hover:bg-gray-800 inline-flex items-center gap-2">
            <RefreshCcw className="w-4 h-4"/> Refresh
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
        <div className="flex flex-wrap items-center gap-2">
          <Funnel className="w-4 h-4 text-gray-400" />
          <input
            placeholder="Filter by type (e.g., post.create)"
            value={typeFilter}
            onChange={(e)=>setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400 border border-gray-700"
          />
          <input
            placeholder="Filter by path (e.g., /profile)"
            value={pathFilter}
            onChange={(e)=>setPathFilter(e.target.value)}
            className="px-3 py-2 rounded-md bg-gray-800 text-gray-200 placeholder-gray-400 border border-gray-700"
          />
          {loading && <span className="text-xs text-gray-400">Loading…</span>}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 text-xs uppercase tracking-wide text-gray-400 bg-gray-800/60 px-3 py-2">
          <div className="col-span-2">Time</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">User</div>
          <div className="col-span-2">Path</div>
          <div className="col-span-4">Payload</div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-800">
          {filtered.map((r) => (
            <div key={r.id} className="grid grid-cols-12 px-3 py-2 text-sm text-gray-200">
              <div className="col-span-2 text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
              <div className="col-span-2 font-mono text-orange-400">{r.type}</div>
              <div className="col-span-2 text-gray-300">{r.user_id || '—'}</div>
              <div className="col-span-2 text-gray-300">{r.path || '—'}</div>
              <div className="col-span-4">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap break-all">{r.payload ? JSON.stringify(r.payload, null, 2) : '—'}</pre>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-gray-400">No events</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackendDashboard;
