import { describe, expect, it } from 'vitest';
import { generateMetadata as generateFrenteMetadata } from '@/app/[locale]/(portal)/[frente]/page';
import { generateMetadata as generateLoreMetadata } from '@/app/[locale]/(portal)/lore/page';
import { generateMetadata as generateHomeMetadata } from '@/app/[locale]/(home)/page';
import { frenteOrder } from '@/data/frentes';
import { OG_IMAGE_ALT, OG_LOCALE } from '@/lib/site';

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

// Al compartir una subpágina, la tarjeta lleva el nombre y la imagen su texto alternativo (revisión final, M6).
describe('og:title, twitter:title y alt de la og:image', () => {
  const cases = [
    ...(['es', 'en'] as const).flatMap((locale) =>
      frenteOrder.map((frente) => [`/${locale}/${frente}`, () => generateFrenteMetadata({ params: Promise.resolve({ locale, frente }) })] as const),
    ),
    ...(['es', 'en'] as const).map((locale) => [`/${locale}/lore`, () => generateLoreMetadata({ params: Promise.resolve({ locale }) })] as const),
  ];

  it.each(cases)('%s: título con marca (≤ 60) sin tocar <title>', async (_, load) => {
    const m = await load();
    const short = m.title as string;
    expect(short).not.toContain('Steven');
    expect(m.openGraph?.title).toBe(`${short} · Steven Vallejo Ortiz`);
    expect((m.twitter as { title?: string } | null)?.title).toBe(`${short} · Steven Vallejo Ortiz`);
    expect(String(m.openGraph?.title).length).toBeLessThanOrEqual(60);
  });

  it.each(cases)('%s: og:image y twitter:image con alt', async (_, load) => {
    const m = await load();
    const [og] = m.openGraph?.images as { url: string; alt?: string }[];
    const [tw] = (m.twitter as { images?: { url: string; alt?: string }[] }).images!;
    expect(og.alt).toBe(OG_IMAGE_ALT);
    expect(tw).toEqual({ url: og.url, alt: OG_IMAGE_ALT });
  });

  it.each(['es', 'en'] as const)('home /%s: og:image con alt', async (locale) => {
    const m = await generateHomeMetadata({ params: Promise.resolve({ locale }) });
    const [og] = m.openGraph?.images as { alt?: string }[];
    expect(og.alt).toBe(OG_IMAGE_ALT);
  });
});
