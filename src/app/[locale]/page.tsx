'use client';
import Script from 'next/script';
import PortalShell from '@/app/components/Frentes/PortalShell';

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
            gtag('config', 'G-E5NMYWLXER', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <PortalShell />
    </>
  );
}
