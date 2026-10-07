'use client';

import { useMemo } from 'react';
import { commitConstellation } from '@/activity/projects/constellation';
import type { BeastKind } from '@/activity/projects/model';
import '@/styles/commit-constellation.css';

type StarPath = { color: string; diameter: number; points: string[] };

/** A static equivalent of the measured 3D stars, not an additional decorative star field. */
export default function CommitConstellation({ commits, maximumCommits, identity, kind }: {
  commits: number;
  maximumCommits: number;
  identity: string;
  kind: BeastKind;
}) {
  const galaxy = useMemo(() => commitConstellation(commits, maximumCommits, identity, kind), [commits, maximumCommits, identity, kind]);
  const paths = useMemo(() => {
    const groups = new Map<string, StarPath>();
    for (const star of galaxy.stars) {
      // Quantized point sizes keep the SVG compact even when every one of 20,000 commits is drawn.
      const diameter = star.size < .065 ? 3.6 : star.size < .08 ? 4.5 : 5.6;
      const key = `${star.color}:${diameter}`;
      let group = groups.get(key);
      if (!group) { group = { color: star.color, diameter, points: [] }; groups.set(key, group); }
      const x = (300 + star.x * 84).toFixed(2);
      const y = (300 - star.y * 84).toFixed(2);
      // Round line caps render one point per subpath, without thousands of DOM circles.
      group.points.push(`M${x},${y}h.01`);
    }
    return [...groups.values()].map(({ points, ...style }) => ({ ...style, path: points.join('') }));
  }, [galaxy]);

  return (
    <svg className="commit-constellation" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false"
      data-commits={galaxy.commits} data-commit-stars={galaxy.renderedCount} data-star-unit={galaxy.unit} data-identity={identity}>
      {paths.map(({ color, diameter, path }) => <path key={`${color}:${diameter}`} d={path} fill="none" stroke={color} strokeWidth={diameter} strokeLinecap="round" />)}
    </svg>
  );
}
