import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WifiOff, 
  Bluetooth, 
  Phone, 
  Map, 
  AlertTriangle, 
  Battery, 
  Signal, 
  Navigation,
  Download,
  Send,
  MapPin,
  BookOpen,
  Compass,
  Heart,
  Zap,
  Radio
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

interface BluetoothDevice {
  id: string;
  name: string;
  distance: number;
  lastSeen: string;
}

interface OfflineMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'pending';
}

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const OfflineApp: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { user } = useUser();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState<BluetoothDevice[]>([]);
  const [messages, setMessages] = useState<OfflineMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [activeTab, setActiveTab] = useState<'overview' | 'bluetooth' | 'emergency' | 'maps' | 'features'>('overview');

  // Mock data
  const mockNearbyDevices: BluetoothDevice[] = [
    { id: '1', name: 'RideKing\'s Phone', distance: 15, lastSeen: '2 min ago' },
    { id: '2', name: 'BikerBabe\'s Device', distance: 45, lastSeen: '5 min ago' },
    { id: '3', name: 'TurboMike\'s Helmet', distance: 30, lastSeen: '1 min ago' }
  ];

  const emergencyContacts: EmergencyContact[] = [
    { id: '1', name: 'Emergency Services', phone: '911', relation: 'Emergency' },
    { id: '2', name: 'John Doe', phone: '+1234567890', relation: 'Emergency Contact' },
    { id: '3', name: 'Roadside Assistance', phone: '+1800123456', relation: 'Service' }
  ];

  const offlineFeatures = [
    { icon: Map, title: 'Offline Maps', description: 'Access downloaded maps without internet', status: 'Available', color: 'text-green-500' },
    { icon: Navigation, title: 'GPS Navigation', description: 'Turn-by-turn navigation using GPS', status: 'Active', color: 'text-blue-500' },
    { icon: BookOpen, title: 'Ride Log', description: 'Record your rides offline', status: 'Ready', color: 'text-orange-500' },
    { icon: Compass, title: 'Digital Compass', description: 'Find your direction anywhere', status: 'Active', color: 'text-purple-500' },
    { icon: Heart, title: 'Health Monitor', description: 'Track vitals during rides', status: 'Available', color: 'text-red-500' },
    { icon: Radio, title: 'Mesh Network', description: 'Connect with nearby riders', status: 'Scanning', color: 'text-cyan-500' }
  ];

  useEffect(() => {
    const handleOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    if (bluetoothEnabled) {
      setNearbyDevices(mockNearbyDevices);
    }

    const batteryInterval = setInterval(() => {
      setBatteryLevel(prev => Math.max(prev - 0.1, 0));
    }, 60000);

    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      clearInterval(batteryInterval);
    };
  }, [bluetoothEnabled]);

  const enableBluetooth = async () => {
    try {
      setBluetoothEnabled(true);
      setNearbyDevices(mockNearbyDevices);
    } catch (error) {
      console.error('Bluetooth not available:', error);
    }
  };

  const sendBluetoothMessage = () => {
    if (!newMessage.trim() || !selectedDevice) return;

    const message: OfflineMessage = {
      id: Date.now().toString(),
      from: user?.username || 'You',
      to: nearbyDevices.find(d => d.id === selectedDevice)?.name || 'Unknown',
      message: newMessage,
      timestamp: new Date().toLocaleTimeString(),
      status: 'sent'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const triggerEmergency = (contact: EmergencyContact) => {
    alert(`Emergency call initiated to ${contact.name} (${contact.phone})`);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <motion.div
        className={`p-4 border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100">
            <WifiOff className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Offline Application</h1>
            <p className="text-sm text-muted-foreground">Full functionality without internet connection</p>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: WifiOff },
            { id: 'bluetooth', label: 'Bluetooth', icon: Bluetooth },
            { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
            { id: 'maps', label: 'Maps', icon: Map },
            { id: 'features', label: 'Features', icon: Zap }
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <motion.div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} whileHover={{ scale: 1.02 }}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isOnline ? 'bg-red-100' : 'bg-green-100'}`}>
                      <WifiOff className={`w-5 h-5 ${isOnline ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{isOnline ? 'Online Mode' : 'Offline Mode'}</p>
                      <p className="text-sm text-muted-foreground">{isOnline ? 'Internet Available' : 'No Internet'}</p>
                    </div>
                  </div>
                </motion.div>
                <motion.div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} whileHover={{ scale: 1.02 }}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${bluetoothEnabled ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Bluetooth className={`w-5 h-5 ${bluetoothEnabled ? 'text-blue-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{bluetoothEnabled ? 'Bluetooth On' : 'Bluetooth Off'}</p>
                      <p className="text-sm text-muted-foreground">{nearbyDevices.length} devices nearby</p>
                    </div>
                  </div>
                </motion.div>
              </div>
              <motion.div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Battery className="w-5 h-5 text-green-500" />
                    <span className="font-medium text-foreground">Battery Level</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{batteryLevel.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full transition-all ${batteryLevel > 50 ? 'bg-green-500' : batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${batteryLevel}%` }} />
                </div>
              </motion.div>
              <div className="grid grid-cols-2 gap-4">
                <motion.button onClick={() => setActiveTab('emergency')} className="p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                  <p className="font-medium text-red-700">Emergency</p>
                </motion.button>
                <motion.button onClick={() => setActiveTab('maps')} className="p-4 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Map className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium text-blue-700">Offline Maps</p>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OfflineApp;
