import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import Analytics from '@/components/Analytics';
import { LOCALES, SITE, isLocale } from '@/lib/site';

// Fuentes del layout raíz: las usan el portal (brand.css: --font-inter, --font-jetbrains, --font-cormorant) y el
// 404 de [locale] (NotFoundView). La home no las usa: tiene sus propios subconjuntos en (home)/fonts.ts, así que
// aquí nada se precarga (una precarga desde el layout raíz se descargaría también en la home).
//
// Geist (geist@1.7.2, variable) recortado a latín: 33 KB frente a los 70 KB del archivo completo. Se regenera con:
//   pyftsubset node_modules/geist/dist/fonts/geist-sans/Geist-Variable.ttf --flavor=woff2 --layout-features='*' \
//     --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+1E17,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2197,U+2212,U+2215,U+FEFF,U+FFFD' \
//     --output-file=src/app/fonts/geist-sans-latin.woff2
const geist = localFont({
  src: '../fonts/geist-sans-latin.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'swap',
  adjustFontFallback: 'Arial',
  preload: false,
});
// Una sola familia "Cormorant Garamond" repartida en dos instancias sin caras en común. next/font 16 publica el
// nombre real de la familia, así que si las dos declaran la misma cara (peso y estilo) gana la última y el
// navegador descarga una copia sin precargar del mismo archivo. Los pesos 400–700 comparten el archivo variable.
const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal'],
  variable: '--font-display',
  display: 'swap',
  preload: false,
});
// Cursivas del portal. `--font-cormorant` nombra la misma familia, así que el portal
// (brand.css) sigue teniendo las caras rectas de la instancia anterior.
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['italic'],
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
      className={`${geist.variable} ${display.variable} ${cormorant.variable} ${jetbrains.variable} ${inter.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
