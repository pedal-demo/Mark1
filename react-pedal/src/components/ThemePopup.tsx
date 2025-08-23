import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface ThemePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemePopup: React.FC<ThemePopupProps> = ({ isOpen, onClose }) => {
  const { isDarkMode, toggleTheme, primaryColor, setPrimaryColor } = useTheme();

  const colorOptions = [
    { name: 'Orange', value: '#f97316', class: 'bg-orange-500' },
    { name: 'Blue', value: '#3b82f6', class: 'bg-blue-500' },
    { name: 'Green', value: '#10b981', class: 'bg-emerald-500' },
    { name: 'Purple', value: '#8b5cf6', class: 'bg-violet-500' },
    { name: 'Pink', value: '#ec4899', class: 'bg-pink-500' },
    { name: 'Red', value: '#ef4444', class: 'bg-red-500' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Popup */}
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-6 w-80 z-50"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Theme Settings
              </h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Appearance
              </h4>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-between w-full p-3 rounded-lg border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isDarkMode ? (
                    <Moon className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-gray-900 dark:text-white">
                    {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  isDarkMode ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                    isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </button>
            </div>

            {/* Color Theme */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Primary Color
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPrimaryColor(color.value)}
                    className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                      primaryColor === color.value
                        ? 'border-gray-400 dark:border-gray-500'
                        : 'border-transparent'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto ${color.class}`} />
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 block">
                      {color.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThemePopup;
