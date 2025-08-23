import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import BottomNav from './BottomNav';
import MenuOverlay from './MenuOverlay';
import DesktopSidebar from './Sidebar/DesktopSidebar';
import RightSidebar from './Sidebar/RightSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { isAuthenticated } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('/');

  // Don't show navigation on login page
  if (location.pathname === '/login') {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-app-background min-h-screen">
        {/* Desktop Sidebars */}
        {isAuthenticated && (
          <>
            <DesktopSidebar />
            <RightSidebar />
          </>
        )}

        {/* Main Content */}
        <main className="pb-16 md:pb-0 md:ml-64 lg:mr-80 min-h-screen">
          <div className="w-full h-full">
            {children}
          </div>
        </main>

        {/* Bottom Navigation - Mobile */}
        {isAuthenticated && (
          <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {/* Menu Overlay */}
        <MenuOverlay 
          isOpen={isMenuOpen} 
          onClose={() => setIsMenuOpen(false)} 
        />
      </div>
    </div>
  );
};

export default Layout;
