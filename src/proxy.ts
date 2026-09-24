import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['es', 'en'] as const;
const DEFAULT_LOCALE = 'en';

function preferredLocale(request: NextRequest): string {
  const primary = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]?.trim();
  return primary && (LOCALES as readonly string[]).includes(primary) ? primary : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${preferredLocale(request)}`, request.url));
  }

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url));
  }

  // Temporal: el layout raíz aún lee x-locale. La Tarea 2 elimina esta cabecera.
  const locale = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))!;
  const headers = new Headers(request.headers);
  headers.set('x-locale', locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Excluye estáticos, rutas internas y cualquier archivo con extensión (sitemap.xml, robots.txt, icon.svg…).
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
