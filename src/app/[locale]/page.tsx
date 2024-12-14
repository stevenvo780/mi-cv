'use client';
import Header from '@/app/components/Header';
import Tools from '@/app/components/Tools';
import Portfolio from '@/app/components/Portafolio';
import Skills from '@/app/components/Skills';
import Achievements from '@/app/components/Achievements';
import ContactMe from '@/app/components/ContactMe';
import Script from 'next/script';

export default function Home() {
  return (
    <>
      {/* Google Analytics Script */}
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
      <Header />
      <main>
        <section>
          <Achievements />
        </section>
        <section>
          <Portfolio />
        </section>
        <section>
          <Tools />
        </section>
        <section>
          <Skills />
        </section>
        <section>
          <ContactMe />
        </section>
      </main>
    </>
  );
}
