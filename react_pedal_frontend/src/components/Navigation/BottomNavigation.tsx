import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, Map, ShoppingBag, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onCreatePost: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  onCreatePost
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'create', label: 'Create', icon: Plus, isSpecial: true },
    { id: 'maps', label: 'Maps', icon: Map },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-app-card-surface/95 backdrop-blur-xl rounded-2xl border border-app-borders shadow-2xl shadow-black/20 px-2 py-3"
        >
          <div className="flex items-center justify-around max-w-md mx-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isCreateButton = tab.isSpecial;

              if (isCreateButton) {
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onCreatePost}
                    className="relative"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-app-primary-accent to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-app-primary-accent/25">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? 'bg-app-primary-accent/10 text-app-primary-accent'
                      : 'text-app-text-muted hover:text-app-text-primary hover:bg-app-background/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabMobile"
                      className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-app-primary-accent rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Desktop Left Sidebar Navigation */}
      <div className="hidden md:block fixed left-4 top-1/2 transform -translate-y-1/2 z-50">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-app-card-surface/95 backdrop-blur-xl rounded-2xl border border-app-borders shadow-2xl shadow-black/20 p-3"
        >
          <div className="flex flex-col items-center gap-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isCreateButton = tab.isSpecial;

              if (isCreateButton) {
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onCreatePost}
                    className="relative group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-app-primary-accent to-primary-600 rounded-full flex items-center justify-center shadow-lg shadow-app-primary-accent/25">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-app-card-surface text-app-text-primary px-3 py-2 rounded-lg border border-app-borders text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {tab.label}
                      <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-app-card-surface"></div>
                    </div>
                  </motion.button>
                );
              }

              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-xl transition-all group ${
                    isActive
                      ? 'bg-app-primary-accent/10 text-app-primary-accent'
                      : 'text-app-text-muted hover:text-app-text-primary hover:bg-app-background/50'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabDesktop"
                      className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-app-primary-accent rounded-full"
                    />
                  )}
                  
                  {/* Tooltip */}
                  <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-app-card-surface text-app-text-primary px-3 py-2 rounded-lg border border-app-borders text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {tab.label}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-app-card-surface"></div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default BottomNavigation;
