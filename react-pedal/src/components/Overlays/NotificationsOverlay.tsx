import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, UserPlus, MapPin, Calendar, TrendingUp } from 'lucide-react';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'follow' | 'event' | 'news' | 'location';
  title: string;
  message: string;
  time: string;
  avatar?: string;
  read: boolean;
  eventId?: number;
  eventTitle?: string;
  organizerName?: string;
  organizerAvatar?: string;
}

interface NotificationsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsOverlay: React.FC<NotificationsOverlayProps> = ({ isOpen, onClose }) => {
  const [eventNotifications, setEventNotifications] = useState<any[]>([]);
  
  // Load event notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const notifications = JSON.parse(localStorage.getItem('eventNotifications') || '[]');
      setEventNotifications(notifications);
    };
    
    loadNotifications();
    
    // Listen for notification updates
    const handleNotificationUpdate = () => {
      loadNotifications();
    };
    
    window.addEventListener('notificationUpdate', handleNotificationUpdate);
    
    return () => {
      window.removeEventListener('notificationUpdate', handleNotificationUpdate);
    };
  }, [isOpen]);
  
  // All notifications now come from backend - no dummy data
  const notifications: Notification[] = eventNotifications;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case 'event':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      case 'news':
        return <TrendingUp className="w-5 h-5 text-app-primary-accent" />;
      case 'location':
        return <MapPin className="w-5 h-5 text-yellow-500" />;
      default:
        return <Heart className="w-5 h-5 text-app-primary-accent" />;
    }
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Overlay Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-app-background border-l border-app-borders z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-app-borders">
              <h2 className="text-xl font-bold text-app-text-primary">Notifications</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-app-card-surface rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-app-text-muted" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-app-text-muted">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-4 border-b border-app-borders hover:bg-app-card-surface/50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-app-primary-accent/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar or Icon */}
                    <div className="flex-shrink-0">
                      {notification.organizerAvatar || notification.avatar ? (
                        <img
                          src={notification.organizerAvatar || notification.avatar}
                          alt="User"
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-app-card-surface rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`font-medium ${
                            !notification.read ? 'text-app-text-primary' : 'text-app-text-muted'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-app-text-muted mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-app-text-muted mt-2 block">
                            {notification.time}
                          </span>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-app-primary-accent rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-app-borders">
              <button 
                onClick={() => {
                  // Mark all notifications as read
                  const updatedEventNotifications = eventNotifications.map((notif: any) => ({ ...notif, read: true }));
                  localStorage.setItem('eventNotifications', JSON.stringify(updatedEventNotifications));
                  setEventNotifications(updatedEventNotifications);
                }}
                className="w-full py-2 px-4 bg-app-card-surface hover:bg-app-primary-accent/10 rounded-lg transition-colors text-app-text-primary font-medium"
              >
                Mark All as Read
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsOverlay;
