import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import HomePage from '@/app/[locale]/(home)/page';
import { CAMERA0 } from '@/graph/camera0';
import { SECTIONS, SECTION_LAYOUT, SECTION_POSE, frameAt, type FrameContext } from '@/graph/scene/choreography';

/** Plano lejano de la cámara de GraphScene (`new PerspectiveCamera(fov, 1, 0.05, 60)`): el grafo (radio 1) cabe delante. */
const CAMERA_FAR = 60 - 1;

const ctx: FrameContext = {
  aspect: 1.6,
  clusterCenters: [
    [-0.5, 0.2, 0],
    [0.5, 0.3, -0.1],
    [0.3, -0.5, 0.3],
    [-0.2, -0.5, -0.4],
  ],
  helixSpan: [-0.8, 0.9],
};

describe('coreografía', () => {
  it('al inicio: forma red, sin mezcla y la pose del hero (= cámara del póster)', () => {
    const f = frameAt(0, ctx);
    expect(f.from).toBe('red');
    expect(f.to).toBe('clusters');
    expect(f.mix).toBe(0);
    expect(f.pose.distance).toBeCloseTo(SECTION_POSE.hero.distance);
    expect(f.pose.yaw).toBeCloseTo(SECTION_POSE.hero.yaw);
  });

  // La coreografía del 3D recorre SECTIONS: tiene que ser el orden real del DOM (hero, catálogo y contacto), sin las
  // secciones de CV que se quitaron (Método, Trayectoria, Prueba).
  it.each(['es', 'en'] as const)('/%s: las secciones de la home son las de la coreografía, en su orden', async (locale) => {
    const html = renderToStaticMarkup(await HomePage({ params: Promise.resolve({ locale }) }));
    expect([...html.matchAll(/data-section="([^"]+)"/g)].map((m) => m[1])).toEqual([...SECTIONS]);
    expect(html).not.toMatch(/id="(metodo|trayectoria|prueba)"/);
    const nav = [...html.matchAll(/<a href="#([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(nav)).toEqual(new Set(['frentes', 'contacto']));
  });

  it('la mezcla hacia la siguiente forma empieza pasado el 55 % de la sección', () => {
    expect(frameAt(0.5, ctx).mix).toBe(0);
    expect(frameAt(0.8, ctx).mix).toBeGreaterThan(0);
    expect(frameAt(0.8, ctx).mix).toBeLessThan(1);
  });

  it('es continuo en las fronteras entre secciones', () => {
    for (let k = 1; k < SECTIONS.length; k++) {
      const before = frameAt(k - 1e-6, ctx);
      const after = frameAt(k, ctx);
      expect(before.to).toBe(after.from);
      expect(before.mix).toBeCloseTo(1, 4);
      expect(after.mix).toBe(0);
      expect(before.pose.distance).toBeCloseTo(after.pose.distance, 3);
      expect(before.pose.target[1]).toBeCloseTo(after.pose.target[1], 3);
    }
  });

  it('una forma por sección de la home: el grafo en el hero, los clusters en el catálogo y la lemniscata en contacto', () => {
    expect(SECTIONS).toEqual(['hero', 'frentes', 'contacto']);
    expect(SECTIONS.map((s) => SECTION_LAYOUT[s])).toEqual(['red', 'clusters', 'lemniscata']);
    // En el centro de cada sección, la forma de esa sección, sin mezcla con la siguiente.
    for (const [k, section] of SECTIONS.entries()) {
      const f = frameAt(k + 0.3, ctx);
      expect(f.from, section).toBe(SECTION_LAYOUT[section]);
      expect(f.mix, section).toBe(0);
    }
  });

  it('frentes: la cámara visita los 4 clusters en orden', () => {
    const k = SECTIONS.indexOf('frentes');
    expect(frameAt(k + 0.1, ctx).pose.target).toEqual(ctx.clusterCenters[0]);
    expect(frameAt(k + 0.3, ctx).pose.target).toEqual(ctx.clusterCenters[1]);
    expect(frameAt(k + 0.55, ctx).pose.target).toEqual(ctx.clusterCenters[2]);
  });

  it('en pantallas estrechas no desplaza el grafo a un lado', () => {
    const k = SECTIONS.indexOf('frentes');
    expect(frameAt(k + 0.2, ctx).pose.shiftX).toBeGreaterThan(0);
    expect(frameAt(k + 0.2, { ...ctx, aspect: 0.6 }).pose.shiftX).toBe(0);
  });

  it('en retrato la cámara se aleja en proporción al aspecto en todas las poses salvo la del hero', () => {
    // El fov es vertical: con aspecto a < 1 el ancho visible es a veces el alto. Alejando la cámara 1/a, el ancho visible
    // en retrato es el alto visible de la misma pose con aspecto 1, y la forma cabe a lo ancho como cabe a lo alto.
    const portrait = { ...ctx, aspect: 390 / 844 };
    for (const [k, section] of SECTIONS.entries()) {
      const wide = frameAt(k, ctx).pose.distance;
      const narrow = frameAt(k, portrait).pose.distance;
      expect(wide).toBeCloseTo(SECTION_POSE[section].distance);
      if (section === 'hero') expect(narrow).toBeCloseTo(SECTION_POSE.hero.distance);
      else expect(narrow).toBeCloseTo(SECTION_POSE[section].distance / portrait.aspect);
    }
    // Con aspecto 1 (cuadrado) ya no hay nada que corregir: el ancho visible es el alto.
    expect(frameAt(SECTIONS.indexOf('contacto'), { ...ctx, aspect: 1 }).pose.distance).toBeCloseTo(SECTION_POSE.contacto.distance);
  });

  it('el hero en retrato conserva la cámara del póster (CAMERA0), que en retrato también recorta por los lados', () => {
    const f = frameAt(0, { ...ctx, aspect: 390 / 844 });
    expect(f.pose.distance).toBe(CAMERA0.distance);
    expect(f.pose.yaw).toBe(CAMERA0.yaw);
    expect(f.pose.pitch).toBe(CAMERA0.pitch);
  });

  it('en retrato sigue siendo continuo en las fronteras (del hero, sin alejar, al catálogo, alejado)', () => {
    const portrait = { ...ctx, aspect: 0.5 };
    for (let k = 1; k < SECTIONS.length; k++) {
      expect(frameAt(k - 1e-6, portrait).pose.distance).toBeCloseTo(frameAt(k, portrait).pose.distance, 3);
    }
    expect(frameAt(0.8, portrait).pose.distance).toBeGreaterThan(SECTION_POSE.hero.distance);
  });

  it('un escenario sin ancho (aspecto 0) no deja la cámara en el infinito', () => {
    const d = frameAt(SECTIONS.indexOf('contacto'), { ...ctx, aspect: 0 }).pose.distance;
    expect(Number.isFinite(d)).toBe(true);
    expect(d).toBeLessThan(CAMERA_FAR);
  });

  it('la última sección termina en la lemniscata y no se sale de rango', () => {
    const f = frameAt(SECTIONS.length + 3, ctx);
    expect(f.from).toBe('lemniscata');
    expect(f.to).toBe('lemniscata');
    expect(frameAt(-2, ctx).from).toBe('red');
  });
});
