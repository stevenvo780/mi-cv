'use client';

import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faFilePdf } from '@fortawesome/free-solid-svg-icons';
import { PORTRAIT, type Locale } from './portraitData';
import styles from './portrait.module.css';

const GameOfLife = dynamic(() => import('../Matematica/GameOfLife'), { ssr: false });

export default function Portrait() {
  const params = useParams();
  const locale: Locale = params.locale === 'es' ? 'es' : 'en';
  const t = PORTRAIT[locale];

  return (
    <article>
      {/* HERO with subtle generative background */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            opacity: 0.18,
            pointerEvents: 'none',
            overflow: 'hidden', // clip the wide Game-of-Life grid (no h-scroll)
          }}
        >
          <GameOfLife />
        </div>
        <div className={styles.wrap} style={{ position: 'relative', zIndex: 1 }}>
          <div className={styles.hero}>
            <div className={styles.heroKicker}>{t.heroKicker}</div>
            <h1 className={styles.heroTitle}>
              <em>{t.heroTitle}</em>
            </h1>
            <p className={styles.heroLead}>{t.heroLead}</p>
            <p className={styles.bodyOfWork}>{t.bodyOfWork}</p>
            <p className={styles.epigraph}>{t.epigraph}</p>
            <div className={styles.heroCtas}>
              <a href="https://informatico.stevenvallejo.com" target="_blank" rel="noopener noreferrer" className={styles.ctaPrimary}>
                <FontAwesomeIcon icon={faFilePdf} />
                {t.cvCta}
              </a>
              <a
                href="https://blog.stevenvallejo.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaGhost}
              >
                {t.blogCta}
              </a>
              <a
                href="https://services.stevenvallejo.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaGhost}
              >
                {t.servicesCta}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* NARRATIVE SECTIONS */}
      <div className={styles.wrap}>
        {t.sections.map((s) => (
          <section className={styles.section} key={s.title}>
            <div className={styles.sectionGrid}>
              <div className={styles.kicker}>{s.kicker}</div>
              <div>
                <h2 className={styles.sectionTitle}>{s.title}</h2>
                {s.body.map((p, i) => (
                  <p className={styles.para} key={i}>
                    {p}
                  </p>
                ))}
                <p className={styles.question}>{s.question}</p>
              </div>
            </div>
          </section>
        ))}

        {/* BLOG */}
        <section className={styles.blog}>
          <div className={styles.blogCard}>
            <h2 className={styles.blogTitle}>{t.blogTitle}</h2>
            <p className={styles.blogLead}>{t.blogLead}</p>
            <a
              href="https://blog.stevenvallejo.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaPrimary}
            >
              {t.blogCta}
              <FontAwesomeIcon icon={faArrowRight} />
            </a>
          </div>
        </section>

        <footer className={styles.foot}>
          <p className={styles.footNote}>{t.footNote}</p>
          <p className={styles.footBrand}>
            {locale === 'es' ? 'Mouseîon · por Steven Vallejo' : 'Mouseîon · by Steven Vallejo'}
          </p>
        </footer>
      </div>
    </article>
  );
}
