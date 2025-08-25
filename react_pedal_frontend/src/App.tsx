import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Home, Compass, Plus, ShoppingBag, MapPin, User } from 'lucide-react';
import './globals.css';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { PostProvider } from './contexts/PostContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { MessageProvider } from './contexts/MessageContext';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Components
import ModernHome from './pages/ModernHome';
import ModernSettings from './pages/ModernSettings';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePostNew';
import News from './pages/News';
import Messages from './pages/Messages';
import Marketplace from './pages/MarketplaceNew';
import Profile from './pages/Profile';
import Followers from './pages/Followers';
import UserProfile from './pages/UserProfile';
import Login from './pages/Login';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Version from './pages/Version';
import Help from './pages/Help';
import OfflineApplication from './pages/OfflineApplication';

import Maps from './pages/Maps';

import TopNavigation from './components/Navigation/TopNavigation';
import MenuOverlay from './components/Overlays/MenuOverlay';
import NotificationOverlay from './components/Overlays/NotificationOverlay';
import DesktopSidebar from './components/Sidebar/DesktopSidebar';
import { useUser } from './contexts/UserContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Minimal direct navigation router
const PageRouter: React.FC = () => {
  const { user } = useUser();
  const [page, setPage] = React.useState<'home'|'explore'|'create'|'news'|'messages'|'marketplace'|'profile'|'about'|'privacy'|'version'|'help'|'offline'|'settings'|'maps'|'followers'|'user'>('home');
  const [notificationCount, setNotificationCount] = React.useState(0);
  const [messageCount, setMessageCount] = React.useState(0);

  // Functions to update counts
  const addNotification = () => setNotificationCount(prev => prev + 1);
  const clearNotifications = () => setNotificationCount(0);
  const addMessage = () => setMessageCount(prev => prev + 1);
  const clearMessages = () => setMessageCount(0);
  const markNotificationRead = () => setNotificationCount(prev => Math.max(0, prev - 1));
  const markMessageRead = () => setMessageCount(prev => Math.max(0, prev - 1));
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = React.useState(false);
  const [followersQuery, setFollowersQuery] = React.useState<string>('');
  const [userPageId, setUserPageId] = React.useState<string>('');

  // Listen for navigation events from other components (e.g., Explore search)
  React.useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail || {};
      if (detail?.q) setFollowersQuery(String(detail.q));
      setPage('followers');
    };
    window.addEventListener('nav:followers', handler as EventListener);
    return () => window.removeEventListener('nav:followers', handler as EventListener);
  }, []);

  // Listen for direct navigation to a user
  React.useEffect(() => {
    const handler = (e: any) => {
      const detail = e?.detail || {};
      if (detail?.id) setUserPageId(String(detail.id));
      else if (detail?.username) setUserPageId(String(detail.username));
      setPage('user');
    };
    window.addEventListener('nav:user', handler as EventListener);
    return () => window.removeEventListener('nav:user', handler as EventListener);
  }, []);

  // Listen for navigation to settings (from Profile "Edit Profile" button)
  React.useEffect(() => {
    const handler = () => setPage('settings');
    window.addEventListener('nav:settings', handler as EventListener);
    return () => window.removeEventListener('nav:settings', handler as EventListener);
  }, []);

  // Listen for navigation to messages
  React.useEffect(() => {
    const handler = () => setPage('messages');
    window.addEventListener('nav:messages', handler as EventListener);
    return () => window.removeEventListener('nav:messages', handler as EventListener);
  }, []);

  // On follow/unfollow events, open the other user's page
  React.useEffect(() => {
    const onFollow = (e: any) => {
      const { followerId, followingId } = e?.detail || {};
      if (!followerId || !followingId) return;
      // If I followed someone, open their page; if someone followed me, open their page
      const currentId = user?.id;
      if (!currentId) return;
      const otherId = currentId === followerId ? followingId : currentId === followingId ? followerId : null;
      if (otherId) {
        setUserPageId(String(otherId));
        setPage('user');
      }
    };
    window.addEventListener('realtime:follow', onFollow as EventListener);
    return () => window.removeEventListener('realtime:follow', onFollow as EventListener);
  }, [user]);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    // TODO: Implement side menu functionality
  };

  const handleNewsClick = () => {
    setPage('news');
  };

  const handleNotificationsClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleMessagesClick = () => {
    setPage('messages');
  };

  // Dev guard: log undefined components once
  React.useEffect(() => {
    const comps: Record<string, any> = {
      ModernHome,
      Explore,
      CreatePost,
      News,
      Messages,
      Maps,
      Marketplace,
      Profile,
      Followers,
      UserProfile,
      About,
      Privacy,
      Version,
      Help,
      OfflineApplication,
      ModernSettings,
      TopNavigation,
      MenuOverlay,
      NotificationOverlay,
      DesktopSidebar,
    };
    Object.entries(comps).forEach(([name, cmp]) => {
      if (typeof cmp !== 'function' && typeof cmp !== 'object') {
        // eslint-disable-next-line no-console
        console.warn(`[PageRouter] Component '${name}' is ${String(cmp)} (expected function/class). Check its import/export.`);
      }
    });
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Top Navigation */}
      {TopNavigation ? (
      <TopNavigation
        onMenuClick={handleMenuClick}
        onNewsClick={handleNewsClick}
        onNotificationsClick={handleNotificationsClick}
        onMessagesClick={handleMessagesClick}
        activeTab={page}
        notificationCount={notificationCount}
        messageCount={messageCount}
      />) : null}
      
      {/* Desktop Layout - Only visible on desktop */}
      <div className="hidden md:flex flex-1 pt-16">
        {/* Left Navigation - Narrow sidebar with icons only */}
        <div className="w-16 bg-gray-900 border-r border-gray-800 flex flex-col">
          <div className="p-2">
            <div className="flex flex-col gap-2">
              <button className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${page==='home' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`} onClick={()=>setPage('home')}>
                <Home className="w-6 h-6" />
              </button>
              <button className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${page==='explore' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-orange-500/10 hover:text-orange-500'}`} onClick={()=>setPage('explore')}>
                <Compass className="w-6 h-6" />
              </button>
              <button className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${page==='create' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-orange-500/10 hover:text-orange-500'}`} onClick={()=>setPage('create')}>
                <Plus className="w-6 h-6" />
              </button>
              <button className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${page==='maps' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-orange-500/10 hover:text-orange-500'}`} onClick={()=>setPage('maps')}>
                <MapPin className="w-6 h-6" />
              </button>
              <button className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${page==='marketplace' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-orange-500/10 hover:text-orange-500'}`} onClick={()=>setPage('marketplace')}>
                <ShoppingBag className="w-6 h-6" />
              </button>
              <button className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${page==='profile' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-orange-500/10 hover:text-orange-500'}`} onClick={()=>setPage('profile')}>
                <User className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Status Window - Starts immediately after navigation (no gap) */}
        <div className="w-[320px] lg:w-[400px] bg-gray-900 border-r border-gray-800">
          {DesktopSidebar ? <DesktopSidebar /> : null}
        </div>
        
        {/* Main Feed Content - Scrollable */}
        <div className="flex-1 overflow-y-auto h-screen bg-gray-900 pr-4 lg:pr-6">
          {page === 'home' && ModernHome ? <ModernHome /> : null}
          {page === 'explore' && Explore ? <Explore /> : null}
          {page === 'create' && CreatePost ? <CreatePost /> : null}
          {page === 'news' && News ? <News /> : null}
          {page === 'messages' && Messages ? <Messages /> : null}
          {page === 'maps' && Maps ? <Maps /> : null}
          {page === 'marketplace' && Marketplace ? <Marketplace /> : null}
          {page === 'profile' && Profile ? <Profile /> : null}
          {page === 'followers' && Followers ? <Followers initialQuery={followersQuery} /> : null}
          {page === 'user' && UserProfile ? <UserProfile userIdOrUsername={userPageId} /> : null}
          
          {page === 'about' && <About />}
          {page === 'privacy' && <Privacy />}
          {page === 'version' && <Version />}
          {page === 'help' && <Help />}
          {page === 'offline' && <OfflineApplication />}
          {page === 'settings' && <ModernSettings />}
          
          
        </div>
      </div>
      
      {/* Mobile Content - Only visible on mobile */}
      <div className="md:hidden flex-1 overflow-auto pt-16">
        {page === 'home' && ModernHome ? <ModernHome /> : null}
        {page === 'explore' && Explore ? <Explore /> : null}
        {page === 'create' && CreatePost ? <CreatePost /> : null}
        {page === 'news' && News ? <News /> : null}
        {page === 'messages' && Messages ? <Messages /> : null}
        {page === 'maps' && Maps ? <Maps /> : null}
        {page === 'marketplace' && Marketplace ? <Marketplace /> : null}
        {page === 'profile' && Profile ? <Profile /> : null}
        {page === 'followers' && Followers ? <Followers initialQuery={followersQuery} /> : null}
        {page === 'user' && UserProfile ? <UserProfile userIdOrUsername={userPageId} /> : null}
        
        {page === 'about' && <About />}
        {page === 'privacy' && <Privacy />}
        {page === 'version' && <Version />}
        {page === 'help' && <Help />}
        {page === 'offline' && <OfflineApplication />}
        {page === 'settings' && <ModernSettings />}
        
        
      </div>
      
      {/* Menu Overlay */}
      {MenuOverlay ? (
      <MenuOverlay
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(newPage) => {
          setPage(newPage as 'home'|'explore'|'create'|'news'|'messages'|'marketplace'|'profile'|'about'|'privacy'|'version'|'help'|'offline'|'settings'|'maps'|'followers'|'user');
          setIsMenuOpen(false);
        }}
      />) : null}
      
      {/* Notification Overlay */}
      {NotificationOverlay ? (
      <NotificationOverlay
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onOpenSettings={() => setPage('settings')}
      />) : null}
      
      {/* Create Post Modal Placeholder */}
      {isCreatePostOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setIsCreatePostOpen(false)}>
          <div className="bg-app-card-surface rounded-xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-2xl font-bold text-app-text-primary mb-4">Create Post</h2>
            <p className="text-app-text-muted mb-6">Create post functionality will be implemented here.</p>
            <button 
              onClick={() => setIsCreatePostOpen(false)}
              className="w-full px-4 py-2 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {/* Instagram-style Bottom Navigation - Mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-gray-800 border-t border-gray-700">
          <div className="flex items-center justify-around py-2">
            {/* Home Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-3"
              onClick={()=>setPage('home')}
            >
              {page === 'home' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
              )}
            </motion.button>

            {/* Explore Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-3"
              onClick={()=>setPage('explore')}
            >
              {page === 'explore' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"/>
                </svg>
              )}
            </motion.button>

            {/* Create Post Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-3"
              onClick={()=>setPage('create')}
            >
              {page === 'create' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              )}
            </motion.button>

            {/* Maps Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-3"
              onClick={()=>setPage('maps')}
            >
              {page === 'maps' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              )}
            </motion.button>

            {/* Marketplace Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-3"
              onClick={()=>setPage('marketplace')}
            >
              {page === 'marketplace' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              )}
            </motion.button>

            {/* Profile Button */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              className="p-3"
              onClick={()=>setPage('profile')}
            >
              {page === 'profile' ? (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="white" stroke="black" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </nav>
    </div>
  );
};



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate authentication check
  useEffect(() => {
    const checkAuth = () => {
      // Check authentication status from localStorage
      const authStatus = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(authStatus);
      setIsLoading(false);
    };

    setTimeout(checkAuth, 1000); // Simulate loading time
  }, []);

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">PEDAL</h1>
          <div className="w-8 h-1 bg-primary-500 rounded mx-auto animate-pulse"></div>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <UserProvider>
              <Login onLogin={handleLogin} />
            </UserProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <NotificationProvider>
              <MessageProvider>
                <PostProvider>
                  <PageRouter />
                </PostProvider>
              </MessageProvider>
            </NotificationProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
