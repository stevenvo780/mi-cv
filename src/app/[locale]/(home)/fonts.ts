import localFont from 'next/font/local';

// Fuentes propias de la home (spec §3.2 y §5.2): subconjuntos auto-alojados de las mismas familias OFL que usa
// el portal, con solo los pesos y los caracteres que pinta la home. Se regeneran con `bash scripts/subset-fonts.sh`
// (dentro está cada comando de pyftsubset y el origen fijado de cada TTF).
//
// Solo se precarga el nombre del h1 (el elemento LCP): 2 KB con 19 glifos. El resto se pide al aplicar los
// estilos, sin precarga. Ninguna pila de home.css nombra las familias de Google del layout raíz: si lo hiciera,
// el navegador las descargaría como respaldo mientras cargan estas.

/** "Steven Vallejo Ortiz" en Cormorant Garamond 500. Si cambia el nombre, cambia el subconjunto. */
export const cormorantHero = localFont({
  src: '../../fonts/cormorant-hero.woff2',
  weight: '500',
  style: 'normal',
  variable: '--font-home-hero',
  display: 'swap', // no optional: Jefe/spec — swap + fallback métrico para first paint sólido
  preload: true, // única cara precargada: el nombre LCP (~2 KB)
  // Fallback métrico (Times New Roman + size-adjust): el h1 pinta en first paint sin esperar el woff2;
  // sin esto Chrome alarga Render Delay del LCP hasta el swap (preview 6adb2ef ~3.2 s).
  adjustFontFallback: 'Times New Roman',
});

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

export const HOME_FONT_VARIABLES = [cormorantHero, cormorantHome, geistHome, jetbrainsHome].map((f) => f.variable).join(' ');
