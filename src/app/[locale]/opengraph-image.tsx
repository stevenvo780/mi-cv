import { ImageResponse } from 'next/og';
import { HOME } from '@/content/home';
import { POSTER_SVG } from '@/graph/generated/poster';
import { LOCALES, toLocale } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Steven Vallejo Ortiz — Mouseîon';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const copy = HOME[locale];
  const poster = `data:image/svg+xml;base64,${Buffer.from(POSTER_SVG).toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#05090b' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) solo acepta <img> */}
        <img src={poster} width={1200} height={750} alt="" style={{ position: 'absolute', top: -60, left: 0 }} />
        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            bottom: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            color: '#f6f1e8',
          }}
        >
          <div style={{ fontSize: 26, letterSpacing: 6, color: '#8fa3a8', textTransform: 'uppercase' }}>Mouseîon</div>
          <div style={{ fontSize: 82, letterSpacing: -2, lineHeight: 1 }}>Steven Vallejo Ortiz</div>
          <div style={{ fontSize: 32, color: '#6fd3c4' }}>{copy.hero.role}</div>
        </div>
      </div>
    ),
    size,
  );
}
