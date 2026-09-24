import type { HomeCopy } from '@/content/home';
import { PROFILES, type Locale } from '@/lib/site';
import SectionHead from './SectionHead';

export default function Contact({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const c = t.contact;
  const links: { href: string; label: string; primary?: boolean }[] = [
    { href: 'https://wa.me/573046374368', label: c.whatsapp, primary: true },
    { href: 'mailto:stevenvallejo780@gmail.com', label: c.email },
  ];
  return (
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
        {/* <a> y no next/link: /lore es del grupo (portal); ver la nota de page.tsx. */}
        <p className="contact-story">
          <a href={`/${locale}/lore`}>{c.story} →</a>
        </p>
      </div>
    </section>
  );
}
