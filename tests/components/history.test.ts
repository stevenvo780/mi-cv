import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/[locale]/(home)/page';
import LorePageClient from '@/app/[locale]/(portal)/lore/LorePageClient';
import { PORTRAIT } from '@/app/components/Portrait/portraitData';
import StoryScene from '@/components/history/StoryScene';

describe('historia visible y relato preservado', () => {
  it.each(['es', 'en'] as const)('/%s vuelve a presentar la historia y enlaza al relato completo', async (locale) => {
    const html = renderToStaticMarkup(await HomePage({ params: Promise.resolve({ locale }) }));
    const section = html.match(/<section id="historia"[\s\S]*?<\/section>/)?.[0] ?? '';
    expect(section).toContain(PORTRAIT[locale].heroTitle);
    expect(section).toContain(PORTRAIT[locale].heroLead);
    expect(section).toContain(`href="/${locale}/lore"`);
    expect(html).toContain('href="#historia"');
    expect(html.indexOf('id="historia"')).toBeLessThan(html.indexOf('id="frentes"'));
    expect([...html.matchAll(/<h1\b/g)]).toHaveLength(1);
  });

  it.each(['es', 'en'] as const)('/%s/lore conserva todas las palabras y los capítulos accesibles', (locale) => {
    const story = PORTRAIT[locale];
    const html = renderToStaticMarkup(createElement(LorePageClient, { locale }));
    // Decodifica entidades del HTML, sin modificar el relato original (incluidas sus comillas).
    const plain = html.replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
    for (const text of [story.heroTitle, story.heroLead, story.bodyOfWork, story.epigraph,
      ...story.sections.flatMap((chapter) => [chapter.title, ...chapter.body, chapter.question])]) {
      expect(plain).toContain(text);
    }
    for (let index = 1; index <= story.sections.length; index++) {
      expect(html).toContain(`id="capitulo-${index}"`);
      expect(html).toContain(`href="#capitulo-${index}"`);
    }
    expect([...html.matchAll(/<h1\b/g)]).toHaveLength(1);
  });

  it('dos escenas en un documento tienen referencias SVG propias y son decorativas', () => {
    const html = ['portada', 'relato'].map((id) => renderToStaticMarkup(createElement(StoryScene, { id }))).join('');
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const [, reference] of html.matchAll(/url\(#([^)]*)\)/g)) expect(ids).toContain(reference);
    expect([...html.matchAll(/aria-hidden="true"/g)]).toHaveLength(2);
    expect(html).not.toMatch(/<script\b|<canvas\b/);
  });
});
