import localFont from 'next/font/local';

// Fuentes propias de la home (spec §3.2 y §5.2): subconjuntos auto-alojados de las mismas familias OFL que usa
// el portal, con solo los pesos y los caracteres que pinta la home. Se regeneran con `bash scripts/subset-fonts.sh`
// (dentro está cada comando de pyftsubset y el origen fijado de cada TTF).
//
// El nombre del h1 (LCP) NO pasa por next/font: su @font-face + preload viven inline en layout.tsx
// (/fonts/cormorant-hero.woff2) para pintar .hero-last en first paint sin esperar el chunk CSS de home.
// El resto se pide al aplicar los estilos, sin precarga. Ninguna pila de home.css nombra las familias de
// Google del layout raíz: si lo hiciera, el navegador las descargaría como respaldo mientras cargan estas.

/** Cormorant Garamond 400–500 (titulares, nombres, cifras). La home no pinta cursivas. */
export const cormorantHome = localFont({
  src: '../../fonts/cormorant-home.woff2',
  weight: '400 500',
  style: 'normal',
  variable: '--font-home-display',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Times New Roman',
});

/** Geist 400–600 (texto). */
export const geistHome = localFont({
  src: '../../fonts/geist-home.woff2',
  weight: '400 600',
  variable: '--font-home-sans',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
});

/** JetBrains Mono 400–500 (etiquetas, fechas y chips). */
export const jetbrainsHome = localFont({
  src: '../../fonts/jetbrains-home.woff2',
  weight: '400 500',
  variable: '--font-home-mono',
  display: 'swap',
  preload: false,
  adjustFontFallback: 'Arial',
});

export const HOME_FONT_VARIABLES = [cormorantHome, geistHome, jetbrainsHome].map((f) => f.variable).join(' ');
