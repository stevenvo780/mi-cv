import type { ActivitySnapshot } from './model';
import { dayWindow, parseGithubCalendar, validateSnapshot } from './validation';

/** Un refresh del HTML no actualiza el sitio: los datos se consultan en ejecución y se cachean una hora. */
async function readSource(url: string, maxBytes: number): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json, text/html', 'Accept-Language': 'en-US', 'User-Agent': 'Mouseion-Activity/1.0' },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(12_000),
    redirect: 'error',
  });
  if (!response.ok || !response.body || Number(response.headers.get('content-length')) > maxBytes) throw new Error('Activity source unavailable');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) throw new Error('Activity source too large');
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } finally {
    await reader.cancel();
  }
}

export async function loadActivity(now = new Date()): Promise<ActivitySnapshot> {
  // Feed opcional ya saneado, publicado aparte del código. Si está configurado y falla, no se sustituye
  // silenciosamente por GitHub: eso cambiaría la métrica y ocultaría un recolector detenido.
  const feed = process.env.ACTIVITY_FEED_URL;
  if (feed) {
    const url = new URL(feed);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid activity feed URL');
    return validateSnapshot(JSON.parse(await readSource(url.href, 262_144)), now);
  }
  const dates = dayWindow(now);
  // GitHub sirve años civiles cuando recibe from/to. Una ventana móvil suele cruzar dos años.
  const years = [...new Set([dates[0].slice(0, 4), dates[dates.length - 1].slice(0, 4)])];
  const calendars = await Promise.all(years.map((year) => {
    const url = new URL('https://github.com/users/stevenvo780/contributions');
    url.searchParams.set('from', `${year}-01-01`);
    url.searchParams.set('to', `${year}-12-31`);
    return readSource(url.href, 1_048_576);
  }));
  // Los id del HTML se repiten entre años: se parsean por separado antes de combinar fechas.
  const days = calendars.flatMap((html, i) => {
    const year = Number(years[i]);
    const end = new Date(Date.UTC(year, 11, 31, 12));
    // El parser anual acepta 365 días; en bisiestos el 1 de enero se añade con una ventana de 366.
    return parseGithubCalendar(html, end, year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 366 : 365).days;
  }).filter((day) => day.date >= dates[0] && day.date <= dates[dates.length - 1]);
  return validateSnapshot({ version: 1, source: 'github', metric: 'contributions', updatedAt: now.toISOString(), days, highlights: [] }, now);
}
