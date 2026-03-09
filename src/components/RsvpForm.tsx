"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

type Step = 'search' | 'attending' | 'guests' | 'meal' | 'sent';
type GuestMatch = { firstName: string; lastName: string; fullName: string; guestCount: number };
type AdditionalGuest = { firstName: string; lastName: string; meal: string | null; allergies: string };

const MEALS = [
  {
    id: 'chicken',
    label: 'Chicken',
    desc: 'Herb roasted breast with seasonal vegetables and pan jus',
  },
  {
    id: 'salmon',
    label: 'Salmon',
    desc: 'Pan seared fillet with lemon butter sauce and wild rice',
  },
  {
    id: 'beef',
    label: 'Beef',
    desc: 'Slow braised short rib with red wine reduction and root vegetables',
  },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '0.95rem',
  border: '1px solid rgba(201,148,58,0.35)',
  borderRadius: 0,
  background: 'rgba(255,255,255,0.06)',
  color: 'inherit',
  outline: 'none',
  fontFamily: "var(--font-lora, 'Lora', serif)",
  transition: 'border-color 150ms ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.7rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  marginBottom: 6,
  opacity: 0.6,
};

function Divider() {
  return <div style={{ width: '100%', height: 1, background: 'rgba(201,148,58,0.18)', margin: '4px 0' }} />;
}

export default function RsvpForm({ compact, initialLastName }: { compact?: boolean; initialLastName?: string }) {
  const spacing = compact ? 'space-y-5' : 'space-y-7';

  // Step 1
  const [lastNameQuery, setLastNameQuery] = useState(initialLastName ?? '');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [matches, setMatches] = useState<GuestMatch[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<GuestMatch | null>(null);

  // Step 2
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null);

  // Step 3
  const [meal, setMeal] = useState<string | null>(null);
  const [allergies, setAllergies] = useState('');

  // Additional guests (populated from guest list Guest Count column)
  const [additionalGuests, setAdditionalGuests] = useState<AdditionalGuest[]>([]);

  function updateAdditionalGuest(idx: number, patch: Partial<AdditionalGuest>) {
    setAdditionalGuests((prev) => prev.map((g, i) => (i === idx ? { ...g, ...patch } : g)));
  }

  // Submit
  const [step, setStep] = useState<Step>('search');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function doSearch(query: string) {
    setSearching(true);
    setSearchError(null);
    setMatches([]);
    setSelectedGuest(null);
    try {
      const res = await fetch('/api/rsvp/verify-guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastName: query }),
      });
      const json = await res.json();
      if (json.matches && json.matches.length > 0) {
        setMatches(json.matches);
      } else {
        setSearchError(
          "No guests found with that last name. Please double-check or contact us directly."
        );
      }
    } catch {
      setSearchError('Something went wrong — please try again.');
    } finally {
      setSearching(false);
    }
  }

  // Auto-trigger search when component mounts with a pre-filled last name (from ?q= param)
  useEffect(() => {
    if (initialLastName?.trim()) doSearch(initialLastName.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchGuests(e: React.FormEvent) {
    e.preventDefault();
    if (!lastNameQuery.trim()) return;
    await doSearch(lastNameQuery.trim());
  }

  async function submitRsvp() {
    if (!selectedGuest || attending === null) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedGuest.fullName,
          lastName: selectedGuest.lastName,
          attending,
          meal: attending === 'yes' ? meal : undefined,
          allergies: attending === 'yes' ? allergies : undefined,
          additionalGuests:
            attending === 'yes' && additionalGuests.length > 0
              ? additionalGuests.map((g) => ({
                  firstName: g.firstName,
                  lastName: g.lastName,
                  meal: g.meal ?? undefined,
                  allergies: g.allergies || undefined,
                }))
              : undefined,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        setSuccessMessage(json?.message ?? 'Your RSVP has been received!');
        setStep('sent');
      } else {
        setSubmitError('Something went wrong — please try again.');
      }
    } catch {
      setSubmitError('Something went wrong — please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // ── SENT ────────────────────────────────────────────────────────────
  if (step === 'sent') {
    return (
      <div
        className="text-center py-10"
        style={{ fontFamily: "var(--font-lora, 'Lora', serif)" }}
        role="status"
        aria-live="polite"
      >
        <p
          className="text-4xl mb-5"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            color: 'var(--gold, #C9943A)',
            fontWeight: 400,
          }}
        >
          ✓
        </p>
        <h3
          className="text-2xl mb-3"
          style={{
            fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
            fontWeight: 400,
          }}
        >
          {attending === 'yes' ? "We'll see you there!" : "We'll miss you!"}
        </h3>
        <p className="text-sm mb-10 opacity-60">{successMessage}</p>
        <Link
          href="/#story"
          className="inline-block text-xs uppercase tracking-widest px-8 py-3 transition-opacity hover:opacity-80"
          style={{
            background: 'var(--gold, #C9943A)',
            color: '#fff',
            letterSpacing: '0.18em',
          }}
        >
          Back to Our Story
        </Link>
      </div>
    );
  }

  // ── STEP 1: SEARCH ──────────────────────────────────────────────────
  if (step === 'search') {
    return (
      <div className={spacing}>
        <form onSubmit={searchGuests} className="space-y-4">
          <div>
            <label htmlFor="rsvp-lastname" style={labelStyle}>
              Search by last name
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                id="rsvp-lastname"
                required
                autoComplete="family-name"
                style={{ ...inputStyle, flex: 1 }}
                value={lastNameQuery}
                placeholder="Your last name…"
                onChange={(e) => {
                  setLastNameQuery(e.target.value);
                  setSearchError(null);
                  setMatches([]);
                  setSelectedGuest(null);
                }}
              />
              <button
                type="submit"
                disabled={searching || !lastNameQuery.trim()}
                style={{
                  background: 'var(--gold, #C9943A)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 20px',
                  fontSize: '0.72rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  cursor: searching ? 'wait' : 'pointer',
                  opacity: !lastNameQuery.trim() ? 0.4 : 1,
                  whiteSpace: 'nowrap',
                  transition: 'opacity 150ms',
                }}
              >
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>
            {searchError && (
              <p
                className="mt-2 text-xs leading-snug"
                style={{ color: 'rgba(200,60,40,0.9)' }}
                role="alert"
              >
                {searchError}
              </p>
            )}
          </div>
        </form>

        {/* Results */}
        {matches.length > 0 && (
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>Select your name</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {matches.map((g) => {
                const isSelected = selectedGuest?.fullName === g.fullName;
                return (
                  <button
                    key={g.fullName}
                    type="button"
                    onClick={() => setSelectedGuest(isSelected ? null : g)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '14px 16px',
                      border: isSelected
                        ? '1px solid var(--gold, #C9943A)'
                        : '1px solid rgba(201,148,58,0.22)',
                      background: isSelected
                        ? 'rgba(201,148,58,0.10)'
                        : 'rgba(255,255,255,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-lora, 'Lora', serif)",
                        fontSize: '0.95rem',
                        color: isSelected ? 'var(--gold, #C9943A)' : 'inherit',
                      }}
                    >
                      {g.fullName}
                    </span>
                    <span
                      style={{
                        color: 'var(--gold, #C9943A)',
                        fontSize: '0.85rem',
                        opacity: isSelected ? 1 : 0,
                        transition: 'opacity 150ms',
                      }}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedGuest && (
              <button
                type="button"
                onClick={() => setStep('attending')}
                style={{
                  marginTop: 20,
                  width: '100%',
                  background: 'var(--deep-brown, #2C1A0E)',
                  color: '#fff',
                  border: 'none',
                  padding: '14px',
                  fontSize: '0.72rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'opacity 150ms',
                }}
              >
                Continue →
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── STEP 2: ATTENDING ───────────────────────────────────────────────
  if (step === 'attending') {
    return (
      <div className={spacing}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: 4 }}>Responding as</p>
            <p
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontSize: '1.15rem',
                fontWeight: 400,
              }}
            >
              {selectedGuest?.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setStep('search'); setAttending(null); }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              opacity: 0.45,
              color: 'inherit',
              paddingTop: 4,
              flexShrink: 0,
            }}
          >
            Change
          </button>
        </div>

        <Divider />

        {/* Attending cards */}
        <div>
          <p style={{ ...labelStyle, marginBottom: 12 }}>Will you attend?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {(['yes', 'no'] as const).map((choice) => {
              const selected = attending === choice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setAttending(choice)}
                  style={{
                    padding: '20px 12px',
                    textAlign: 'center',
                    border: selected
                      ? '1px solid var(--gold, #C9943A)'
                      : '1px solid rgba(201,148,58,0.22)',
                    background: selected
                      ? 'rgba(201,148,58,0.10)'
                      : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      fontSize: '1rem',
                      fontStyle: 'italic',
                      fontWeight: 400,
                      color: selected ? 'var(--gold, #C9943A)' : 'inherit',
                    }}
                  >
                    {choice === 'yes' ? 'Joyfully Accepts' : 'Regretfully Declines'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {attending === 'yes' && (
            <button
              type="button"
              onClick={() => {
                if (selectedGuest && selectedGuest.guestCount > 0) {
                  setAdditionalGuests(
                    Array.from({ length: selectedGuest.guestCount }, () => ({
                      firstName: '',
                      lastName: '',
                      meal: null,
                      allergies: '',
                    }))
                  );
                  setStep('guests');
                } else {
                  setStep('meal');
                }
              }}
              style={{
                width: '100%',
                background: 'var(--gold, #C9943A)',
                color: '#fff',
                border: 'none',
                padding: '14px',
                fontSize: '0.72rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Choose Your Meal →
            </button>
          )}
          {attending === 'no' && (
            <button
              type="button"
              onClick={submitRsvp}
              disabled={submitting}
              style={{
                width: '100%',
                background: 'var(--deep-brown, #2C1A0E)',
                color: '#fff',
                border: 'none',
                padding: '14px',
                fontSize: '0.72rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                cursor: submitting ? 'wait' : 'pointer',
                opacity: submitting ? 0.5 : 1,
              }}
            >
              {submitting ? 'Sending…' : 'Send RSVP'}
            </button>
          )}
          {submitError && (
            <p className="text-xs text-center opacity-70" role="alert">
              {submitError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 3: ADDITIONAL GUESTS ───────────────────────────────────────
  if (step === 'guests') {
    const allNamed = additionalGuests.every((g) => g.firstName.trim() && g.lastName.trim());
    return (
      <div className={spacing}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: 4 }}>Responding as</p>
            <p
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontSize: '1.15rem',
                fontWeight: 400,
              }}
            >
              {selectedGuest?.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { setStep('attending'); setAdditionalGuests([]); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.45, color: 'inherit', paddingTop: 4, flexShrink: 0 }}
          >
            ← Back
          </button>
        </div>

        <Divider />

        <div>
          <p style={{ ...labelStyle, marginBottom: 4 }}>Your guests</p>
          <p
            style={{
              fontFamily: "var(--font-lora, 'Lora', serif)",
              fontSize: '0.83rem',
              opacity: 0.55,
              marginBottom: 18,
              lineHeight: 1.5,
            }}
          >
            Please enter the names of the guests joining you.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {additionalGuests.map((g, idx) => (
              <div key={idx}>
                <p style={{ ...labelStyle, marginBottom: 10 }}>Guest {idx + 1}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label htmlFor={`guest-fn-${idx}`} style={labelStyle}>First name</label>
                    <input
                      id={`guest-fn-${idx}`}
                      type="text"
                      autoComplete="given-name"
                      style={inputStyle}
                      value={g.firstName}
                      onChange={(e) => updateAdditionalGuest(idx, { firstName: e.target.value })}
                      placeholder="First"
                    />
                  </div>
                  <div>
                    <label htmlFor={`guest-ln-${idx}`} style={labelStyle}>Last name</label>
                    <input
                      id={`guest-ln-${idx}`}
                      type="text"
                      autoComplete="family-name"
                      style={inputStyle}
                      value={g.lastName}
                      onChange={(e) => updateAdditionalGuest(idx, { lastName: e.target.value })}
                      placeholder="Last"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setStep('meal')}
          disabled={!allNamed}
          style={{
            width: '100%',
            background: allNamed ? 'var(--gold, #C9943A)' : 'rgba(44,26,14,0.25)',
            color: '#fff',
            border: 'none',
            padding: '14px',
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: allNamed ? 'pointer' : 'not-allowed',
          }}
        >
          Choose Meals →
        </button>
      </div>
    );
  }

  // ── STEP 4: MEAL ────────────────────────────────────────────────────
  if (step === 'meal') {
    const allMealsSelected = !!meal && additionalGuests.every((g) => !!g.meal);
    return (
      <div className={spacing}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ ...labelStyle, marginBottom: 4 }}>Responding as</p>
            <p
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontSize: '1.15rem',
                fontWeight: 400,
              }}
            >
              {selectedGuest?.fullName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setStep(additionalGuests.length > 0 ? 'guests' : 'attending')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.7rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              opacity: 0.45,
              color: 'inherit',
              paddingTop: 4,
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
        </div>

        <Divider />

        {/* Dinner selection */}
        <div>
          <p style={{ ...labelStyle, marginBottom: 6 }}>Dinner selection</p>
          <p
            style={{
              fontFamily: "var(--font-lora, 'Lora', serif)",
              fontSize: '0.83rem',
              opacity: 0.55,
              marginBottom: 18,
              lineHeight: 1.5,
            }}
          >
            Please choose your entrée for the reception dinner.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 12,
            }}
          >
            {MEALS.map((item) => {
              const selected = meal === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMeal(item.id)}
                  style={{
                    padding: '20px 16px',
                    textAlign: 'left',
                    border: selected
                      ? '1px solid var(--gold, #C9943A)'
                      : '1px solid rgba(201,148,58,0.25)',
                    background: selected
                      ? 'var(--gold, #C9943A)'
                      : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                      fontSize: '1.1rem',
                      fontWeight: 400,
                      marginBottom: 8,
                      color: selected ? '#fff' : 'inherit',
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-lora, 'Lora', serif)",
                      fontSize: '0.75rem',
                      lineHeight: 1.55,
                      color: selected ? 'rgba(255,255,255,0.78)' : 'rgba(44,26,14,0.55)',
                    }}
                  >
                    {item.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Allergies */}
        <div>
          <label
            htmlFor="rsvp-allergies"
            style={{ ...labelStyle, marginBottom: 6 }}
          >
            Dietary restrictions or allergies
          </label>
          <p
            style={{
              fontFamily: "var(--font-lora, 'Lora', serif)",
              fontSize: '0.83rem',
              opacity: 0.55,
              marginBottom: 10,
              lineHeight: 1.5,
            }}
          >
            Leave blank if none.
          </p>
          <textarea
            id="rsvp-allergies"
            rows={2}
            placeholder="e.g. nut allergy, gluten free, vegetarian…"
            style={{ ...inputStyle, resize: 'vertical' }}
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
        </div>

        {/* Additional guest meals */}
        {additionalGuests.map((g, idx) => (
          <div key={idx}>
            <Divider />
            <p
              style={{
                fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                fontSize: '1rem',
                fontWeight: 400,
                marginTop: 8,
                marginBottom: 16,
              }}
            >
              {g.firstName} {g.lastName}
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 12,
              }}
            >
              {MEALS.map((item) => {
                const selected = g.meal === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateAdditionalGuest(idx, { meal: item.id })}
                    style={{
                      padding: '20px 16px',
                      textAlign: 'left',
                      border: selected ? '1px solid var(--gold, #C9943A)' : '1px solid rgba(201,148,58,0.25)',
                      background: selected ? 'var(--gold, #C9943A)' : 'rgba(255,255,255,0.03)',
                      cursor: 'pointer',
                      transition: 'all 180ms ease',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
                        fontSize: '1.1rem',
                        fontWeight: 400,
                        marginBottom: 8,
                        color: selected ? '#fff' : 'inherit',
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-lora, 'Lora', serif)",
                        fontSize: '0.75rem',
                        lineHeight: 1.55,
                        color: selected ? 'rgba(255,255,255,0.78)' : 'rgba(44,26,14,0.55)',
                      }}
                    >
                      {item.desc}
                    </p>
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 14 }}>
              <label htmlFor={`guest-allergies-${idx}`} style={{ ...labelStyle, marginBottom: 6 }}>
                Dietary restrictions or allergies
              </label>
              <textarea
                id={`guest-allergies-${idx}`}
                rows={2}
                placeholder="e.g. nut allergy, gluten free, vegetarian…"
                style={{ ...inputStyle, resize: 'vertical' }}
                value={g.allergies}
                onChange={(e) => updateAdditionalGuest(idx, { allergies: e.target.value })}
              />
            </div>
          </div>
        ))}

        {/* Confirm */}
        <button
          type="button"
          onClick={submitRsvp}
          disabled={submitting || !allMealsSelected}
          style={{
            width: '100%',
            background:
              submitting || !allMealsSelected ? 'rgba(44,26,14,0.25)' : 'var(--deep-brown, #2C1A0E)',
            color: '#fff',
            border: 'none',
            padding: '15px',
            fontSize: '0.72rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: submitting || !allMealsSelected ? 'not-allowed' : 'pointer',
            transition: 'background 150ms',
          }}
        >
          {submitting ? 'Sending…' : 'Confirm Reservation'}
        </button>

        {submitError && (
          <p className="text-xs text-center opacity-70" role="alert">
            {submitError}
          </p>
        )}
      </div>
    );
  }

  return null;
}
