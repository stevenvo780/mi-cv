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
 * CSP is Report-Only on purpose. The exact inline/script surface of this app has
 * not been measured yet, and an enforcing policy that blanks the page is worse
 * than no policy at all. Promote to `Content-Security-Policy` once a run shows
 * no violations; the value below is already the enforcing one, so the promotion
 * is a rename and not a rewrite.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
