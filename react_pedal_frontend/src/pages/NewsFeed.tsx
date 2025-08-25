import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const NewsFeed: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Posts', count: 0 },
    { id: 'following', label: 'Following', count: 0 },
    { id: 'local', label: 'Local', count: 0 },
    { id: 'events', label: 'Events', count: 0 }
  ];

  const posts = [
    {
      id: 1,
      user: { name: 'Emma Wilson', avatar: '👩‍🦰', username: '@emmaw', verified: true },
      content: 'Completed my first century ride today! 100 miles through the countryside. My legs are tired but my heart is full! 💪🚴‍♀️',
      image: null,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: '1 hour ago',
      location: 'Countryside Loop Trail',
      tags: ['#CenturyRide', '#Cycling', '#Achievement']
    },
    {
      id: 2,
      user: { name: 'David Park', avatar: '👨‍💼', username: '@davidp', verified: false },
      content: 'Beautiful sunrise ride this morning! There\'s nothing quite like having the roads to yourself at 6 AM. Perfect weather for cycling.',
      image: null,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: '3 hours ago',
      location: 'Riverside Path',
      tags: ['#MorningRide', '#Sunrise', '#PeacefulRide']
    },
    {
      id: 3,
      user: { name: 'Lisa Chen', avatar: '👩‍🔬', username: '@lisac', verified: true },
      content: 'Group ride tomorrow at 8 AM! We\'re exploring the new mountain trail that just opened. All skill levels welcome! 🏔️',
      image: null,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: '5 hours ago',
      location: 'Mountain Trail Head',
      tags: ['#GroupRide', '#MountainBiking', '#NewTrail'],
      isEvent: true
    }
  ];

  const PostCard = ({ post }: { post: any }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-xl p-6 mb-6 shadow-sm hover:shadow-md transition-all duration-200 ${
        post.isEvent ? 'border-l-4 border-l-primary-orange' : ''
      }`}
    >
      <div className="flex items-start space-x-4">
        <div className="text-2xl">{post.user.avatar}</div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold">{post.user.name}</h3>
            {post.user.verified && (
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {post.user.username}
            </span>
            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              • {post.timestamp}
            </span>
            {post.isEvent && (
              <span className="bg-primary-orange text-white text-xs px-2 py-1 rounded-full">
                Event
              </span>
            )}
          </div>
          
          <p className={`mb-3 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            {post.content}
          </p>
          
          {post.location && (
            <div className={`flex items-center space-x-1 mb-3 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{post.location}</span>
            </div>
          )}

          {post.tags && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post.likes}</span>
            </button>
            
            <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments}</span>
            </button>
            
            <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              <span>{post.shares}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} md:ml-64`}>
      <div className="container-custom py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            News Feed 📰
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Stay updated with the latest from your cycling community
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'bg-primary-orange text-white shadow-lg'
                    : isDarkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {filter.label}
                <span className={`ml-2 text-sm ${
                  activeFilter === filter.id
                    ? 'text-orange-100'
                    : isDarkMode
                    ? 'text-gray-400'
                    : 'text-gray-500'
                }`}>
                  ({filter.count})
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Posts */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Load More */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8"
        >
          <button className="btn-orange">
            Load More Posts
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default NewsFeed;
