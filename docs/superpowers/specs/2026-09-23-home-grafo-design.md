# Rediseño de la portada — "El grafo" (stevenvallejo.com/{es,en})

- Fecha: 2026-09-23
- Rama: `redesign/home-grafo`
- Estado: diseño aprobado por Steven (narrativa, sistema visual, arquitectura y plan de publicación)
- Actualizada el 2026-09-24 con lo construido en el Plan 1: sus desviaciones están en §2 (fila 3), §3.2, §4.1, §4.2, §4.3, §4.4, §4.6, §4.7, §4.8 y §5.
- Lighthouse en móvil cumple desde la ronda de fix 2 de la Tarea 14: Performance 99 en `/es` y `/en` y LCP de laboratorio de 1.7 a 1.9 s, con el objetivo de LCP en ≤ 2.5 s (§5.2).

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
   - **Estado al 2026-09-24 (Tarea 14, ronda 2):** se cumple todo. Performance 99 en móvil (`/es` y `/en`) y 100 en escritorio; SEO, Accesibilidad y Best Practices, 100 (§5.2).
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

- **Display:** Cormorant Garamond, pesos 400/500, cursiva 400 para acentos (epígrafe). Tracking negativo; `clamp()` hasta ~18vw en el nombre.
- **UI y cuerpo:** Geist (de `geist@1.7.2`), pesos 400 a 600.
- **Datos, indicador y etiquetas:** JetBrains Mono, pesos 400/500.
- **Subconjuntos propios de la home** (`src/app/[locale]/(home)/fonts.ts`, con `next/font/local`): las mismas familias OFL, auto-alojadas, con solo los pesos y los caracteres que pinta la home. Son 58 KB en cinco archivos frente a los 184 KB que bajaba con las de Google:
  - `cormorant-hero.woff2`: el nombre del h1, que es el elemento LCP. Solo sus 16 caracteres, en Cormorant 500 estático: 2.1 KB. **Es la única fuente precargada.**
  - `cormorant-home.woff2` (400–500 variable, más `lnum`/`tnum` para las cifras) y `cormorant-home-italic.woff2` (400).
  - `geist-home.woff2` (400–600 variable) y `jetbrains-home.woff2` (400–500 variable).
  - Ninguno se precarga salvo el del h1. Todos van con `font-display: swap`. Se descartó `optional`: con fuentes sin precarga, en una primera visita con red normal la home se quedaría con las de respaldo.
  - Las pilas de `home.css` no nombran las familias de Google del layout raíz: si lo hicieran, el navegador las descargaría como respaldo mientras cargan estas.
  - `scripts/subset-fonts.sh` regenera los cinco archivos con `pyftsubset`, desde orígenes fijados (commit de google/fonts y `geist@1.7.2`) y con salida reproducible byte a byte. Si el contenido trae un carácter nuevo, se añade ahí.
  - **Paridad de glifos con la versión anterior** (comprobada con CDP): `ḗ` no existe en Cormorant ni en Geist, y `↗` no existe en Geist, así que las pinta una fuente del sistema, igual que antes. `→` tampoco está en el subconjunto mono, porque el subconjunto *latin* de Google no la traía.
  - Tests: el vitest `tests/content/fonts.test.ts` comprueba que el subconjunto del h1 cubre el nombre y pesa ≤ 6 KB. El e2e comprueba que la home descarga exactamente estos cinco archivos, que solo precarga el del h1 y que cada carácter que pinta tiene glifo en el subconjunto de su familia.
- **Layout raíz (portal y 404 de `[locale]`):** conserva Geist recortado a latín (`src/app/fonts/geist-sans-latin.woff2`; el comando está en `src/app/[locale]/layout.tsx`), Cormorant, JetBrains Mono e Inter de `next/font/google`, **todas sin precarga**. Una precarga en el layout raíz se descargaría también en la home. El portal pierde la precarga de Cormorant y deja de bajar el Geist que se le precargaba sin usarlo.
- **Una sola familia Cormorant en el layout raíz:** next/font 16 publica el nombre real de la familia, así que dos instancias con la misma cara (peso y estilo) hacen que gane la última y el navegador baje una copia del mismo archivo con otra URL. Por eso hay dos instancias sin caras en común: la recta (400–700, un único archivo variable, `--font-display`) y la cursiva (`--font-cormorant`, que usa el portal).

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
  - **ItemList** de productos con URL: cada elemento lleva nombre y URL. La descripción ya está en la tarjeta del producto, y el bloque viaja dos veces en el HTML (marcado y payload RSC).
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
  - Con el hash en el nombre, `/graph/*` se sirve con caché `immutable` y cada build borra los artefactos viejos (también los pósters).
  - `public/graph/poster.<hash>.svg` (`<hash>` = 10 hex del SHA-256 del SVG): el póster, que es el frame 0 de L0 con la cámara inicial. La home lo carga como archivo (§4.4).
  - `src/graph/generated/poster.ts`: el mismo SVG como cadena (`POSTER_SVG`), solo para la imagen OG que se genera en build.
  - `src/graph/generated/stats.ts`: `GRAPH_STATS` (nº de nodos y aristas), `GRAPH_ASSET` (rutas `bin` y `meta` del artefacto con hash), `POSTER_ASSET` (ruta del póster) y `DATA_DATE` (fecha del último commit de los datos).
- **Determinismo:** misma entrada ⇒ mismos bytes (se verifica con test).
- **Presupuestos:** datos ≤ 60 KB gz; póster ≤ 12 KB gz.

### 4.4 Render

- **`src/graph/scene/GraphScene.ts`:** clase de three.js puro (`three@0.186.x` y `postprocessing` compatible), independiente del entorno (worker o hilo principal).
  - API: `init(canvas, {width, height, dpr, tier})`, `resize`, `setPointer(x, y)`, `setScroll(section, progress)`, `setMotion(on)`, `focusNode(id)`, `setVisible(bool)`, `dispose()`.
  - Eventos emitidos: `ready`, `hover {id, x, y}`, `tier`.
- **`src/graph/worker/graph.worker.ts`:** recibe un `OffscreenCanvas` transferido y reenvía mensajes a `GraphScene`. Sin SharedArrayBuffer.
- **Isla cliente `src/components/graph/GraphStage.tsx`** (cargada con `dynamic(..., {ssr: false})` y renderizada sobre el póster SSR):
  1. Muestra el póster: `<img src={POSTER_ASSET} fetchpriority="low" decoding="async">` con `object-fit: cover`, que equivale al `xMidYMid slice` del SVG. Lo pinta el servidor. No va inline porque inline entraba dos veces en el HTML (marcado y payload RSC, ~10 KB gz). Chrome no lo toma como candidato a LCP porque cubre todo el viewport: el LCP sigue siendo el nombre del h1, y lo comprueba un e2e. Frente a `<svg><use href="…#p">` midió igual (§5.2), y `<img>` no depende de que el navegador resuelva degradados de un documento externo.
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
src/app/[locale]/(home)/layout.tsx     home.css y variables de las fuentes de la home
src/app/[locale]/(home)/fonts.ts       subconjuntos de fuente de la home (next/font/local; §3.2)
src/app/[locale]/(home)/page.tsx       RSC: compone las secciones, JSON-LD (grupo (home))
src/app/fonts/*.woff2                  Geist recortado del layout raíz y subconjuntos de la home
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
scripts/subset-fonts.sh                regenera los subconjuntos de fuente de la home
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
| JS en el hilo principal de la home | ≤ 130 KB gz = 133 120 B (antes ~200 KB). Tras la ronda 2 de la Tarea 14, 132 501 B con webpack (§4.1): margen de 619 B (§5.1) |
| Worker | ≤ 175 KB gz |
| Datos del grafo | ≤ 60 KB gz |
| LCP | ≤ 2.5 s en laboratorio móvil (Lighthouse, mediana de 5). Antes decía 1.8 s, que era una estimación de la investigación y no un requisito de Steven. Medido: 1.7–1.9 s en móvil y 0.5–0.6 s en escritorio (§5.2) |
| TBT | ≤ 100 ms |
| CLS | ≤ 0.02 |
| Errores de consola | 0 |
| Violaciones de CSP | 0 |

- La home no usa `next/link`, y tampoco el 404 de `[locale]`, que viaja en el árbol RSC de cada página: su módulo cliente cuesta ~3.5 KB gz.
- Peso de la home en `/es` tras la ronda 2 de la Tarea 14: HTML de 31.8 KB gz (antes 43.9), fuentes de 58 KB (antes 184) y 251 KB transferidos en total. Todo lo que se descarga antes del LCP observado cuenta en el LCP simulado (§5.2).

### 5.1 Margen del presupuesto de JS

- **Medido en la Tarea 14, ronda 2** (gzip nivel 6 de cada script, igual que el e2e): 132 501 B de 133 120 B. Quedan **619 B, el 0.47 %**. En la ronda 1 eran 132 505 B.
- **El framework ocupa el 98.8 %:** el runtime de Next, React DOM, el runtime de webpack y `main-app` suman 130 865 B. El código propio de la home son 1 636 B: el chunk del layout de `[locale]` (cargador de GA y objetos de `next/font` del layout raíz, 941 B) y el de la página (`ProductSearch`, 695 B). No queda código propio cuyo recorte dé un margen real.
- **Ruido de 2 a 3 B por build:** el runtime de webpack lista los ids de los chunks que solo llevan CSS, y esos ids cambian al añadir o quitar módulos. Las fuentes de la home añadieron uno y el runtime creció 3 B. `ProductSearch` sin `useId` ni input controlado compensó 6 B.
- **No hay otro bundler de reserva:** con Turbopack, solo el framework ya pesa 134 143 B (§4.1).
- **Reglas mientras el margen siga así:**
  - Cualquier cambio que añada código cliente a la home, o que suba `next`, `react` o `react-dom`, puede pasarse del límite aunque no haya una regresión propia. Antes de fusionarlo, se vuelve a medir con `npm run build && npm run e2e`. El test imprime el total y el margen.
  - Si el test falla, se recorta o se aplaza el código cliente nuevo. El límite no se sube en el test: cambiarlo lo decide Steven, y se cambia en esta tabla.
  - El Plan 2 monta en la home `GraphStageLazy` (`next/dynamic` con `ssr: false`). Su chunk y el de `GraphStage` se descargan en el hilo principal tras la hidratación, aunque el 3D no llegue a arrancar. Por eso cuentan en este presupuesto, y con 615 B es muy probable que no quepan. No se ha medido: el Plan 2 aún no está implementado. El Plan 2 tiene que resolverlo, o traer la decisión a esta tabla, antes de montar la isla.

### 5.2 Lighthouse en móvil: resuelto en la Tarea 14 (ronda 2)

**Resultado final** (2026-09-24, `npm run lighthouse`, mediana de 5 corridas, host con carga media de 58 a 71 sobre 32 núcleos):

| | Performance | LCP | TBT | CLS | A11y / BP / SEO |
|---|---|---|---|---|---|
| `/es` móvil | 99 | 1.81 s | 73 ms | 0.0002 | 100 / 100 / 100 |
| `/en` móvil | 99 | 1.74 s | 67 ms | 0.0001 | 100 / 100 / 100 |
| `/es` escritorio | 100 | 0.56 s | 0 ms | 0.0001 | 100 / 100 / 100 |
| `/en` escritorio | 100 | 0.56 s | 0 ms | 0.0000 | 100 / 100 / 100 |

- Una segunda tanda completa dio lo mismo: 99 / 1.74 s / 56 ms en `/es` y 99 / 1.91 s / 42 ms en `/en`, con escritorio en 100.
- En las 20 corridas de móvil de las dos tandas, la peor Performance fue 97 y el peor LCP, 2.51 s.
- Antes de la ronda 2 era 85 / 3.58 s en `/es` y 89 / 3.48 s en `/en`. En un A/B intercalado con la misma carga del host, la versión anterior dio 89–93 y 3.46 s.

**Cómo calcula Lighthouse el LCP de móvil.** Lantern simula la carga (RTT de 150 ms, 1.6 Mbps, CPU ×4) a partir de la real y cuenta toda petición que termine antes del LCP observado. En local, el LCP observado llega a los 100–260 ms y para entonces ya se ha descargado casi todo, así que el LCP simulado depende del peso total de la página. El elemento LCP es `span.hero-last` (el apellido en el h1).

**Qué se hizo** (A/B intercalados en móvil, solo la categoría Performance):
1. **Fuentes** (§3.2): 58 KB en cinco subconjuntos propios frente a 184 KB de Google, con el nombre del h1 como única precarga (2.1 KB). Performance pasó de 90 a 95 y el LCP de 3.44 a 2.61 s (3 + 3 corridas).
2. **Póster en archivo aparte** (§4.3 y §4.4): el HTML bajó de 43.9 a 33.2 KB gz. Así sale de la tercera ronda de TCP del modelo de Lantern, y el FCP simulado baja de 1.67 a 1.07 s. Con el póster inline se midió 97 / 2.57 s; con `<svg><use>`, 100 / 1.71 s; con `<img>`, 99 / 1.74 s (4 + 4 + 4). En una segunda tanda de 5 + 5 empataron: 99 / 1.85 s frente a 99 / 1.81 s en `/es`, y 99 / 1.92 s frente a 99 / 1.97 s en `/en`. Se eligió `<img>`, con mejor mediana conjunta de LCP en `/es` (1.74 s frente a 1.81 s) y sin la dependencia de los degradados externos.
3. **JSON-LD** (§4.2): el ItemList ya no repite las descripciones (−2.6 KB gz de HTML). El HTML de `/es` queda en 31.8 KB gz.

**Qué se midió y no se aplicó:**
- **CSS incrustado** (`home.css` en un `<style>` del layout (home)): el `<style>` también va dos veces (marcado y payload RSC), y el HTML sube a 39.9 KB gz. Además siguen dos hojas en la ruta crítica: la del layout raíz y la del `@font-face` de la home. Midió igual: 100 / 1.81 s frente a 100 / 1.81 s (4 + 4).
- **`data-search` de las tarjetas** (3.7 KB gz entre sus dos copias): quitarlo obliga al cliente a reconstruir el texto de búsqueda, y el JS no puede subir (§5.1).
- **GA:** en 62 corridas no hubo ninguna petición a gtag. La traza de Lighthouse termina hacia los 2.6 s y el respaldo de §4.7 salta 5 s después de `load`. Se mantiene.

**Límites que quedan:**
- **FCP bimodal:** las cuatro fuentes sin precarga tienen prioridad VeryHigh. Si terminan unos milisegundos antes del primer pintado observado, Lantern las mete en el grafo del FCP y da 1.67 s. Si terminan justo después, da 1.06 s. Es una carrera en local que el código no controla sin precargarlas, y mueve la Performance en torno a un punto (97–100).
- **CLS de 0.0001–0.0002:** al llegar Geist sin precarga, el botón "Mi historia" se mueve unos píxeles, porque el ancho de "Contratar servicios" cambia respecto al de su respaldo ajustado. Lighthouse lo muestra como 0.
- **TBT:** de 42 a 73 ms en las medianas de las dos tandas, y hasta 99 ms en alguna corrida. Depende de la carga del host: en la ronda 1 llegó a 199 ms.
- **Margen de JS para el Plan 2:** 619 B. La isla del grafo sigue sin caber (§5.1).

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
     - póster cargado desde su archivo con hash, y el LCP en el h1;
     - fuentes: solo los subconjuntos de la home, una precarga (la del h1) y cada carácter con glifo en su familia;
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
| Contenido nuevo con un carácter que no está en los subconjuntos de fuente de la home | El e2e de glifos falla y nombra el archivo y el carácter. Se añade en `scripts/subset-fonts.sh` y se regenera (hace falta Python con fonttools y brotli). |
| Google Fonts responde a veces con URLs sin extensión (`/l/font?kit=…`) para Cormorant pedida con pesos sueltos, y `next/font` 16.3.6 aborta el build (`Cannot read properties of null (reading '1')`) | Se vio 2 veces en unos 15 builds, y 2 de 48 peticiones a mano. Reintentar el build. Arreglo posible, no aplicado porque cambia las caras que declara el portal: pedir la Cormorant del layout raíz con `weight: 'variable'`. |
