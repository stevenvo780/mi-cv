import { PROJECT_CATALOG, PUBLIC_PROJECT_CATALOG } from './catalog';
import type { ProjectActivity, ProjectSnapshot } from './model';

/** Reconstruct approved identities: remote names, URLs, paths and arbitrary metadata are discarded. */
export function validateProjectFeed(input: unknown, now = new Date()): ProjectSnapshot {
  if (!input || typeof input !== 'object') throw new Error('Invalid project feed');
  const body = input as Record<string, unknown>;
  const measuredAt = typeof body.updatedAt === 'string' ? Date.parse(body.updatedAt) : NaN;
  const catalog = body.source === 'github-authorized' ? PROJECT_CATALOG : PUBLIC_PROJECT_CATALOG;
  if (body.version !== 1 || !['github-public', 'github-authorized'].includes(String(body.source)) || body.metric !== 'commits' || body.coverage !== 'published-projects' ||
    !Number.isFinite(measuredAt) || measuredAt > now.getTime() + 300_000 || !Array.isArray(body.projects) || body.projects.length !== catalog.length) throw new Error('Invalid project feed');
  const seen = new Set<string>();
  const measured = new Date(measuredAt);
  const firstDay = new Date(Date.UTC(measured.getUTCFullYear(), measured.getUTCMonth(), measured.getUTCDate()) - 364 * 86_400_000).toISOString().slice(0, 10);
  const projects: ProjectActivity[] = body.projects.map((raw: unknown) => {
    if (!raw || typeof raw !== 'object') throw new Error('Invalid project feed');
    const row = raw as Record<string, unknown>;
    const approved = catalog.find((item) => item.id === row.id);
    if (!approved || seen.has(approved.id) || !row.counts || typeof row.counts !== 'object') throw new Error('Invalid project identity');
    seen.add(approved.id);
    const counts = row.counts as Record<string, unknown>;
    if (['week', 'month', 'year'].some((key) => !Number.isSafeInteger(counts[key]) || Number(counts[key]) < 0 || Number(counts[key]) > 1_000_000) || Number(counts.week) > Number(counts.month) || Number(counts.month) > Number(counts.year)) throw new Error('Invalid project counts');
    const active = row.lastActive;
    if ((Number(counts.year) === 0) !== (active === null)) throw new Error('Invalid project date');
    if (active !== null && (typeof active !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(active) || new Date(`${active}T00:00:00Z`).toISOString().slice(0, 10) !== active || active < firstDay || active > measured.toISOString().slice(0, 10))) throw new Error('Invalid project date');
    return { id: approved.id, name: approved.name, description: approved.description, kind: approved.kind, ...(approved.url ? { url: approved.url } : {}), counts: { week: Number(counts.week), month: Number(counts.month), year: Number(counts.year) }, lastActive: active as string | null };
  });
  return { version: 1, source: body.source as ProjectSnapshot['source'], metric: 'commits', coverage: 'published-projects', updatedAt: new Date(measuredAt).toISOString(), projects };
}
