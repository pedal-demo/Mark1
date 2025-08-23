import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const Community: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('groups');

  const groups = [
    {
      id: 1,
      name: 'Mountain Bikers United',
      members: 342,
      description: 'For serious mountain biking enthusiasts who love challenging trails',
      avatar: '🚵‍♂️',
      isJoined: true,
      activity: 'Very Active'
    },
    {
      id: 2,
      name: 'City Commuters',
      members: 189,
      description: 'Daily commuting tips, routes, and bike maintenance advice',
      avatar: '🚴‍♀️',
      isJoined: false,
      activity: 'Active'
    },
    {
      id: 3,
      name: 'Road Racing Club',
      members: 156,
      description: 'Competitive road cycling and racing events',
      avatar: '🏁',
      isJoined: true,
      activity: 'Moderate'
    }
  ];

  const discussions = [
    {
      id: 1,
      title: 'Best bike maintenance tips for winter?',
      author: 'Alex Johnson',
      replies: 23,
      lastActivity: '2 hours ago',
      category: 'Maintenance',
      isHot: true
    },
    {
      id: 2,
      title: 'New cycling trail opened in North Park',
      author: 'Sarah Chen',
      replies: 15,
      lastActivity: '4 hours ago',
      category: 'Routes',
      isHot: false
    },
    {
      id: 3,
      title: 'Group ride this weekend - who\'s in?',
      author: 'Mike Rodriguez',
      replies: 31,
      lastActivity: '6 hours ago',
      category: 'Events',
      isHot: true
    }
  ];

  const events = [
    {
      id: 1,
      title: 'Weekend Mountain Trail Ride',
      date: 'Saturday, 8:00 AM',
      location: 'Mountain Trail Head',
      attendees: 24,
      organizer: 'Mountain Bikers United'
    },
    {
      id: 2,
      title: 'Bike Maintenance Workshop',
      date: 'Sunday, 2:00 PM',
      location: 'Community Center',
      attendees: 12,
      organizer: 'City Commuters'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'groups':
        return (
          <div className="space-y-6">
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border rounded-xl p-6 hover:shadow-lg transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl">{group.avatar}</div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {group.name}
                      </h3>
                      <p className={`mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {group.description}
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                          {group.members} members
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          group.activity === 'Very Active'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : group.activity === 'Active'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {group.activity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    group.isJoined
                      ? isDarkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-primary-orange text-white hover:bg-orange-600'
                  }`}>
                    {group.isJoined ? 'Joined' : 'Join Group'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'discussions':
        return (
          <div className="space-y-4">
            {discussions.map((discussion, index) => (
              <motion.div
                key={discussion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {discussion.title}
                      </h3>
                      {discussion.isHot && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          🔥 Hot
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        by {discussion.author}
                      </span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {discussion.replies} replies
                      </span>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                        {discussion.lastActivity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {discussion.category}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'events':
        return (
          <div className="space-y-6">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`${
                  isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } border rounded-xl p-6 hover:shadow-lg transition-all duration-200`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{event.date}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{event.location}</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>{event.attendees} attending</span>
                      </div>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        Organized by {event.organizer}
                      </div>
                    </div>
                  </div>
                  <button className="btn-orange">
                    Join Event
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-app-background w-full h-full">
      <div className="pb-16 md:pb-0 w-full h-full">
        {/* Main Container - Fills Available Space */}
        <div className="w-full h-full px-4 md:px-6 pt-6">
          {/* Header */}
          <div className="sticky top-0 z-10 backdrop-blur-md bg-app-background/80 border-b border-app-borders mb-6">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-app-primary-accent to-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">👥</span>
                </div>
                <h1 className="text-xl font-bold text-app-text-primary">Community</h1>
              </div>
            </div>
          </div>
          {/* Welcome Section */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome to the Community! 👥
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Connect with fellow cyclists, join groups, and participate in discussions
              </p>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'groups', label: 'Groups', icon: '👥' },
                { id: 'discussions', label: 'Discussions', icon: '💬' },
                { id: 'events', label: 'Events', icon: '📅' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
      
      {/* Create New Button */}
      <div className="fixed bottom-24 right-6 md:bottom-6">
        <motion.button 
          className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </motion.button>
      </div>
      
    </div>
  );
};

export default Community;
