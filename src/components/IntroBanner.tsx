'use client';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

export default function IntroBanner({
  date = 'October 17, 2026',
  location = 'Windmill Winery, Florence, Arizona',
  dress = 'Formal',
  pickup = 'Parking should not be a concern — there is ample parking available at the venue. We recommend using the complimentary shuttle from the hotel for convenience, but your own vehicle is welcome.',
}: {
  date?: string;
  location?: string;
  dress?: string;
  pickup?: string;
}) {
  const images = ['/images/GOPR0938.JPG', '/images/GOPR0825.JPG'];
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative w-full bg-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Image Carousel */}
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <div className="aspect-[3/2] relative">
              {images.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={`Banner ${i + 1}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                />
              ))}
            </div>
            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Show banner ${i + 1}`}
                  className={`w-3 h-3 rounded-full transition ${
                    i === idx ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                  }`}
                  onClick={() => setIdx(i)}
                />
              ))}
            </div>
          </div>

          {/* Event Details Card */}
          <div className="p-8 bg-white border border-emerald-100 rounded-2xl h-fit">
            <h2 className="text-3xl font-serif text-emerald-900 mb-6">Event Details</h2>
            <dl className="space-y-4 text-sm text-slate-700">
              <div>
                <dt className="font-serif text-lg text-emerald-800 mb-1">Date</dt>
                <dd className="text-base text-slate-600">{date}</dd>
              </div>
              <div>
                <dt className="font-serif text-lg text-emerald-800 mb-1">Location</dt>
                <dd className="text-base text-slate-600">{location}</dd>
              </div>
              <div>
                <dt className="font-serif text-lg text-emerald-800 mb-1">Dress Code</dt>
                <dd className="text-base text-slate-600">{dress}</dd>
              </div>
              <div>
                <dt className="font-serif text-lg text-emerald-800 mb-1">Parking and Logistics</dt>
                <dd className="text-base text-slate-600">{pickup}</dd>
              </div>
            </dl>
            <div className="mt-8 pt-6 border-t border-emerald-100">
              <p className="text-sm text-slate-600">
                <span className="block text-emerald-700 font-medium mb-2">Ready to RSVP?</span>
                Click the <span className="font-semibold text-emerald-800">RSVP</span> button in the
                header above to confirm your attendance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
