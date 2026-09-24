import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from '@/lib/site';

/**
 * Locale preferido según Accept-Language (RFC 9110 §12.5.4): las etiquetas se ordenan por su peso q (1 si no lo
 * lleva; a igual peso, en el orden de la cabecera) y gana la primera cuyo idioma principal sea es o en. Sin
 * coincidencia, o sin cabecera, DEFAULT_LOCALE. q=0 significa «no aceptable».
 */
export function preferredLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const ranked = acceptLanguage
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.split(';').map((s) => s.trim());
      const q = params.find((p) => /^q=/i.test(p));
      const weight = q === undefined ? 1 : Number(q.slice(2));
      return { lang: tag.toLowerCase().split('-')[0], weight: Number.isFinite(weight) ? weight : 0, index };
    })
    .filter((r) => r.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);
  return ranked.find((r) => isLocale(r.lang))?.lang as Locale | undefined ?? DEFAULT_LOCALE;
}

/** Redirección a otra ruta del mismo origen que conserva la query (UTM y demás parámetros de campaña). */
function redirectTo(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return NextResponse.redirect(url);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') return redirectTo(request, `/${preferredLocale(request.headers.get('accept-language'))}`);

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) return redirectTo(request, `/${DEFAULT_LOCALE}${pathname}`);

  return NextResponse.next();
}

export const config = {
  // Excluye estáticos, rutas internas y cualquier archivo con extensión (sitemap.xml, robots.txt, icon.svg…).
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
