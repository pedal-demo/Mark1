import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, 
  Settings, 
  Palette, 
  Shield, 
  Info, 
  Tag, 
  Calendar,
  Users,
  LogOut,
  WifiOff
} from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import ThemePopup from './ThemePopup';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { user, logout } = useUser();
  const [showThemePopup, setShowThemePopup] = useState(false);

  const menuItems = [
    { 



    },
    { 
      icon: Calendar, 
      label: 'Events', 
      path: '/events'
    },
    { 
      icon: Users, 
      label: 'Community', 
      path: '/community'
    },
    { 
      icon: WifiOff, 
      label: 'Offline Application', 
      path: '/offline'
    },
    { 
      icon: Palette, 
      label: 'Theme', 
      action: () => setShowThemePopup(true)
    },
    { 
      icon: Shield, 
      label: 'Privacy Policy', 
      path: '/privacy'
    },
    { 
      icon: Info, 
      label: 'About', 
      path: '/about'
    },
    { 
      icon: LogOut, 
      label: 'Sign Out', 
      action: () => {
        logout();
        navigate('/login');
        onClose();
      },
      destructive: true
    },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  const overlayVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: -50
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className={`absolute top-4 right-4 left-4 rounded-2xl shadow-2xl overflow-hidden ${
                isDarkMode ? 'bg-gray-900' : 'bg-white'
              }`}
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Simple Header */}
              <div className={`p-4 border-b ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>Menu</h2>
                  
                  <motion.button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-all ${
                      isDarkMode
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <motion.button
                        key={item.label}
                        onClick={() => {
                          if (item.action) {
                            item.action();
                          } else if (item.path) {
                            handleNavigation(item.path);
                          }
                        }}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left w-full ${
                          item.destructive
                            ? isDarkMode
                              ? 'text-red-400 hover:bg-red-900/20'
                              : 'text-red-600 hover:bg-red-50'
                            : isActive 
                              ? isDarkMode
                                ? 'bg-orange-900/20 text-orange-300'
                                : 'bg-orange-50 text-orange-700'
                              : isDarkMode
                                ? 'text-gray-300 hover:bg-gray-800'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        variants={itemVariants}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {item.icon && <item.icon className="w-5 h-5" />}
                        <span className="font-medium">{item.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Theme Popup */}
      <ThemePopup 
        isOpen={showThemePopup} 
        onClose={() => setShowThemePopup(false)} 
      />
    </>
  );
};

export default MenuOverlay;
