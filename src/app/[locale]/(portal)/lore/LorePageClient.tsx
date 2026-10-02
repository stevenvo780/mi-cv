import BrandLogo from '@/app/components/BrandLogo';
import { PORTRAIT, type Locale } from '@/app/components/Portrait/portraitData';
import StoryScene from '@/components/history/StoryScene';
import styles from './LorePage.module.css';

const marks = [
  'M30 75L100 20L170 75L100 130Z M55 75L100 40L145 75L100 110Z M30 75H170M100 20V130',
  'M25 25H175V118H25Z M39 39H161V96H39Z M70 132H130M100 118V132 M44 87L72 56L99 76L135 46L156 63',
  'M20 115V55L100 18L180 55V115Z M45 115V71L100 42L155 71V115 M70 115V86L100 69L130 86V115',
  'M28 75C55 12 145 12 172 75C145 138 55 138 28 75Z M50 75C76 26 124 26 150 75C124 124 76 124 50 75Z M28 75H172',
  'M100 18L180 126H20Z M100 52L154 126M100 52L46 126M60 72H140M40 99H160 M100 18V126',
  'M100 12V138M37 75H163 M100 24L152 75L100 126L48 75Z M100 48L127 75L100 102L73 75Z',
  'M100 20L153 42L175 95L122 132L63 118L25 65L100 20Z M100 75L100 20M100 75L153 42M100 75L175 95M100 75L122 132M100 75L63 118M100 75L25 65',
];

function ChapterMark({ index }: { index: number }) {
  return (
    <svg className={styles.mark} viewBox="0 0 200 150" fill="none" aria-hidden="true" focusable="false">
      <circle cx="100" cy="75" r="64" stroke="#43b5a6" strokeOpacity=".2" strokeDasharray="2 7" />
      <path d={marks[index]} stroke={index % 2 ? '#e0a85e' : '#43b5a6'} strokeWidth="1" strokeOpacity=".7" />
      <circle cx="100" cy="75" r="3" fill="#e8e0d4" />
    </svg>
  );
}

/** Relato completo en el HTML inicial: sin reveal que esconda párrafos ni una dependencia de scroll. */
export default function LorePageClient({ locale }: { locale: Locale }) {
  const story = PORTRAIT[locale];
  const es = locale === 'es';
  const home = `/${locale}`;
  return (
    <main className={styles.lore}>
      <header className={styles.hero}>
        <div className={styles.toolbar}>
          <a href={home} className={styles.back}>← {es ? 'Volver al inicio' : 'Back to home'}</a>
          <label className={styles.motion}>
            <input type="checkbox" />
            <span>{es ? 'Pausar animación' : 'Pause animation'}</span>
          </label>
        </div>
        <div className={styles.scene}><StoryScene id="lore" /></div>
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>{es ? 'Mi historia' : 'My story'} / {story.heroKicker}</p>
          <h1 className={styles.title}>{story.heroTitle}</h1>
          <p className={styles.lead}>{story.heroLead}</p>
          <a href="#capitulos" className={styles.start}>
            {es ? 'Recorrer los capítulos' : 'Explore the chapters'} <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className={styles.axis} aria-hidden="true">
          <span>{es ? 'Ingeniería' : 'Engineering'}</span><span>{es ? 'Filosofía' : 'Philosophy'}</span>
        </div>
      </header>

      <div className={styles.prologue}>
        <div className={styles.signature}><BrandLogo size={36} /><p>{story.bodyOfWork}</p></div>
        <blockquote>{story.epigraph}</blockquote>
      </div>

      <div id="capitulos" className={styles.reading}>
        <nav className={styles.index} aria-label={es ? 'Capítulos de mi historia' : 'Chapters of my story'}>
          <p className={styles.indexLabel}>{es ? 'El recorrido' : 'The journey'}</p>
          <ol>
            {story.sections.map((chapter, index) => (
              <li key={chapter.title}>
                <a href={`#capitulo-${index + 1}`}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <span>{chapter.title}</span>
                </a>
              </li>
            ))}
          </ol>
          <a href={`${home}#frentes`} className={styles.catalog}>{es ? 'Ver mis trabajos' : 'See my work'} ↗</a>
        </nav>

        <div className={styles.chapters}>
          {story.sections.map((chapter, index) => (
            <section id={`capitulo-${index + 1}`} aria-labelledby={`chapter-title-${index + 1}`} className={styles.chapter} key={chapter.title}>
              <header className={styles.chapterHeading}>
                <span className={styles.chapterNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <div><p className={styles.kicker}>{chapter.kicker}</p><h2 id={`chapter-title-${index + 1}`}>{chapter.title}</h2></div>
                <ChapterMark index={index} />
              </header>
              <div className={styles.paragraphs}>{chapter.body.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>
              <blockquote className={styles.question}>{chapter.question}</blockquote>
            </section>
          ))}
        </div>
      </div>

      <footer className={styles.foot}>
        <BrandLogo size={44} />
        <p className={styles.footNote}>{story.footNote}</p>
        <div className={styles.footLinks}>
          <a href={home}>← {es ? 'Volver al inicio' : 'Back to home'}</a>
          <a href={`${home}#frentes`}>{es ? 'Explorar mis trabajos' : 'Explore my work'} ↗</a>
          <a href={`${home}/compartir`}>{es ? 'Compartir con QR' : 'Share with QR'} ↗</a>
        </div>
        <p className={styles.credit}>{es ? 'Mouseîon · por Steven Vallejo' : 'Mouseîon · by Steven Vallejo'}</p>
      </footer>
    </main>
  );
}
