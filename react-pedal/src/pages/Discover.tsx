import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const Discover: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const trendingTopics = [
    { name: '#MountainBiking', posts: 1234 },
    { name: '#RoadCycling', posts: 987 },
    { name: '#CyclingLife', posts: 756 },
    { name: '#BikeCommute', posts: 543 },
    { name: '#CyclingTips', posts: 432 }
  ];

  const suggestedUsers = [
    { name: 'Alex Rodriguez', username: '@alexr', followers: '2.3k', avatar: '👨‍🦱' },
    { name: 'Maria Santos', username: '@marias', followers: '1.8k', avatar: '👩‍🦳' },
    { name: 'John Kim', username: '@johnk', followers: '3.1k', avatar: '👨‍💼' }
  ];

  const featuredRoutes = [
    { name: 'Coastal Highway', distance: '45 miles', difficulty: 'Moderate', rating: 4.8 },
    { name: 'Mountain Loop', distance: '28 miles', difficulty: 'Hard', rating: 4.9 },
    { name: 'City Circuit', distance: '15 miles', difficulty: 'Easy', rating: 4.6 }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} md:ml-64`}>
      <div className="container-custom py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Discover 🔍
          </h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Find new routes, cyclists, and cycling content
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for routes, users, or topics..."
              className={`w-full p-4 pl-12 rounded-xl border focus:ring-2 focus:ring-primary-orange focus:border-transparent transition-all ${
                isDarkMode 
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <svg className={`absolute left-4 top-4 w-6 h-6 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trending Topics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-xl p-6`}
          >
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Trending Topics
            </h2>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-primary-orange font-medium">{topic.name}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {topic.posts} posts
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Suggested Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-xl p-6`}
          >
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Suggested Users
            </h2>
            <div className="space-y-4">
              {suggestedUsers.map((user, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{user.avatar}</div>
                    <div>
                      <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {user.name}
                      </h3>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.username} • {user.followers} followers
                      </p>
                    </div>
                  </div>
                  <button className="btn-outline-orange text-sm px-3 py-1">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Featured Routes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`${
              isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            } border rounded-xl p-6`}
          >
            <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Featured Routes
            </h2>
            <div className="space-y-4">
              {featuredRoutes.map((route, index) => (
                <div key={index} className={`p-4 rounded-lg border ${
                  isDarkMode ? 'border-gray-700' : 'border-gray-200'
                }`}>
                  <h3 className={`font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {route.name}
                  </h3>
                  <div className="flex justify-between items-center text-sm">
                    <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                      {route.distance} • {route.difficulty}
                    </span>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
                        {route.rating}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Discover;
