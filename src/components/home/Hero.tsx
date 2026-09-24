import type { HomeCopy } from '@/content/home';
import { GRAPH_STATS } from '@/graph/generated/stats';
import type { Locale } from '@/lib/site';

export default function Hero({ locale, t }: { locale: Locale; t: HomeCopy }) {
  return (
    <section className="hero" aria-labelledby="hero-title" data-section="hero">
      <p className="hero-kicker">{t.hero.kicker}</p>
      <h1 id="hero-title" className="hero-title">
        <span className="hero-first">{t.hero.first}</span> <span className="hero-last">{t.hero.last}</span>
      </h1>
      <div className="hero-meta">
        <p className="hero-role">{t.hero.role}</p>
        <p className="hero-lead">{t.hero.lead}</p>
        <div className="hero-actions">
          <a className="btn btn-solid" href="https://praxis.stevenvallejo.com" rel="noopener">
            {t.hero.ctaHire}
          </a>
          {/* <a> y no next/link: /lore es del grupo (portal); ver la nota de page.tsx. */}
          <a className="btn btn-ghost" href={`/${locale}/lore`}>
            {t.hero.ctaStory}
          </a>
        </div>
        <p className="hero-caption">
          {t.hero.figcaption(GRAPH_STATS.nodes, GRAPH_STATS.edges)} · <a href="#frentes">{t.hero.listLink}</a>
        </p>
      </div>
    </section>
  );
}
