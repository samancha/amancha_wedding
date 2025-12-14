export const metadata = {
  title: 'Info — Travel & Housing',
};

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-2xl font-semibold">Event Info</h1>

        <section className="glass-card p-6">
          <h2 className="text-lg font-semibold">Event Essentials</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li><strong>Date:</strong> June 21, 2026</li>
            <li><strong>Location:</strong> Sunset Meadow, Tahoe (address & directions on map)</li>
            <li><strong>Dress code:</strong> Semi-formal</li>
            <li><strong>Pickup time:</strong> Shuttle departs 5:30 PM from The Lakeside Hotel</li>
          </ul>
        </section>

        <section id="housing" className="glass-card p-6">
          <h2 className="text-lg font-semibold">Housing</h2>
          <p className="mt-2 text-sm text-slate-700">We've reserved a small block of rooms at several nearby hotels. If you need help finding nearby lodging, check the recommended hotels list and contact us for group rates.</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
            <li>The Lakeside Hotel — 0.6 miles from venue</li>
            <li>Mountain Inn — 1.2 miles from venue</li>
            <li>Cabin Stays — several cabins available for groups</li>
          </ul>
        </section>

        <section id="travel" className="glass-card p-6">
          <h2 className="text-lg font-semibold">Airports & Travel</h2>
          <p className="mt-2 text-sm text-slate-700">The nearest major airport is Reno-Tahoe International (RNO). From there it's a 1.5–2 hour drive. Shuttle and rideshare services operate regularly.</p>
        </section>

        <section id="places" className="glass-card p-6">
          <h2 className="text-lg font-semibold">Places to Visit</h2>
          <p className="mt-2 text-sm text-slate-700">If you're extending your trip, we recommend:</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
            <li>Emerald Lake — scenic hikes and picnic spots</li>
            <li>Historic Downtown Tahoe — shops and local dining</li>
            <li>Sunrise Vista Point — short drive with panoramic views</li>
          </ul>
        </section>

        <section id="faq" className="glass-card p-6">
          <h2 className="text-lg font-semibold">FAQ</h2>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            <div>
              <strong>Can I bring a plus-one?</strong>
              <p>Yes — include their name when you RSVP if they will be attending with you.</p>
            </div>
            <div>
              <strong>Is parking available?</strong>
              <p>Yes — limited parking at the venue; shuttle is recommended for the main guest arrival window.</p>
            </div>
            <div>
              <strong>Is the venue accessible?</strong>
              <p>Yes — the venue has ground-level access and accessible restrooms. Contact us for any specific accommodations.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
import React from 'react';

export default function InfoPage() {
  return (
    <main className="min-h-screen bg-white py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Travel & Visitor Info</h1>

        <nav className="mb-6 flex gap-3 text-sm">
          <a href="#housing" className="text-[color:var(--accent)]">Housing</a>
          <a href="#airports" className="text-[color:var(--accent)]">Airports</a>
          <a href="#visit" className="text-[color:var(--accent)]">Places To Visit</a>
          <a href="#faq" className="text-[color:var(--accent)]">FAQs</a>
        </nav>

        <section id="housing" className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Housing</h2>
          <p className="text-slate-700">We've reserved a small block of rooms at nearby hotels. For group rates, mention "Amancha Wedding" when booking. Recommended options: Hotel Cove (10min), Harbor Inn (15min), and The Orchard (20min).</p>
        </section>

        <section id="airports" className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Airports & Travel</h2>
          <p className="text-slate-700">Closest major airport: Sample International (SMI) — about 35 minutes by car. Alternative: Regional Field (RFD) — smaller with limited flights. We recommend booking car rentals in advance; rideshare is available but sometimes limited on weekends.</p>
        </section>

        <section id="visit" className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">Places To Visit</h2>
          <ul className="list-disc list-inside text-slate-700">
            <li>Old Town — cafes, artisan shops, and a waterfront promenade.</li>
            <li>Sunset Ridge — short hike with panoramic views.</li>
            <li>Market District — open Sat mornings, great for local crafts and food.</li>
          </ul>
        </section>

        <section id="faq" className="mb-8">
          <h2 className="text-2xl font-semibold mb-2">FAQs</h2>
          <dl className="text-slate-700">
            <dt className="font-medium">Is there parking?</dt>
            <dd className="mb-3">Yes — the venue has limited on-site parking and several public lots nearby. We encourage carpooling where possible.</dd>
            <dt className="font-medium">Can I bring a plus one?</dt>
            <dd className="mb-3">Please RSVP with your guest details; if you need to add additional guests, contact us directly and we'll do our best to accommodate.</dd>
            <dt className="font-medium">Are children welcome?</dt>
            <dd className="mb-3">Children are welcome; details about a family-friendly area at the venue will be added soon.</dd>
          </dl>
        </section>

      </div>
    </main>
  );
}
