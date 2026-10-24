import React, { createContext, useContext, useState, useEffect } from 'react';
import { THEMES } from '../constants/themes';

const ThemeContext = createContext({
  theme: THEMES.lavender,
  setThemeId: () => {}
});

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('gigora_theme') || 'lavender';
  });

  const currentTheme = THEMES[themeId] || THEMES.lavender;

  useEffect(() => {
    localStorage.setItem('gigora_theme', themeId);
    document.body.style.backgroundColor = currentTheme.bodyBg;
  }, [themeId, currentTheme]);

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeId, setThemeId }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
