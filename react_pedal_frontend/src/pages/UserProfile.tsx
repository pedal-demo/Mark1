import React, { useEffect, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import userService from '../services/userService';
import followService from '../services/followService';
import userSettingsService from '../services/userSettingsService';
import messageService from '../services/messageService';
import notificationService from '../services/notificationService';
import { UserPlus, UserMinus, Calendar, MapPin, MessageCircle, Heart, Share, Bookmark, MoreHorizontal } from 'lucide-react';

interface Props {
  userIdOrUsername: string;
}

interface MiniUser { 
  id: string; 
  username: string; 
  fullName?: string; 
  avatar?: string;
  bio?: string;
  location?: string;
  joinedDate?: string;
}

const UserProfile: React.FC<Props> = ({ userIdOrUsername }) => {
  const { user: me } = useUser();
  const [loading, setLoading] = useState(true);
  const [u, setU] = useState<MiniUser | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'comments'>('posts');
  const [toast, setToast] = useState<string | null>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [followersUsers, setFollowersUsers] = useState<MiniUser[]>([]);
  const [followingUsers, setFollowingUsers] = useState<MiniUser[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const q = userIdOrUsername;
        const res = await userService.searchUsers(q, 1);
        const found = res && res[0] ? res[0] : { 
          id: q, 
          username: q, 
          fullName: q, 
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(q)}&background=3f3f46&color=fff`,
          bio: 'PEDAL enthusiast',
          location: 'Somewhere on Earth',
          joinedDate: 'January 2024'
        };
        if (!cancelled) setU({ 
          id: (found as any).id || (found as any)._id || found.username, 
          username: found.username, 
          fullName: (found as any).fullName, 
          avatar: (found as any).avatar,
          bio: (found as any).bio || 'PEDAL enthusiast',
          location: (found as any).location || 'Somewhere on Earth',
          joinedDate: (found as any).joinedDate || 'January 2024'
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [userIdOrUsername]);

  const [bump, setBump] = useState(0); // force re-render on follow events
  const viewerId = (me?.username || me?.id || '').toLowerCase();
  const targetId = (u?.id || '').toLowerCase();
  const isPrivate = u ? userSettingsService.isPrivate(targetId) : false;
  const isFollowing = me && u ? followService.isFollowing(me.id, u.id) : false;
  const [isRequestPending, setIsRequestPending] = useState<boolean>(false);
  const followingCount = u ? followService.listFollowing(u.id).length : 0;
  const followersCount = u ? followService.listFollowers(u.id).length : 0;
  const canDM = me && u ? messageService.canMessage(me.id, u.id) : false;

  useEffect(() => {
    if (!viewerId || !targetId) { setIsRequestPending(false); return; }
    setIsRequestPending(followService.listSentRequests(viewerId).some(r => r.followingId.toLowerCase() === targetId));
  }, [viewerId, targetId, bump]);

  const handleFollow = () => {
    if (!me || !u) return;
    if (isFollowing) {
      followService.unfollow(me.id, u.id);
      setBump(v => v + 1);
      return;
    }
    const privateNow = userSettingsService.isPrivate(u.id.toLowerCase());
    if (privateNow) {
      followService.requestFollow(me.id, u.id);
      setIsRequestPending(true);
      notificationService.add(u.id, 'follow_request', `${me.username || me.id} requested to follow you`, { followerId: me.id });
      setToast('Follow request sent');
      setTimeout(()=>setToast(null), 1500);
      return;
    }
    followService.follow(me.id, u.id);
    setBump(v => v + 1);
  };

  const handleMessage = () => {
    if (!me || !u) return;
    if (messageService.canMessage(me.id, u.id)) {
      setToast('Messaging available');
      setTimeout(()=>setToast(null), 1200);
      return;
    }
    if (followService.isFollowing(me.id, u.id)) {
      messageService.requestMessage(me.id, u.id);
      notificationService.add(u.id, 'message_request', `${me.username || me.id} requested to message`, { fromId: me.id });
      setToast('Message request sent');
      setTimeout(()=>setToast(null), 1500);
    } else {
      setToast('Follow first to message');
      setTimeout(()=>setToast(null), 1500);
    }
  };

  useEffect(() => {
    const onFollow = () => setBump(v => v + 1);
    const onUnfollow = () => setBump(v => v + 1);
    window.addEventListener('realtime:follow' as any, onFollow as any);
    window.addEventListener('realtime:unfollow' as any, onUnfollow as any);
    return () => {
      window.removeEventListener('realtime:follow' as any, onFollow as any);
      window.removeEventListener('realtime:unfollow' as any, onUnfollow as any);
    };
  }, []);

  // Mock posts data
  const mockPosts = [
    {
      id: 1,
      content: "Just finished an amazing ride through the mountains! The weather was perfect and the views were incredible. Can't wait to do it again next weekend. 🚴‍♂️",
      timestamp: "2 hours ago",
      likes: 0,
      comments: 0,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
    },
    {
      id: 2,
      content: "New gear day! Finally got my hands on the latest carbon fiber wheels. The difference in performance is night and day. Highly recommend for anyone looking to upgrade their setup.",
      timestamp: "1 day ago",
      likes: 0,
      comments: 0
    },
    {
      id: 3,
      content: "Morning coffee and planning today's route. Nothing beats the anticipation of a good ride ahead! ☕",
      timestamp: "2 days ago",
      likes: 0,
      comments: 0
    }
  ];

  // Simple mock data so Comments and Saved tabs show content
  const mockComments = [
    { id: 'c1', text: 'Awesome build, love the details!', time: '1h ago' },
    { id: 'c2', text: 'Where did you ride this weekend?', time: '1d ago' }
  ];
  const mockSaved = [
    { id: 's1', title: 'Top 10 track day tips', time: '2d ago' },
    { id: 's2', title: 'Best gear under $200', time: '4d ago' }
  ];

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">Loading profile...</div>
    </div>
  );
  
  if (!u) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">User not found</div>
    </div>
  );

  // Locked minimal view for private profile
  const isLocked = !!u && !!me && isPrivate && !isFollowing;
  if (u && isLocked) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex justify-end gap-2 mb-4">
            <button className="px-3 py-1.5 text-xs rounded-full border border-gray-700 text-gray-300 hover:bg-gray-800">Report</button>
            <button className="px-3 py-1.5 text-xs rounded-full border border-gray-700 text-gray-300 hover:bg-gray-800">Report</button>
            <button className="px-3 py-1.5 text-xs rounded-full border border-gray-700 text-gray-300 hover:bg-gray-800">Report</button>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <img 
                src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=3f3f46&color=fff`} 
                className="w-20 h-20 rounded-full border-2 border-gray-600" 
                alt={u.username}
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-white">{u.fullName || u.username}</h1>
                <p className="text-gray-400">@{u.username}</p>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={handleFollow} 
                    disabled={isRequestPending}
                    className={`px-4 py-2 rounded-full font-medium text-sm ${isRequestPending ? 'bg-gray-700 text-gray-300 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-500'}`}
                  >{isRequestPending ? 'Requested' : 'Request Follow'}</button>
                  <button onClick={handleMessage} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-full text-sm font-medium hover:bg-gray-800">Message</button>
                </div>
                <div className="flex items-center gap-6 text-sm mt-4">
                  <button onClick={()=>setShowFollowers(true)} className="text-white hover:underline">
                    <span className="font-semibold">{followersCount}</span>
                    <span className="text-gray-400 ml-1">Followers</span>
                  </button>
                  <button onClick={()=>setShowFollowing(true)} className="text-white hover:underline">
                    <span className="font-semibold">{followingCount}</span>
                    <span className="text-gray-400 ml-1">Following</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-gray-900/40 border border-gray-700 text-gray-300">
              This account is private. Your follow request must be accepted to view this profile.
            </div>
          </div>

          {toast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/80 text-white text-sm border border-white/10">{toast}</div>
          )}

          {/* Followers / Following Modals */}
          {(showFollowers || showFollowing) && (
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>{setShowFollowers(false);setShowFollowing(false);}}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md p-4" onClick={(e)=>e.stopPropagation()}>
                <h3 className="text-white font-semibold mb-3">{showFollowers ? 'Followers' : 'Following'}</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {(() => {
                    const ids = showFollowers ? followService.listFollowers(u.id) : followService.listFollowing(u.id);
                    if (ids.length === 0) return <div className="text-gray-500 text-sm">None</div>;
                    return ids.map((id) => (
                      <div key={id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/40">
                        <div className="w-8 h-8 rounded-full bg-gray-600" />
                        <div className="text-gray-200 text-sm">{id}</div>
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex justify-end mt-3">
                  <button onClick={()=>{setShowFollowers(false);setShowFollowing(false);}} className="px-4 py-2 rounded-lg bg-gray-700 text-white">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="p-6">
            <div className="flex items-start gap-6">
              <img 
                src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=3f3f46&color=fff`} 
                className="w-20 h-20 rounded-full border-2 border-gray-600" 
                alt={u.username}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h1 className="text-2xl font-bold text-white">{u.fullName || u.username}</h1>
                    <p className="text-gray-400">u/{u.username}</p>
                  </div>
                  {me && me.id !== u.id && (
                    <div className="flex gap-2">
                      <button 
                        onClick={handleFollow} 
                        disabled={!isFollowing && isPrivate && isRequestPending}
                        className={`px-4 py-2 rounded-full font-medium text-sm transition-colors ${
                          isFollowing 
                            ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600' 
                            : (isPrivate ? (isRequestPending ? 'bg-gray-700 text-gray-300 cursor-not-allowed' : 'bg-orange-600 text-white hover:bg-orange-500') : 'bg-orange-600 text-white hover:bg-orange-500')
                        }`}
                      >
                        {isFollowing ? 'Following' : (isPrivate ? (isRequestPending ? 'Requested' : 'Request Follow') : 'Follow')}
                      </button>
                      <button onClick={handleMessage} className="px-4 py-2 border border-gray-600 text-gray-300 rounded-full text-sm font-medium hover:bg-gray-800">Message</button>
                    </div>
                  )}
                </div>
                
                {u.bio && (
                  <p className="text-gray-300 mb-3">{u.bio}</p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                  {u.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{u.location}</span>
                    </div>
                  )}
                  {u.joinedDate && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {u.joinedDate}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <button onClick={()=>setShowFollowers(true)} className="text-white hover:underline">
                    <span className="font-semibold">{followersCount}</span>
                    <span className="text-gray-400 ml-1">Followers</span>
                  </button>
                  <button onClick={()=>setShowFollowing(true)} className="text-white hover:underline">
                    <span className="font-semibold">{followingCount}</span>
                    <span className="text-gray-400 ml-1">Following</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex">
            {[
              { key: 'posts', label: 'Posts', count: mockPosts.length },
              { key: 'comments', label: 'Comments', count: 12 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'text-orange-500 border-orange-500'
                    : 'text-gray-400 border-transparent hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {mockPosts.map((post) => (
                <div key={post.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img 
                        src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=3f3f46&color=fff`} 
                        className="w-8 h-8 rounded-full" 
                        alt={u.username}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">u/{u.username}</span>
                          <span className="text-gray-400 text-sm">•</span>
                          <span className="text-gray-400 text-sm">{post.timestamp}</span>
                        </div>
                      </div>
                      <button className="text-gray-400 hover:text-gray-300">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <p className="text-gray-300 mb-3 leading-relaxed">{post.content}</p>
                    
                    {post.image && (
                      <img 
                        src={post.image} 
                        className="w-full rounded-lg mb-3" 
                        alt="Post content"
                      />
                    )}
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <button className="flex items-center gap-2 hover:text-orange-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-green-500 transition-colors">
                        <Share className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-yellow-500 transition-colors">
                        <Bookmark className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'comments' && (
            <div className="space-y-3">
              {mockComments.map((c) => (
                <div key={c.id} className="bg-gray-800 rounded-lg border border-gray-700 p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>{c.time}</span>
                    </div>
                    <p className="text-gray-200 mt-1">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Followers / Following Modals */}
          {(showFollowers || showFollowing) && (
            <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={()=>{setShowFollowers(false);setShowFollowing(false);}}>
              <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md p-4" onClick={(e)=>e.stopPropagation()}>
                <h3 className="text-white font-semibold mb-3">{showFollowers ? 'Followers' : 'Following'}</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {(() => {
                    const ids = showFollowers ? followService.listFollowers(u.id) : followService.listFollowing(u.id);
                    if (ids.length === 0) return <div className="text-gray-500 text-sm">None</div>;
                    return ids.map((id) => (
                      <div key={id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/40">
                        <div className="w-8 h-8 rounded-full bg-gray-600" />
                        <div className="text-gray-200 text-sm">{id}</div>
                      </div>
                    ));
                  })()}
                </div>
                <div className="flex justify-end mt-3">
                  <button onClick={()=>{setShowFollowers(false);setShowFollowing(false);}} className="px-4 py-2 rounded-lg bg-gray-700 text-white">Close</button>
                </div>
              </div>
            </div>
          )}
          {toast && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-black/80 text-white text-sm border border-white/10">{toast}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
