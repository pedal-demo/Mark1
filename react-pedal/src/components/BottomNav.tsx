import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, Map, ShoppingBag, User } from 'lucide-react';
import { useAppFunctionality } from '../hooks/useAppFunctionality';
import DataService from '../services/DataService';
import { useTheme } from '../contexts/ThemeContext';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { handleNavigation, showNotification } = useAppFunctionality();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const handleTabClick = (tab: string) => {
    handleNavigation(tab);
    onTabChange(tab);
    DataService.log('info', 'user', `Bottom nav clicked: ${tab}`);
  };

  const navItems = [
    {
      path: '/',
      icon: <Home />,
      label: 'Home',
    },
    {
      path: '/explore',
      icon: <Compass />,
      label: 'Explore',
    },
    {
      path: '/post',
      icon: <Plus />,
      label: 'Post',
      isSpecial: true,
    },
    {
      path: '/community',
      icon: <Map />,
      label: 'Community',
    },
    {
      path: '/profile',
      icon: <User />,
      label: 'Profile',
    },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-30 ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } border-t backdrop-blur-sm bg-opacity-95`}
      >
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center justify-center p-2 transition-colors duration-200"
                onClick={() => handleTabClick(item.path)}
              >
                {item.isSpecial ? (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-primary-orange p-3 rounded-full shadow-lg"
                  >
                    <div className="text-white">{item.icon}</div>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-primary-orange'
                        : isDarkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                  </motion.div>
                )}
                {!item.isSpecial && (
                  <span
                    className={`text-xs mt-1 transition-colors ${
                      isActive
                        ? 'text-primary-orange font-medium'
                        : isDarkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                {isActive && !item.isSpecial && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-orange rounded-full"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Side Navigation */}
      <nav className={`hidden md:flex fixed left-0 top-16 bottom-0 w-64 z-30 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-r backdrop-blur-sm bg-opacity-95 flex-col`}>
        <div className="flex-1 py-6">
          <div className="space-y-2 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-orange text-white shadow-lg'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon}
                  </motion.div>
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeSideTab"
                      className="ml-auto w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
