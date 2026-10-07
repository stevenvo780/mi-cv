import type { DominionTier } from '@/activity/projects/dominance';
import type { Locale } from '@/lib/site';

type DominanceCopy = {
  title: string;
  relative: string;
  reference: string;
  note: string;
  shared: string;
  resting: string;
  selected: string;
  commits: string;
  periods: Record<'week' | 'month' | 'year', string>;
  tiers: Record<DominionTier, string>;
};

export const PROJECT_DOMINANCE = {
  es: {
    title: 'Escala de colosos',
    relative: 'Actividad respecto al líder',
    reference: '100 % = el mayor recuento. La corona marca la mayor actividad.',
    note: 'La actividad no mide la calidad ni la complejidad del proyecto.',
    shared: 'Liderazgo compartido',
    resting: 'En reposo',
    selected: 'Seleccionado',
    commits: 'commits',
    periods: { year: 'Último año', month: 'Último mes', week: 'Última semana' },
    tiers: {
      apex: 'Monstruo ápex', titan: 'Titán', colossus: 'Coloso', creature: 'Criatura', spark: 'Chispa', dormant: 'En reposo',
    },
  },
  en: {
    title: 'Scale of colossi',
    relative: 'Activity relative to the leader',
    reference: '100% = the highest count. The crown marks the most activity.',
    note: 'Activity does not measure project quality or complexity.',
    shared: 'Shared lead',
    resting: 'At rest',
    selected: 'Selected',
    commits: 'commits',
    periods: { year: 'Last year', month: 'Last month', week: 'Last week' },
    tiers: {
      apex: 'Apex monster', titan: 'Titan', colossus: 'Colossus', creature: 'Creature', spark: 'Spark', dormant: 'At rest',
    },
  },
} satisfies Record<Locale, DominanceCopy>;
