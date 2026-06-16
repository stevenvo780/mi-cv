'use client';

/**
 * SectionBackgrounds — decorative ambient canvas fields for the gallery sections.
 *
 * One shared, performant engine (<SectionField variant=…>) renders a different
 * animation per section so each frente feels distinct:
 *
 *   variant="circuit"       §01 Ingeniería  — circuit lattice w/ traveling current
 *   variant="constellation" §02 Filosofía   — orbiting particle constellation
 *   variant="scatter"       §03 Ciencias    — drifting particle field, full-bleed
 *   variant="prism"         §04 Enterprise  — prism refracting a spectral fan
 *
 * (The hero keeps its existing GameOfLife canvas in LinktreeHome.)
 *
 * Performance contract — every field obeys all of these:
 *   · single requestAnimationFrame loop; cancelled on unmount.
 *   · IntersectionObserver gates the loop — no work scheduled while off-screen.
 *   · ResizeObserver sizes the canvas to its container (never to window).
 *   · devicePixelRatio capped at 2; ambient fields throttled to ~30fps.
 *   · prefers-reduced-motion → one static frame, loop never starts.
 *   · pointer-events:none, aria-hidden, low opacity — pure decoration behind cards.
 *
 * Brand palette: teal #43b5a6 · teal-light #6fd3c4 · gold #e0a85e · rust #cf6a3c
 * on bg #0b1417.
 */

import React, { useEffect, useRef } from 'react';

export type FieldVariant = 'circuit' | 'constellation' | 'scatter' | 'prism';

interface SectionFieldProps {
  variant: FieldVariant;
  /** Overall opacity of the layer (kept low so cards stay legible). */
  opacity?: number;
  className?: string;
}

/* Target ~30fps for ambient fields: cheap, and smooth enough for decoration. */
const FRAME_MS = 1000 / 30;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/* ------------------------------------------------------------------ */
/* Per-variant renderer factory.                                       */
/* Each returns { draw(t), resize(w,h,dpr) } closed over the ctx.      */
/* w/h are CSS pixels; the ctx is already scaled by dpr.               */
/* ------------------------------------------------------------------ */
interface Renderer {
  resize: (w: number, h: number) => void;
  draw: (timeMs: number) => void;
}

/* ── §01 — Circuit lattice ────────────────────────────────────────
   A faint grid of nodes; current pulses travel along random edges. */
function createCircuit(ctx: CanvasRenderingContext2D): Renderer {
  const STEP = 64; // px between nodes
  let cols = 0;
  let rows = 0;
  let w = 0;
  let h = 0;
  type Pulse = { col: number; row: number; dir: 0 | 1; pos: number; speed: number; len: number };
  let pulses: Pulse[] = [];

  const seedPulses = () => {
    const count = Math.min(18, Math.max(6, Math.floor((cols * rows) / 40)));
    pulses = Array.from({ length: count }, () => ({
      col: Math.floor(Math.random() * Math.max(1, cols)),
      row: Math.floor(Math.random() * Math.max(1, rows)),
      dir: Math.random() > 0.5 ? 0 : 1,
      pos: Math.random(),
      speed: 0.004 + Math.random() * 0.006,
      len: 0.18 + Math.random() * 0.22,
    }));
  };

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
      cols = Math.ceil(w / STEP) + 1;
      rows = Math.ceil(h / STEP) + 1;
      seedPulses();
    },
    draw() {
      ctx.clearRect(0, 0, w, h);
      // Static lattice — hairline grid + node dots.
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(67,181,166,0.16)';
      ctx.beginPath();
      for (let c = 0; c <= cols; c++) {
        const x = c * STEP;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let r = 0; r <= rows; r++) {
        const y = r * STEP;
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(67,181,166,0.34)';
      for (let c = 0; c <= cols; c++) {
        for (let r = 0; r <= rows; r++) {
          ctx.fillRect(c * STEP - 1, r * STEP - 1, 2, 2);
        }
      }

      // Traveling current pulses (bright segment moving along an edge).
      for (const p of pulses) {
        p.pos += p.speed;
        if (p.pos > 1) {
          p.pos = 0;
          // hop to a new edge at end of travel
          p.col = Math.floor(Math.random() * Math.max(1, cols));
          p.row = Math.floor(Math.random() * Math.max(1, rows));
          p.dir = Math.random() > 0.5 ? 0 : 1;
        }
        const x0 = p.col * STEP;
        const y0 = p.row * STEP;
        const segLen = STEP; // travel along one cell edge
        const head = p.pos;
        const tail = Math.max(0, p.pos - p.len);
        let gx0: number, gy0: number, gx1: number, gy1: number;
        if (p.dir === 0) {
          gx0 = x0 + tail * segLen;
          gx1 = x0 + head * segLen;
          gy0 = gy1 = y0;
        } else {
          gy0 = y0 + tail * segLen;
          gy1 = y0 + head * segLen;
          gx0 = gx1 = x0;
        }
        const grad = ctx.createLinearGradient(gx0, gy0, gx1, gy1);
        grad.addColorStop(0, 'rgba(111,211,196,0)');
        grad.addColorStop(1, 'rgba(111,211,196,0.85)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(gx0, gy0);
        ctx.lineTo(gx1, gy1);
        ctx.stroke();
        // bright head node
        ctx.fillStyle = 'rgba(111,211,196,0.9)';
        ctx.beginPath();
        ctx.arc(gx1, gy1, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
}

/* ── §02 — Constellation with orbits ──────────────────────────────
   Points orbit a few invisible attractors; near pairs are linked. */
function createConstellation(ctx: CanvasRenderingContext2D): Renderer {
  let w = 0;
  let h = 0;
  type Star = { ox: number; oy: number; r: number; a: number; speed: number; x: number; y: number; s: number };
  let stars: Star[] = [];
  const LINK_DIST = 118;

  const seed = () => {
    const count = Math.min(46, Math.max(16, Math.floor((w * h) / 26000)));
    stars = Array.from({ length: count }, () => {
      const ox = Math.random() * w;
      const oy = Math.random() * h;
      return {
        ox,
        oy,
        r: 12 + Math.random() * 46,
        a: Math.random() * Math.PI * 2,
        speed: (Math.random() > 0.5 ? 1 : -1) * (0.0015 + Math.random() * 0.0025),
        x: ox,
        y: oy,
        s: 0.7 + Math.random() * 1.4,
      };
    });
  };

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
      seed();
    },
    draw() {
      ctx.clearRect(0, 0, w, h);
      for (const st of stars) {
        st.a += st.speed;
        st.x = st.ox + Math.cos(st.a) * st.r;
        st.y = st.oy + Math.sin(st.a) * st.r;
      }
      // Links between near stars (constellation web).
      ctx.lineWidth = 1;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.5;
            ctx.strokeStyle = `rgba(224,168,94,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        }
      }
      // Stars.
      for (const st of stars) {
        ctx.fillStyle = 'rgba(240,200,135,0.85)';
        ctx.beginPath();
        ctx.arc(st.x, st.y, st.s, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
}

/* ── §03 — Scatter field (drifting particles, full-bleed) ─────────
   Particles seeded uniformly across the full canvas drift slowly;
   nearby pairs draw a faint link. No central attractor → the field
   fills every pixel of the container including the side gutters.
   Tinted teal-light (#6fd3c4) to match Ciencias accent. */
function createScatter(ctx: CanvasRenderingContext2D): Renderer {
  let w = 0;
  let h = 0;
  const LINK_DIST = 90; // px — max distance to draw a link
  type Particle = {
    x: number; y: number;
    vx: number; vy: number;
    r: number; // dot radius
  };
  let pts: Particle[] = [];

  const seed = () => {
    // Density: ~1 particle per 10 000 px² gives good coverage without clutter.
    const count = Math.min(120, Math.max(40, Math.round((w * h) / 10000)));
    pts = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 0.9 + Math.random() * 1.2,
    }));
  };

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
      seed();
    },
    draw() {
      ctx.clearRect(0, 0, w, h);

      // Advance positions; wrap at edges so no corner ever empties.
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x += w;
        else if (p.x > w) p.x -= w;
        if (p.y < 0) p.y += h;
        else if (p.y > h) p.y -= h;
      }

      // Links between nearby pairs — teal-light, alpha fades with distance.
      ctx.lineWidth = 0.8;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.45;
            ctx.strokeStyle = `rgba(111,211,196,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.stroke();
          }
        }
      }

      // Dots — teal-light, slightly brighter than the links.
      ctx.fillStyle = 'rgba(111,211,196,0.75)';
      for (const p of pts) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  };
}

/* ── §04 — Prism refraction beam ──────────────────────────────────
   A white beam hits a prism and fans into a slow-breathing spectrum. */
function createPrism(ctx: CanvasRenderingContext2D): Renderer {
  let w = 0;
  let h = 0;
  // Spectrum tuned to the brand (warm → cool) rather than literal rainbow.
  const spectrum = [
    'rgba(240,200,135,0.55)', // gold-light
    'rgba(224,168,94,0.5)', // gold
    'rgba(207,106,60,0.45)', // rust
    'rgba(141,124,192,0.4)', // violet
    'rgba(67,181,166,0.45)', // teal
    'rgba(111,211,196,0.4)', // teal-light
  ];

  return {
    resize(nw, nh) {
      w = nw;
      h = nh;
    },
    draw(timeMs) {
      ctx.clearRect(0, 0, w, h);
      const t = timeMs / 1000;
      // Prism apex sits left-of-center, vertically centered.
      const apexX = w * 0.34;
      const apexY = h * 0.5;
      const breathe = 0.5 + 0.5 * Math.sin(t * 0.5);

      // Incoming white beam from the left edge.
      const inGrad = ctx.createLinearGradient(0, apexY, apexX, apexY);
      inGrad.addColorStop(0, 'rgba(243,236,224,0)');
      inGrad.addColorStop(1, 'rgba(243,236,224,0.22)');
      ctx.strokeStyle = inGrad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, apexY);
      ctx.lineTo(apexX, apexY);
      ctx.stroke();

      // Refracted fan: each spectral ray leaves the apex at a spreading angle.
      const baseSpread = 0.13 + 0.05 * breathe; // radians of total fan growth
      const rayLen = w; // run rays off the right edge
      spectrum.forEach((color, i) => {
        const k = i - (spectrum.length - 1) / 2; // -n..+n
        const angle = k * baseSpread * 0.5;
        const ex = apexX + Math.cos(angle) * rayLen;
        const ey = apexY + Math.sin(angle) * rayLen;
        const g = ctx.createLinearGradient(apexX, apexY, ex, ey);
        g.addColorStop(0, color);
        g.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(apexX, apexY);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      });

      // The prism glyph — a hollow triangle catching the light.
      const ps = Math.min(w, h) * 0.11;
      ctx.strokeStyle = 'rgba(243,236,224,0.28)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(apexX, apexY - ps);
      ctx.lineTo(apexX - ps * 0.5, apexY + ps * 0.7);
      ctx.lineTo(apexX + ps * 0.5, apexY + ps * 0.7);
      ctx.closePath();
      ctx.stroke();
    },
  };
}

function makeRenderer(variant: FieldVariant, ctx: CanvasRenderingContext2D): Renderer {
  switch (variant) {
    case 'circuit':
      return createCircuit(ctx);
    case 'constellation':
      return createConstellation(ctx);
    case 'scatter':
      return createScatter(ctx);
    case 'prism':
      return createPrism(ctx);
  }
}

/* ------------------------------------------------------------------ */
/* SectionField — the shared canvas host.                              */
/* ------------------------------------------------------------------ */
export default function SectionField({ variant, opacity = 0.14, className }: SectionFieldProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = makeRenderer(variant, ctx);
    const reduced = prefersReducedMotion();

    let cssW = 0;
    let cssH = 0;

    const applySize = () => {
      const rect = wrap.getBoundingClientRect();
      cssW = Math.max(1, Math.round(rect.width));
      cssH = Math.max(1, Math.round(rect.height));
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderer.resize(cssW, cssH);
      // Always paint at least one frame so reduced-motion users see the art.
      renderer.draw(performance.now());
    };

    applySize();

    let rafId = 0;
    let running = false;
    let lastFrame = 0;

    const loop = (now: number) => {
      if (!running) return;
      if (now - lastFrame >= FRAME_MS) {
        lastFrame = now;
        renderer.draw(now);
      }
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced) return;
      running = true;
      lastFrame = 0;
      rafId = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };

    // Only animate while the field is on-screen.
    const io =
      'IntersectionObserver' in window
        ? new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                if (e.isIntersecting) start();
                else stop();
              }
            },
            { rootMargin: '120px 0px', threshold: 0 }
          )
        : null;

    if (io) io.observe(wrap);
    else start(); // no IO → just run (still cancelled on unmount)

    // Container-driven resize (never window) — keeps fields crisp on layout shifts.
    let resizeRaf = 0;
    const ro =
      'ResizeObserver' in window
        ? new ResizeObserver(() => {
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            resizeRaf = requestAnimationFrame(applySize);
          })
        : null;
    if (ro) ro.observe(wrap);

    // Pause when the tab is hidden.
    const onVisibility = () => {
      if (document.hidden) stop();
      else if (io) {
        /* IO will re-fire on becoming visible+intersecting; nudge if already in view */
        const r = wrap.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) start();
      } else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      if (io) io.disconnect();
      if (ro) ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [variant]);

  return (
    <div
      ref={wrapRef}
      className={`section-field${className ? ` ${className}` : ''}`}
      aria-hidden="true"
      style={{ opacity }}
    >
      <canvas ref={canvasRef} className="section-field-canvas" />
    </div>
  );
}
