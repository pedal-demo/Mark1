import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  TrendingUp, 
  Users, 
  Calendar,
  Hash,
  Heart,
  MessageCircle,
  Bookmark,
  Play
} from 'lucide-react';

interface TrendingTag {
  id: number;
  tag: string;
  posts: number;
  growth: string;
}

interface FeaturedPost {
  id: number;
  author: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  image: string;
  likes: number;
  comments: number;
  tags: string[];
  location: string;
}

interface SuggestedUser {
  id: number;
  name: string;
  username: string;
  avatar: string;
  verified?: boolean;
  followers: number;
  mutualFollows: number;
  bio: string;
}

const ModernExplore: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');

  const trendingTags: TrendingTag[] = [
    { id: 1, tag: '#BikeLife', posts: 15420, growth: '+12%' },
    { id: 2, tag: '#RoyalEnfield', posts: 8930, growth: '+8%' },
    { id: 3, tag: '#TrackDay', posts: 5670, growth: '+25%' },
  ];

  const [featuredPosts, setFeaturedPosts] = useState<FeaturedPost[]>([]);

  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);

  const filters = [
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'people', label: 'People', icon: Users },
    { id: 'places', label: 'Places', icon: MapPin },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'tags', label: 'Tags', icon: Hash }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-app-background">
      {/* Search Header */}
      <div className="sticky top-0 bg-app-card-surface border-b border-app-borders z-10">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-app-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search riders, places, tags..."
              className="w-full pl-10 pr-12 py-3 bg-app-background border border-app-borders rounded-xl text-app-text-primary placeholder-app-text-muted focus:outline-none focus:border-app-primary-accent transition-colors"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-app-background rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-app-text-muted" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex overflow-x-auto px-4 pb-4">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap mr-3 ${
                  activeFilter === filter.id
                    ? 'bg-app-primary-accent text-white'
                    : 'bg-app-background text-app-text-muted hover:text-app-text-primary hover:bg-app-borders'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {activeFilter === 'trending' && (
          <div className="space-y-6">
            {/* Trending Tags */}
            <div>
              <h2 className="text-lg font-bold text-app-text-primary mb-4">Trending Tags</h2>
              <div className="grid grid-cols-2 gap-3">
                {trendingTags.map((tag, index) => (
                  <motion.div
                    key={tag.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-app-card-surface rounded-xl p-4 border border-app-borders hover:border-app-primary-accent/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-app-primary-accent">{tag.tag}</h3>
                      <span className="text-xs bg-status-success/20 text-status-success px-2 py-1 rounded-full">
                        {tag.growth}
                      </span>
                    </div>
                    <p className="text-sm text-app-text-muted">
                      {formatNumber(tag.posts)} posts
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Featured Posts */}
            <div>
              <h2 className="text-lg font-bold text-app-text-primary mb-4">Featured Posts</h2>
              <div className="space-y-4">
                {featuredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-app-card-surface rounded-xl border border-app-borders overflow-hidden"
                  >
                    <div className="relative">
                      <img
                        src={post.image}
                        alt="Featured post"
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 mb-2">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-8 h-8 rounded-full border-2 border-white"
                          />
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-white font-semibold text-sm">
                                {post.author.name}
                              </span>
                              {post.author.verified && (
                                <div className="w-4 h-4 bg-app-primary-accent rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-white/80">
                              <MapPin className="w-3 h-3" />
                              <span>{post.location}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-white text-sm mb-2">{post.content}</p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-white/80">
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            <span className="text-sm">{formatNumber(post.likes)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            <span className="text-sm">{formatNumber(post.comments)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeFilter === 'people' && (
          <div>
            <h2 className="text-lg font-bold text-app-text-primary mb-4">Suggested for You</h2>
            <div className="space-y-4">
              {suggestedUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-app-card-surface rounded-xl p-4 border border-app-borders"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-app-text-primary">{user.name}</h3>
                        {user.verified && (
                          <div className="w-4 h-4 bg-app-primary-accent rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-app-text-muted mb-2">{user.username}</p>
                      <p className="text-sm text-app-text-primary mb-3">{user.bio}</p>
                      <div className="flex items-center gap-4 text-xs text-app-text-muted mb-3">
                        <span>{formatNumber(user.followers)} followers</span>
                        <span>{user.mutualFollows} mutual follows</span>
                      </div>
                      <button className="w-full py-2 bg-app-primary-accent hover:bg-primary-600 text-white rounded-lg font-medium transition-colors">
                        Follow
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Other filter content would go here */}
        {activeFilter !== 'trending' && activeFilter !== 'people' && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-app-borders rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-app-text-muted" />
            </div>
            <h3 className="text-lg font-semibold text-app-text-primary mb-2">
              Coming Soon
            </h3>
            <p className="text-app-text-muted">
              This section is under development
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernExplore;
