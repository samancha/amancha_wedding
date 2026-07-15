'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image, { type StaticImageData } from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MUSIC_VOLUME } from '@/lib/audioConfig';

// Local image imports
import heroImg from '@/img/O&S-38.jpg';
import storyImg from '@/img/O&S-52.jpg';
import storyBreakImg from '@/img/O&S-74.jpg';
import break2Img from '@/img/O&S-47.jpg';
import break3Img from '@/img/O&S-42.jpg';
import break4Img from '@/img/O&S-44.jpg';
import break5Img from '@/img/O&S-53.jpg';
import break6Img from '@/img/O&S-57.jpg';
import rsvpBgImg from '@/img/O&S-51.jpg';

type PhotoBreakProps = {
  src: StaticImageData;
  loading?: 'eager' | 'lazy';
  desktopPosition: string;
  mobilePosition?: string;
  desktopHeight?: string;
  mobileHeight?: string;
};

function PhotoBreak({
  src,
  loading = 'lazy',
  desktopPosition,
  mobilePosition = desktopPosition,
  desktopHeight = 'clamp(280px, 50vw, 680px)',
  mobileHeight = desktopHeight,
}: PhotoBreakProps) {
  return (
    <div
      className="photo-break w-full relative"
      style={
        {
          '--photo-break-position': desktopPosition,
          '--photo-break-position-desktop': desktopPosition,
          '--photo-break-position-mobile': mobilePosition,
          '--photo-break-height': desktopHeight,
          '--photo-break-height-mobile': mobileHeight,
          height: 'var(--photo-break-height)',
          overflow: 'hidden',
        } as React.CSSProperties
      }
    >
      <Image
        src={src}
        alt=""
        fill
        loading={loading}
        className="photo-break-image"
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'var(--photo-break-position)' }}
      />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [headerVisible, setHeaderVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [teaserQuery, setTeaserQuery] = useState('');
  const lastScrollY = useRef(0);
  const heroImgRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rsvpSectionRef = useRef<HTMLElement>(null);
  const [muted, setMuted] = useState(false);

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

  // ── RSVP section IntersectionObserver — triggers audio ──────────────
  useEffect(() => {
    const section = rsvpSectionRef.current;
    const audio = audioRef.current;
    if (!section || !audio) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            audio.currentTime = 0;
            audio.play().catch(() => {
              // Silently swallow autoplay policy rejections
            });
          } else {
            audio.pause();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // ── Sync muted state to audio element ───────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = MUSIC_VOLUME;
      audioRef.current.muted = muted;
    }
  }, [muted]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Our Story', id: 'story' },
    { label: 'Hotel', id: 'hotel' },
    { label: 'Travel', id: 'travel' },
    { label: 'Things To Do', id: 'things' },
    { label: 'Best Day', id: 'best-day' },
    { label: 'Gifts', id: 'gifts' },
  ];

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .photo-break {
            --photo-break-position: var(--photo-break-position-mobile);
            --photo-break-height: var(--photo-break-height-mobile);
          }
        }
      `}</style>
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

              {/* Mute / unmute toggle */}
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? 'Unmute music' : 'Mute music'}
                title={muted ? 'Unmute music' : 'Mute music'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  opacity: 0.5,
                  transition: 'opacity 150ms',
                  color: 'var(--deep-brown)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
              >
                {muted ? (
                  /* Speaker muted */
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                ) : (
                  /* Speaker with waves */
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                )}
              </button>
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
              loading="eager"
              style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
              sizes="100vw"
            />
          </div>
          {/* Dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(44,26,14,0.55) 100%)',
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
              style={{
                color: 'rgba(44,26,14,0.75)',
                fontFamily: "var(--font-lora, 'Lora', serif)",
              }}
            >
              <p>
                It all started on a pedal pub. Brought together by mutual work friends celebrating a
                birthday, we found ourselves buying each other drinks somewhere between the first
                stop and the last — and by the end of the evening, we&apos;d exchanged numbers with
                every intention of staying in touch.
              </p>
              <p>
                Our first date was anything but ordinary: a stroll through Ranch Market, picking out
                groceries side by side and learning each other in the most unhurried, easy way
                possible. No pressure, no pretense — just good conversation and a full cart.
              </p>
              <p>
                Over the years we explored the Arizona landscape together, hiked trails at golden
                hour, and slowly built a life side by side. That life grew a little fuller when we
                welcomed Rolo into the family, joining our beloved Lucas — two dogs, one home, and
                more happiness than we knew what to do with.
              </p>
              <p>
                The engagement came naturally — a quiet moment that said everything the words
                didn&apos;t need to. Now we&apos;re ready to celebrate with everyone who made us who
                we are, in the place we love most, surrounded by the people we love most.
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

        {/* ─── PHOTO BREAK: STORY ──────────────────────────────────────────── */}
        <PhotoBreak src={break3Img} desktopPosition="center 50%" mobilePosition="center 24%" />

        {/* ─── BRIDAL PARTY ────────────────────────────────────────────────────── */}
        <section className="max-w-4xl mx-auto px-6 py-24">
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
          >
            Bridal Party
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
            Those Standing <span style={{ fontStyle: 'italic' }}>With Us</span>
          </h2>

          <div className="w-12 h-px mb-12" style={{ background: 'var(--gold)' }} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-16">
            {/* Bride's Side */}
            <div className="text-center">
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}
              >
                Mother of the Bride
              </p>
              <p
                className="mb-8"
                style={{
                  fontFamily: "var(--font-lora, 'Lora', serif)",
                  fontSize: '1rem',
                  color: 'var(--deep-brown)',
                }}
              >
                Pam Phelps
              </p>
              <p
                className="text-sm mb-8"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'var(--gold)',
                }}
              >
                Bride&apos;s Side
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {[
                  { title: 'Maid of Honor', name: 'Amanda Webb' },
                  { title: 'Bridesman', name: 'John Schumacher' },
                  { title: 'Bridesmaid', name: 'Kristen Campen' },
                  { title: 'Bridesmaid', name: 'Alyssa Ayala' },
                  { title: 'Bridesmaid', name: 'Kayla Ayala' },
                  { title: 'Bridesmaid', name: 'Kayla Rodriguez' },
                  { title: 'Bridesmaid', name: 'Gabriella Bello' },
                ].map((member, i) => (
                  <div key={i} style={{ width: '100%' }}>
                    {i > 0 && (
                      <div
                        style={{ width: '100%', height: 1, background: 'rgba(201,148,58,0.15)' }}
                      />
                    )}
                    <div className="py-4 text-center">
                      <p
                        className="text-xs uppercase tracking-widest mb-1"
                        style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}
                      >
                        {member.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-lora, 'Lora', serif)",
                          fontSize: '1rem',
                          color: 'var(--deep-brown)',
                        }}
                      >
                        {member.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Groom's Side */}
            <div className="text-center">
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}
              >
                Mother of the Groom
              </p>
              <p
                className="mb-8"
                style={{
                  fontFamily: "var(--font-lora, 'Lora', serif)",
                  fontSize: '1rem',
                  color: 'var(--deep-brown)',
                }}
              >
                Magdalena Amancha
              </p>
              <p
                className="text-sm mb-8"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  fontWeight: 400,
                  fontStyle: 'italic',
                  color: 'var(--gold)',
                }}
              >
                Groom&apos;s Side
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {[
                  { title: 'Best Man', name: 'Kevin Newhouse' },
                  { title: 'Groomsman', name: 'Eddie Phelps' },
                  { title: 'Groomsman', name: 'Jonathan Rodriguez' },
                  { title: 'Groomsman', name: 'Chris Anderson' },
                  { title: 'Groomsman', name: 'Tim Swing' },
                  { title: 'Groomsman', name: 'Nick Marzano' },
                  { title: 'Groomsman', name: 'Will Gautschi' },
                ].map((member, i) => (
                  <div key={i} style={{ width: '100%' }}>
                    {i > 0 && (
                      <div
                        style={{ width: '100%', height: 1, background: 'rgba(201,148,58,0.15)' }}
                      />
                    )}
                    <div className="py-4 text-center">
                      <p
                        className="text-xs uppercase tracking-widest mb-1"
                        style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}
                      >
                        {member.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-lora, 'Lora', serif)",
                          fontSize: '1rem',
                          color: 'var(--deep-brown)',
                        }}
                      >
                        {member.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Special Roles */}
          <div className="mt-14 pt-10" style={{ borderTop: '1px solid rgba(201,148,58,0.2)' }}>
            <p
              className="text-xs uppercase tracking-widest text-center mb-8"
              style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
            >
              Special Roles
            </p>
            <div className="flex flex-wrap justify-center gap-x-14 gap-y-6">
              {[
                { title: 'Ring Bearer', name: 'Andy Vasconez' },
                { title: 'Flower Girl', name: 'Caeli Rodriguez' },
                { title: 'Flower Girl', name: 'Annalise Marius' },
              ].map((member, i) => (
                <div key={i} className="text-center">
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}
                  >
                    {member.title}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-lora, 'Lora', serif)",
                      fontSize: '1rem',
                      color: 'var(--deep-brown)',
                    }}
                  >
                    {member.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        {/* ─── PHOTO BREAK 1 ───────────────────────────────────────────── */}
        <PhotoBreak
          src={break5Img}
          loading="eager"
          desktopPosition="center 40%"
          mobilePosition="center 54%"
        />

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
                GreenTree Inn &amp; Suites in Florence, AZ is a partnering hotel to our venue,
                making it the ideal place to stay for the weekend. To make your reservation, please
                call{' '}
                <a
                  href="tel:+15208689900"
                  style={{
                    color: 'var(--gold)',
                    borderBottom: '1px solid rgba(201,148,58,0.4)',
                    paddingBottom: 1,
                  }}
                >
                  (520) 868-9900
                </a>{' '}
                and reference the <em>Amancha / Phelps Wedding</em> to receive a discounted rate.
                Also check online for the best available rates.
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
              <h3
                className="text-xl mb-2"
                style={{
                  fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                  color: 'var(--deep-brown)',
                  fontWeight: 600,
                }}
              >
                East Valley
              </h3>
              <p>
                Anywhere in the East Valley — including Chandler, Gilbert, Mesa, or Tempe — is also
                a comfortable base for the weekend, roughly an hour from the venue with plenty of
                dining and accommodation options nearby.
              </p>
            </div>
            <div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Windmill+Winery+Florence+AZ"
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
        <PhotoBreak src={break2Img} desktopPosition="center 45%" mobilePosition="center 12%" />

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
                Airports
              </h3>
              <p>
                <strong style={{ color: 'var(--deep-brown)' }}>PHX Sky Harbor</strong> (~1 hr) is
                the largest option with direct flights from most major cities.{' '}
                <strong style={{ color: 'var(--deep-brown)' }}>AZA Mesa Gateway</strong> (~45 min)
                serves budget carriers including Allegiant and is a great choice from regional hubs.
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
                limited in Florence — we recommend arranging transport in advance or renting a car
                for the weekend.
              </p>
            </div>
          </div>
        </section>

        {/* ─── PHOTO BREAK 3 ───────────────────────────────────────────── */}
        <PhotoBreak
          src={break6Img}
          desktopPosition="center 18%"
          mobilePosition="center 14%"
          desktopHeight="clamp(420px, 62vw, 760px)"
          mobileHeight="clamp(340px, 82vw, 540px)"
        />

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
            Things to do
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
                name: 'Downtown Phoenix',
                desc: 'Explore the heart of Phoenix with world-class dining, rooftop bars, and vibrant nightlife.',
              },
              {
                name: 'Roosevelt Row',
                desc: "Phoenix's arts district along Roosevelt Street, lined with murals, galleries, boutiques, and some of the best food and drink in the valley.",
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

        {/* ─── PHOTO BREAK 4 ───────────────────────────────────────────── */}
        <PhotoBreak
          src={break4Img}
          desktopPosition="center 46%"
          mobilePosition="center 40%"
          desktopHeight="clamp(440px, 64vw, 760px)"
          mobileHeight="clamp(340px, 84vw, 540px)"
        />

        {/* ─── BEST DAY ─────────────────────────────────────────────────── */}
        <section
          id="best-day"
          className="w-full py-24 overflow-hidden"
          style={{ background: 'var(--deep-brown)' }}
        >
          <div className="max-w-5xl mx-auto px-6">
            {/* Header */}
            <p
              className="text-xs uppercase tracking-widest mb-4 text-center"
              style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
            >
              Best Day
            </p>
            <h2
              className="text-4xl sm:text-5xl mb-4 text-center"
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontWeight: 400,
                lineHeight: 1.15,
                color: '#fff',
              }}
            >
              The Day We&apos;ve Been <span style={{ fontStyle: 'italic' }}>Waiting For</span>
            </h2>

            {/* Leaf ornament */}
            <div className="flex justify-center my-8">
              <svg
                width="24"
                height="40"
                viewBox="0 0 24 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  d="M12 2 C12 2, 2 10, 2 20 C2 28 7 34 12 38 C17 34 22 28 22 20 C22 10 12 2 12 2Z"
                  stroke="#C9943A"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.6"
                />
                <line
                  x1="12"
                  y1="2"
                  x2="12"
                  y2="38"
                  stroke="#C9943A"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
              </svg>
            </div>

            {/* ── MOBILE TIMELINE (vertical) ── */}
            <div className="block lg:hidden relative" style={{ paddingLeft: 32 }}>
              {/* Spine */}
              <div
                style={{
                  position: 'absolute',
                  left: 7,
                  top: 8,
                  bottom: 8,
                  width: 2,
                  background:
                    'linear-gradient(to bottom, transparent, rgba(201,148,58,0.7) 8%, rgba(201,148,58,0.7) 92%, transparent)',
                }}
              />

              {[
                {
                  time: 'TBD',
                  label: 'Shuttle Departs Hotel',
                  desc: 'Complimentary shuttle from the hotel to the venue',
                },
                {
                  time: 'TBD',
                  label: 'Guests Arrive',
                  desc: 'Welcome to the celebration — find your seat and enjoy the scenery',
                },
                { time: '5:00 PM', label: 'Ceremony', desc: 'The moment we have been waiting for' },
                {
                  time: '5:30 PM',
                  label: 'Cocktail Hour',
                  desc: 'Drinks, canapés, and good company on the grounds',
                },
                {
                  time: '7:00 PM',
                  label: 'Dinner',
                  desc: 'A seated reception dinner with your chosen entrée',
                },
                {
                  time: '8:00 PM',
                  label: 'Dancing',
                  desc: 'The floor is open — come celebrate with us',
                },
                {
                  time: '9:00 PM',
                  label: 'Late Night Bites',
                  desc: 'A little something to keep the energy going',
                },
                {
                  time: '10:30 PM',
                  label: 'Grand Exit',
                  desc: 'Walk it out — send us off in style',
                },
              ].map((event, i) => (
                <div key={i} className="relative mb-8 last:mb-0" style={{ paddingLeft: 16 }}>
                  {/* Node */}
                  <div
                    style={{
                      position: 'absolute',
                      left: -29,
                      top: 4,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: 'var(--gold, #C9943A)',
                      boxShadow: '0 0 10px rgba(201,148,58,0.5)',
                      flexShrink: 0,
                    }}
                  />
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: 'var(--gold)', letterSpacing: '0.18em' }}
                  >
                    {event.time}
                  </p>
                  <p
                    className="mb-1"
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      fontSize: '1.1rem',
                      fontWeight: 400,
                      fontStyle: 'italic',
                      color: '#fff',
                    }}
                  >
                    {event.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-lora, 'Lora', serif)",
                      fontSize: '0.82rem',
                      lineHeight: 1.55,
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {event.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* ── DESKTOP TIMELINE (horizontal alternating) ── */}
            <div className="hidden lg:block relative" style={{ paddingTop: 8, paddingBottom: 8 }}>
              {/* Horizontal spine */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: '50%',
                  height: 2,
                  transform: 'translateY(-50%)',
                  background:
                    'linear-gradient(to right, transparent, rgba(201,148,58,0.7) 6%, rgba(201,148,58,0.7) 94%, transparent)',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'stretch' }}>
                {[
                  {
                    time: 'TBD',
                    label: 'Shuttle Departs',
                    desc: 'Complimentary shuttle from the hotel',
                    above: true,
                  },
                  {
                    time: 'TBD',
                    label: 'Guests Arrive',
                    desc: 'Find your seat and enjoy the scenery',
                    above: false,
                  },
                  {
                    time: '5:00 PM',
                    label: 'Ceremony',
                    desc: 'The moment we have been waiting for',
                    above: true,
                  },
                  {
                    time: '5:30 PM',
                    label: 'Cocktail Hour',
                    desc: 'Drinks and canapés on the grounds',
                    above: false,
                  },
                  {
                    time: '7:00 PM',
                    label: 'Dinner',
                    desc: 'A seated reception dinner',
                    above: true,
                  },
                  { time: '8:00 PM', label: 'Dancing', desc: 'The floor is open', above: false },
                  {
                    time: '9:00 PM',
                    label: 'Late Night Bites',
                    desc: 'Keep the energy going',
                    above: true,
                  },
                  {
                    time: '10:30 PM',
                    label: 'Grand Exit',
                    desc: 'Walk it out — send us off',
                    above: false,
                  },
                ].map((event, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      minHeight: 260,
                    }}
                  >
                    {/* Top half — card or spacer */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        paddingBottom: 14,
                        paddingLeft: 4,
                        paddingRight: 4,
                        textAlign: 'center',
                      }}
                    >
                      {event.above && (
                        <>
                          <p
                            className="text-xs uppercase tracking-widest mb-1"
                            style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}
                          >
                            {event.time}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                              fontSize: '0.95rem',
                              fontWeight: 400,
                              fontStyle: 'italic',
                              color: '#fff',
                              marginBottom: 4,
                              lineHeight: 1.3,
                            }}
                          >
                            {event.label}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-lora, 'Lora', serif)",
                              fontSize: '0.72rem',
                              lineHeight: 1.5,
                              color: 'rgba(255,255,255,0.4)',
                            }}
                          >
                            {event.desc}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Node on spine */}
                    <div
                      style={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: 'var(--gold, #C9943A)',
                        boxShadow: '0 0 12px rgba(201,148,58,0.55)',
                        flexShrink: 0,
                        zIndex: 1,
                      }}
                    />

                    {/* Bottom half — card or spacer */}
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                        paddingTop: 14,
                        paddingLeft: 4,
                        paddingRight: 4,
                        textAlign: 'center',
                      }}
                    >
                      {!event.above && (
                        <>
                          <p
                            className="text-xs uppercase tracking-widest mb-1"
                            style={{ color: 'var(--gold)', letterSpacing: '0.15em' }}
                          >
                            {event.time}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                              fontSize: '0.95rem',
                              fontWeight: 400,
                              fontStyle: 'italic',
                              color: '#fff',
                              marginBottom: 4,
                              lineHeight: 1.3,
                            }}
                          >
                            {event.label}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-lora, 'Lora', serif)",
                              fontSize: '0.72rem',
                              lineHeight: 1.5,
                              color: 'rgba(255,255,255,0.4)',
                            }}
                          >
                            {event.desc}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom leaf ornament */}
            <div className="flex justify-center mt-10">
              <svg
                width="24"
                height="40"
                viewBox="0 0 24 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{ transform: 'rotate(180deg)' }}
              >
                <path
                  d="M12 2 C12 2, 2 10, 2 20 C2 28 7 34 12 38 C17 34 22 28 22 20 C22 10 12 2 12 2Z"
                  stroke="#C9943A"
                  strokeWidth="1.2"
                  fill="none"
                  opacity="0.6"
                />
                <line
                  x1="12"
                  y1="2"
                  x2="12"
                  y2="38"
                  stroke="#C9943A"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
              </svg>
            </div>
          </div>
        </section>

        {/* ─── PHOTO BREAK 5 ───────────────────────────────────────────── */}
        <PhotoBreak src={storyBreakImg} desktopPosition="center 60%" mobilePosition="center 80%" />

        {/* ─── GIFTS ───────────────────────────────────────────────────── */}
        <section id="gifts" className="max-w-4xl mx-auto px-6 py-24">
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
          >
            Gifts
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
            Wedding Fund
          </h2>

          <div className="w-12 h-px mb-10" style={{ background: 'var(--gold)' }} />

          <div
            className="space-y-6 text-base leading-relaxed"
            style={{ color: 'rgba(44,26,14,0.75)', fontFamily: "var(--font-lora, 'Lora', serif)" }}
          >
            <p>
              Your presence at our wedding is the greatest gift of all. Following the celebration,
              we will be embarking on a honeymoon abroad — and should you wish to honour the
              occasion with a gift, a contribution toward our travels would be received with the
              warmest gratitude. Please know that no gift is expected, and your company alone is
              more than enough.
            </p>

            <div className="flex justify-center mt-6">
              <div
                style={{
                  border: '1px solid rgba(201,148,58,0.14)',
                  background: 'rgba(255,255,255,0.16)',
                  padding: '22px 24px',
                  width: '100%',
                  maxWidth: 336,
                }}
              >
                {/* Zelle */}
                <div className="mb-5">
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
                  >
                    Zelle
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-lora, 'Lora', serif)",
                      fontSize: '0.92rem',
                      color: 'rgba(44,26,14,0.64)',
                    }}
                  >
                    <strong style={{ color: 'var(--deep-brown)' }}>(630) 744-9852</strong>
                  </p>
                </div>

                <div
                  style={{
                    width: '100%',
                    height: 1,
                    background: 'rgba(201,148,58,0.12)',
                    marginBottom: 16,
                  }}
                />

                {/* Venmo */}
                <div>
                  <p
                    className="text-xs uppercase tracking-widest mb-1"
                    style={{ color: 'var(--gold)', letterSpacing: '0.2em' }}
                  >
                    Venmo
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-lora, 'Lora', serif)",
                      fontSize: '0.92rem',
                      color: 'rgba(44,26,14,0.64)',
                    }}
                  >
                    <strong style={{ color: 'var(--deep-brown)' }}>@iamsteveo</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── RSVP TEASER ─────────────────────────────────────────────── */}
        <section
          ref={rsvpSectionRef}
          id="rsvp"
          className="w-full py-32 px-6 text-center text-white"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {/* Backdrop photo */}
          <Image
            src={rsvpBgImg}
            alt=""
            fill
            loading="lazy"
            style={{ objectFit: 'cover', objectPosition: 'center 25%' }}
            sizes="100vw"
          />
          {/* Dark overlay for text legibility */}
          <div className="absolute inset-0" style={{ background: 'rgba(44,26,14,0.52)' }} />

          {/* Content */}
          <div className="relative z-10">
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
              className="text-base mb-4 opacity-70"
              style={{ fontFamily: "var(--font-lora, 'Lora', serif)" }}
            >
              Please let us know if you&apos;ll be joining us on October 17th, 2026.
            </p>
            <p
              className="text-xs uppercase tracking-widest mb-12"
              style={{
                letterSpacing: '0.2em',
                color: 'var(--gold)',
                opacity: 0.9,
              }}
            >
              RSVP Deadline: August 23rd, 2026
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
          </div>
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

        {/* Hidden audio — triggered by RSVP section observer */}
        <audio
          ref={audioRef}
          src="/mac_wedding_short.mp3"
          preload="auto"
          suppressHydrationWarning
        />
      </div>
    </>
  );
}
