import BrandLogo from '@/app/components/BrandLogo';
import type { HomeCopy } from '@/content/home';
import { frenteOrder, frentesMeta } from '@/data/frentes';
import type { Locale } from '@/lib/site';

/** Pie de la home. Va fuera de <main> para conservar el landmark contentinfo. */
export default function HomeFooter({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const c = t.contact;
  return (
    <footer className="footer">
      <p className="footer-brand">
        <BrandLogo size={22} /> <span>{c.foot}</span>
      </p>
      <a className="footer-share" href={`/${locale}/compartir`} title={locale === 'es' ? 'QR para mis sitios, CV, servicios, blog y catálogos' : 'QR codes for my sites, résumés, services, blog and catalogs'}>
        <svg aria-hidden="true" viewBox="0 0 20 20" width="17" height="17" fill="none">
          <path d="M2 2h6v6H2zM12 2h6v6h-6zM2 12h6v6H2z" stroke="currentColor" strokeWidth="1.4" />
          <path d="M4 4h2v2H4zM14 4h2v2h-2zM4 14h2v2H4zM12 12h2v2h-2zM16 12h2v2h-2zM12 16h2v2h-2zM16 16h2v2h-2z" fill="currentColor" />
        </svg>
        <span>{locale === 'es' ? 'Compartir con QR' : 'Share with QR'}</span>
      </a>
      <nav aria-label={c.ecosystem}>
        <ul>
          {frenteOrder.map((fid) => (
            <li key={fid}>
              {/* <a> y no next/link: los frentes son del grupo (portal); ver la nota de page.tsx. */}
              <a href={`/${locale}/${fid}`}>{frentesMeta[fid].nombre[locale]}</a>
            </li>
          ))}
          <li>
            <a href="https://praxis.stevenvallejo.com">Práxis</a>
          </li>
          <li>
            <a href="https://schole.stevenvallejo.com">Scholḗ</a>
          </li>
        </ul>
      </nav>
    </footer>
  );
}
