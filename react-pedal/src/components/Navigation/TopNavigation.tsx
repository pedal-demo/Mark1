import React from 'react';
import { motion } from 'framer-motion';
import { Bell, MessageCircle, Newspaper, Menu } from 'lucide-react';

interface TopNavigationProps {
  onNewsClick: () => void;
  onNotificationsClick: () => void;
  onMessagesClick: () => void;
  onMenuClick?: () => void;
  activeTab?: string;
  notificationCount?: number;
  messageCount?: number;
}

const TopNavigation: React.FC<TopNavigationProps> = ({
  onNewsClick,
  onNotificationsClick,
  onMessagesClick,
  notificationCount = 0,
  messageCount = 0,
  onMenuClick,
  activeTab = 'home'
}) => {
  const getPageTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Home Feed';
      case 'explore':
        return 'Explore';
      case 'news':
        return 'News Feed';
      case 'maps':
        return 'Maps';
      case 'marketplace':
        return 'Marketplace';
      case 'profile':
        return 'Profile';
      case 'notifications':
        return 'Notifications';
      case 'messages':
        return 'Messages';
      default:
        return 'Home Feed';
    }
  };
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-app-background/95 backdrop-blur-md border-b border-app-borders">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        {/* Left - Menu and News Icons Together */}
        <div className="flex items-center gap-2">
          {/* Hamburger Menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMenuClick}
            className="p-2.5 hover:bg-app-primary-accent/10 rounded-xl transition-colors bg-app-card-surface border border-app-borders shadow-sm"
          >
            <Menu className="w-5 h-5 text-app-text-primary" />
          </motion.button>
          
          {/* News Icon - Right next to menu */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewsClick}
            className="p-2.5 hover:bg-app-primary-accent/10 rounded-xl transition-colors bg-app-card-surface border border-app-borders shadow-sm"
          >
            <Newspaper className="w-5 h-5 text-app-text-primary" />
          </motion.button>
        </div>

        {/* Center - Title */}
        <div className="flex-1 flex justify-center items-center">
          <h1 className="text-2xl font-bold text-app-text-primary tracking-wide">{getPageTitle()}</h1>
        </div>

        {/* Right - Notifications only */}
        <div className="flex items-center">
          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNotificationsClick}
            className="relative p-2.5 hover:bg-app-primary-accent/10 rounded-xl transition-colors bg-app-card-surface border border-app-borders shadow-sm mr-16 md:mr-20"
          >
            <Bell className="w-5 h-5 text-app-text-muted" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-app-primary-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Absolute top-right: Messaging icon */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMessagesClick}
        className="fixed top-4 right-4 md:right-6 z-50 p-2.5 hover:bg-app-primary-accent/10 rounded-xl transition-colors bg-app-card-surface border border-app-borders shadow-lg"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      >
        <MessageCircle className="w-5 h-5 text-app-text-muted" />
        {messageCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-app-primary-accent text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
            {messageCount > 9 ? '9+' : messageCount}
          </span>
        )}
      </motion.button>
    </div>
  );
};

export default TopNavigation;
