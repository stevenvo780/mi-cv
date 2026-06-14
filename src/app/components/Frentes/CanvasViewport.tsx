'use client';
import React, { useEffect, useRef, useState } from 'react';

interface CanvasViewportProps {
  /** Background canvas component to mount only while in viewport. */
  children: React.ReactNode;
  /** Decorative opacity for the background layer. */
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Mounts a heavy canvas animation ONLY while the section is near the viewport,
 * and unmounts it when it leaves — cancelling its rAF loop (the canvas
 * components run their loop inside an effect tied to mount/unmount). This keeps
 * CPU near zero for off-screen fronts. Also skips mounting entirely under
 * prefers-reduced-motion, leaving a static background.
 */
export default function CanvasViewport({
  children,
  opacity = 0.16,
  className,
  style,
}: CanvasViewportProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setActive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setActive(entry.isIntersecting);
      },
      { rootMargin: '200px 0px 200px 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        opacity,
        pointerEvents: 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      {active && !reduced ? children : null}
    </div>
  );
}
