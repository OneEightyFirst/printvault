import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Theme Toggle Switch
 * Switches between light and dark mode with icon indicators
 */
export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label="Toggle theme"
    >
      {/* Sun icon (Light mode) */}
      <svg 
        className={`w-4 h-4 transition-colors ${!isDark ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-600'}`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
          clipRule="evenodd"
        />
      </svg>

      {/* Toggle switch */}
      <div className={`relative w-10 h-5 rounded-full transition-colors ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <div
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-transform ${
            isDark ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>

      {/* Moon icon (Dark mode) */}
      <svg 
        className={`w-4 h-4 transition-colors ${isDark ? 'text-blue-400' : 'text-gray-400'}`}
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
      </svg>
    </button>
  );
};

