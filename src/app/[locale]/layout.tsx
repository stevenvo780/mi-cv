import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import localFont from 'next/font/local';
import Analytics from '@/components/Analytics';
import { LOCALES, SITE, isLocale } from '@/lib/site';

// Fuentes del layout raíz: las usan el portal (brand.css: --font-inter, --font-jetbrains, --font-cormorant) y el
// 404 de [locale] (NotFoundView). La home no las usa: tiene sus propios subconjuntos en (home)/fonts.ts, así que
// aquí nada se precarga (una precarga desde el layout raíz se descargaría también en la home).
//
// Todas son archivos locales (next/font/local): next/font/google falla en algunos builds limpios (spec §8), y un
// build rojo en Vercel bloquea el deploy. Cormorant, JetBrains Mono e Inter son las mismas fuentes variables que
// servía Google con subsets: ['latin'] (mismo rango unicode, mismas features, sin hinting). Se regeneran con
// `bash scripts/subset-fonts.sh` (sección «Layout raíz»: origen fijado en google/fonts; Inter se instancia antes en
// opsz=14, como la sirve Google), que para cada una ejecuta:
//   pyftsubset <TTF de google/fonts> --flavor=woff2 --no-hinting \
//     --layout-features=ccmp,locl,mark,mkmk,kern,liga,calt,clig,rlig,rvrn,rclt,curs,frac,numr,dnom,lnum,pnum,tnum \
//     --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD' \
//     --output-file=src/app/fonts/<familia>-latin.woff2
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
// Cormorant Garamond: UNA sola familia con las caras rectas y las cursivas. next/font/local nombra cada llamada con
// su propia familia, así que dos llamadas (una recta y otra cursiva) dejarían --font-cormorant sin caras rectas y
// el texto recto del portal (--font-serif con peso 600, GalleryComponents) saldría en cursiva. Un archivo variable
// por estilo (eje wght 300–700); se declara 400–700, que son las caras que pedía el layout con Google: una petición
// de 300 se sigue pintando a 400.
const cormorant = localFont({
  src: [
    { path: '../fonts/cormorant-garamond-latin.woff2', weight: '400 700', style: 'normal' },
    { path: '../fonts/cormorant-garamond-italic-latin.woff2', weight: '400 700', style: 'italic' },
  ],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
});
const jetbrains = localFont({
  src: '../fonts/jetbrains-mono-latin.woff2',
  weight: '100 800',
  style: 'normal',
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
});
const inter = localFont({
  src: '../fonts/inter-latin.woff2',
  weight: '100 900',
  style: 'normal',
  variable: '--font-inter',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
});

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
      className={`${geist.variable} ${cormorant.variable} ${jetbrains.variable} ${inter.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
