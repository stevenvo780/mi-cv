'use client';

import { useEffect, useRef } from 'react';
import type { BeastSceneProps } from '@/activity/projects/model';
import type { BeastRuntime } from './BeastRuntime';

/** The renderer is imported only once this particular creature approaches the viewport. */
export default function BeastScene(props: BeastSceneProps) {
  const mount = useRef<HTMLDivElement>(null);
  const latest = useRef(props);
  const runtime = useRef<BeastRuntime | null>(null);

  useEffect(() => {
    latest.current = props;
    runtime.current?.update(props);
  }, [props]);

  useEffect(() => {
    const element = mount.current;
    if (!element) return;
    let cancelled = false;
    let started = false;
    let instance: BeastRuntime | null = null;
    const start = () => {
      if (started || cancelled) return;
      started = true;
      void import('./BeastRuntime').then(async ({ BeastRuntime }) => {
        if (cancelled) return;
        instance = new BeastRuntime(element, latest.current,
          (available) => { if (!cancelled) latest.current.onReady?.(available); });
        runtime.current = instance;
        try { await instance.init(); }
        catch { if (!cancelled) latest.current.onReady?.(false); instance.dispose(); }
        if (cancelled) instance.dispose();
      }).catch(() => { if (!cancelled) latest.current.onReady?.(false); });
    };
    const observer = typeof IntersectionObserver === 'function'
      ? new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) { observer?.disconnect(); start(); }
      }, { rootMargin: '350px' }) : null;
    if (observer) observer.observe(element);
    else start();
    return () => {
      cancelled = true;
      observer?.disconnect();
      instance?.dispose();
      if (runtime.current === instance) runtime.current = null;
    };
  }, []);

  return <div ref={mount} className="beast-scene" aria-hidden="true" data-beast-kind={props.kind}
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
