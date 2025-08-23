import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  WifiOff, 

  Info, 
  Shield, 
  Code,
  Bluetooth,
  Phone,
  MapPin,
  Users,
  MessageSquare,
  AlertTriangle,
  Download,
  Zap,
  Share2
} from 'lucide-react';

interface TopLeftMenuProps {
  onNavigate: (page: string) => void;
}

const TopLeftMenu: React.FC<TopLeftMenuProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const offlineFeatures = [
    {
      id: 'offline-maps',
      title: 'Offline Maps',
      description: 'Access downloaded maps without internet',
      icon: MapPin,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      id: 'bluetooth-messaging',
      title: 'Bluetooth Messaging',
      description: 'Send messages to nearby riders (50m range)',
      icon: Bluetooth,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      id: 'emergency-support',
      title: 'Emergency SOS',
      description: 'Call for help even without signal',
      icon: Phone,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      id: 'peer-tracking',
      title: 'Peer Tracking',
      description: 'Track group rides via device-to-device',
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      id: 'offline-logging',
      title: 'Ride Logging',
      description: 'Record rides without internet',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      id: 'file-sharing',
      title: 'File Sharing',
      description: 'Share photos/routes via Bluetooth',
      icon: Share2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10'
    }
  ];

  const menuItems = [
    {
      id: 'about',
      title: 'About',
      description: 'Learn more about PEDAL',
      icon: Info,
      color: 'text-app-text-muted'
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      description: 'Your data protection and privacy',
      icon: Shield,
      color: 'text-app-text-muted'
    },
    {
      id: 'version',
      title: 'Version Info',
      description: 'App version and updates',
      icon: Code,
      color: 'text-app-text-muted'
    }
  ];

  const handleOfflineToggle = () => {
    setIsOfflineMode(!isOfflineMode);
    if (!isOfflineMode) {
      onNavigate('offline-application');
    }
  };

  const handleFeatureClick = (featureId: string) => {
    onNavigate(featureId);
    setIsOpen(false);
  };

  const handleMenuItemClick = (itemId: string) => {
    onNavigate(itemId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-40 p-3 bg-app-card-surface hover:bg-app-primary-accent/10 rounded-xl border border-app-borders transition-colors shadow-lg"
      >
        <Menu className="w-5 h-5 text-app-text-primary" />
      </button>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-app-card-surface border-r border-app-borders z-50 overflow-y-auto"
            >
              {/* Header */}
              <div className="p-6 border-b border-app-borders">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-app-primary-accent to-primary-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">P</span>
                    </div>
                    <h2 className="text-xl font-bold text-app-text-primary">PEDAL</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-app-background rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-app-text-muted" />
                  </button>
                </div>

                {/* Offline Mode Toggle */}
                <div className="bg-app-background rounded-xl p-4 border border-app-borders">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isOfflineMode ? 'bg-app-primary-accent text-white' : 'bg-app-borders text-app-text-muted'
                      }`}>
                        <WifiOff className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-app-text-primary">Offline Mode</h3>
                        <p className="text-xs text-app-text-muted">Work without internet</p>
                      </div>
                    </div>
                    <button
                      onClick={handleOfflineToggle}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        isOfflineMode ? 'bg-app-primary-accent' : 'bg-app-borders'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                        isOfflineMode ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                  {isOfflineMode && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs text-app-primary-accent"
                    >
                      ✓ Offline features are now active
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Offline Features */}
              <div className="p-4">
                <h3 className="text-sm font-semibold text-app-text-muted uppercase tracking-wider mb-4">
                  Offline Features
                </h3>
                <div className="space-y-2">
                  {offlineFeatures.map((feature) => {
                    const Icon = feature.icon;
                    return (
                      <motion.button
                        key={feature.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleFeatureClick(feature.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left group ${
                          isOfflineMode 
                            ? 'hover:bg-app-background' 
                            : 'opacity-50 cursor-not-allowed'
                        }`}
                        disabled={!isOfflineMode}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          isOfflineMode 
                            ? `${feature.bgColor} group-hover:${feature.bgColor.replace('/10', '/20')}` 
                            : 'bg-app-borders'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            isOfflineMode ? feature.color : 'text-app-text-muted'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-app-text-primary text-sm">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-app-text-muted">
                            {feature.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4 border-t border-app-borders">
                <h3 className="text-sm font-semibold text-app-text-muted uppercase tracking-wider mb-4">
                  App Menu
                </h3>
                <div className="space-y-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleMenuItemClick(item.id)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-app-background transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-app-background rounded-lg flex items-center justify-center">
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-app-text-primary text-sm">
                            {item.title}
                          </h4>
                          <p className="text-xs text-app-text-muted">
                            {item.description}
                          </p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-app-borders">
                <div className="text-center">
                  <p className="text-xs text-app-text-muted">
                    PEDAL v2.1.0
                  </p>
                  <p className="text-xs text-app-text-muted mt-1">
                    Built for riders, by riders
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TopLeftMenu;
