import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locales = ['en', 'es'];
  const defaultLocale = 'en';

  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
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