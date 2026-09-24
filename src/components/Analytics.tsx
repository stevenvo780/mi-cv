'use client';

import { useEffect } from 'react';

const GA_ID = 'G-E5NMYWLXER';
const EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA solo con la primera interacción: así no suma TBT en la carga ni en Lighthouse. */
export default function Analytics() {
  useEffect(() => {
    const load = () => {
      EVENTS.forEach((e) => window.removeEventListener(e, load));
      if (window.gtag) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // gtag exige el objeto `arguments`, no un array
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { page_path: window.location.pathname });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    };
    EVENTS.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    return () => EVENTS.forEach((e) => window.removeEventListener(e, load));
  }, []);
  return null;
}
