import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Wrench, 
  ShoppingCart, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Plus,
  X,
  DollarSign,
  Clock,

  Zap
} from 'lucide-react';

interface PartItem {
  id: string;
  name: string;
  category: 'Engine' | 'Suspension' | 'Brakes' | 'Exhaust' | 'Interior' | 'Exterior';
  price: number;
  priority: 'High' | 'Medium' | 'Low';
  inStock: boolean;
  estimatedInstall: string;
}

interface MaintenanceLog {
  id: string;
  date: string;
  type: 'Service' | 'Repair' | 'Upgrade' | 'Inspection';
  description: string;
  cost: number;
  mileage: number;
  nextDue?: string;
  status: 'Completed' | 'Scheduled' | 'Overdue';
}

interface PitModeProps {
  isOpen: boolean;
  onClose: () => void;
}

const PitMode: React.FC<PitModeProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<'wishlist' | 'maintenance'>('wishlist');
  const [dragY, setDragY] = useState(0);

  // Sample data - would come from API/database
  const [wishlist, setWishlist] = useState<PartItem[]>([
    {
      id: '1',
      name: 'Garrett GT2860RS Turbocharger',
      category: 'Engine',
      price: 2499,
      priority: 'High',
      inStock: true,
      estimatedInstall: '4-6 hours'
    },
    {
      id: '2',
      name: 'BC Racing BR Series Coilovers',
      category: 'Suspension',
      price: 1299,
      priority: 'Medium',
      inStock: false,
      estimatedInstall: '3-4 hours'
    },
    {
      id: '3',
      name: 'Brembo GT Big Brake Kit',
      category: 'Brakes',
      price: 3299,
      priority: 'High',
      inStock: true,
      estimatedInstall: '2-3 hours'
    }
  ]);

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>([
    {
      id: '1',
      date: '2024-01-15',
      type: 'Service',
      description: 'Oil change and filter replacement',
      cost: 89,
      mileage: 45000,
      nextDue: '2024-04-15',
      status: 'Completed'
    },
    {
      id: '2',
      date: '2024-02-20',
      type: 'Upgrade',
      description: 'Cold air intake installation',
      cost: 450,
      mileage: 45200,
      status: 'Completed'
    },
    {
      id: '3',
      date: '2024-03-10',
      type: 'Inspection',
      description: 'Annual safety inspection',
      cost: 25,
      mileage: 45800,
      nextDue: '2025-03-10',
      status: 'Scheduled'
    }
  ]);

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setDragY(info.offset.y);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 200) {
      onClose();
    }
    setDragY(0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-400/20 border-red-400/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20 border-yellow-400/30';
      case 'Low': return 'text-green-400 bg-green-400/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'Scheduled': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'Overdue': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-gray-400 bg-gray-400/20 border-gray-400/30';
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Pit Mode Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: dragY }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-gradient-to-t from-carbon-900 via-carbon-800 to-carbon-700 rounded-t-3xl border-t-2 border-neon-orange/30 z-50 overflow-hidden"
          >
            {/* Drag Handle */}
            <div className="flex justify-center py-4">
              <div className="w-12 h-1.5 bg-neon-orange/50 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-neon-orange to-primary-600 rounded-xl flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-tech font-bold text-carbon-100">Pit Mode</h2>
                    <p className="text-sm text-carbon-300">Garage Management Center</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-neon-orange/10 rounded-xl transition-colors border border-neon-orange/20"
                >
                  <X className="w-5 h-5 text-neon-orange" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex bg-carbon-800/50 rounded-xl p-1 border border-neon-orange/20">
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all font-tech font-semibold ${
                    activeTab === 'wishlist'
                      ? 'bg-neon-orange text-black shadow-lg shadow-neon-orange/25'
                      : 'text-carbon-300 hover:text-neon-orange'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Parts Wishlist
                </button>
                <button
                  onClick={() => setActiveTab('maintenance')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all font-tech font-semibold ${
                    activeTab === 'maintenance'
                      ? 'bg-neon-orange text-black shadow-lg shadow-neon-orange/25'
                      : 'text-carbon-300 hover:text-neon-orange'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Maintenance
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {activeTab === 'wishlist' ? (
                <div className="space-y-4">
                  {/* Add New Part Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-4 border-2 border-dashed border-neon-orange/30 rounded-xl hover:border-neon-orange/50 hover:bg-neon-orange/5 transition-all flex items-center justify-center gap-2 text-neon-orange"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="font-tech font-semibold">Add New Part</span>
                  </motion.button>

                  {/* Wishlist Items */}
                  {wishlist.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-carbon-800/30 rounded-xl border border-neon-orange/20 hover:border-neon-orange/40 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-tech font-bold text-carbon-100 mb-1">{item.name}</h3>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-carbon-700 text-carbon-300 border border-carbon-600">
                              {item.category}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(item.priority)}`}>
                              {item.priority}
                            </span>
                            {item.inStock ? (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-400/20 text-green-400 border border-green-400/30">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-400/20 text-red-400 border border-red-400/30">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-neon-orange font-tech font-bold">
                            <DollarSign className="w-4 h-4" />
                            {item.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-carbon-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Install: {item.estimatedInstall}
                        </div>
                        <button className="text-neon-orange hover:text-primary-400 transition-colors">
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Maintenance Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-carbon-800/30 rounded-xl border border-green-400/20 text-center">
                      <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                      <div className="text-lg font-tech font-bold text-green-400">12</div>
                      <div className="text-xs text-carbon-300">Completed</div>
                    </div>
                    <div className="p-4 bg-carbon-800/30 rounded-xl border border-blue-400/20 text-center">
                      <Calendar className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-lg font-tech font-bold text-blue-400">3</div>
                      <div className="text-xs text-carbon-300">Scheduled</div>
                    </div>
                    <div className="p-4 bg-carbon-800/30 rounded-xl border border-red-400/20 text-center">
                      <AlertTriangle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <div className="text-lg font-tech font-bold text-red-400">1</div>
                      <div className="text-xs text-carbon-300">Overdue</div>
                    </div>
                  </div>

                  {/* Maintenance Logs */}
                  {maintenanceLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-carbon-800/30 rounded-xl border border-neon-orange/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-carbon-700 text-carbon-300 border border-carbon-600">
                              {log.type}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(log.status)}`}>
                              {log.status}
                            </span>
                          </div>
                          <h3 className="font-tech font-bold text-carbon-100 mb-1">{log.description}</h3>
                          <div className="text-sm text-carbon-300">
                            {new Date(log.date).toLocaleDateString()} • {log.mileage.toLocaleString()} miles
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-neon-orange font-tech font-bold">
                            <DollarSign className="w-4 h-4" />
                            {log.cost}
                          </div>
                        </div>
                      </div>
                      {log.nextDue && (
                        <div className="text-sm text-carbon-400 border-t border-carbon-700 pt-2">
                          Next due: {new Date(log.nextDue).toLocaleDateString()}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PitMode;
