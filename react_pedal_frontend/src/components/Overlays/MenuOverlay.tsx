import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 

  User, 
  MapPin, 
  ShoppingBag, 
  Calendar, 
  Users, 
  HelpCircle, 
  LogOut,
  Compass,
  Home,
  Bell,
  MessageCircle,
  ShieldCheck,
  Info,
  Smartphone,
  MessageSquare,
  FileText,
  Settings
} from 'lucide-react';

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ isOpen, onClose, onNavigate }) => {
  const menuItems = [
    { id: 'offline', label: 'Offline Mode', icon: Compass, description: 'Access offline features and content' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Account, preferences, and app settings' },
    
    { id: 'privacy', label: 'Privacy', icon: ShieldCheck, description: 'Privacy settings and data control' },
    { id: 'about', label: 'About', icon: Info, description: 'About PEDAL and app information' },
    
    { id: 'help', label: 'Help & Support', icon: HelpCircle, description: 'Get help and support' },
    { id: 'feedback', label: 'Send Feedback', icon: MessageSquare, description: 'Share your feedback with us' },
    { id: 'terms', label: 'Terms of Service', icon: FileText, description: 'Terms and conditions' },
  ];

  const handleItemClick = (itemId: string) => {
    onNavigate(itemId);
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          {/* Menu Panel */}
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg lg:w-80 xl:w-96 bg-app-card-surface border-r border-app-borders shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 xs:p-4 sm:p-5 md:p-6 border-b border-app-borders">
              <div className="flex items-center gap-2 xs:gap-3 min-w-0 flex-1">
                <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-app-primary-accent to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs xs:text-sm sm:text-lg md:text-xl">P</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-app-text-primary truncate">PEDAL</h2>
                  <p className="text-xs xs:text-xs sm:text-sm md:text-base text-app-text-muted truncate">Navigation Menu</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 xs:p-1.5 sm:p-2 md:p-2.5 hover:bg-app-background rounded-lg transition-colors flex-shrink-0 ml-2"
              >
                <X className="w-4 h-4 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-app-text-muted" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="p-2 xs:p-3 sm:p-4 md:p-5 space-y-1 xs:space-y-1.5 sm:space-y-2 md:space-y-2.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleItemClick(item.id)}
                    className="w-full flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 p-2.5 xs:p-3 sm:p-4 md:p-5 rounded-lg xs:rounded-xl hover:bg-app-primary-accent/10 transition-all duration-200 text-left group"
                  >
                    <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-app-primary-accent/10 rounded-md xs:rounded-lg flex items-center justify-center group-hover:bg-app-primary-accent/20 transition-colors flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-app-primary-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-xs xs:text-sm sm:text-base md:text-lg text-app-text-primary group-hover:text-app-primary-accent transition-colors truncate">
                        {item.label}
                      </h3>
                      <p className="text-xs xs:text-xs sm:text-sm md:text-base text-app-text-muted line-clamp-2 leading-tight">
                        {item.description}
                      </p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-2 xs:p-3 sm:p-4 md:p-5 border-t border-app-borders mt-2 xs:mt-3 sm:mt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => {
                  // Clear authentication
                  localStorage.removeItem('isAuthenticated');
                  localStorage.removeItem('user');
                  localStorage.removeItem('authToken');
                  // Reload the page to trigger login screen
                  window.location.reload();
                }}
                className="w-full flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 p-2.5 xs:p-3 sm:p-4 md:p-5 rounded-lg xs:rounded-xl hover:bg-red-500/10 transition-all duration-200 text-left group"
              >
                <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-500/10 rounded-md xs:rounded-lg flex items-center justify-center group-hover:bg-red-500/20 transition-colors flex-shrink-0">
                  <LogOut className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-xs xs:text-sm sm:text-base md:text-lg text-red-500 truncate">
                    Sign Out
                  </h3>
                  <p className="text-xs xs:text-xs sm:text-sm md:text-base text-app-text-muted leading-tight">
                    Log out of your account
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuOverlay;
