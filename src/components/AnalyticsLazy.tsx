'use client';

import { useEffect, useState, type ComponentType } from 'react';

/** Mantiene ambas mediciones activas; sus SDK se descargan después de la carga inicial de la página. */
export default function AnalyticsLazy() {
  const [Analytics, setAnalytics] = useState<ComponentType | null>(null);
  useEffect(() => {
    let mounted = true;
    const load = () => {
      import('./SiteAnalytics').then((module) => {
        if (mounted) setAnalytics(() => module.default);
      }, () => {});
    };
    if (document.readyState === 'complete') load();
    else window.addEventListener('load', load, { once: true });
    return () => {
      mounted = false;
      window.removeEventListener('load', load);
    };
  }, []);
  return Analytics && <Analytics />;
}
