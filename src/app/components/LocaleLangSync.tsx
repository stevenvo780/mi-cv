'use client';
import { useEffect } from 'react';

/**
 * Keeps <html lang> in sync with the active locale. The root layout renders a
 * static lang="en" (so error pages always have a valid root <html>); this client
 * effect updates it to the locale-specific value (e.g. "es-ES") after mount,
 * without forcing the root <html> to be locale-dynamic.
 */
export default function LocaleLangSync({ lang }: { lang: string }) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);
  return null;
}
