'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import IntroBanner from '@/components/IntroBanner';
import RsvpForm from '@/components/RsvpForm';
import ThemeToggle from '@/components/ThemeToggle';

export default function NeoShowcase() {
  useEffect(() => {
    document.documentElement.classList.add('theme-neo');
    return () => {
      document.documentElement.classList.remove('theme-neo');
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-[color:var(--background)]/80 backdrop-blur-md border-b border-white/10 shadow-sm">
        <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">NEO • 2025</h1>
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollToSection('welcome')}
              className="text-sm font-medium hover:text-white/80 transition"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('rsvp')}
              className="text-sm font-medium hover:text-white/80 transition"
            >
              RSVP
            </button>
            <a href="/info" className="text-sm font-medium hover:text-white/80 transition">
              Travel & Info
            </a>
            <ThemeToggle />
            <Link href="/" className="text-sm font-medium hover:text-white/80 transition">
              Back
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Banner */}
      <IntroBanner
        date="June 21, 2026"
        location="Sunset Meadow, Tahoe"
        dress="Semi-formal"
        pickup="Shuttle departs 5:30 PM"
      />

      {/* Welcome Section */}
      <section id="welcome" className="bg-[color:var(--background)]">
        <div className="mx-auto max-w-4xl py-16 px-6">
          <div className="glass-card p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
                A Modern Celebration
              </h2>
              <p className="text-lg text-white/80 max-w-2xl">
                NEO • 2025 is a modern, glassy celebration interface with high contrast, neon
                accents, and soft motion — designed for present-day mobile interaction. Experience
                the future of wedding celebrations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="bg-[color:var(--background)]/50 py-16 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-center">
            RSVP
          </h2>
          <p className="text-center text-white/70 mb-8">
            Please let us know if you can attend this modern celebration.
          </p>
          <RsvpForm />
        </div>
      </section>
    </div>
  );
}
