import type { ProjectSnapshot } from '../src/activity/projects/model';
import type { ActivitySnapshot } from '../src/activity/model';
import { PUBLIC_PROJECT_CATALOG as PROJECT_CATALOG, PROJECT_CATALOG as ALL_PROJECTS } from '../src/activity/projects/catalog';

/** Deliberately synthetic, fixed ranking used only in browser tests. */
export function projectSnapshot(): ProjectSnapshot {
  const values = [1253, 595, 32, 220, 310, 159, 430, 180, 60, 4, 22, 740];
  return {
    version: 1, source: 'github-public', metric: 'commits', coverage: 'published-projects', updatedAt: new Date().toISOString(),
    projects: PROJECT_CATALOG.map(({ id, kind, name, url, description }, index) => ({
      id, kind, name, url, description, counts: { year: values[index], month: index === 9 ? 0 : Math.floor(values[index] / 2), week: index === 9 ? 0 : Math.floor(values[index] / 4) }, lastActive: index === 9 ? null : new Date().toISOString().slice(0, 10),
    })),
  };
}

/** Synthetic expanded record exercises private-inclusive provenance and a scrollable ledger. */
export function authorizedProjectSnapshot(): ProjectSnapshot {
  const day = new Date().toISOString().slice(0, 10);
  return { version: 1, source: 'github-authorized', metric: 'commits', coverage: 'published-projects', updatedAt: new Date().toISOString(),
    projects: ALL_PROJECTS.map(({ id, kind, name, description, url }, index) => ({ id, kind, name, description, ...(url ? {url} : {}),
      counts: {year: id === 'argos' ? 5000 : 2900-index*20, month: 20, week: 2}, lastActive: day })) };
}

export function calendarSnapshot(): ActivitySnapshot {
  const end = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  return {
    version: 1, source: 'github', metric: 'contributions', updatedAt: new Date().toISOString(), highlights: [],
    days: Array.from({ length: 365 }, (_, i) => ({ date: new Date(end - (364 - i) * 86_400_000).toISOString().slice(0, 10), count: i % 12 })),
  };
}
