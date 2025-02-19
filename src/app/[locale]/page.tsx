'use client';
import { useEffect } from 'react';
import Header from '@/app/components/Header';
import Tools from '@/app/components/Tools';
import Portfolio from '@/app/components/Portafolio';
import Skills from '@/app/components/Skills';
import Achievements from '@/app/components/Achievements';
import ContactMe from '@/app/components/ContactMe';
import Script from 'next/script';
import Experience from '@/app/components/Experience';

export default function Home() {
  useEffect(() => {
    if (window.location.hash) {
      const sectionId = window.location.hash.slice(1);
      const target = document.getElementById(sectionId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-E5NMYWLXER`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E5NMYWLXER', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <section id="home">
        <Header />
      </section>
      <main>
        <section id="projects">
          <Achievements />
        </section>
        <section id="portfolio">
          <Portfolio />
        </section>
        <section id="tools">
          <Tools />
        </section>
        <section id="skills">
          <Skills />
        </section>
        <section id="experience">
          <Experience />
        </section>
        <section id="contact">
          <ContactMe />
        </section>
      </main>
    </>
  );
}
