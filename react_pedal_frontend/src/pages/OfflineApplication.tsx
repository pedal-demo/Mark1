import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  WifiOff, 
  Bluetooth, 
  Phone, 
  MapPin, 
  Users, 
  Zap, 
  Share2, 
  AlertTriangle,
  Download,
  Signal,
  Battery,
  Smartphone,
  MessageSquare,
  Navigation,
  Clock,
  CheckCircle,
  XCircle,
  Radio,
  Wifi,
  Send,
  Shield,
  Truck,
  Hospital,
  Flame
} from 'lucide-react';

interface BluetoothDevice {
  id: string;
  name: string;
  distance: number;
  lastSeen: string;
  isConnected: boolean;
}

interface OfflineMap {
  id: string;
  name: string;
  size: string;
  downloadDate: string;
  coverage: string;
}

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  relation: string;
}

interface Message {
  id: string;
  from: string;
  to: string;
  content: string;
  timestamp: string;
  type: 'bluetooth' | 'wifi';
  status: 'sending' | 'sent' | 'delivered' | 'failed';
}

interface EmergencyService {
  id: string;
  name: string;
  type: 'police' | 'fire' | 'hospital' | 'ambulance';
  number: string;
  distance: number;
  responseTime: string;
}

const OfflineApplication: React.FC = () => {
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isWifiEnabled, setIsWifiEnabled] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState<BluetoothDevice[]>([]);
  const [offlineMaps, setOfflineMaps] = useState<OfflineMap[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [emergencyServices, setEmergencyServices] = useState<EmergencyService[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [batteryLevel, setBatteryLevel] = useState(78);
  const [signalStrength, setSignalStrength] = useState(0);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const [messageText, setMessageText] = useState('');
  const [showMessaging, setShowMessaging] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  const [showRideLogging, setShowRideLogging] = useState(false);
  const [showPeerTracking, setShowPeerTracking] = useState(false);
  const [showFileSharing, setShowFileSharing] = useState(false);
  const [showWifiMessaging, setShowWifiMessaging] = useState(false);
  const [showWifiCalling, setShowWifiCalling] = useState(false);

  useEffect(() => {
    // Load offline maps from localStorage (from Maps page)
    const savedMaps = JSON.parse(localStorage.getItem('downloadedMaps') || '[]');
    if (savedMaps.length > 0) {
      setOfflineMaps(savedMaps);
    } else {
      // No offline maps available
      setOfflineMaps([]);
    }

    // Load emergency contacts from user settings
    const savedContacts = JSON.parse(localStorage.getItem('emergencyContacts') || '[]');
    setEmergencyContacts(savedContacts);
    
    // Load emergency services from location-based API
    loadEmergencyServices();

    // Scan for real Bluetooth devices
    if (isBluetoothEnabled) {
      scanForBluetoothDevices();
    }
  }, [isBluetoothEnabled]);

  const loadEmergencyServices = async () => {
    try {
      // TODO: Replace with actual API call to get nearby emergency services
      // const response = await fetch('/api/emergency-services?lat=${lat}&lng=${lng}');
      // const services = await response.json();
      setEmergencyServices([]);
    } catch (error) {
      console.error('Failed to load emergency services:', error);
      setEmergencyServices([]);
    }
  };

  const scanForBluetoothDevices = async () => {
    try {
      // TODO: Implement actual Bluetooth scanning using Web Bluetooth API
      // if ('bluetooth' in navigator) {
      //   const devices = await navigator.bluetooth.getDevices();
      //   setNearbyDevices(devices.map(device => ({
      //     id: device.id,
      //     name: device.name || 'Unknown Device',
      //     distance: Math.floor(Math.random() * 100),
      //     lastSeen: 'Just now',
      //     isConnected: device.gatt?.connected || false
      //   })));
      // }
      setNearbyDevices([]);
    } catch (error) {
      console.error('Failed to scan for Bluetooth devices:', error);
      setNearbyDevices([]);
    }
  };

  const handleBluetoothToggle = () => {
    setIsBluetoothEnabled(!isBluetoothEnabled);
    if (!isBluetoothEnabled) {
      setActiveFeature('bluetooth-scanning');
      setTimeout(() => setActiveFeature(null), 3000);
    }
  };

  const handleEmergencyCall = () => {
    setActiveFeature('emergency-calling');
    
    // Simulate sending SOS to all emergency services
    const sosMessage = {
      location: 'Current GPS coordinates: 19.0760° N, 72.8777° E',
      timestamp: new Date().toISOString(),
      userInfo: 'Emergency SOS from PEDAL app user',
      severity: 'HIGH PRIORITY'
    };
    
    // Simulate emergency call process
    setTimeout(() => {
      setActiveFeature('emergency-sent');
      
      // Create emergency notifications
      emergencyServices.forEach(service => {
        console.log(`SOS sent to ${service.name} (${service.number})`);
        console.log('Emergency details:', sosMessage);
      });
      
      setTimeout(() => setActiveFeature(null), 5000);
    }, 2000);
  };
  
  const sendMessage = (deviceId: string, message: string, type: 'bluetooth' | 'wifi') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      from: 'You',
      to: deviceId,
      content: message,
      timestamp: new Date().toISOString(),
      type,
      status: 'sending'
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Simulate message delivery
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === newMessage.id ? { ...msg, status: 'delivered' } : msg
      ));
    }, 1500);
    
    setMessageText('');
  };
  
  const handleFeatureClick = (featureId: string) => {
    setActiveFeature(featureId);
    
    switch (featureId) {
      case 'bluetooth-messaging':
        setShowMessaging(true);
        break;
      case 'emergency-support':
        setShowSOS(true);
        break;
      case 'offline-maps':
        alert('Opening offline maps...');
        break;
      case 'peer-tracking':
        setShowPeerTracking(true);
        break;
      case 'offline-logging':
        setShowRideLogging(true);
        break;
      case 'file-sharing':
        setShowFileSharing(true);
        break;
    }
  };

  const features = [
    {
      id: 'offline-maps',
      title: 'Offline Maps',
      description: 'Access downloaded maps without internet',
      icon: MapPin,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      status: `${offlineMaps.length} maps available`
    },
    {
      id: 'bluetooth-messaging',
      title: 'Bluetooth Messaging',
      description: 'Send messages to nearby riders (50m range)',
      icon: Bluetooth,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10',
      status: isBluetoothEnabled ? `${nearbyDevices.length} devices nearby` : 'Disabled'
    },
    {
      id: 'emergency-support',
      title: 'Emergency SOS',
      description: 'Call for help even without signal',
      icon: Phone,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      status: 'Always available'
    },
    {
      id: 'peer-tracking',
      title: 'Peer Tracking',
      description: 'Track group rides via device-to-device',
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10',
      status: 'Group mode ready'
    },
    {
      id: 'offline-logging',
      title: 'Ride Logging',
      description: 'Record rides without internet',
      icon: Zap,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      status: 'Auto-sync when online'
    },
    {
      id: 'file-sharing',
      title: 'File Sharing',
      description: 'Share photos/routes via Bluetooth',
      icon: Share2,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      status: 'P2P ready'
    }
  ];

  return (
    <div className="min-h-screen bg-app-background p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
            <WifiOff className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-app-text-primary">Offline Mode</h1>
            <p className="text-app-text-muted">Work without internet connection</p>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-app-card-surface rounded-xl p-4 border border-app-borders">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Signal className={`w-4 h-4 ${signalStrength > 0 ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-sm font-medium text-app-text-primary">
                  {signalStrength === 0 ? 'No Signal' : `${signalStrength} bars`}
                </span>
              </div>
              <p className="text-xs text-app-text-muted">Network</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Battery className={`w-4 h-4 ${batteryLevel > 20 ? 'text-green-400' : 'text-red-400'}`} />
                <span className="text-sm font-medium text-app-text-primary">{batteryLevel}%</span>
              </div>
              <p className="text-xs text-app-text-muted">Battery</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Bluetooth className={`w-4 h-4 ${isBluetoothEnabled ? 'text-blue-400' : 'text-app-text-muted'}`} />
                <span className="text-sm font-medium text-app-text-primary">
                  {isBluetoothEnabled ? 'On' : 'Off'}
                </span>
              </div>
              <p className="text-xs text-app-text-muted">Bluetooth</p>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Section */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-app-text-primary mb-3">Emergency Support</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="font-semibold text-red-400">SOS Emergency</h3>
              <p className="text-sm text-app-text-muted">Works even without cellular signal</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleEmergencyCall}
            disabled={activeFeature === 'emergency-calling'}
            className="w-full py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {activeFeature === 'emergency-calling' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending SOS...
              </>
            ) : activeFeature === 'emergency-sent' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                SOS Sent Successfully
              </>
            ) : (
              <>
                <Phone className="w-4 h-4" />
                Send Emergency SOS
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Bluetooth Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-app-text-primary">Bluetooth Messaging</h2>
          <button
            onClick={handleBluetoothToggle}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isBluetoothEnabled 
                ? 'bg-blue-500 text-white' 
                : 'bg-app-borders text-app-text-muted hover:bg-app-primary-accent hover:text-white'
            }`}
          >
            {isBluetoothEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
        
        <div className="bg-app-card-surface rounded-xl border border-app-borders overflow-hidden">
          {isBluetoothEnabled ? (
            <>
              {activeFeature === 'bluetooth-scanning' && (
                <div className="p-4 bg-blue-500/10 border-b border-app-borders">
                  <div className="flex items-center gap-2 text-blue-400">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Scanning for nearby devices...</span>
                  </div>
                </div>
              )}
              
              {nearbyDevices.length > 0 ? (
                <div className="divide-y divide-app-borders">
                  {nearbyDevices.map((device) => (
                    <div key={device.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          device.isConnected ? 'bg-green-400/20' : 'bg-blue-400/20'
                        }`}>
                          <Smartphone className={`w-5 h-5 ${
                            device.isConnected ? 'text-green-400' : 'text-blue-400'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-semibold text-app-text-primary">{device.name}</h4>
                          <p className="text-sm text-app-text-muted">
                            {device.distance}m away • {device.lastSeen}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {device.isConnected && (
                          <button 
                            onClick={() => {
                              setSelectedDevice(device);
                              setShowMessaging(true);
                            }}
                            className="p-2 bg-green-400/20 text-green-400 rounded-lg hover:bg-green-400/30 transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        <div className={`w-2 h-2 rounded-full ${
                          device.isConnected ? 'bg-green-400' : 'bg-blue-400'
                        }`} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Radio className="w-12 h-12 text-app-text-muted mx-auto mb-3" />
                  <p className="text-app-text-muted">No devices found nearby</p>
                  <p className="text-sm text-app-text-muted mt-1">Make sure other riders have Bluetooth enabled</p>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <Bluetooth className="w-12 h-12 text-app-text-muted mx-auto mb-3" />
              <p className="text-app-text-muted">Bluetooth is disabled</p>
              <p className="text-sm text-app-text-muted mt-1">Enable to connect with nearby riders</p>
            </div>
          )}
        </div>
      </div>

      {/* Offline Features Grid */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-app-text-primary mb-3">Offline Features</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleFeatureClick(feature.id)}
                className="bg-app-card-surface rounded-xl p-4 border border-app-borders hover:border-app-primary-accent/30 transition-colors cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${feature.bgColor}`}>
                  <Icon className={`w-5 h-5 ${feature.color}`} />
                </div>
                <h3 className="font-semibold text-app-text-primary text-sm mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-app-text-muted mb-2">
                  {feature.description}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-xs text-green-400">{feature.status}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Offline Maps */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-app-text-primary mb-3">Downloaded Maps</h2>
        <div className="space-y-3">
          {offlineMaps.map((map) => (
            <div key={map.id} className="bg-app-card-surface rounded-xl p-4 border border-app-borders">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-app-text-primary">{map.name}</h3>
                <span className="text-sm text-app-text-muted">{map.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-app-text-muted">
                <span>Coverage: {map.coverage}</span>
                <span>Downloaded: {map.downloadDate}</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 py-2 bg-app-primary-accent text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                  Open Map
                </button>
                <button className="px-4 py-2 bg-app-background text-app-text-muted rounded-lg text-sm hover:bg-app-borders transition-colors">
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messaging Modal */}
      {showMessaging && selectedDevice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-app-background rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-app-borders">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-400/20 rounded-full flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-app-text-primary">{selectedDevice.name}</h3>
                    <p className="text-sm text-app-text-muted">Bluetooth • {selectedDevice.distance}m away</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowMessaging(false);
                    setSelectedDevice(null);
                  }}
                  className="p-2 hover:bg-app-card-surface rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
            </div>
            
            <div className="p-4 h-64 overflow-y-auto">
              {messages.filter(msg => msg.to === selectedDevice.id || msg.from === selectedDevice.id).length === 0 ? (
                <div className="text-center text-app-text-muted py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No messages yet</p>
                  <p className="text-sm mt-1">Start a conversation with {selectedDevice.name}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages
                    .filter(msg => msg.to === selectedDevice.id || msg.from === selectedDevice.id)
                    .map(msg => (
                      <div key={msg.id} className={`flex ${msg.from === 'You' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-lg ${
                          msg.from === 'You' 
                            ? 'bg-app-primary-accent text-white' 
                            : 'bg-app-card-surface text-app-text-primary'
                        }`}>
                          <p className="text-sm">{msg.content}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs opacity-70">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                            {msg.from === 'You' && (
                              <div className={`w-1 h-1 rounded-full ${
                                msg.status === 'delivered' ? 'bg-green-300' : 'bg-yellow-300'
                              }`} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-app-borders">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-app-card-surface border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && messageText.trim()) {
                      sendMessage(selectedDevice.id, messageText, 'bluetooth');
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (messageText.trim()) {
                      sendMessage(selectedDevice.id, messageText, 'bluetooth');
                    }
                  }}
                  disabled={!messageText.trim()}
                  className="px-4 py-2 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* SOS Modal */}
      {showSOS && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-app-background rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-red-400">Emergency SOS</h2>
                <button
                  onClick={() => setShowSOS(false)}
                  className="p-2 hover:bg-app-card-surface rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-app-text-muted mb-4">
                  This will send an emergency alert to all nearby emergency services:
                </p>
                
                <div className="space-y-3">
                  {emergencyServices.map(service => {
                    const getIcon = () => {
                      switch (service.type) {
                        case 'police': return <Shield className="w-5 h-5 text-blue-400" />;
                        case 'fire': return <Flame className="w-5 h-5 text-red-400" />;
                        case 'hospital': return <Hospital className="w-5 h-5 text-green-400" />;
                        case 'ambulance': return <Truck className="w-5 h-5 text-orange-400" />;
                        default: return <Phone className="w-5 h-5 text-app-text-muted" />;
                      }
                    };
                    
                    return (
                      <div key={service.id} className="flex items-center justify-between p-3 bg-app-card-surface rounded-lg">
                        <div className="flex items-center gap-3">
                          {getIcon()}
                          <div>
                            <h4 className="font-medium text-app-text-primary">{service.name}</h4>
                            <p className="text-sm text-app-text-muted">{service.distance}km • ETA: {service.responseTime}</p>
                          </div>
                        </div>
                        <span className="text-sm text-app-text-muted">{service.number}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSOS(false)}
                  className="flex-1 px-4 py-3 bg-app-card-surface text-app-text-primary rounded-lg hover:bg-app-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleEmergencyCall();
                    setShowSOS(false);
                  }}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Send SOS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* WiFi Direct Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-app-text-primary">WiFi Direct</h2>
          <button
            onClick={() => setIsWifiEnabled(!isWifiEnabled)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isWifiEnabled 
                ? 'bg-cyan-500 text-white' 
                : 'bg-app-borders text-app-text-muted hover:bg-app-primary-accent hover:text-white'
            }`}
          >
            {isWifiEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
        
        <div className="bg-app-card-surface rounded-xl border border-app-borders p-4">
          {isWifiEnabled ? (
            <div className="text-center">
              <Wifi className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
              <h3 className="font-semibold text-app-text-primary mb-2">WiFi Direct Active</h3>
              <p className="text-sm text-app-text-muted mb-4">
                Broadcasting for nearby devices (200m range)
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setShowWifiCalling(true)}
                  className="py-2 px-3 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                >
                  Voice Call
                </button>
                <button 
                  onClick={() => setShowWifiMessaging(true)}
                  className="py-2 px-3 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                >
                  Text Chat
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Wifi className="w-12 h-12 text-app-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-app-text-muted">WiFi Direct is disabled</p>
              <p className="text-sm text-app-text-muted mt-1">Enable for longer range communication</p>
            </div>
          )}
        </div>
      </div>

      {/* WiFi Calling Modal */}
      {showWifiCalling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-app-background rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-cyan-400">WiFi Voice Call</h2>
                <button
                  onClick={() => setShowWifiCalling(false)}
                  className="p-2 hover:bg-app-card-surface rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-10 h-10 text-cyan-400" />
                </div>
                <h3 className="font-semibold text-app-text-primary mb-2">Ready to Call</h3>
                <p className="text-sm text-app-text-muted mb-4">
                  WiFi Direct calling (200m range)
                </p>
                
                <div className="space-y-3">
                  <div className="bg-app-card-surface rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-app-text-primary">Group Call</h4>
                        <p className="text-xs text-app-text-muted">Call multiple riders</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-app-card-surface rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                        <Phone className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <h4 className="font-medium text-app-text-primary">Direct Call</h4>
                        <p className="text-xs text-app-text-muted">Call specific rider</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWifiCalling(false)}
                  className="flex-1 px-4 py-3 bg-app-card-surface text-app-text-primary rounded-lg hover:bg-app-background transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Starting WiFi voice call...');
                    setShowWifiCalling(false);
                  }}
                  className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold"
                >
                  Start Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* WiFi Messaging Modal */}
      {showWifiMessaging && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-app-background rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-app-borders">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center">
                    <Wifi className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-app-text-primary">WiFi Direct Chat</h3>
                    <p className="text-sm text-app-text-muted">200m range • Group messaging</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowWifiMessaging(false)}
                  className="p-2 hover:bg-app-card-surface rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
            </div>
            
            <div className="p-4 h-64 overflow-y-auto">
              <div className="text-center text-app-text-muted py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>WiFi Direct Group Chat</p>
                <p className="text-sm mt-1">Send messages to nearby riders (200m range)</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-app-borders">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message to group..."
                  className="flex-1 px-3 py-2 bg-app-card-surface border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                />
                <button className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Ride Logging Modal */}
      {showRideLogging && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-app-background rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-yellow-400">Ride Logging</h2>
                <button
                  onClick={() => setShowRideLogging(false)}
                  className="p-2 hover:bg-app-card-surface rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-app-card-surface rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-6 h-6 text-yellow-400" />
                    <h3 className="font-semibold text-app-text-primary">Current Ride</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-app-text-muted">Distance</p>
                      <p className="font-semibold text-app-text-primary">12.5 km</p>
                    </div>
                    <div>
                      <p className="text-app-text-muted">Duration</p>
                      <p className="font-semibold text-app-text-primary">45 min</p>
                    </div>
                    <div>
                      <p className="text-app-text-muted">Avg Speed</p>
                      <p className="font-semibold text-app-text-primary">16.7 km/h</p>
                    </div>
                    <div>
                      <p className="text-app-text-muted">Elevation</p>
                      <p className="font-semibold text-app-text-primary">+234 m</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-app-card-surface rounded-lg p-4">
                  <h4 className="font-medium text-app-text-primary mb-2">Offline Features</h4>
                  <div className="space-y-2 text-sm text-app-text-muted">
                    <p>• GPS tracking without internet</p>
                    <p>• Auto-sync when back online</p>
                    <p>• Route recording and analysis</p>
                    <p>• Performance metrics logging</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowRideLogging(false)}
                  className="flex-1 px-4 py-3 bg-app-card-surface text-app-text-primary rounded-lg hover:bg-app-background transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Starting ride logging...');
                    setShowRideLogging(false);
                  }}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
                >
                  Start Logging
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Peer Tracking Modal */}
      {showPeerTracking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-app-background rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-green-400">Peer Tracking</h2>
                <button
                  onClick={() => setShowPeerTracking(false)}
                  className="p-2 hover:bg-app-card-surface rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-app-card-surface rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-green-400" />
                    <h3 className="font-semibold text-app-text-primary">Group Ride</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-400/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-green-400">AR</span>
                        </div>
                        <div>
                          <p className="font-medium text-app-text-primary">Alex Rodriguez</p>
                          <p className="text-xs text-app-text-muted">25m ahead</p>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-400/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-400">SC</span>
                        </div>
                        <div>
                          <p className="font-medium text-app-text-primary">Sarah Chen</p>
                          <p className="text-xs text-app-text-muted">15m behind</p>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-app-card-surface rounded-lg p-4">
                  <h4 className="font-medium text-app-text-primary mb-2">Tracking Features</h4>
                  <div className="space-y-2 text-sm text-app-text-muted">
                    <p>• Real-time location sharing</p>
                    <p>• Device-to-device communication</p>
                    <p>• No internet required</p>
                    <p>• Safety alerts and notifications</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPeerTracking(false)}
                  className="flex-1 px-4 py-3 bg-app-card-surface text-app-text-primary rounded-lg hover:bg-app-background transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Starting peer tracking...');
                    setShowPeerTracking(false);
                  }}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                >
                  Start Tracking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* File Sharing Modal */}
      {showFileSharing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-app-background rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-purple-400">File Sharing</h2>
                <button
                  onClick={() => setShowFileSharing(false)}
                  className="p-2 hover:bg-app-card-surface rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-app-card-surface rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Share2 className="w-6 h-6 text-purple-400" />
                    <h3 className="font-semibold text-app-text-primary">P2P File Transfer</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <button className="w-full p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-left hover:bg-purple-500/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center">
                          <Download className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-app-text-primary">Share Photos</p>
                          <p className="text-xs text-app-text-muted">Send ride photos to group</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-left hover:bg-purple-500/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-app-text-primary">Share Routes</p>
                          <p className="text-xs text-app-text-muted">Send GPX files to riders</p>
                        </div>
                      </div>
                    </button>
                    
                    <button className="w-full p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-left hover:bg-purple-500/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-app-text-primary">Share Logs</p>
                          <p className="text-xs text-app-text-muted">Send ride data to group</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                
                <div className="bg-app-card-surface rounded-lg p-4">
                  <h4 className="font-medium text-app-text-primary mb-2">Transfer Info</h4>
                  <div className="space-y-2 text-sm text-app-text-muted">
                    <p>• Bluetooth/WiFi Direct transfer</p>
                    <p>• No internet required</p>
                    <p>• Encrypted file transfer</p>
                    <p>• Multiple file format support</p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowFileSharing(false)}
                  className="flex-1 px-4 py-3 bg-app-card-surface text-app-text-primary rounded-lg hover:bg-app-background transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    alert('Opening file browser...');
                    setShowFileSharing(false);
                  }}
                  className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                >
                  Browse Files
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-app-card-surface rounded-xl p-4 border border-app-borders">
        <h3 className="font-semibold text-app-text-primary mb-3">Offline Mode Tips</h3>
        <div className="space-y-2 text-sm text-app-text-muted">
          <p>• Keep Bluetooth enabled for peer-to-peer features (50m range)</p>
          <p>• Enable WiFi Direct for longer range communication (200m)</p>
          <p>• Download maps before heading to remote areas</p>
          <p>• Emergency SOS works via satellite when available</p>
          <p>• Data syncs automatically when you're back online</p>
          <p>• Share your location with group members for safety</p>
        </div>
      </div>
    </div>
  );
};

export default OfflineApplication;
