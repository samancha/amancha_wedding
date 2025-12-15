"use client";
import Image from "next/image";
import React, { useState, useEffect } from 'react';
import RsvpForm from '@/components/RsvpForm';
import IntroBanner from '@/components/IntroBanner';

export default function Home() {
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY) {
        setHeaderVisible(true);
      } else if (currentScrollY > 100) {
        setHeaderVisible(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen forest-bg font-sans">
      {/* Tree silhouettes at bottom */}
      <div className="fixed bottom-0 left-0 right-0 tree-silhouettes">
        <svg viewBox="0 0 1200 150" preserveAspectRatio="none">
          {/* Left trees */}
          <polygon points="0,150 20,80 40,150" fill="rgba(0,0,0,0.3)"/>
          <polygon points="30,150 50,60 70,150" fill="rgba(0,0,0,0.25)"/>
          <polygon points="60,150 80,90 100,150" fill="rgba(0,0,0,0.2)"/>
          
          {/* Center-left trees */}
          <polygon points="150,150 170,40 190,150" fill="rgba(0,0,0,0.28)"/>
          <polygon points="180,150 210,70 240,150" fill="rgba(0,0,0,0.22)"/>
          
          {/* Center trees */}
          <polygon points="350,150 380,30 410,150" fill="rgba(0,0,0,0.3)"/>
          <polygon points="400,150 440,50 480,150" fill="rgba(0,0,0,0.24)"/>
          <polygon points="450,150 480,65 510,150" fill="rgba(0,0,0,0.2)"/>
          
          {/* Center-right trees */}
          <polygon points="650,150 680,35 710,150" fill="rgba(0,0,0,0.26)"/>
          <polygon points="700,150 730,55 760,150" fill="rgba(0,0,0,0.3)"/>
          
          {/* Right trees */}
          <polygon points="900,150 920,75 940,150" fill="rgba(0,0,0,0.22)"/>
          <polygon points="950,150 980,50 1010,150" fill="rgba(0,0,0,0.28)"/>
          <polygon points="1050,150 1080,80 1110,150" fill="rgba(0,0,0,0.25)"/>
          <polygon points="1130,150 1150,90 1170,150" fill="rgba(0,0,0,0.2)"/>
        </svg>
      </div>
      {/* Header Navigation */}
      <header className={`sticky top-0 z-50 bg-emerald-700/80 backdrop-blur-md border-b border-emerald-800 shadow-sm transition-opacity duration-300 ${headerVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <nav className="w-full px-6 py-3">
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center justify-center gap-8 text-sm h-10 text-white">
            <button
              onClick={() => scrollToSection('welcome')}
              className="font-medium text-white/90 hover:text-white transition flex items-center h-full"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('details')}
              className="font-medium text-white/90 hover:text-white transition flex items-center h-full"
            >
              Details
            </button>
            <button
              onClick={() => scrollToSection('hotel')}
              className="font-medium text-white/90 hover:text-white transition flex items-center h-full"
            >
              Hotel
            </button>
            <button
              onClick={() => scrollToSection('travel')}
              className="font-medium text-white/90 hover:text-white transition flex items-center h-full"
            >
              Travel
            </button>
            <button
              onClick={() => scrollToSection('things')}
              className="font-medium text-white/90 hover:text-white transition flex items-center h-full"
            >
              Things to Do
            </button>
            <button
              onClick={() => scrollToSection('rsvp')}
              className="font-medium text-white/90 hover:text-white transition flex items-center h-full"
            >
              RSVP
            </button>
          </div>

          {/* Mobile Hamburger Menu */}
          <div className="lg:hidden flex items-center justify-between">
            <span className="text-white font-serif text-lg">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white hover:text-white/80 transition"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-emerald-700 border-b border-emerald-800 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col px-6 py-3 space-y-3 text-white">
                <button
                  onClick={() => scrollToSection('welcome')}
                  className="text-left font-medium text-white/90 hover:text-white transition py-2"
                >
                  Home
                </button>
                <button
                  onClick={() => scrollToSection('details')}
                  className="text-left font-medium text-white/90 hover:text-white transition py-2"
                >
                  Details
                </button>
                <button
                  onClick={() => scrollToSection('hotel')}
                  className="text-left font-medium text-white/90 hover:text-white transition py-2"
                >
                  Hotel
                </button>
                <button
                  onClick={() => scrollToSection('travel')}
                  className="text-left font-medium text-white/90 hover:text-white transition py-2"
                >
                  Travel
                </button>
                <button
                  onClick={() => scrollToSection('things')}
                  className="text-left font-medium text-white/90 hover:text-white transition py-2"
                >
                  Things to Do
                </button>
                <button
                  onClick={() => scrollToSection('rsvp')}
                  className="text-left font-medium text-white/90 hover:text-white transition py-2 border-t border-emerald-600 pt-3"
                >
                  RSVP
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Banner */}
      <section id="details">
      <IntroBanner date="October 17, 2026" location="Windmill Winery, Florence, Arizona" dress="Formal" pickup="Parking should not be a concern — there is ample parking available at the venue. We recommend using the complimentary shuttle from the hotel for convenience, but your own vehicle is welcome." />
      </section>

      {/* Welcome Section */}
      <section id="welcome" className="bg-white/10 backdrop-blur-sm py-16 px-6">
        <main className="mx-auto max-w-4xl py-8 px-6 space-y-8">
          <div className="glass-card p-8 relative overflow-hidden neo-hero bg-white/95">
            <div className="relative z-10 text-center">
              <h2 className="text-3xl sm:text-5xl font-serif font-semibold text-emerald-900 mb-4">Welcome</h2>
              <p className="text-lg text-slate-600 max-w-2xl">We're excited to share our day with you. Please join us for a celebration of love and commitment.</p>
            </div>
          </div>

          {/* Hotel & Travel Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Hotel Accommodations Card */}
            <div id="hotel" className="glass-card p-8 bg-emerald-50 border border-emerald-100">
              <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-emerald-900 mb-4 text-center">Accommodations</h3>
              <p className="text-slate-600 mb-4">We recommend the <a href="https://greentreeinn.com/destinations/florence/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 underline">GreenTree Inn & Suites</a>, just minutes from the venue, where we've secured group rates. A complimentary shuttle will transport guests to and from the wedding. Airbnbs and other local rentals are also available if you prefer alternative accommodations.</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li><a href="https://greentreeinn.com/destinations/florence/" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 underline">GreenTree Inn & Suites</a> — ~5 minutes to venue, complimentary shuttle</li>
                <li>Airbnb and local vacation rentals available</li>
                <li>Contact us for group rate details</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-emerald-200">
                <a href="https://www.google.com/maps/dir/GreenTree+Inn+Suites+Florence+Arizona/Windmill+Winery+Florence+Arizona" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 003 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6.553 3.276A1 1 0 0117 20.618V9.382a1 1 0 00-1.447-.894L9 11m6-11l5.447-2.724A1 1 0 0121 3.618v10.764a1 1 0 01-1.447.894L15 13" />
                  </svg>
                  View in Google Maps
                </a>
              </div>
            </div>

            {/* Airports & Travel Card */}
            <div id="travel" className="glass-card p-8 bg-white/95">
              <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-emerald-900 mb-4 text-center">Airports & Travel</h3>
              <p className="text-slate-600 mb-4">Florence, Arizona is served by two nearby airports. Most guests fly into Phoenix Sky Harbor International Airport (PHX), about 1 hour from the hotel. Alternatively, Mesa Gateway Airport (AZA) is closer, about 45 minutes away. Note that rideshare services don't come by often at night, so we recommend arranging ground transportation in advance.</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-700">
                <li><a href="https://www.skyharbor.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 underline">Phoenix Sky Harbor International (PHX)</a> — ~1 hour to hotel</li>
                <li><a href="https://www.mesagatewayairport.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 underline">Mesa Gateway Airport (AZA)</a> — ~45 minutes to hotel</li>
                <li>Rental car services available at both airports</li>
              </ul>
            </div>
          </div>

          {/* Things to Do Card */}
          <div id="things" className="glass-card p-8 bg-white/95">
            <h3 className="text-2xl sm:text-3xl font-serif font-semibold text-emerald-900 mb-4 text-center">Things to Do</h3>
            <p className="text-slate-600 mb-4">If you're extending your trip to explore Arizona, we recommend:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li><a href="https://www.thewindmillwinery.com" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 underline">Windmill Winery</a> — our wedding venue, wonderful for post-event visits</li>
              <li>Arizona Desert Botanical Garden (Phoenix) — 45 minutes away</li>
              <li>Apache Trail Scenic Drive — historic mining route with panoramic views</li>
              <li>Salt River (Tubing) — seasonal adventure activity</li>
            </ul>
          </div>
        </main>
      </section>

      {/* RSVP Section */}
      <section id="rsvp" className="bg-white/10 backdrop-blur-sm py-16 px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-2xl sm:text-4xl font-serif font-semibold text-white mb-2 text-center">RSVP</h2>
          <p className="text-center text-white/80 mb-8">Please let us know if you can attend by submitting the form below.</p>
          <RsvpForm />
        </div>
      </section>
    </div>
  );
}
