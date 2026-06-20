import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';

export const alt = 'Steven Vallejo · Mouseîon — Ingeniero de Software & Filósofo';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Cloud Atlas brand palette
const COSMOS = '#0b1417';
const COSMOS_DEEP = '#091012';
const GOLD = '#e0a85e';
const GOLD_INK = '#f0c887';
const TEAL = '#43b5a6';
const TEAL_INK = '#6fd3c4';
const ORANGE = '#c0522a';
const VIOLET = '#8d7cc0';
const CREAM = '#e8e0d4';
const CREAM_MUTED = '#cfc8ba';
const SIGNATURE = `linear-gradient(135deg, ${GOLD} 0%, ${ORANGE} 40%, ${TEAL} 100%)`;

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '90px 110px',
          background: `radial-gradient(120% 120% at 28% 22%, #0f1c20 0%, ${COSMOS} 55%, ${COSMOS_DEEP} 100%)`,
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Faint star field */}
        <div style={{ position: 'absolute', top: 70, left: 90, width: 7, height: 7, borderRadius: '50%', background: CREAM, opacity: 0.55, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 110, right: 160, width: 6, height: 6, borderRadius: '50%', background: VIOLET, opacity: 0.8, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 120, right: 110, width: 6, height: 6, borderRadius: '50%', background: TEAL_INK, opacity: 0.6, display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: 90, left: 150, width: 5, height: 5, borderRadius: '50%', background: CREAM, opacity: 0.4, display: 'flex' }} />

        {/* Signature gradient accent bar */}
        <div
          style={{
            width: 140,
            height: 12,
            borderRadius: 999,
            background: SIGNATURE,
            display: 'flex',
            marginBottom: 26,
          }}
        />

        {/* Ecosystem wordmark */}
        <div
          style={{
            display: 'flex',
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            color: TEAL_INK,
            marginBottom: 18,
          }}
        >
          Mouseîon
        </div>

        {/* Name */}
        <div
          style={{
            display: 'flex',
            fontSize: 82,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: CREAM,
            lineHeight: 1.05,
          }}
        >
          Steven Vallejo Ortiz
        </div>

        {/* Role */}
        <div
          style={{
            display: 'flex',
            fontSize: 42,
            fontWeight: 600,
            marginTop: 26,
            color: GOLD_INK,
          }}
        >
          Ingeniero de Software & Líder de Sistemas
        </div>

        {/* Simple reason / value line */}
        <div
          style={{
            display: 'flex',
            fontSize: 30,
            marginTop: 22,
            color: CREAM_MUTED,
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          Ingeniería de extremo a extremo: IA, backend y sistemas distribuidos a escala.
        </div>

        {/* Domain footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: 56,
            fontSize: 28,
            color: TEAL_INK,
            fontWeight: 600,
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: '50%', background: SIGNATURE, display: 'flex', marginRight: 16 }} />
          stevenvallejo.com
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
