import type { HomeCopy } from '@/content/home';
import { buildProofFigures } from '@/content/proof';
import toolsEn from '@/locales/en/common/tools.json';
import toolsEs from '@/locales/es/common/tools.json';
import { TOOL_GROUPS } from '@/graph/relations';
import { nodeId } from '@/graph/sources';
import type { Locale } from '@/lib/site';
import SectionHead from './SectionHead';

export default function Proof({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const figures = buildProofFigures();
  const tools = (locale === 'es' ? toolsEs : toolsEn) as Record<string, string>;
  return (
    <section id="prueba" className="sec sec-proof" aria-labelledby="prueba-title" data-section="prueba">
      <div className="sec-inner">
        <SectionHead id="prueba" eyebrow={t.proof.eyebrow} title={t.proof.title} lead={t.proof.lead} />
        <dl className="figures">
          {figures.map((fig) => (
            <div key={fig.id} className="figure reveal">
              <dt>{fig.label[locale]}</dt>
              <dd>{fig.value[locale]}</dd>
            </div>
          ))}
        </dl>
        <h3 className="stack-title">{t.proof.stackTitle}</h3>
        <p className="stack-lead">{t.proof.stackLead}</p>
        <div className="stack">
          {Object.entries(TOOL_GROUPS).map(([gid, group]) => (
            <div key={gid} className="stack-group reveal" data-node={nodeId.grupo(gid)}>
              <h4>{group.label[locale]}</h4>
              <ul className="chips">
                {group.tools.map((tool) => (
                  <li key={tool} className="chip">
                    {tools[`tools.item.${tool}`]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
