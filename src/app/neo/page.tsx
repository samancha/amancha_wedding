"use client";
import React, { useEffect } from 'react';
import RsvpForm from '@/components/RsvpForm';
import ThemeToggle from '@/components/ThemeToggle';

export default function NeoShowcase() {
  useEffect(() => {
    document.documentElement.classList.add('theme-neo');
    return () => { document.documentElement.classList.remove('theme-neo'); };
  }, []);

  return (
    <main className="min-h-screen p-6 bg-[color:var(--background)] text-[color:var(--foreground)]">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">NEO • 2025</h1>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="rounded-full border px-3 py-2 text-sm" onClick={() => { document.documentElement.classList.remove('theme-neo'); document.documentElement.classList.add('theme-future'); localStorage.setItem('theme','future'); }}>Try Future</button>
            <a href="/" className="text-sm opacity-80">Back</a>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-semibold">A modern, glassy celebration interface</h2>
            <p className="text-slate-300">High contrast, neon accents, and soft motion — tactile UI made for present-day mobile use and Android interaction patterns. Inline RSVP with clear touch targets.</p>
            <div className="flex gap-3">
              <button className="rounded-full px-5 py-3 neo-accent-btn">Invite friends</button>
              <button className="rounded-full px-5 py-3 border">Learn more</button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-semibold mb-3">Quick RSVP</h3>
            <RsvpForm compact />
          </div>
        </section>
      </div>
    </main>
  );
}
