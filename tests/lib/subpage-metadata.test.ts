import { describe, expect, it } from 'vitest';
import { generateMetadata as generateFrenteMetadata } from '@/app/[locale]/(portal)/[frente]/page';
import { generateMetadata as generateLoreMetadata } from '@/app/[locale]/(portal)/lore/page';
import { OG_LOCALE } from '@/lib/site';

describe('generateMetadata de subpáginas (spec §4.2: openGraph.locale y alternateLocale)', () => {
  it('[frente]/page.tsx declara locale y alternateLocale recíprocos', async () => {
    const es = await generateFrenteMetadata({ params: Promise.resolve({ locale: 'es', frente: 'filosofia' }) });
    expect(es.openGraph?.locale).toBe(OG_LOCALE.es);
    expect(es.openGraph?.alternateLocale).toBe(OG_LOCALE.en);

    const en = await generateFrenteMetadata({ params: Promise.resolve({ locale: 'en', frente: 'filosofia' }) });
    expect(en.openGraph?.locale).toBe(OG_LOCALE.en);
    expect(en.openGraph?.alternateLocale).toBe(OG_LOCALE.es);
  });

  it('lore/page.tsx declara locale y alternateLocale recíprocos', async () => {
    const es = await generateLoreMetadata({ params: Promise.resolve({ locale: 'es' }) });
    expect(es.openGraph?.locale).toBe(OG_LOCALE.es);
    expect(es.openGraph?.alternateLocale).toBe(OG_LOCALE.en);

    const en = await generateLoreMetadata({ params: Promise.resolve({ locale: 'en' }) });
    expect(en.openGraph?.locale).toBe(OG_LOCALE.en);
    expect(en.openGraph?.alternateLocale).toBe(OG_LOCALE.es);
  });
});
