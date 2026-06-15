import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locales = ['en', 'es'];
  const defaultLocale = 'en';

  // App Router file-based metadata routes live at the root (no locale prefix)
  // and have no file extension, so they must bypass the locale redirect below.
  const metadataRoutes = [
    '/opengraph-image',
    '/twitter-image',
    '/icon',
    '/icon.svg',
    '/apple-icon',
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
    '/manifest.webmanifest',
  ];

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    metadataRoutes.includes(pathname) ||
    /\.(.*)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  if (pathname === '/') {
    const userLocale = request.headers.get('accept-language')?.split(',')[0].split('-')[0];
    const locale = userLocale && locales.includes(userLocale) ? userLocale : defaultLocale;
    console.log(`Redirecting to: /${locale}`);
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    console.log(`Pathname is missing locale, redirecting to: /${defaultLocale}${pathname}`);
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}