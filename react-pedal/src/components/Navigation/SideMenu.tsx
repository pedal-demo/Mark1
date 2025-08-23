import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Users, 
  Calendar, 
  Wifi, 
  WifiOff, 
  HelpCircle, 
  Moon, 
  Sun,
  LogOut,
  User,
  Trophy,
  Target,
  Zap,
  Star,
  Shield
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useUser();

  const menuItems = [
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      description: 'Connect with fellow riders',
      badge: '12',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 'events',
      label: 'Events',
      icon: Calendar,
      description: 'Upcoming rides & meetups',
      badge: '3',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      id: 'challenges',
      label: 'Challenges',
      icon: Target,
      description: 'Weekly ride challenges',
      badge: 'NEW',
      color: 'text-app-primary-accent',
      bgColor: 'bg-app-primary-accent/10'
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: Trophy,
      description: 'Top riders & achievements',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10'
    },
    {
      id: 'premium',
      label: 'Premium',
      icon: Star,
      description: 'Unlock exclusive features',
      badge: 'PRO',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      id: 'offline',
      label: 'Offline Mode',
      icon: WifiOff,
      description: 'Download maps & routes',
      toggle: true,
      color: 'text-gray-500',
      bgColor: 'bg-gray-500/10'
    }
  ];

  const handleItemClick = (itemId: string) => {
    onNavigate(itemId);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Side Menu */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-80 bg-app-card-surface/95 backdrop-blur-xl border-r border-app-borders/50 z-50 overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-app-borders/30 bg-gradient-to-r from-app-primary-accent/5 to-transparent">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-app-primary-accent to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">P</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-app-text-primary">PEDAL</h2>
                    <p className="text-xs text-app-text-muted">Ride Together</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 hover:bg-app-primary-accent/10 rounded-xl transition-colors border border-app-borders/30"
                >
                  <X className="w-5 h-5 text-app-text-muted" />
                </motion.button>
              </div>

              {/* User Profile Section */}
              {user && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative p-4 bg-gradient-to-r from-app-background/80 to-app-card-surface/50 rounded-2xl border border-app-borders/30 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-r from-app-primary-accent to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-app-card-surface flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-app-text-primary text-lg">{user.fullName}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Shield className="w-3 h-3 text-app-primary-accent" />
                        <p className="text-sm text-app-text-muted">Level 12 Rider</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4 text-app-primary-accent" />
                        <div className="text-lg font-bold text-app-primary-accent">2,847</div>
                      </div>
                      <div className="text-xs text-app-text-muted">XP Points</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Menu Items */}
            <div className="p-4">
              <h3 className="text-sm font-bold text-app-text-muted uppercase tracking-wider mb-6 px-2">
                Explore
              </h3>
              <div className="space-y-2">
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleItemClick(item.id)}
                      className="w-full group relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-app-background/60 to-app-card-surface/30 hover:from-app-background hover:to-app-card-surface transition-all duration-300 border border-app-borders/20 hover:border-app-borders/40 backdrop-blur-sm">
                        <div className={`w-12 h-12 ${item.bgColor || 'bg-app-background'} rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <IconComponent className={`w-6 h-6 ${item.color || 'text-app-text-muted'} group-hover:scale-110 transition-transform duration-300`} />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-bold text-app-text-primary group-hover:text-app-primary-accent transition-colors duration-300">{item.label}</h3>
                            {item.badge && (
                              <motion.span 
                                whileHover={{ scale: 1.1 }}
                                className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm ${
                                  item.badge === 'NEW' 
                                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                                    : item.badge === 'PRO'
                                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                                    : 'bg-gradient-to-r from-app-primary-accent to-orange-600 text-white'
                                }`}
                              >
                                {item.badge}
                              </motion.span>
                            )}
                          </div>
                          <p className="text-sm text-app-text-muted group-hover:text-app-text-primary/80 transition-colors duration-300">{item.description}</p>
                        </div>
                        
                        {/* Hover effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-app-primary-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/*  Section */}
            <div className="p-4 border-t border-app-borders mt-4">
              <h3 className="text-sm font-semibold text-app-text-muted uppercase tracking-wider mb-3">
                
              </h3>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-app-background transition-colors"
              >
                <div className="w-10 h-10 bg-app-background rounded-lg flex items-center justify-center">
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 text-app-text-muted" />
                  ) : (
                    <Moon className="w-5 h-5 text-app-text-muted" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-app-text-primary">
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </h3>
                  <p className="text-sm text-app-text-muted">Switch theme</p>
                </div>
              </button>

              {/*  */}
              <button
                onClick={() => handleItemClick('settings')}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-app-background transition-colors"
              >
                <div className="w-10 h-10 bg-app-background rounded-lg flex items-center justify-center">
                  
                </div>
                <div className="flex-1 text-left">
                  
                  <p className="text-sm text-app-text-muted">App preferences</p>
                </div>
              </button>

              {/* Support */}
              <button
                onClick={() => handleItemClick('support')}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-app-background transition-colors"
              >
                <div className="w-10 h-10 bg-app-background rounded-lg flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-app-text-muted" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-app-text-primary">Support</h3>
                  <p className="text-sm text-app-text-muted">Help & feedback</p>
                </div>
              </button>
            </div>

            {/* Logout */}
            <div className="p-4 border-t border-app-borders">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-status-error/10 transition-colors text-status-error"
              >
                <div className="w-10 h-10 bg-status-error/10 rounded-lg flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold">Logout</h3>
                  <p className="text-sm opacity-75">Sign out of your account</p>
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SideMenu;
