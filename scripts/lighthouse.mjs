import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const OUT = process.env.LH_OUT ?? '/workspace/.scratch-steven-redesign/lh';
const BASE = process.env.LH_BASE ?? 'http://localhost:3210';
const RUNS = Number(process.env.LH_RUNS ?? 5);
mkdirSync(OUT, { recursive: true });

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const summary = {};

for (const locale of ['es', 'en']) {
  for (const preset of ['mobile', 'desktop']) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) {
      const file = `${OUT}/${locale}-${preset}-${i}.json`;
      const args = [
        '--yes',
        'lighthouse@13.5.0',
        `${BASE}/${locale}`,
        '--quiet',
        '--output=json',
        `--output-path=${file}`,
        '--chrome-path=/usr/bin/google-chrome',
        '--chrome-flags=--headless=new --no-sandbox',
      ];
      if (preset === 'desktop') args.push('--preset=desktop');
      execFileSync('npx', args, { stdio: 'inherit' });
      const r = JSON.parse(readFileSync(file, 'utf8'));
      runs.push({
        performance: r.categories.performance.score * 100,
        accessibility: r.categories.accessibility.score * 100,
        bestPractices: r.categories['best-practices'].score * 100,
        seo: r.categories.seo.score * 100,
        lcpMs: r.audits['largest-contentful-paint'].numericValue,
        tbtMs: r.audits['total-blocking-time'].numericValue,
        cls: r.audits['cumulative-layout-shift'].numericValue,
      });
    }
    summary[`${locale}-${preset}`] = Object.fromEntries(Object.keys(runs[0]).map((k) => [k, median(runs.map((x) => x[k]))]));
  }
}

writeFileSync(`${OUT}/summary.json`, JSON.stringify(summary, null, 2));
console.table(summary);
