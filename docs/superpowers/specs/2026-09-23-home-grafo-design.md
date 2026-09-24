# Rediseño de la portada — "El grafo" (stevenvallejo.com/{es,en})

- Fecha: 2026-09-23
- Rama: `redesign/home-grafo`
- Estado: diseño aprobado por Steven (narrativa, sistema visual, arquitectura y plan de publicación)
- Actualizada el 2026-09-24 con lo construido en el Plan 1: sus desviaciones están en §2 (fila 3), §3.2, §4.1, §4.3, §4.6, §4.7, §4.8 y §5.
- **El Plan 1 no está cerrado.** En móvil no se cumplen ni el criterio de éxito 3 (Performance ≥ 95) ni el LCP ≤ 1.8 s de §5. Falta una decisión de Steven (§5.2); hasta entonces, la Tarea 14 sigue abierta.

## 1. Objetivo

Sustituir la portada actual (hero con Juego de la Vida + linktree/galería, `src/app/[locale]/page.tsx` → `LinktreeHome.tsx`, 100 % `'use client'`) por una experiencia narrativa de nivel Awwwards. El elemento central es **un grafo 3D persistente que es la trayectoria real de Steven**: empresas, roles, productos, tecnologías e ideas, unidos por relaciones reales. Al hacer scroll, el grafo se reorganiza entre formas con significado.

Criterios de éxito:

1. **Nivel gráfico** comparable a las referencias (GPT-6 Astra, Cerebrium, igloo.inc) sin copiar el campo de estrellas de Astra.
2. **Contenido:** demuestra la experiencia completa (trayectoria, frentes, productos, cifras verificables) en HTML indexable.
3. **Lighthouse** (laboratorio, mediana de 5 corridas):
   - SEO 100.
   - Accesibilidad 100.
   - Best Practices 100.
   - Performance ≥ 95 en móvil y ≥ 98 en escritorio.
   - **Estado al 2026-09-24:** se cumple todo menos Performance en móvil (85 en `/es` y 89 en `/en`). Está pendiente de decisión (§5.2).
4. **Cero regresiones** en `/[locale]/[frente]` y `/[locale]/lore`.

Fuera de alcance:
- Rediseñar las subpáginas (solo se les corrigen metadatos).
- Cambiar `brand.css` compartido con otros sitios.
- Borrar `public/brand/` (140 MB sin uso; se trata aparte).

## 2. Narrativa (secciones y formas del grafo)

Todo el texto es HTML real renderizado en el servidor. El grafo es decorativo-informativo y nunca contiene contenido que no esté también en el DOM.

| # | Sección | Contenido DOM | Forma del grafo (layout precalculado) |
|---|---|---|---|
| 0 | Hero | `<h1>` "Steven Vallejo Ortiz", con subtítulo "Ingeniero de software · Filósofo" (EN: "Software engineer · Philosopher"). El nombre, en display gigante, flanquea el grafo. Esquinas: indicador en monoespaciada con nº de nodos y relaciones reales del grafo, y el locale. Controles: pausa, idioma. CTA "Contratar servicios" → praxis. | **L0 · Red:** force-directed 3D completo con hubs de frente destacados. Respiración y pulsos. |
| 1 | Dos lenguajes, un método | "Pensar antes de construir", bio breve (de `about.json`), epígrafe. | **L1 · Hemisferios:** lógica/filosofía (oro) frente a ingeniería (teal). Los productos puente (Órganon, Kósmos, Estructuras Preontológicas, Paideía) se colocan en la franja central. |
| 2 | Trayectoria | Línea de tiempo `<ol>` 2014–2026 desde `experience.json` (empresa, rol, fechas, ubicación), con logros de `achievements.json`. Soy Digital/INDOTEL figura como logro vía Critertec. | **L2 · Hélice temporal:** los nodos de empresa y rol se ordenan por año de inicio sobre una hélice. Sus productos y tecnologías quedan orbitando cerca. La cámara recorre la hélice según el progreso de la sección. |
| 3 | Cuatro frentes | 4 bloques (Ingeniería, Filosofía, Ciencias, Enterprise) con tarjetas de producto (`productos` de `frentes.ts`: nombre, subtítulo, descripción, badge, enlace) y enlace a `/[locale]/[frente]`. Buscador de productos (isla cliente pequeña). Destino del enlace "Verlo como lista" de la leyenda del hero (§4.8). | **L3 · Clusters:** 4 clusters separados. La cámara visita el cluster de la sección activa (texto `sticky`). |
| 4 | Prueba | Cifras con fuente en datos del repo (ver §2.1) y stack agrupado de `tools.json` (backend, frontend, cloud/DevOps, datos, IA/ML, lógica/filosofía). Estética sobria de paper. | El grafo se atenúa a un segundo plano (opacidad y saturación bajas). Sin morph. |
| 5 | Contacto | Contratar (praxis), email, WhatsApp, CV filósofo, CV informático, blog, GitHub, LinkedIn (`https://www.linkedin.com/in/steven-vallejo/`), Instagram. Pie. | **L4 · Lemniscata:** todos los nodos convergen sobre una lemniscata de Bernoulli 3D (el ∞ del logo). |

### 2.1 Cifras de la sección Prueba

Cada cifra se toma de un campo existente y se renderiza desde ese dato, sin literales sueltos en la vista:

- **Tests del SAT solver de Órganon:** "6,333 tests" / "11 perfiles" (`src/data/frentes.ts:143-144`, `brandMetadata.ts:266`).
- **Prizma:** "8 microservicios" en producción con facturación DIAN (`frentes.ts:437`, `brandMetadata.ts:431`).
- **Años programando:** "12+" (`frentesMeta.informatica`, `frentes.ts:95-100`).
- **Kósmos:** "16 repos" (`frentes.ts:198-204`).
- **Productos en vivo:** `productos.filter(p => p.status === 'live').length`, calculado.
- **Nodos y relaciones del grafo:** calculados del artefacto de build.

Si una cifra no puede derivarse de un dato, no se muestra.

### 2.2 Interacción

- **Hover o puntero cerca de un nodo:** se resalta el vecindario (distancia 1) y salen pulsos hacia los vecinos.
- **Clic o Enter:** abre una tarjeta DOM accesible (`role="dialog"` no modal o popover) con nombre, tipo, años y enlace.
- **Teclado:** al enfocar un ítem de la lista de productos o de la línea de tiempo se envía `focusNode(id)` y la cámara lo encuadra.
- **Móvil:** la misma narrativa. El grafo va a ancho completo (no `sticky` lateral) con el nivel de calidad T1.
- **`prefers-reduced-motion: reduce`:** se muestra el póster estático con un botón "Explorar en 3D" que carga la escena sin autoplay.

## 3. Sistema visual

### 3.1 Color

Tokens de la home en `src/styles/home.css` (capa `@layer home`), en OKLCH con respaldo hex. Refuerzo P3 con `@media (color-gamut: p3)`.

- **Fondos:**
  - `--ink-0: #05090b` (fondo).
  - `--ink-1: #0b1417` (superficie; el antiguo `--bg`).
  - Halo radial `rgb(35 67 90 / .06–.25)` detrás del grafo.
- **Texto:**
  - `--text: #e8e0d4`.
  - `--text-strong: #f6f1e8` para display.
  - `--muted: #8fa3a8`.
- **Luz semántica** (emisiva en 3D y acento en DOM):
  - teal `#43b5a6` / `#6fd3c4` = ingeniería.
  - oro `#e0a85e` / `#f0c887` = lógica y filosofía.
  - óxido `#cf6a3c` = enterprise y decisiones.
  - violeta `#8d7cc0` = ciencias.
  - Núcleo de pulso casi blanco (HDR > 1): es lo único que dispara el bloom.
- **Contraste:** todo texto sobre el canvas lleva un scrim semiopaco explícito, con contraste ≥ 4.5:1 en el peor frame.

### 3.2 Tipografía (`next/font`)

- **Display:** Cormorant Garamond, pesos 500/600, cursiva para acentos. Tracking negativo; `clamp()` hasta ~18vw en el nombre.
- **UI y cuerpo:** Geist, variable, de `geist@1.7.2`. Se recorta a latín (`src/app/fonts/geist-sans-latin.woff2`, 33 KB frente a los 70 KB del archivo completo) con `pyftsubset` y se carga con `next/font/local` y `adjustFontFallback`. El comando está en `src/app/[locale]/layout.tsx`.
- **Datos, indicador y etiquetas:** JetBrains Mono.
- **Precarga:** solo Geist y Cormorant (las del h1 y el cuerpo). JetBrains Mono con `preload: false`.
- **Una sola familia Cormorant:** next/font 16 publica el nombre real de la familia, así que dos instancias con la misma cara (peso y estilo) hacen que gane la última y el navegador baje una copia sin precargar del mismo archivo. Por eso hay dos instancias sin caras en común: la recta (400–700, un único archivo variable, precargada, `--font-display`) y la cursiva (sin precarga, `--font-cormorant`, que usa el portal). Lo comprueba un e2e.

### 3.3 Materiales del grafo

- **Nodos pequeños (capa decorativa y conceptos):**
  - Impostor de esfera SDF sobre quad instanciado, con normal reconstruida desde las UV.
  - Borde fresnel.
  - Iridiscencia de película delgada aproximada con una paleta coseno según el ángulo de visión.
  - Bokeh: círculo de confusión calculado en el vertex según la profundidad.
- **Hubs (empresas, productos, frentes):**
  - `InstancedMesh` de icosaedro.
  - Refracción simulada: muestreo de un gradiente o envmap pre-difuminado en espacio de pantalla, sin `transmission`.
  - Fresnel y borde tintado del color del frente.
- **Aristas:**
  - Una cinta instanciada por arista, con Bézier cuadrática evaluada en el vertex shader.
  - Grosor constante en píxeles y antialiasing analítico.
  - Alfa base ~0.15.
  - Pulsos `glow = exp(-k (t - fract(time*speed*w + seed))^2)` en HDR.
- **Postprocesado (según nivel):**
  - Bloom con umbral (mipmap blur, media resolución).
  - Viñeta y grano sutil.
  - Niebla en el shader.
  - DOF real solo en T3.
- **Prohibido:** campo de estrellas o partículas sin aristas. Toda la capa decorativa son nodos conectados.

### 3.4 Movimiento

- **Easing:** expo-out.
- **Cámara:** con amortiguación (`1 - exp(-k·dt)`).
- **Respiración:** ruido simplex por instancia en el vertex shader.
- **Morphs:** `mix(layoutA, layoutB, smoothstep(progress))` en el vertex shader. Duración percibida 1.2–1.8 s, ligada al scroll con amortiguación.
- **Aparición de texto:** CSS con `animation-timeline: view()` dentro de `@supports`. El estado por defecto es visible. El `<h1>` nunca arranca oculto.
- **Scroll:** nativo; sin Lenis.
- **Pausa global:** `html[data-motion="paused"]` detiene el render y las animaciones CSS. Persiste en `localStorage`.

## 4. Arquitectura

### 4.1 Framework (F0)

- **Versiones:**
  - `next@16.3.6` y `react@19.3.0`, fijados exactos. Subir a 16.3.7 cuando salga (release de seguridad anunciada para el 2026-09-30).
  - Node ≥ 20.9.
- **Codemods:** API de request asíncrona (`params`, `headers`).
- **Layout raíz:**
  - `<html>`/`<body>` pasan a `src/app/[locale]/layout.tsx`.
  - `generateStaticParams` → `es`, `en`, con `dynamicParams = false`.
  - Se elimina `headers()` y el header `x-locale`.
  - Se elimina `src/app/layout.tsx`: `[locale]` pasa a ser el único layout raíz.
  - El 404 global pasa a `src/app/global-not-found.tsx`, con el flag experimental `globalNotFound`, sustituyendo a `src/app/not-found.tsx`.
  - Se eliminan `src/app/opengraph-image.tsx` y `public/og-image.png` en favor de la OG por locale. `robots.ts`, `sitemap.ts`, `icon.svg` y `favicon.ico` siguen en `src/app/`.
- **Proxy:** `src/middleware.ts` → `src/proxy.ts`. Solo redirige `/` según `Accept-Language` y fuerza el prefijo de locale. Sin `console.log`.
- **Lint:** ESLint 9 con configuración plana (`eslint.config.mjs`), `eslint-config-next@16`, script `"lint": "eslint ."`.
- **Build con webpack:** el script `build` es `next build --webpack`. Con Turbopack, el bundler por defecto de Next 16, la home cargaba 135 478 B gz de JS. Solo el framework (runtime de Next, React DOM y los componentes cliente internos del App Router) ya sumaba 134 143 B gz, por encima del presupuesto de §5 (130 KB = 133 120 B), y los flags experimentales de Turbopack no lo reducen. Con webpack la home carga 132 505 B gz (129.4 KB), con un margen de solo 615 B (§5.1). `next dev` sigue con Turbopack.
- **Bootstrap:** `bootstrap.min.css` y `react-bootstrap` solo en las rutas que usan el `Navbar` actual (layout de frente y lore). La home tiene su propio encabezado.
- **Cabeceras:** `poweredByHeader: false`. CSP aplicada (no Report-Only):

  ```
  default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com;
  font-src 'self'; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://www.googletagmanager.com;
  worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests
  ```

  Se valida con cero violaciones en consola. `blob:` solo si Turbopack emite el worker como blob.

### 4.2 SEO

- **Constante única:** `SITE = 'https://www.stevenvallejo.com'` en `src/lib/site.ts`, usada en todo `mi-cv`.
- **Metadata por página:**
  - `alternates.canonical` a sí misma.
  - `alternates.languages` con `es`, `en` y `x-default` → `/en`.
  - `openGraph.locale` y `alternateLocale`.
  - Título ≤ 60 caracteres y descripción ≤ 155.
- **Títulos:**
  - Plantilla `%s · Mouseîon`.
  - Las subpáginas pasan solo su título corto (se corrige el sufijo duplicado en frente y lore).
  - La home usa `title.absolute`.
- **JSON-LD:** un único bloque en el Server Component de la home, con `@graph`. Sin `SearchAction` ni `next/script`.
  - **WebSite** (`#website`).
  - **ProfilePage** (`/{locale}#profile`, `mainEntity` → `#person`, `dateModified` = fecha de build).
  - **Person** (`#person`):
    - `jobTitle`, `alumniOf` (Universidad de Antioquia), `worksFor` (Humanizar), `knowsAbout`.
    - `sameAs`: GitHub `https://github.com/stevenvo780`, LinkedIn `https://www.linkedin.com/in/steven-vallejo/`, Instagram.
  - **ItemList** de productos con URL.
  - Se escapa `<` en el JSON serializado.
- **Sitemap:** solo `/es`, `/en`, `/{locale}/lore` y `/{locale}/{frente}`, con `alternates.languages` y `lastModified` estable (fecha de build de los datos). Sin `/` ni dominios externos.
- **Robots:** sin el sitemap de `humanizar.tech`. Se borra `next-sitemap.config.js` y la dependencia.
- **Imagen OG:** `src/app/[locale]/opengraph-image.tsx` por locale, generada en build (`generateStaticParams`), que dibuja el póster del grafo desde el artefacto. Las subpáginas declaran su `og:image`.

### 4.3 Datos → grafo (build)

- **Modelo** (`src/graph/model.ts`):

  ```ts
  type NodeKind = 'self' | 'frente' | 'empresa' | 'producto' | 'grupo' | 'tecnologia' | 'concepto';
  type RelKind = 'agrupa' | 'pertenece-a' | 'trabajo-en' | 'construyo' | 'usa' | 'fundamenta';
  interface GNode { id: string; kind: NodeKind; label: {es: string; en: string}; frente?: FrenteId; year?: number; month?: number; yearEnd?: number | null; role?: {es: string; en: string}; url?: string; weight: number }
  interface GEdge { source: string; target: string; rel: RelKind; weight: number }
  ```

  - No hay nodo `rol`: el rol va dentro de la `empresa` (`role`, bilingüe, con `year`/`month` de inicio y `yearEnd`, `null` si sigue).
  - `grupo` es una familia de `tools.json` (backend, frontend, cloud/DevOps…). `agrupa` une self → frente, frente → grupo y grupo → tecnología.
  - No existe `evoluciona-a`: ninguna fuente lo alimentaba.

- **Fuentes** (`src/graph/sources.ts`): `productos` y `frentesMeta` (`frentes.ts`), `experience.json`, `achievements.json`, `tools.json` (es/en), más relaciones curadas en `src/graph/relations.ts` (producto→tecnología, concepto→producto, empresa→producto). Objetivo: 150–300 nodos semánticos.
- **Capa decorativa:** subgrafo procedural determinista (semilla fija) de 1.5k–8k nodos según el nivel de calidad. Nodos satélite unidos a los semánticos más cercanos. Se genera en el worker desde la semilla, no se transfiere.
- **`scripts/build-graph.mts`** (se ejecuta en `prebuild` y también bajo demanda):
  - **L0:** d3-force-3d (`numDimensions: 3`) con semilla fija.
  - **L1:** L0 plegado a dos hemisferios por dominio.
  - **L2:** hélice por año de inicio (sin año: interpolación con los vecinos).
  - **L3:** 4 clusters por frente (las tecnologías van al cluster de su mayor grado).
  - **L4:** muestreo de la lemniscata de Bernoulli 3D.
  - Normaliza todas las formas a una esfera de radio 1.
- **Salidas:**
  - `public/graph/graph.<hash>.bin` (formato GRF1, `<hash>` = 10 hex del SHA-256 de binario y metadatos): cabecera de 16 bytes (magia, N, M, nº de layouts), Float32 × 5 layouts × N × 3, índices de aristas Uint16, y Uint8 para kind, frente y peso de cada nodo y rel y peso de cada arista. El binario no guarda puntos de control.
  - `public/graph/graph.<hash>.json`: ids, kind, etiquetas es/en, frente, URLs, años (`year`, `month`, `yearEnd`) y rol.
  - Con el hash en el nombre, `/graph/*` se sirve con caché `immutable` y cada build borra los artefactos viejos.
  - `src/graph/generated/poster.ts`: SVG inline del frame 0 de L0 con la cámara inicial.
  - `src/graph/generated/stats.ts`: `GRAPH_STATS` (nº de nodos y aristas), `GRAPH_ASSET` (rutas `bin` y `meta` del artefacto con hash) y `DATA_DATE` (fecha del último commit de los datos).
- **Determinismo:** misma entrada ⇒ mismos bytes (se verifica con test).
- **Presupuestos:** datos ≤ 60 KB gz; póster ≤ 12 KB gz.

### 4.4 Render

- **`src/graph/scene/GraphScene.ts`:** clase de three.js puro (`three@0.186.x` y `postprocessing` compatible), independiente del entorno (worker o hilo principal).
  - API: `init(canvas, {width, height, dpr, tier})`, `resize`, `setPointer(x, y)`, `setScroll(section, progress)`, `setMotion(on)`, `focusNode(id)`, `setVisible(bool)`, `dispose()`.
  - Eventos emitidos: `ready`, `hover {id, x, y}`, `tier`.
- **`src/graph/worker/graph.worker.ts`:** recibe un `OffscreenCanvas` transferido y reenvía mensajes a `GraphScene`. Sin SharedArrayBuffer.
- **Isla cliente `src/components/graph/GraphStage.tsx`** (cargada con `dynamic(..., {ssr: false})` y renderizada sobre el póster SSR):
  1. Muestra el póster SVG inline (lo pinta el servidor; no es candidato a LCP).
  2. Ejecuta la sonda de GPU `src/graph/probe.ts`. Devuelve falso si:
     - `reduced-motion`;
     - `saveData`;
     - `deviceMemory < 4` o `hardwareConcurrency < 4`;
     - no hay WebGL2 con `failIfMajorPerformanceCaveat`;
     - el renderer es software (swiftshader, llvmpipe…).
     Libera el contexto de la prueba.
  3. Disparador: primera interacción (`pointermove`, `touchstart`, `scroll`, `keydown`) o `requestIdleCallback` tras `load` (timeout 1.5 s).
  4. `transferControlToOffscreen` y arranque del worker.
     - Sin OffscreenCanvas con WebGL: `GraphScene` en el hilo principal con `renderer.compileAsync()`.
     - Crossfade de 600 ms póster → canvas al recibir `ready`.
  5. Puente de eventos: puntero normalizado agrupado por rAF, `ResizeObserver`, progreso de scroll, `visibilitychange` e `IntersectionObserver`.
  6. Tooltip y tarjeta DOM del nodo en coordenadas proyectadas por el worker.
- **Niveles de calidad:**

  | Nivel | Uso | DPR | Capa decorativa | Efectos |
  |---|---|---|---|---|
  | T0 | Póster | — | — | — |
  | T1 | Móvil | 1 | 1.5k | Halo en shader, sin bloom |
  | T2 | Por defecto | 1.25–1.5 | 4k | Bloom a media resolución |
  | T3 | Escritorio con GPU dedicada | ≤ 2 | 8k | Bloom + DOF |

  - Regulador: mediana del tiempo de frame cada 90 frames. Baja de nivel si > 20 ms y sube si < 10 ms sostenido durante 5 s.
  - 30 fps tras 8 s sin input.
- **Draw calls objetivo:** ≤ 6 (nodos SDF, hubs, aristas, etiquetas opcionales, postprocesado).
- **Raycast:** fuerza bruta en el worker contra las esferas de los nodos semánticos.
- **Cámara:** spline CatmullRom por sección; el progreso de scroll la mueve con amortiguación.

### 4.5 Scroll

- **Secciones:** fijadas con CSS `position: sticky` en contenedores de altura definida en CSS.
- **Progreso:** `src/components/home/useSectionProgress.ts`, con `IntersectionObserver` + `scroll` pasivo agrupado por rAF. Emite `{section, progress}` y lo envía al worker.
- **Sin GSAP:** salvo que una coreografía concreta lo requiera, y en ese caso solo cargado de forma diferida y sin `pin`.

### 4.6 Estructura de archivos

```
src/app/[locale]/layout.tsx            html/body, fonts, metadata base, static params
src/app/[locale]/(home)/page.tsx       RSC: compone las secciones, JSON-LD (grupo (home), con home.css)
src/app/[locale]/(portal)/...          frentes y lore (grupo (portal), con bootstrap y brand.css)
src/app/[locale]/opengraph-image.tsx   OG por locale
src/components/home/*.tsx              HomeHeader, Stage, Hero, Method, Path, Fronts, Proof, Contact, HomeFooter, SectionHead, ProductSearch (cliente); MotionToggle (cliente) y useSectionProgress llegan con el Plan 2
src/components/graph/GraphStage.tsx    isla cliente
src/graph/{model,sources,relations,probe}.ts
src/graph/scene/{GraphScene.ts,shaders/*.ts,layers/*.ts,quality.ts,camera.ts}
src/graph/worker/graph.worker.ts
src/graph/generated/{poster,stats}.ts  (generados, versionados)
src/lib/site.ts                        SITE, locales, helpers de alternates
src/content/home.ts                    textos es/en de la home (una sola fuente i18n para la home)
src/content/proof.ts                   cifras de Prueba derivadas de los datos (§2.1)
src/content/timeline.ts                línea de tiempo canónica de Trayectoria
src/styles/home.css
scripts/build-graph.mts
tests/graph/*.test.ts                  vitest
e2e/home.spec.ts                       Playwright
```

### 4.7 Analítica

- **Carga de GA** (`G-E5NMYWLXER`): la hace un cargador propio, `src/components/Analytics.tsx`, en cliente. Inyecta `gtag.js` y la configuración con la primera interacción (`pointerdown`, `keydown`, `scroll`, `touchstart`) o, en su defecto, 5 s después de `load` con `requestIdleCallback` (sin él, directamente). La lógica está en `scheduleAnalyticsLoad`, con tests. Se conserva el ID y la continuidad de datos, y se sustituye el `<Script afterInteractive>` inline actual.

### 4.8 Accesibilidad

- **Grafo:** va en `.stage`, una capa fija con `aria-hidden="true"` y sin `<figure>`. Hoy contiene el póster; el Plan 2 monta ahí el canvas. La leyenda visible está en el hero (`.hero-caption`): "Este grafo es mi trayectoria: N nodos, M relaciones reales" y el enlace "Verlo como lista" → `#frentes`.
- **Botón de pausa:** visible, con `aria-pressed` (WCAG 2.2.2).
- **Reduced motion:** póster; la escena solo arranca a demanda y sin autoplay.
- **Objetivos táctiles:** ≥ 24 px y foco visible.
- **Estructura:** orden de headings h1 → h2 por sección → h3 en tarjetas.
- **Idioma:** `lang` correcto en el servidor (`es` / `en`).

## 5. Presupuestos (verificados en CI local)

| Métrica | Límite |
|---|---|
| JS en el hilo principal de la home | ≤ 130 KB gz = 133 120 B (antes ~200 KB). En la Tarea 14, 132 505 B con webpack (§4.1): margen de 615 B (§5.1) |
| Worker | ≤ 175 KB gz |
| Datos del grafo | ≤ 60 KB gz |
| LCP | ≤ 1.8 s (en móvil no se cumple: §5.2) |
| TBT | ≤ 100 ms |
| CLS | ≤ 0.02 |
| Errores de consola | 0 |
| Violaciones de CSP | 0 |

- La home no usa `next/link`, y tampoco el 404 de `[locale]`, que viaja en el árbol RSC de cada página: su módulo cliente cuesta ~3.5 KB gz.

### 5.1 Margen del presupuesto de JS

- **Medido en la Tarea 14** (gzip nivel 6 de cada script, igual que el e2e): 132 505 B de 133 120 B. Quedan **615 B, el 0.46 %**.
- **El framework ocupa el 98.3 %:** el runtime de Next, React DOM, el runtime de webpack y `main-app` suman 130 862 B. El código propio de la home son 1 643 B: el chunk del layout de `[locale]` (cargador de GA y objetos de `next/font`) y el de la página (`ProductSearch`). No queda código propio cuyo recorte dé un margen real.
- **No hay otro bundler de reserva:** con Turbopack, solo el framework ya pesa 134 143 B (§4.1).
- **Reglas mientras el margen siga así:**
  - Cualquier cambio que añada código cliente a la home, o que suba `next`, `react` o `react-dom`, puede pasarse del límite aunque no haya una regresión propia. Antes de fusionarlo, se vuelve a medir con `npm run build && npm run e2e`. El test imprime el total y el margen.
  - Si el test falla, se recorta o se aplaza el código cliente nuevo. El límite no se sube en el test: cambiarlo lo decide Steven, y se cambia en esta tabla.
  - El Plan 2 monta en la home `GraphStageLazy` (`next/dynamic` con `ssr: false`). Su chunk y el de `GraphStage` se descargan en el hilo principal tras la hidratación, aunque el 3D no llegue a arrancar. Por eso cuentan en este presupuesto, y con 615 B es muy probable que no quepan. No se ha medido: el Plan 2 aún no está implementado. El Plan 2 tiene que resolverlo, o traer la decisión a esta tabla, antes de montar la isla.

### 5.2 Lighthouse en móvil: sin cumplir y pendiente de decisión

**Medido en la Tarea 14** (2026-09-24, `npm run lighthouse`, mediana de 5 corridas, en un host con carga media de 65 a 97 sobre 32 núcleos):
- SEO, Accesibilidad y Best Practices = 100 en las cuatro combinaciones.
- Escritorio cumple todo: Performance 100, LCP de 0.63 s (`/es`) y 0.75 s (`/en`), TBT 0 y CLS 0.
- Móvil **no** cumple ni Performance ≥ 95 (§1, criterio 3) ni LCP ≤ 1.8 s: `/es` da 85 y 3.58 s, y `/en` da 89 y 3.48 s. CLS 0. El TBT (199 ms en `/es`, 104 ms en `/en`) sube y baja con la carga del host: en otras tandas quedó entre 54 y 95 ms.

**La causa no es el host:** es el peso de la página. Lo muestran las pruebas de la ronda de fix 1 de la Tarea 14 (`/es`, 3 corridas por caso):
- El LCP de laboratorio lo simula Lantern (RTT de 150 ms, 1.6 Mbps y CPU ×4) a partir de la carga real, y cuenta toda petición que termine antes del LCP observado. El LCP observado es el `span.hero-last` del h1. En local todas las peticiones terminan antes que él: en la tanda final, el último byte llega a los 231 ms y el LCP a los 258 ms.
  - Entran el HTML (45 KB), el CSS (8 KB), el JS (139 KB transferidos) y las cinco fuentes (189 KB).
- Sin ralentización de CPU (`--throttling.cpuSlowdownMultiplier=1`), la home actual da un LCP de 2.88 a 3.36 s y una Performance de 90 a 94. Ni sin CPU lenta llega al objetivo.
- Sin ninguna fuente web, la Performance sube a 98–99 y el LCP queda en 2.22–2.31 s.
- Sin fuentes y sin ralentización de CPU, el LCP da 1.82–2.17 s (mediana de 2.14 s). Ninguna corrida bajó de 1.8 s.
- **Conclusión:**
  - Las fuentes del diseño bajan la Performance de ~98 a 85–89.
  - El LCP ≤ 1.8 s no se alcanza ni sin fuentes: el JS del App Router (§5.1) y el HTML con el payload RSC bastan para pasarlo.

**Decisión pendiente de Steven.** Sin ella, la Tarea 14 y el Plan 1 siguen abiertos. Opciones:
- **(a)** Medir el LCP móvil en campo con Vercel Speed Insights y dejar el laboratorio móvil como referencia. Cambia el criterio 3 y el LCP de esta tabla; no toca código.
- **(b)** Auto-alojar y recortar todas las fuentes, o quitar alguna del diseño. Es la vía hacia Performance ≥ 95: sin ninguna fuente se midió 98–99, y cuánto se acerque dependerá de los KB que queden. No lleva el LCP a ≤ 1.8 s.
- **(c)** Activar `experimental.inlineCss`. Se probó en dos variantes (2 y 3 corridas) y dio 89–94 y un LCP de 2.9 a 3.6 s, así que por sí sola no cumple. Además es global: el HTML de `/es/lore` pasa de 8.7 a 84.9 KB gz.
- **(d)** Cambiar a una arquitectura de hidratación que saque el JS del framework de la carga inicial. Es la única que ataca el LCP ≤ 1.8 s, pero cambia §4.1 y §4.4. Sin medir.

## 6. Pruebas

1. **Unitarias (vitest, escritas antes que el código):**
   - Construcción del modelo: nodos y aristas válidos, sin ids colgantes, cada producto con frente.
   - Determinismo del artefacto: misma entrada ⇒ mismos bytes.
   - Invariantes de cada layout: normalización, L2 ordenado por año, L3 con 4 clusters, L4 sobre la lemniscata.
   - Codificación y decodificación del binario.
   - Sonda de GPU (con mocks).
   - Regulador de calidad.
2. **E2E (Playwright, Chrome):**
   - `/es` y `/en`:
     - un solo h1;
     - `lang` correcto;
     - canonical y hreflang con www;
     - JSON-LD parseable con los tipos esperados;
     - cero errores de consola;
     - póster presente;
     - botón de pausa operable;
     - navegación por teclado a nodos;
     - enlaces internos 200.
   - `/es/{frente}` y `/es/lore` siguen renderizando.
   - Capturas a 390, 834 y 1440 px.
3. **Lighthouse:**
   - Móvil y escritorio, `/es` y `/en`, mediana de 5 corridas.
   - Ruta del póster (sin GPU) y ruta 3D (Chrome con GPU por SwiftShader forzada) documentadas por separado.
   - Caché de npm y `TMPDIR` en `/workspace`: el disco raíz del host está lleno.
4. **Revisión adversarial multiagente** (código, rendimiento, a11y, SEO) antes de la preview.

## 7. Publicación

- Commits por fase en `redesign/home-grafo`.
- **Push a GitHub** para la preview de Vercel: solo con confirmación explícita de Steven.
- **Merge a `main`** (producción): solo con su OK explícito tras revisar la preview.

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| OffscreenCanvas y WebGL en Safari < 17 | Fallback al hilo principal con `compileAsync`. |
| Turbopack y workers con `new URL(..., import.meta.url)` | Validarlo en F0 con un worker trivial. Alternativa: webpack (`next build --webpack`). |
| Compatibilidad `postprocessing` ↔ three | Versiones fijadas exactas. |
| Presupuesto de JS de la home sin margen (615 B, §5.1) | El e2e lo mide en cada build y se vuelve a medir antes de fusionar. El Plan 2 resuelve el chunk de `GraphStage` antes de montarlo en la home. |
| El 3D no aparece en Lighthouse | Es intencional: el laboratorio mide la ruta del póster. El 3D se valida con RUM (Vercel Speed Insights) y con pruebas manuales en GPU real. |
| Disco raíz del host lleno | Todo lo pesado va a `/workspace`. |
