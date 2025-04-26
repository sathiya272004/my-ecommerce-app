import React, { createContext, useState, useContext, useEffect } from 'react';
import { Appearance } from 'react-native';

// Create ThemeContext
const ThemeContext = createContext();

// Theme values
const lightTheme = {
  mode: 'light',
  background: '#ffffff',
  text: '#000000',
  primary: '#007bff',
};

const darkTheme = {
  mode: 'dark',
  background: '#000000',
  text: '#ffffff',
  primary: '#1e90ff',
};

// ThemeProvider component
export const ThemeProvider = ({ children }) => {
  const colorScheme = Appearance.getColorScheme();
  const [theme, setTheme] = useState(colorScheme === 'dark' ? darkTheme : lightTheme);

  // Optional: Listen to system theme changes
  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });

    return () => listener.remove();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev.mode === 'light' ? darkTheme : lightTheme));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme
export const useTheme = () => useContext(ThemeContext);
