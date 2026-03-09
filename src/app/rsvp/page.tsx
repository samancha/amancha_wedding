'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import RsvpForm from '@/components/RsvpForm';

export default function RSVPPage() {
  const params = useSearchParams();
  const initialLastName = params.get('q') ?? '';
  return (
    <div className="min-h-screen" style={{ background: 'var(--sand)', color: 'var(--deep-brown)' }}>
      {/* Minimal nav */}
      <header
        style={{
          background: 'rgba(245,237,216,0.95)',
          borderBottom: '1px solid rgba(201,148,58,0.2)',
        }}
        className="sticky top-0 z-50"
      >
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl tracking-widest uppercase transition-opacity hover:opacity-60"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              color: 'var(--deep-brown)',
              letterSpacing: '0.15em',
            }}
          >
            Olga &amp; Steve
          </Link>
          <Link
            href="/#story"
            className="text-sm uppercase tracking-widest transition-opacity hover:opacity-60"
            style={{ color: 'var(--deep-brown)', letterSpacing: '0.12em' }}
          >
            ← Back
          </Link>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="mb-16 text-center">
          <p
            className="text-xs uppercase tracking-widest mb-4"
            style={{ color: 'var(--gold)', letterSpacing: '0.25em' }}
          >
            We hope you can make it
          </p>
          <h1
            className="text-5xl sm:text-6xl"
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontWeight: 400,
              color: 'var(--deep-brown)',
            }}
          >
            RSVP
          </h1>
          <div className="w-12 h-px mx-auto mt-8" style={{ background: 'var(--gold)' }} />
        </div>

        <RsvpForm initialLastName={initialLastName} />
      </main>

      <footer
        className="w-full py-8 text-center text-xs uppercase tracking-widest mt-20"
        style={{
          borderTop: '1px solid rgba(201,148,58,0.15)',
          color: 'rgba(44,26,14,0.35)',
          letterSpacing: '0.2em',
        }}
      >
        Olga &amp; Steve · October 17th 2026
      </footer>
    </div>
  );
}
