import BrandLogo from '@/app/components/BrandLogo';
import type { HomeCopy } from '@/content/home';
import { SITES, WHATSAPP_URL } from '@/lib/ecosystem';
import type { Locale } from '@/lib/site';

/**
 * Cierra el menú móvil (<details>) al elegir una sección o el asistente, al tocar fuera y con Escape (que devuelve el
 * foco al botón si estaba dentro). Un <details> abierto sigue abierto tras navegar a un ancla y, como la barra es fija,
 * se quedaba tapando la sección de destino. Script inline y delegado en document: no añade un chunk cliente al
 * presupuesto de JS de la home (spec §5.1) y la CSP ya admite 'unsafe-inline'. Es un módulo, así que se ejecuta
 * diferido, tras el análisis del documento, sin bloquear el parser.
 */
const MENU_SCRIPT = `(()=>{const d=document,q='.home details.menu[open]';d.addEventListener('click',e=>{const m=d.querySelector(q),t=e.target;if(m&&t instanceof Element&&(t.closest('.home .menu a,.home .menu [data-ask]')||!m.contains(t)))m.open=false});d.addEventListener('keydown',e=>{const m=d.querySelector(q);if(e.key!=='Escape'||!m)return;const f=m.contains(d.activeElement);m.open=false;if(f)m.querySelector('summary').focus()})})()`;

type Item = [href: string, label: React.ReactNode];

/**
 * «Blog · Scholḗ» con el nombre griego en su caja: ni JetBrains Mono ni la mono del sistema traen «Ḗ», y en versalitas
 * se pintaba como «Ē» más un acento suelto. El nombre va en minúsculas y en la sans (su «ḗ» sí se compone bien).
 */
function keepGreek(label: string): React.ReactNode {
  const [head, name] = label.split(' · ');
  return name ? (
    <>
      {head} · <span className="keep-case">{name}</span>
    </>
  ) : (
    label
  );
}

const list = (items: Item[], label?: string) => (
  <ul aria-label={label}>
    {items.map(([href, label]) => (
      <li key={href}>
        <a href={href} rel={href.startsWith('#') ? undefined : 'noopener'}>
          {label}
        </a>
      </li>
    ))}
  </ul>
);

/**
 * Barra fija de la home: los sitios hermanos (los dos CV y el blog), las secciones, el idioma, el asistente, WhatsApp
 * y Servicios. Por debajo de 1280 px, sitios y secciones pasan al menú <details>; WhatsApp sigue visible como icono.
 * Los botones [data-ask] abren el asistente: los escucha AssistantGate, que importa el panel con el primer clic.
 */
export default function HomeHeader({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const other: Locale = locale === 'es' ? 'en' : 'es';
  const { nav, hero } = t;
  const sites: Item[] = [
    [SITES.cvEngineer, hero.cvEngineer],
    [SITES.cvPhilosopher, hero.cvPhilosopher],
    [SITES.blog, keepGreek(hero.blog)],
  ];
  const sections: Item[] = [
    ['#frentes', nav.catalog],
    ['#contacto', nav.contact],
  ];
  return (
    <header className="topbar">
      {/* <a> y no next/link, también dentro de la home: el módulo cliente de next/link no cabe en el
          presupuesto de JS de la home (spec §5). Ver tests/components/route-groups.test.ts. */}
      <a href={`/${locale}`} className="brand" aria-label="Mouseîon · Steven Vallejo Ortiz">
        <BrandLogo size={28} />
        <span className="brand-word">Mouseîon</span>
      </a>
      <nav className="topnav" aria-label={nav.menu}>
        {list([...sites, ...sections])}
      </nav>
      <div className="topbar-actions">
        <a href={`/${other}`} hrefLang={other} lang={other} className="lang">
          {nav.language}
        </a>
        {/* En el móvil queda solo el anillo con la chispa: la etiqueta pasa a ser solo para lectores de pantalla. */}
        <button type="button" className="ask" data-ask aria-haspopup="dialog">
          <span className="ask-label">{nav.ask}</span>
        </button>
        <a className="wa" href={WHATSAPP_URL} rel="noopener" title={nav.whatsapp}>
          <span className="sr-only">{nav.whatsapp}</span>
        </a>
        <a className="btn btn-solid btn-sm" href={SITES.services} rel="noopener">
          {nav.services}
          <span aria-hidden="true">↗</span>
        </a>
        {/* Índice por debajo de 1280 px, donde .topnav no se muestra: también es un landmark de navegación. */}
        <nav className="menu-nav" aria-label={nav.menu}>
          <details className="menu">
            <summary>{nav.menu}</summary>
            <div className="menu-panel">
              <button type="button" className="menu-ask" data-ask aria-haspopup="dialog">
                <span className="menu-ask-title">{nav.ask}</span>
                <span className="menu-ask-hint">{nav.askHint}</span>
              </button>
              {list([...sites, [SITES.services, nav.services]], nav.sites)}
              {list(sections)}
            </div>
          </details>
        </nav>
      </div>
      {/* type="module": un script inline clásico bloquea el parser hasta que llega el CSS, y Chrome pintaba antes
          la barra sola, lo que adelantaba la descarga de dos fuentes al simulador del LCP (spec §5.2). */}
      <script type="module" dangerouslySetInnerHTML={{ __html: MENU_SCRIPT }} />
    </header>
  );
}
