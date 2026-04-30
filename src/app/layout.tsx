import type { Metadata } from 'next';
import { Geist, Geist_Mono, Playfair_Display, Lora } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Amancha Wedding',
  description: 'Olga & Steve · October 17th 2026 · Florence, Arizona',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${playfairDisplay.variable} ${lora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
