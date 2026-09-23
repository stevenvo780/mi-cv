# Portada "El grafo" — Plan 1 (base, pipeline del grafo y home estática) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Subir mi-cv a Next 16 / React 19, corregir el SEO, construir el pipeline que convierte la trayectoria real de Steven en un grafo con 5 formas precalculadas, y sustituir la portada por una home narrativa en Server Components estáticos con el póster SVG del grafo. El resultado es publicable por sí solo.

**Architecture:**
- **Layout raíz:** `src/app/[locale]/layout.tsx` es el único layout raíz, estático para `es` y `en`.
- **Rutas:** la home vive en el grupo `(home)`; las subpáginas antiguas (frentes, lore) en `(portal)`, con Bootstrap y el Navbar de siempre.
- **Pipeline de build** (`scripts/build-graph.mts`, ejecutado en `prebuild`):
  1. `src/graph/sources.ts` construye un `GraphModel` a partir de `frentes.ts` y los JSON de `locales`.
  2. `src/graph/layouts.ts` calcula 5 formas.
  3. `src/graph/codec.ts` las serializa a binario.
  4. `src/graph/poster.ts` genera el SVG del primer frame.
- **Plan 2:** montará la escena WebGL sobre ese mismo artefacto.

**Tech Stack:** Next 16.3.6, React 19.3.0, TypeScript 5.9.3, geist 1.7.2, d3-force-3d 3.0.6, tsx, vitest 5.0.1, @playwright/test 1.63.0, lighthouse 13.5.0.

**Spec:** `docs/superpowers/specs/2026-09-23-home-grafo-design.md`

## Global Constraints

- **Entorno** (el disco raíz del host está lleno): antes de cualquier `npm`, `npx`, Playwright o Lighthouse, exporta:
  `export npm_config_cache=/workspace/.scratch-steven-redesign/npm-cache TMPDIR=/workspace/.scratch-steven-redesign/tmp && mkdir -p $TMPDIR`
- **Directorio de trabajo:** `/workspace/MySites/mi-cv` (symlink de `/workspace/prizma/Stev/mi-cv`), rama `redesign/home-grafo`.
- **Versiones exactas** (sin `^`):

  | Paquete | Versión |
  |---|---|
  | `next` | `16.3.6` |
  | `react` / `react-dom` | `19.3.0` |
  | `@types/react` / `@types/react-dom` | `19.3.0` |
  | `typescript` | `5.9.3` |
  | `eslint` | `9.39.5` |
  | `eslint-config-next` | `16.3.6` |
  | `geist` | `1.7.2` |
  | `d3-force-3d` | `3.0.6` |
  | `vitest` | `5.0.1` |
  | `@playwright/test` | `1.63.0` |
  | `tsx` | `4.23.15` |

  Lighthouse se ejecuta con `npx --yes lighthouse@13.5.0`.
- **URL canónica:** `SITE = 'https://www.stevenvallejo.com'`, con www en todo.
- **LinkedIn correcto:** `https://www.linkedin.com/in/steven-vallejo/`. GitHub: `https://github.com/stevenvo780`. Instagram: `https://www.instagram.com/stev_vallejo/`.
- **Idiomas:** `es` y `en`. `x-default` → `/en`. El `lang` del HTML es `es` o `en`.
- **Metadatos:** títulos ≤ 60 caracteres, descripciones ≤ 155.
- **Cifras:** en la home ninguna cifra es un literal escrito a mano; todas se derivan de datos del repo (`src/content/proof.ts`).
- **Marca:** no se toca el mark de `BrandLogo.tsx` ni `src/styles/brand.css`.
- **Commits:** en español, estilo `tipo(ámbito): resumen`, terminando con la línea `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`. Un commit por tarea como mínimo.
- **Git:** no hacer push ni merge. La publicación va aparte, al final del Plan 2.

## Mapa de archivos (Plan 1)

| Archivo | Responsabilidad |
|---|---|
| `package.json`, `eslint.config.mjs`, `next.config.mjs`, `vitest.config.mts`, `playwright.config.ts` | Tooling |
| `src/proxy.ts` (sustituye a `src/middleware.ts`) | Redirección de `/` y de rutas sin locale |
| `src/app/[locale]/layout.tsx` | Layout raíz: `<html lang>`, fuentes, metadata base, `generateStaticParams`, Analytics |
| `src/app/[locale]/not-found.tsx`, `src/app/global-not-found.tsx`, `src/components/NotFoundView.tsx` | 404 |
| `src/app/[locale]/(portal)/layout.tsx` | Bootstrap, FontAwesome, globals/brand CSS, SearchProvider y Navbar para las subpáginas antiguas |
| `src/app/[locale]/(portal)/[frente]/*`, `src/app/[locale]/(portal)/lore/*` | Subpáginas movidas, con metadata corregida |
| `src/app/[locale]/(home)/layout.tsx`, `src/app/[locale]/(home)/page.tsx` | Home nueva (RSC) |
| `src/app/[locale]/opengraph-image.tsx` | Imagen OG por locale |
| `src/app/sitemap.ts`, `src/app/robots.ts` | SEO |
| `src/lib/site.ts`, `src/lib/jsonld.ts`, `src/lib/text.ts` | URLs, alternates, JSON-LD, normalización de texto |
| `src/graph/model.ts`, `relations.ts`, `sources.ts` | Modelo del grafo y datos curados |
| `src/graph/layouts.ts`, `src/types/d3-force-3d.d.ts` | 5 formas |
| `src/graph/codec.ts`, `camera0.ts`, `palette.ts`, `poster.ts`, `artifacts.ts` | Binario, cámara inicial, colores, póster y ensamblado |
| `src/graph/generated/poster.ts`, `src/graph/generated/stats.ts` | Generados por el build (versionados) |
| `scripts/build-graph.mts` | Escribe `public/graph/graph.<hash>.{bin,json}` y los generados |
| `src/content/home.ts`, `src/content/proof.ts`, `src/content/timeline.ts` | Copy de la home, cifras y línea de tiempo |
| `src/components/home/*.tsx`, `src/styles/home.css` | Secciones de la home |
| `src/components/Analytics.tsx` | GA cargado tras la primera interacción |
| `tests/**/*.test.ts`, `e2e/*.spec.ts`, `scripts/lighthouse.mjs` | Verificación |

Desviaciones sobre la spec (también se actualizan en la spec en la Tarea 14):
- `NodeKind` no tiene `rol` (el rol va dentro del nodo `empresa`) y añade `grupo` (familias de herramientas).
- El copy va en un único `src/content/home.ts` tipado.
- GA se carga solo con la primera interacción, sin temporizador, para no sumar TBT.
- El binario no guarda puntos de control: la curvatura se calcula en el shader.
- El archivo del binario lleva hash de contenido para poder cachearlo como `immutable`.

---

### Task 1: Subir a Next 16.3.6 + React 19.3 y ESLint 9

**Files:**
- Modify: `package.json`
- Modify: `next.config.mjs`
- Create: `eslint.config.mjs`
- Delete: `.eslintrc.json`, `next-sitemap.config.js`, `src/middleware.ts`
- Create: `src/proxy.ts`
- Modify: `src/app/layout.tsx:124-141` (`headers()` asíncrono)
- Modify: `src/app/[locale]/layout.tsx:112-118,176-182` (`params` asíncrono)
- Modify: `src/app/[locale]/[frente]/page.tsx`, `src/app/[locale]/lore/page.tsx` (`params` asíncrono)

**Interfaces:**
- Produce: proyecto compilando en Next 16 con los scripts `lint`, `typecheck` y `build`. El layout raíz sigue leyendo `x-locale`, que se elimina en la Tarea 2.

- [ ] **Step 1: Actualizar dependencias**

```bash
cd /workspace/MySites/mi-cv
export npm_config_cache=/workspace/.scratch-steven-redesign/npm-cache TMPDIR=/workspace/.scratch-steven-redesign/tmp && mkdir -p $TMPDIR
npm uninstall next-sitemap
npm install --save-exact next@16.3.6 react@19.3.0 react-dom@19.3.0 @fortawesome/react-fontawesome@3.5.0 react-bootstrap@2.10.10
npm install --save-dev --save-exact @types/react@19.3.0 @types/react-dom@19.3.0 typescript@5.9.3 eslint@9.39.5 eslint-config-next@16.3.6 @types/node@22.19.0
```

Si `@types/node@22.19.0` no existe, usa la última 22.x (`npm view @types/node@22 version | tail -1`).

- [ ] **Step 2: Scripts de `package.json`**

Sustituye el bloque `scripts` por:

```json
"scripts": {
  "dev": "next dev",
  "build": "NODE_ENV=production next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit"
},
```

- [ ] **Step 3: ESLint con configuración plana**

Borra `.eslintrc.json` y crea `eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'public/**',
    'artifacts/**',
    'cv-pdf/**',
    'repos_analitics/**',
    'scripts/**/*.js',
  ]),
]);
```

- [ ] **Step 4: Proxy en lugar de middleware**

Borra `src/middleware.ts` y crea `src/proxy.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['es', 'en'] as const;
const DEFAULT_LOCALE = 'en';

function preferredLocale(request: NextRequest): string {
  const primary = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0]?.trim();
  return primary && (LOCALES as readonly string[]).includes(primary) ? primary : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/') {
    return NextResponse.redirect(new URL(`/${preferredLocale(request)}`, request.url));
  }

  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (!hasLocale) {
    return NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}${pathname}`, request.url));
  }

  // Temporal: el layout raíz aún lee x-locale. La Tarea 2 elimina esta cabecera.
  const locale = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))!;
  const headers = new Headers(request.headers);
  headers.set('x-locale', locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Excluye estáticos, rutas internas y cualquier archivo con extensión (sitemap.xml, robots.txt, icon.svg…).
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
```

- [ ] **Step 5: `headers()` y `params` asíncronos**

En `src/app/layout.tsx`, convierte `RootLayout` en asíncrono:

```tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = (await headers()).get('x-locale') ?? '';
  return (
    <html
      lang={HTML_LANG[locale] ?? 'en'}
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${jetbrainsMono.variable} ${cormorant.variable}`}
      prefix="og: http://ogp.me/ns#"
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
```

En `src/app/[locale]/layout.tsx`:
- La firma de `generateMetadata` pasa a `{ params }: { params: Promise<{ locale: string }> }`, con `const locale = resolveLocale((await params).locale);`.
- `LocaleLayout` pasa a ser `async`, con la misma firma de `params` y la misma línea.

En `src/app/[locale]/[frente]/page.tsx` y `src/app/[locale]/lore/page.tsx`: tipa `params` como `Promise<{ locale: string; frente: string }>` (o `Promise<{ locale: string }>` en lore), vuelve `async` el componente de página y usa `const { locale: raw, frente } = await params;`.

- [ ] **Step 6: `poweredByHeader` en `next.config.mjs`**

```js
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

- [ ] **Step 7: Verificar tipos, lint y build**

```bash
npm run typecheck && npm run lint && npm run build
```

Resultado esperado: los tres terminan con código 0 y el build lista `/[locale]`, `/[locale]/[frente]` y `/[locale]/lore`.

Si ESLint marca errores en componentes antiguos (`src/app/components/**`) que esta tarea no toca, corrígelos cuando el arreglo sea directo. Cuando exija reescribir el componente, añade `// eslint-disable-next-line <regla> -- componente heredado, fuera del alcance del rediseño` en esa línea. No desactives reglas globalmente.

- [ ] **Step 8: Smoke test**

```bash
npx next start -p 3100 & sleep 6
for p in /es /en /es/filosofia /es/lore /en/informatica; do printf "%s " $p; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100$p; done
curl -s -o /dev/null -w "/ -> %{http_code} %{redirect_url}\n" -H 'Accept-Language: es-CO,es;q=0.9' http://localhost:3100/
kill %1
```

Resultado esperado: 200 en las cinco rutas y `/ -> 307 http://localhost:3100/es`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "build: Next 16.3.6 + React 19.3, ESLint 9 flat config y proxy.ts

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Layout raíz estático en `[locale]` y grupos `(home)` / `(portal)`

**Files:**
- Delete: `src/app/layout.tsx`, `src/app/not-found.tsx`, `src/app/components/LocaleLangSync.tsx`
- Create: `src/app/[locale]/layout.tsx` (reescritura completa)
- Create: `src/components/NotFoundView.tsx`, `src/app/[locale]/not-found.tsx`, `src/app/global-not-found.tsx`
- Create: `src/app/[locale]/(portal)/layout.tsx`
- Move: `src/app/[locale]/[frente]/` → `src/app/[locale]/(portal)/[frente]/`; `src/app/[locale]/lore/` → `src/app/[locale]/(portal)/lore/`; `src/app/[locale]/page.tsx` → `src/app/[locale]/(portal)/page.tsx` (temporal, la Tarea 11 lo sustituye)
- Modify: `src/proxy.ts` (se quita `x-locale`), `next.config.mjs` (`experimental.globalNotFound`)
- Add dependency: `geist@1.7.2`

**Interfaces:**
- Consume: nada nuevo.
- Produce:
  - `<html lang="es|en">` renderizado en el servidor sin `headers()`: la home y las subpáginas quedan estáticas.
  - Variables de fuente en `<html>`:
    - `--font-geist-sans`;
    - `--font-display` (Cormorant 500/600, precargada);
    - `--font-cormorant` (todas las variantes, sin precarga);
    - `--font-jetbrains` (sin precarga);
    - `--font-inter` (sin precarga, la usan las subpáginas vía `brand.css`).

- [ ] **Step 1: Instalar Geist**

```bash
npm install --save-exact geist@1.7.2
```

- [ ] **Step 2: Mover rutas a grupos**

```bash
mkdir -p "src/app/[locale]/(portal)" "src/app/[locale]/(home)"
git mv "src/app/[locale]/[frente]" "src/app/[locale]/(portal)/[frente]"
git mv "src/app/[locale]/lore" "src/app/[locale]/(portal)/lore"
git mv "src/app/[locale]/page.tsx" "src/app/[locale]/(portal)/page.tsx"
git rm src/app/layout.tsx src/app/not-found.tsx src/app/components/LocaleLangSync.tsx
```

Tras el movimiento, corrige los imports relativos rotos (`../components/...`) en los archivos movidos y pásalos al alias `@/app/components/...`.

- [ ] **Step 3: Layout raíz `src/app/[locale]/layout.tsx`**

Reescríbelo por completo. La metadata de producto de la home llega en la Tarea 9; aquí solo va la base.

```tsx
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { GeistSans } from 'geist/font/sans';
import { Cormorant_Garamond, Inter, JetBrains_Mono } from 'next/font/google';
import { LOCALES, SITE, isLocale } from '@/lib/site';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600'],
  variable: '--font-display',
  display: 'swap',
  preload: true,
});
const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
  preload: false,
});
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap', preload: false });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: false });

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Steven Vallejo Ortiz · Mouseîon', template: '%s · Mouseîon' },
  applicationName: 'Mouseîon',
  authors: [{ name: 'Steven Vallejo Ortiz', url: SITE }],
  creator: 'Steven Vallejo Ortiz',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  formatDetection: { email: false, address: false, telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#05090b',
  colorScheme: 'dark',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${display.variable} ${cormorant.variable} ${jetbrains.variable} ${inter.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

`@/lib/site` se crea en la Tarea 3. Para compilar esta tarea, crea ya `src/lib/site.ts` con el contenido completo del Step 3 de la Tarea 3; la Tarea 3 le añade los tests.

- [ ] **Step 4: Layout del grupo `(portal)`**

Crea `src/app/[locale]/(portal)/layout.tsx`. Conserva el orden de CSS que tenía el layout raíz antiguo (Bootstrap primero, marca después) para que las subpáginas no cambien:

```tsx
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/styles/globals.css';
import '@/styles/brand.css';
import { config } from '@fortawesome/fontawesome-svg-core';
import CustomNavbar from '@/app/components/Navbar';
import { SearchProvider } from '@/app/components/SearchContext';

config.autoAddCss = false;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SearchProvider>
      <CustomNavbar />
      {children}
    </SearchProvider>
  );
}
```

- [ ] **Step 5: 404 compartido**

Crea `src/components/NotFoundView.tsx`. Lleva sus propios estilos inline, porque el 404 global no carga CSS de rutas:

```tsx
import Link from 'next/link';

export default function NotFoundView({ locale }: { locale: 'es' | 'en' }) {
  const t =
    locale === 'es'
      ? { title: 'Esta página no existe', lead: 'El enlace está roto o la página se movió.', back: 'Volver al inicio' }
      : { title: 'This page does not exist', lead: 'The link is broken or the page has moved.', back: 'Back to home' };
  return (
    <main
      style={{
        minHeight: '100svh',
        display: 'grid',
        placeContent: 'center',
        gap: '1rem',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        background: '#05090b',
        color: '#e8e0d4',
        fontFamily: 'var(--font-geist-sans), system-ui, sans-serif',
      }}
    >
      <p style={{ fontFamily: 'var(--font-jetbrains), monospace', letterSpacing: '0.2em', color: '#43b5a6', margin: 0 }}>404</p>
      <h1 style={{ fontFamily: 'var(--font-display), Georgia, serif', fontWeight: 500, fontSize: 'clamp(2.2rem, 6vw, 4rem)', margin: 0 }}>{t.title}</h1>
      <p style={{ color: '#c9c2b6', margin: 0 }}>{t.lead}</p>
      <Link href={`/${locale}`} style={{ color: '#e0a85e' }}>
        {t.back}
      </Link>
    </main>
  );
}
```

Crea `src/app/[locale]/not-found.tsx`:

```tsx
import type { Metadata } from 'next';
import NotFoundView from '@/components/NotFoundView';

export const metadata: Metadata = { title: '404', robots: { index: false, follow: false } };

export default function LocaleNotFound() {
  return <NotFoundView locale="en" />;
}
```

`not-found` no recibe `params`, así que muestra el texto en inglés; el enlace vuelve a `/en`.

Crea `src/app/global-not-found.tsx`:

```tsx
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import NotFoundView from '@/components/NotFoundView';

export const metadata: Metadata = { title: '404 · Mouseîon', robots: { index: false, follow: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body style={{ margin: 0 }}>
        <NotFoundView locale="en" />
      </body>
    </html>
  );
}
```

En `next.config.mjs` añade `experimental: { globalNotFound: true },` dentro de `nextConfig`. Si el build avisa de que la opción ya es estable o de que no existe, sigue la indicación del aviso.

- [ ] **Step 6: Quitar `x-locale` del proxy**

En `src/proxy.ts` sustituye las cuatro últimas líneas de `proxy()` (el bloque "Temporal…") por:

```ts
  return NextResponse.next();
```

- [ ] **Step 7: Rutas estáticas en frentes**

En `src/app/[locale]/(portal)/[frente]/page.tsx`, añade encima de `generateMetadata`:

```ts
export const dynamicParams = false;

export function generateStaticParams() {
  return VALID_FRENTES.map((frente) => ({ frente }));
}
```

- [ ] **Step 8: Verificar**

```bash
npm run typecheck && npm run lint && npm run build 2>&1 | tee /workspace/.scratch-steven-redesign/build-t2.log | tail -40
```

Resultado esperado: `/[locale]`, `/[locale]/[frente]` y `/[locale]/lore` salen como estáticos (● SSG o ○) y **no** como dinámicos (ƒ).

```bash
npx next start -p 3100 & sleep 6
curl -s http://localhost:3100/es | grep -o '<html[^>]*>'
curl -sI http://localhost:3100/es | grep -i -E 'cache-control|x-nextjs'
for p in /es/filosofia /es/lore /en/no-existe; do printf "%s " $p; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3100$p; done
kill %1
```

Resultado esperado:
- `<html lang="es" class="...">`.
- `cache-control` sin `no-store`.
- 200, 200 y 404.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "refactor(app): layout raíz estático en [locale], grupos (home)/(portal) y 404 global

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Vitest y utilidades de sitio (`site.ts`, `text.ts`)

**Files:**
- Create: `vitest.config.mts`, `src/lib/site.ts`, `src/lib/text.ts`
- Test: `tests/lib/site.test.ts`, `tests/lib/text.test.ts`
- Modify: `package.json` (script `test`, devDependency `vitest`)

**Interfaces:**
- Produce:
  - `SITE`, `LOCALES`, `type Locale`, `DEFAULT_LOCALE`, `OG_LOCALE`, `PROFILES`.
  - `isLocale(v: string | undefined): v is Locale`.
  - `toLocale(v: string | undefined): Locale`.
  - `localeUrl(locale: Locale, path?: string): string`.
  - `pageAlternates(locale: Locale, path?: string): { canonical: string; languages: { es: string; en: string; 'x-default': string } }`.
  - `clampDescription(text: string, max?: number): string`.
  - `normalizeSearch(text: string): string`.

- [ ] **Step 1: Instalar vitest y configurar**

```bash
npm install --save-dev --save-exact vitest@5.0.1
```

Añade en `package.json` → `scripts`: `"test": "vitest run"`.

Crea `vitest.config.mts`:

```ts
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
```

- [ ] **Step 2: Escribir los tests (fallan)**

`tests/lib/site.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { SITE, clampDescription, isLocale, localeUrl, pageAlternates, toLocale } from '@/lib/site';

describe('site', () => {
  it('usa el dominio con www', () => {
    expect(SITE).toBe('https://www.stevenvallejo.com');
  });
  it('reconoce locales', () => {
    expect(isLocale('es')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(toLocale('es')).toBe('es');
    expect(toLocale('fr')).toBe('en');
  });
  it('construye URLs de locale', () => {
    expect(localeUrl('es')).toBe('https://www.stevenvallejo.com/es');
    expect(localeUrl('en', '/lore')).toBe('https://www.stevenvallejo.com/en/lore');
  });
  it('alternates propios de cada página con x-default a inglés', () => {
    expect(pageAlternates('es', '/filosofia')).toEqual({
      canonical: 'https://www.stevenvallejo.com/es/filosofia',
      languages: {
        es: 'https://www.stevenvallejo.com/es/filosofia',
        en: 'https://www.stevenvallejo.com/en/filosofia',
        'x-default': 'https://www.stevenvallejo.com/en/filosofia',
      },
    });
  });
  it('recorta descripciones por palabra sin superar el máximo', () => {
    const long = 'palabra '.repeat(40).trim();
    const out = clampDescription(long, 155);
    expect(out.length).toBeLessThanOrEqual(155);
    expect(out.endsWith('…')).toBe(true);
    expect(clampDescription('corta', 155)).toBe('corta');
  });
});
```

`tests/lib/text.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { normalizeSearch } from '@/lib/text';

describe('normalizeSearch', () => {
  it('quita tildes y pasa a minúsculas', () => {
    expect(normalizeSearch('Lógica FORMAL · Órganon')).toBe('logica formal · organon');
  });
});
```

Run: `npx vitest run tests/lib` → Expected: FAIL (`Cannot find module '@/lib/text'`, o `clampDescription` no exportado si `site.ts` ya existe desde la Tarea 2).

- [ ] **Step 3: Implementar**

`src/lib/site.ts`:

```ts
export const SITE = 'https://www.stevenvallejo.com';
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
export const OG_LOCALE: Record<Locale, string> = { es: 'es_ES', en: 'en_US' };

export const PROFILES = {
  github: 'https://github.com/stevenvo780',
  linkedin: 'https://www.linkedin.com/in/steven-vallejo/',
  instagram: 'https://www.instagram.com/stev_vallejo/',
} as const;

export function isLocale(value: string | undefined): value is Locale {
  return value === 'es' || value === 'en';
}

export function toLocale(value: string | undefined): Locale {
  return value === 'es' ? 'es' : 'en';
}

/** `path` es relativo a la raíz del locale: '' (home), '/lore', '/filosofia'. */
export function localeUrl(locale: Locale, path = ''): string {
  return `${SITE}/${locale}${path}`;
}

export function pageAlternates(locale: Locale, path = '') {
  return {
    canonical: localeUrl(locale, path),
    languages: {
      es: localeUrl('es', path),
      en: localeUrl('en', path),
      'x-default': localeUrl('en', path),
    },
  };
}

export function clampDescription(text: string, max = 155): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:—-]+$/u, '')}…`;
}
```

`src/lib/text.ts`:

```ts
export function normalizeSearch(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
```

- [ ] **Step 4: Verificar**

Run: `npm test` → Expected: PASS (2 archivos, 6 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: vitest y utilidades de sitio (URLs canónicas con www, alternates, texto)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---
### Task 4: Modelo del grafo desde los datos reales

**Files:**
- Create: `src/graph/model.ts`, `src/graph/relations.ts`, `src/graph/sources.ts`
- Test: `tests/graph/sources.test.ts`

**Interfaces:**
- Consume:
  - `productos`, `frentesMeta`, `FrenteId` de `@/data/frentes`.
  - `@/locales/{es,en}/common/experience.json` y `tools.json`.
- Produce:
  - `type NodeKind = 'self' | 'frente' | 'empresa' | 'producto' | 'grupo' | 'tecnologia' | 'concepto'`
  - `type RelKind = 'agrupa' | 'pertenece-a' | 'trabajo-en' | 'construyo' | 'usa' | 'fundamenta'`
  - `interface Bilingual { es: string; en: string }`
  - `interface GNode { id: string; kind: NodeKind; label: Bilingual; frente?: FrenteId; year?: number; month?: number; yearEnd?: number | null; role?: Bilingual; url?: string; weight: number }`
  - `interface GEdge { source: string; target: string; rel: RelKind; weight: number }`
  - `interface GraphModel { nodes: GNode[]; edges: GEdge[] }`
  - `parseDates(range: string): { year: number; month: number; yearEnd: number | null }`
  - `buildGraphModel(): GraphModel`
  - `nodeId` (fábricas de ids)
  - Desde `relations.ts`: `EMPRESAS`, `TOOL_GROUPS`, `type ToolGroupId`, `EXTRA_PROJECTS`, `EMPRESA_PROYECTOS`, `PRODUCT_TECH`, `CONCEPT_PRODUCTS`, `BRIDGE_PRODUCTS`.

- [ ] **Step 1: Tipos del modelo**

`src/graph/model.ts`:

```ts
import type { FrenteId } from '@/data/frentes';

export type NodeKind = 'self' | 'frente' | 'empresa' | 'producto' | 'grupo' | 'tecnologia' | 'concepto';
export type RelKind = 'agrupa' | 'pertenece-a' | 'trabajo-en' | 'construyo' | 'usa' | 'fundamenta';

export interface Bilingual {
  es: string;
  en: string;
}

export interface GNode {
  /** Único, con prefijo por tipo: 'self', 'frente:filosofia', 'producto:agora', 'empresa:critertec', 'grupo:backend', 'tec:nodejs'. */
  id: string;
  kind: NodeKind;
  label: Bilingual;
  frente?: FrenteId;
  /** Empresas: año y mes de inicio. */
  year?: number;
  month?: number;
  /** Empresas: año de fin; null = actualidad. */
  yearEnd?: number | null;
  role?: Bilingual;
  url?: string;
  /** Importancia visual 1..5. */
  weight: number;
}

export interface GEdge {
  source: string;
  target: string;
  rel: RelKind;
  weight: number;
}

export interface GraphModel {
  nodes: GNode[];
  edges: GEdge[];
}
```

- [ ] **Step 2: Relaciones curadas**

`src/graph/relations.ts`:

```ts
import type { FrenteId } from '@/data/frentes';
import type { Bilingual } from './model';

/** Claves de experience.json, en el orden canónico del CV. */
export const EMPRESAS = [
  'critertec',
  'humanizar',
  'fincaDirecta',
  'indieLevels',
  'zenit',
  'ins',
  'kambban',
  'sena',
  'iqpixels',
  'infraestructura',
  'videojuegos',
  'appsWeb',
] as const;
export type EmpresaKey = (typeof EMPRESAS)[number];

export const EMPRESAS_PRINCIPALES: ReadonlySet<EmpresaKey> = new Set(['critertec', 'humanizar', 'fincaDirecta', 'indieLevels']);

/** Proyectos de achievements.json que no son productos de frentes.ts. */
export const EXTRA_PROJECTS: { id: string; label: Bilingual; frente: FrenteId }[] = [
  { id: 'soy-digital', label: { es: 'Soy Digital · INDOTEL', en: 'Soy Digital · INDOTEL' }, frente: 'informatica' },
  { id: 'sinergia-pos', label: { es: 'Sinergia POS', en: 'Sinergia POS' }, frente: 'enterprise' },
  { id: 'fiar', label: { es: 'FIAR', en: 'FIAR' }, frente: 'enterprise' },
  { id: 'emw', label: { es: 'EMW', en: 'EMW' }, frente: 'informatica' },
  { id: 'mera-vuelta', label: { es: 'Mera Vuelta', en: 'Mera Vuelta' }, frente: 'informatica' },
  { id: 'cafeteria-del-caos', label: { es: 'Cafetería del Caos', en: 'Cafetería del Caos' }, frente: 'filosofia' },
];

/** Empresa → proyectos construidos allí (evidencia: achievements.json y frentes.ts). */
export const EMPRESA_PROYECTOS: Partial<Record<EmpresaKey, string[]>> = {
  humanizar: ['cauce-v3', 'eikon', 'graf', 'demeter', 'sinergia-pos', 'fiar'],
  critertec: ['soy-digital'],
};

export type ToolGroupId =
  | 'backend'
  | 'frontend'
  | 'cloud'
  | 'datos'
  | 'mensajeria'
  | 'protocolos'
  | 'ia'
  | 'aiTools'
  | 'juegos'
  | 'gestion'
  | 'paradigmas'
  | 'logica';

/** Cada clave `tools.item.*` de tools.json pertenece exactamente a un grupo (lo verifica un test). */
export const TOOL_GROUPS: Record<ToolGroupId, { label: Bilingual; frente: FrenteId; tools: string[] }> = {
  backend: {
    label: { es: 'Back-end', en: 'Back-end' },
    frente: 'informatica',
    tools: ['nodejs', 'typescript', 'nestjs', 'hapi', 'python', 'express', 'php', 'laravel', 'symfony', 'slim', 'bash', 'dotnet', 'C#', 'flask', 'pysimplegui', 'blockchain'],
  },
  frontend: {
    label: { es: 'Front-end', en: 'Front-end' },
    frente: 'informatica',
    tools: ['reactjs', 'javascript', 'html', 'css3', 'nextjs', 'reactNative', 'laravelBlade', 'vuejs', 'angular'],
  },
  cloud: {
    label: { es: 'DevOps y cloud', en: 'DevOps & cloud' },
    frente: 'informatica',
    tools: ['git', 'linuxHosting', 'googleCloud', 'vercel', 'aws', 'docker', 'azure', 'render', 'gitActions', 'googleArtifacts'],
  },
  datos: {
    label: { es: 'Bases de datos', en: 'Databases' },
    frente: 'informatica',
    tools: ['relationalDB', 'nosql', 'graphDB', 'inMemory', 'dynamodb', 'couchDB', 'cassandra', 'elasticSearch', 'neon', 'redis', 'sqlite', 'mysql', 'MariaDB', 'postgresql', 'neo4j', 'mongodb', 'firebase'],
  },
  mensajeria: {
    label: { es: 'Mensajería y colas', en: 'Messaging & queues' },
    frente: 'informatica',
    tools: ['rabbitmq', 'amazonSQS', 'googlePubSub', 'zeroMQ', 'apacheKafka', 'sqs', 'mqtt'],
  },
  protocolos: {
    label: { es: 'Protocolos y APIs', en: 'Protocols & APIs' },
    frente: 'informatica',
    tools: ['rest', 'graphql', 'soap', 'rpc', 'websocket', 'grpc'],
  },
  ia: {
    label: { es: 'IA y cómputo científico', en: 'AI & scientific computing' },
    frente: 'ciencias',
    tools: ['numpy', 'tensorflow', 'huggingface', 'stableDiffusion', 'cuda', 'parallelization', 'pytorch', 'opencv', 'pandas', 'cupy', 'keras', 'matplotlib', 'whisper', 'llama'],
  },
  aiTools: {
    label: { es: 'Modelos y asistentes de IA', en: 'AI models & assistants' },
    frente: 'informatica',
    tools: ['chatgpt', 'githubCopilot', 'googleCloudAI', 'deebseek', 'claude', 'googleGemini', 'openia'],
  },
  juegos: {
    label: { es: 'Videojuegos y XR', en: 'Games & XR' },
    frente: 'informatica',
    tools: ['unity', 'vr', 'ar', 'capturaDeDatos', 'roblox', 'decentraland'],
  },
  gestion: {
    label: { es: 'Gestión de proyectos', en: 'Project management' },
    frente: 'informatica',
    tools: ['scrum', 'trello', 'tdd', 'kanban', 'jira', 'clickup', 'notion', 'excel', 'advance_documents'],
  },
  paradigmas: {
    label: { es: 'Paradigmas', en: 'Paradigms' },
    frente: 'informatica',
    tools: ['objectOriented', 'functional', 'procedural', 'eventDriven', 'logicProgramming', 'declarative', 'reactive', 'concurrent', 'aspectOriented', 'metaprogramming', 'structuredProgramming', 'cqs'],
  },
  logica: {
    label: { es: 'Lógica y filosofía', en: 'Logic & philosophy' },
    frente: 'filosofia',
    tools: ['formalLogic', 'symbolicLogic', 'analyticPhilosophy', 'epistemology', 'philosophyOfMind', 'philosophyOfAI', 'ethics', 'argumentation', 'typeTheory', 'satSolving'],
  },
};

/** Producto → herramientas mencionadas en su descripción de frentes.ts o achievements.json. */
export const PRODUCT_TECH: Record<string, string[]> = {
  agora: ['nestjs', 'nextjs', 'docker', 'websocket', 'googleCloud'],
  clavis: ['nextjs'],
  debatesuite: ['javascript'],
  complexlab: ['nextjs', 'python'],
  'nlp-to-logic': ['vercel', 'logicProgramming'],
  stevenai: ['llama', 'deebseek', 'python', 'cuda', 'nextjs'],
  stevendevbox: ['whisper', 'bash', 'linuxHosting'],
  communityos: ['nestjs', 'neon', 'postgresql', 'typescript'],
  devkits: ['reactjs', 'express', 'nextjs', 'flask', 'docker'],
  'devkits-hours': ['nextjs', 'sqlite'],
  'devkits-crm': ['reactjs', 'express', 'neon', 'postgresql', 'vercel'],
  scrapekit: ['python', 'neon', 'vercel'],
  warehouse: ['reactjs', 'neon', 'vercel'],
  aporia: ['nextjs', 'neon', 'firebase'],
  'cauce-v3': ['claude', 'googleGemini', 'openia', 'docker', 'typescript', 'eventDriven'],
  eikon: ['typescript'],
  prizma: ['nestjs', 'nextjs', 'googleCloud', 'eventDriven'],
  graf: ['nestjs'],
  'soy-digital': ['javascript'],
  emw: ['nestjs', 'mysql', 'redis'],
  'sinergia-pos': ['nestjs'],
  fiar: ['nestjs'],
};

/** Concepto (clave de tools.json del grupo 'logica') → productos que fundamenta. */
export const CONCEPT_PRODUCTS: Record<string, string[]> = {
  formalLogic: ['agora', 'nlp-to-logic'],
  symbolicLogic: ['nlp-to-logic'],
  satSolving: ['agora', 'nlp-to-logic'],
  typeTheory: ['nlp-to-logic'],
  analyticPhilosophy: ['clavis', 'debatesuite'],
  argumentation: ['debatesuite', 'cafeteria-del-caos'],
  epistemology: ['estructuras-preontologicas', 'complexlab'],
  philosophyOfMind: ['clavis'],
  philosophyOfAI: ['stevenai', 'cauce-v3'],
};

/** Productos que unen lógica/filosofía e ingeniería (franja central de la forma "hemisferios"). */
export const BRIDGE_PRODUCTS: ReadonlySet<string> = new Set(['nlp-to-logic', 'complexlab', 'estructuras-preontologicas', 'clavis']);
```

- [ ] **Step 3: Escribir los tests (fallan)**

`tests/graph/sources.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import toolsEs from '@/locales/es/common/tools.json';
import { productos } from '@/data/frentes';
import { buildGraphModel, nodeId, parseDates } from '@/graph/sources';
import { CONCEPT_PRODUCTS, EMPRESAS, PRODUCT_TECH, TOOL_GROUPS } from '@/graph/relations';

describe('parseDates', () => {
  it('lee rangos cerrados con mes', () => {
    expect(parseDates('2024/11 - 2026/06')).toEqual({ year: 2024, month: 11, yearEnd: 2026 });
  });
  it('lee rangos abiertos en ES y EN y sin mes', () => {
    expect(parseDates('2022 - Actualidad')).toEqual({ year: 2022, month: 1, yearEnd: null });
    expect(parseDates('2014/02 - ACTUALIDAD')).toEqual({ year: 2014, month: 2, yearEnd: null });
    expect(parseDates('2018 - Present')).toEqual({ year: 2018, month: 1, yearEnd: null });
  });
  it('rechaza texto sin fecha', () => {
    expect(() => parseDates('hace tiempo')).toThrow();
  });
});

describe('buildGraphModel', () => {
  const g = buildGraphModel();
  const ids = new Set(g.nodes.map((n) => n.id));

  it('ids únicos', () => {
    expect(ids.size).toBe(g.nodes.length);
  });

  it('aristas válidas y sin duplicados', () => {
    const keys = new Set<string>();
    for (const e of g.edges) {
      expect(ids.has(e.source), e.source).toBe(true);
      expect(ids.has(e.target), e.target).toBe(true);
      const key = [e.source, e.target].sort().join('|');
      expect(keys.has(key), key).toBe(false);
      keys.add(key);
    }
  });

  it('tamaño semántico entre 150 y 300 nodos', () => {
    expect(g.nodes.length).toBeGreaterThanOrEqual(150);
    expect(g.nodes.length).toBeLessThanOrEqual(300);
  });

  it('cada producto de frentes.ts es un nodo unido a su frente', () => {
    for (const p of productos) {
      const id = nodeId.producto(p.id);
      const node = g.nodes.find((n) => n.id === id);
      expect(node?.frente).toBe(p.frente);
      expect(g.edges.some((e) => e.source === nodeId.frente(p.frente) && e.target === id)).toBe(true);
    }
  });

  it('cada herramienta de tools.json está en exactamente un grupo', () => {
    const items = Object.keys(toolsEs)
      .filter((k) => k.startsWith('tools.item.'))
      .map((k) => k.slice('tools.item.'.length));
    const grouped = Object.values(TOOL_GROUPS).flatMap((g2) => g2.tools);
    expect(new Set(grouped).size).toBe(grouped.length);
    expect([...grouped].sort()).toEqual([...items].sort());
  });

  it('las relaciones curadas solo usan ids existentes', () => {
    for (const [p, tools] of Object.entries(PRODUCT_TECH)) {
      expect(ids.has(nodeId.producto(p)), p).toBe(true);
      for (const t of tools) expect(ids.has(nodeId.tec(t)), t).toBe(true);
    }
    for (const [c, prods] of Object.entries(CONCEPT_PRODUCTS)) {
      expect(ids.has(nodeId.tec(c)), c).toBe(true);
      for (const p of prods) expect(ids.has(nodeId.producto(p)), p).toBe(true);
    }
  });

  it('todas las empresas tienen año de inicio y rol bilingüe', () => {
    for (const key of EMPRESAS) {
      const n = g.nodes.find((x) => x.id === nodeId.empresa(key));
      expect(n?.year, key).toBeGreaterThan(2010);
      expect(n?.role?.es && n?.role?.en, key).toBeTruthy();
    }
  });

  it('es conexo desde self', () => {
    const adj = new Map<string, string[]>();
    for (const e of g.edges) {
      adj.set(e.source, [...(adj.get(e.source) ?? []), e.target]);
      adj.set(e.target, [...(adj.get(e.target) ?? []), e.source]);
    }
    const seen = new Set(['self']);
    const queue = ['self'];
    while (queue.length) for (const next of adj.get(queue.shift()!) ?? []) if (!seen.has(next)) (seen.add(next), queue.push(next));
    expect(seen.size).toBe(g.nodes.length);
  });

  it('es determinista', () => {
    expect(buildGraphModel()).toEqual(g);
  });
});
```

Run: `npx vitest run tests/graph/sources.test.ts` → Expected: FAIL (`Cannot find module '@/graph/sources'`).

- [ ] **Step 4: Implementar `sources.ts`**

`src/graph/sources.ts`:

```ts
import { frentesMeta, productos } from '@/data/frentes';
import expEs from '@/locales/es/common/experience.json';
import expEn from '@/locales/en/common/experience.json';
import toolsEs from '@/locales/es/common/tools.json';
import toolsEn from '@/locales/en/common/tools.json';
import type { Bilingual, GEdge, GNode, GraphModel, RelKind } from './model';
import {
  CONCEPT_PRODUCTS,
  EMPRESAS,
  EMPRESAS_PRINCIPALES,
  EMPRESA_PROYECTOS,
  EXTRA_PROJECTS,
  PRODUCT_TECH,
  TOOL_GROUPS,
  type ToolGroupId,
} from './relations';

type Dict = Record<string, string>;
const EXP = { es: expEs as Dict, en: expEn as Dict };
const TOOLS = { es: toolsEs as Dict, en: toolsEn as Dict };

export const nodeId = {
  self: 'self',
  frente: (id: string) => `frente:${id}`,
  producto: (id: string) => `producto:${id}`,
  empresa: (id: string) => `empresa:${id}`,
  grupo: (id: string) => `grupo:${id}`,
  tec: (id: string) => `tec:${id}`,
};

export function parseDates(range: string): { year: number; month: number; yearEnd: number | null } {
  const m = range.match(/^(\d{4})(?:\/(\d{1,2}))?\s*-\s*(?:(\d{4})(?:\/\d{1,2})?|\p{L}+)$/u);
  if (!m) throw new Error(`Fecha no reconocida: "${range}"`);
  return { year: Number(m[1]), month: m[2] ? Number(m[2]) : 1, yearEnd: m[3] ? Number(m[3]) : null };
}

function bilingual(key: string, dict: { es: Dict; en: Dict }): Bilingual {
  const es = dict.es[key];
  const en = dict.en[key];
  if (!es || !en) throw new Error(`Falta la clave "${key}" en es o en`);
  return { es, en };
}

/** "ReactJS (Redux, sagas, ReactContext)" → "ReactJS". */
function shortLabel(label: string): string {
  return label.split(' (')[0].trim();
}

export function buildGraphModel(): GraphModel {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const seen = new Set<string>();
  const addEdge = (source: string, target: string, rel: RelKind, weight: number) => {
    const key = [source, target].sort().join('|');
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source, target, rel, weight });
  };

  nodes.push({ id: nodeId.self, kind: 'self', label: { es: 'Steven Vallejo Ortiz', en: 'Steven Vallejo Ortiz' }, weight: 5 });

  for (const f of Object.values(frentesMeta)) {
    nodes.push({ id: nodeId.frente(f.id), kind: 'frente', label: f.nombre, frente: f.id, weight: 4 });
    addEdge(nodeId.self, nodeId.frente(f.id), 'agrupa', 3);
  }

  for (const p of productos) {
    nodes.push({
      id: nodeId.producto(p.id),
      kind: 'producto',
      label: { es: p.nombre, en: p.nombre },
      frente: p.frente,
      url: p.url,
      weight: p.banner || p.featured ? 3 : 2,
    });
    addEdge(nodeId.frente(p.frente), nodeId.producto(p.id), 'pertenece-a', 2);
  }
  for (const x of EXTRA_PROJECTS) {
    nodes.push({ id: nodeId.producto(x.id), kind: 'producto', label: x.label, frente: x.frente, weight: 1 });
    addEdge(nodeId.frente(x.frente), nodeId.producto(x.id), 'pertenece-a', 1);
  }

  for (const key of EMPRESAS) {
    const { year, month, yearEnd } = parseDates(EXP.es[`experience.dates.${key}`]);
    nodes.push({
      id: nodeId.empresa(key),
      kind: 'empresa',
      label: bilingual(`experience.${key}`, EXP),
      role: bilingual(`experience.role.${key}`, EXP),
      year,
      month,
      yearEnd,
      weight: EMPRESAS_PRINCIPALES.has(key) ? 3 : 2,
    });
    addEdge(nodeId.self, nodeId.empresa(key), 'trabajo-en', 2);
  }
  for (const [empresa, proyectos] of Object.entries(EMPRESA_PROYECTOS)) {
    for (const p of proyectos ?? []) addEdge(nodeId.empresa(empresa), nodeId.producto(p), 'construyo', 2);
  }

  for (const [gid, group] of Object.entries(TOOL_GROUPS) as [ToolGroupId, (typeof TOOL_GROUPS)[ToolGroupId]][]) {
    nodes.push({ id: nodeId.grupo(gid), kind: 'grupo', label: group.label, frente: group.frente, weight: 2 });
    addEdge(nodeId.frente(group.frente), nodeId.grupo(gid), 'agrupa', 1);
    for (const tool of group.tools) {
      const label = bilingual(`tools.item.${tool}`, TOOLS);
      nodes.push({
        id: nodeId.tec(tool),
        kind: gid === 'logica' ? 'concepto' : 'tecnologia',
        label: { es: shortLabel(label.es), en: shortLabel(label.en) },
        frente: group.frente,
        weight: 1,
      });
      addEdge(nodeId.grupo(gid), nodeId.tec(tool), 'agrupa', 1);
    }
  }

  for (const [p, tools] of Object.entries(PRODUCT_TECH)) for (const t of tools) addEdge(nodeId.producto(p), nodeId.tec(t), 'usa', 1);
  for (const [c, prods] of Object.entries(CONCEPT_PRODUCTS)) for (const p of prods) addEdge(nodeId.tec(c), nodeId.producto(p), 'fundamenta', 1);

  const ids = new Set(nodes.map((n) => n.id));
  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target)) throw new Error(`Arista colgante: ${e.source} → ${e.target}`);
  }
  return { nodes, edges };
}
```

- [ ] **Step 5: Verificar**

Run: `npx vitest run tests/graph/sources.test.ts` → Expected: PASS (12 tests). Si falla "tamaño semántico", imprime `g.nodes.length` y revisa que ningún grupo se haya omitido. Hay que corregir el dato, no el umbral.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(graph): modelo del grafo desde frentes, experiencia y herramientas reales

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Las 5 formas del grafo (layouts precalculados)

**Files:**
- Create: `src/types/d3-force-3d.d.ts`, `src/graph/layouts.ts`
- Test: `tests/graph/layouts.test.ts`
- Add devDependency: `d3-force-3d@3.0.6`

**Interfaces:**
- Consume: `GraphModel`, `GNode` (Tarea 4); `BRIDGE_PRODUCTS` (Tarea 4).
- Produce:
  - `LAYOUT_NAMES = ['red', 'hemisferios', 'helice', 'clusters', 'lemniscata'] as const`
  - `type LayoutName`
  - `type Layouts = Record<LayoutName, Float32Array>` (cada array mide N×3)
  - `mulberry32(seed: number): () => number`
  - `normalize(p: Float32Array, center?: boolean): Float32Array`
  - `layoutRed`, `layoutHemisferios`, `layoutHelice`, `layoutClusters`, `layoutLemniscata`
  - `computeLayouts(model: GraphModel, seed?: number): Layouts`
  - `hemisphereSide(node: GNode): -1 | 0 | 1`
  - `clusterOf(model: GraphModel): FrenteId[]` (frente asignado a cada nodo, por índice)
  - `CLUSTER_CENTERS: Record<FrenteId, [number, number, number]>`

- [ ] **Step 1: Instalar y declarar tipos**

```bash
npm install --save-dev --save-exact d3-force-3d@3.0.6
grep -n "randomSource" node_modules/d3-force-3d/src/simulation.js
```

Resultado esperado: aparece `randomSource`. Si no aparece, quita la llamada `.randomSource(...)` de `layoutRed`; el test de determinismo confirmará si la colocación inicial por filotaxis de d3 basta.

`src/types/d3-force-3d.d.ts`:

```ts
declare module 'd3-force-3d' {
  export interface SimNode {
    index?: number;
    x?: number;
    y?: number;
    z?: number;
    vx?: number;
    vy?: number;
    vz?: number;
  }
  export interface SimLink {
    source: string | SimNode;
    target: string | SimNode;
  }
  export interface LinkForce<N extends SimNode, L extends SimLink> {
    id(fn: (node: N) => string): LinkForce<N, L>;
    distance(d: number | ((link: L) => number)): LinkForce<N, L>;
    strength(s: number | ((link: L) => number)): LinkForce<N, L>;
  }
  export interface ManyBodyForce<N extends SimNode> {
    strength(s: number | ((node: N) => number)): ManyBodyForce<N>;
  }
  export interface CenterForce {
    strength(s: number): CenterForce;
  }
  export interface Simulation<N extends SimNode> {
    force(name: string, force: unknown): Simulation<N>;
    randomSource(source: () => number): Simulation<N>;
    stop(): Simulation<N>;
    tick(iterations?: number): Simulation<N>;
    nodes(): N[];
  }
  export function forceSimulation<N extends SimNode>(nodes: N[], numDimensions?: 1 | 2 | 3): Simulation<N>;
  export function forceLink<N extends SimNode, L extends SimLink>(links: L[]): LinkForce<N, L>;
  export function forceManyBody<N extends SimNode>(): ManyBodyForce<N>;
  export function forceCenter(x?: number, y?: number, z?: number): CenterForce;
}
```

- [ ] **Step 2: Escribir los tests (fallan)**

`tests/graph/layouts.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildGraphModel } from '@/graph/sources';
import { CLUSTER_CENTERS, LAYOUT_NAMES, clusterOf, computeLayouts, hemisphereSide, layoutLemniscata } from '@/graph/layouts';

const model = buildGraphModel();
const layouts = computeLayouts(model);
const N = model.nodes.length;
const at = (p: Float32Array, i: number) => [p[i * 3], p[i * 3 + 1], p[i * 3 + 2]] as const;
const radius = (p: Float32Array, i: number) => Math.hypot(...at(p, i));

describe('computeLayouts', () => {
  it('genera las 5 formas con N×3 valores finitos dentro de la esfera unidad', () => {
    expect(Object.keys(layouts)).toEqual([...LAYOUT_NAMES]);
    for (const name of LAYOUT_NAMES) {
      const p = layouts[name];
      expect(p.length).toBe(N * 3);
      expect(p.every(Number.isFinite)).toBe(true);
      let max = 0;
      for (let i = 0; i < N; i++) max = Math.max(max, radius(p, i));
      expect(max).toBeLessThanOrEqual(1 + 1e-5);
      expect(max).toBeGreaterThan(0.9);
    }
  });

  it('es determinista', () => {
    const again = computeLayouts(model);
    for (const name of LAYOUT_NAMES) expect(Array.from(again[name])).toEqual(Array.from(layouts[name]));
  });

  it('hemisferios: lógica a la izquierda, ingeniería a la derecha, puentes al centro', () => {
    const p = layouts.hemisferios;
    let minSided = Infinity;
    let maxBridge = 0;
    model.nodes.forEach((node, i) => {
      const side = hemisphereSide(node);
      const x = p[i * 3];
      if (side === -1) expect(x, node.id).toBeLessThan(0);
      if (side === 1) expect(x, node.id).toBeGreaterThan(0);
      if (side === 0 && node.kind === 'producto') maxBridge = Math.max(maxBridge, Math.abs(x));
      if (side !== 0) minSided = Math.min(minSided, Math.abs(x));
    });
    expect(maxBridge).toBeLessThan(minSided);
  });

  it('hélice: las empresas suben con su fecha de inicio', () => {
    const p = layouts.helice;
    const empresas = model.nodes
      .map((n, i) => ({ n, i }))
      .filter(({ n }) => n.kind === 'empresa')
      .sort((a, b) => a.n.year! + (a.n.month! - 1) / 12 - (b.n.year! + (b.n.month! - 1) / 12));
    for (let k = 1; k < empresas.length; k++) {
      expect(p[empresas[k].i * 3 + 1]).toBeGreaterThanOrEqual(p[empresas[k - 1].i * 3 + 1]);
    }
  });

  it('clusters: cada nodo queda más cerca del centroide de su frente que de los demás', () => {
    const p = layouts.clusters;
    const assigned = clusterOf(model);
    const centroids = new Map<string, number[]>();
    const counts = new Map<string, number>();
    model.nodes.forEach((node, i) => {
      if (node.kind === 'self') return;
      const c = centroids.get(assigned[i]) ?? [0, 0, 0];
      at(p, i).forEach((v, k) => (c[k] += v));
      centroids.set(assigned[i], c);
      counts.set(assigned[i], (counts.get(assigned[i]) ?? 0) + 1);
    });
    for (const [f, c] of centroids) centroids.set(f, c.map((v) => v / counts.get(f)!));
    expect(centroids.size).toBe(Object.keys(CLUSTER_CENTERS).length);
    model.nodes.forEach((node, i) => {
      if (node.kind === 'self') return;
      const [x, y, z] = at(p, i);
      const dist = (c: number[]) => Math.hypot(x - c[0], y - c[1], z - c[2]);
      const own = dist(centroids.get(assigned[i])!);
      for (const [f, c] of centroids) if (f !== assigned[i]) expect(own, node.id).toBeLessThan(dist(c));
    });
  });

  it('lemniscata: sin grosor, los puntos cumplen (x²+y²)² = x²−y²', () => {
    const p = layoutLemniscata(model, 0);
    for (let i = 0; i < N; i++) {
      const [x, y, z] = at(p, i);
      expect(z).toBeCloseTo(0, 5);
      expect(Math.abs((x * x + y * y) ** 2 - (x * x - y * y))).toBeLessThan(1e-4);
    }
  });
});
```

Run: `npx vitest run tests/graph/layouts.test.ts` → Expected: FAIL (`Cannot find module '@/graph/layouts'`).

- [ ] **Step 3: Implementar `layouts.ts`**

`src/graph/layouts.ts`:

```ts
import { forceCenter, forceLink, forceManyBody, forceSimulation } from 'd3-force-3d';
import type { FrenteId } from '@/data/frentes';
import type { GNode, GraphModel } from './model';
import { BRIDGE_PRODUCTS } from './relations';

export const LAYOUT_NAMES = ['red', 'hemisferios', 'helice', 'clusters', 'lemniscata'] as const;
export type LayoutName = (typeof LAYOUT_NAMES)[number];
export type Layouts = Record<LayoutName, Float32Array>;

export const CLUSTER_CENTERS: Record<FrenteId, [number, number, number]> = {
  informatica: [-0.52, 0.18, 0.05],
  filosofia: [0.5, 0.32, -0.12],
  ciencias: [0.3, -0.52, 0.3],
  enterprise: [-0.18, -0.5, -0.42],
};
const FRENTE_ORDER: FrenteId[] = ['informatica', 'filosofia', 'ciencias', 'enterprise'];

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Escala a radio máximo 1; con `center` resta antes el centroide. */
export function normalize(p: Float32Array, center = true): Float32Array {
  const out = new Float32Array(p);
  const n = out.length / 3;
  if (center) {
    const c = [0, 0, 0];
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) c[k] += out[i * 3 + k] / n;
    for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) out[i * 3 + k] -= c[k];
  }
  let max = 0;
  for (let i = 0; i < n; i++) max = Math.max(max, Math.hypot(out[i * 3], out[i * 3 + 1], out[i * 3 + 2]));
  if (max > 0) for (let i = 0; i < out.length; i++) out[i] /= max;
  return out;
}

interface SimNodeData {
  id: string;
  weight: number;
  x?: number;
  y?: number;
  z?: number;
}
interface SimLinkData {
  source: string;
  target: string;
  weight: number;
}

export function layoutRed(model: GraphModel, seed = 7): Float32Array {
  const simNodes: SimNodeData[] = model.nodes.map((n) => ({ id: n.id, weight: n.weight }));
  const links: SimLinkData[] = model.edges.map((e) => ({ source: e.source, target: e.target, weight: e.weight }));
  const sim = forceSimulation(simNodes, 3)
    .randomSource(mulberry32(seed))
    .force('link', forceLink<SimNodeData, SimLinkData>(links).id((d) => d.id).distance((l) => 1.5 - 0.2 * l.weight).strength(0.65))
    .force('charge', forceManyBody<SimNodeData>().strength((d) => -2.5 - 3 * d.weight))
    .force('center', forceCenter(0, 0, 0))
    .stop();
  sim.tick(420);
  const out = new Float32Array(model.nodes.length * 3);
  simNodes.forEach((n, i) => {
    out[i * 3] = n.x ?? 0;
    out[i * 3 + 1] = n.y ?? 0;
    out[i * 3 + 2] = n.z ?? 0;
  });
  return normalize(out);
}

/** −1 = lógica/filosofía/ciencias (izquierda), 1 = ingeniería (derecha), 0 = self y productos puente. */
export function hemisphereSide(node: GNode): -1 | 0 | 1 {
  if (node.kind === 'self') return 0;
  if (node.kind === 'producto' && BRIDGE_PRODUCTS.has(node.id.slice('producto:'.length))) return 0;
  if (node.kind === 'concepto' || node.frente === 'filosofia' || node.frente === 'ciencias') return -1;
  return 1;
}

export function layoutHemisferios(model: GraphModel, red: Float32Array): Float32Array {
  const out = new Float32Array(red.length);
  model.nodes.forEach((node, i) => {
    const side = hemisphereSide(node);
    const [x, y, z] = [red[i * 3], red[i * 3 + 1], red[i * 3 + 2]];
    out[i * 3] = side === 0 ? x * 0.12 : side * (0.42 + 0.58 * Math.abs(x));
    out[i * 3 + 1] = y * 0.92;
    out[i * 3 + 2] = z * 0.92;
  });
  return normalize(out, false);
}

const T_MIN = 2014;
const T_MAX = 2026.6;

export function layoutHelice(model: GraphModel, seed = 11): Float32Array {
  const rand = mulberry32(seed);
  const index = new Map(model.nodes.map((n, i) => [n.id, i]));
  const t = new Float64Array(model.nodes.length).fill(Number.NaN);

  model.nodes.forEach((n, i) => {
    if (n.kind === 'empresa') t[i] = n.year! + (n.month! - 1) / 12;
  });
  // Productos: tras la empresa que los construyó; si no hay, repartidos en la etapa reciente (2022–2026).
  const productos = model.nodes.map((n, i) => ({ n, i })).filter(({ n }) => n.kind === 'producto');
  productos.forEach(({ n, i }, k) => {
    const builder = model.edges.find((e) => e.rel === 'construyo' && e.target === n.id);
    const bi = builder ? index.get(builder.source) : undefined;
    t[i] = bi !== undefined ? t[bi] + 0.35 + 0.1 * (k % 5) : 2022 + (4.4 * k) / Math.max(1, productos.length - 1);
  });
  // Resto: media de sus vecinos ya ubicados; si no tiene, un valor pseudoaleatorio estable.
  model.nodes.forEach((n, i) => {
    if (!Number.isNaN(t[i]) || n.kind === 'self') return;
    const vals = model.edges
      .filter((e) => e.source === n.id || e.target === n.id)
      .map((e) => t[index.get(e.source === n.id ? e.target : e.source)!])
      .filter((v) => !Number.isNaN(v));
    t[i] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : T_MIN + rand() * (T_MAX - T_MIN);
  });

  const out = new Float32Array(model.nodes.length * 3);
  model.nodes.forEach((n, i) => {
    if (n.kind === 'self') {
      out.set([0, 1.05, 0], i * 3);
      return;
    }
    const u = (Math.min(Math.max(t[i], T_MIN), T_MAX) - T_MIN) / (T_MAX - T_MIN);
    const angle = u * Math.PI * 2 * 2.25;
    const r = n.kind === 'empresa' ? 0.55 : n.kind === 'producto' ? 0.78 : 1.02 + rand() * 0.18;
    out.set([Math.cos(angle) * r, (u - 0.5) * 2, Math.sin(angle) * r], i * 3);
  });
  return normalize(out, false);
}

/** Frente de cada nodo: el suyo; empresas y self, el más frecuente entre sus productos (por defecto ingeniería). */
export function clusterOf(model: GraphModel): FrenteId[] {
  const byId = new Map(model.nodes.map((n) => [n.id, n]));
  return model.nodes.map((n) => {
    if (n.frente) return n.frente;
    const counts = new Map<FrenteId, number>();
    for (const e of model.edges) {
      if (e.source !== n.id || e.rel !== 'construyo') continue;
      const f = byId.get(e.target)?.frente;
      if (f) counts.set(f, (counts.get(f) ?? 0) + 1);
    }
    let best: FrenteId = 'informatica';
    for (const f of FRENTE_ORDER) if ((counts.get(f) ?? 0) > (counts.get(best) ?? 0)) best = f;
    return best;
  });
}

export function layoutClusters(model: GraphModel, red: Float32Array): Float32Array {
  const assigned = clusterOf(model);
  const sizes = new Map<FrenteId, number>();
  assigned.forEach((f) => sizes.set(f, (sizes.get(f) ?? 0) + 1));
  const maxSize = Math.max(...sizes.values());
  const centroid = new Map<FrenteId, number[]>();
  assigned.forEach((f, i) => {
    const c = centroid.get(f) ?? [0, 0, 0];
    for (let k = 0; k < 3; k++) c[k] += red[i * 3 + k] / sizes.get(f)!;
    centroid.set(f, c);
  });
  const spread = new Map<FrenteId, number>();
  assigned.forEach((f, i) => {
    const c = centroid.get(f)!;
    const d = Math.hypot(red[i * 3] - c[0], red[i * 3 + 1] - c[1], red[i * 3 + 2] - c[2]);
    spread.set(f, Math.max(spread.get(f) ?? 0, d));
  });

  const out = new Float32Array(red.length);
  model.nodes.forEach((n, i) => {
    if (n.kind === 'self') {
      out.set([0, 0, 0], i * 3);
      return;
    }
    const f = assigned[i];
    const c = centroid.get(f)!;
    const radius = 0.3 * Math.sqrt(sizes.get(f)! / maxSize) + 0.06;
    const s = radius / Math.max(spread.get(f)!, 1e-6);
    const center = CLUSTER_CENTERS[f];
    for (let k = 0; k < 3; k++) out[i * 3 + k] = center[k] + (red[i * 3 + k] - c[k]) * s;
  });
  return normalize(out, false);
}

/** Lemniscata de Bernoulli (el ∞ del logo). `thickness` añade un grosor estable fuera del plano. */
export function layoutLemniscata(model: GraphModel, thickness = 0.05, seed = 5): Float32Array {
  const rand = mulberry32(seed);
  const assigned = clusterOf(model);
  const order = model.nodes
    .map((n, i) => ({ i, key: `${FRENTE_ORDER.indexOf(assigned[i])}|${n.id}` }))
    .sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  const out = new Float32Array(model.nodes.length * 3);
  order.forEach(({ i }, k) => {
    const s = (2 * Math.PI * k) / order.length;
    const d = 1 + Math.sin(s) ** 2;
    const x = Math.cos(s) / d;
    const y = (Math.sin(s) * Math.cos(s)) / d;
    const jitter = thickness * (rand() * 2 - 1);
    const z = thickness === 0 ? 0 : Math.sin(2 * s) * 0.12 + jitter;
    out.set([x + (thickness === 0 ? 0 : jitter * 0.4), y + (thickness === 0 ? 0 : jitter * 0.4), z], i * 3);
  });
  return thickness === 0 ? out : normalize(out, false);
}

export function computeLayouts(model: GraphModel, seed = 7): Layouts {
  const red = layoutRed(model, seed);
  return {
    red,
    hemisferios: layoutHemisferios(model, red),
    helice: layoutHelice(model),
    clusters: layoutClusters(model, red),
    lemniscata: layoutLemniscata(model),
  };
}
```

Nota: con `thickness = 0` la lemniscata no se normaliza, porque su radio máximo ya es exactamente 1 (en `s = 0`). Así el test valida la ecuación sin reescalar.

- [ ] **Step 4: Verificar**

Run: `npx vitest run tests/graph/layouts.test.ts` → Expected: PASS (6 tests).

Si falla "clusters" para algún nodo, sube el factor `0.3` a `0.24` o separa más los `CLUSTER_CENTERS`: el invariante es de diseño y no se relaja. Si falla "hélice", comprueba que `month` viene de `parseDates`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(graph): 5 formas precalculadas (red, hemisferios, hélice, clusters, lemniscata)

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Códec binario del grafo

**Files:**
- Create: `src/graph/codec.ts`
- Test: `tests/graph/codec.test.ts`

**Interfaces:**
- Consume: `GraphModel`, `GNode`, `NodeKind`, `RelKind`, `Bilingual` (Tarea 4); `LAYOUT_NAMES`, `Layouts`, `LayoutName` (Tarea 5).
- Produce:
  - `KINDS`, `RELS`, `FRENTES`, `NO_FRENTE`.
  - `interface MetaNode`, `interface GraphMeta`, `interface DecodedGraph`.
  - `encodeGraph(model: GraphModel, layouts: Layouts): { bin: Uint8Array; meta: GraphMeta }`.
  - `decodeGraph(buffer: ArrayBuffer): DecodedGraph`.
- Formato `GRF1`, little-endian:
  1. Cabecera de 16 bytes: magic, N, M, L.
  2. Float32 posiciones: L×N×3, por forma.
  3. Uint16 aristas: M×2.
  4. Uint8 por nodo: kind, frente, weight (3 bloques de N).
  5. Uint8 por arista: rel, weight (2 bloques de M).

- [ ] **Step 1: Escribir el test (falla)**

`tests/graph/codec.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildGraphModel } from '@/graph/sources';
import { LAYOUT_NAMES, computeLayouts } from '@/graph/layouts';
import { FRENTES, KINDS, NO_FRENTE, RELS, decodeGraph, encodeGraph } from '@/graph/codec';

describe('codec', () => {
  const model = buildGraphModel();
  const layouts = computeLayouts(model);
  const { bin, meta } = encodeGraph(model, layouts);
  const buffer = bin.buffer.slice(bin.byteOffset, bin.byteOffset + bin.byteLength);
  const g = decodeGraph(buffer);

  it('conserva tamaños', () => {
    expect(g.nodeCount).toBe(model.nodes.length);
    expect(g.edgeCount).toBe(model.edges.length);
    expect(g.layouts).toHaveLength(LAYOUT_NAMES.length);
    expect(meta.nodes).toHaveLength(model.nodes.length);
    expect(meta.layouts).toEqual([...LAYOUT_NAMES]);
  });

  it('conserva posiciones, aristas y atributos', () => {
    LAYOUT_NAMES.forEach((name, k) => expect(Array.from(g.layouts[k])).toEqual(Array.from(layouts[name])));
    const index = new Map(model.nodes.map((n, i) => [n.id, i]));
    model.edges.forEach((e, i) => {
      expect(g.edges[i * 2]).toBe(index.get(e.source));
      expect(g.edges[i * 2 + 1]).toBe(index.get(e.target));
      expect(RELS[g.rel[i]]).toBe(e.rel);
      expect(g.edgeWeight[i]).toBe(e.weight);
    });
    model.nodes.forEach((n, i) => {
      expect(KINDS[g.kind[i]]).toBe(n.kind);
      expect(g.frente[i]).toBe(n.frente ? FRENTES.indexOf(n.frente) : NO_FRENTE);
      expect(g.weight[i]).toBe(n.weight);
      expect(meta.nodes[i].id).toBe(n.id);
      expect(meta.nodes[i].label).toEqual(n.label);
    });
  });

  it('rechaza buffers ajenos', () => {
    expect(() => decodeGraph(new ArrayBuffer(16))).toThrow();
  });

  it('cabe en el presupuesto (≤ 60 KB gz binario + meta)', async () => {
    const { gzipSync } = await import('node:zlib');
    const size = gzipSync(bin).length + gzipSync(JSON.stringify(meta)).length;
    expect(size).toBeLessThanOrEqual(60 * 1024);
  });
});
```

Run: `npx vitest run tests/graph/codec.test.ts` → Expected: FAIL (módulo inexistente).

- [ ] **Step 2: Implementar `codec.ts`**

`src/graph/codec.ts`:

```ts
import type { FrenteId } from '@/data/frentes';
import { LAYOUT_NAMES, type LayoutName, type Layouts } from './layouts';
import type { Bilingual, GNode, GraphModel, NodeKind, RelKind } from './model';

export const KINDS: readonly NodeKind[] = ['self', 'frente', 'empresa', 'producto', 'grupo', 'tecnologia', 'concepto'];
export const RELS: readonly RelKind[] = ['agrupa', 'pertenece-a', 'trabajo-en', 'construyo', 'usa', 'fundamenta'];
export const FRENTES: readonly FrenteId[] = ['informatica', 'filosofia', 'ciencias', 'enterprise'];
export const NO_FRENTE = 255;
const MAGIC = 0x31465247; // bytes 'G','R','F','1' en little-endian
const HEADER = 16;

export interface MetaNode {
  id: string;
  kind: NodeKind;
  label: Bilingual;
  frente?: FrenteId;
  url?: string;
  year?: number;
  month?: number;
  yearEnd?: number | null;
  role?: Bilingual;
}

export interface GraphMeta {
  version: 1;
  layouts: readonly LayoutName[];
  edgeCount: number;
  nodes: MetaNode[];
}

export interface DecodedGraph {
  nodeCount: number;
  edgeCount: number;
  layouts: Float32Array[];
  edges: Uint16Array;
  kind: Uint8Array;
  frente: Uint8Array;
  weight: Uint8Array;
  rel: Uint8Array;
  edgeWeight: Uint8Array;
}

function toMetaNode(n: GNode): MetaNode {
  const out: MetaNode = { id: n.id, kind: n.kind, label: n.label };
  if (n.frente) out.frente = n.frente;
  if (n.url) out.url = n.url;
  if (n.year !== undefined) out.year = n.year;
  if (n.month !== undefined) out.month = n.month;
  if (n.yearEnd !== undefined) out.yearEnd = n.yearEnd;
  if (n.role) out.role = n.role;
  return out;
}

export function encodeGraph(model: GraphModel, layouts: Layouts): { bin: Uint8Array; meta: GraphMeta } {
  const n = model.nodes.length;
  const m = model.edges.length;
  const l = LAYOUT_NAMES.length;
  if (n > 0xffff) throw new Error('Demasiados nodos para índices Uint16');
  const floatBytes = l * n * 3 * 4;
  const edgeBytes = m * 2 * 2;
  const buffer = new ArrayBuffer(HEADER + floatBytes + edgeBytes + n * 3 + m * 2);
  const dv = new DataView(buffer);
  dv.setUint32(0, MAGIC, true);
  dv.setUint32(4, n, true);
  dv.setUint32(8, m, true);
  dv.setUint32(12, l, true);

  const positions = new Float32Array(buffer, HEADER, l * n * 3);
  LAYOUT_NAMES.forEach((name, k) => {
    const p = layouts[name];
    if (p.length !== n * 3) throw new Error(`La forma ${name} no mide N×3`);
    positions.set(p, k * n * 3);
  });

  const index = new Map(model.nodes.map((node, i) => [node.id, i]));
  const edges = new Uint16Array(buffer, HEADER + floatBytes, m * 2);
  model.edges.forEach((e, i) => {
    const s = index.get(e.source);
    const t = index.get(e.target);
    if (s === undefined || t === undefined) throw new Error(`Arista colgante ${e.source} → ${e.target}`);
    edges[i * 2] = s;
    edges[i * 2 + 1] = t;
  });

  const u8 = new Uint8Array(buffer, HEADER + floatBytes + edgeBytes, n * 3 + m * 2);
  model.nodes.forEach((node, i) => {
    u8[i] = KINDS.indexOf(node.kind);
    u8[n + i] = node.frente ? FRENTES.indexOf(node.frente) : NO_FRENTE;
    u8[2 * n + i] = node.weight;
  });
  model.edges.forEach((e, i) => {
    u8[3 * n + i] = RELS.indexOf(e.rel);
    u8[3 * n + m + i] = e.weight;
  });

  return {
    bin: new Uint8Array(buffer),
    meta: { version: 1, layouts: LAYOUT_NAMES, edgeCount: m, nodes: model.nodes.map(toMetaNode) },
  };
}

export function decodeGraph(buffer: ArrayBuffer): DecodedGraph {
  const dv = new DataView(buffer);
  if (buffer.byteLength < HEADER || dv.getUint32(0, true) !== MAGIC) throw new Error('Formato de grafo desconocido');
  const n = dv.getUint32(4, true);
  const m = dv.getUint32(8, true);
  const l = dv.getUint32(12, true);
  const floatBytes = l * n * 3 * 4;
  const all = new Float32Array(buffer, HEADER, l * n * 3);
  const u8 = new Uint8Array(buffer, HEADER + floatBytes + m * 4, n * 3 + m * 2);
  return {
    nodeCount: n,
    edgeCount: m,
    layouts: Array.from({ length: l }, (_, k) => all.subarray(k * n * 3, (k + 1) * n * 3)),
    edges: new Uint16Array(buffer, HEADER + floatBytes, m * 2),
    kind: u8.subarray(0, n),
    frente: u8.subarray(n, 2 * n),
    weight: u8.subarray(2 * n, 3 * n),
    rel: u8.subarray(3 * n, 3 * n + m),
    edgeWeight: u8.subarray(3 * n + m, 3 * n + 2 * m),
  };
}
```

- [ ] **Step 3: Verificar**

Run: `npx vitest run tests/graph/codec.test.ts` → Expected: PASS (4 tests).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(graph): códec binario GRF1 para las formas del grafo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---
### Task 7: Paleta, cámara inicial y póster SVG

**Files:**
- Create: `src/graph/palette.ts`, `src/graph/camera0.ts`, `src/graph/poster.ts`
- Test: `tests/graph/poster.test.ts`

**Interfaces:**
- Consume: `GraphModel`, `NodeKind` (Tarea 4); `computeLayouts` (Tarea 5).
- Produce:
  - `FRENTE_COLOR`, `SELF_COLOR`, `EMPRESA_COLOR`, `NEUTRAL_COLOR`
  - `nodeColor(kind: NodeKind, frente?: FrenteId): string`
  - `CAMERA0 = { distance: 4.4, fov: 38, yaw: 0.6, pitch: -0.25 }`, compartida con la escena WebGL del Plan 2. La rotación se aplica al grafo, primero `yaw` en Y y después `pitch` en X; la cámara está en +Z mirando al origen.
  - `POSTER_VIEWBOX = { width: 1600, height: 1000 }`
  - `projectPoint(p: readonly [number, number, number]): { x: number; y: number; depth: number; scale: number }`
  - `renderPosterSvg(model: GraphModel, positions: Float32Array): string`

- [ ] **Step 1: Escribir el test (falla)**

`tests/graph/poster.test.ts`:

```ts
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { buildGraphModel } from '@/graph/sources';
import { computeLayouts } from '@/graph/layouts';
import { POSTER_VIEWBOX, projectPoint, renderPosterSvg } from '@/graph/poster';

describe('póster', () => {
  const model = buildGraphModel();
  const svg = renderPosterSvg(model, computeLayouts(model).red);

  it('proyecta el origen al centro del lienzo', () => {
    const p = projectPoint([0, 0, 0]);
    expect(p.x).toBeCloseTo(POSTER_VIEWBOX.width / 2, 6);
    expect(p.y).toBeCloseTo(POSTER_VIEWBOX.height / 2, 6);
  });

  it('los puntos más cercanos a la cámara salen más grandes', () => {
    const near = projectPoint([0, 0, 0.8]);
    const far = projectPoint([0, 0, -0.8]);
    expect(near.scale).toBeGreaterThan(far.scale);
  });

  it('es un SVG decorativo con un círculo por nodo como mínimo', () => {
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('viewBox="0 0 1600 1000"');
    expect(svg).toContain('aria-hidden="true"');
    expect((svg.match(/<circle/g) ?? []).length).toBeGreaterThanOrEqual(model.nodes.length);
    expect((svg.match(/<path/g) ?? []).length).toBe(model.edges.length);
  });

  it('cabe en el presupuesto (≤ 12 KB gz)', () => {
    expect(gzipSync(svg).length).toBeLessThanOrEqual(12 * 1024);
  });

  it('es determinista', () => {
    expect(renderPosterSvg(model, computeLayouts(model).red)).toBe(svg);
  });
});
```

Run: `npx vitest run tests/graph/poster.test.ts` → Expected: FAIL (módulo inexistente).

- [ ] **Step 2: Implementar paleta y cámara**

`src/graph/palette.ts`:

```ts
import type { FrenteId } from '@/data/frentes';
import type { NodeKind } from './model';

/** Luz semántica: teal = ingeniería, oro = lógica/filosofía, violeta = ciencias, óxido = enterprise. */
export const FRENTE_COLOR: Record<FrenteId, string> = {
  informatica: '#43b5a6',
  filosofia: '#e0a85e',
  ciencias: '#8d7cc0',
  enterprise: '#cf6a3c',
};
export const SELF_COLOR = '#f6f1e8';
export const EMPRESA_COLOR = '#6fd3c4';
export const NEUTRAL_COLOR = '#8fa3a8';

export function nodeColor(kind: NodeKind, frente?: FrenteId): string {
  if (kind === 'self') return SELF_COLOR;
  if (kind === 'empresa') return EMPRESA_COLOR;
  return frente ? FRENTE_COLOR[frente] : NEUTRAL_COLOR;
}
```

`src/graph/camera0.ts`:

```ts
/**
 * Cámara del primer frame. La comparten el póster SVG, la imagen OG y la escena WebGL (Plan 2):
 * cámara en (0, 0, distance) mirando al origen, fov vertical en grados. El grafo se rota primero
 * `yaw` alrededor de Y y después `pitch` alrededor de X.
 */
export const CAMERA0 = { distance: 4.4, fov: 38, yaw: 0.6, pitch: -0.25 } as const;
```

- [ ] **Step 3: Implementar el póster**

`src/graph/poster.ts`:

```ts
import { CAMERA0 } from './camera0';
import type { GraphModel } from './model';
import { nodeColor } from './palette';

export const POSTER_VIEWBOX = { width: 1600, height: 1000 } as const;
const FOCAL = POSTER_VIEWBOX.height / 2 / Math.tan((CAMERA0.fov * Math.PI) / 360);
const BASE_SCALE = FOCAL / CAMERA0.distance;

export function projectPoint(p: readonly [number, number, number]) {
  const [x0, y0, z0] = p;
  const cy = Math.cos(CAMERA0.yaw);
  const sy = Math.sin(CAMERA0.yaw);
  const x1 = x0 * cy + z0 * sy;
  const z1 = -x0 * sy + z0 * cy;
  const cp = Math.cos(CAMERA0.pitch);
  const sp = Math.sin(CAMERA0.pitch);
  const y2 = y0 * cp - z1 * sp;
  const z2 = y0 * sp + z1 * cp;
  const depth = CAMERA0.distance - z2;
  const scale = FOCAL / depth;
  return { x: POSTER_VIEWBOX.width / 2 + x1 * scale, y: POSTER_VIEWBOX.height / 2 - y2 * scale, depth, scale };
}

const int = (v: number) => Math.round(v);
const dec = (v: number) => Math.round(v * 10) / 10;
const op = (v: number) => v.toFixed(2).replace(/^0/, '');

export function renderPosterSvg(model: GraphModel, positions: Float32Array): string {
  const pts = model.nodes.map((_, i) => projectPoint([positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]]));
  const index = new Map(model.nodes.map((n, i) => [n.id, i]));
  const depths = pts.map((p) => p.depth);
  const dMin = Math.min(...depths);
  const dMax = Math.max(...depths);
  const fade = (d: number) => 1 - 0.55 * ((d - dMin) / Math.max(dMax - dMin, 1e-6));
  const colorOf = (i: number) => nodeColor(model.nodes[i].kind, model.nodes[i].frente);
  const colors = [...new Set(model.nodes.map((_, i) => colorOf(i)))];
  const gid = (c: string) => `gp${colors.indexOf(c)}`;

  const defs = colors
    .map((c) => `<radialGradient id="${gid(c)}"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".3" stop-color="${c}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`)
    .join('');

  const edgesByColor = new Map<string, string[]>();
  model.edges.forEach((e, k) => {
    const ia = index.get(e.source)!;
    const ib = index.get(e.target)!;
    const a = pts[ia];
    const b = pts[ib];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bend = (k % 2 ? 1 : -1) * 0.12 * len;
    const cx = (a.x + b.x) / 2 - (dy / len) * bend;
    const cy = (a.y + b.y) / 2 + (dx / len) * bend;
    const opacity = (0.07 + 0.035 * e.weight) * fade((a.depth + b.depth) / 2);
    const c = colorOf(ia);
    const list = edgesByColor.get(c) ?? [];
    list.push(`<path d="M${int(a.x)} ${int(a.y)}Q${int(cx)} ${int(cy)} ${int(b.x)} ${int(b.y)}" opacity="${op(opacity)}"/>`);
    edgesByColor.set(c, list);
  });

  const farFirst = pts.map((_, i) => i).sort((i, j) => pts[j].depth - pts[i].depth);
  const glows: string[] = [];
  const nodesByColor = new Map<string, string[]>();
  for (const i of farFirst) {
    const n = model.nodes[i];
    const p = pts[i];
    const r = (0.9 + n.weight * 0.9) * (p.scale / BASE_SCALE);
    const c = colorOf(i);
    if (n.weight >= 3) glows.push(`<circle cx="${int(p.x)}" cy="${int(p.y)}" r="${dec(r * 4.5)}" fill="url(#${gid(c)})" opacity="${op(0.5 * fade(p.depth))}"/>`);
    const list = nodesByColor.get(c) ?? [];
    list.push(`<circle cx="${int(p.x)}" cy="${int(p.y)}" r="${dec(r)}" opacity="${op(0.55 + 0.45 * fade(p.depth))}"/>`);
    nodesByColor.set(c, list);
  }

  const edgeGroups = [...edgesByColor].map(([c, paths]) => `<g stroke="${c}">${paths.join('')}</g>`).join('');
  const nodeGroups = [...nodesByColor].map(([c, circles]) => `<g fill="${c}">${circles.join('')}</g>`).join('');
  const { width, height } = POSTER_VIEWBOX;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">` +
    `<defs>${defs}</defs>` +
    `<g fill="none" stroke-width="1.1" stroke-linecap="round">${edgeGroups}</g>` +
    `<g>${glows.join('')}</g>` +
    nodeGroups +
    `</svg>`
  );
}
```

- [ ] **Step 4: Verificar**

Run: `npx vitest run tests/graph/poster.test.ts` → Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(graph): paleta semántica, cámara inicial compartida y póster SVG del primer frame

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Ensamblado de artefactos y script `build-graph`

**Files:**
- Create: `src/graph/artifacts.ts`, `scripts/build-graph.mts`
- Create (generados por el script, versionados): `src/graph/generated/poster.ts`, `src/graph/generated/stats.ts`, `public/graph/graph.<hash>.bin`, `public/graph/graph.<hash>.json`
- Test: `tests/graph/artifacts.test.ts`
- Modify: `package.json` (scripts `graph:build` y `prebuild`; devDependency `tsx`), `next.config.mjs` (caché inmutable de `/graph/*`)

**Interfaces:**
- Consume: `buildGraphModel`, `computeLayouts`, `encodeGraph`, `renderPosterSvg`.
- Produce:
  - `buildArtifacts(): Artifacts`, con `interface Artifacts { model: GraphModel; layouts: Layouts; bin: Uint8Array; meta: GraphMeta; posterSvg: string; hash: string }`.
  - Módulos generados:
    - `POSTER_SVG: string`
    - `GRAPH_STATS: { nodes: number; edges: number }`
    - `GRAPH_ASSET: { bin: string; meta: string }` (rutas públicas con hash)
    - `DATA_DATE: string` (`YYYY-MM-DD`)

- [ ] **Step 1: Escribir el test (falla)**

`tests/graph/artifacts.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { buildArtifacts } from '@/graph/artifacts';

describe('buildArtifacts', () => {
  it('es determinista byte a byte', () => {
    const a = buildArtifacts();
    const b = buildArtifacts();
    expect(Buffer.from(a.bin).equals(Buffer.from(b.bin))).toBe(true);
    expect(JSON.stringify(a.meta)).toBe(JSON.stringify(b.meta));
    expect(a.posterSvg).toBe(b.posterSvg);
    expect(a.hash).toBe(b.hash);
    expect(a.hash).toMatch(/^[0-9a-f]{10}$/);
  });
});
```

Run: `npx vitest run tests/graph/artifacts.test.ts` → Expected: FAIL.

- [ ] **Step 2: Implementar `artifacts.ts`**

`src/graph/artifacts.ts`:

```ts
import { createHash } from 'node:crypto';
import { encodeGraph, type GraphMeta } from './codec';
import { computeLayouts, type Layouts } from './layouts';
import type { GraphModel } from './model';
import { renderPosterSvg } from './poster';
import { buildGraphModel } from './sources';

export interface Artifacts {
  model: GraphModel;
  layouts: Layouts;
  bin: Uint8Array;
  meta: GraphMeta;
  posterSvg: string;
  hash: string;
}

/** Solo se usa en build y tests (Node). No importar desde componentes. */
export function buildArtifacts(): Artifacts {
  const model = buildGraphModel();
  const layouts = computeLayouts(model);
  const { bin, meta } = encodeGraph(model, layouts);
  const posterSvg = renderPosterSvg(model, layouts.red);
  const hash = createHash('sha256').update(bin).update(JSON.stringify(meta)).digest('hex').slice(0, 10);
  return { model, layouts, bin, meta, posterSvg, hash };
}
```

Run: `npx vitest run tests/graph/artifacts.test.ts` → Expected: PASS.

- [ ] **Step 3: Script de build**

```bash
npm install --save-dev --save-exact tsx@4.23.15
```

`scripts/build-graph.mts`:

```ts
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { buildArtifacts } from '../src/graph/artifacts';

const PUBLIC_DIR = 'public/graph';
const GENERATED_DIR = 'src/graph/generated';
const STATS_FILE = `${GENERATED_DIR}/stats.ts`;
const HEADER = '// Generado por scripts/build-graph.mts — no editar a mano.\n';

function dataDate(): string {
  try {
    const out = execSync('git log -1 --format=%cs -- src/data src/locales src/graph/relations.ts src/graph/sources.ts', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {
    // sin git (p. ej. clon superficial): se conserva la fecha ya generada
  }
  if (existsSync(STATS_FILE)) {
    const previous = readFileSync(STATS_FILE, 'utf8').match(/DATA_DATE = '(\d{4}-\d{2}-\d{2})'/);
    if (previous) return previous[1];
  }
  return new Date().toISOString().slice(0, 10);
}

const { bin, meta, posterSvg, hash, model } = buildArtifacts();

const dataGz = gzipSync(bin).length + gzipSync(JSON.stringify(meta)).length;
const posterGz = gzipSync(posterSvg).length;
if (dataGz > 60 * 1024) throw new Error(`Datos del grafo ${dataGz} B gz > 60 KB`);
if (posterGz > 12 * 1024) throw new Error(`Póster ${posterGz} B gz > 12 KB`);

mkdirSync(PUBLIC_DIR, { recursive: true });
mkdirSync(GENERATED_DIR, { recursive: true });
for (const f of readdirSync(PUBLIC_DIR)) {
  if (/^graph\.[0-9a-f]{10}\.(bin|json)$/.test(f) && !f.includes(hash)) rmSync(`${PUBLIC_DIR}/${f}`);
}
writeFileSync(`${PUBLIC_DIR}/graph.${hash}.bin`, bin);
writeFileSync(`${PUBLIC_DIR}/graph.${hash}.json`, JSON.stringify(meta));
writeFileSync(`${GENERATED_DIR}/poster.ts`, `${HEADER}export const POSTER_SVG = ${JSON.stringify(posterSvg)};\n`);
writeFileSync(
  STATS_FILE,
  `${HEADER}export const GRAPH_STATS = { nodes: ${model.nodes.length}, edges: ${model.edges.length} } as const;\n` +
    `export const GRAPH_ASSET = { bin: '/graph/graph.${hash}.bin', meta: '/graph/graph.${hash}.json' } as const;\n` +
    `export const DATA_DATE = '${dataDate()}';\n`,
);
console.log(`grafo ${hash}: ${model.nodes.length} nodos, ${model.edges.length} aristas · datos ${dataGz} B gz · póster ${posterGz} B gz`);
```

En `package.json` → `scripts`, añade:

```json
"graph:build": "tsx scripts/build-graph.mts",
"prebuild": "npm run graph:build",
```

En `next.config.mjs`, dentro de `headers()`, añade una segunda entrada al array que se devuelve:

```js
{ source: '/graph/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
```

- [ ] **Step 4: Ejecutar y verificar**

```bash
npm run graph:build
ls -la public/graph src/graph/generated
npm run graph:build && git status --short src/graph/generated public/graph
```

Resultado esperado:
- La primera ejecución imprime `grafo <hash>: N nodos, M aristas…`, con los tamaños dentro del presupuesto.
- La segunda no deja cambios nuevos en `git status` respecto a la primera (determinismo).

- [ ] **Step 5: Verificar tipos y tests**

Run: `npm run typecheck && npm test` → Expected: todo PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(graph): script build-graph con artefactos versionados por hash y póster generado

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: SEO — JSON-LD, sitemap, robots y metadata de subpáginas

**Files:**
- Create: `src/lib/jsonld.ts`
- Modify (reescritura): `src/app/sitemap.ts`, `src/app/robots.ts`
- Modify: `src/app/[locale]/(portal)/[frente]/page.tsx`, `src/app/[locale]/(portal)/lore/page.tsx` (`generateMetadata`)
- Test: `tests/lib/jsonld.test.ts`, `tests/lib/sitemap.test.ts`

**Interfaces:**
- Consume: `SITE`, `PROFILES`, `localeUrl`, `pageAlternates`, `OG_LOCALE`, `toLocale`, `clampDescription` (Tarea 3); `parseDates`, `EMPRESAS` (Tarea 4); `DATA_DATE` (Tarea 8).
- Produce:
  - `interface PersonFacts { jobTitle: string[]; description: string; knowsAbout: string[] }`
  - `currentEmployers(): { '@type': 'Organization'; name: string; url?: string }[]`
  - `buildHomeJsonLd(locale: Locale, facts: PersonFacts, dateModified: string): { '@context': string; '@graph': object[] }`
  - `serializeJsonLd(data: unknown): string`

- [ ] **Step 1: Escribir los tests (fallan)**

`tests/lib/jsonld.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { productos } from '@/data/frentes';
import { buildHomeJsonLd, currentEmployers, serializeJsonLd } from '@/lib/jsonld';

const facts = { jobTitle: ['Ingeniero de software', 'Filósofo'], description: 'd', knowsAbout: ['Lógica formal'] };

describe('JSON-LD de la home', () => {
  const ld = buildHomeJsonLd('es', facts, '2026-09-23');
  const graph = ld['@graph'] as Record<string, unknown>[];

  it('publica WebSite, ProfilePage, Person e ItemList sin SearchAction', () => {
    expect(graph.map((n) => n['@type'])).toEqual(['WebSite', 'ProfilePage', 'Person', 'ItemList']);
    expect(JSON.stringify(ld)).not.toContain('SearchAction');
  });

  it('usa el dominio con www y el LinkedIn correcto', () => {
    const person = graph[2] as { url: string; sameAs: string[] };
    expect(person.url).toBe('https://www.stevenvallejo.com');
    expect(person.sameAs).toContain('https://www.linkedin.com/in/steven-vallejo/');
    expect(JSON.stringify(ld)).not.toMatch(/https:\/\/stevenvallejo\.com/);
  });

  it('lista los productos en vivo con URL', () => {
    const list = graph[3] as { itemListElement: unknown[] };
    expect(list.itemListElement).toHaveLength(productos.filter((p) => p.url && p.status === 'live').length);
  });

  it('declara como empleadores actuales solo las empresas abiertas no freelance', () => {
    expect(currentEmployers().map((o) => o.name)).toEqual(['Humanizar Systems', 'Finca Directa S.A.S']);
  });

  it('escapa "<" al serializar', () => {
    expect(serializeJsonLd({ a: '</script>' })).toBe('{"a":"\\u003c/script>"}');
  });
});
```

`tests/lib/sitemap.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';

describe('sitemap', () => {
  const entries = sitemap();
  it('solo lista URLs canónicas del dominio con www', () => {
    expect(entries).toHaveLength(12);
    for (const e of entries) expect(e.url).toMatch(/^https:\/\/www\.stevenvallejo\.com\/(es|en)(\/[a-z]+)?$/);
  });
  it('cada entrada declara sus alternates recíprocos', () => {
    for (const e of entries) expect(Object.keys(e.alternates?.languages ?? {})).toEqual(['es', 'en', 'x-default']);
  });
});
```

Run: `npx vitest run tests/lib` → Expected: FAIL (`@/lib/jsonld` no existe; el sitemap devuelve entradas externas).

- [ ] **Step 2: Implementar `jsonld.ts`**

`src/lib/jsonld.ts`:

```ts
import { productos } from '@/data/frentes';
import expEs from '@/locales/es/common/experience.json';
import { EMPRESAS } from '@/graph/relations';
import { parseDates } from '@/graph/sources';
import { PROFILES, SITE, localeUrl, type Locale } from './site';

const FREELANCE = new Set<string>(['infraestructura', 'videojuegos', 'appsWeb']);
const ORG_URL: Partial<Record<string, string>> = { humanizar: 'https://humanizar.tech' };

export interface PersonFacts {
  jobTitle: string[];
  description: string;
  knowsAbout: string[];
}

export function currentEmployers() {
  const exp = expEs as Record<string, string>;
  return EMPRESAS.filter((k) => !FREELANCE.has(k) && parseDates(exp[`experience.dates.${k}`]).yearEnd === null).map((k) => ({
    '@type': 'Organization' as const,
    name: exp[`experience.${k}`],
    ...(ORG_URL[k] ? { url: ORG_URL[k] } : {}),
  }));
}

export function buildHomeJsonLd(locale: Locale, facts: PersonFacts, dateModified: string) {
  const person = `${SITE}/#person`;
  const website = `${SITE}/#website`;
  const page = localeUrl(locale);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': website, url: SITE, name: 'Mouseîon', inLanguage: ['es', 'en'], publisher: { '@id': person } },
      {
        '@type': 'ProfilePage',
        '@id': `${page}#profile`,
        url: page,
        inLanguage: locale,
        isPartOf: { '@id': website },
        mainEntity: { '@id': person },
        dateModified,
      },
      {
        '@type': 'Person',
        '@id': person,
        name: 'Steven Vallejo Ortiz',
        url: SITE,
        image: `${page}/opengraph-image`,
        jobTitle: facts.jobTitle,
        description: facts.description,
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Universidad de Antioquia' },
        worksFor: currentEmployers(),
        knowsAbout: facts.knowsAbout,
        knowsLanguage: ['es', 'en'],
        sameAs: [PROFILES.github, PROFILES.linkedin, PROFILES.instagram],
      },
      {
        '@type': 'ItemList',
        '@id': `${page}#portfolio`,
        itemListElement: productos
          .filter((p) => p.url && p.status === 'live')
          .map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            item: { '@type': 'CreativeWork', name: p.nombre, url: p.url, description: p.descripcion[locale] },
          })),
      },
    ],
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
```

- [ ] **Step 3: Sitemap y robots**

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from 'next';
import { DATA_DATE } from '@/graph/generated/stats';
import { LOCALES, pageAlternates } from '@/lib/site';

const PATHS = ['', '/lore', '/informatica', '/filosofia', '/ciencias', '/enterprise'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => {
      const alt = pageAlternates(locale, path);
      return {
        url: alt.canonical,
        lastModified: DATA_DATE,
        changeFrequency: 'monthly' as const,
        priority: path === '' ? 1 : 0.7,
        alternates: { languages: alt.languages },
      };
    }),
  );
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
```

- [ ] **Step 4: Metadata de las subpáginas**

En `src/app/[locale]/(portal)/[frente]/page.tsx`, sustituye `generateMetadata` por:

```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string; frente: string }> }): Promise<Metadata> {
  const { locale: raw, frente } = await params;
  const locale = toLocale(raw);
  if (!VALID_FRENTES.includes(frente as FrenteId)) return {};
  const meta = frentesMeta[frente as FrenteId];
  const title = meta.nombre[locale];
  const description = clampDescription(meta.descripcion[locale]);
  const alternates = pageAlternates(locale, `/${frente}`);
  return {
    title,
    description,
    alternates,
    openGraph: { title, description, type: 'website', url: alternates.canonical, locale: OG_LOCALE[locale], siteName: 'Mouseîon' },
    twitter: { card: 'summary_large_image', title, description },
  };
}
```

Añade los imports `import { OG_LOCALE, clampDescription, pageAlternates, toLocale } from '@/lib/site';`. Sustituye cualquier `params.locale === 'es' ? 'es' : 'en'` restante por `toLocale(...)`.

En `src/app/[locale]/(portal)/lore/page.tsx`, sustituye `generateMetadata` por:

```ts
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const title = locale === 'es' ? 'Mi historia' : 'My story';
  const description = clampDescription(PORTRAIT[locale].heroLead);
  const alternates = pageAlternates(locale, '/lore');
  return {
    title,
    description,
    alternates,
    openGraph: { title, description, type: 'profile', url: alternates.canonical, locale: OG_LOCALE[locale], siteName: 'Mouseîon' },
    twitter: { card: 'summary_large_image', title, description },
  };
}
```

La plantilla `'%s · Mouseîon'` del layout raíz produce `Filosofía · Mouseîon` y `Mi historia · Mouseîon`, sin sufijo duplicado. La imagen OG llega por herencia de `src/app/[locale]/opengraph-image.tsx` (Tarea 12); el e2e de la Tarea 14 lo verifica.

- [ ] **Step 5: Verificar**

Run: `npm test && npm run typecheck && npm run lint` → Expected: todo PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(seo): JSON-LD @graph con Person/ProfilePage/ItemList, sitemap canónico con www y metadata propia en subpáginas

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---
### Task 10: Contenido de la home, cifras verificables y línea de tiempo

**Files:**
- Create: `src/content/home.ts`, `src/content/proof.ts`, `src/content/timeline.ts`
- Test: `tests/content/proof.test.ts`, `tests/content/timeline.test.ts`, `tests/content/home.test.ts`

**Interfaces:**
- Consume: `Locale` (Tarea 3); `Bilingual`, `parseDates`, `nodeId`, `EMPRESAS`, `type EmpresaKey` (Tarea 4); `GRAPH_STATS` (Tarea 8).
- Produce:
  - `interface HomeCopy` y `HOME: Record<Locale, HomeCopy>`.
  - `interface ProofFigure { id: string; value: Bilingual; label: Bilingual; source: string }` y `buildProofFigures(): ProofFigure[]`.
  - `interface TimelineEntry { key: EmpresaKey; nodeId: string; company: Bilingual; role: Bilingual; dates: Bilingual; start: string; location?: Bilingual; achievements: Bilingual[] }` y `buildTimeline(): TimelineEntry[]`.

- [ ] **Step 1: Escribir los tests (fallan)**

`tests/content/proof.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { productos } from '@/data/frentes';
import { GRAPH_STATS } from '@/graph/generated/stats';
import { buildProofFigures } from '@/content/proof';

describe('cifras de la sección Prueba', () => {
  const figures = buildProofFigures();
  const byId = Object.fromEntries(figures.map((f) => [f.id, f]));

  it('deriva las 8 cifras de los datos', () => {
    expect(figures.map((f) => f.id)).toEqual([
      'sat-tests',
      'logic-profiles',
      'microservices',
      'years',
      'kosmos-repos',
      'paideia-routes',
      'live-products',
      'graph',
    ]);
  });

  it('los valores coinciden con lo que dicen los datos', () => {
    expect(byId['sat-tests'].value.en).toBe('6,333');
    expect(byId['logic-profiles'].value.en).toBe('11');
    expect(byId['microservices'].value.en).toBe('8');
    expect(byId['years'].value.en).toBe('12+');
    expect(byId['kosmos-repos'].value.en).toBe('16');
    expect(byId['paideia-routes'].value.en).toBe('227');
    expect(byId['live-products'].value.en).toBe(String(productos.filter((p) => p.status === 'live').length));
    expect(byId['graph'].value.en).toBe(`${GRAPH_STATS.nodes} · ${GRAPH_STATS.edges}`);
  });

  it('cada cifra declara su fuente', () => {
    for (const f of figures) expect(f.source.length).toBeGreaterThan(0);
  });
});
```

`tests/content/timeline.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { EMPRESAS } from '@/graph/relations';
import { buildTimeline } from '@/content/timeline';

describe('línea de tiempo', () => {
  const entries = buildTimeline();
  it('sigue el orden canónico de experience.json', () => {
    expect(entries.map((e) => e.key)).toEqual([...EMPRESAS]);
  });
  it('Critertec incluye Soy Digital/INDOTEL como logro', () => {
    const critertec = entries.find((e) => e.key === 'critertec')!;
    expect(critertec.achievements.some((a) => a.es.includes('INDOTEL'))).toBe(true);
    expect(critertec.start).toBe('2024-11');
  });
  it('Indie Level Studio termina en 2025/09', () => {
    expect(entries.find((e) => e.key === 'indieLevels')!.dates.es).toContain('2025/09');
  });
});
```

`tests/content/home.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { HOME } from '@/content/home';

describe('copy de la home', () => {
  for (const locale of ['es', 'en'] as const) {
    it(`${locale}: título ≤ 60 y descripción ≤ 155, sin cifras sueltas`, () => {
      const { meta } = HOME[locale];
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeLessThanOrEqual(155);
      expect(meta.description).not.toMatch(/\d/);
    });
  }
});
```

Run: `npx vitest run tests/content` → Expected: FAIL (módulos inexistentes).

- [ ] **Step 2: `src/content/proof.ts`**

```ts
import { frentesMeta, productos } from '@/data/frentes';
import { GRAPH_STATS } from '@/graph/generated/stats';
import type { Bilingual } from '@/graph/model';

export interface ProofFigure {
  id: string;
  value: Bilingual;
  label: Bilingual;
  source: string;
}

function fromDescription(id: string, es: RegExp, en: RegExp): Bilingual | null {
  const p = productos.find((x) => x.id === id);
  const vEs = p?.descripcion.es.match(es)?.[1];
  const vEn = p?.descripcion.en.match(en)?.[1];
  return vEs && vEn ? { es: vEs.replace(/\s/g, ' '), en: vEn } : null;
}

export function buildProofFigures(): ProofFigure[] {
  const live = String(productos.filter((p) => p.status === 'live').length);
  const years = {
    es: frentesMeta.informatica.tagline.es.match(/(\d+\+) años/)?.[1],
    en: frentesMeta.informatica.tagline.en.match(/(\d+\+) years/)?.[1],
  };
  const candidates: (ProofFigure | null)[] = [
    wrap('sat-tests', fromDescription('nlp-to-logic', /(\d[\d\s  .]*\d) tests/, /(\d[\d,]*\d) tests/), {
      es: 'tests en el SAT solver CDCL propio de ST (Órganon y Ágora)',
      en: "tests in ST's home-grown CDCL SAT solver (Órganon and Ágora)",
    }, 'frentes.ts · nlp-to-logic'),
    wrap('logic-profiles', fromDescription('agora', /(\d+) perfiles/, /(\d+) profiles/), {
      es: 'perfiles lógicos en auto.logic',
      en: 'logic profiles in auto.logic',
    }, 'frentes.ts · agora'),
    wrap('microservices', fromDescription('prizma', /(\d+) microservicios/, /(\d+) deployed microservices/), {
      es: 'microservicios de Prizma en producción, con facturación DIAN',
      en: 'Prizma microservices in production, with DIAN e-invoicing',
    }, 'frentes.ts · prizma'),
    wrap('years', years.es && years.en ? { es: years.es, en: years.en } : null, {
      es: 'años construyendo backend, IA agéntica y devtools',
      en: 'years building backends, agentic AI and devtools',
    }, 'frentes.ts · frentesMeta.informatica'),
    wrap('kosmos-repos', fromDescription('complexlab', /(\d+) repos/, /(\d+) repos/), {
      es: 'repositorios de sistemas complejos en Kósmos',
      en: 'complex-systems repositories in Kósmos',
    }, 'frentes.ts · complexlab'),
    wrap('paideia-routes', fromDescription('clavis', /(\d+) rutas/, /(\d+) static MDX routes/), {
      es: 'rutas de humanidades digitales en Paideía',
      en: 'digital-humanities routes in Paideía',
    }, 'frentes.ts · clavis'),
    wrap('live-products', { es: live, en: live }, { es: 'productos en producción', en: 'products in production' }, 'frentes.ts · status live'),
    wrap('graph', { es: `${GRAPH_STATS.nodes} · ${GRAPH_STATS.edges}`, en: `${GRAPH_STATS.nodes} · ${GRAPH_STATS.edges}` }, {
      es: 'nodos y relaciones en el grafo de esta página',
      en: "nodes and relations in this page's graph",
    }, 'graph/generated/stats.ts'),
  ];
  return candidates.filter((f): f is ProofFigure => f !== null);
}

function wrap(id: string, value: Bilingual | null, label: Bilingual, source: string): ProofFigure | null {
  return value ? { id, value, label, source } : null;
}
```

- [ ] **Step 3: `src/content/timeline.ts`**

```ts
import achEs from '@/locales/es/common/achievements.json';
import achEn from '@/locales/en/common/achievements.json';
import expEs from '@/locales/es/common/experience.json';
import expEn from '@/locales/en/common/experience.json';
import type { Bilingual } from '@/graph/model';
import { EMPRESAS, type EmpresaKey } from '@/graph/relations';
import { nodeId, parseDates } from '@/graph/sources';

type Dict = Record<string, string>;
const EXP = { es: expEs as Dict, en: expEn as Dict };
const ACH = { es: achEs as Dict, en: achEn as Dict };

/** Logros de achievements.json que se muestran bajo cada empresa. Soy Digital/INDOTEL fue vía Critertec. */
const ACHIEVEMENTS: Partial<Record<EmpresaKey, string[]>> = {
  critertec: ['critertec', 'soyDigital'],
  humanizar: ['humanizar'],
  indieLevels: ['indieLevels'],
};

export interface TimelineEntry {
  key: EmpresaKey;
  nodeId: string;
  company: Bilingual;
  role: Bilingual;
  dates: Bilingual;
  /** YYYY-MM, para <time dateTime>. */
  start: string;
  location?: Bilingual;
  achievements: Bilingual[];
}

const pick = (dict: { es: Dict; en: Dict }, key: string): Bilingual | undefined =>
  dict.es[key] && dict.en[key] ? { es: dict.es[key], en: dict.en[key] } : undefined;
const dash = (s: string) => s.replace(/\s*-\s*/, ' — ');

export function buildTimeline(): TimelineEntry[] {
  return EMPRESAS.map((key) => {
    const { year, month } = parseDates(EXP.es[`experience.dates.${key}`]);
    const dates = pick(EXP, `experience.dates.${key}`)!;
    return {
      key,
      nodeId: nodeId.empresa(key),
      company: pick(EXP, `experience.${key}`)!,
      role: pick(EXP, `experience.role.${key}`)!,
      dates: { es: dash(dates.es), en: dash(dates.en) },
      start: `${year}-${String(month).padStart(2, '0')}`,
      location: pick(EXP, `experience.location.${key}`),
      achievements: (ACHIEVEMENTS[key] ?? []).map((a) => pick(ACH, `achievements.description.${a}`)).filter((a): a is Bilingual => Boolean(a)),
    };
  });
}
```

- [ ] **Step 4: `src/content/home.ts`**

```ts
import aboutEs from '@/locales/es/common/about.json';
import aboutEn from '@/locales/en/common/about.json';
import type { Locale } from '@/lib/site';

export interface HomeCopy {
  meta: { title: string; description: string; jobTitle: string[]; knowsAbout: string[] };
  nav: { skip: string; menu: string; method: string; path: string; fronts: string; proof: string; contact: string; language: string; hire: string };
  hero: { kicker: string; first: string; last: string; role: string; lead: string; ctaHire: string; ctaStory: string; figcaption: (nodes: number, edges: number) => string; listLink: string };
  method: { eyebrow: string; title: string; lead: string; paragraphs: string[]; epigraph: string; logic: string; engineering: string };
  path: { eyebrow: string; title: string; lead: string };
  fronts: { eyebrow: string; title: string; lead: string; searchLabel: string; searchPlaceholder: string; noResults: string; openFront: string; visit: string; code: string; soon: string };
  proof: { eyebrow: string; title: string; lead: string; stackTitle: string; stackLead: string };
  contact: {
    eyebrow: string;
    title: string;
    lead: string;
    hire: string;
    email: string;
    whatsapp: string;
    cvPhilosopher: string;
    cvEngineer: string;
    blog: string;
    story: string;
    social: string;
    ecosystem: string;
    foot: string;
  };
}

const KNOWS_ES = [
  'Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Docker', 'Linux', 'Google Cloud Platform', 'Cloud Run', 'APIs REST',
  'Microservicios', 'Integración de LLMs', 'RAG', 'OCR', 'Automatización de procesos', 'React', 'Next.js',
  'Arquitectura de software', 'Orquestación de agentes de IA', 'Lógica formal', 'Filosofía analítica', 'Epistemología',
  'Filosofía de la mente', 'Filosofía de la inteligencia artificial', 'Ética', 'Argumentación', 'Lógica simbólica',
  'Teoría de tipos', 'SAT solving', 'Sistemas complejos',
];
const KNOWS_EN = [
  'Node.js', 'NestJS', 'TypeScript', 'PostgreSQL', 'Docker', 'Linux', 'Google Cloud Platform', 'Cloud Run', 'REST APIs',
  'Microservices', 'LLM integration', 'RAG', 'OCR', 'Process automation', 'React', 'Next.js',
  'Software architecture', 'AI agent orchestration', 'Formal logic', 'Analytic philosophy', 'Epistemology',
  'Philosophy of mind', 'Philosophy of artificial intelligence', 'Ethics', 'Argumentation', 'Symbolic logic',
  'Type theory', 'SAT solving', 'Complex systems',
];

export const HOME: Record<Locale, HomeCopy> = {
  es: {
    meta: {
      title: 'Steven Vallejo Ortiz — Ingeniero de software y filósofo',
      description:
        'Ingeniero de software y filósofo. Backend, IA agéntica y lógica formal: explora mi trayectoria como un grafo vivo de empresas, productos e ideas.',
      jobTitle: ['Ingeniero de software', 'Filósofo'],
      knowsAbout: KNOWS_ES,
    },
    nav: {
      skip: 'Saltar al contenido',
      menu: 'Menú',
      method: 'Método',
      path: 'Trayectoria',
      fronts: 'Frentes',
      proof: 'Prueba',
      contact: 'Contacto',
      language: 'English',
      hire: 'Contratar',
    },
    hero: {
      kicker: 'Mouseîon · stevenvallejo.com',
      first: 'Steven',
      last: 'Vallejo Ortiz',
      role: 'Ingeniero de software · Filósofo',
      lead: 'Pensar antes de construir. Sistemas que sostienen lo que dicen que hacen.',
      ctaHire: 'Contratar servicios',
      ctaStory: 'Mi historia',
      figcaption: (nodes, edges) => `Este grafo es mi trayectoria: ${nodes} nodos, ${edges} relaciones reales`,
      listLink: 'Verlo como lista',
    },
    method: {
      eyebrow: '01 · Método',
      title: 'Dos lenguajes, un método',
      lead: 'La lógica y la ingeniería son, para mí, la misma disciplina: definir con precisión, distinguir lo necesario de lo accesorio y construir lo que se sostiene.',
      paragraphs: [aboutEs['about.p1'], aboutEs['about.p2'], aboutEs['about.p3']],
      epigraph: '«La abstracción no es alejarse del problema. Es verlo desde la altura exacta.»',
      logic: 'Lógica · Filosofía',
      engineering: 'Ingeniería · Sistemas',
    },
    path: {
      eyebrow: '02 · Trayectoria',
      title: 'Del servidor a la flota de agentes',
      lead: 'De la infraestructura y los videojuegos a plataformas que facturan, y a la flota de agentes que hoy opera este portafolio.',
    },
    fronts: {
      eyebrow: '03 · Frentes',
      title: 'Cuatro frentes, un mismo criterio',
      lead: 'Cada producto es una tesis sobre lógica, sistemas complejos o software que genera caja.',
      searchLabel: 'Buscar en el portafolio',
      searchPlaceholder: 'Producto, tecnología o tema…',
      noResults: 'Sin resultados. Prueba con otro término.',
      openFront: 'Explorar el frente',
      visit: 'Visitar',
      code: 'Código',
      soon: 'Próximamente',
    },
    proof: {
      eyebrow: '04 · Prueba',
      title: 'Evidencia, no adjetivos',
      lead: 'Cifras tomadas de los propios proyectos. Lo que no se puede verificar no aparece aquí.',
      stackTitle: 'Herramientas',
      stackLead: 'Lo que he usado en producción y en investigación, agrupado por familia.',
    },
    contact: {
      eyebrow: '05 · Contacto',
      title: 'Construyamos algo que se sostenga',
      lead: 'Consultoría, desarrollo a medida, IA aplicada o una conversación sobre lógica: escríbeme.',
      hire: 'Contratar servicios',
      email: 'Escribir un correo',
      whatsapp: 'WhatsApp',
      cvPhilosopher: 'CV de filósofo',
      cvEngineer: 'CV de ingeniero',
      blog: 'Blog · Scholḗ',
      story: 'Mi historia',
      social: 'Redes',
      ecosystem: 'Ecosistema',
      foot: 'Pensar antes de construir: ese es todo el método.',
    },
  },
  en: {
    meta: {
      title: 'Steven Vallejo Ortiz — Software engineer & philosopher',
      description:
        'Software engineer and philosopher. Backend, agentic AI and formal logic: explore my path as a living graph of companies, products and ideas.',
      jobTitle: ['Software engineer', 'Philosopher'],
      knowsAbout: KNOWS_EN,
    },
    nav: {
      skip: 'Skip to content',
      menu: 'Menu',
      method: 'Method',
      path: 'Path',
      fronts: 'Fronts',
      proof: 'Proof',
      contact: 'Contact',
      language: 'Español',
      hire: 'Hire me',
    },
    hero: {
      kicker: 'Mouseîon · stevenvallejo.com',
      first: 'Steven',
      last: 'Vallejo Ortiz',
      role: 'Software engineer · Philosopher',
      lead: 'Think before you build. Systems that hold up what they say they do.',
      ctaHire: 'Hire me',
      ctaStory: 'My story',
      figcaption: (nodes, edges) => `This graph is my path: ${nodes} nodes, ${edges} real relations`,
      listLink: 'See it as a list',
    },
    method: {
      eyebrow: '01 · Method',
      title: 'Two languages, one method',
      lead: 'To me, logic and engineering are the same discipline: define precisely, tell the essential from the accessory, and build what holds.',
      paragraphs: [aboutEn['about.p1'], aboutEn['about.p2'], aboutEn['about.p3']],
      epigraph: '“Abstraction is not stepping away from the problem. It is seeing it from the exact height.”',
      logic: 'Logic · Philosophy',
      engineering: 'Engineering · Systems',
    },
    path: {
      eyebrow: '02 · Path',
      title: 'From the server room to the agent fleet',
      lead: 'From infrastructure and video games to platforms that invoice, and to the agent fleet that runs this portfolio today.',
    },
    fronts: {
      eyebrow: '03 · Fronts',
      title: 'Four fronts, one standard',
      lead: 'Each product is a thesis on logic, complex systems or software that makes money.',
      searchLabel: 'Search the portfolio',
      searchPlaceholder: 'Product, technology or topic…',
      noResults: 'No results. Try another term.',
      openFront: 'Explore the front',
      visit: 'Visit',
      code: 'Code',
      soon: 'Coming soon',
    },
    proof: {
      eyebrow: '04 · Proof',
      title: 'Evidence, not adjectives',
      lead: 'Figures taken from the projects themselves. If it cannot be verified, it is not here.',
      stackTitle: 'Tools',
      stackLead: 'What I have used in production and research, grouped by family.',
    },
    contact: {
      eyebrow: '05 · Contact',
      title: 'Let’s build something that holds',
      lead: 'Consulting, custom development, applied AI or a conversation about logic: write to me.',
      hire: 'Hire me',
      email: 'Send an email',
      whatsapp: 'WhatsApp',
      cvPhilosopher: 'Philosopher CV',
      cvEngineer: 'Engineer CV',
      blog: 'Blog · Scholḗ',
      story: 'My story',
      social: 'Social',
      ecosystem: 'Ecosystem',
      foot: 'Think before you build: that is the whole method.',
    },
  },
};
```

- [ ] **Step 5: Verificar**

Run: `npx vitest run tests/content` → Expected: PASS (3 archivos). Si una cifra no aparece, revisa la regex contra el texto real de `frentes.ts`; no escribas el valor a mano.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(content): copy bilingüe de la home, cifras derivadas de datos y línea de tiempo canónica

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: Home nueva en Server Components + sistema visual

**Files:**
- Delete: `src/app/[locale]/(portal)/page.tsx`, `src/app/components/LinktreeHome.tsx`
- Create: `src/app/[locale]/(home)/layout.tsx`, `src/app/[locale]/(home)/page.tsx`
- Create: `src/components/home/SectionHead.tsx`, `HomeHeader.tsx`, `Stage.tsx`, `Hero.tsx`, `Method.tsx`, `Path.tsx`, `Fronts.tsx`, `ProductSearch.tsx`, `Proof.tsx`, `Contact.tsx`
- Create: `src/styles/home.css`
- Test: `tests/components/search.test.ts`

**Interfaces:**
- Consume:
  - `HOME`, `HomeCopy`, `buildProofFigures`, `buildTimeline` (Tarea 10).
  - `buildHomeJsonLd`, `serializeJsonLd` (Tarea 9).
  - `POSTER_SVG`, `GRAPH_STATS`, `DATA_DATE` (Tarea 8).
  - `nodeId` (Tarea 4), `TOOL_GROUPS` (Tarea 4).
  - `normalizeSearch`, `pageAlternates`, `OG_LOCALE`, `toLocale`, `PROFILES` (Tarea 3).
- Produce:
  - La página `/{locale}`.
  - `applySearchFilter(root: ParentNode, query: string): number`, exportado desde `ProductSearch.tsx` y usado por el test.
  - Atributos `data-node="<id>"` en línea de tiempo, frentes, productos y grupos. El Plan 2 los usa para `focusNode`.
  - El contenedor `.stage` (fijo durante todo el scroll) donde el Plan 2 montará el canvas.

- [ ] **Step 1: Test del filtro de búsqueda (falla)**

`tests/components/search.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { applySearchFilter } from '@/components/home/ProductSearch';

function fakeRoot() {
  const make = (search: string) => ({ dataset: { search }, hidden: false });
  const cards = [make('organon logica formal sat solver'), make('kosmos sistemas complejos'), make('prizma dian microservicios')];
  const fronts = [
    { hidden: false, cards: cards.slice(0, 2) },
    { hidden: false, cards: cards.slice(2) },
  ];
  return {
    cards,
    fronts,
    querySelectorAll(selector: string) {
      return (selector === '[data-search]' ? cards : fronts) as unknown as NodeListOf<HTMLElement>;
    },
  };
}

describe('applySearchFilter', () => {
  it('oculta tarjetas que no contienen todos los términos, sin tildes ni mayúsculas', () => {
    const root = fakeRoot();
    root.fronts.forEach((f) => Object.assign(f, { querySelector: () => (f.cards.some((c) => !c.hidden) ? {} : null) }));
    expect(applySearchFilter(root as unknown as ParentNode, 'Lógica SAT')).toBe(1);
    expect(root.cards.map((c) => c.hidden)).toEqual([false, true, true]);
    expect(root.fronts.map((f) => f.hidden)).toEqual([false, true]);
  });
  it('una consulta vacía muestra todo', () => {
    const root = fakeRoot();
    root.fronts.forEach((f) => Object.assign(f, { querySelector: () => ({}) }));
    expect(applySearchFilter(root as unknown as ParentNode, '   ')).toBe(3);
    expect(root.cards.every((c) => !c.hidden)).toBe(true);
  });
});
```

Run: `npx vitest run tests/components` → Expected: FAIL.

- [ ] **Step 2: `ProductSearch.tsx` (isla cliente mínima)**

`src/components/home/ProductSearch.tsx`:

```tsx
'use client';

import { useId, useState } from 'react';
import { normalizeSearch } from '@/lib/text';

/** Filtra en el DOM las tarjetas renderizadas por el servidor. Devuelve cuántas quedan visibles. */
export function applySearchFilter(root: ParentNode, query: string): number {
  const tokens = normalizeSearch(query.trim()).split(/\s+/).filter(Boolean);
  let visible = 0;
  root.querySelectorAll<HTMLElement>('[data-search]').forEach((el) => {
    const hay = el.dataset.search ?? '';
    const match = tokens.every((t) => hay.includes(t));
    el.hidden = !match;
    if (match) visible++;
  });
  root.querySelectorAll<HTMLElement>('[data-front]').forEach((front) => {
    front.hidden = tokens.length > 0 && !front.querySelector('[data-search]:not([hidden])');
  });
  return visible;
}

export default function ProductSearch({
  targetId,
  label,
  placeholder,
  noResults,
}: {
  targetId: string;
  label: string;
  placeholder: string;
  noResults: string;
}) {
  const id = useId();
  const [query, setQuery] = useState('');
  const [empty, setEmpty] = useState(false);
  const onChange = (value: string) => {
    setQuery(value);
    const root = document.getElementById(targetId);
    if (!root) return;
    const count = applySearchFilter(root, value);
    setEmpty(value.trim() !== '' && count === 0);
  };
  return (
    <div className="search" role="search">
      <label htmlFor={id} className="search-label">
        {label}
      </label>
      <input id={id} type="search" value={query} placeholder={placeholder} autoComplete="off" onChange={(e) => onChange(e.target.value)} />
      <p className="search-empty" aria-live="polite">
        {empty ? noResults : ''}
      </p>
    </div>
  );
}
```

Run: `npx vitest run tests/components` → Expected: PASS.

- [ ] **Step 3: Layout y página de la home**

`src/app/[locale]/(home)/layout.tsx`:

```tsx
import '@/styles/home.css';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

`src/app/[locale]/(home)/page.tsx`:

```tsx
import type { Metadata } from 'next';
import Contact from '@/components/home/Contact';
import Fronts from '@/components/home/Fronts';
import Hero from '@/components/home/Hero';
import HomeHeader from '@/components/home/HomeHeader';
import Method from '@/components/home/Method';
import Path from '@/components/home/Path';
import Proof from '@/components/home/Proof';
import Stage from '@/components/home/Stage';
import { HOME } from '@/content/home';
import { DATA_DATE } from '@/graph/generated/stats';
import { buildHomeJsonLd, serializeJsonLd } from '@/lib/jsonld';
import { OG_LOCALE, pageAlternates, toLocale } from '@/lib/site';

export const dynamic = 'error';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const { meta } = HOME[locale];
  const alternates = pageAlternates(locale);
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates,
    openGraph: {
      type: 'profile',
      title: meta.title,
      description: meta.description,
      url: alternates.canonical,
      siteName: 'Mouseîon',
      locale: OG_LOCALE[locale],
      alternateLocale: [OG_LOCALE[locale === 'es' ? 'en' : 'es']],
    },
    twitter: { card: 'summary_large_image', title: meta.title, description: meta.description },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const t = HOME[locale];
  const jsonLd = buildHomeJsonLd(locale, { jobTitle: t.meta.jobTitle, description: t.meta.description, knowsAbout: t.meta.knowsAbout }, DATA_DATE);
  return (
    <div className="home">
      <a className="skip" href="#contenido">
        {t.nav.skip}
      </a>
      <HomeHeader locale={locale} t={t} />
      <main id="contenido">
        <Stage />
        <Hero locale={locale} t={t} />
        <Method t={t} />
        <Path locale={locale} t={t} />
        <Fronts locale={locale} t={t} />
        <Proof locale={locale} t={t} />
        <Contact locale={locale} t={t} />
      </main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </div>
  );
}
```

- [ ] **Step 4: Componentes de sección**

`src/components/home/SectionHead.tsx`:

```tsx
export default function SectionHead({ id, eyebrow, title, lead }: { id: string; eyebrow: string; title: string; lead: string }) {
  return (
    <header className="sec-head reveal">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`}>{title}</h2>
      <p className="lead">{lead}</p>
    </header>
  );
}
```

`src/components/home/Stage.tsx`:

```tsx
import { POSTER_SVG } from '@/graph/generated/poster';

/** Capa fija durante todo el scroll. El Plan 2 monta aquí el canvas WebGL encima del póster. */
export default function Stage() {
  return (
    <div className="stage" data-stage aria-hidden="true">
      <div className="stage-poster" dangerouslySetInnerHTML={{ __html: POSTER_SVG }} />
    </div>
  );
}
```

`src/components/home/HomeHeader.tsx`:

```tsx
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import type { HomeCopy } from '@/content/home';
import type { Locale } from '@/lib/site';

export default function HomeHeader({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const other: Locale = locale === 'es' ? 'en' : 'es';
  const items: [string, string][] = [
    ['#metodo', t.nav.method],
    ['#trayectoria', t.nav.path],
    ['#frentes', t.nav.fronts],
    ['#prueba', t.nav.proof],
    ['#contacto', t.nav.contact],
  ];
  const list = (
    <ul>
      {items.map(([href, label]) => (
        <li key={href}>
          <a href={href}>{label}</a>
        </li>
      ))}
    </ul>
  );
  return (
    <header className="topbar">
      <Link href={`/${locale}`} className="brand" aria-label="Mouseîon · Steven Vallejo Ortiz">
        <BrandLogo size={28} />
        <span className="brand-word">Mouseîon</span>
      </Link>
      <nav className="topnav" aria-label={t.nav.menu}>
        {list}
      </nav>
      <div className="topbar-actions">
        <Link href={`/${other}`} hrefLang={other} lang={other} className="lang">
          {t.nav.language}
        </Link>
        <a className="btn btn-solid btn-sm" href="https://praxis.stevenvallejo.com" rel="noopener">
          {t.nav.hire}
        </a>
        <details className="menu">
          <summary>{t.nav.menu}</summary>
          {list}
        </details>
      </div>
    </header>
  );
}
```

`src/components/home/Hero.tsx`:

```tsx
import Link from 'next/link';
import type { HomeCopy } from '@/content/home';
import { GRAPH_STATS } from '@/graph/generated/stats';
import type { Locale } from '@/lib/site';

export default function Hero({ locale, t }: { locale: Locale; t: HomeCopy }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <p className="hero-kicker">{t.hero.kicker}</p>
      <h1 id="hero-title" className="hero-title">
        <span className="hero-first">{t.hero.first}</span> <span className="hero-last">{t.hero.last}</span>
      </h1>
      <div className="hero-meta">
        <p className="hero-role">{t.hero.role}</p>
        <p className="hero-lead">{t.hero.lead}</p>
        <div className="hero-actions">
          <a className="btn btn-solid" href="https://praxis.stevenvallejo.com" rel="noopener">
            {t.hero.ctaHire}
          </a>
          <Link className="btn btn-ghost" href={`/${locale}/lore`}>
            {t.hero.ctaStory}
          </Link>
        </div>
        <p className="hero-caption">
          {t.hero.figcaption(GRAPH_STATS.nodes, GRAPH_STATS.edges)} · <a href="#frentes">{t.hero.listLink}</a>
        </p>
      </div>
    </section>
  );
}
```

`src/components/home/Method.tsx`:

```tsx
import type { HomeCopy } from '@/content/home';
import SectionHead from './SectionHead';

export default function Method({ t }: { t: HomeCopy }) {
  const m = t.method;
  return (
    <section id="metodo" className="sec sec-method" aria-labelledby="metodo-title" data-section="metodo">
      <div className="sec-inner">
        <SectionHead id="metodo" eyebrow={m.eyebrow} title={m.title} lead={m.lead} />
        <div className="method-grid reveal">
          <p className="method-side method-logic" data-node="grupo:logica">
            {m.logic}
          </p>
          <div className="panel method-body">
            {m.paragraphs.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>
          <p className="method-side method-eng" data-node="frente:informatica">
            {m.engineering}
          </p>
        </div>
        <blockquote className="method-epigraph panel reveal">
          <p>{m.epigraph}</p>
        </blockquote>
      </div>
    </section>
  );
}
```

`src/components/home/Path.tsx`:

```tsx
import type { HomeCopy } from '@/content/home';
import { buildTimeline } from '@/content/timeline';
import type { Locale } from '@/lib/site';
import SectionHead from './SectionHead';

export default function Path({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const entries = buildTimeline();
  return (
    <section id="trayectoria" className="sec sec-path" aria-labelledby="trayectoria-title" data-section="trayectoria">
      <div className="sec-inner path-layout">
        <div className="path-head">
          <SectionHead id="trayectoria" eyebrow={t.path.eyebrow} title={t.path.title} lead={t.path.lead} />
        </div>
        <ol className="timeline">
          {entries.map((e) => (
            <li key={e.key} className="timeline-item reveal" data-node={e.nodeId}>
              <p className="timeline-dates">
                <time dateTime={e.start}>{e.dates[locale]}</time>
              </p>
              <div className="timeline-body panel">
                <h3>{e.company[locale]}</h3>
                <p className="timeline-role">{e.role[locale]}</p>
                {e.location ? <p className="timeline-place">{e.location[locale]}</p> : null}
                {e.achievements.map((a) => (
                  <p key={a.es.slice(0, 32)} className="timeline-note">
                    {a[locale]}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
```

`src/components/home/Fronts.tsx`:

```tsx
import Link from 'next/link';
import type { HomeCopy } from '@/content/home';
import { frenteOrder, frentesMeta, productTags, productos } from '@/data/frentes';
import { nodeId } from '@/graph/sources';
import type { Locale } from '@/lib/site';
import { normalizeSearch } from '@/lib/text';
import ProductSearch from './ProductSearch';
import SectionHead from './SectionHead';

export default function Fronts({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const f = t.fronts;
  return (
    <section id="frentes" className="sec sec-fronts" aria-labelledby="frentes-title" data-section="frentes">
      <div className="sec-inner">
        <SectionHead id="frentes" eyebrow={f.eyebrow} title={f.title} lead={f.lead} />
        <ProductSearch targetId="frentes-list" label={f.searchLabel} placeholder={f.searchPlaceholder} noResults={f.noResults} />
        <div id="frentes-list" className="fronts">
          {frenteOrder.map((fid) => {
            const meta = frentesMeta[fid];
            return (
              <article key={fid} className="front reveal" data-front={fid} data-node={nodeId.frente(fid)} aria-labelledby={`front-${fid}`}>
                <header className="front-head">
                  <p className="eyebrow">§ {meta.secNo}</p>
                  <h3 id={`front-${fid}`}>{meta.nombre[locale]}</h3>
                  <p className="front-tagline">{meta.tagline[locale]}</p>
                  <Link className="front-link" href={`/${locale}/${fid}`}>
                    {f.openFront} →
                  </Link>
                </header>
                <ul className="cards">
                  {productos
                    .filter((p) => p.frente === fid)
                    .map((p) => (
                      <li
                        key={p.id}
                        className="card"
                        data-node={nodeId.producto(p.id)}
                        data-search={normalizeSearch(
                          [p.nombre, p.subtitulo?.[locale] ?? '', p.descripcion[locale], p.badge?.[locale] ?? '', meta.nombre[locale], ...(productTags[p.id] ?? [])].join(' '),
                        )}
                      >
                        <p className="card-kicker">{p.subtitulo?.[locale] ?? meta.nombre[locale]}</p>
                        <h4>{p.nombre}</h4>
                        <p className="card-desc">{p.descripcion[locale]}</p>
                        <p className="card-foot">
                          {p.badge ? <span className="chip">{p.badge[locale]}</span> : null}
                          {p.url ? (
                            <a className="card-link" href={p.url} rel="noopener" target="_blank">
                              {f.visit}
                              <span className="sr-only"> {p.nombre}</span> ↗
                            </a>
                          ) : (
                            <span className="chip chip-soon">{f.soon}</span>
                          )}
                          {p.repo ? (
                            <a className="card-link" href={p.repo} rel="noopener" target="_blank">
                              {f.code}
                              <span className="sr-only"> {p.nombre}</span>
                            </a>
                          ) : null}
                        </p>
                      </li>
                    ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

`src/components/home/Proof.tsx`:

```tsx
import type { HomeCopy } from '@/content/home';
import { buildProofFigures } from '@/content/proof';
import toolsEn from '@/locales/en/common/tools.json';
import toolsEs from '@/locales/es/common/tools.json';
import { TOOL_GROUPS } from '@/graph/relations';
import { nodeId } from '@/graph/sources';
import type { Locale } from '@/lib/site';
import SectionHead from './SectionHead';

export default function Proof({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const figures = buildProofFigures();
  const tools = (locale === 'es' ? toolsEs : toolsEn) as Record<string, string>;
  return (
    <section id="prueba" className="sec sec-proof" aria-labelledby="prueba-title" data-section="prueba">
      <div className="sec-inner">
        <SectionHead id="prueba" eyebrow={t.proof.eyebrow} title={t.proof.title} lead={t.proof.lead} />
        <dl className="figures">
          {figures.map((fig) => (
            <div key={fig.id} className="figure reveal">
              <dt>{fig.label[locale]}</dt>
              <dd>{fig.value[locale]}</dd>
            </div>
          ))}
        </dl>
        <h3 className="stack-title">{t.proof.stackTitle}</h3>
        <p className="stack-lead">{t.proof.stackLead}</p>
        <div className="stack">
          {Object.entries(TOOL_GROUPS).map(([gid, group]) => (
            <div key={gid} className="stack-group reveal" data-node={nodeId.grupo(gid)}>
              <h4>{group.label[locale]}</h4>
              <ul className="chips">
                {group.tools.map((tool) => (
                  <li key={tool} className="chip">
                    {tools[`tools.item.${tool}`]}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

`src/components/home/Contact.tsx`:

```tsx
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import type { HomeCopy } from '@/content/home';
import { frenteOrder, frentesMeta } from '@/data/frentes';
import { PROFILES, type Locale } from '@/lib/site';
import SectionHead from './SectionHead';

export default function Contact({ locale, t }: { locale: Locale; t: HomeCopy }) {
  const c = t.contact;
  const links: { href: string; label: string; primary?: boolean }[] = [
    { href: 'https://praxis.stevenvallejo.com', label: c.hire, primary: true },
    { href: 'mailto:stevenvallejo780@gmail.com', label: c.email },
    { href: 'https://wa.me/573046374368', label: c.whatsapp },
    { href: 'https://filosofo.stevenvallejo.com', label: c.cvPhilosopher },
    { href: 'https://informatico.stevenvallejo.com', label: c.cvEngineer },
    { href: 'https://schole.stevenvallejo.com', label: c.blog },
  ];
  return (
    <>
      <section id="contacto" className="sec sec-contact" aria-labelledby="contacto-title" data-section="contacto">
        <div className="sec-inner">
          <SectionHead id="contacto" eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
          <ul className="contact-list reveal">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={l.primary ? 'contact-primary' : undefined} rel="noopener">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link href={`/${locale}/lore`}>{c.story}</Link>
            </li>
          </ul>
          <ul className="social" aria-label={c.social}>
            <li>
              <a href={PROFILES.github} rel="me noopener">GitHub</a>
            </li>
            <li>
              <a href={PROFILES.linkedin} rel="me noopener">LinkedIn</a>
            </li>
            <li>
              <a href={PROFILES.instagram} rel="me noopener">Instagram</a>
            </li>
          </ul>
        </div>
      </section>
      <footer className="footer">
        <p className="footer-brand">
          <BrandLogo size={22} /> <span>{c.foot}</span>
        </p>
        <nav aria-label={c.ecosystem}>
          <ul>
            {frenteOrder.map((fid) => (
              <li key={fid}>
                <Link href={`/${locale}/${fid}`}>{frentesMeta[fid].nombre[locale]}</Link>
              </li>
            ))}
            <li>
              <a href="https://praxis.stevenvallejo.com">Práxis</a>
            </li>
            <li>
              <a href="https://schole.stevenvallejo.com">Scholḗ</a>
            </li>
          </ul>
        </nav>
      </footer>
    </>
  );
}
```

- [ ] **Step 5: Sistema visual `src/styles/home.css`**

```css
/* Portada "El grafo": sistema visual propio (spec §3). Solo se carga en el grupo (home). */
@layer home {
  html:has(.home),
  body:has(.home) {
    margin: 0;
    background: #05090b;
  }
  html:has(.home) {
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
  }
  @media (prefers-reduced-motion: reduce) {
    html:has(.home) {
      scroll-behavior: auto;
    }
  }

  .home {
    --ink-0: #05090b;
    --ink-1: #0b1417;
    --line: rgb(232 224 212 / 0.09);
    --line-strong: rgb(232 224 212 / 0.18);
    --text: #e8e0d4;
    --text-strong: #f6f1e8;
    --text-soft: #c9c2b6;
    --muted: #8fa3a8;
    --teal: #43b5a6;
    --teal-2: #6fd3c4;
    --gold: #e0a85e;
    --gold-2: #f0c887;
    --rust: #cf6a3c;
    --violet: #8d7cc0;
    --scrim: rgb(5 9 11 / 0.86);
    --blur: none;
    --f-display: var(--font-display), 'Cormorant Garamond', Georgia, serif;
    --f-sans: var(--font-geist-sans), system-ui, -apple-system, 'Segoe UI', sans-serif;
    --f-mono: var(--font-jetbrains), ui-monospace, 'SFMono-Regular', monospace;
    --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
    --gutter: clamp(1rem, 4vw, 3rem);
    --measure: 40rem;
    --radius: 18px;

    position: relative;
    min-height: 100svh;
    background: var(--ink-0);
    color: var(--text);
    font-family: var(--f-sans);
    font-size: 1rem;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    color-scheme: dark;
  }
  @media (min-width: 900px) and (hover: hover) {
    .home {
      --scrim: rgb(5 9 11 / 0.74);
      --blur: blur(8px);
    }
  }
  @media (color-gamut: p3) {
    .home {
      --teal: color(display-p3 0.3 0.72 0.65);
      --gold: color(display-p3 0.88 0.67 0.4);
      --rust: color(display-p3 0.8 0.42 0.25);
    }
  }

  .home *,
  .home *::before,
  .home *::after {
    box-sizing: border-box;
  }
  .home [hidden] {
    display: none !important;
  }
  .home h1,
  .home h2,
  .home h3,
  .home h4,
  .home p,
  .home dl,
  .home dd,
  .home blockquote {
    margin: 0;
  }
  .home h1,
  .home h2,
  .home h3,
  .home h4 {
    font-weight: 500;
  }
  .home ul,
  .home ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .home a {
    color: inherit;
    text-decoration-color: color-mix(in oklab, currentColor 40%, transparent);
    text-underline-offset: 0.2em;
  }
  .home a:hover {
    text-decoration-color: currentColor;
  }
  .home :focus-visible {
    outline: 2px solid var(--gold);
    outline-offset: 3px;
    border-radius: 4px;
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }
  .skip {
    position: absolute;
    left: var(--gutter);
    top: -4rem;
    z-index: 50;
    padding: 0.6rem 1rem;
    background: var(--gold);
    color: var(--ink-0);
    border-radius: 999px;
    font-weight: 600;
    text-decoration: none;
  }
  .skip:focus {
    top: 1rem;
  }

  /* ── Barra superior ── */
  .topbar {
    position: fixed;
    inset: 0 0 auto 0;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: 1.5rem;
    padding: 0.85rem var(--gutter);
    background: linear-gradient(to bottom, rgb(5 9 11 / 0.88), rgb(5 9 11 / 0));
  }
  .brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    text-decoration: none;
    font-family: var(--f-display);
    font-size: 1.35rem;
    color: var(--text-strong);
  }
  .topnav {
    margin-inline: auto;
  }
  .topnav ul {
    display: flex;
    gap: clamp(1rem, 2.2vw, 2rem);
  }
  .topnav a,
  .menu a {
    display: inline-block;
    padding-block: 0.6rem;
    font-family: var(--f-mono);
    font-size: 0.74rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--text-soft);
  }
  .topnav a:hover {
    color: var(--text-strong);
  }
  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-left: auto;
  }
  .lang {
    padding: 0.55rem 0.25rem;
    font-family: var(--f-mono);
    font-size: 0.74rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--muted);
  }
  .menu {
    display: none;
    position: relative;
  }
  .menu summary {
    list-style: none;
    cursor: pointer;
    padding: 0.55rem 0.9rem;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    font-family: var(--f-mono);
    font-size: 0.74rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .menu summary::-webkit-details-marker {
    display: none;
  }
  .menu ul {
    position: absolute;
    right: 0;
    top: calc(100% + 0.5rem);
    min-width: 12rem;
    padding: 0.5rem 1rem;
    background: var(--ink-1);
    border: 1px solid var(--line-strong);
    border-radius: 14px;
  }
  .menu li a {
    display: block;
    padding: 0.7rem 0;
  }
  @media (max-width: 900px) {
    .topnav {
      display: none;
    }
    .menu {
      display: block;
    }
  }
  @media (max-width: 480px) {
    .topbar .btn-sm,
    .brand-word {
      display: none;
    }
  }

  /* ── Botones ── */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 2.75rem;
    padding: 0.7rem 1.35rem;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 500;
    text-decoration: none;
    transition:
      transform 0.4s var(--ease-out),
      background-color 0.3s,
      border-color 0.3s;
  }
  .btn-sm {
    min-height: 2.25rem;
    padding: 0.45rem 1rem;
    font-size: 0.85rem;
  }
  .btn-solid {
    background: var(--text-strong);
    color: var(--ink-0);
  }
  .btn-solid:hover {
    transform: translateY(-1px);
    background: #fff;
  }
  .btn-ghost {
    border: 1px solid var(--line-strong);
    background: rgb(5 9 11 / 0.4);
    color: var(--text-strong);
  }
  .btn-ghost:hover {
    border-color: var(--gold);
  }

  /* ── Escenario del grafo (fijo durante todo el scroll) ── */
  .stage {
    position: sticky;
    top: 0;
    z-index: 0;
    height: 100svh;
    margin-bottom: -100svh;
    overflow: hidden;
    pointer-events: none;
  }
  .stage::before {
    content: '';
    position: absolute;
    inset: -10%;
    background: radial-gradient(60% 55% at 50% 48%, rgb(35 67 90 / 0.28), rgb(35 67 90 / 0.08) 45%, transparent 70%);
  }
  .stage-poster {
    position: absolute;
    inset: 0;
  }
  .stage-poster svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  /* ── Hero ── */
  .hero {
    position: relative;
    z-index: 1;
    min-height: 100svh;
    display: grid;
    grid-template-rows: 1fr auto 1fr;
    padding: 5.5rem var(--gutter) 2.5rem;
  }
  .hero-kicker {
    align-self: end;
    justify-self: center;
    margin-bottom: 1.5rem;
    font-family: var(--f-mono);
    font-size: 0.72rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .hero-title {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    font-family: var(--f-display);
    font-size: clamp(3.4rem, 10.5vw, 12rem);
    line-height: 0.86;
    letter-spacing: -0.035em;
    color: var(--text-strong);
    text-shadow: 0 0 40px rgb(5 9 11 / 0.8);
  }
  .hero-last {
    text-align: right;
  }
  .hero-meta {
    align-self: end;
    display: grid;
    gap: 1rem;
    max-width: 34rem;
    padding: 1.25rem 1.4rem;
    background: var(--scrim);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    backdrop-filter: var(--blur);
  }
  .hero-role {
    font-family: var(--f-mono);
    font-size: 0.8rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--teal-2);
  }
  .hero-lead {
    font-size: clamp(1.05rem, 1.5vw, 1.25rem);
    text-wrap: pretty;
  }
  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
  .hero-caption {
    font-family: var(--f-mono);
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    color: var(--muted);
  }
  .hero-caption a {
    color: var(--gold);
  }
  @media (max-width: 720px) {
    .hero {
      grid-template-rows: auto 1fr auto;
      padding-top: 5rem;
    }
    .hero-kicker {
      justify-self: start;
      align-self: start;
      margin: 0;
    }
    .hero-title {
      align-self: center;
      flex-direction: column;
      align-items: flex-start;
      gap: 0;
      font-size: clamp(3.2rem, 17vw, 5.5rem);
    }
    .hero-last {
      align-self: flex-end;
    }
  }

  /* ── Secciones ── */
  .sec {
    position: relative;
    z-index: 1;
    padding: clamp(5rem, 14vh, 9rem) var(--gutter);
  }
  .sec-inner {
    max-width: 76rem;
    margin-inline: auto;
  }
  .sec-head {
    max-width: var(--measure);
    margin-bottom: clamp(2rem, 5vh, 3.5rem);
    padding: 1.4rem 1.6rem;
    background: var(--scrim);
    border-radius: var(--radius);
    backdrop-filter: var(--blur);
  }
  .eyebrow {
    margin-bottom: 1rem;
    font-family: var(--f-mono);
    font-size: 0.74rem;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--teal-2);
  }
  .sec-head h2 {
    font-family: var(--f-display);
    font-size: clamp(2.5rem, 5.6vw, 5.2rem);
    line-height: 0.95;
    letter-spacing: -0.025em;
    color: var(--text-strong);
    text-wrap: balance;
  }
  .sec-head .lead {
    margin-top: 1.25rem;
    font-size: clamp(1.05rem, 1.4vw, 1.2rem);
    color: var(--text-soft);
    text-wrap: pretty;
  }
  .panel {
    padding: clamp(1.25rem, 2.6vw, 2rem);
    background: var(--scrim);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    backdrop-filter: var(--blur);
  }

  /* ── Método ── */
  .method-grid {
    display: grid;
    grid-template-columns: 1fr minmax(0, var(--measure)) 1fr;
    gap: clamp(1rem, 3vw, 2.5rem);
    align-items: center;
  }
  .method-side {
    font-family: var(--f-mono);
    font-size: 0.78rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .method-logic {
    text-align: right;
    color: var(--gold);
  }
  .method-eng {
    color: var(--teal-2);
  }
  .method-body {
    display: grid;
    gap: 1rem;
  }
  .method-epigraph {
    max-width: 46rem;
    margin: clamp(2.5rem, 6vh, 4rem) auto 0;
    text-align: center;
    font-family: var(--f-display);
    font-style: italic;
    font-size: clamp(1.5rem, 2.8vw, 2.3rem);
    line-height: 1.25;
    color: var(--gold-2);
  }
  @media (max-width: 900px) {
    .method-grid {
      grid-template-columns: 1fr;
    }
    .method-logic {
      text-align: left;
    }
  }

  /* ── Trayectoria ── */
  .path-layout {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(2rem, 5vw, 5rem);
    align-items: start;
  }
  .path-head {
    position: sticky;
    top: 7rem;
  }
  .timeline {
    position: relative;
    display: grid;
    gap: 1.25rem;
  }
  .timeline::before {
    content: '';
    position: absolute;
    left: 0.45rem;
    top: 0.5rem;
    bottom: 0.5rem;
    width: 1px;
    background: linear-gradient(var(--teal), var(--gold) 55%, transparent);
  }
  .timeline-item {
    position: relative;
    display: grid;
    gap: 0.6rem;
    padding-left: 2rem;
  }
  .timeline-item::before {
    content: '';
    position: absolute;
    left: 0.2rem;
    top: 0.45rem;
    width: 0.55rem;
    height: 0.55rem;
    border-radius: 50%;
    background: var(--ink-0);
    border: 1px solid var(--teal-2);
    box-shadow: 0 0 12px rgb(111 211 196 / 0.5);
  }
  .timeline-dates {
    font-family: var(--f-mono);
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    color: var(--muted);
  }
  .timeline-body {
    display: grid;
    gap: 0.35rem;
  }
  .timeline-body h3 {
    font-family: var(--f-display);
    font-size: clamp(1.5rem, 2.3vw, 2rem);
    line-height: 1.1;
    color: var(--text-strong);
  }
  .timeline-role {
    font-size: 0.95rem;
    color: var(--teal-2);
  }
  .timeline-place {
    font-size: 0.85rem;
    color: var(--muted);
  }
  .timeline-note {
    margin-top: 0.4rem;
    font-size: 0.95rem;
    color: var(--text-soft);
  }
  @media (max-width: 900px) {
    .path-layout {
      grid-template-columns: 1fr;
    }
    .path-head {
      position: static;
    }
  }

  /* ── Frentes ── */
  .search {
    display: grid;
    gap: 0.5rem;
    max-width: 34rem;
    margin-bottom: 2.5rem;
  }
  .search-label {
    font-family: var(--f-mono);
    font-size: 0.74rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .search input {
    width: 100%;
    min-height: 3rem;
    padding: 0.75rem 1.1rem;
    font: inherit;
    color: var(--text-strong);
    background: var(--scrim);
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    backdrop-filter: var(--blur);
  }
  .search input::placeholder {
    color: var(--muted);
  }
  .search-empty {
    min-height: 1.5rem;
    color: var(--gold-2);
  }
  .fronts {
    display: grid;
    gap: clamp(3rem, 8vh, 5rem);
  }
  .front {
    --accent: var(--teal);
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 2.2fr);
    gap: clamp(1.5rem, 4vw, 3.5rem);
    align-items: start;
  }
  .front[data-front='filosofia'] {
    --accent: var(--gold);
  }
  .front[data-front='ciencias'] {
    --accent: var(--violet);
  }
  .front[data-front='enterprise'] {
    --accent: var(--rust);
  }
  .front-head {
    position: sticky;
    top: 7rem;
    display: grid;
    gap: 0.75rem;
    padding: 1.4rem;
    background: var(--scrim);
    border: 1px solid var(--line);
    border-top: 2px solid var(--accent);
    border-radius: var(--radius);
    backdrop-filter: var(--blur);
  }
  .front-head .eyebrow {
    margin: 0;
    color: var(--accent);
  }
  .front-head h3 {
    font-family: var(--f-display);
    font-size: clamp(2rem, 3.4vw, 3rem);
    line-height: 1;
    color: var(--text-strong);
  }
  .front-tagline {
    color: var(--text-soft);
  }
  .front-link {
    padding-block: 0.5rem;
    font-family: var(--f-mono);
    font-size: 0.78rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--accent);
  }
  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
    gap: 1rem;
  }
  .card {
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 0.55rem;
    padding: 1.3rem 1.35rem;
    background: var(--scrim);
    border: 1px solid var(--line);
    border-radius: var(--radius);
    backdrop-filter: var(--blur);
    transition:
      border-color 0.35s,
      transform 0.5s var(--ease-out);
  }
  .card:hover {
    border-color: color-mix(in oklab, var(--accent) 55%, transparent);
    transform: translateY(-3px);
  }
  .card-kicker {
    font-family: var(--f-mono);
    font-size: 0.7rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .card h4 {
    font-family: var(--f-display);
    font-size: 1.75rem;
    line-height: 1.05;
    color: var(--text-strong);
  }
  .card-desc {
    font-size: 0.92rem;
    line-height: 1.55;
    color: var(--text-soft);
  }
  .card-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.6rem;
    margin-top: 0.4rem;
  }
  .card-link {
    padding-block: 0.35rem;
    font-size: 0.88rem;
    color: var(--text-strong);
  }
  .chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.65rem;
    border: 1px solid var(--line-strong);
    border-radius: 999px;
    font-family: var(--f-mono);
    font-size: 0.68rem;
    letter-spacing: 0.06em;
    color: var(--text-soft);
  }
  .chip-soon {
    color: var(--gold-2);
    border-color: color-mix(in oklab, var(--gold) 40%, transparent);
  }
  @media (max-width: 900px) {
    .front {
      grid-template-columns: 1fr;
    }
    .front-head {
      position: static;
    }
  }

  /* ── Prueba ── */
  .figures {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
    border-top: 1px solid var(--line-strong);
    background: var(--scrim);
    border-radius: 0 0 var(--radius) var(--radius);
    backdrop-filter: var(--blur);
  }
  .figure {
    display: flex;
    flex-direction: column-reverse;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1.6rem 1.4rem;
    border-right: 1px solid var(--line);
    border-bottom: 1px solid var(--line);
  }
  .figure dd {
    font-family: var(--f-display);
    font-size: clamp(2.6rem, 4.5vw, 3.8rem);
    line-height: 1;
    font-variant-numeric: lining-nums tabular-nums;
    color: var(--text-strong);
  }
  .figure dt {
    font-size: 0.9rem;
    color: var(--text-soft);
  }
  .stack-title {
    margin-top: clamp(3rem, 7vh, 4.5rem);
    font-family: var(--f-display);
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    color: var(--text-strong);
  }
  .stack-lead {
    max-width: var(--measure);
    margin: 0.6rem 0 1.5rem;
    color: var(--text-soft);
  }
  .stack {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
    gap: 1rem;
  }
  .stack-group {
    padding: 1.1rem 1.2rem;
    background: var(--scrim);
    border: 1px solid var(--line);
    border-radius: 14px;
    backdrop-filter: var(--blur);
  }
  .stack-group h4 {
    margin-bottom: 0.75rem;
    font-family: var(--f-mono);
    font-size: 0.74rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--teal-2);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
  }

  /* ── Contacto y pie ── */
  .contact-list {
    display: grid;
    border-top: 1px solid var(--line-strong);
    background: var(--scrim);
    backdrop-filter: var(--blur);
  }
  .contact-list a {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 1rem;
    padding: 1.1rem 0.4rem;
    border-bottom: 1px solid var(--line);
    text-decoration: none;
    font-family: var(--f-display);
    font-size: clamp(1.5rem, 3.2vw, 2.6rem);
    line-height: 1.1;
    color: var(--text-strong);
    transition:
      color 0.3s,
      padding 0.5s var(--ease-out);
  }
  .contact-list a::after {
    content: '↗';
    font-family: var(--f-sans);
    font-size: 0.9em;
    color: var(--muted);
  }
  .contact-list a:hover {
    padding-left: 1rem;
    color: var(--gold-2);
  }
  .contact-list .contact-primary {
    color: var(--gold-2);
  }
  .social {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.5rem;
    margin-top: 2rem;
  }
  .social a {
    display: inline-block;
    padding-block: 0.4rem;
    font-family: var(--f-mono);
    font-size: 0.78rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-soft);
  }
  .footer {
    position: relative;
    z-index: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 2.5rem var(--gutter) 3rem;
    border-top: 1px solid var(--line);
    background: var(--ink-0);
    font-size: 0.85rem;
    color: var(--muted);
  }
  .footer-brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
  }
  .footer ul {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
  }
  .footer a {
    display: inline-block;
    padding-block: 0.4rem;
    color: var(--text-soft);
  }

  /* ── Movimiento como mejora progresiva (el estado por defecto siempre es visible) ── */
  @supports (animation-timeline: view()) {
    @media (prefers-reduced-motion: no-preference) {
      .reveal {
        animation: home-reveal linear both;
        animation-timeline: view();
        animation-range: entry 0% entry 55%;
      }
      .stage-poster {
        animation: home-stage-dim linear both;
        animation-timeline: scroll(root);
        animation-range: 0 90vh;
      }
    }
  }
  @keyframes home-reveal {
    from {
      opacity: 0;
      transform: translateY(28px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @keyframes home-stage-dim {
    from {
      opacity: 1;
    }
    to {
      opacity: 0.32;
    }
  }
}
```

- [ ] **Step 6: Retirar la home antigua**

```bash
git rm "src/app/[locale]/(portal)/page.tsx" src/app/components/LinktreeHome.tsx
grep -rn "LinktreeHome" src || echo "sin referencias"
```

Resultado esperado: `sin referencias`.

- [ ] **Step 7: Verificar build y render**

```bash
npm run typecheck && npm run lint && npm test && npm run build 2>&1 | tail -30
```

Resultado esperado: todo pasa y `/[locale]` sale como estático. Si `dynamic = 'error'` falla, el error indica qué API dinámica se usa: hay que eliminarla, no quitar el guard.

```bash
npx next start -p 3100 & sleep 6
curl -s http://localhost:3100/es | grep -o '<h1[^>]*>.*</h1>' | head -1
curl -s http://localhost:3100/es | grep -c 'data-node='
kill %1
```

Resultado esperado: un `<h1>` con "Steven" y "Vallejo Ortiz", y más de 40 elementos `data-node`.

- [ ] **Step 8: Revisión visual**

Toma capturas a 1440, 834 y 390 px con el script de la Tarea 14 (o, si aún no existe, con `node /tmp/claude-1000/-workspace-MySites/7ea71e47-55a6-4be8-a107-7aa1ceab04d6/scratchpad/refshot/capture.cjs http://localhost:3100/es /workspace/.scratch-steven-redesign/shots/t11` y `--mobile`). Míralas con la herramienta Read. Comprueba:
- El nombre flanquea el póster.
- No hay solapes ni desbordes horizontales.
- Los paneles son legibles sobre el grafo.

Corrige en `home.css` lo que no cumpla.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(home): nueva portada narrativa en RSC con póster del grafo, 5 secciones y sistema visual propio

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 12: Imagen Open Graph por locale

**Files:**
- Create: `src/app/[locale]/opengraph-image.tsx`
- Delete: `src/app/opengraph-image.tsx`, `public/og-image.png`

**Interfaces:**
- Consume: `POSTER_SVG` (Tarea 8), `HOME` (Tarea 10), `LOCALES`, `toLocale` (Tarea 3).
- Produce: `/{locale}/opengraph-image` (PNG de 1200×630, generado en build), heredado por las subpáginas.

- [ ] **Step 1: Implementar**

```bash
git rm src/app/opengraph-image.tsx public/og-image.png
```

`src/app/[locale]/opengraph-image.tsx`:

```tsx
import { ImageResponse } from 'next/og';
import { HOME } from '@/content/home';
import { POSTER_SVG } from '@/graph/generated/poster';
import { LOCALES, toLocale } from '@/lib/site';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Steven Vallejo Ortiz — Mouseîon';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = toLocale((await params).locale);
  const copy = HOME[locale];
  const poster = `data:image/svg+xml;base64,${Buffer.from(POSTER_SVG).toString('base64')}`;
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', background: '#05090b' }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) solo acepta <img> */}
        <img src={poster} width={1200} height={750} alt="" style={{ position: 'absolute', top: -60, left: 0 }} />
        <div
          style={{
            position: 'absolute',
            left: 64,
            right: 64,
            bottom: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            color: '#f6f1e8',
          }}
        >
          <div style={{ fontSize: 26, letterSpacing: 6, color: '#8fa3a8', textTransform: 'uppercase' }}>Mouseîon</div>
          <div style={{ fontSize: 82, letterSpacing: -2, lineHeight: 1 }}>Steven Vallejo Ortiz</div>
          <div style={{ fontSize: 32, color: '#6fd3c4' }}>{copy.hero.role}</div>
        </div>
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 2: Verificar**

```bash
npm run build 2>&1 | grep -i opengraph
npx next start -p 3100 & sleep 6
for l in es en; do curl -s -o /workspace/.scratch-steven-redesign/og-$l.png -w "$l %{http_code} %{content_type}\n" http://localhost:3100/$l/opengraph-image; done
curl -s http://localhost:3100/es/filosofia | grep -o '<meta property="og:image"[^>]*>' | head -2
kill %1
```

Resultado esperado:
- `es 200 image/png` y `en 200 image/png`.
- En `/es/filosofia` aparece un `og:image` que apunta a `/es/opengraph-image…`.

Mira los PNG con Read. Si la subpágina no hereda `og:image`, añade en su `generateMetadata`: `openGraph.images: [{ url: \`${localeUrl(locale)}/opengraph-image\`, width: 1200, height: 630 }]`, y `twitter.images` con la misma URL, tanto en frente como en lore.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(seo): imagen OG por locale generada en build desde el póster del grafo

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 13: Analítica diferida y CSP aplicada

**Files:**
- Create: `src/components/Analytics.tsx`
- Modify: `src/app/[locale]/layout.tsx` (monta `<Analytics />` dentro de `<body>`), `next.config.mjs` (CSP)

**Interfaces:**
- Produce: GA `G-E5NMYWLXER` cargado solo tras la primera interacción del usuario; CSP en modo enforcing en producción.

- [ ] **Step 1: Cargador de GA**

`src/components/Analytics.tsx`:

```tsx
'use client';

import { useEffect } from 'react';

const GA_ID = 'G-E5NMYWLXER';
const EVENTS = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** GA solo con la primera interacción: así no suma TBT en la carga ni en Lighthouse. */
export default function Analytics() {
  useEffect(() => {
    const load = () => {
      EVENTS.forEach((e) => window.removeEventListener(e, load));
      if (window.gtag) return;
      window.dataLayer = window.dataLayer || [];
      window.gtag = function gtag() {
        // gtag exige el objeto `arguments`, no un array
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer!.push(arguments);
      };
      window.gtag('js', new Date());
      window.gtag('config', GA_ID, { page_path: window.location.pathname });
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
      document.head.appendChild(script);
    };
    EVENTS.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    return () => EVENTS.forEach((e) => window.removeEventListener(e, load));
  }, []);
  return null;
}
```

En `src/app/[locale]/layout.tsx`: `import Analytics from '@/components/Analytics';` y el body queda `<body>{children}<Analytics /></body>`.

- [ ] **Step 2: CSP aplicada en producción**

En `next.config.mjs`, sustituye la entrada `Content-Security-Policy-Report-Only` del array `securityHeaders` y actualiza el comentario de cabecera del archivo:

```js
const isProd = process.env.NODE_ENV === 'production';

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self'",
  "connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');
```

y en el array: `...(isProd ? [{ key: 'Content-Security-Policy', value: csp }] : []),`.

Comentario nuevo:

```js
 * CSP en modo enforcing solo en producción: `next dev` necesita eval para Fast Refresh.
 * 'unsafe-inline' en script-src es necesario para los payloads RSC inline de una página
 * estática (un nonce obligaría a render dinámico). GA solo se carga tras interacción.
```

- [ ] **Step 3: Verificar**

```bash
npm run build && (npx next start -p 3100 & sleep 6; curl -sI http://localhost:3100/es | grep -i -E '^content-security-policy|x-powered-by'; kill %1)
```

Resultado esperado: aparece `content-security-policy:` (sin `-report-only`) y **no** aparece `x-powered-by`. La ausencia de violaciones de CSP en consola la comprueba el e2e de la Tarea 14.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(perf,sec): GA tras la primera interacción y CSP aplicada en producción

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```

---

### Task 14: E2E, presupuesto de JS, Lighthouse y actualización de la spec

**Files:**
- Create: `playwright.config.ts`, `e2e/home.spec.ts`, `scripts/lighthouse.mjs`
- Modify: `package.json` (scripts `e2e` y `lighthouse`; devDependency `@playwright/test`), `.gitignore` (`/test-results`, `/playwright-report`)
- Modify: `docs/superpowers/specs/2026-09-23-home-grafo-design.md` (desviaciones del Plan 1)

**Interfaces:**
- Consume: todo lo anterior.
- Produce: verificación automatizada y `/workspace/.scratch-steven-redesign/lh/summary.json` con las medianas de Lighthouse.

- [ ] **Step 1: Configurar Playwright**

```bash
npm install --save-dev --save-exact @playwright/test@1.63.0
printf "/test-results\n/playwright-report\n" >> .gitignore
```

`package.json` → `scripts`: `"e2e": "playwright test"`, `"lighthouse": "node scripts/lighthouse.mjs"`.

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3210',
    launchOptions: { executablePath: process.env.PW_CHROME ?? '/usr/bin/google-chrome' },
  },
  webServer: { command: 'npx next start -p 3210', url: 'http://localhost:3210/es', reuseExistingServer: true, timeout: 120_000 },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'tablet', use: { viewport: { width: 834, height: 1112 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
});
```

- [ ] **Step 2: Escribir los e2e**

`e2e/home.spec.ts`:

```ts
import { gzipSync } from 'node:zlib';
import { expect, test, type Page } from '@playwright/test';

const SITE = 'https://www.stevenvallejo.com';
const SHOTS = '/workspace/.scratch-steven-redesign/shots';

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

for (const locale of ['es', 'en'] as const) {
  test.describe(`/${locale}`, () => {
    test('estructura, SEO y cero errores de consola', async ({ page }, info) => {
      const errors = collectErrors(page);
      await page.goto(`/${locale}`);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('html')).toHaveAttribute('lang', locale);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/${locale}`);
      await expect(page.locator('link[rel="alternate"][hreflang="es"]')).toHaveAttribute('href', `${SITE}/es`);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', `${SITE}/en`);
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', `${SITE}/en`);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(1);
      const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? '{}');
      expect(ld['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual(['WebSite', 'ProfilePage', 'Person', 'ItemList']);
      await expect(page.locator('.stage-poster svg')).toBeAttached();
      expect(await page.locator('meta[property="og:image"]').count()).toBeGreaterThan(0);
      const title = await page.title();
      expect(title.length).toBeLessThanOrEqual(60);
      const description = await page.locator('meta[name="description"]').getAttribute('content');
      expect(description!.length).toBeLessThanOrEqual(155);
      await page.screenshot({ path: `${SHOTS}/${info.project.name}-${locale}.png`, fullPage: true });
      expect(errors).toEqual([]);
    });

    test('enlaces internos responden 200', async ({ page, request }) => {
      await page.goto(`/${locale}`);
      const hrefs = await page.$$eval('a[href^="/"]', (as) => [...new Set(as.map((a) => a.getAttribute('href')!.split('#')[0]).filter(Boolean))]);
      for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
    });

    test('JS del hilo principal ≤ 130 KB gz', async ({ page, baseURL }) => {
      const scripts: Promise<number>[] = [];
      page.on('response', (r) => {
        if (r.request().resourceType() === 'script' && r.url().startsWith(baseURL!)) scripts.push(r.body().then((b) => gzipSync(b).length));
      });
      await page.goto(`/${locale}`, { waitUntil: 'networkidle' });
      const total = (await Promise.all(scripts)).reduce((a, b) => a + b, 0);
      console.log(`JS /${locale}: ${(total / 1024).toFixed(1)} KB gz`);
      expect(total).toBeLessThanOrEqual(130 * 1024);
    });
  });
}

test('la búsqueda filtra el portafolio', async ({ page }) => {
  await page.goto('/es');
  const search = page.getByRole('searchbox');
  await search.fill('SAT solver');
  await expect(page.locator('[data-node="producto:nlp-to-logic"]')).toBeVisible();
  await expect(page.locator('[data-node="producto:graf"]')).toBeHidden();
  await search.fill('zzzz-inexistente');
  await expect(page.getByText('Sin resultados. Prueba con otro término.')).toBeVisible();
});

test('las subpáginas siguen funcionando con su propio canonical', async ({ page }) => {
  for (const path of ['/es/filosofia', '/es/informatica', '/es/ciencias', '/es/enterprise', '/es/lore', '/en/lore']) {
    const errors = collectErrors(page);
    const res = await page.goto(path);
    expect(res!.status(), path).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}${path}`);
    expect(await page.locator('meta[property="og:image"]').count(), path).toBeGreaterThan(0);
    expect(errors, path).toEqual([]);
  }
});

test('404 reales', async ({ page }) => {
  expect((await page.goto('/es/no-existe'))!.status()).toBe(404);
  expect((await page.goto('/en/filosofia-x'))!.status()).toBe(404);
});
```

- [ ] **Step 3: Ejecutar**

```bash
mkdir -p /workspace/.scratch-steven-redesign/shots
npm run build && npm run e2e
```

Resultado esperado: todos los tests pasan en los 3 proyectos.
- Si falla el presupuesto de JS, identifica el chunk grande (el test imprime el total) y elimina el import cliente responsable.
- Si falla por errores de consola de CSP, ajusta la directiva concreta en `next.config.mjs`.

Mira las capturas de `/workspace/.scratch-steven-redesign/shots` con Read.

- [ ] **Step 4: Script de Lighthouse**

`scripts/lighthouse.mjs`:

```js
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
```

- [ ] **Step 5: Ejecutar Lighthouse**

```bash
(npx next start -p 3210 & echo $! > /workspace/.scratch-steven-redesign/next.pid; sleep 6)
npm run lighthouse
kill $(cat /workspace/.scratch-steven-redesign/next.pid)
```

Resultado esperado (medianas), según la spec §1 y §5:
- SEO = 100, Accessibility = 100 y Best Practices = 100 en las cuatro combinaciones.
- Performance ≥ 95 en móvil y ≥ 98 en escritorio.
- LCP ≤ 1800 ms, TBT ≤ 100 ms y CLS ≤ 0.02.

Si algo no llega, abre el JSON de la peor corrida y corrige los audits que fallen (`r.audits[*].score < 1`) antes de continuar. No se da por cerrada la tarea con un objetivo sin cumplir. Si un objetivo no se puede cumplir por una causa ajena al código (por ejemplo, un servidor local lento), documéntalo en el commit con los números.

- [ ] **Step 6: Actualizar la spec con las desviaciones**

En `docs/superpowers/specs/2026-09-23-home-grafo-design.md`:
- **§4.3:** `NodeKind` pasa a `'self' | 'frente' | 'empresa' | 'producto' | 'grupo' | 'tecnologia' | 'concepto'`, con el rol dentro de `empresa`. El binario no guarda puntos de control. El artefacto se llama `graph.<hash>.{bin,json}` y `GRAPH_ASSET` expone la ruta.
- **§4.6:** `src/content/home.ts`, `proof.ts` y `timeline.ts` sustituyen a `home.{es,en}.ts`.
- **§4.7:** GA se carga solo con la primera interacción, sin temporizador.
- **§4.8:** el grafo va en `.stage` con `aria-hidden`. La leyenda visible ("Este grafo es mi trayectoria…" + "Verlo como lista") está en el hero.

- [ ] **Step 7: Verificación final del Plan 1 y commit**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run e2e
git add -A
git commit -m "test(e2e): SEO, enlaces, presupuesto de JS, subpáginas y Lighthouse; spec al día con el Plan 1

Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>"
```
