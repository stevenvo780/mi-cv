import Header from './components/Header';
import Tools from './components/Tools';
import Portfolio from './components/Portafolio';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import ContactMe from './components/ContactMe';
import Script from 'next/script';

export default function Home() {
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
            gtag('config', 'G-E5NMYWLXER');
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
