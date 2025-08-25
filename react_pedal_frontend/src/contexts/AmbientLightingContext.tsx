import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LightingState {
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  ambientColor: string;
  accentColor: string;
  shadowIntensity: number;
  glowIntensity: number;
}

interface AmbientLightingContextType {
  lighting: LightingState;
  isAutoMode: boolean;
  setAutoMode: (auto: boolean) => void;
  setManualLighting: (lighting: Partial<LightingState>) => void;
}

const AmbientLightingContext = createContext<AmbientLightingContextType | undefined>(undefined);

export const useAmbientLighting = () => {
  const context = useContext(AmbientLightingContext);
  if (!context) {
    throw new Error('useAmbientLighting must be used within an AmbientLightingProvider');
  }
  return context;
};

interface AmbientLightingProviderProps {
  children: ReactNode;
}

export const AmbientLightingProvider: React.FC<AmbientLightingProviderProps> = ({ children }) => {
  const [isAutoMode, setIsAutoMode] = useState(true);
  const [manualLighting, setManualLighting] = useState<Partial<LightingState>>({});

  // Calculate lighting based on current time
  const calculateTimeBasedLighting = (): LightingState => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const timeDecimal = hour + minute / 60;

    // Dawn: 5:00 - 7:00
    if (timeDecimal >= 5 && timeDecimal < 7) {
      const progress = (timeDecimal - 5) / 2;
      return {
        timeOfDay: 'dawn',
        ambientColor: `hsl(${15 + progress * 10}, 60%, ${20 + progress * 15}%)`, // Orange to yellow dawn
        accentColor: '#ff8c42', // Warm orange
        shadowIntensity: 0.3 + progress * 0.2,
        glowIntensity: 0.6 + progress * 0.3
      };
    }
    
    // Day: 7:00 - 17:00
    else if (timeDecimal >= 7 && timeDecimal < 17) {
      return {
        timeOfDay: 'day',
        ambientColor: 'hsl(200, 20%, 40%)', // Cool daylight
        accentColor: '#ff6b1a', // Standard neon orange
        shadowIntensity: 0.6,
        glowIntensity: 0.8
      };
    }
    
    // Dusk: 17:00 - 19:00
    else if (timeDecimal >= 17 && timeDecimal < 19) {
      const progress = (timeDecimal - 17) / 2;
      return {
        timeOfDay: 'dusk',
        ambientColor: `hsl(${280 - progress * 20}, 40%, ${25 - progress * 5}%)`, // Purple to deep blue
        accentColor: '#ff4757', // Reddish orange
        shadowIntensity: 0.5 - progress * 0.2,
        glowIntensity: 0.9 + progress * 0.3
      };
    }
    
    // Night: 19:00 - 5:00
    else {
      return {
        timeOfDay: 'night',
        ambientColor: 'hsl(240, 30%, 8%)', // Deep blue-black
        accentColor: '#00d4ff', // Electric blue accent for night
        shadowIntensity: 0.2,
        glowIntensity: 1.2
      };
    }
  };

  const [lighting, setLighting] = useState<LightingState>(calculateTimeBasedLighting());

  // Update lighting every minute when in auto mode
  useEffect(() => {
    if (!isAutoMode) return;

    const updateLighting = () => {
      const newLighting = calculateTimeBasedLighting();
      setLighting(newLighting);
    };

    // Update immediately
    updateLighting();

    // Set up interval to update every minute
    const interval = setInterval(updateLighting, 60000);

    return () => clearInterval(interval);
  }, [isAutoMode]);

  // Apply manual lighting overrides
  useEffect(() => {
    if (!isAutoMode && Object.keys(manualLighting).length > 0) {
      setLighting(prev => ({ ...prev, ...manualLighting }));
    }
  }, [isAutoMode, manualLighting]);

  const setAutoMode = (auto: boolean) => {
    setIsAutoMode(auto);
    if (auto) {
      setLighting(calculateTimeBasedLighting());
    }
  };

  const setManualLightingHandler = (lighting: Partial<LightingState>) => {
    setManualLighting(lighting);
    setIsAutoMode(false);
  };

  return (
    <AmbientLightingContext.Provider 
      value={{ 
        lighting, 
        isAutoMode, 
        setAutoMode, 
        setManualLighting: setManualLightingHandler 
      }}
    >
      {children}
    </AmbientLightingContext.Provider>
  );
};
