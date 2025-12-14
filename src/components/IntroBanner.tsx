"use client";
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function IntroBanner({
  date = 'June 21, 2026',
  location = 'Sunset Meadow, Tahoe',
  dress = 'Semi-formal',
  pickup = 'Shuttle departs 5:30 PM',
}: {
  date?: string;
  location?: string;
  dress?: string;
  pickup?: string;
}) {
  const images = ['~/images/GOPRO825.JPG', '~/images/GOPRO825.JPG'];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full bg-transparent">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="relative rounded-2xl overflow-hidden shadow-md">
              <div className="aspect-[3/1] relative">
                {images.map((src, i) => (
                  <img key={src} src={src} alt={`Banner ${i + 1}`} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
                ))}
              </div>
              <div className="absolute left-4 bottom-4 flex gap-2">
                {images.map((_, i) => (
                  <button key={i} aria-label={`Show banner ${i + 1}`} className={`w-3 h-3 rounded-full ${i === idx ? 'bg-white' : 'bg-white/40'}`} onClick={() => setIdx(i)} />
                ))}
              </div>
            </div>
          </div>
          <div className="p-6 glass-card rounded-2xl">
            <h2 className="text-xl font-semibold">Event Details</h2>
            <dl className="mt-4 space-y-3 text-sm text-slate-700">
              <div>
                <dt className="font-medium">Date</dt>
                <dd>{date}</dd>
              </div>
              <div>
                <dt className="font-medium">Location</dt>
                <dd>{location}</dd>
              </div>
              <div>
                <dt className="font-medium">Dress Code</dt>
                <dd>{dress}</dd>
              </div>
              <div>
                <dt className="font-medium">Pickup Time</dt>
                <dd>{pickup}</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-3">
              <Link href="/info" className="rounded-2xl bg-[color:var(--accent)] px-4 py-2 text-white">More info</Link>
              <a href="/rsvp" className="rounded-2xl border px-4 py-2">RSVP</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
