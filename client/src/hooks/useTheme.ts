import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('sudoku-theme') as Theme;
    return stored || 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  const updateTheme = (newTheme: Theme) => {
    localStorage.setItem('sudoku-theme', newTheme);
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme: updateTheme,
  };
};