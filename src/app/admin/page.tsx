"use client";
import React, { useEffect, useState } from 'react';

function AdminApp() {
  const [token, setToken] = useState<string>(() => typeof window !== 'undefined' ? localStorage.getItem('admin_token') ?? '' : '');
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/rsvps', { headers: { 'x-admin-token': token } });
      if (!res.ok) {
        const json = await res.json();
        setError(json?.error || 'Unauthorized');
        setRsvps([]);
      } else {
        const json = await res.json();
        setRsvps(json.data || []);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (token) { localStorage.setItem('admin_token', token); load(); } }, [token]);

  async function toggleConfirm(id: string, confirmed: boolean) {
    try {
      const res = await fetch(`/api/admin/rsvps/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ confirmed: !confirmed }),
      });
      if (res.ok) load();
    } catch (err) {
      setError('Unable to update');
    }
  }

  async function toggleVisibility(id: string, visibility: string) {
    try {
      const newVis = visibility === 'PUBLIC' || visibility === 'public' ? 'private' : 'public';
      const res = await fetch(`/api/admin/rsvps/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ visibility: newVis }),
      });
      if (res.ok) load();
    } catch (err) {
      setError('Unable to update visibility');
    }
  }

  return (
    <main className="min-h-screen p-6 bg-stone-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">RSVP Admin</h1>
        <label className="block mb-4">
          <span className="text-sm">Admin token</span>
          <input aria-label="Admin token" className="mt-1 block w-full rounded-xl border px-4 py-3" value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        <div className="mb-4">
          <button className="bg-[color:var(--accent)] text-white px-4 py-3 rounded-2xl" onClick={load} disabled={!token}>Load RSVPs</button>
        </div>
        {error && <p className="text-red-600 mb-4" role="alert">{error}</p>}
        {loading ? <p>Loading…</p> : (
          <div className="space-y-3">
            {rsvps.map((r) => (
              <div key={r.id} className="glass-card p-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{r.name} <span className="text-sm text-slate-500">• {r.email}</span></div>
                  <div className="text-sm text-slate-600 mt-1">{r.attending} • {r.guests} guests</div>
                  {r.message && <div className="mt-2 text-sm text-slate-700">{r.message}</div>}
                </div>
                <div className="flex items-center gap-3 mt-3 sm:mt-0">
                  <button aria-pressed={r.visibility === 'PUBLIC'} aria-label={`Set ${r.name} visibility`} className={`px-3 py-2 rounded-full ${r.visibility === 'PUBLIC' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`} onClick={() => toggleVisibility(r.id, r.visibility)}>
                    {r.visibility === 'PUBLIC' ? 'Public' : 'Private'}
                  </button>
                  <button aria-pressed={r.confirmed} aria-label={`Toggle confirmed for ${r.name}`} className={`px-3 py-2 rounded-full ${r.confirmed ? 'bg-green-500 text-white' : 'bg-gray-200'}`} onClick={() => toggleConfirm(r.id, r.confirmed)}>
                    {r.confirmed ? 'Confirmed' : 'Unconfirmed'}
                  </button>
                  <div className="text-sm text-slate-500">{new Date(r.createdAt).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminApp;