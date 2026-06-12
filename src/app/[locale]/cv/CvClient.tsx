'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faArrowLeft, faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { CV, CONTACT, DOWNLOADS, type Locale } from './cvData';
import styles from './cv.module.css';

type Profile = 'tech' | 'philo';

export default function CvClient({ locale }: { locale: Locale }) {
  const t = CV[locale];
  const dl = DOWNLOADS[locale];
  const [profile, setProfile] = useState<Profile>('tech');

  const tech = t.tech;
  const philo = t.philo;

  return (
    <div className={styles.wrap}>
      <Link href={`/${locale}`} className={styles.back}>
        <FontAwesomeIcon icon={faArrowLeft} />
        {t.backHome}
      </Link>

      {/* ---------------- HEADER ---------------- */}
      <header className={styles.head}>
        <h1 className={styles.name}>Steven Vallejo Ortiz</h1>
        <div className={styles.role}>{profile === 'tech' ? tech.role : philo.role}</div>
        <div className={styles.location}>{profile === 'tech' ? tech.location : philo.location}</div>
        <p className={styles.lead}>{t.pageLead}</p>
        <div className={styles.contactRow}>
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <span>{CONTACT.phone}</span>
          <a href={CONTACT.githubUrl} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faGithub} /> {CONTACT.github}
          </a>
          <a href={CONTACT.linkedinUrl} target="_blank" rel="noopener noreferrer">
            <FontAwesomeIcon icon={faLinkedin} /> {CONTACT.linkedin}
          </a>
          <a href={CONTACT.blogUrl} target="_blank" rel="noopener noreferrer">
            {CONTACT.blog}
          </a>
        </div>
      </header>

      {/* ---------------- TABS ---------------- */}
      <div className={styles.tabs} role="tablist" aria-label="CV profile">
        <button
          type="button"
          role="tab"
          aria-selected={profile === 'tech'}
          className={`${styles.tab} ${profile === 'tech' ? styles.tabActive : ''}`}
          onClick={() => setProfile('tech')}
        >
          {t.tabTech}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={profile === 'philo'}
          className={`${styles.tab} ${profile === 'philo' ? styles.tabActive : ''}`}
          onClick={() => setProfile('philo')}
        >
          {t.tabPhilo}
        </button>
      </div>

      {/* ---------------- DOWNLOADS ---------------- */}
      <section className={styles.downloads} aria-label={t.downloadsTitle}>
        <div className={styles.dlTitle}>{t.downloadsTitle}</div>
        <div className={styles.dlGrid}>
          <div>
            <div className={styles.dlGroupLabel}>{t.tabTech}</div>
            <div className={styles.dlButtons}>
              {dl.tech.map((d) => (
                <a
                  key={d.href}
                  href={d.href}
                  download
                  className={`${styles.dlBtn} ${d.ats ? styles.dlBtnAts : ''}`}
                >
                  <FontAwesomeIcon icon={faDownload} />
                  {d.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <div className={styles.dlGroupLabel}>{t.tabPhilo}</div>
            <div className={styles.dlButtons}>
              {dl.philo.map((d) => (
                <a key={d.href} href={d.href} download className={styles.dlBtn}>
                  <FontAwesomeIcon icon={faDownload} />
                  {d.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className={styles.atsNote}>{t.atsNote}</p>
      </section>

      {/* ---------------- BODY ---------------- */}
      {profile === 'tech' ? (
        <div className={styles.body}>
          <main>
            <section className={styles.section}>
              <div className={styles.sTitle}>
                <span className={styles.dot} />
                {tech.profileTitle}
              </div>
              <p className={styles.profileText}>{tech.profile}</p>
            </section>

            <section className={styles.section}>
              <div className={styles.sTitle}>
                <span className={styles.dot} />
                {tech.expTitle}
              </div>
              {tech.jobs.map((j) => (
                <div className={styles.item} key={j.org + j.dates}>
                  <div className={styles.itemHead}>
                    <div className={styles.itemTitle}>
                      {j.org} <span className={styles.at}>· {j.role}</span>{' '}
                      <span className={styles.itemBond}>· {j.bond}</span>
                    </div>
                    <div className={styles.itemDates}>{j.dates}</div>
                  </div>
                  <p className={styles.itemDesc}>{j.desc}</p>
                </div>
              ))}
              <p className={styles.prev}>{tech.prev}</p>
            </section>

            <section className={styles.section}>
              <div className={styles.sTitle}>
                <span className={styles.dot} />
                {tech.projTitle}
              </div>
              {tech.projects.map((p) => (
                <div className={styles.item} key={p.name}>
                  <div className={styles.itemTitle}>
                    {p.name}
                    {p.url && (
                      <a className={styles.projLink} href={p.url} target="_blank" rel="noopener noreferrer">
                        {p.url.replace('https://', '')} <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                      </a>
                    )}
                  </div>
                  <p className={styles.itemDesc}>{p.desc}</p>
                </div>
              ))}
            </section>
          </main>

          <aside className={styles.aside}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>{tech.stackTitle}</div>
              {tech.stack.map((s) => (
                <div className={styles.skill} key={s.label}>
                  <b>{s.label}</b>
                  <small>{s.items}</small>
                </div>
              ))}
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>{tech.eduTitle}</div>
              {tech.education.map((e) => (
                <div className={styles.eduItem} key={e.title}>
                  <b>{e.title}</b>
                  <span>{e.meta}</span>
                </div>
              ))}
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>{tech.langTitle}</div>
              {tech.languages.map((l) => (
                <div className={styles.lang} key={l.name}>
                  <span style={{ color: 'var(--text)' }}>{l.name}</span>
                  <span>{l.level}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      ) : (
        <div className={styles.body}>
          <main>
            <section className={styles.section}>
              <div className={styles.sTitle}>
                <span className={styles.dot} />
                {philo.profileTitle}
              </div>
              <p className={styles.profileText}>{philo.profile}</p>
            </section>

            <section className={styles.section}>
              <div className={styles.sTitle}>
                <span className={styles.dot} />
                {philo.areasTitle}
              </div>
              {philo.areas.map((a) => (
                <div className={styles.item} key={a.title}>
                  <div className={styles.itemTitle}>{a.title}</div>
                  <p className={styles.itemDesc}>{a.desc}</p>
                </div>
              ))}
            </section>

            <section className={styles.section}>
              <div className={styles.sTitle}>
                <span className={styles.dot} />
                {philo.projTitle}
              </div>
              <div className={styles.item}>
                <div className={styles.itemTitle}>{philo.flagship.name}</div>
                <p className={styles.itemDesc}>{philo.flagship.desc}</p>
              </div>
            </section>
          </main>

          <aside className={styles.aside}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>{philo.writeTitle}</div>
              <p className={styles.writing}>{philo.writing}</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>{tech.langTitle}</div>
              {tech.languages.map((l) => (
                <div className={styles.lang} key={l.name}>
                  <span style={{ color: 'var(--text)' }}>{l.name}</span>
                  <span>{l.level}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
