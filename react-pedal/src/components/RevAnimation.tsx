import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEngineRevDetection } from '../hooks/useEngineRevDetection';
import { useAmbientLighting } from '../contexts/AmbientLightingContext';
import { Zap, Flame, Volume2 } from 'lucide-react';

interface RevAnimationProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const RevAnimation: React.FC<RevAnimationProps> = ({ isEnabled, onToggle }) => {
  const { revState, startListening, stopListening, triggerManualRev } = useEngineRevDetection();
  const { lighting } = useAmbientLighting();
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

  // Handle listening state
  useEffect(() => {
    if (isEnabled && !revState.isListening) {
      handleStartListening();
    } else if (!isEnabled && revState.isListening) {
      stopListening();
    }
  }, [isEnabled]);

  const handleStartListening = async () => {
    try {
      await startListening();
      setShowPermissionDialog(false);
    } catch (error) {
      setShowPermissionDialog(true);
      onToggle(false);
    }
  };

  // Generate rev particles based on intensity
  const generateRevParticles = () => {
    if (!revState.isRevving) return [];
    
    const particleCount = Math.floor(revState.revIntensity * 20) + 5;
    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 4,
      delay: Math.random() * 0.5,
      duration: 0.8 + Math.random() * 0.7
    }));
  };

  const particles = generateRevParticles();

  return (
    <>
      {/* Rev Animation Overlay */}
      <AnimatePresence>
        {revState.isRevving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-30"
          >
            {/* Screen Flash Effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, revState.revIntensity * 0.3, 0],
                scale: [1, 1.02, 1]
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute inset-0 bg-gradient-radial from-neon-orange/20 via-transparent to-transparent"
            />

            {/* Particle System */}
            {particles.map((particle) => (
              <motion.div
                key={`${revState.lastRevTime}-${particle.id}`}
                initial={{ 
                  x: `${particle.x}%`, 
                  y: `${particle.y}%`,
                  scale: 0,
                  opacity: 0
                }}
                animate={{ 
                  x: `${particle.x + (Math.random() - 0.5) * 40}%`,
                  y: `${particle.y - Math.random() * 30}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{ 
                  duration: particle.duration,
                  delay: particle.delay,
                  ease: "easeOut"
                }}
                className="absolute"
              >
                <div 
                  className="bg-neon-orange rounded-full shadow-lg shadow-neon-orange/50"
                  style={{ 
                    width: particle.size, 
                    height: particle.size,
                    boxShadow: `0 0 ${particle.size * 2}px ${lighting.accentColor}50`
                  }}
                />
              </motion.div>
            ))}

            {/* Radial Pulse Effect */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 2, 4],
                opacity: [0, revState.revIntensity * 0.6, 0]
              }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div 
                className="w-32 h-32 rounded-full border-4 border-neon-orange/30"
                style={{ 
                  boxShadow: `0 0 60px ${lighting.accentColor}40, inset 0 0 60px ${lighting.accentColor}20`
                }}
              />
            </motion.div>

            {/* Corner Lightning Effects */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, revState.revIntensity, 0],
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 0.6,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
                className={`absolute ${
                  i === 0 ? 'top-4 left-4' :
                  i === 1 ? 'top-4 right-4' :
                  i === 2 ? 'bottom-4 left-4' : 'bottom-4 right-4'
                }`}
              >
                <Zap 
                  className="w-8 h-8 text-neon-orange drop-shadow-lg"
                  style={{ 
                    filter: `drop-shadow(0 0 8px ${lighting.accentColor})`,
                    color: lighting.accentColor
                  }}
                />
              </motion.div>
            ))}

            {/* Rev Intensity Indicator */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-20 left-1/2 transform -translate-x-1/2"
            >
              <div className="bg-carbon-900/80 backdrop-blur-xl rounded-2xl px-6 py-3 border border-neon-orange/30">
                <div className="flex items-center gap-3">
                  <Flame className="w-5 h-5 text-neon-orange" />
                  <div className="flex flex-col">
                    <span className="text-xs text-carbon-300 font-tech">REV DETECTED</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-carbon-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-neon-orange to-red-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${revState.revIntensity * 100}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                      <span className="text-sm font-tech font-bold text-neon-orange">
                        {Math.round(revState.revIntensity * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rev Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-24 right-4 z-40"
      >
        <div className="bg-carbon-900/90 backdrop-blur-xl rounded-2xl p-4 border border-neon-orange/30 shadow-2xl shadow-neon-orange/10">
          <div className="flex flex-col gap-3">
            {/* Rev to React Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => onToggle(!isEnabled)}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                  isEnabled ? 'bg-neon-orange' : 'bg-carbon-700'
                }`}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-lg"
                  animate={{ x: isEnabled ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-neon-orange" />
                <span className="text-sm font-tech font-semibold text-carbon-100">
                  Rev to React
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 text-xs">
              <div className={`w-2 h-2 rounded-full ${
                revState.isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-500'
              }`} />
              <span className="text-carbon-300 font-tech">
                {revState.isListening ? 'Listening...' : 'Inactive'}
              </span>
            </div>

            {/* Rev Counter */}
            {revState.revCount > 0 && (
              <div className="text-center">
                <div className="text-lg font-tech font-bold text-neon-orange">
                  {revState.revCount}
                </div>
                <div className="text-xs text-carbon-300">Revs Detected</div>
              </div>
            )}

            {/* Manual Test Button */}
            <button
              onClick={() => triggerManualRev(0.8)}
              className="px-3 py-2 bg-carbon-800/50 hover:bg-neon-orange/10 rounded-lg border border-neon-orange/20 transition-all text-xs font-tech text-neon-orange"
            >
              Test Rev
            </button>
          </div>
        </div>
      </motion.div>

      {/* Permission Dialog */}
      <AnimatePresence>
        {showPermissionDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-carbon-900 rounded-2xl p-6 border border-neon-orange/30 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-neon-orange to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-tech font-bold text-carbon-100 mb-2">
                  Microphone Access Required
                </h3>
                <p className="text-carbon-300 mb-6">
                  Rev to React needs microphone access to detect your engine sounds and create awesome visual effects!
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPermissionDialog(false)}
                    className="flex-1 py-3 px-4 bg-carbon-800 hover:bg-carbon-700 rounded-xl transition-colors text-carbon-300 font-tech"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartListening}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-neon-orange to-red-500 hover:from-red-500 hover:to-neon-orange rounded-xl transition-all text-black font-tech font-bold"
                  >
                    Allow Access
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RevAnimation;
