import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { 
  X, 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  MapPin, 
  Award,
  Calendar,
  Clock
} from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { followService } from '../../services/followService';
import { messageService } from '../../services/messageService';

interface NotificationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings?: () => void;
}

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'route' | 'achievement' | 'event' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
  avatar?: string;
  icon?: React.ReactNode;
  archived?: boolean;
}

const NotificationOverlay: React.FC<NotificationOverlayProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [items, setItems] = useState<Notification[]>([]);
  const [followReqs, setFollowReqs] = useState<{ followerId: string; followingId: string; createdAt: number }[]>([]);
  const [msgReqs, setMsgReqs] = useState<{ fromId: string; toId: string; createdAt: number }[]>([]);
  const [panel, setPanel] = useState<'notifications' | 'settings'>('notifications');
  const [updateInfo, setUpdateInfo] = useState({
    available: false,
    version: '',
    notes: ''
  });

  // Load notifications from backend
  useEffect(() => {
    const loadNotifications = async () => {
      if (!isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/notifications');
        // const data = await response.json();
        // setNotifications(data);
        // setItems(data);
        
        // For now, load from localStorage or use empty array
        const savedNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        setNotifications(savedNotifications);
        setItems(savedNotifications);
        
        // Check for app updates
        // const updateResponse = await fetch('/api/app-version');
        // const updateData = await updateResponse.json();
        // setUpdateInfo(updateData);
        
      } catch (err) {
        console.error('Failed to load notifications:', err);
        setError('Failed to load notifications');
        setNotifications([]);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
    
    // Load follow/message requests
    const uid = (user?.id || user?.username || '').toLowerCase();
    if (uid) {
      setFollowReqs(followService.listIncomingRequests(uid));
      setMsgReqs(messageService.listIncoming(uid));
    } else {
      setFollowReqs([]);
      setMsgReqs([]);
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handler = () => {
      const uid = (user?.id || user?.username || '').toLowerCase();
      if (!uid) { setFollowReqs([]); setMsgReqs([]); return; }
      setFollowReqs(followService.listIncomingRequests(uid));
      setMsgReqs(messageService.listIncoming(uid));
    };
    const events = [
      'realtime:follow_request','realtime:follow_accept','realtime:follow_decline',
      'realtime:msg_request','realtime:msg_accept','realtime:msg_decline'
    ];
    events.forEach(ev => window.addEventListener(ev, handler as EventListener));
    return () => events.forEach(ev => window.removeEventListener(ev, handler as EventListener));
  }, [user]);

  const handleAcceptFollow = (followerId: string) => {
    const me = (user?.id || user?.username || '').toLowerCase();
    if (!me) return;
    followService.acceptRequest(followerId, me);
  };
  const handleDeclineFollow = (followerId: string) => {
    const me = (user?.id || user?.username || '').toLowerCase();
    if (!me) return;
    followService.declineRequest(followerId, me);
  };
  const handleAcceptMsg = (fromId: string) => {
    const me = (user?.id || user?.username || '').toLowerCase();
    if (!me) return;
    messageService.acceptMessage(fromId, me);
  };
  const handleDeclineMsg = (fromId: string) => {
    const me = (user?.id || user?.username || '').toLowerCase();
    if (!me) return;
    messageService.declineMessage(fromId, me);
  };

  const handleArchive = async (id: string) => {
    try {
      // TODO: Update notification status on backend
      // await fetch(`/api/notifications/${id}/archive`, { method: 'POST' });
      
      const updatedItems = items.map((n) => (n.id === id ? { ...n, read: true, archived: true } : n));
      setItems(updatedItems);
      localStorage.setItem('notifications', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // TODO: Delete notification on backend
      // await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      
      const updatedItems = items.filter((n) => n.id !== id);
      setItems(updatedItems);
      localStorage.setItem('notifications', JSON.stringify(updatedItems));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (notification: Notification) => {
    if (notification.icon) return notification.icon;
    
    switch (notification.type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-app-text-muted" />;
    }
  };

  const unreadCount = items.filter(n => !n.read).length;

  // Swipeable row component to ensure iOS-like behavior (background hidden until swipe)
  const SwipeableNotificationItem: React.FC<{
    notification: Notification;
    index: number;
    onArchive: (id: string) => void;
    onDelete: (id: string) => void;
  }> = ({ notification, index, onArchive, onDelete }) => {
    const x = useMotionValue(0);
    const leftOpacity = useTransform(x, [0, 80], [0, 1]);
    const rightOpacity = useTransform(x, [-80, 0], [1, 0]);

    return (
      <div className="relative overflow-hidden rounded-xl">
        {/* Hidden action background that fades in only while swiping */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-1/2 flex items-center pl-4">
            <motion.div style={{ opacity: leftOpacity }} className="flex items-center gap-2 text-green-400">
              <span className="text-sm font-medium">Archive</span>
            </motion.div>
          </div>
          <div className="absolute inset-y-0 right-0 w-1/2 flex items-center justify-end pr-4">
            <motion.div style={{ opacity: rightOpacity }} className="flex items-center gap-2 text-red-400">
              <span className="text-sm font-medium">Delete</span>
            </motion.div>
          </div>
        </div>

        <motion.div
          style={{ x }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -50, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0, borderWidth: 0 }}
          transition={{ delay: index * 0.03 }}
          layout
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x <= -100) {
              onDelete(notification.id);
            } else if (info.offset.x >= 100) {
              onArchive(notification.id);
            }
          }}
          className={`relative p-4 rounded-xl border cursor-pointer bg-app-card-surface ${
            notification.read || notification.archived
              ? 'border-app-borders'
              : 'border-app-primary-accent/30'
          }`}
        >
          <div className="flex items-start gap-3">
            {/* Avatar or Icon */}
            <div className="flex-shrink-0">
              {notification.avatar ? (
                <img
                  src={notification.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-app-primary-accent/10 rounded-full flex items-center justify-center">
                  {getNotificationIcon(notification)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold mb-1 ${
                notification.read || notification.archived ? 'text-app-text-muted' : 'text-app-text-primary'
              }`}>
                {notification.title}
              </h3>
              <p className="text-sm text-app-text-muted mb-2 line-clamp-2">
                {notification.message}
              </p>
              <div className="flex items-center gap-2 text-xs text-app-text-muted">
                <Clock className="w-3 h-3" />
                <span>{notification.time}</span>
                {!notification.read && !notification.archived && (
                  <span className="w-2 h-2 bg-app-primary-accent rounded-full ml-auto"></span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
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
          
          {/* Notification Panel */}
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-app-card-surface border-l border-app-borders shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-app-card-surface border-b border-app-borders p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-app-primary-accent" />
                  <h2 className="text-xl font-bold text-app-text-primary">{panel === 'notifications' ? 'Notifications' : 'Notification Settings'}</h2>
                  {unreadCount > 0 && (
                    <span className="px-2 py-1 bg-app-primary-accent text-white text-xs font-bold rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-app-background rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
              
              {/* Action Buttons */}
              {panel === 'notifications' ? (
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      try {
                        // TODO: Mark all notifications as read on backend
                        // await fetch('/api/notifications/mark-all-read', { method: 'POST' });
                        
                        const updatedItems = items.map(n => ({ ...n, read: true }));
                        setItems(updatedItems);
                        localStorage.setItem('notifications', JSON.stringify(updatedItems));
                      } catch (error) {
                        console.error('Failed to mark all as read:', error);
                      }
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 transition-colors"
                  >
                    Mark All Read
                  </button>
                  <button
                    className="flex-1 px-3 py-2 text-sm border border-app-borders text-app-text-primary rounded-lg hover:bg-app-background transition-colors"
                    onClick={() => setPanel('settings')}
                  >
                    Settings
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 text-sm border border-app-borders text-app-text-primary rounded-lg hover:bg-app-background transition-colors"
                    onClick={() => setPanel('notifications')}
                  >
                    Back to Notifications
                  </button>
                </div>
              )}
            </div>

            {panel === 'notifications' ? (
              <div className="p-4 space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-app-primary-accent"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-app-text-muted mb-4">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Requests Section */}
                    {(followReqs.length > 0 || msgReqs.length > 0) && (
                      <div className="rounded-xl border border-app-borders bg-app-background p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <UserPlus className="w-5 h-5 text-green-500" />
                          <h3 className="font-semibold text-app-text-primary">Requests</h3>
                        </div>
                        <div className="space-y-3">
                          {followReqs.map((r) => (
                            <div key={`fr-${r.followerId}`} className="flex items-center justify-between bg-app-card-surface border border-app-borders rounded-lg p-3">
                              <div className="text-sm text-app-text-primary">
                                <span className="font-medium">{r.followerId}</span> requested to follow you
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleAcceptFollow(r.followerId)} className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-500">Accept</button>
                                <button onClick={() => handleDeclineFollow(r.followerId)} className="px-3 py-1 text-xs border border-app-borders text-app-text-primary rounded-md hover:bg-app-background">Decline</button>
                              </div>
                            </div>
                          ))}
                          {msgReqs.map((r) => (
                            <div key={`mr-${r.fromId}`} className="flex items-center justify-between bg-app-card-surface border border-app-borders rounded-lg p-3">
                              <div className="text-sm text-app-text-primary">
                                <span className="font-medium">{r.fromId}</span> requested to message you
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleAcceptMsg(r.fromId)} className="px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-500">Accept</button>
                                <button onClick={() => handleDeclineMsg(r.fromId)} className="px-3 py-1 text-xs border border-app-borders text-app-text-primary rounded-md hover:bg-app-background">Decline</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {items.length === 0 ? (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-app-text-muted mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-app-text-primary mb-2">No notifications</h3>
                        <p className="text-app-text-muted">You're all caught up! New notifications will appear here.</p>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {items.map((notification, index) => (
                          <SwipeableNotificationItem
                            key={notification.id}
                            notification={notification}
                            index={index}
                            onArchive={handleArchive}
                            onDelete={handleDelete}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {/* Settings content */}
                <div className="rounded-xl border border-app-borders bg-app-background p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-app-primary-accent/10 rounded-full flex items-center justify-center">
                      <Bell className="w-5 h-5 text-app-primary-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-app-text-primary">{updateInfo.available ? `New update available (${updateInfo.version})` : 'Your app is up to date'}</h3>
                      <p className="text-sm text-app-text-muted mt-1">{updateInfo.available ? updateInfo.notes : 'You are on the latest version.'}</p>
                      <div className="flex gap-2 mt-3">
                        {updateInfo.available ? (
                          <>
                            <button
                              onClick={() => setUpdateInfo((p) => ({ ...p, available: false }))}
                              className="px-3 py-2 text-sm border border-app-borders rounded-lg text-app-text-primary hover:bg-app-background"
                            >
                              Later
                            </button>
                            <button
                              onClick={() => {
                                alert('Starting update...');
                                setUpdateInfo((p) => ({ ...p, available: false }));
                              }}
                              className="px-3 py-2 text-sm bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90"
                            >
                              Update now
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setUpdateInfo((p) => ({ ...p, available: true }))}
                            className="px-3 py-2 text-sm border border-app-borders rounded-lg text-app-text-primary hover:bg-app-background"
                          >
                            Check again
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="sticky bottom-0 bg-app-card-surface border-t border-app-borders p-4">
              <button className="w-full px-4 py-3 text-center text-app-primary-accent hover:bg-app-primary-accent/10 rounded-lg transition-colors">
                View All Notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationOverlay;
