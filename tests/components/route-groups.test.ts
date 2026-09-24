// La home (grupo (home), con home.css en `@layer home`) y el portal (grupo (portal), con bootstrap,
// globals.css y brand.css sin capa) comparten el layout raíz [locale]/layout.tsx. Una navegación en
// cliente (next/link) entre ambos deja cargada la hoja del grupo de origen, y como las reglas sin capa
// ganan siempre a las de una capa, la página de destino se rompe (spec §1.4: cero regresiones en
// /[locale]/[frente] y /[locale]/lore). Por eso los enlaces que cruzan de un grupo a otro son <a>
// (navegación de documento) y next/link solo enlaza páginas del mismo grupo.
import { createElement, type ComponentType, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import FrentePageClient from '@/app/[locale]/(portal)/[frente]/FrentePageClient';
import LorePageClient from '@/app/[locale]/(portal)/lore/LorePageClient';
import CustomNavbar from '@/app/components/Navbar';
import HomePage from '@/app/[locale]/(home)/page';
import NotFoundView from '@/components/NotFoundView';
import { frenteOrder } from '@/data/frentes';

// next/link se sustituye por un <a> marcado: así el HTML distingue la navegación en cliente de la de documento.
vi.mock('next/link', async () => {
  const { createElement: h } = await import('react');
  function Link({ href, prefetch, replace, scroll, ...rest }: Record<string, unknown>) {
    void prefetch;
    void replace;
    void scroll;
    return h('a', { ...rest, href: String(href), 'data-client-nav': '' });
  }
  return { default: Link };
});

// geist/font/sans llama a next/font/local, que solo funciona dentro del build de Next (lo usa global-not-found).
vi.mock('geist/font/sans', () => ({ GeistSans: { className: 'geist', variable: 'geist-variable' } }));

vi.mock('next/navigation', () => ({
  useParams: () => ({ locale: 'es' }),
  usePathname: () => '/es/lore',
  useRouter: () => ({ push: () => {}, replace: () => {}, prefetch: () => {}, back: () => {}, forward: () => {}, refresh: () => {} }),
}));

type Anchor = { href: string; client: boolean };

function anchors(html: string): Anchor[] {
  return [...html.matchAll(/<a\b([^>]*)>/g)].map(([, attrs]) => ({
    href: /\bhref="([^"]*)"/.exec(attrs)?.[1] ?? '',
    client: /\bdata-client-nav=""/.test(attrs),
  }));
}

/** Grupo de rutas al que lleva un enlace interno: `/es`, `/en` (con o sin ancla) es la home; el resto, el portal. */
function group(href: string): 'home' | 'portal' {
  return /^\/(es|en)\/?(#.*)?$/.test(href) ? 'home' : 'portal';
}

const internal = (list: Anchor[]) => list.filter((a) => a.href.startsWith('/'));

async function renderHome(locale: 'es' | 'en') {
  const tree = await HomePage({ params: Promise.resolve({ locale }) });
  return renderToStaticMarkup(tree);
}

function render<P extends object>(component: ComponentType<P>, props: P): string {
  return renderToStaticMarkup(createElement(component, props) as ReactNode);
}

describe('enlaces entre los grupos de rutas (home) y (portal)', () => {
  // Además, la home no usa next/link en absoluto: su módulo cliente (~3.5 KB gz) no cabe en el presupuesto
  // de JS de la home (spec §5, ≤ 130 KB gz). La marca y el cambio de idioma son <a> (navegación de documento).
  it.each(['es', 'en'] as const)('la home (%s) no usa next/link', async (locale) => {
    const links = internal(anchors(await renderHome(locale)));
    expect(links.length).toBeGreaterThan(0);
    expect(links.filter((a) => a.client)).toEqual([]);

    const toPortal = links.filter((a) => group(a.href) === 'portal');
    const targets = new Set(toPortal.map((a) => a.href));
    expect(targets).toEqual(new Set([`/${locale}/lore`, ...frenteOrder.map((fid) => `/${locale}/${fid}`)]));
    expect(toPortal.filter((a) => a.client)).toEqual([]);
  });

  // El 404 de [locale] va en el árbol RSC de todas las páginas del segmento (incluida la home), así que un
  // next/link ahí también arrastraría el módulo a la home.
  // Es bilingüe (ninguno de los dos 404 recibe el locale): enlaza a las dos homes.
  it('la vista 404 no usa next/link y enlaza a las dos homes', () => {
    const links = internal(anchors(render(NotFoundView, {})));
    expect(links).toEqual([
      { href: '/es', client: false },
      { href: '/en', client: false },
    ]);
  });

  // Sin theme-color propio, la barra del navegador en móvil no lleva el fondo de NotFoundView (#05090b): el layout
  // raíz ya no lo fija (cada grupo pone el suyo) y los 404 no están en ningún grupo.
  it.each([
    ['[locale]/not-found', () => import('@/app/[locale]/not-found')],
    ['global-not-found', () => import('@/app/global-not-found')],
  ])('%s declara theme-color #05090b', async (_name, load) => {
    expect((await load()).viewport).toEqual({ themeColor: '#05090b' });
  });

  it('la vista 404 muestra los dos idiomas, cada uno con su lang', () => {
    const html = render(NotFoundView, {});
    for (const [lang, title, back] of [
      ['es', 'Esta página no existe', 'Volver al inicio'],
      ['en', 'This page does not exist', 'Back to home'],
    ]) {
      expect(html).toMatch(new RegExp(`<span lang="${lang}"[^>]*>${title}</span>`));
      expect(html).toMatch(new RegExp(`<a href="/${lang}" hrefLang="${lang}" lang="${lang}"[^>]*>${back}</a>`));
    }
  });

  it('el portal solo usa next/link dentro del portal', () => {
    const pages = [
      render(CustomNavbar, {}),
      render(LorePageClient, { locale: 'es' }),
      ...frenteOrder.map((frenteId) => render(FrentePageClient, { locale: 'es', frenteId })),
    ];
    for (const html of pages) {
      const links = internal(anchors(html));
      const toHome = links.filter((a) => group(a.href) === 'home');
      expect(toHome.length).toBeGreaterThan(0);
      expect(toHome.filter((a) => a.client)).toEqual([]);
    }
    // La navegación interna del portal (Navbar → /lore) sigue siendo en cliente.
    expect(anchors(pages[0]).some((a) => a.client && a.href === '/es/lore')).toBe(true);
  });
});

describe('landmarks de la home', () => {
  it.each(['es', 'en'] as const)('el <footer> (%s) es hermano de <main>, no descendiente', async (locale) => {
    const html = await renderHome(locale);
    expect(html.match(/<main\b/g)).toHaveLength(1);
    expect(html.match(/<footer\b/g)).toHaveLength(1);
    expect(html.indexOf('<footer')).toBeGreaterThan(html.indexOf('</main>'));
    // El pie sigue dentro del contenedor .home, que es quien le da el sistema visual.
    expect(html.indexOf('<footer')).toBeLessThan(html.lastIndexOf('</div>'));
    expect(html).toMatch(/<\/main><footer class="footer">/);
  });
});
