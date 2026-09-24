import type { HomeCopy } from '@/content/home';
import SectionHead from './SectionHead';

export default function Method({ t }: { t: HomeCopy }) {
  const m = t.method;
  return (
    <section id="metodo" className="sec sec-method" aria-labelledby="metodo-title" data-section="metodo">
      <div className="sec-inner">
        <SectionHead id="metodo" eyebrow={m.eyebrow} title={m.title} lead={m.lead} />
        <div className="method-grid reveal">
          <p className="method-side method-logic" data-node="grupo:logica">
            {m.logic}
          </p>
          <div className="panel method-body">
            {m.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
          <p className="method-side method-eng" data-node="frente:informatica">
            {m.engineering}
          </p>
        </div>
        <blockquote className="method-epigraph panel reveal">
          <p>{m.epigraph}</p>
        </blockquote>
      </div>
    </section>
  );
}
