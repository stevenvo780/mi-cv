import BrandLogo from '@/app/components/BrandLogo';
import type { HomeCopy } from '@/content/home';
import type { Locale } from '@/lib/site';

/**
 * Cierra el menú móvil (<details>) al elegir una sección, al tocar fuera y con Escape (que devuelve el foco al
 * botón si estaba dentro). Un <details> abierto sigue abierto tras navegar a un ancla y, como la barra es fija,
 * se quedaba tapando la sección de destino. Script inline y delegado en document: no añade un chunk cliente al
 * presupuesto de JS de la home (spec §5.1) y la CSP ya admite 'unsafe-inline'. Es un módulo, así que se ejecuta
 * diferido, tras el análisis del documento, sin bloquear el parser.
 */
const MENU_SCRIPT = `(()=>{const d=document,q='.home details.menu[open]';d.addEventListener('click',e=>{const m=d.querySelector(q),t=e.target;if(m&&t instanceof Element&&(t.closest('.home .menu a')||!m.contains(t)))m.open=false});d.addEventListener('keydown',e=>{const m=d.querySelector(q);if(e.key!=='Escape'||!m)return;const f=m.contains(d.activeElement);m.open=false;if(f)m.querySelector('summary').focus()})})()`;

export default function HomeHeader({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const other: Locale = locale === 'es' ? 'en' : 'es';
  const items: [string, string][] = [
    ['#metodo', t.nav.method],
    ['#trayectoria', t.nav.path],
    ['#frentes', t.nav.fronts],
    ['#prueba', t.nav.proof],
    ['#contacto', t.nav.contact],
  ];
  const list = (
    <ul>
      {items.map(([href, label]) => (
        <li key={href}>
          <a href={href}>{label}</a>
        </li>
      ))}
    </ul>
  );
  return (
    <header className="topbar">
      {/* <a> y no next/link, también dentro de la home: el módulo cliente de next/link no cabe en el
          presupuesto de JS de la home (spec §5). Ver tests/components/route-groups.test.ts. */}
      <a href={`/${locale}`} className="brand" aria-label="Mouseîon · Steven Vallejo Ortiz">
        <BrandLogo size={28} />
        <span className="brand-word">Mouseîon</span>
      </a>
      <nav className="topnav" aria-label={t.nav.menu}>
        {list}
      </nav>
      <div className="topbar-actions">
        <a href={`/${other}`} hrefLang={other} lang={other} className="lang">
          {t.nav.language}
        </a>
        <a className="btn btn-solid btn-sm" href="https://praxis.stevenvallejo.com" rel="noopener">
          {t.nav.hire}
        </a>
        {/* Índice por debajo de 900 px, donde .topnav no se muestra: también es un landmark de navegación. */}
        <nav className="menu-nav" aria-label={t.nav.menu}>
          <details className="menu">
            <summary>{t.nav.menu}</summary>
            {list}
          </details>
        </nav>
      </div>
      {/* type="module": un script inline clásico bloquea el parser hasta que llega el CSS, y Chrome pintaba antes
          la barra sola, lo que adelantaba la descarga de dos fuentes al simulador del LCP (spec §5.2). */}
      <script type="module" dangerouslySetInnerHTML={{ __html: MENU_SCRIPT }} />
    </header>
  );
}
