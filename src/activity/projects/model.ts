import type { LocalizedText } from '@/data/frentes';

export type ProjectPeriod = 'week' | 'month' | 'year';
export type BeastKind = 'hydra' | 'sentinel' | 'moth' | 'nautilus' | 'golem' | 'sprout';

/** Only identities already approved for publication belong in this feed. */
export interface ProjectIdentity {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  url?: string;
  kind: BeastKind;
}

export interface ProjectActivity extends ProjectIdentity {
  counts: Record<ProjectPeriod, number>;
  lastActive: string | null;
}

export interface ProjectSnapshot {
  version: 1;
  source: 'github-public' | 'github-authorized';
  metric: 'commits';
  updatedAt: string;
  projects: ProjectActivity[];
  /** The ranking covers this published selection, never all private activity. */
  coverage: 'published-projects';
}

export type ProjectResponse =
  | { status: 'ready'; snapshot: ProjectSnapshot }
  | { status: 'unavailable'; snapshot: null };

export interface BeastSceneProps {
  kind: BeastKind;
  identity: string;
  energy: number;
  paused: boolean;
  reducedMotion: boolean;
  label: string;
  onReady?: (available: boolean) => void;
}
