import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Heart, 
  MessageCircle,
  Share2,
  Trophy,
  Bookmark,
  Lock,
  UserPlus,
  UserCheck,
  FileText
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface UserStats {
  posts: number;
  followers: number;
  following: number;
  likes: number;
}

interface Post {
  id: number;
  type: 'image' | 'video' | 'text';
  content?: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
}

const Profile: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'posts' | 'achievements' | 'saved'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const userStats: UserStats = {
    posts: 0,
    followers: 0,
    following: 0,
    likes: 0
  };

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user posts from backend
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // const userPosts = await postService.getUserPosts(user?.id);
        setPosts([]);
      } catch (err) {
        setError('Failed to load posts');
        console.error('Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, []);

  const handleFollowToggle = () => {
    setIsFollowing(prev => !prev);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-gray-800 rounded-lg overflow-hidden">
                {post.image && (
                  <img src={post.image} alt="Post" className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-6 text-gray-400 text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="w-4 h-4" />
                      <span>{post.shares}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'achievements':
        return (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No achievements yet</p>
          </div>
        );
      case 'saved':
        return (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No saved posts yet</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-gray-800 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-600" />
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                <h1 className="text-2xl font-bold">{user?.fullName || 'Your Name'}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={handleFollowToggle}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-orange-500 text-white hover:bg-orange-600'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 inline mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 inline mr-2" />
                        Follow
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-white">{userStats.posts}</div>
                  <div className="text-gray-400">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-white">{userStats.followers}</div>
                  <div className="text-gray-400">Followers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-white">{userStats.following}</div>
                  <div className="text-gray-400">Following</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-white">{userStats.likes}</div>
                  <div className="text-gray-400">Likes</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1">
          {[
            { key: 'posts', label: 'Posts', icon: FileText },
            { key: 'achievements', label: 'Achievements', icon: Trophy },
            { key: 'saved', label: 'Saved', icon: Bookmark }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Profile;
