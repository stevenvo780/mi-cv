import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import type { HomeCopy } from '@/content/home';
import type { Locale } from '@/lib/site';

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
      <Link href={`/${locale}`} className="brand" aria-label="Mouseîon · Steven Vallejo Ortiz">
        <BrandLogo size={28} />
        <span className="brand-word">Mouseîon</span>
      </Link>
      <nav className="topnav" aria-label={t.nav.menu}>
        {list}
      </nav>
      <div className="topbar-actions">
        <Link href={`/${other}`} hrefLang={other} lang={other} className="lang">
          {t.nav.language}
        </Link>
        <a className="btn btn-solid btn-sm" href="https://praxis.stevenvallejo.com" rel="noopener">
          {t.nav.hire}
        </a>
        <details className="menu">
          <summary>{t.nav.menu}</summary>
          {list}
        </details>
      </div>
    </header>
  );
}
