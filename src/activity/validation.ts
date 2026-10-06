import type { ActivityDay, ActivityHighlight, ActivitySnapshot } from './model';

export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function dayWindow(now: Date, length = 365): string[] {
  const end = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Array.from({ length }, (_, i) => new Date(end - (length - i - 1) * 86_400_000).toISOString().slice(0, 10));
}

const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const areas = new Set(['engineering', 'research', 'design', 'writing']);

/** Reconstruye cada objeto por allowlist: ningún campo adicional cruza la API pública. */
export function validateSnapshot(input: unknown, now = new Date(), expectedDays = 365): ActivitySnapshot {
  if (!object(input) || input.version !== 1 || !['github', 'journal'].includes(String(input.source)) ||
    !['contributions', 'commits'].includes(String(input.metric))) throw new Error('Invalid activity format');
  if (typeof input.updatedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(input.updatedAt) ||
    !Number.isFinite(Date.parse(input.updatedAt)) || Date.parse(input.updatedAt) > now.getTime() + 300_000) throw new Error('Invalid activity timestamp');
  if (!Array.isArray(input.days) || input.days.length !== expectedDays) throw new Error('Invalid activity days');
  const seen = new Set<string>();
  const today = now.toISOString().slice(0, 10);
  const days: ActivityDay[] = input.days.map((day) => {
    if (!object(day) || !validDate(day.date) || day.date > today || seen.has(day.date) ||
      !Number.isSafeInteger(day.count) || Number(day.count) < 0 || Number(day.count) > 1_000_000) throw new Error('Invalid activity day');
    seen.add(day.date);
    return { date: day.date, count: Number(day.count) };
  }).sort((a, b) => a.date.localeCompare(b.date));
  if (days.at(-1)?.date !== new Date(input.updatedAt).toISOString().slice(0, 10)) throw new Error('Activity timestamp and calendar differ');
  for (let i = 1; i < days.length; i++) {
    if (Date.parse(days[i].date) - Date.parse(days[i - 1].date) !== 86_400_000) throw new Error('Incomplete activity calendar');
  }
  if (!Array.isArray(input.highlights) || input.highlights.length > 180) throw new Error('Invalid activity highlights');
  const highlights: ActivityHighlight[] = input.highlights.map((item) => {
    if (!object(item) || !validDate(item.date) || !seen.has(item.date) || !areas.has(String(item.area)) || !object(item.title)) throw new Error('Invalid activity highlight');
    const { es, en } = item.title;
    if (typeof es !== 'string' || typeof en !== 'string' || !es.trim() || !en.trim() || es.length > 240 || en.length > 240) throw new Error('Invalid activity title');
    return { date: item.date, area: item.area as ActivityHighlight['area'], title: { es: es.trim(), en: en.trim() } };
  });
  return { version: 1, source: input.source as ActivitySnapshot['source'], metric: input.metric as ActivitySnapshot['metric'],
    updatedAt: new Date(input.updatedAt).toISOString(), days, highlights };
}

/** Solo fechas y conteos del calendario público; nunca se consulta un repositorio. */
export function parseGithubCalendar(html: string, now = new Date(), length = 365): ActivitySnapshot {
  const counts = new Map<string, number>();
  for (const match of html.matchAll(/<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g)) {
    const id = /\bfor="([^"]+)"/.exec(match[1])?.[1];
    const label = match[2].replace(/<[^>]*>/g, '').trim();
    const count = /^(No|[\d,]+) contributions? on\b/.exec(label)?.[1];
    if (id && count) counts.set(id, count === 'No' ? 0 : Number(count.replaceAll(',', '')));
  }
  const byDate = new Map<string, number>();
  for (const match of html.matchAll(/<td\b([^>]*)>/g)) {
    const date = /\bdata-date="([^"]+)"/.exec(match[1])?.[1];
    const id = /\bid="([^"]+)"/.exec(match[1])?.[1];
    if (date && id && counts.has(id)) byDate.set(date, counts.get(id)!);
  }
  const days = dayWindow(now, length).map((date) => {
    const count = byDate.get(date);
    if (count === undefined) throw new Error('Incomplete GitHub calendar');
    return { date, count };
  });
  return validateSnapshot({ version: 1, source: 'github', metric: 'contributions', updatedAt: now.toISOString(), days, highlights: [] }, now, length);
}
