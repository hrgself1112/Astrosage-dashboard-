import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Astrosage Dashboard',
  description: 'Complete dashboard for document management, user administration, and AI-powered tools',
  keywords: ['dashboard', 'admin', 'document management', 'AI tools', 'background removal'],
  authors: [{ name: 'Astrosage Team' }],
  creator: 'Astrosage Dashboard',
  publisher: 'Astrosage',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://astrosage.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Astrosage Dashboard',
    title: 'Astrosage Dashboard - Complete Admin & AI Tools',
    description: 'Professional dashboard with document management, user administration, and AI-powered background removal tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Astrosage Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Astrosage Dashboard',
    description: 'Professional dashboard with admin tools and AI-powered features.',
    images: ['/og-image.png'],
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}