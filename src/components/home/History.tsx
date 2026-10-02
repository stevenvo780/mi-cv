import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import StoryScene from '@/components/history/StoryScene';
import type { HomeCopy } from '@/content/home';
import { getShareDestinations } from '@/lib/shareLinks';
import { SOCIAL_LINKS, type Locale } from '@/lib/site';
import './History.css';

type SocialId = (typeof SOCIAL_LINKS)[number]['id'];

const HANDLES: Record<SocialId, string> = {
  instagram: '@stev_vallejo',
  facebook: 'Steven Vallejo Ortiz',
  tiktok: '@stevenvo780',
  x: '@stev_vallejo',
  github: '@stevenvo780',
  linkedin: 'steven-vallejo',
};

function SocialIcon({ network }: { network: SocialId }) {
  const glyphs = {
    instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.6" r="1" fill="currentColor" stroke="none" /></>,
    facebook: <path d="M14.3 21v-8h2.6l.5-3.2h-3.1V7.7c0-.9.3-1.5 1.6-1.5h1.7V3.3c-.8-.1-1.6-.2-2.4-.2-2.6 0-4.3 1.6-4.3 4.4v2.3H8.2V13h2.7v8Z" fill="currentColor" stroke="none" />,
    tiktok: <path d="M14 3h3c.3 2.6 1.8 4 4 4.3v3a9 9 0 0 1-4-1.2v7a6 6 0 1 1-5-5.9v3.1a3 3 0 1 0 2 2.8Z" fill="currentColor" stroke="none" />,
    x: <path d="m4 3 11.8 18H20L8.2 3Zm.2 18L20 3M6.4 5h.7l10.5 14h-.7Z" strokeWidth="1.5" />,
    github: <><path d="M8 19c-4 1-4-2-6-2m14 5v-3.3c0-1-.3-1.8-.9-2.3 3.1-.4 6.4-1.5 6.4-6.7A5.2 5.2 0 0 0 20 6c.2-.9.2-2-.4-3.2-1.2 0-2.6.6-3.5 1.2a13 13 0 0 0-7 0C8.2 3.4 6.8 2.8 5.6 2.8 5 4 5 5.1 5.2 6a5.2 5.2 0 0 0-1.5 3.7c0 5.2 3.3 6.3 6.4 6.7-.6.5-.9 1.3-.9 2.3V22" /><path d="M8 11h.01M16 11h.01" strokeWidth="2.5" /></>,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="2.5" /><circle cx="7.5" cy="7.2" r="1" fill="currentColor" stroke="none" /><path d="M7.5 10v7M11.5 17v-7m0 3a3 3 0 0 1 6 0v4" strokeWidth="2" /></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{glyphs[network]}</svg>;
}

/** Método, colaboración y redes: todos los destinos se renderizan en el servidor. */
export default function History({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const copy = t.history;
  const destinations = getShareDestinations(locale);
  const sites = destinations.filter((site) => site.group === 'main' && !['cv', 'lore'].includes(site.id));
  return (
    <section id="historia" data-section="historia" aria-labelledby="history-title" className="history-section">
      <div className="history-intro">
        <div className="history-canvas"><StoryScene id="home" compact /></div>
        <div className="history-content">
          <p className="history-eyebrow">{copy.eyebrow}</p>
          <h2 id="history-title" className="history-title">{PORTRAIT[locale].heroTitle}</h2>
          <p className="history-lead">{copy.lead}</p>
          <ul className="history-thinking">
            {copy.thinking.map((idea) => <li key={idea}>{idea}</li>)}
          </ul>
        </div>
        <label className="history-motion">
          <input type="checkbox" />
          <span>{copy.pause}</span>
        </label>
      </div>
      <nav className="history-directory" aria-label={copy.directory}>
        <p className="history-index-label">{copy.sites}</p>
        <ul className="history-sites">
          {sites.map((site) => (
            <li key={site.id}>
              <a className="history-site" href={site.url} rel="noopener">
                <span className="history-site-kind">{site.category}</span>
                <span className="history-site-title">{site.label}</span>
                <span className="history-site-description">{site.description}</span>
                <span className="history-arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav id="redes" className="history-social" aria-labelledby="history-social-title">
        <div className="history-social-heading">
          <div>
            <p className="history-index-label">{t.contact.social}</p>
            <h3 id="history-social-title">{copy.socialTitle}</h3>
          </div>
          <p className="history-social-lead">{copy.socialLead}</p>
        </div>
        <ul className="history-social-grid">
          {SOCIAL_LINKS.map((profile) => (
            <li key={profile.id} data-network={profile.id}>
              <a className="history-social-card" href={profile.url} rel="me noopener">
                <span className="history-social-top">
                  <span className="history-social-icon"><SocialIcon network={profile.id} /></span>
                  <span className="history-social-name">{profile.label}</span>
                  <span className="history-social-arrow" aria-hidden="true">↗</span>
                </span>
                <span className="history-social-handle">{HANDLES[profile.id]}</span>
                <span className="history-social-detail">{copy.socialDetails[profile.id]}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="history-utilities">
        <a href={`/${locale}/lore`}>{copy.read}<span aria-hidden="true">↗</span></a>
        <a href={`/${locale}/compartir`}>{copy.share}<span aria-hidden="true">↗</span></a>
      </div>
    </section>
  );
}
