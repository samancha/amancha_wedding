'use client';
import React, { useEffect, useState } from 'react';

type Theme = 'tahoe' | 'neo' | 'future';

export default function ThemeToggle() {
  // Lazy initializer reads localStorage once on mount — safe in 'use client' components.
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'tahoe';
    try {
      const saved = localStorage.getItem('theme') as Theme;
      if (saved && ['tahoe', 'neo', 'future'].includes(saved)) return saved;
    } catch {
      // localStorage unavailable (private browsing, strict policies)
    }
    return 'tahoe';
  });

  useEffect(() => {
    try {
      document.documentElement.classList.remove('theme-neo', 'theme-future');
      if (theme === 'neo') document.documentElement.classList.add('theme-neo');
      if (theme === 'future') document.documentElement.classList.add('theme-future');
    } catch (e) {
      // Defensive: DOM operations should not crash the app in unusual environments.
      console.error('ThemeToggle: failed to update document classes', e);
    }

    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // localStorage.setItem can throw under some policies; log and continue.
      console.error('ThemeToggle: failed to save theme to localStorage', e);
    }
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
