import type { HomeCopy } from '@/content/home';
import { GRAPH_STATS } from '@/graph/generated/stats';

/** Sitios hermanos que abre el hero: servicios y los dos CV, cada uno en su propio subdominio. */
const SITES = {
  services: 'https://praxis.stevenvallejo.com',
  cvEngineer: 'https://informatico.stevenvallejo.com',
  cvPhilosopher: 'https://filosofo.stevenvallejo.com',
} as const;

export default function Hero({ t }: { t: HomeCopy }) {
  const h = t.hero;
  return (
    <section className="hero" aria-labelledby="hero-title" data-section="hero">
      <p className="hero-kicker">{h.kicker}</p>
      <h1 id="hero-title" className="hero-title">
        <span className="hero-first">{h.first}</span> <span className="hero-last">{h.last}</span>
      </h1>
      <div className="hero-meta">
        <p className="hero-role">{h.role}</p>
        <p className="hero-lead">{h.lead}</p>
        <div className="hero-actions">
          {(['services', 'cvEngineer', 'cvPhilosopher'] as const).map((key) => (
            <a key={key} className={key === 'services' ? 'btn btn-solid' : 'btn btn-ghost'} href={SITES[key]} rel="noopener">
              {h[key]}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <p className="hero-caption">
          {h.figcaption(GRAPH_STATS.nodes, GRAPH_STATS.edges)} · <a href="#frentes">{h.listLink}</a>
        </p>
      </div>
    </section>
  );
}
