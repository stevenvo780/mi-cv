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
