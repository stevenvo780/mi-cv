'use client';
import { useEffect } from 'react';

/**
 * Lightweight scroll-reveal: attaches a single IntersectionObserver that adds
 * `.is-visible` to any element with `.reveal` once it enters the viewport, then
 * unobserves it. No animation libraries. Respects prefers-reduced-motion via
 * the CSS in brand.css (which forces .reveal visible under reduced motion).
 */
export function useReveal(): void {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (els.length === 0) return;

    // No IO support → just show everything.
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.08 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
