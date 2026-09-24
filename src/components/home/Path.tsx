import type { HomeCopy } from '@/content/home';
import { buildTimeline } from '@/content/timeline';
import type { Locale } from '@/lib/site';
import SectionHead from './SectionHead';

export default function Path({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const entries = buildTimeline();
  return (
    <section id="trayectoria" className="sec sec-path" aria-labelledby="trayectoria-title" data-section="trayectoria">
      <div className="sec-inner path-layout">
        <div className="path-head">
          <SectionHead id="trayectoria" eyebrow={t.path.eyebrow} title={t.path.title} lead={t.path.lead} />
        </div>
        <ol className="timeline">
          {entries.map((e) => (
            <li key={e.key} className="timeline-item reveal" data-node={e.nodeId}>
              <p className="timeline-dates">
                <time dateTime={e.start}>{e.dates[locale]}</time>
              </p>
              <div className="timeline-body panel">
                <h3>{e.company[locale]}</h3>
                <p className="timeline-role">{e.role[locale]}</p>
                {e.location ? <p className="timeline-place">{e.location[locale]}</p> : null}
                {e.achievements.map((a) => (
                  <p key={a.es.slice(0, 32)} className="timeline-note">
                    {a[locale]}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
