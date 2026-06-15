import 'bootstrap/dist/css/bootstrap.min.css';
import '@/styles/globals.css';
import '@/styles/brand.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
config.autoAddCss = false;
import localFont from 'next/font/local';
import { Inter, JetBrains_Mono, Cormorant_Garamond } from 'next/font/google';
import { Viewport } from 'next';

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
