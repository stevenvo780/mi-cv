import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import StoryScene from '@/components/history/StoryScene';
import type { HomeCopy } from '@/content/home';
import type { Locale } from '@/lib/site';
import styles from './History.module.css';

/** Una puerta visible al relato completo, conservado en PORTRAIT. SVG y texto salen del servidor. */
export default function History({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const story = PORTRAIT[locale];
  const copy = t.history;
  const chapters = [0, 3, 5];
  return (
    <section id="historia" data-section="historia" aria-labelledby="history-title" className={styles.history}>
      <div className={styles.canvas}>
        <StoryScene id="home" compact />
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>{t.nav.story} <span aria-hidden="true">/</span> {copy.eyebrow}</p>
        <h2 id="history-title" className={styles.title}>{story.heroTitle}</h2>
        <p className={styles.lead}>{story.heroLead}</p>
        <a href={`/${locale}/lore`} className={styles.read}>
          {copy.read} <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className={styles.axis} aria-hidden="true">
        <span>{copy.engineering}</span><span>{copy.philosophy}</span>
      </div>
      <label className={styles.motion}>
        <input type="checkbox" />
        <span>{copy.pause}</span>
      </label>
      <div className={styles.bottom}>
        <blockquote className={styles.quote}>{story.epigraph}</blockquote>
        <nav className={styles.chapters} aria-label={copy.chapters}>
          {chapters.map((index) => (
            <a key={index} href={`/${locale}/lore#capitulo-${index + 1}`}>
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span>{story.sections[index].kicker}</span>
              <span className={styles.arrow} aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
