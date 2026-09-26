// Repertorios del arte: recorre la home servida (ES y EN), pinta todo el arte (sin content-visibility) y reúne, por
// familia, los caracteres que pinta. Con --write reescribe ART_GREEK, ART_MATH y ART_CODE en scripts/subset-fonts.sh
// para que cada subconjunto lleve solo lo que se usa (después: bash scripts/subset-fonts.sh).
//   npx next start -p 3210 &   (tras npm run build)
//   npx tsx scripts/art-chars.mts [--base http://localhost:3210] [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const BASE = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'http://localhost:3210';
const FAMILIES: Record<string, string> = { greekHome: 'ART_GREEK', mathHome: 'ART_MATH', codeHome: 'ART_CODE' };

const browser = await chromium.launch({ executablePath: process.env.PW_CHROME ?? '/opt/pw-browsers/chromium' });
const used: Record<string, Set<string>> = Object.fromEntries(Object.keys(FAMILIES).map((f) => [f, new Set<string>()]));
try {
  for (const locale of ['es', 'en']) {
    for (const width of [1440, 390]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      await page.goto(`${BASE}/${locale}`, { waitUntil: 'networkidle' });
      await page.addStyleTag({ content: '.home .card-art, .home .cat-scene { content-visibility: visible !important; }' });
      await page.evaluate(() => document.fonts.ready);
      const found = await page.evaluate(() => {
        const acc: Record<string, string> = {};
        for (const art of document.querySelectorAll('.home .art')) {
          const walker = document.createTreeWalker(art, NodeFilter.SHOW_TEXT);
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const cs = getComputedStyle(n.parentElement!);
            const fam = cs.fontFamily.split(',')[0].trim().replace(/["']/g, '');
            acc[fam] = (acc[fam] ?? '') + (cs.textTransform === 'uppercase' ? (n.textContent ?? '').toUpperCase() : n.textContent ?? '');
          }
          for (const el of art.querySelectorAll('*')) {
            for (const pseudo of ['::before', '::after']) {
              const cs = getComputedStyle(el, pseudo);
              if (cs.content.startsWith('"')) {
                const fam = cs.fontFamily.split(',')[0].trim().replace(/["']/g, '');
                acc[fam] = (acc[fam] ?? '') + (JSON.parse(cs.content) as string);
              }
            }
          }
        }
        return acc;
      });
      for (const [fam, text] of Object.entries(found)) if (used[fam]) for (const ch of text) if (ch.trim()) used[fam].add(ch);
      await page.close();
    }
  }
} finally {
  await browser.close();
}

const out = Object.fromEntries(Object.entries(used).map(([fam, set]) => [FAMILIES[fam], [...set].sort().join('')]));
console.log(JSON.stringify(out, null, 1));
if (args.includes('--write')) {
  const path = new URL('./subset-fonts.sh', import.meta.url);
  let sh = readFileSync(path, 'utf8');
  const q = (t: string) => `'${t.replace(/'/g, `'"'"'`)}'`;
  for (const [name, chars] of Object.entries(out)) {
    // Siempre con el espacio y la puntuación mínima, aunque el arte de hoy no la pinte.
    const text = [...new Set(` ·.,:;${chars}`)].join('');
    sh = sh.replace(new RegExp(`^${name}=.*$`, 'm'), `${name}=${q(text)}`);
  }
  writeFileSync(path, sh);
  console.log('scripts/subset-fonts.sh actualizado: ejecuta bash scripts/subset-fonts.sh');
}
