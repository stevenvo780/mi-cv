/**
 * contrast-check.mjs
 * Checks WCAG AA contrast for key Cloud Atlas color pairs on filosofo.stevenvallejo.com
 * Uses puppeteer-core + system Chrome to evaluate computed styles.
 * Exits 0 if all pairs pass AA (4.5:1 for normal text, 3:1 for large/UI).
 * Exits 1 if any violations found.
 */
import puppeteer from 'puppeteer-core';

const TARGET_URL = 'https://filosofo.stevenvallejo.com';
const CHROME_PATH = '/usr/bin/google-chrome';

/** sRGB component linearization */
function linearize(c) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Relative luminance from [r, g, b] 0-255 */
function luminance([r, g, b]) {
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** WCAG contrast ratio between two [r,g,b] colors */
function contrastRatio(c1, c2) {
  const L1 = luminance(c1);
  const L2 = luminance(c2);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Parse "rgb(r, g, b)" or "rgba(r, g, b, a)" into [r, g, b] */
function parseRgb(str) {
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

/** Hex color to [r, g, b] */
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Cloud Atlas pairs we care about (text on bg) — [fg, bg, label, isLargeText]
const MANUAL_PAIRS = [
  { fg: '#f3ece0', bg: '#0b1417', label: 'cream text on dark bg',        large: false },
  { fg: '#c9c2b6', bg: '#0b1417', label: 'soft text on dark bg',         large: false },
  { fg: '#43b5a6', bg: '#0b1417', label: 'teal on dark bg',              large: true  },
  { fg: '#e0a85e', bg: '#0b1417', label: 'gold on dark bg',              large: true  },
  { fg: '#6fd3c4', bg: '#0b1417', label: 'teal-light on dark bg',        large: false },
  { fg: '#f0c887', bg: '#0b1417', label: 'gold-light on dark bg',        large: false },
  { fg: '#8d7cc0', bg: '#0b1417', label: 'violet on dark bg',            large: false },
  { fg: '#93999a', bg: '#0b1417', label: 'muted on dark bg',             large: false },
  { fg: '#0b1417', bg: '#e0a85e', label: 'dark ink on gold button',       large: true  },
  { fg: '#0b1417', bg: '#43b5a6', label: 'dark ink on teal button',       large: true  },
];

async function main() {
  console.log(`\nContrast check — Cloud Atlas dark mode`);
  console.log(`Target: ${TARGET_URL}\n`);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--headless=new'],
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    console.log('Loading page…');
    await page.goto(TARGET_URL, { waitUntil: 'networkidle2', timeout: 30000 });

    // Get computed CSS vars from the root
    const cssVars = await page.evaluate(() => {
      const style = getComputedStyle(document.documentElement);
      const vars = ['--bg', '--text', '--text-soft', '--muted', '--teal', '--teal-light',
                    '--teal-ink', '--gold', '--gold-ink', '--orange', '--violet',
                    '--bg-2', '--panel-solid'];
      return Object.fromEntries(vars.map(v => [v, style.getPropertyValue(v).trim()]));
    });

    console.log('Computed CSS vars from live page:');
    for (const [k, v] of Object.entries(cssVars)) {
      if (v) console.log(`  ${k}: ${v}`);
    }
    console.log('');

    // Run manual pair checks
    let violations = 0;
    const threshold = { normal: 4.5, large: 3.0 };

    for (const pair of MANUAL_PAIRS) {
      const fg = hexToRgb(pair.fg);
      const bg = hexToRgb(pair.bg);
      const ratio = contrastRatio(fg, bg);
      const required = pair.large ? threshold.large : threshold.normal;
      const pass = ratio >= required;
      const level = pair.large ? 'AA large' : 'AA normal';
      const status = pass ? 'PASS' : 'FAIL';
      const req = `>=${required.toFixed(1)}:1`;
      console.log(`${status}  ${ratio.toFixed(2)}:1  (${req})  ${pair.label}  [${level}]`);
      if (!pass) violations++;
    }

    // Also scrape any inline elements to catch live computed colors
    const liveChecks = await page.evaluate(() => {
      const results = [];
      // Check body text
      const body = document.body;
      const bodyStyle = getComputedStyle(body);
      results.push({
        label: 'body text (live)',
        fg: bodyStyle.color,
        bg: bodyStyle.backgroundColor,
      });
      // Check first heading
      const h1 = document.querySelector('h1');
      if (h1) {
        const s = getComputedStyle(h1);
        results.push({ label: 'h1 text (live)', fg: s.color, bg: s.backgroundColor });
      }
      return results;
    });

    console.log('\nLive computed text colors:');
    for (const check of liveChecks) {
      const fg = parseRgb(check.fg);
      const bg = parseRgb(check.bg);
      if (!fg || !bg) { console.log(`  SKIP  ${check.label} (transparent bg or unparseable)`); continue; }
      // If bg is transparent/zero luma, skip (it inherits from parent)
      if (bg[0] === 0 && bg[1] === 0 && bg[2] === 0 && check.bg.includes('rgba')) {
        console.log(`  SKIP  ${check.label} (transparent bg)`);
        continue;
      }
      const ratio = contrastRatio(fg, bg);
      const pass = ratio >= 4.5;
      console.log(`${pass ? 'PASS' : 'FAIL'}  ${ratio.toFixed(2)}:1  ${check.label}`);
      if (!pass) violations++;
    }

    console.log(`\n${'─'.repeat(60)}`);
    if (violations === 0) {
      console.log(`ALL PASS — 0 WCAG AA violations`);
    } else {
      console.log(`FAILED — ${violations} violation(s)`);
    }

    process.exit(violations > 0 ? 1 : 0);
  } finally {
    await browser.close();
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
