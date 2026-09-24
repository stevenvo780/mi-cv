import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { GeistSans } from 'geist/font/sans';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { LOCALES, SITE, isLocale } from '@/lib/site';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
});
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap', preload: false });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: false });

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Steven Vallejo Ortiz · Mouseîon', template: '%s · Mouseîon' },
  applicationName: 'Mouseîon',
  authors: [{ name: 'Steven Vallejo Ortiz', url: SITE }],
  creator: 'Steven Vallejo Ortiz',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#05090b',
  colorScheme: 'dark',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${display.variable} ${cormorant.variable} ${jetbrains.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
