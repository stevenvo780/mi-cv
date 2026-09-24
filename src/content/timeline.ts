import achEs from '@/locales/es/common/achievements.json';
import achEn from '@/locales/en/common/achievements.json';
import expEs from '@/locales/es/common/experience.json';
import expEn from '@/locales/en/common/experience.json';
import type { Bilingual } from '@/graph/model';
import { EMPRESAS, type EmpresaKey } from '@/graph/relations';
import { nodeId, parseDates } from '@/graph/sources';

type Dict = Record<string, string>;
const EXP = { es: expEs as Dict, en: expEn as Dict };
const ACH = { es: achEs as Dict, en: achEn as Dict };

/** Logros de achievements.json que se muestran bajo cada empresa. Soy Digital/INDOTEL fue vía Critertec. */
const ACHIEVEMENTS: Partial<Record<EmpresaKey, string[]>> = {
  critertec: ['critertec', 'soyDigital'],
  humanizar: ['humanizar'],
  indieLevels: ['indieLevels'],
};

export interface TimelineEntry {
  key: EmpresaKey;
  nodeId: string;
  company: Bilingual;
  role: Bilingual;
  dates: Bilingual;
  /** Inicio para <time dateTime>: YYYY-MM, o solo YYYY si la fuente no trae el mes. */
  start: string;
  location?: Bilingual;
  achievements: Bilingual[];
}

const pick = (dict: { es: Dict; en: Dict }, key: string): Bilingual | undefined =>
  dict.es[key] && dict.en[key] ? { es: dict.es[key], en: dict.en[key] } : undefined;
const dash = (s: string) => s.replace(/\s*-\s*/, ' — ');

export function buildTimeline(): TimelineEntry[] {
  return EMPRESAS.map((key) => {
    const { year, month } = parseDates(EXP.es[`experience.dates.${key}`]);
    const dates = pick(EXP, `experience.dates.${key}`)!;
    return {
      key,
      nodeId: nodeId.empresa(key),
      company: pick(EXP, `experience.${key}`)!,
      role: pick(EXP, `experience.role.${key}`)!,
      dates: { es: dash(dates.es), en: dash(dates.en) },
      start: month === undefined ? String(year) : `${year}-${String(month).padStart(2, '0')}`,
      location: pick(EXP, `experience.location.${key}`),
      achievements: (ACHIEVEMENTS[key] ?? []).map((a) => pick(ACH, `achievements.description.${a}`)).filter((a): a is Bilingual => Boolean(a)),
    };
  });
}
