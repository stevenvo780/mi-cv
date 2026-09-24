export default function SectionHead({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead: string }) {
  return (
    <header className="sec-head reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`}>{title}</h2>
      <p className="lead">{lead}</p>
    </header>
  );
}
