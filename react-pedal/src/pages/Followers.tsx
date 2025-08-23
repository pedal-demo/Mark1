import React, { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, UserMinus, Search } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import userService from '../services/userService';
import followService from '../services/followService';

interface FollowersProps {
  initialQuery?: string;
}

interface MiniUser {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
}

const Followers: React.FC<FollowersProps> = ({ initialQuery = '' }) => {
  const { user } = useUser();
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<MiniUser[]>([]);
  const [tick, setTick] = useState(0); // force refresh when follow changes

  // refresh when initialQuery changes
  useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);

  const followingIds = useMemo(() => user ? followService.listFollowing(user.id) : [], [user, tick]);

  const doSearch = async (q: string) => {
    const s = q.trim();
    if (s.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const users = await userService.searchUsers(s, 20);
      setResults(users.map(u => ({ id: (u as any).id || (u as any)._id || u.username, username: u.username, fullName: (u as any).fullName, avatar: (u as any).avatar })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => { doSearch(query); }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const onFollow = () => setTick(t => t + 1);
    const onUnfollow = () => setTick(t => t + 1);
    window.addEventListener('realtime:follow', onFollow);
    window.addEventListener('realtime:unfollow', onUnfollow);
    return () => {
      window.removeEventListener('realtime:follow', onFollow);
      window.removeEventListener('realtime:unfollow', onUnfollow);
    };
  }, []);

  const toggleFollow = (targetId: string) => {
    if (!user) return;
    if (followService.isFollowing(user.id, targetId)) {
      followService.unfollow(user.id, targetId);
    } else {
      followService.follow(user.id, targetId);
    }
    setTick(t => t + 1);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Followers & Following</h1>
          <p className="text-gray-400">Search users, follow/unfollow, and manage your network.</p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Following list */}
        {user && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-orange-500" />
              <h2 className="font-semibold">You're following ({followingIds.length})</h2>
            </div>
            {followingIds.length === 0 ? (
              <div className="text-gray-400 text-sm">You are not following anyone yet.</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {followingIds.map(fid => (
                  <span key={fid} className="px-3 py-1 rounded-full bg-gray-800 border border-gray-700 text-sm">{fid}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        <div className="bg-gray-900">
          <div className="rounded-xl border border-gray-800 overflow-hidden">
            {loading && <div className="px-4 py-3 text-gray-400">Searching…</div>}
            {!loading && results.length === 0 && (
              <div className="px-4 py-6 text-gray-400 text-sm">No users. Try a different search.</div>
            )}
            {!loading && results.map((u) => {
              const isSelf = user && u.id === user.id;
              const isFollowing = user ? followService.isFollowing(user.id, u.id) : false;
              return (
                <div key={u.id} className="flex items-center justify-between px-4 py-3 border-t border-gray-800 first:border-t-0 bg-gray-900 hover:bg-gray-800/60">
                  <div 
                    className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                    onClick={() => {
                      // Navigate to user's profile page
                      window.dispatchEvent(new CustomEvent('nav:user', { detail: { id: u.id, username: u.username } }));
                    }}
                  >
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=3f3f46&color=fff`} alt={u.username} className="w-10 h-10 rounded-full" />
                    <div className="truncate">
                      <div className="font-medium truncate">{u.fullName || u.username}</div>
                      <div className="text-sm text-gray-400 truncate">@{u.username}</div>
                    </div>
                  </div>
                  <div>
                    {!user || isSelf ? (
                      <button disabled className="px-3 py-1.5 rounded-lg bg-gray-700 text-gray-400 text-sm">{isSelf ? 'You' : 'Login'}</button>
                    ) : (
                      <button
                        onClick={() => toggleFollow(u.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 ${isFollowing ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-orange-600 hover:bg-orange-500 text-white'}`}
                      >
                        {isFollowing ? (<><UserMinus className="w-4 h-4" /> Unfollow</>) : (<><UserPlus className="w-4 h-4" /> Follow</>)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Followers;
