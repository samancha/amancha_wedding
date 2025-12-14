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
    <form role="form" onSubmit={submit} className={`${compact ? 'space-y-3' : 'space-y-4'} p-4 glass-card`} aria-live="polite">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label htmlFor="rsvp-name" className="block">
          <span className="text-sm">Name</span>
          <input id="rsvp-name" name="name" required aria-required="true" className="mt-1 block w-full rounded-xl border px-4 py-3 text-base" value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label htmlFor="rsvp-email" className="block">
          <span className="text-sm">Email</span>
          <input id="rsvp-email" name="email" type="email" required aria-required="true" className="mt-1 block w-full rounded-xl border px-4 py-3 text-base" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label htmlFor="rsvp-attending" className="block">
          <span className="text-sm">Attending</span>
          <select id="rsvp-attending" name="attending" className="mt-1 block w-full rounded-xl border px-4 py-3 text-base" value={attending} onChange={(e) => setAttending(e.target.value)}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>
        <label htmlFor="rsvp-guests" className="block">
          <span className="text-sm">Guests</span>
          <input id="rsvp-guests" name="guests" type="number" min={0} className="mt-1 block w-full rounded-xl border px-4 py-3 text-base" value={guests} onChange={(e) => setGuests(parseInt(e.target.value || '0'))} />
        </label>
        <label htmlFor="rsvp-visibility" className="block">
          <span className="text-sm">Visibility</span>
          <select id="rsvp-visibility" name="visibility" className="mt-1 block w-full rounded-xl border px-4 py-3 text-base" value={visibility} onChange={(e) => setVisibility(e.target.value as any)}>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
      </div>

      <label htmlFor="rsvp-message" className="block">
        <span className="text-sm">Message</span>
        <textarea id="rsvp-message" className="mt-1 block w-full rounded-xl border px-4 py-3 text-base" value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>

      <div className="flex items-center gap-3">
        <button type="submit" aria-disabled={status === 'sending'} disabled={status === 'sending'} className="inline-flex items-center gap-2 rounded-2xl bg-[color:var(--accent)] px-5 py-3 text-white hover:brightness-95 focus-visible:ring-2 focus-visible:ring-offset-2 neo-accent-btn">
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2">
            <path d="M2 21l20-9L2 3v7l15 2-15 2v7z" fill="currentColor" />
          </svg>
          {status === 'sending' ? 'Sending...' : 'RSVP'}
        </button>
        <div aria-live="polite" className="min-h-[1.5rem]">
          {status === 'sent' && <p className="text-green-700" role="status">{serverMessage ?? 'Thanks! RSVP received.'}</p>}
          {status === 'error' && <p className="text-red-700" role="alert">Error — try again.</p>}
        </div>
      </div>
    </form>
  );
}