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

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
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
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/graph/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
    ];
  },
};

export default nextConfig;
