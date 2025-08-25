import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';

// Navigation Components
import TopNavigation from '../Navigation/TopNavigation';
import BottomNavigation from '../Navigation/BottomNavigation';
import SideMenu from '../Navigation/SideMenu';
import TopLeftMenu from '../Navigation/TopLeftMenu';
import CreatePostModal from '../CreatePost/CreatePostModal';

// Page Components
import ModernHome from '../../pages/ModernHome';
import Explore from '../../pages/ModernExplore';
import CreatePost from '../../pages/CreatePostNew';
import ModernMap from '../../pages/ModernMap';
import Marketplace from '../../pages/Marketplace';
import Profile from '../../pages/Profile';
import News from '../../pages/News';
import Messages from '../../pages/Messages';
import OfflineApplication from '../../pages/OfflineApplication';

import CommunityView from '../../pages/Community';
import NotificationsOverlay from '../Overlays/NotificationsOverlay';

interface ProfessionalAppShellProps {}

const ProfessionalAppShell: React.FC<ProfessionalAppShellProps> = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('home');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationCount] = useState(3);
  const [messageCount] = useState(7);

  // Handle navigation
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSideMenuNavigate = (page: string) => {
    setActiveTab(page);
    setIsSideMenuOpen(false);
  };

  const handleTopLeftMenuNavigate = (page: string) => {
    setActiveTab(page);
  };

  const handleCreatePost = () => {
    setIsCreatePostOpen(true);
  };

  const handleSubmitPost = async (postData: any) => {
    console.log('New post:', postData);
    // Here you would typically send the post to your backend
    // For now, we'll just log it
  };

  // Render the active page component
  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <ModernHome />;
      case 'explore':
        return <Explore />;
      case 'maps':
        return <ModernMap />;
      case 'marketplace':
        return <Marketplace />;
      case 'profile':
        return <Profile />;
      case 'news':
        return <News />;
      case 'messages':
        return <Messages />;
      case 'offline':
        return <OfflineApplication />;
      case 'settings':
        return ;
      case 'community':
        return <CommunityView />;
      case 'events':
        return <CommunityView />;
      case 'offline-application':
      case 'offline-maps':
      case 'bluetooth-messaging':
      case 'emergency-support':
      case 'peer-tracking':
      case 'offline-logging':
      case 'file-sharing':
        return <OfflineApplication />;
      case 'about':
      case 'privacy':
      case 'version':
        return <div className="p-8 text-center"><h1 className="text-2xl font-bold text-app-text-primary">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1><p className="text-app-text-muted mt-2">Coming soon...</p></div>;
      default:
        return <ModernHome />;
    }
  };

  return (
    <div className="h-screen bg-app-background text-app-text-primary overflow-hidden">
      {/* Top Navigation */}
      <TopNavigation
        onNewsClick={() => setActiveTab('news')}
        onNotificationsClick={() => setIsNotificationsOpen(true)}
        onMessagesClick={() => setActiveTab('messages')}
        onMenuClick={() => setIsSideMenuOpen(true)}
        activeTab={activeTab}
        notificationCount={3}
        messageCount={2}
      />

      {/* Main Content Area */}
      <div className="pt-16 pb-24 md:pb-4 md:pl-20 h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onCreatePost={handleCreatePost}
      />

      {/* Side Menu */}
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        onNavigate={handleSideMenuNavigate}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={handleSubmitPost}
      />

      {/* Top Left Menu */}
      <TopLeftMenu onNavigate={handleTopLeftMenuNavigate} />

      {/* Notifications Overlay */}
      <NotificationsOverlay
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />


    </div>
  );
};

export default ProfessionalAppShell;
