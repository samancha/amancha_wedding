'use client';
import React, { useState } from 'react';

type RsvpStatus = {
  name: string;
  email: string;
  birthday: string;
  attending: string;
  guests: number;
  maxGuests: number;
  message: string;
  visibility: string;
  timestamp: string;
};

export default function RsvpLookup() {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'found' | 'notfound' | 'error'>(
    'idle'
  );
  const [result, setResult] = useState<RsvpStatus | null>(null);
  const [updatingGuests, setUpdatingGuests] = useState(false);
  const [guestCount, setGuestCount] = useState(0);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setStatus('searching');
    try {
      const res = await fetch('/api/rsvp/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birthday }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setResult(json.data);
        setGuestCount(json.data.guests || 0);
        setStatus('found');
      } else {
        setStatus('notfound');
        setResult(null);
      }
    } catch (err) {
      setStatus('error');
    }
  }

  async function updateGuests(e: React.FormEvent) {
    e.preventDefault();
    if (!result) return;

    setUpdatingGuests(true);
    try {
      const res = await fetch('/api/rsvp/update-guests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.name,
          birthday: result.birthday,
          guests: guestCount,
        }),
      });

      if (res.ok) {
        setResult({ ...result, guests: guestCount });
        alert('Guest count updated successfully!');
      } else {
        alert('Failed to update guest count. Please try again.');
      }
    } catch (err) {
      alert('Error updating guest count. Please try again.');
    } finally {
      setUpdatingGuests(false);
    }
  }

  return (
    <div className="p-8 glass-card rounded-2xl backdrop-blur-md bg-white/95 max-w-md">
      <h3 className="text-2xl font-serif font-semibold text-emerald-900 mb-4 text-center">
        Check Your RSVP Status
      </h3>

      <form onSubmit={search} className="space-y-4" aria-live="polite">
        <label htmlFor="lookup-name" className="block">
          <span className="block font-serif text-lg font-medium text-emerald-800 mb-2">Name</span>
          <input
            id="lookup-name"
            type="text"
            required
            className="w-full rounded-xl border-2 border-emerald-200 px-4 py-3 text-base text-emerald-900 focus:border-emerald-700 focus:ring-emerald-500 focus:outline-none transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>

        <label htmlFor="lookup-birthday" className="block">
          <span className="block font-serif text-lg font-medium text-emerald-800 mb-2">
            Birthday
          </span>
          <input
            id="lookup-birthday"
            type="date"
            required
            className="w-full rounded-xl border-2 border-emerald-200 px-4 py-3 text-base text-emerald-900 focus:border-emerald-700 focus:ring-emerald-500 focus:outline-none transition"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </label>

        <button
          type="submit"
          disabled={status === 'searching'}
          className="w-full rounded-full bg-emerald-700 px-8 py-3 text-white font-medium hover:bg-emerald-800 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-700 transition disabled:opacity-50"
        >
          {status === 'searching' ? 'Searching...' : 'Search'}
        </button>
      </form>

      {status === 'found' && result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
          <p className="text-green-900 font-medium">✓ Found your RSVP!</p>
          <dl className="space-y-2 text-sm text-green-800">
            <div className="flex justify-between">
              <dt className="font-medium">Name:</dt>
              <dd>{result.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium">Attending:</dt>
              <dd className="capitalize">
                {result.attending === 'yes'
                  ? '✓ Yes'
                  : result.attending === 'no'
                    ? '✗ No'
                    : 'Undecided'}
              </dd>
            </div>
            {result.attending === 'yes' && (
              <div className="flex justify-between">
                <dt className="font-medium">Guest Limit:</dt>
                <dd>{result.maxGuests}</dd>
              </div>
            )}
            {result.message && (
              <div>
                <dt className="font-medium mb-1">Message:</dt>
                <dd className="text-green-700">{result.message}</dd>
              </div>
            )}
          </dl>

          {result.attending === 'yes' && (
            <form onSubmit={updateGuests} className="pt-4 border-t border-green-200">
              <label htmlFor="guest-count" className="block mb-3">
                <span className="block font-serif font-medium text-green-900 mb-2">
                  Update Guest Count
                </span>
                <span className="text-sm text-green-700 mb-2 block">
                  Maximum: {result.maxGuests} guests
                </span>
                <input
                  id="guest-count"
                  type="number"
                  min="0"
                  max={result.maxGuests}
                  required
                  className="w-full rounded-lg border-2 border-green-300 px-3 py-2 text-base text-emerald-900 focus:border-green-500 focus:outline-none transition"
                  value={guestCount}
                  onChange={(e) =>
                    setGuestCount(Math.min(parseInt(e.target.value) || 0, result.maxGuests))
                  }
                />
              </label>
              <button
                type="submit"
                disabled={updatingGuests}
                className="w-full rounded-lg bg-green-700 px-4 py-2 text-white text-sm font-medium hover:bg-green-800 transition disabled:opacity-50"
              >
                {updatingGuests ? 'Updating...' : 'Update Count'}
              </button>
            </form>
          )}
        </div>
      )}

      {status === 'notfound' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-900 font-medium">No RSVP found with that name and birthday.</p>
          <p className="text-yellow-800 text-sm mt-2">
            Please check the spelling and try again, or submit your RSVP above.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-900 font-medium">Error searching RSVP. Please try again.</p>
        </div>
      )}
    </div>
  );
}
