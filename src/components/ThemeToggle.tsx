"use client";
import React, { useEffect, useState } from 'react';

type Theme = 'tahoe' | 'neo' | 'future';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'tahoe';
    return (localStorage.getItem('theme') as Theme) || 'tahoe';
  });

  useEffect(() => {
    document.documentElement.classList.remove('theme-neo', 'theme-future');
    if (theme === 'neo') document.documentElement.classList.add('theme-neo');
    if (theme === 'future') document.documentElement.classList.add('theme-future');
    localStorage.setItem('theme', theme);
  }, [theme]);

  function cycle() {
    setTheme((t) => (t === 'tahoe' ? 'neo' : t === 'neo' ? 'future' : 'tahoe'));
  }

  return (
    <button
      aria-pressed={theme !== 'tahoe'}
      aria-label={`Toggle theme (${theme})`}
      className="px-3 py-2 rounded-full border bg-white/60 backdrop-blur-sm text-sm"
      onClick={cycle}
    >
      {theme === 'tahoe' ? 'Tahoe' : theme === 'neo' ? 'Neo • 2025' : 'Future • 2050'}
    </button>
  );
}
