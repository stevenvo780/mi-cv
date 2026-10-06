'use client';

import { useEffect, useRef } from 'react';
import type { ActivityDay } from '@/activity/model';
import type { ActivitySculpture } from './scene/ActivitySculpture';

export interface ActivitySceneProps {
  days: ActivityDay[];
  windowSize: number;
  selectedDate: string | null;
  onSelect: (date: string) => void;
  paused: boolean;
  reveal: number;
  reducedMotion: boolean;
  label: string;
  onReady?: (available: boolean) => void;
}

/** Three and the sculpture live in a separate route-only chunk, never in server rendering. */
export default function ActivityScene(props: ActivitySceneProps) {
  const mount = useRef<HTMLDivElement>(null);
  const runtime = useRef<ActivitySculpture | null>(null);
  const latest = useRef(props);

  useEffect(() => {
    latest.current = props;
    runtime.current?.update(props);
  }, [props]);

  useEffect(() => {
    let cancelled = false;
    let scene: ActivitySculpture | null = null;
    const node = mount.current;
    if (!node) return;
    void import('./scene/ActivitySculpture').then(async ({ ActivitySculpture }) => {
      if (cancelled) return;
      scene = new ActivitySculpture(node, latest.current, {
        select: (date) => latest.current.onSelect(date),
        ready: (available) => { if (!cancelled) latest.current.onReady?.(available); },
      });
      runtime.current = scene;
      try { await scene.init(); }
      catch { if (!cancelled) latest.current.onReady?.(false); scene.dispose(); }
      if (cancelled) scene.dispose();
    }).catch(() => { if (!cancelled) latest.current.onReady?.(false); });
    return () => {
      cancelled = true;
      scene?.dispose();
      if (runtime.current === scene) runtime.current = null;
    };
  }, []);

  return <div ref={mount} className="activity-scene" role="img" aria-label={props.label}
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
