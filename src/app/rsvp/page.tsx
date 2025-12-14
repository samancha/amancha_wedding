"use client";
import RsvpForm from '@/components/RsvpForm';

export default function RSVPPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-stone-50 p-6">
      <div className="max-w-2xl w-full">
        <h1 className="text-2xl font-semibold mb-4">RSVP</h1>
        <RsvpForm />
      </div>
    </main>
  );
}
