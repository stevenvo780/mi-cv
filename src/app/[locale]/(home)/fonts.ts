import localFont from 'next/font/local';

// Fuentes propias de la home (spec §3.2 y §5.2): subconjuntos auto-alojados de las mismas familias OFL que usa
// el portal, con solo los pesos y los caracteres que pinta la home. Se regeneran con `bash scripts/subset-fonts.sh`
// (dentro está cada comando de pyftsubset y el origen fijado de cada TTF).
//
// Se precargan el nombre del h1 (el elemento LCP, 2 KB con 19 glifos) y Geist (13 KB), la letra del panel del hero:
// con su respaldo ajustado, el lead y los botones de /en partían línea en otro sitio y el panel saltaba 87 px al
// llegar la fuente (CLS 0.089 en móvil). El resto se pide al aplicar los estilos. Ninguna pila de home.css nombra las
// familias de Google del layout raíz: si lo hiciera, el navegador las descargaría como respaldo mientras cargan estas.

/** "Steven Vallejo Ortiz" en Cormorant Garamond 500. Si cambia el nombre, cambia el subconjunto. */
export const cormorantHero = localFont({
  src: '../../fonts/cormorant-hero.woff2',
  weight: '500',
  style: 'normal',
  variable: '--font-home-hero',
  display: 'swap',
  preload: true,
  // Sin respaldo ajustado propio: mientras carga, el h1 cae en cormorantHome (misma letra y peso) y luego en su
  // respaldo, que sí está ajustado (home.css: var(--font-home-hero), var(--f-display)).
  adjustFontFallback: false,
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

/** Geist 400–600 (texto). Precargada: ver arriba. */
export const geistHome = localFont({
  src: '../../fonts/geist-home.woff2',
  weight: '400 600',
  variable: '--font-home-sans',
  display: 'swap',
  preload: true,
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

/**
 * Las tres del arte (escenas de los catálogos y emblemas de las tarjetas, src/components/home/art): griego, ecuaciones
 * y código. Sin precarga: el arte está debajo del hero y no se pinta hasta acercarse (content-visibility), así que el
 * navegador no las pide antes. Sin respaldo ajustado: el arte no mueve texto de la página al llegar la fuente.
 */
export const greekHome = localFont({
  src: '../../fonts/greek-home.woff2',
  weight: '400 500',
  variable: '--font-home-greek',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export const mathHome = localFont({
  src: '../../fonts/math-home.woff2',
  weight: '400',
  variable: '--font-home-math',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export const codeHome = localFont({
  src: '../../fonts/code-home.woff2',
  weight: '400 500',
  variable: '--font-home-code',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
});

export const HOME_FONT_VARIABLES = [cormorantHero, cormorantHome, geistHome, jetbrainsHome, greekHome, mathHome, codeHome]
  .map((f) => f.variable)
  .join(' ');
