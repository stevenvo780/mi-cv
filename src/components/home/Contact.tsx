import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import type { HomeCopy } from '@/content/home';
import { frenteOrder, frentesMeta } from '@/data/frentes';
import { PROFILES, type Locale } from '@/lib/site';
import SectionHead from './SectionHead';

export default function Contact({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const c = t.contact;
  const links: { href: string; label: string; primary?: boolean }[] = [
    { href: 'https://praxis.stevenvallejo.com', label: c.hire, primary: true },
    { href: 'mailto:stevenvallejo780@gmail.com', label: c.email },
    { href: 'https://wa.me/573046374368', label: c.whatsapp },
    { href: 'https://filosofo.stevenvallejo.com', label: c.cvPhilosopher },
    { href: 'https://informatico.stevenvallejo.com', label: c.cvEngineer },
    { href: 'https://schole.stevenvallejo.com', label: c.blog },
  ];
  return (
    <>
      <section id="contacto" className="sec sec-contact" aria-labelledby="contacto-title" data-section="contacto">
        <div className="sec-inner">
          <SectionHead id="contacto" eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
          <ul className="contact-list reveal">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={l.primary ? 'contact-primary' : undefined} rel="noopener">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href={`/${locale}/lore`}>{c.story}</Link>
            </li>
          </ul>
          <ul className="social" aria-label={c.social}>
            <li>
              <a href={PROFILES.github} rel="me noopener">GitHub</a>
            </li>
            <li>
              <a href={PROFILES.linkedin} rel="me noopener">LinkedIn</a>
            </li>
            <li>
              <a href={PROFILES.instagram} rel="me noopener">Instagram</a>
            </li>
          </ul>
        </div>
      </section>
      <footer className="footer">
        <p className="footer-brand">
          <BrandLogo size={22} /> <span>{c.foot}</span>
        </p>
        <nav aria-label={c.ecosystem}>
          <ul>
            {frenteOrder.map((fid) => (
              <li key={fid}>
                <Link href={`/${locale}/${fid}`}>{frentesMeta[fid].nombre[locale]}</Link>
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
    </>
  );
}
