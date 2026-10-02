import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import StoryScene from '@/components/history/StoryScene';
import type { HomeCopy } from '@/content/home';
import { catalogos } from '@/data/frentes';
import { getShareDestinations } from '@/lib/shareLinks';
import { SITE, SOCIAL_LINKS, type Locale } from '@/lib/site';
import './History.css';

/** Método e índice: conserva el ancla histórica y abre todas las rutas públicas sin JavaScript. */
export default function History({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const copy = t.history;
  const destinations = getShareDestinations(locale);
  const sites = destinations.filter((site) => site.group === 'main' && !['cv', 'lore'].includes(site.id));
  const fields = destinations.filter((site) => site.group === 'fronts');
  const localHref = (url: string) => url.startsWith(`${SITE}/`) ? url.slice(SITE.length) : url;
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
        <p className="history-index-label">{copy.fields}</p>
        <ul className="history-fields">
          {fields.map((field) => {
            const front = field.id.replace('front-', '');
            const catalog = catalogos.find((item) => item.frente === front);
            return (
              <li key={field.id}>
                <a className="history-field" href={localHref(field.url)}>
                  <span>{field.label}</span><span aria-hidden="true">↗</span>
                </a>
                {catalog?.url && (
                  <a className="history-catalog" href={catalog.url} rel="noopener">
                    {catalog.nombre}<span aria-hidden="true">↗</span>
                  </a>
                )}
              </li>
            );
          })}
        </ul>
        <div className="history-utilities">
          <a href={`/${locale}/lore`}>{copy.read}<span aria-hidden="true">↗</span></a>
          <a href={`/${locale}/compartir`}>{copy.share}<span aria-hidden="true">↗</span></a>
        </div>
      </nav>
      <div className="history-social">
        <p className="history-index-label">{t.contact.social}</p>
        <ul aria-label={t.contact.social}>
          {SOCIAL_LINKS.map((profile) => (
            <li key={profile.id}>
              <a href={profile.url} rel="me noopener">{profile.label}<span aria-hidden="true">↗</span></a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
