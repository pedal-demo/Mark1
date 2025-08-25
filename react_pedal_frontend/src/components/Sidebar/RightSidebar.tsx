import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import Events from '../Events';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  Trophy, 
  Clock,
  Star,
  MessageCircle,
  Heart,
  ChevronRight,
  Zap,
  Target,
  Award,
  Activity,
  Car,
  Wrench,
  Fuel,
  Timer,
  ThermometerSun,
  Wind,
  Navigation,

} from 'lucide-react';

interface TrendingHashtag {
  id: number;
  tag: string;
  posts: number;
  trend: 'up' | 'down' | 'stable';
}

interface LiveActivity {
  id: number;
  user: string;
  action: string;
  time: string;
  avatar: string;
}

interface WeatherData {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
}

interface GarageAlert {
  id: number;
  type: 'maintenance' | 'parts' | 'reminder';
  message: string;
  urgency: 'high' | 'medium' | 'low';
  icon: string;
}

const RightSidebar: React.FC = () => {
  const { user } = useUser();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData>({
    temperature: 72,
    condition: 'Clear',
    windSpeed: 8,
    humidity: 45
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const trendingHashtags: TrendingHashtag[] = [
    { id: 1, tag: '#JDM', posts: 2847, trend: 'up' },
    { id: 2, tag: '#Supercharged', posts: 1892, trend: 'up' },
    { id: 3, tag: '#Restoration', posts: 1634, trend: 'stable' },
    { id: 4, tag: '#TrackDay', posts: 1245, trend: 'up' },
    { id: 5, tag: '#ElectricBuild', posts: 921, trend: 'up' }
  ];

  const liveActivity: LiveActivity[] = [
    { id: 1, user: 'SpeedDemon92', action: 'completed a turbo install', time: '2m ago', avatar: '🏎️' },
    { id: 2, user: 'GarageMaster', action: 'shared new build photos', time: '5m ago', avatar: '🔧' },
    { id: 3, user: 'DriftKing', action: 'joined Track Day event', time: '8m ago', avatar: '🏁' },
    { id: 4, user: 'ClassicRider', action: 'posted restoration update', time: '12m ago', avatar: '🚗' }
  ];

  const garageAlerts: GarageAlert[] = [
    {
      id: 1,
      type: 'maintenance',
      message: 'Oil change due in 500 miles',
      urgency: 'medium',
      icon: '🛢️'
    },
    {
      id: 2,
      type: 'parts',
      message: 'Brake pads back in stock',
      urgency: 'low',
      icon: '🔧'
    },
    {
      id: 3,
      type: 'reminder',
      message: 'Track day this weekend',
      urgency: 'high',
      icon: '🏁'
    }
  ];

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default:
        return <div className="w-3 h-3 rounded-full bg-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'border-l-red-500';
      case 'medium':
        return 'border-l-yellow-500';
      default:
        return 'border-l-green-500';
    }
  };

  return (
    <div className="hidden lg:block fixed right-0 top-0 w-80 h-screen bg-app-background border-l border-app-borders overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Live Clock & Weather */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-app-card-surface rounded-xl p-4 border border-app-borders"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="text-2xl font-bold text-app-text-primary">
              {formatTime(currentTime)}
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-app-primary-accent">
                {weather.temperature}°F
              </div>
              <div className="text-xs text-app-text-muted">
                {weather.condition}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-app-text-muted">
            <div className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              {weather.windSpeed} mph
            </div>
            <div className="flex items-center gap-1">
              <ThermometerSun className="w-3 h-3" />
              {weather.humidity}% humidity
            </div>
          </div>
        </motion.div>

        {/* Trending Hashtags */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-app-card-surface rounded-xl p-4 border border-app-borders"
        >
          <h3 className="text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-app-primary-accent" />
            Trending Now
          </h3>
          <div className="space-y-3">
            {trendingHashtags.map((hashtag, index) => (
              <div key={hashtag.id} className="flex items-center justify-between hover:bg-app-background p-2 rounded-lg cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-app-text-muted w-4">
                    {index + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-app-text-primary">
                      {hashtag.tag}
                    </div>
                    <div className="text-xs text-app-text-muted">
                      {hashtag.posts.toLocaleString()} posts
                    </div>
                  </div>
                </div>
                {getTrendIcon(hashtag.trend)}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-app-card-surface rounded-xl p-4 border border-app-borders"
        >
          <h3 className="text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-app-primary-accent" />
            Live Activity
          </h3>
          <div className="space-y-3">
            {liveActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 hover:bg-app-background rounded-lg cursor-pointer transition-colors">
                <div className="text-lg">{activity.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="font-medium text-app-primary-accent">
                      {activity.user}
                    </span>
                    <span className="text-app-text-primary ml-1">
                      {activity.action}
                    </span>
                  </div>
                  <div className="text-xs text-app-text-muted mt-1">
                    {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Garage Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-app-card-surface rounded-xl p-4 border border-app-borders"
        >
          <h3 className="text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-app-primary-accent" />
            Garage Alerts
          </h3>
          <div className="space-y-3">
            {garageAlerts.map((alert) => (
              <div key={alert.id} className={`border-l-4 ${getUrgencyColor(alert.urgency)} bg-app-background p-3 rounded-r-lg`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{alert.icon}</span>
                  <span className="text-xs font-medium text-app-primary-accent uppercase tracking-wide">
                    {alert.type}
                  </span>
                </div>
                <div className="text-sm text-app-text-primary">
                  {alert.message}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-app-card-surface rounded-xl p-4 border border-app-borders"
        >
          <h3 className="text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-app-primary-accent" />
            Upcoming Events
          </h3>
          
          <button
            onClick={() => {
              console.log('Events button clicked from sidebar');
              // This will need to be passed as a prop
              window.dispatchEvent(new CustomEvent('showEvents'));
            }}
            className="w-full bg-app-primary-accent hover:bg-app-primary-accent/90 text-white rounded-lg px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <Calendar className="w-5 h-5" />
            View All Events
          </button>
          
          <Events variant="desktop" maxEvents={3} showFilters={false} />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-app-card-surface rounded-xl p-4 border border-app-borders"
        >
          <h3 className="text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-app-primary-accent" />
            Community Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-app-primary-accent">2.4K</div>
              <div className="text-xs text-app-text-muted">Online</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-app-primary-accent">156</div>
              <div className="text-xs text-app-text-muted">Builds Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-app-primary-accent">89</div>
              <div className="text-xs text-app-text-muted">New Posts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-app-primary-accent">24</div>
              <div className="text-xs text-app-text-muted">Events</div>
            </div>
          </div>
        </motion.div>

        {/* What's in your mind today */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-app-card-surface rounded-xl p-4 border border-app-borders"
        >
          <h3 className="text-lg font-semibold text-app-text-primary mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-app-primary-accent" />
            Share Your Thoughts
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={user?.avatar || 'https://ui-avatars.com/api/?name=User&background=ff6b00&color=fff'}
                alt="Your avatar"
                className="w-10 h-10 rounded-full border-2 border-app-primary-accent/30"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-app-text-primary mb-1">
                  What's on your mind, {user?.fullName?.split(' ')[0] || 'Rider'}?
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <textarea 
                placeholder="Share your latest ride, build progress, or automotive thoughts..."
                className="w-full px-3 py-2 bg-app-background rounded-lg text-app-text-primary placeholder-app-text-muted border border-app-borders focus:border-app-primary-accent focus:outline-none transition-colors resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-app-background rounded-lg transition-colors" title="Add Photo">
                    <Car className="w-4 h-4 text-app-text-muted hover:text-app-primary-accent" />
                  </button>
                  <button className="p-2 hover:bg-app-background rounded-lg transition-colors" title="Add Location">
                    <Navigation className="w-4 h-4 text-app-text-muted hover:text-app-primary-accent" />
                  </button>
                </div>
                <button className="px-4 py-2 bg-app-primary-accent hover:bg-app-primary-accent/80 rounded-lg transition-colors font-medium text-black text-sm">
                  Post
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RightSidebar;
