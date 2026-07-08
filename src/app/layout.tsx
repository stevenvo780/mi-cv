import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import '@/styles/brand.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
import localFont from 'next/font/local';
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

// Cloud Atlas typography: Inter (UI), JetBrains Mono (eyebrows/chips/meta),
// Cormorant Garamond (Philosophy front + blog only).
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

// Metadata global del sitio
export const metadata: Metadata = {
  metadataBase: new URL('https://www.stevenvallejo.com'),
  title: {
    default: 'Steven Vallejo — Mouseîon | Portal maestro de CV y catálogo',
    template: '%s · Steven Vallejo — Mouseîon',
  },
  description:
    'Steven Vallejo: portal maestro de CV y catálogo del ecosistema Mouseîon. ' +
    'Filosofía, ingeniería y ciencia reunidas en un solo lugar (Prizma, Pinakothḗke, Agora).',
  keywords: [
    'Steven Vallejo',
    'Mouseîon',
    'Prizma',
    'Pinakothḗke',
    'Agora',
    'portfolio',
    'CV',
    'filosofía',
    'ingeniería',
    'ciencia',
  ],
  authors: [{ name: 'Steven Vallejo', url: 'https://www.stevenvallejo.com' }],
  creator: 'Steven Vallejo',
  publisher: 'Mouseîon',
  alternates: {
    canonical: 'https://www.stevenvallejo.com',
    languages: { en: 'https://www.stevenvallejo.com' },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.stevenvallejo.com',
    siteName: 'Mouseîon',
    title: 'Steven Vallejo — Mouseîon | Portal maestro de CV y catálogo',
    description:
      'Portal maestro de Steven Vallejo y catálogo del ecosistema Mouseîon ' +
      '(Prizma, Pinakothḗke, Agora).',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Steven Vallejo — Mouseîon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Steven Vallejo — Mouseîon',
    description:
      'Portal maestro de CV y catálogo del ecosistema Mouseîon ' +
      '(Prizma, Pinakothḗke, Agora).',
    images: ['/og-image.png'],
    creator: '@stevenvallejo780',
  },
  category: 'portfolio',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0b1417' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1417' },
  ],
};

/**
 * Root layout. Renders the single <html>/<body> for the whole App Router tree,
 * including error pages (/not-found, /_not-found) so Next.js never falls back to
 * the Pages-Router default error component (which imports <Html> and breaks the
 * production build). The [locale] layout layers locale-specific <head> metadata
 * and the navbar on top of this shell.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
      prefix="og: http://ogp.me/ns#"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
