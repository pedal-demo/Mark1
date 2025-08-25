import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ModernMap: React.FC = () => {
  const [selectedRoute, setSelectedRoute] = useState<number | null>(null);
  const [mapView, setMapView] = useState('routes');

  const routes = [
    {
      id: 1,
      name: 'Downtown Loop',
      distance: '12.5 miles',
      difficulty: 'Easy',
      elevation: '150 ft',
      color: '#ff6b35'
    },
    {
      id: 2,
      name: 'Hill Climb Challenge',
      distance: '8.2 miles',
      difficulty: 'Hard',
      elevation: '850 ft',
      color: '#e55a2b'
    },
    {
      id: 3,
      name: 'Riverside Trail',
      distance: '15.7 miles',
      difficulty: 'Moderate',
      elevation: '200 ft',
      color: '#ff8c42'
    }
  ];

  const cyclists = [
    { id: 1, name: 'Alex', location: 'Downtown', status: 'riding' },
    { id: 2, name: 'Sarah', location: 'Park Loop', status: 'resting' },
    { id: 3, name: 'Mike', location: 'Hill Climb', status: 'riding' }
  ];

  return (
    <div className="min-h-screen bg-app-background">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2 text-app-text-primary">
            Map 🗺️
          </h1>
          <p className="text-app-text-muted">
            Explore cycling routes and track other cyclists
          </p>
        </motion.div>

        {/* Map Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setMapView('routes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mapView === 'routes'
                  ? 'bg-app-primary-accent text-white shadow-lg'
                  : 'bg-app-card-surface text-app-text-primary hover:bg-app-borders border border-app-borders'
              }`}
            >
              🛣️ Routes
            </button>
            <button
              onClick={() => setMapView('cyclists')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mapView === 'cyclists'
                  ? 'bg-app-primary-accent text-white shadow-lg'
                  : 'bg-app-card-surface text-app-text-primary hover:bg-app-borders border border-app-borders'
              }`}
            >
              🚴‍♂️ Cyclists
            </button>
            <button
              onClick={() => setMapView('terrain')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                mapView === 'terrain'
                  ? 'bg-app-primary-accent text-white shadow-lg'
                  : 'bg-app-card-surface text-app-text-primary hover:bg-app-borders border border-app-borders'
              }`}
            >
              ⛰️ Terrain
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-app-card-surface border border-app-borders rounded-xl p-6 h-96 lg:h-[500px]">
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                {/* Mock Map Interface */}
                <div className="absolute inset-0 opacity-20">
                  <div className="w-full h-full bg-gradient-to-r from-green-200 via-yellow-200 to-orange-200 dark:from-green-800 dark:via-yellow-800 dark:to-orange-800"></div>
                </div>
                
                {/* Route Lines */}
                {mapView === 'routes' && routes.map((route, index) => (
                  <div
                    key={route.id}
                    className={`absolute w-1 bg-orange-500 transform rotate-45 ${
                      index === 0 ? 'top-20 left-20 h-32' :
                      index === 1 ? 'top-32 right-24 h-24' :
                      'bottom-20 left-1/2 h-28'
                    } cursor-pointer hover:bg-orange-400 transition-colors`}
                    onClick={() => setSelectedRoute(route.id)}
                    style={{ backgroundColor: route.color }}
                  />
                ))}

                {/* Cyclist Markers */}
                {mapView === 'cyclists' && cyclists.map((cyclist, index) => (
                  <div
                    key={cyclist.id}
                    className={`absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      index === 0 ? 'top-16 left-16' :
                      index === 1 ? 'top-24 right-20' :
                      'bottom-16 left-1/3'
                    } cursor-pointer hover:bg-blue-400 transition-colors`}
                  >
                    🚴‍♂️
                  </div>
                ))}

                <div className="text-center z-10">
                  <div className="text-6xl mb-4">🗺️</div>
                  <h3 className="text-xl font-bold mb-2 text-app-text-primary">
                    Interactive Map
                  </h3>
                  <p className="text-app-text-muted">
                    {mapView === 'routes' ? 'Click on route lines to view details' :
                     mapView === 'cyclists' ? 'Live cyclist locations' :
                     'Terrain and elevation data'}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Route Details */}
            {mapView === 'routes' && (
              <div className="bg-app-card-surface border border-app-borders rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 text-app-text-primary">
                  {selectedRoute ? routes.find(r => r.id === selectedRoute)?.name : 'Available Routes'}
                </h3>
                <div className="space-y-3">
                  {(selectedRoute ? [routes.find(r => r.id === selectedRoute)!] : routes).map((route) => (
                    <div key={route.id} className="p-3 bg-app-background rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-app-text-primary">
                          {route.name}
                        </h4>
                        <span className={`px-2 py-1 rounded text-xs ${
                          route.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          route.difficulty === 'Moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {route.difficulty}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-app-text-muted">
                        <span>📏 {route.distance}</span>
                        <span>⛰️ {route.elevation}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Cyclists */}
            {mapView === 'cyclists' && (
              <div className="bg-app-card-surface border border-app-borders rounded-xl p-6">
                <h3 className="text-lg font-bold mb-4 text-app-text-primary">
                  Active Cyclists
                </h3>
                <div className="space-y-3">
                  {cyclists.map((cyclist) => (
                    <div key={cyclist.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-xl">🚴‍♂️</div>
                        <div>
                          <h4 className="font-medium text-app-text-primary">
                            {cyclist.name}
                          </h4>
                          <p className="text-sm text-app-text-muted">
                            {cyclist.location}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        cyclist.status === 'riding'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                      }`}>
                        {cyclist.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Legend */}
            <div className="bg-app-card-surface border border-app-borders rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-app-text-primary">
                Legend
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-app-text-muted">
                    Easy Routes
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-app-text-muted">
                    Moderate Routes
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-app-text-muted">
                    Hard Routes
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-app-text-muted">
                    Your Location
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-app-card-surface border border-app-borders rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 text-app-text-primary">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-app-primary-accent text-white rounded-lg font-medium hover:bg-orange-600 transition-colors">
                  📍 Share Location
                </button>
                <button className="w-full px-4 py-2 border border-app-primary-accent text-app-primary-accent rounded-lg font-medium hover:bg-app-primary-accent hover:text-white transition-colors">
                  🗺️ Create Route
                </button>
                <button className="w-full px-4 py-2 border border-app-primary-accent text-app-primary-accent rounded-lg font-medium hover:bg-app-primary-accent hover:text-white transition-colors">
                  📱 Start Navigation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ModernMap;
