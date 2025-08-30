import type { Metadata } from 'next';
import './globals.css';
import { Lato, Source_Sans_3 } from 'next/font/google';

export const metadata: Metadata = {
  title: 'These Freakin’ Empanadas & More',
  description: 'Bold, Crispy, Freakin’ Delicious. Hand-held flavor bombs—savory & sweet empanadas, sandwiches, and sides.',
  openGraph: {
    title: 'These Freakin’ Empanadas & More',
    description:
      'Bold, Crispy, Freakin’ Delicious. Hand-held flavor bombs—savory & sweet empanadas, sandwiches, and sides.',
    type: 'website'
  },
  metadataBase: process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL) : undefined,
  alternates: { canonical: '/' },
  other: {
    'X-Robots-Tag': process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production' ? 'noindex' : undefined
  }
};

const lato = Lato({ subsets: ['latin'], weight: ['400','700'], display: 'swap', variable: '--font-lato' });
const sourceSans = Source_Sans_3({ subsets: ['latin'], weight: ['400','700'], display: 'swap', variable: '--font-source' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${lato.variable} ${sourceSans.variable} font-sans`}>
        <a className="sr-only focus:not-sr-only" href="#content">
          Skip to content
        </a>
        <div id="content">{children}</div>
      </body>
    </html>
  );
}
