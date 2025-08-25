import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 

  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  HelpCircle, 
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  Smartphone,
  Wifi,
  Database,
  Download,
  Languages,
  Volume2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';
import { userSettingsService } from '../services/userSettingsService';

// Type definitions for settings items
interface BaseSettingItem {
  label: string;
  description: string;
}

interface ToggleSettingItem extends BaseSettingItem {
  type: 'toggle';
  value: boolean;
  onChange: (value: boolean) => void;
}

interface SelectSettingItem extends BaseSettingItem {
  type: 'select';
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

interface CustomSettingItem extends BaseSettingItem {
  type: 'custom';
  render: () => React.ReactElement;
}

interface ActionSettingItem extends BaseSettingItem {
  action: () => void;
  showArrow?: boolean;
}

type SettingItem = ToggleSettingItem | SelectSettingItem | CustomSettingItem | ActionSettingItem;

interface SettingSection {
  title: string;
  icon: React.ComponentType<any>;
  items: SettingItem[];
}

const ModernSettings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useUser();
  const [notifications, setNotifications] = useState({
    pushNotifications: false,
    emailNotifications: false,
    smsNotifications: false,
    rideReminders: false,
    communityUpdates: false,
    messageNotifications: false,
    likeNotifications: false
  });
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const [privacy, setPrivacy] = useState({
    isPrivate: false,
    profileVisibility: 'public',
    locationSharing: false,
    activityTracking: false,
    dataCollection: false,
    showOnlineStatus: false,
    allowTagging: false
  });
  const [privacyLoading, setPrivacyLoading] = useState(true);

  // Load all settings from backend
  React.useEffect(() => {
    const loadSettings = async () => {
      const uid = user?.id || user?.username || '';
      if (!uid) return;
      
      try {
        // Load notification settings
        setNotificationsLoading(true);
        // TODO: Replace with actual API call
        // const notificationSettings = await fetch('/api/user/notification-settings').then(r => r.json());
        const savedNotifications = JSON.parse(localStorage.getItem('notificationSettings') || '{}');
        setNotifications(prev => ({ ...prev, ...savedNotifications }));
        setNotificationsLoading(false);
        
        // Load privacy settings
        setPrivacyLoading(true);
        // TODO: Replace with actual API call
        // const privacySettings = await fetch('/api/user/privacy-settings').then(r => r.json());
        const savedPrivacy = JSON.parse(localStorage.getItem('privacySettings') || '{}');
        setPrivacy(prev => ({ ...prev, isPrivate: userSettingsService.isPrivate(uid), ...savedPrivacy }));
        setPrivacyLoading(false);
        
        // Load preferences
        setPreferencesLoading(true);
        // TODO: Replace with actual API call
        // const userPreferences = await fetch('/api/user/preferences').then(r => r.json());
        const savedPreferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        setPreferences(prev => ({ ...prev, ...savedPreferences }));
        setPreferencesLoading(false);
        
        // Check for updates
        setUpdateLoading(true);
        // TODO: Replace with actual API call
        // const updateCheck = await fetch('/api/app/version-check').then(r => r.json());
        // setUpdateInfo(updateCheck);
        setUpdateLoading(false);
        
      } catch (error) {
        console.error('Failed to load settings:', error);
        setNotificationsLoading(false);
        setPrivacyLoading(false);
        setPreferencesLoading(false);
        setUpdateLoading(false);
      }
    };
    
    loadSettings();
    
    // Listen for real-time settings updates
    const uid = user?.id || user?.username || '';
    const onSettings = (e: any) => {
      const detail = e?.detail || {};
      if (detail?.userId === uid) {
        setPrivacy(prev => ({ ...prev, isPrivate: !!detail.settings?.isPrivate }));
      }
    };
    window.addEventListener('realtime:user_settings', onSettings as EventListener);
    return () => window.removeEventListener('realtime:user_settings', onSettings as EventListener);
  }, [user]);

  const [preferences, setPreferences] = useState({
    language: 'English',
    autoDownloadMaps: false,
    dataUsage: 'wifi-only',
    soundEffects: false,
    hapticFeedback: false
  });
  const [preferencesLoading, setPreferencesLoading] = useState(true);

  // Update banner state
  const [updateInfo, setUpdateInfo] = useState({
    available: false,
    version: '',
    notes: ''
  });
  const [updateLoading, setUpdateLoading] = useState(true);

  const handleNotificationChange = async (key: string, value: boolean) => {
    const updatedNotifications = { ...notifications, [key]: value };
    setNotifications(updatedNotifications);
    
    try {
      // TODO: Save to backend
      // await fetch('/api/user/notification-settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedNotifications)
      // });
      
      // Save to localStorage for now
      localStorage.setItem('notificationSettings', JSON.stringify(updatedNotifications));
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      // Revert on error
      setNotifications(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handlePrivacyChange = async (key: string, value: any) => {
    const updatedPrivacy = { ...privacy, [key]: value };
    setPrivacy(updatedPrivacy);
    
    try {
      // TODO: Save to backend
      // await fetch('/api/user/privacy-settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedPrivacy)
      // });
      
      // Save to localStorage for now
      localStorage.setItem('privacySettings', JSON.stringify(updatedPrivacy));
    } catch (error) {
      console.error('Failed to save privacy settings:', error);
      // Revert on error
      setPrivacy(prev => ({ ...prev, [key]: key === 'isPrivate' ? !value : (typeof value === 'boolean' ? !value : (prev as any)[key]) }));
    }
  };

  const handlePreferenceChange = async (key: string, value: any) => {
    const updatedPreferences = { ...preferences, [key]: value };
    setPreferences(updatedPreferences);
    
    try {
      // TODO: Save to backend
      // await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedPreferences)
      // });
      
      // Save to localStorage for now
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    } catch (error) {
      console.error('Failed to save preferences:', error);
      // Revert on error
      setPreferences(prev => ({ ...prev, [key]: typeof value === 'boolean' ? !value : (prev as any)[key] }));
    }
  };

  const renderToggle = (value: boolean, onChange: (value: boolean) => void) => (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors relative ${
        value ? 'bg-app-primary-accent' : 'bg-app-borders'
      }`}
    >
      <div
        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
          value ? 'translate-x-6' : 'translate-x-0.5'
        }`}
      />
    </button>
  );

  const renderSelect = (value: string, options: { value: string; label: string }[], onChange: (value: string) => void) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 bg-app-background border border-app-borders rounded-lg text-app-text-primary focus:outline-none focus:border-app-primary-accent transition-colors"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );

  const settingsSections = [
    {
      title: 'Updates',
      icon: Download,
      items: [
        {
          label: updateInfo.available ? `New update available (${updateInfo.version})` : 'Your app is up to date',
          description: updateInfo.available ? updateInfo.notes : 'You are on the latest version.',
          action: () => {
            // Placeholder for update flow
            alert('Starting update...');
            setUpdateInfo((prev) => ({ ...prev, available: false }));
          },
          showArrow: true
        }
      ]
    },
    {
      title: 'Account',
      icon: User,
      items: [
        { 
          label: 'Edit Profile', 
          description: 'Update your personal information',
          action: () => console.log('Edit Profile'),
          showArrow: true
        },
        { 
          label: 'Change Password', 
          description: 'Update your account security',
          action: () => console.log('Change Password'),
          showArrow: true
        },
        { 
          label: 'Account Verification', 
          description: 'Verify your identity',
          action: () => console.log('Verification'),
          showArrow: true
        },
        { 
          label: 'Connected Accounts', 
          description: 'Manage linked social accounts',
          action: () => console.log('Connected Accounts'),
          showArrow: true
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Push Notifications',
          description: 'Receive notifications on your device',
          type: 'toggle',
          value: notifications.pushNotifications,
          onChange: (value: boolean) => handleNotificationChange('pushNotifications', value)
        },
        {
          label: 'Message Notifications',
          description: 'Get notified of new messages',
          type: 'toggle',
          value: notifications.messageNotifications,
          onChange: (value: boolean) => handleNotificationChange('messageNotifications', value)
        },
        {
          label: 'Like Notifications',
          description: 'Get notified when someone likes your posts',
          type: 'toggle',
          value: notifications.likeNotifications,
          onChange: (value: boolean) => handleNotificationChange('likeNotifications', value)
        },
        {
          label: 'Ride Reminders',
          description: 'Reminders for upcoming rides',
          type: 'toggle',
          value: notifications.rideReminders,
          onChange: (value: boolean) => handleNotificationChange('rideReminders', value)
        },
        {
          label: 'Community Updates',
          description: 'Updates from groups and events',
          type: 'toggle',
          value: notifications.communityUpdates,
          onChange: (value: boolean) => handleNotificationChange('communityUpdates', value)
        }
      ]
    },
    {
      title: 'Privacy & Security',
      icon: Shield,
      items: [
        {
          label: 'Private Account',
          description: 'Only approved followers can see your posts',
          type: 'toggle',
          value: privacy.isPrivate,
          onChange: (value: boolean) => {
            const uid = user?.id || user?.username || '';
            if (!uid) return;
            userSettingsService.set(uid, { isPrivate: value });
            setPrivacy(prev => ({ ...prev, isPrivate: value }));
          }
        },
        {
          label: 'Profile Visibility',
          description: 'Who can see your profile',
          type: 'select',
          value: privacy.profileVisibility,
          options: [
            { value: 'public', label: 'Public' },
            { value: 'friends', label: 'Friends Only' },
            { value: 'private', label: 'Private' }
          ],
          onChange: (value: string) => handlePrivacyChange('profileVisibility', value)
        },
        {
          label: 'Location Sharing',
          description: 'Share your location with others',
          type: 'toggle',
          value: privacy.locationSharing,
          onChange: (value: boolean) => handlePrivacyChange('locationSharing', value)
        },
        {
          label: 'Show Online Status',
          description: 'Let others see when you\'re online',
          type: 'toggle',
          value: privacy.showOnlineStatus,
          onChange: (value: boolean) => handlePrivacyChange('showOnlineStatus', value)
        },
        {
          label: 'Allow Tagging',
          description: 'Let others tag you in posts',
          type: 'toggle',
          value: privacy.allowTagging,
          onChange: (value: boolean) => handlePrivacyChange('allowTagging', value)
        },
        {
          label: 'Data Collection',
          description: 'Allow analytics and usage data',
          type: 'toggle',
          value: privacy.dataCollection,
          onChange: (value: boolean) => handlePrivacyChange('dataCollection', value)
        }
      ]
    },
    {
      title: 'Appearance',
      icon: Palette,
      items: [
        {
          label: 'Theme',
          description: isDarkMode ? 'Dark mode is enabled' : 'Light mode is enabled',
          type: 'custom',
          render: () => (
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2 bg-app-background border border-app-borders rounded-lg hover:border-app-primary-accent transition-colors"
            >
              {isDarkMode ? (
                <>
                  <Sun className="w-4 h-4 text-app-text-muted" />
                  <span className="text-sm text-app-text-primary">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-app-text-muted" />
                  <span className="text-sm text-app-text-primary">Dark</span>
                </>
              )}
            </button>
          )
        },
        {
          label: 'Language',
          description: 'App language and region',
          type: 'select',
          value: preferences.language,
          options: [
            { value: 'English', label: 'English' },
            { value: 'Hindi', label: 'हिंदी' },
            { value: 'Spanish', label: 'Español' },
            { value: 'French', label: 'Français' }
          ],
          onChange: (value: string) => handlePreferenceChange('language', value)
        },
        {
          label: 'Sound Effects',
          description: 'Play sounds for interactions',
          type: 'toggle',
          value: preferences.soundEffects,
          onChange: (value: boolean) => handlePreferenceChange('soundEffects', value)
        },
        {
          label: 'Haptic Feedback',
          description: 'Vibration for touch interactions',
          type: 'toggle',
          value: preferences.hapticFeedback,
          onChange: (value: boolean) => handlePreferenceChange('hapticFeedback', value)
        }
      ]
    },
    {
      title: 'Data & Storage',
      icon: Database,
      items: [
        {
          label: 'Data Usage',
          description: 'Control when to use mobile data',
          type: 'select',
          value: preferences.dataUsage,
          options: [
            { value: 'always', label: 'Always' },
            { value: 'wifi-only', label: 'Wi-Fi Only' },
            { value: 'never', label: 'Never' }
          ],
          onChange: (value: string) => handlePreferenceChange('dataUsage', value)
        },
        {
          label: 'Auto-Download Maps',
          description: 'Automatically download maps for offline use',
          type: 'toggle',
          value: preferences.autoDownloadMaps,
          onChange: (value: boolean) => handlePreferenceChange('autoDownloadMaps', value)
        },
        { 
          label: 'Clear Cache', 
          description: 'Free up storage space',
          action: () => console.log('Clear Cache'),
          showArrow: true
        },
        { 
          label: 'Manage Downloads', 
          description: 'View and manage offline content',
          action: () => console.log('Manage Downloads'),
          showArrow: true
        }
      ]
    },
    {
      title: 'Support & About',
      icon: HelpCircle,
      items: [
        { 
          label: 'Help Center', 
          description: 'Get help and support',
          action: () => console.log('Help'),
          showArrow: true
        },
        { 
          label: 'Contact Support', 
          description: 'Reach out to our team',
          action: () => console.log('Contact'),
          showArrow: true
        },
        { 
          label: 'Report a Problem', 
          description: 'Report bugs or issues',
          action: () => console.log('Report'),
          showArrow: true
        },
        { 
          label: 'Rate the App', 
          description: 'Leave a review on the app store',
          action: () => console.log('Rate'),
          showArrow: true
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-app-background pb-24">
      {/* Header */}
      <div className="bg-app-card-surface border-b border-app-borders p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-app-primary-accent to-primary-600 rounded-xl flex items-center justify-center">
            
          </div>
          <div>
            <h1 className="text-2xl font-bold text-app-text-primary">Settings</h1>
            <p className="text-app-text-muted">Manage your account and preferences</p>
          </div>
        </div>
      </div>

      {/* Update Banner */}
      {updateInfo.available && (
        <div className="p-4">
          <div className="bg-gradient-to-r from-orange-500/20 to-orange-500/10 border border-orange-500/40 rounded-xl p-4 flex items-start gap-3">
            <div className="mt-0.5">
              <Download className="w-5 h-5 text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-app-text-primary font-semibold">New update available {updateInfo.version}</h3>
              <p className="text-app-text-muted text-sm">{updateInfo.notes}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setUpdateInfo((prev) => ({ ...prev, available: false }))}
                className="px-3 py-2 text-sm border border-app-borders rounded-lg text-app-text-primary hover:bg-app-background"
              >
                Later
              </button>
              <button
                onClick={() => {
                  alert('Starting update...');
                  setUpdateInfo((prev) => ({ ...prev, available: false }));
                }}
                className="px-3 py-2 text-sm bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90"
              >
                Update now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Sections */}
      <div className="p-4 space-y-4">
        {settingsSections.map((section, sectionIndex) => {
          const Icon = section.icon;
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
              className="bg-app-card-surface rounded-xl border border-app-borders overflow-hidden"
            >
              <div className="p-4 border-b border-app-borders">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-app-primary-accent" />
                  <h2 className="text-lg font-semibold text-app-text-primary">
                    {section.title}
                  </h2>
                </div>
              </div>
              <div className="divide-y divide-app-borders">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-app-text-primary mb-1">
                          {item.label}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-app-text-muted">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {item.type === 'toggle' && (
                          renderToggle((item as ToggleSettingItem).value, (item as ToggleSettingItem).onChange)
                        )}
                        {item.type === 'select' && (
                          renderSelect((item as SelectSettingItem).value, (item as SelectSettingItem).options, (item as SelectSettingItem).onChange)
                        )}
                        {item.type === 'custom' && (
                          (item as CustomSettingItem).render()
                        )}
                        {!('type' in item) && 'action' in item && (
                          <button
                            onClick={(item as ActionSettingItem).action}
                            className="flex items-center gap-2 text-app-text-muted hover:text-app-primary-accent transition-colors"
                          >
                            {(item as ActionSettingItem).showArrow && <ChevronRight className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ModernSettings;
