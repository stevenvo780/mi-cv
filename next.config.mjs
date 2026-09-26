/**
 * Security headers.
 *
 * Measured 2026-08-07: www.stevenvallejo.com answered with none of these — no
 * X-Frame-Options, no frame-ancestors, no nosniff, no Referrer-Policy. Without a
 * framing directive any site can load this one in an iframe, and this is the
 * portal that links out to every other app in the portfolio, so it is the page
 * a clickjacking overlay would target first.
 *
 * They live in next.config.mjs rather than vercel.json so they also apply under
 * `next dev` and `next start`, and so they survive a move off Vercel.
 *
 * CSP en modo enforcing solo en producción: `next dev` necesita eval para Fast Refresh.
 * 'unsafe-inline' en script-src es necesario para los payloads RSC inline de una página
 * estática (un nonce obligaría a render dinámico). GA solo se carga tras interacción.
 */
const isProd = process.env.NODE_ENV === 'production';

/**
 * Las previews de Vercel también se construyen en producción, así que reciben esta CSP, y Vercel les inyecta la
 * Vercel Toolbar. Solo con VERCEL_ENV=preview se añaden los orígenes que pide su documentación
 * (https://vercel.com/docs/vercel-toolbar/managing-toolbar, «Using a Content Security Policy»); producción no cambia.
 */
const isPreview = process.env.VERCEL_ENV === 'preview';
const toolbar = (...sources) => (isPreview ? sources : []);
const directive = (name, ...sources) => [name, ...sources].join(' ');

/**
 * GA4 según la guía de CSP de Google Tag Platform (https://developers.google.com/tag-platform/security/guides/csp,
 * consultada el 2026-09-24; el bloque de GA4 con Google Signals): *.googletagmanager.com en script-src, img-src y
 * connect-src, y los orígenes de medición y de las señales de Google (*.google-analytics.com, *.analytics.google.com,
 * *.g.doubleclick.net, *.google.com) en img-src y connect-src.
 * - Los *.google.<TLD> por país no van: la CSP no admite comodines en el TLD y la guía pide listar uno a uno los 187
 *   de https://www.google.com/supported_domains (unos 8 KB más en cada respuesta).
 * - pagead2.googlesyndication.com y frame-src https://www.googletagmanager.com tampoco: la guía los pide solo para las
 *   propiedades vinculadas a Google Ads. Si se vincula, hay que añadirlos.
 */
const GA = {
  script: ['https://*.googletagmanager.com'],
  measurement: [
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://*.googletagmanager.com',
    'https://*.g.doubleclick.net',
    'https://*.google.com',
  ],
};

const csp = [
  "default-src 'self'",
  directive('script-src', "'self'", "'unsafe-inline'", ...GA.script, ...toolbar('https://vercel.live')),
  directive('style-src', "'self'", "'unsafe-inline'", ...toolbar('https://vercel.live')),
  directive('img-src', "'self'", 'data:', 'blob:', ...GA.measurement, ...toolbar('https://vercel.live', 'https://vercel.com')),
  directive('font-src', "'self'", ...toolbar('https://vercel.live', 'https://assets.vercel.com')),
  directive('connect-src', "'self'", ...GA.measurement, ...toolbar('https://vercel.live', 'wss://ws-us3.pusher.com')),
  "worker-src 'self' blob:",
  ...(isPreview ? [directive('frame-src', "'self'", 'https://vercel.live')] : []),
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  ...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { globalNotFound: true },
  // El asistente lee su perfil del disco (src/assistant/prompt.ts): el archivo viaja con la función de la ruta.
  outputFileTracingIncludes: { '/api/assistant': ['./src/assistant/profile.md'] },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/graph/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      // La hoja del arte de la home lleva su hash en el nombre (scripts/build-art.mts).
      { source: '/art/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
};

export default nextConfig;
