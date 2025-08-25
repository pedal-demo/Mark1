import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 

  MapPin, 
  Calendar, 
  Users, 
  Heart, 
  MessageCircle,
  Share2,
  MoreHorizontal,
  Trophy,
  Target,
  Award,
  Bike,
  Route,
  Camera,
  Edit3
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface UserStats {
  posts: number;
  followers: number;
  following: number;
  rides: number;
  distance: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  maxProgress?: number;
}

interface UserPost {
  id: number;
  type: 'image' | 'video' | 'text';
  content?: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const ModernProfile: React.FC = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'rides' | 'achievements'>('posts');
  const [isFollowing, setIsFollowing] = useState(false);

  const userStats: UserStats = {
    posts: 0,
    followers: 0,
    following: 0,
    rides: 0,
    distance: '0 km'
  };

  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'Adventure Seeker',
      description: 'Complete 10 long-distance rides',
      icon: '🏔️',
      earned: true
    },
    {
      id: 2,
      title: 'Track Master',
      description: 'Attend 5 track days',
      icon: '🏁',
      earned: true
    },
    {
      id: 3,
      title: 'Community Builder',
      description: 'Help 50 fellow riders',
      icon: '🤝',
      earned: false,
      progress: 32,
      maxProgress: 50
    },
    {
      id: 4,
      title: 'Speed Demon',
      description: 'Reach 200+ km/h safely',
      icon: '⚡',
      earned: true
    },
    {
      id: 5,
      title: 'Explorer',
      description: 'Visit 25 different cities',
      icon: '🗺️',
      earned: false,
      progress: 18,
      maxProgress: 25
    },
    {
      id: 6,
      title: 'Mechanic',
      description: 'Complete 20 bike modifications',
      icon: '🔧',
      earned: false,
      progress: 12,
      maxProgress: 20
    }
  ];

  const [posts, setPosts] = useState<any[]>([]);

  const [userPosts, setUserPosts] = useState<UserPost[]>([]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const tabs = [
    { id: 'posts', label: 'Posts', icon: Camera },
    { id: 'rides', label: 'Rides', icon: Route },
    { id: 'achievements', label: 'Achievements', icon: Trophy }
  ];

  return (
    <div className="min-h-screen bg-app-background">
      {/* Profile Header */}
      <div className="bg-app-card-surface border-b border-app-borders">
        {/* Cover Photo */}
        <div className="relative h-48 bg-gradient-to-r from-app-primary-accent to-primary-600">
          <div className="absolute inset-0 bg-black/20" />
          {/* Cover image removed - no dummy images */}
          <button className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-colors">
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-4 pb-4">
          <div className="flex items-end justify-between -mt-16 mb-4">
            <div className="relative">
              <img
                src={user?.avatar || ''}
                alt={user?.fullName}
                className="w-32 h-32 rounded-full border-4 border-app-card-surface bg-gray-300"
              />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-app-primary-accent rounded-full flex items-center justify-center text-white font-bold border-4 border-app-card-surface">
                1
              </div>
            </div>
            <div className="flex gap-2 mb-8">
              <button className="px-4 py-2 bg-app-background hover:bg-app-borders text-app-text-primary rounded-lg font-medium transition-colors">
                
              </button>
              <button className="px-6 py-2 bg-app-primary-accent hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
                Edit Profile
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-app-text-primary">
                {user?.fullName || 'Alex Rodriguez'}
              </h1>
              <div className="w-6 h-6 bg-app-primary-accent rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            </div>
            <p className="text-app-text-muted mb-3">@alexrides • Level 1 Rider</p>
            <p className="text-app-text-primary mb-4">
              Adventure rider 🏔️ | Royal Enfield enthusiast | Exploring India one mile at a time | 
              Track day addict 🏁
            </p>
            <div className="flex items-center gap-4 text-sm text-app-text-muted">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, India</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined March 2022</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-5 gap-4 py-4 border-t border-app-borders">
            <div className="text-center">
              <div className="text-xl font-bold text-app-text-primary">{userStats.posts}</div>
              <div className="text-xs text-app-text-muted">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-app-text-primary">{formatNumber(userStats.followers)}</div>
              <div className="text-xs text-app-text-muted">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-app-text-primary">{formatNumber(userStats.following)}</div>
              <div className="text-xs text-app-text-muted">Following</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-app-text-primary">{userStats.rides}</div>
              <div className="text-xs text-app-text-muted">Rides</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-app-text-primary">{userStats.distance}</div>
              <div className="text-xs text-app-text-muted">Distance</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-app-card-surface border-b border-app-borders sticky top-0 z-10">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-app-primary-accent border-b-2 border-app-primary-accent'
                    : 'text-app-text-muted hover:text-app-text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 pb-24">
        {(activeTab === 'posts' || activeTab === 'saved') && (
          <>
            <div className="flex gap-2 mb-4">
              <button
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${activeTab === 'posts' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-app-text-muted hover:bg-orange-500/80 hover:text-white'}`}
                onClick={() => setActiveTab('posts')}
              >
                My Posts
              </button>
              <button
                className={`px-4 py-2 rounded-full font-semibold transition-colors ${activeTab === 'saved' ? 'bg-orange-500 text-white' : 'bg-gray-700 text-app-text-muted hover:bg-orange-500/80 hover:text-white'}`}
                onClick={() => setActiveTab('saved')}
              >
                Saved Posts
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(activeTab === 'posts' ? userPosts : userPosts.slice(0,2)).map((post: UserPost, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="aspect-square bg-app-card-surface rounded-lg overflow-hidden relative group cursor-pointer"
                >
                  {post.type === 'image' && (
                    <img
                      src={post.image}
                      alt="Post"
                      className="w-full h-full object-cover"
                    />
                  )}
                  {post.type === 'video' && (
                    <div className="relative w-full h-full bg-black">
                      <video className="w-full h-full object-cover">
                        <source src={post.video} type="video/mp4" />
                      </video>
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                          <Camera className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm font-medium">{formatNumber(post.likes)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{formatNumber(post.comments)}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
        {activeTab === 'rides' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-app-borders rounded-full flex items-center justify-center mx-auto mb-4">
              <Route className="w-8 h-8 text-app-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-app-text-primary mb-2">
              Ride History
            </h3>
            <p className="text-app-text-muted">
              Your ride history and routes will appear here
            </p>
          </div>
        )}
        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-app-card-surface rounded-xl p-4 border ${
                  achievement.earned 
                    ? 'border-app-primary-accent/30 bg-app-primary-accent/5' 
                    : 'border-app-borders'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    achievement.earned 
                      ? 'bg-app-primary-accent/20' 
                      : 'bg-app-borders'
                  }`}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${
                        achievement.earned 
                          ? 'text-app-primary-accent' 
                          : 'text-app-text-primary'
                      }`}>
                        {achievement.title}
                      </h3>
                      {achievement.earned && (
                        <Award className="w-4 h-4 text-app-primary-accent" />
                      )}
                    </div>
                    <p className="text-sm text-app-text-muted mb-2">
                      {achievement.description}
                    </p>
                    {!achievement.earned && achievement.progress && achievement.maxProgress && (
                      <div>
                        <div className="flex justify-between text-xs text-app-text-muted mb-1">
                          <span>Progress</span>
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                        </div>
                        <div className="w-full bg-app-borders rounded-full h-2">
                          <div 
                            className="bg-app-primary-accent h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernProfile;
