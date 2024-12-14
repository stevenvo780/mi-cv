'use client';
import Header from '@/app/components/Header';
import Tools from '@/app/components/Tools';
import Portfolio from '@/app/components/Portafolio';
import Skills from '@/app/components/Skills';
import Achievements from '@/app/components/Achievements';
import ContactMe from '@/app/components/ContactMe';
import Script from 'next/script';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const toggleLocale = () => {
    const currentPath = window.location.pathname;
    const isSpanish = currentPath.startsWith('/es');
    const newPath = isSpanish ? currentPath.replace('/es', '/en') : currentPath.replace('/en', '/es');
    router.push(newPath);
  };

  const currentLocale = window.location.pathname.startsWith('/es') ? 'Es' : 'En';

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
      <button
        onClick={toggleLocale}
        className="btn btn-primary position-fixed d-flex align-items-center justify-content-center"
        style={{
          top: '10px',
          right: '0%',
          width: '50px',
          height: '30px',
          zIndex: 1000,
          borderRadius: '10px 0px 0px 10px',
          fontSize: '12px',
          padding: '0',
        }}
      >
        {currentLocale}
      </button>
    </>
  );
}
