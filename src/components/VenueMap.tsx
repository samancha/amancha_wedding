'use client';

export default function VenueMap() {
  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg">
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d3358.5233651734536!2d-111.39689!3d33.19602!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sGreenTree%20Inn%20%26%20Suites%20Florence%20Arizona!5e0!3m2!1sen!2sus!4v1734268000000"
      />
    </div>
  );
}
