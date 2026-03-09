'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Local image imports
import heroImg from '@/img/O&S-38.jpg';
import storyImg from '@/img/O&S-52.jpg';
import break1Img from '@/img/O&S-49.jpg';
import break2Img from '@/img/O&S-47.jpg';
import break3Img from '@/img/O&S-59.jpg';

export default function Home() {
  const router = useRouter();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teaserQuery, setTeaserQuery] = useState('');
  const lastScrollY = useRef(0);
  const heroImgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;

      // Parallax: drift image at 35% scroll speed
      if (heroImgRef.current) {
        heroImgRef.current.style.transform = `translateY(${y * 0.35}px)`;
      }

      // Nav hide / show
      if (y < lastScrollY.current || y < 80) {
        setHeaderVisible(true);
      } else if (y > 100) {
        setHeaderVisible(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Our Story', id: 'story' },
    { label: 'Hotel', id: 'hotel' },
    { label: 'Travel', id: 'travel' },
    { label: 'Things To Do', id: 'things' },
  ];

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: 'var(--sand)', color: 'var(--deep-brown)' }}
    >
      {/* ─── NAV ─────────────────────────────────────────────────────── */}
      <header
        style={{
          background: 'rgba(245,237,216,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(201,148,58,0.2)',
          transition: 'opacity 300ms ease, transform 300ms ease',
          opacity: headerVisible ? 1 : 0,
          pointerEvents: headerVisible ? 'auto' : 'none',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
        className="sticky top-0 z-50"
      >
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Wordmark */}
          <span
            className="text-xl tracking-widest uppercase"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              color: 'var(--deep-brown)',
              letterSpacing: '0.15em',
            }}
          >
            Olga &amp; Steve
          </span>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <button
                key={l.id}
                onClick={() => scrollTo(l.id)}
                className="text-sm tracking-widest uppercase transition-opacity hover:opacity-60"
                style={{ color: 'var(--deep-brown)', letterSpacing: '0.12em' }}
              >
                {l.label}
              </button>
            ))}
            <Link
              href="/rsvp"
              className="text-sm tracking-widest uppercase px-5 py-2 transition-opacity hover:opacity-80"
              style={{
                background: 'var(--gold)',
                color: '#fff',
                letterSpacing: '0.12em',
              }}
            >
              RSVP
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--deep-brown)' }}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden border-t"
            style={{
              borderColor: 'rgba(201,148,58,0.2)',
              background: 'rgba(245,237,216,0.97)',
            }}
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {navLinks.map((l) => (
                <button
                  key={l.id}
                  onClick={() => scrollTo(l.id)}
                  className="text-sm tracking-widest uppercase text-left transition-opacity hover:opacity-60"
                  style={{ color: 'var(--deep-brown)', letterSpacing: '0.12em' }}
                >
                  {l.label}
                </button>
              ))}
              <Link
                href="/rsvp"
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm tracking-widest uppercase text-center py-3 mt-1 transition-opacity hover:opacity-80"
                style={{ background: 'var(--gold)', color: '#fff' }}
              >
                RSVP
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section
        className="relative w-full"
        style={{ height: '100svh', minHeight: 600, overflow: 'hidden' }}
      >
        {/* Parallax image wrapper — oversized so the image has room to drift */}
        <div
          ref={heroImgRef}
          style={{ position: 'absolute', inset: '-20% 0', willChange: 'transform' }}
        >
          <Image
            src={heroImg}
            alt="Olga and Steve"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            sizes="100vw"
          />
        </div>
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(44,26,14,0.55) 100%)',
          }}
        />
        {/* Hero text — centered */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
          <p
            className="text-sm uppercase tracking-widest mb-4 opacity-80"
            style={{ letterSpacing: '0.25em' }}
          >
            You are invited to celebrate the wedding of
          </p>
          <h1
            className="text-5xl sm:text-7xl mb-4"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontWeight: 400,
              lineHeight: 1.1,
            }}
          >
            Olga &amp; <span style={{ fontStyle: 'italic' }}>Steve</span>
          </h1>
          <p
            className="text-base sm:text-lg uppercase tracking-widest mb-8 opacity-80"
            style={{ letterSpacing: '0.2em' }}
          >
            October 17th 2026 · Florence, Arizona
          </p>
          <Link
            href="/rsvp"
            className="text-sm uppercase tracking-widest px-8 py-3 transition-opacity hover:opacity-80"
            style={{
              background: 'var(--gold)',
              color: '#fff',
              letterSpacing: '0.2em',
            }}
          >
            RSVP
          </Link>
        </div>
      </section>

      {/* ─── OUR STORY ───────────────────────────────────────────────── */}
      <section
        id="story"
        className="max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
      >
        {/* Photo */}
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
          <Image
            src={storyImg}
            alt="Our story"
            fill
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>

        {/* Text */}
        <div>
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
          >
            Our Story
          </p>
          <h2
            className="text-4xl sm:text-5xl mb-6"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: 'var(--deep-brown)',
            }}
          >
            How We Found
            <br />
            <span style={{ fontStyle: 'italic' }}>Each Other</span>
          </h2>
          <div
            className="space-y-4 text-base leading-relaxed"
            style={{ color: 'rgba(44,26,14,0.75)', fontFamily: "var(--font-lora, 'Lora', serif)" }}
          >
            <p>
              Placeholder — we met on a beautiful desert evening, surrounded by the same warmth you
              feel in these photos. From the very first conversation, it was clear something special
              had begun.
            </p>
            <p>
              Over the years we explored the Arizona landscape together, hiked trails at golden
              hour, and slowly built a life side by side. The engagement came naturally — a quiet
              moment that said everything the words didn&apos;t need to.
            </p>
            <p>
              Now we&apos;re ready to celebrate with everyone who made us who we are, in the place
              we love most, surrounded by the people we love most.
            </p>
          </div>

          {/* Gold divider */}
          <div className="mt-10 w-16 h-px" style={{ background: 'var(--gold)' }} />
          <p
            className="mt-4 text-xs uppercase tracking-widest"
            style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
          >
            October 17th 2026
          </p>
        </div>
      </section>

      {/* ─── PHOTO BREAK 1 ───────────────────────────────────────────── */}
      <div className="w-full relative" style={{ height: '60vh', minHeight: 360 }}>
        <Image
          src={break1Img}
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 40%' }}
          sizes="100vw"
        />
      </div>

      {/* ─── ACCOMMODATIONS ──────────────────────────────────────────── */}
      <section id="hotel" className="max-w-4xl mx-auto px-6 py-24">
        <p
          className="text-xs uppercase tracking-widest mb-4"
          style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
        >
          Accommodations
        </p>
        <h2
          className="text-4xl sm:text-5xl mb-10"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontWeight: 400,
            lineHeight: 1.15,
            color: 'var(--deep-brown)',
          }}
        >
          Where to Stay
        </h2>

        {/* Divider */}
        <div className="w-12 h-px mb-10" style={{ background: 'var(--gold)' }} />

        <div
          className="space-y-6 text-base leading-relaxed"
          style={{ color: 'rgba(44,26,14,0.75)', fontFamily: "var(--font-lora, 'Lora', serif)" }}
        >
          <div>
            <h3
              className="text-xl mb-2"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: 'var(--deep-brown)',
                fontWeight: 600,
              }}
            >
              GreenTree Inn &amp; Suites
            </h3>
            <p>
              We have a room block reserved at the GreenTree Inn &amp; Suites in Florence, AZ at a
              discounted group rate. Please mention the wedding when booking to receive the rate.
            </p>
          </div>
          <div>
            <h3
              className="text-xl mb-2"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: 'var(--deep-brown)',
                fontWeight: 600,
              }}
            >
              Shuttle Service
            </h3>
            <p>
              A complimentary shuttle will run between the hotel and the venue throughout the
              evening. No need to worry about a designated driver — we&apos;ve got you covered.
            </p>
          </div>
          <div>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm uppercase tracking-widest transition-opacity hover:opacity-70 mt-2"
              style={{
                color: 'var(--gold)',
                letterSpacing: '0.15em',
                borderBottom: '1px solid var(--gold)',
                paddingBottom: 2,
              }}
            >
              Get Directions →
            </a>
          </div>
        </div>
      </section>

      {/* ─── PHOTO BREAK 2 ───────────────────────────────────────────── */}
      <div className="w-full relative" style={{ height: '60vh', minHeight: 360 }}>
        <Image
          src={break2Img}
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
          sizes="100vw"
        />
      </div>

      {/* ─── TRAVEL ──────────────────────────────────────────────────── */}
      <section id="travel" className="max-w-4xl mx-auto px-6 py-24">
        <p
          className="text-xs uppercase tracking-widest mb-4"
          style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
        >
          Getting Here
        </p>
        <h2
          className="text-4xl sm:text-5xl mb-10"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontWeight: 400,
            lineHeight: 1.15,
            color: 'var(--deep-brown)',
          }}
        >
          Travel
        </h2>

        <div className="w-12 h-px mb-10" style={{ background: 'var(--gold)' }} />

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-10 text-base leading-relaxed"
          style={{ color: 'rgba(44,26,14,0.75)', fontFamily: "var(--font-lora, 'Lora', serif)" }}
        >
          <div>
            <h3
              className="text-xl mb-2"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: 'var(--deep-brown)',
                fontWeight: 600,
              }}
            >
              PHX Sky Harbor
            </h3>
            <p>
              Phoenix Sky Harbor International Airport is approximately 1 hour from the venue.
              It&apos;s the largest and most convenient option with direct flights from most major
              cities.
            </p>
          </div>
          <div>
            <h3
              className="text-xl mb-2"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: 'var(--deep-brown)',
                fontWeight: 600,
              }}
            >
              AZA / Mesa Gateway
            </h3>
            <p>
              Mesa Gateway Airport is approximately 45 minutes away and services several
              budget-friendly carriers including Allegiant. A great option if you&apos;re flying in
              from a regional hub.
            </p>
          </div>
          <div>
            <h3
              className="text-xl mb-2"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                color: 'var(--deep-brown)',
                fontWeight: 600,
              }}
            >
              Rental Cars &amp; Rideshare
            </h3>
            <p>
              Rental cars are available at both airports. Rideshare (Uber / Lyft) availability is
              limited in Florence — we recommend arranging transport in advance or renting a car for
              the weekend.
            </p>
          </div>
        </div>
      </section>

      {/* ─── PHOTO BREAK 3 ───────────────────────────────────────────── */}
      <div className="w-full relative" style={{ height: '60vh', minHeight: 360 }}>
        <Image
          src={break3Img}
          alt=""
          fill
          style={{ objectFit: 'cover', objectPosition: 'center 50%' }}
          sizes="100vw"
        />
      </div>

      {/* ─── THINGS TO DO ────────────────────────────────────────────── */}
      <section id="things" className="max-w-4xl mx-auto px-6 py-24">
        <p
          className="text-xs uppercase tracking-widest mb-4"
          style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
        >
          Explore
        </p>
        <h2
          className="text-4xl sm:text-5xl mb-10"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontWeight: 400,
            lineHeight: 1.15,
            color: 'var(--deep-brown)',
          }}
        >
          Things To Do
        </h2>

        <div className="w-12 h-px mb-10" style={{ background: 'var(--gold)' }} />

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 text-base leading-relaxed"
          style={{ color: 'rgba(44,26,14,0.75)', fontFamily: "var(--font-lora, 'Lora', serif)" }}
        >
          {[
            {
              name: 'Windmill Winery',
              desc: 'A charming winery in Florence offering tastings and picturesque vineyard views. A perfect stop for wine lovers looking to relax before or after the festivities.',
            },
            {
              name: 'Desert Botanical Garden',
              desc: "Located in Phoenix, the Desert Botanical Garden showcases over 50,000 plants from the world's deserts. Stunning at any time of year.",
            },
            {
              name: 'Apache Trail',
              desc: 'A scenic drive through the Superstition Mountains offering dramatic desert vistas, historic sites, and access to Roosevelt Lake.',
            },
            {
              name: 'Salt River Tubing',
              desc: 'Float down the Salt River in an inner tube — a beloved Arizona tradition. A fun way to cool off and enjoy the desert landscape.',
            },
          ].map((item) => (
            <div key={item.name}>
              <h3
                className="text-xl mb-2"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: 'var(--deep-brown)',
                  fontWeight: 600,
                }}
              >
                {item.name}
              </h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── RSVP TEASER ─────────────────────────────────────────────── */}
      <section
        id="rsvp"
        className="w-full py-32 px-6 text-center text-white"
        style={{ background: 'var(--deep-brown)' }}
      >
        <p
          className="text-xs uppercase tracking-widest mb-4 opacity-60"
          style={{ letterSpacing: '0.3em' }}
        >
          We Hope to See You There
        </p>
        <h2
          className="text-4xl sm:text-5xl mb-4"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontWeight: 400,
            lineHeight: 1.15,
          }}
        >
          Olga &amp; <span style={{ fontStyle: 'italic' }}>Steve</span>
        </h2>
        <p
          className="text-base mb-12 opacity-70"
          style={{ fontFamily: "var(--font-lora, 'Lora', serif)" }}
        >
          Please let us know if you&apos;ll be joining us on October 17th, 2026.
        </p>

        {/* Last-name teaser — routes to full RSVP page */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!teaserQuery.trim()) return;
            router.push('/rsvp?q=' + encodeURIComponent(teaserQuery.trim()));
          }}
          className="mt-4 max-w-sm mx-auto flex flex-col items-center gap-4"
        >
          <input
            type="text"
            value={teaserQuery}
            onChange={(e) => setTeaserQuery(e.target.value)}
            placeholder="Enter your last name"
            style={{
              width: '100%',
              padding: '14px 20px',
              fontSize: '1rem',
              border: '1px solid rgba(201,148,58,0.4)',
              background: 'rgba(255,255,255,0.07)',
              color: 'white',
              outline: 'none',
              fontFamily: "var(--font-lora, 'Lora', serif)",
              textAlign: 'center',
              letterSpacing: '0.05em',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '13px 36px',
              background: 'var(--gold)',
              color: 'white',
              fontSize: '0.72rem',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "var(--font-lora, 'Lora', serif)",
              transition: 'opacity 150ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Find My Invitation
          </button>
        </form>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      <footer
        className="w-full py-10 text-center text-xs uppercase tracking-widest"
        style={{
          background: 'var(--deep-brown)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '0.2em',
        }}
      >
        Olga &amp; Steve · October 17th 2026
      </footer>
    </div>
  );
}
