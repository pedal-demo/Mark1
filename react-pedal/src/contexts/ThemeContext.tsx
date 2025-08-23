import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [primaryColor, setPrimaryColor] = useState<string>('#ff6b35'); // Orange theme

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const savedColor = localStorage.getItem('primaryColor');
    
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
    
    if (savedColor) {
      setPrimaryColor(savedColor);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSetPrimaryColor = (color: string) => {
    setPrimaryColor(color);
    localStorage.setItem('primaryColor', color);
    
    // Update CSS custom property
    document.documentElement.style.setProperty('--primary-orange', color);
  };

  const value: ThemeContextType = {
    isDarkMode,
    toggleTheme,
    primaryColor,
    setPrimaryColor: handleSetPrimaryColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
