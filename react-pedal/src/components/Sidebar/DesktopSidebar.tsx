import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  Trophy, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface TrendingTopic {
  id: number;
  title: string;
  posts: number;
  trend: 'up' | 'down' | 'stable';
}


interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  participants: number;
  location: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
}

const DesktopSidebar: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useUser();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const trendingTopics: TrendingTopic[] = [
    { id: 1, title: '#MountainBiking', posts: 1247, trend: 'up' },
    { id: 2, title: '#RoadCycling', posts: 892, trend: 'up' },
    { id: 3, title: '#BikeRepair', posts: 634, trend: 'stable' },
    { id: 4, title: '#CyclingTips', posts: 445, trend: 'down' },
    { id: 5, title: '#GroupRides', posts: 321, trend: 'up' }
  ];

  // Helper to format big numbers for display
  const formatNumber = (num?: number) => {
    if (typeof num !== 'number') return '0';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return String(num);
  };

  const upcomingEvents: UpcomingEvent[] = [
    {
      id: 1,
      title: 'Weekend Group Ride',
      date: 'Tomorrow 8:00 AM',
      participants: 24,
      location: 'Central Park'
    },
    {
      id: 2,
      title: 'Mountain Trail Challenge',
      date: 'Sunday 7:00 AM',
      participants: 18,
      location: 'Rocky Mountains'
    },
    {
      id: 3,
      title: 'Bike Maintenance Workshop',
      date: 'Next Week',
      participants: 12,
      location: 'Community Center'
    }
  ];

  const achievements: Achievement[] = [
    {
      id: 1,
      title: 'Daily Rider',
      description: 'Ride 7 days in a row',
      icon: '🚴‍♂️',
      progress: 5,
      maxProgress: 7
    },
    {
      id: 2,
      title: 'Social Butterfly',
      description: 'Join 10 group rides',
      icon: '🦋',
      progress: 7,
      maxProgress: 10
    },
    {
      id: 3,
      title: 'Distance Master',
      description: 'Ride 1000 miles total',
      icon: '🏆',
      progress: 847,
      maxProgress: 1000
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  // Add custom scrollbar styles
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .invisible-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .invisible-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .invisible-scrollbar::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 3px;
        transition: background 0.3s ease;
      }
      .invisible-scrollbar.hover-scrollbar::-webkit-scrollbar-thumb {
        background: #4B5563;
      }
      .invisible-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #6B7280;
      }
      .invisible-scrollbar.scrolling::-webkit-scrollbar-thumb {
        background: #4B5563;
      }
      /* Firefox scrollbar styling */
      .invisible-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: transparent transparent;
      }
      .invisible-scrollbar.hover-scrollbar,
      .invisible-scrollbar.scrolling {
        scrollbar-color: #4B5563 transparent;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return (
    <div 
      className="h-screen overflow-y-auto invisible-scrollbar"
      onMouseEnter={(e) => {
        if (e.currentTarget) {
          e.currentTarget.classList.add('hover-scrollbar');
        }
      }}
      onMouseLeave={(e) => {
        if (e.currentTarget) {
          e.currentTarget.classList.remove('hover-scrollbar');
          e.currentTarget.classList.remove('scrolling');
        }
      }}
      onScroll={(e) => {
        if (e.currentTarget) {
          e.currentTarget.classList.add('scrolling');
          clearTimeout((e.currentTarget as any).scrollTimeout);
          (e.currentTarget as any).scrollTimeout = setTimeout(() => {
            if (e.currentTarget && !e.currentTarget.classList.contains('hover-scrollbar')) {
              e.currentTarget.classList.remove('scrolling');
            }
          }, 1000);
        }
      }}
    >
      <div className="p-6 space-y-6">
        {/* Current Time & Date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-400">
              {formatDate(currentTime)}
            </div>
          </div>
        </motion.div>

        {/* Your Stats (User Stats) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-orange-500" />
            Your Stats
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{formatNumber(user?.posts)}</div>
              <div className="text-xs text-gray-400">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{formatNumber(user?.followers)}</div>
              <div className="text-xs text-gray-400">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{formatNumber(user?.following)}</div>
              <div className="text-xs text-gray-400">Following</div>
            </div>
          </div>
        </motion.div>

        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Trending Now
          </h3>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <div key={topic.id} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    topic.trend === 'up' ? 'bg-green-500' : 
                    topic.trend === 'down' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-white">{topic.title}</div>
                    <div className="text-xs text-gray-400">{topic.posts.toLocaleString()} posts</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            Upcoming Events
          </h3>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="p-3 bg-gray-700 rounded-lg">
                <div className="font-medium text-white mb-2">{event.title}</div>
                <div className="text-xs text-gray-400 mb-2">
                  <div className="flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3" />
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {event.participants} participants
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Achievement Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gray-800 rounded-xl p-4 border border-gray-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-orange-500" />
            Your Progress
          </h3>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{achievement.icon}</span>
                    <div>
                      <div className="text-sm font-medium text-white">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-gray-400">
                        {achievement.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {achievement.progress}/{achievement.maxProgress}
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions removed as requested */}
      </div>
    </div>
  );
};

export default DesktopSidebar;
