"use client";
import Image from "next/image";
import React, { useState } from 'react';
import RsvpForm from '@/components/RsvpForm';
import ThemeToggle from '@/components/ThemeToggle';
import IntroBanner from '@/components/IntroBanner';

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 font-sans">
      <IntroBanner date="June 21, 2026" location="Sunset Meadow, Tahoe" dress="Semi-formal" pickup="Shuttle departs 5:30 PM" />
      <main className="mx-auto max-w-4xl py-12 px-6">
        <div className="glass-card p-8 relative overflow-hidden neo-hero">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <h1 className="text-4xl sm:text-5xl font-semibold">Welcome — Amancha &amp; Partnership</h1>
              <p className="mt-3 text-slate-600 max-w-xl">We're excited to share our day with you. RSVP below and let us know if you can make it — quick RSVP is supported inline for mobile.</p>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button onClick={() => setOpen(!open)} aria-expanded={open} className="rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-white hover:brightness-95 focus-visible:ring-2 focus-visible:ring-offset-2">{open ? 'Close RSVP' : 'Quick RSVP'}</button>
              <a href="/rsvp" className="rounded-2xl border border-zinc-200 px-4 py-3">Full RSVP page</a>
              <a href="/info" className="rounded-2xl border border-zinc-200 px-4 py-3">Travel & Info</a>
              <a href="/neo" className="rounded-full border border-zinc-200 px-3 py-2 text-sm">Try Neo</a>
            </div>
          </div>

          {open && (
            <div className="mt-6">
              <RsvpForm compact />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
