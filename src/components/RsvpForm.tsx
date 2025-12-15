"use client";
import React, { useState } from 'react';

export default function RsvpForm({ compact }: { compact?: boolean }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [attending, setAttending] = useState('yes');
  const [guests, setGuests] = useState(0);
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState<'public'|'private'>('private');
  const [status, setStatus] = useState<'idle'|'sending'|'sent'|'error'>('idle');
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, attending, guests, message, visibility }),
      });
      if (res.ok) {
        const json = await res.json();
        const vis = json?.data?.visibility ? String(json.data.visibility) : visibility;
        const visLabel = vis ? `Visibility: ${String(vis).charAt(0).toUpperCase()}${String(vis).slice(1)}` : '';
        setServerMessage([json?.message ?? 'Thanks! RSVP received.', visLabel].filter(Boolean).join(' — '));
        setStatus('sent');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  }

  return (
    <form role="form" onSubmit={submit} className={`${compact ? 'space-y-3' : 'space-y-4'} p-8 glass-card rounded-2xl backdrop-blur-md bg-white/95`} aria-live="polite">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label htmlFor="rsvp-name" className="block">
          <span className="block font-serif text-lg font-medium text-emerald-800 mb-2">Name</span>
          <input id="rsvp-name" name="name" required aria-required="true" className="w-full rounded-xl border-2 border-emerald-200 px-4 py-3 text-base focus:border-emerald-700 focus:ring-emerald-500 focus:outline-none transition" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label htmlFor="rsvp-email" className="block">
          <span className="block font-serif text-lg font-medium text-emerald-800 mb-2">Email</span>
          <input id="rsvp-email" name="email" type="email" required aria-required="true" className="w-full rounded-xl border-2 border-emerald-200 px-4 py-3 text-base focus:border-emerald-700 focus:ring-emerald-500 focus:outline-none transition" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label htmlFor="rsvp-attending" className="block">
          <span className="block font-serif text-lg font-medium text-emerald-800 mb-2">Attending</span>
          <select id="rsvp-attending" name="attending" className="w-full rounded-xl border-2 border-emerald-200 px-4 py-3 text-base focus:border-emerald-700 focus:ring-emerald-500 focus:outline-none transition" value={attending} onChange={(e) => setAttending(e.target.value)}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label htmlFor="rsvp-guests" className="block">
          <span className="block font-serif text-lg font-medium text-emerald-800 mb-2">Guests</span>
          <input id="rsvp-guests" name="guests" type="number" min={0} className="w-full rounded-xl border-2 border-emerald-200 px-4 py-3 text-base focus:border-emerald-700 focus:ring-emerald-500 focus:outline-none transition" value={guests} onChange={(e) => setGuests(parseInt(e.target.value || '0'))} />
        </label>
        <label htmlFor="rsvp-visibility" className="block">
          <span className="block font-serif text-lg font-medium text-emerald-800 mb-2">Visibility</span>
          <select id="rsvp-visibility" name="visibility" className="w-full rounded-xl border-2 border-emerald-200 px-4 py-3 text-base focus:border-emerald-700 focus:ring-emerald-500 focus:outline-none transition" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
      </div>

      <label htmlFor="rsvp-message" className="block">
        <span className="block font-serif text-lg font-medium text-emerald-800 mb-2">Message</span>
        <textarea id="rsvp-message" className="w-full rounded-xl border-2 border-emerald-200 px-4 py-3 text-base focus:border-emerald-700 focus:ring-emerald-500 focus:outline-none transition" value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>

      <div className="flex items-center gap-3 pt-4">
        <button type="submit" aria-disabled={status === 'sending'} disabled={status === 'sending'} className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3 text-white font-medium hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-700 transition disabled:opacity-50">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2">
            <path d="M2 21l20-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
          </svg>
          {status === 'sending' ? 'Sending...' : 'RSVP'}
        </button>
        <div aria-live="polite" className="min-h-[1.5rem]">
          {status === 'sent' && <p className="text-green-700 font-medium" role="status">{serverMessage ?? 'Thanks! RSVP received.'}</p>}
          {status === 'error' && <p className="text-red-700 font-medium" role="alert">Error — try again.</p>}
        </div>
      </div>
    </form>
  );
}