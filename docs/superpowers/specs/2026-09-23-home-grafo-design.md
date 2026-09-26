# Rediseño de la portada — "El grafo" (stevenvallejo.com/{es,en})

- Fecha: 2026-09-23
- Rama: `redesign/home-grafo`
- Estado: diseño aprobado por Steven (narrativa, sistema visual, arquitectura y plan de publicación)
- Actualizada el 2026-09-24 con lo construido en el Plan 1 y con el fix de su revisión final: las desviaciones están en §2 (filas 0 y 3), §3.1, §3.2, §4.1, §4.2, §4.3, §4.4, §4.6, §4.7, §4.8, §5, §6 y §8.
- Tarea 3 del Plan 2 (shaders y `GraphScene`, ronda de fix 1): lo que concreta o cambia está en §3.3 (aristas y niebla), §3.4 (respiración), §4.4 (regulador) y §4.6 (archivos).
- Tarea 7 del Plan 2 (endurecimiento de `GraphScene`): §3.3 (rango de la niebla y luminancia de las aristas en reposo) y §4.4 (espera del regulador: tope y olvido de las bajadas).
- Tarea 5 del Plan 2 (e2e del 3D, ronda de fix 1): §3.4 (encuadre en retrato), §3.3 (blanco en Contacto en T1), §5 (cifras) y §6 (qué cubre el proyecto `3d`).
- Lighthouse en móvil cumple desde la ronda de fix 2 de la Tarea 14: Performance 99 en `/es` y `/en` y LCP de laboratorio de 1.7 a 1.9 s, con el objetivo de LCP en ≤ 2.5 s (§5.2).
- Tarea 6 del Plan 2 (Lighthouse final con el 3D integrado, pulido visual y spec al día): §1 (estado), §2.2 (clic sobre un nodo), §3.1 (fondo del canvas y contraste del h1 con el 3D), §3.3 (etiquetas, bokeh sin DOF, `postprocessing` diferido, correcciones de GLSL y bloom en reposo), §4.1 (`worker-src`), §4.3 (capa decorativa), §4.4 (API, sonda, puente, parámetros de prueba, niveles, draw calls, raycast y cámara), §4.6, §4.8 (portal), §5, §5.1, §5.3 (Lighthouse final y ruta 3D, nueva), §6 y §8. Todo lo que el Plan 2 cambió respecto al diseño está anotado en su sección con «Plan 2».

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
   - **Estado al cerrar el Plan 2 (Tarea 6, con el 3D integrado):** se cumple todo. Performance 98 en móvil (`/es` y `/en`, LCP de 2.18 s) y 100 en escritorio; SEO, Accesibilidad y Best Practices, 100 en las 20 corridas (§5.3).
4. **Cero regresiones** en `/[locale]/[frente]` y `/[locale]/lore`.

Fuera de alcance:
- Rediseñar las subpáginas (solo se les corrigen metadatos).
- Cambiar `brand.css` compartido con otros sitios.
- Borrar `public/brand/` (140 MB sin uso; se trata aparte).

## 2. Narrativa (secciones y formas del grafo)

Todo el texto es HTML real renderizado en el servidor. El grafo es decorativo-informativo y nunca contiene contenido que no esté también en el DOM.

| # | Sección | Contenido DOM | Forma del grafo (layout precalculado) |
|---|---|---|---|
| 0 | Hero | `<h1>` "Steven Vallejo Ortiz", con subtítulo "Ingeniero de software · Filósofo" (EN: "Software engineer · Philosopher"). El nombre, en display gigante, flanquea el grafo. Esquinas: indicador en monoespaciada con nº de nodos y relaciones reales del grafo, y el locale. Controles: pausa, idioma. CTA "Contratar servicios" → praxis. **Desviación del Plan 1:** no hay indicador en las esquinas. La cifra real de nodos y relaciones va en la leyenda del hero (`.hero-caption`, §4.8), sin el locale, y ningún plan añade el indicador: si se quiere, es trabajo nuevo. La pausa llega con el Plan 2 (Tarea 4); el idioma está en la barra superior. | **L0 · Red:** force-directed 3D completo con hubs de frente destacados. Respiración y pulsos. |
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
  - **Desviación del Plan 2 (Tarea 4):** no hay tarjeta ni Enter sobre el canvas. El nodo resaltado muestra una ficha DOM (`role="tooltip"`: tipo, nombre, rol, años y «Clic para abrir» si hay destino), y el clic la activa: un producto abre su URL en otra pestaña, un frente navega a `/[locale]/[frente]` y el resto lleva al ítem del DOM que lo representa (`[data-node]`, o su sección). El canvas no es enfocable (`.stage` es `aria-hidden`, §4.8): el camino de teclado es el de la línea siguiente, que recorre el mismo contenido en HTML.
- **Teclado:** al enfocar un ítem de la lista de productos o de la línea de tiempo se envía `focusNode(id)` y la cámara lo encuadra.
- **Móvil:** la misma narrativa. El grafo va a ancho completo (no `sticky` lateral) con el nivel de calidad T1.
- **`prefers-reduced-motion: reduce`:** se muestra el póster estático con un botón "Explorar en 3D" que carga la escena sin autoplay.

## 3. Sistema visual

### 3.1 Color

Tokens de la home en `src/styles/home.css` (capa `@layer home`), en OKLCH con respaldo hex. Refuerzo P3 con `@media (color-gamut: p3)`.

- **Fondos:**
  - `--ink-0: #05090b` (fondo).
  - `--ink-1: #0b1417` (superficie; el antiguo `--bg`).
  - Halo radial `rgb(35 67 90 / .06–.25)` detrás del grafo. En `home.css` es `.home .stage::before`: `inset: -10%` y `radial-gradient(60% 55% at 50% 48%, rgb(35 67 90 / 0.28), rgb(35 67 90 / 0.08) 45%, transparent 70%)`.
  - **Fondo del canvas (Tarea 6 del Plan 2):** es la página detrás del póster, `--ink-0` con ese halo, compuesto en sRGB como lo hace el navegador (`scene/background.ts`, con los parámetros del CSS). Así el fundido póster → canvas (600 ms) solo cambia el grafo.
    - Antes era un halo gaussiano propio que pasaba por el ACES: hundía `--ink-0` a negro y saturaba el halo, más claro y más azul que el de la página. Al fundirse, el escenario se azulaba: en móvil, todo él, esquinas incluidas. Diferencia máxima medida entre el canvas y la página en el hero: 39 niveles en T3 y 49 en T1.
    - Ahora el fondo no lleva el tone mapping de three (`toneMapped: false`). Con compositor (T2 y T3), el EffectPass aplica viñeta y ACES a toda la imagen, así que el fondo sale con las inversas exactas de los dos (`inverseAces(col) / vignette(vUv)`, `uPost = 1`) y llega a la pantalla con el color de la página. La viñeta sigue oscureciendo el grafo hacia los bordes, pero no el fondo.
    - Medido en el e2e (`graph3d.spec.ts`, en todo el escenario, en pausa y sin las capas del grafo): 3 niveles como mucho en T3 (el grano del EffectPass) y 2 en T1. Con la animación, la atenuación de cada sección (`dim`) sigue bajando el halo, como antes: (0.3 + 0.4 · dim) / 0.7, que es 1 en el hero.
    - `background.test.ts` ata el shader a sus fuentes: el halo a `home.css`, el ACES al chunk de three 0.186 y la viñeta al shader de `postprocessing`. Si alguno cambia, el test falla.
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
  - Medido en el fix de la revisión final del Plan 1, sobre el póster y con movimiento reducido (el póster no se atenúa): su punto más claro es un núcleo de nodo casi blanco, rgb(239 236 227). Sin scrim, `--muted` daba 2.2:1 y `--teal-2`, 1.5:1.
  - El texto pequeño que no va en un panel (kicker del hero, etiquetas de Método, fechas de Trayectoria, etiqueta y aviso del buscador, redes) lleva su propio scrim, y Herramientas va en una cabecera con scrim como `.sec-head`. Colocando cada elemento sobre las 24 zonas más claras del póster, a 1440 y a 390 px, el peor caso es 5.57:1 (`--muted`). Lo vigila un e2e: ningún texto de menos de 24 px queda sin fondo.
  - El scrim ligero de escritorio (0.74) solo se usa si el navegador aplica `backdrop-filter`; sin desenfoque se queda en 0.86.
  - El nombre del h1 es texto grande sin scrim: va en los flancos oscuros del grafo (16.5:1 en su posición inicial) con una sombra oscura. El Plan 2 debe repetir la medida con el canvas y el bloom encendidos.
    - **Medido en la Tarea 6 del Plan 2** (Chrome con SwiftShader, `?gl=force`, la animación en marcha: 12 capturas en 3 s por posición). Se toma el píxel más claro del escenario bajo los glifos del h1 (máscara del propio texto, sin la sombra), en la posición inicial y tras bajar 150 y 300 px en escritorio (1440 × 900, T3 con bloom) o 100 y 200 px en móvil (390 × 844, T1). Resultado con el canvas: de 16.4:1 a 17.3:1 en escritorio y de 16.6:1 a 17.7:1 en móvil. Con el póster: de 16.4:1 a 17.8:1. Ningún píxel de glifo baja de 3:1.
    - Midiendo la caja de cada línea en vez de los glifos, satélites y pulsos entran en ella (3.0:1 en escritorio y 1.1:1 en móvil, en el hueco de los descendentes): rozan el nombre, pero no pasan bajo el texto.

### 3.2 Tipografía (`next/font`)

- **Display:** Cormorant Garamond, pesos 400/500, cursiva 400 para acentos (epígrafe). Tracking negativo; `clamp()` hasta ~18vw en el nombre.
- **UI y cuerpo:** Geist (de `geist@1.7.2`), pesos 400 a 600.
- **Datos, indicador y etiquetas:** JetBrains Mono, pesos 400/500.
- **Subconjuntos propios de la home** (`src/app/[locale]/(home)/fonts.ts`, con `next/font/local`): las mismas familias OFL, auto-alojadas, con solo los pesos y los caracteres que pinta la home. Son 58 KB en cinco archivos frente a los 184 KB que bajaba con las de Google:
  - `cormorant-hero.woff2`: el nombre del h1, que es el elemento LCP. Solo sus 16 caracteres, en Cormorant 500 estático: 2.1 KB. Precargada.
  - `cormorant-home.woff2` (400–500 variable, más `lnum`/`tnum` para las cifras) y `cormorant-home-italic.woff2` (400).
  - `geist-home.woff2` (400–600 variable) y `jetbrains-home.woff2` (400–500 variable).
  - Arte (2026-09-26): `greek-home.woff2` (EB Garamond, griego), `math-home.woff2` (STIX Two Math sin su tabla MATH: ecuaciones) y `code-home.woff2` (JetBrains Mono con todo el ASCII, griego, lógica y dibujo de cajas). Solo las usan las escenas y los emblemas; sin precarga, y no se piden hasta que el arte se acerca a la pantalla. Sus repertorios son `ART_GREEK`, `ART_MATH` y `ART_CODE` en `scripts/subset-fonts.sh`.
  - Se precargan el del h1 y `geist-home.woff2` (desde 2026-09-26): con el respaldo ajustado de Geist, el lead y los botones del panel del hero partían línea en otro sitio en `/en` móvil, y el panel saltaba 87 px al llegar la fuente (CLS 0.089 en Lighthouse). Precargada, llega antes del primer pintado: CLS 0 en 5 de 5 corridas en `/es` y `/en`, LCP ≈ 2.0 s. Todos van con `font-display: swap`. Se descartó `optional`: con fuentes sin precarga, en una primera visita con red normal la home se quedaría con las de respaldo.
  - Las pilas de `home.css` no nombran las familias de Google del layout raíz: si lo hicieran, el navegador las descargaría como respaldo mientras cargan estas.
  - `scripts/subset-fonts.sh` regenera los cinco archivos con `pyftsubset`, desde orígenes fijados (commit de google/fonts y `geist@1.7.2`) y con salida reproducible byte a byte. Si el contenido trae un carácter nuevo, se añade ahí.
  - **Paridad de glifos con la versión anterior** (comprobada con CDP): `ḗ` no existe en Cormorant ni en Geist, y `↗` no existe en Geist, así que las pinta una fuente del sistema, igual que antes. `→` tampoco está en el subconjunto mono, porque el subconjunto *latin* de Google no la traía.
  - Tests: el vitest `tests/content/fonts.test.ts` comprueba que el subconjunto del h1 cubre el nombre y pesa ≤ 6 KB, y además renderiza la home (ES y EN) en el servidor y comprueba con el fontkit de next que cada carácter que pinta está en `geist-home.woff2` y que titulares, nombres y cifras están en `cormorant-home.woff2`: editar el copy sin regenerar las fuentes hace fallar `npm test`. El e2e comprueba que la home descarga exactamente estos cinco archivos, que solo precarga el del h1 y Geist, y que cada carácter que pinta tiene glifo en el subconjunto de la familia exacta que le aplica el CSS.
- **Layout raíz (portal y 404 de `[locale]`):** todas sus fuentes son archivos locales (`next/font/local`) y **ninguna se precarga**: una precarga en el layout raíz se descargaría también en la home.
  - Geist recortado a latín (`src/app/fonts/geist-sans-latin.woff2`), que usa el 404 de `[locale]`. También lo regenera `scripts/subset-fonts.sh`.
  - Cormorant Garamond (recta y cursiva), JetBrains Mono e Inter (`*-latin.woff2`): antes venían de `next/font/google`, que abortaba algunos builds limpios (§8). Son las mismas fuentes variables que servía Google con `subsets: ['latin']`: mismo rango unicode *latin*, mismas features y sin hinting, desde el commit fijado de google/fonts (Inter instanciada en `opsz=14`, como la sirve Google). Contornos y métricas coinciden con los de Google (comprobado con fontTools). Las regenera `scripts/subset-fonts.sh`.
  - Además del rango *latin*, cada archivo lleva los caracteres que el portal pinta con esa familia y que la fuente tiene: Inter, «ḗ» (Pinakothḗke, Apothḗke, Scholḗ), → y ↗; JetBrains Mono, ← y ↗; Cormorant recta, Ω y ∞ de las fichas de símbolo. Suman de 160 a 504 B por archivo. Antes los pintaba una fuente del sistema, como con Google.
  - Lo que ninguna fuente de origen tiene sigue en la fuente del sistema: «ḗ» y su versal «Ḗ» en Cormorant y JetBrains Mono; ε, Π y ◎ en Cormorant; y ⚔ ◈ ⊢ ◉ ⚙ ▣ ⏱ ▦ ⬡, que no están en ninguna de las cinco familias. El ◇ de Cormorant existe, pero es un rombo de texto diminuto al lado de los demás símbolos de las fichas (7 px de ancho frente a 19), así que también se queda en la fuente del sistema.
  - El e2e de las subpáginas recorre el texto de cada frente y de lore (ES y EN, con `text-transform`, `::before`/`::after` y placeholders) y comprueba cada carácter contra el archivo de su familia, con esas excepciones escritas en el test. La nota al pie de lore va en Inter cursiva, que no tiene cara propia: el navegador inclina la recta, así que se comprueba contra `inter-latin.woff2`.
  - El respaldo ajustado de cada familia (`size-adjust` y demás) lo calcula ahora next/font con fontkit sobre estos archivos, así que difiere algo de los valores precalculados de Google: solo se nota mientras cargan las fuentes y en los glifos que no están en la fuente.
- **Licencia (SIL OFL 1.1):** todos los woff2 de `src/app/fonts` conservan la tabla `name` entera (`--name-IDs='*'` en `scripts/subset-fonts.sh`), así que el aviso de la licencia (nameID 13) y su URL (14) viajan dentro de cada archivo servido. Cuesta de 76 a 336 B por archivo (156 B en el del h1). Cobertura, contornos y el resto de tablas no cambian. El texto de la licencia de cada familia está junto a los archivos: `src/app/fonts/OFL-{cormorant-garamond,jetbrains-mono,inter,geist}.txt`, que el script descarga del mismo origen fijado (el de Geist sale de `node_modules/geist/LICENSE.txt`).
- **Una sola familia Cormorant en el layout raíz:** `next/font/local` nombra cada llamada con su propia familia. Por eso Cormorant es un único `localFont` con dos `src`, la cara recta y la cursiva (400–700 cada una, archivos variables), y la variable `--font-cormorant`, que usan el portal (`brand.css`) y el 404. Con dos llamadas, `--font-cormorant` se quedaría solo con las cursivas y el texto recto del portal saldría inclinado; un e2e comprueba que la familia tiene su cara normal cargada en cada frente y en lore.

### 3.3 Materiales del grafo

- **Nodos pequeños (capa decorativa y conceptos):**
  - Impostor de esfera SDF sobre quad instanciado, con normal reconstruida desde las UV.
  - Borde fresnel.
  - Iridiscencia de película delgada aproximada con una paleta coseno según el ángulo de visión.
  - Bokeh: círculo de confusión calculado en el vertex según la profundidad. **Plan 2:** en todos los niveles; es el único desenfoque de la escena (no hay `DepthOfFieldEffect`, ver Postprocesado).
- **Hubs (empresas, productos, frentes):**
  - `InstancedMesh` de icosaedro.
  - Refracción simulada: muestreo de un gradiente o envmap pre-difuminado en espacio de pantalla, sin `transmission`.
  - Fresnel y borde tintado del color del frente.
- **Aristas:**
  - Una cinta instanciada por arista, con Bézier cuadrática evaluada en el vertex shader.
    - **Correcciones de GLSL de la Tarea 3 del Plan 2** (compilando los shaders en SwiftShader): el índice de la cinta del plan (a, a+1, a+2…) dejaba los triángulos en sentido horario con la extrusión del vertex shader, y `FrontSide` descartaba todas las aristas. Ahora el índice es antihorario y sale de `scene/ribbon.ts` (`ribbonIndex`), con un test en CPU que reproduce la extrusión y falla con el orden antiguo. Además, `layout` es palabra reservada en GLSL ES 3.00, el dialecto con el que three compila en WebGL2: el parámetro de `layoutPos` se llama `row`, y un test busca palabras reservadas en todos los shaders.
    - Los ocho shaders (fondo, nodos, hubs y aristas) están en un solo `scene/shaders.ts`, con un bloque común (§4.6).
  - Grosor constante en píxeles y antialiasing analítico.
    - Una cinta de menos de 1 px de semiancho se dibuja a 1 px y su línea base se atenúa en proporción (la de los pulsos tenues de la capa decorativa, también). Así conserva la energía de su ancho real y el rasterizador no la deja a trozos.
  - Alfa base ~0.15.
    - **Tarea 3 del Plan 2:** las aristas se mezclan en aditivo, así que la intensidad va en el color y el alfa solo lleva cobertura, atenuación y niebla. La línea base es 0.15 en las aristas semánticas y **0.05 en las decorativas**. La capa decorativa llega a 8k aristas en T3, y con 0.08 ya cruzaba el umbral del bloom (0.85) en reposo, donde convergen los satélites de un nodo pesado.
    - Medido en SwiftShader, con hubs y nodos por delante como en la escena real: en reposo, las aristas llegan como máximo a 0.27, 0.31 y 0.35 de luminancia en T1, T2 y T3 (0.26, 0.27 y 0.33 antes de la niebla de la Tarea 7, que ya no atenúa el plano de foco). Los pulsos llegan a 6–12, así que solo ellos cruzan el umbral.
    - **Tarea 5 del Plan 2: mezcla sin compositor (T1).** Sin compositor, cada fragmento llega a la mezcla ya con tone mapping y en sRGB, y la suma aditiva de valores codificados sobrevalora los solapes. En móvil (390 × 844), el haz de aristas semánticas de la lemniscata de Contacto se quemaba a blanco puro: una región conexa de 769 a 896 px con los tres canales ≥ 250, unos 5 000 px en total. Ahora `EDGE_FRAG` saca el color premultiplicado por el alfa y `GraphScene` elige los factores de mezcla:
      - con compositor (T2 y T3), (ONE, ONE): la misma suma lineal en HDR que la aditiva (SRC_ALPHA, ONE) de antes, con un solo tone mapping al final;
      - sin compositor (T1, o si el postprocesado falla), de pantalla (ONE, ONE_MINUS_SRC_COLOR), `1 − (1 − a)(1 − b)`: una arista sola pinta igual y un haz satura suave, sin pasar de 1.
      - Los factores son estado de GL, no del programa: cambiar de nivel no recompila las aristas.
      - Medido después en el e2e: la mayor región blanca de Contacto en T1 es de 28 a 74 px (pulsos sobre el haz), y en el resto de poses de T1, de 4 px como mucho.
      - Con el encuadre en retrato de §3.4, la lemniscata ocupa menos pantalla en T1 y el haz es más denso: la mayor región blanca de Contacto pasa a 61–103 px (6 corridas, límite del e2e 200 px), y en el resto de poses de T1, a 12 px como mucho.
    - **Convergencia de los satélites en cada pose** (Tarea 5, `e2e/graph3d.spec.ts`, SwiftShader, en pausa, sin pulsos y sin hubs ni nodos delante, el peor caso): en T3 (1440 × 900, con bloom y 8k satélites) ningún píxel llega a blanco puro en ninguna de las seis poses; en T1, como mucho 11 px (en Contacto). En la escena real, T3 no tiene ningún píxel blanco puro en ninguna pose.
  - Pulsos `glow = exp(-k (t - fract(time*speed*w + seed))^2)` en HDR. Al resaltar un nodo, recorren sus aristas desde él hacia los vecinos (§2.2).
- **Capa decorativa (Plan 2):** satélites conectados a su nodo padre, ninguno suelto (§4.3). Cada satélite es un sprite como los nodos pequeños, con el color de su padre, y una o dos aristas decorativas: a su padre y al satélite anterior del mismo padre.
- **Sin etiquetas en el canvas (Plan 2):** la etiqueta del nodo activo es la ficha DOM del puntero (§2.2 y §4.4, paso 5), en HTML y con las fuentes de la página: la escena no dibuja texto.
- **Postprocesado (según nivel):**
  - `postprocessing` se carga de forma diferida (`import()` destructurado, 16.6 KB gz; §5.1) y solo en T2 y T3. En T1 no se descarga: el halo de los nodos va en su shader (`uGlow`) y el tone mapping, por fragmento.
  - Bloom con umbral (mipmap blur, media resolución). Umbral 0.85.
    - En reposo, lo que pasa del umbral son los pulsos (de 800 a 1 700 px por frame a 960 × 600, según el nivel, con luminancia de 2.8 a 11.7) y, en unos 30 px, el borde fresnel de los hubs y el núcleo del nodo propio (casi blanco): de 19 a 38 px de 576 000 en la escena completa, luminancia de hasta 2.5 (arnés de SwiftShader de la Tarea 7, medido de nuevo en la Tarea 6). Se deja así: bajarlos del umbral apagaría el cristal de los hubs en todos los niveles, y su bloom no se distingue a la vista. Con hover, el vecindario resaltado sube y sí lo dispara.
  - Viñeta y grano sutil. El fondo se adelanta a la viñeta y al ACES del EffectPass (§3.1), así que la viñeta solo oscurece el grafo.
  - Niebla en el shader, según la profundidad de vista: 0 delante del plano de foco y en él; detrás sube con smoothstep hasta 0.7 a 0.8 unidades del plano (`fogOf` en `scene/shaders.ts`). Atenúa el alfa de los nodos, la intensidad de las aristas y el color de los hubs, y se retira en proporción al resaltado: nada en el nodo activo y sus aristas, a medias en sus vecinos.
    - **Tarea 7 del Plan 2:** el shader empezaba 0.4 unidades por delante del foco (en el propio plano ya valía ≈ 0.14). Se ajustó el shader a esta sección, porque delante no debe haber niebla, y se acortó la rampa de 1.4 a 0.8 unidades para que la mitad trasera conserve la profundidad que ya tenía. Medido en SwiftShader (T1, foco 4.4), brillo del centro de cada nodo semántico con niebla frente a sin ella, antes → ahora: delante 0.99 → 1.00; foco ± 0.2 0.86 → 0.98; detrás 0.69 → 0.77; más de 0.45 detrás 0.65 → 0.67. Con 1.0 unidades la parte de atrás perdía profundidad (0.83 y 0.76), y con 0.6 quedaba más apagada que antes (0.67 y 0.56). Además, así el canvas se acerca al póster, que no tiene niebla.
  - DOF real solo en T3. **Desviación del Plan 2:** no hay `DepthOfFieldEffect` en ningún nivel. El desenfoque es el bokeh del sprite (círculo de confusión en el vertex), en todos los niveles. Es una decisión del plan: ninguna tarea montó el efecto, y `GraphScene` no lo importa de `postprocessing`.
- **Prohibido:** campo de estrellas o partículas sin aristas. Toda la capa decorativa son nodos conectados.

### 3.4 Movimiento

- **Easing:** expo-out.
- **Cámara:** con amortiguación (`1 - exp(-k·dt)`).
- **Encuadre en retrato** (Tarea 5 del Plan 2, ronda de fix 1): las distancias de `SECTION_POSE` están pensadas para apaisado, donde manda el alto (el fov de la cámara es vertical, 38°). Con aspecto < 1, `frameAt` aleja la cámara `1/aspect` en todas las poses salvo la del hero, así que el ancho visible es el alto visible de la misma pose con aspecto 1 y la forma cabe a lo ancho como cabe a lo alto.
  - Antes, a 390 × 844, la lemniscata de Contacto no se reconocía (un haz horizontal cortado por los dos lados), y Método y Trayectoria también tocaban los dos lados.
  - El hero conserva `CAMERA0`: es la cámara del póster, cuyo `slice` en retrato también recorta por los lados, y el canvas tiene que coincidir con él al fundirse.
  - Frentes queda como en apaisado: la cámara visita de cerca el cluster activo (§2, L3) y deja otro contra un borde, en retrato y en apaisado.
  - El e2e lo comprueba por píxeles: en T1 (390 × 844) y T3 (1440 × 900), las aristas semánticas en reposo de cada pose, salvo Frentes, quedan al menos a un 3 % del lado de cada borde (§6).
- **Respiración:** ruido simplex por instancia en el vertex shader. Es simplex 2D: cada instancia recorre en el tiempo su propia fila del campo, una por eje, con 0.016 de amplitud (misma RMS que la versión con senos del plan).
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
  - El 404 global pasa a `src/app/global-not-found.tsx`, con el flag experimental `globalNotFound`, sustituyendo a `src/app/not-found.tsx`. Los dos 404 (el global y el de `[locale]`) son bilingües, como el anterior: ninguno recibe el locale de la URL. Los dos fijan `theme-color` `#05090b`, el fondo de su vista (la home fija `#05090b` y el portal `#0b1417` desde su grupo de rutas; el layout raíz no fija ninguno).
  - Se eliminan `src/app/opengraph-image.tsx` y `public/og-image.png` en favor de la OG por locale. `robots.ts`, `sitemap.ts`, `icon.svg` y `favicon.ico` siguen en `src/app/`.
- **Proxy:** `src/middleware.ts` → `src/proxy.ts`. Solo redirige `/` según `Accept-Language` (etiquetas ordenadas por su peso q; gana la primera es/en) y fuerza el prefijo de locale. Las redirecciones conservan la query (UTM). Sin `console.log`. Lo cubren `tests/lib/proxy.test.ts` (redirecciones, pesos q y matcher: sitemap, robots, `/graph`, `/_next` y OG) y un e2e.
- **Lint:** ESLint 9 con configuración plana (`eslint.config.mjs`), `eslint-config-next@16`, script `"lint": "eslint ."`.
- **Build con webpack:** el script `build` es `next build --webpack`. Con Turbopack, el bundler por defecto de Next 16, la home cargaba 135 478 B gz de JS. Solo el framework (runtime de Next, React DOM y los componentes cliente internos del App Router) ya sumaba 134 143 B gz, por encima del presupuesto de §5 (130 KB = 133 120 B), y los flags experimentales de Turbopack no lo reducen. Con webpack la home carga 132 462 B gz (129.4 KB), con un margen de solo 658 B (§5.1). `next dev` sigue con Turbopack.
- **Bootstrap:** `bootstrap.min.css` y `react-bootstrap` solo en las rutas que usan el `Navbar` actual (layout de frente y lore). La home tiene su propio encabezado.
- **Cabeceras:** `poweredByHeader: false`. CSP aplicada (no Report-Only):

  ```
  default-src 'self'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com;
  font-src 'self';
  connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com;
  worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests
  ```

  - Se valida con cero violaciones: el e2e registra los errores de consola y los eventos `securitypolicyviolation` en la home, en los cuatro frentes y lore de los dos idiomas (bajando hasta el final para que monte lo diferido) y con GA cargado tras una interacción, esperando a `gtag.js` y a su petición `/g/collect`.
  - Los orígenes de Google son los de la guía de CSP de Google Tag Platform ([Use Tag Manager with a Content Security Policy](https://developers.google.com/tag-platform/security/guides/csp), consultada el 2026-09-24), bloque de GA4 con Google Signals: `*.googletagmanager.com` en `script-src`, `img-src` y `connect-src`, y `*.google-analytics.com`, `*.analytics.google.com`, `*.g.doubleclick.net` y `*.google.com` en `img-src` y `connect-src`. Así la medición no se rompe si se activan las señales de Google (que piden `stats.g.doubleclick.net` y `www.google.com`) ni si gtag cambia de subdominio regional. La versión en inglés de la guía (actualizada el 2026-09-18) funde GA y Ads en un bloque y cita `www.googletagmanager.com`; `*.googletagmanager.com` lo cubre.
  - Lo que la guía pide y no se añade: los `*.google.<TLD>` por país, porque la CSP no admite comodines en el TLD y habría que listar los 187 dominios de `google.com/supported_domains` (unos 8 KB más en cada respuesta), y `pagead2.googlesyndication.com` y `frame-src https://www.googletagmanager.com`, que la guía pide solo para las propiedades vinculadas a Google Ads.
  - Previews de Vercel: también se construyen en producción y reciben esta CSP. Con `VERCEL_ENV=preview` se añaden los orígenes que la documentación de Vercel pide para la Vercel Toolbar: `https://vercel.live` en `script-src`, `style-src`, `img-src`, `font-src`, `connect-src` y un `frame-src 'self' https://vercel.live`, además de `https://vercel.com` (img), `https://assets.vercel.com` (font) y `wss://ws-us3.pusher.com` (connect). Producción no los lleva.
  - `worker-src 'self' blob:`: con `next build --webpack`, el worker del Plan 2 (`new Worker(new URL(..., import.meta.url))`) sale como chunk del mismo origen y debería bastar `'self'`. `blob:` se queda hasta que la Tarea 5 del Plan 2 lo compruebe con el worker real; si no hace falta, se quita.
    - **Estado tras el Plan 2:** sigue `blob:`. La Tarea 5 comprueba cero violaciones de CSP con el worker real, pero con esta directiva; nadie ha probado a quitarla. Lo que sí consta: el worker es un chunk del mismo origen (`/_next/static/chunks/<id>.<hash>.js`) y ningún chunk del 3D contiene `blob` (comprobado en el build de la Tarea 6). Quitarlo pide volver a pasar el proyecto `3d` del e2e con la CSP nueva.

### 4.2 SEO

- **Constante única:** `SITE = 'https://www.stevenvallejo.com'` en `src/lib/site.ts`, usada en todo `mi-cv`.
- **Metadata por página:**
  - `alternates.canonical` a sí misma.
  - `alternates.languages` con `es`, `en` y `x-default` → `/en`.
  - `openGraph.locale` y `alternateLocale`.
  - Título ≤ 60 caracteres y descripción ≤ 155.
  - `og:title` y `twitter:title` de las subpáginas: el título corto seguido de « · Steven Vallejo Ortiz», para que la tarjeta al compartir lleve el nombre. `<title>` sigue la plantilla.
  - Toda `og:image` lleva `alt` («Steven Vallejo Ortiz — Mouseîon»), que se emite como `og:image:alt` y `twitter:image:alt`.
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
  - **Plan 2 (`scene/data.ts`, `buildSceneData`):** cada satélite tiene un nodo padre semántico, elegido con probabilidad proporcional a su peso^1.5 (más alrededor de lo importante), y va desplazado de él. Se une a su padre y al satélite anterior del mismo padre: una o dos aristas decorativas por satélite, ninguno suelto. Toma el color de su padre y se mueve con él (misma posición animada, `nodePos`), también en los morphs. Al cambiar de nivel se recorta la capa con `decorEdgePrefix`, sin regenerarla: nunca pasa de la del nivel con el que arrancó.
- **`scripts/build-graph.mts`** (se ejecuta en `prebuild` y también bajo demanda):
  - **L0:** d3-force-3d (`numDimensions: 3`) con semilla fija.
  - **L1:** L0 plegado a dos hemisferios por dominio.
  - **L2:** hélice por año de inicio (sin año: interpolación con los vecinos).
  - **L3:** 4 clusters por frente. Las tecnologías y los conceptos van al cluster del frente de su grupo de `tools.json` (informática, salvo IA → ciencias y lógica → filosofía), no al de su mayor grado, como decía el diseño. Es lo que implementó la Tarea 5 (revisada limpia) y lo acepta un Ruling de la revisión final. Afecta a pocos nodos: por ejemplo, `tec:nestjs` tiene más vecinos en enterprise y queda en informática.
  - **L4:** muestreo de la lemniscata de Bernoulli 3D.
  - Normaliza todas las formas a una esfera de radio 1.
- **Salidas:**
  - `public/graph/graph.<hash>.bin` (formato GRF1, `<hash>` = 10 hex del SHA-256 de binario y metadatos): cabecera de 16 bytes (magia, N, M, nº de layouts), Float32 × 5 layouts × N × 3, índices de aristas Uint16, y Uint8 para kind, frente y peso de cada nodo y rel y peso de cada arista. El binario no guarda puntos de control.
  - `public/graph/graph.<hash>.json`: ids, kind, etiquetas es/en, frente, URLs, años (`year`, `month` solo si la fuente trae el mes, `yearEnd`) y rol.
  - Con el hash en el nombre, `/graph/*` se sirve con caché `immutable` y cada build borra los artefactos viejos (también los pósters).
  - `public/graph/poster.<hash>.svg` (`<hash>` = 10 hex del SHA-256 del SVG): el póster, que es el frame 0 de L0 con la cámara inicial. La home lo carga como archivo (§4.4).
  - `src/graph/generated/poster.ts`: el mismo SVG como cadena (`POSTER_SVG`), solo para la imagen OG que se genera en build.
  - `src/graph/generated/stats.ts`: `GRAPH_STATS` (nº de nodos y aristas), `GRAPH_ASSET` (rutas `bin` y `meta` del artefacto con hash), `POSTER_ASSET` (ruta del póster) y `DATA_DATE` (fecha del último commit de los datos). En un clon superficial, como el de Vercel (`--depth=10`), git trata la frontera como raíz y la devuelve aunque no cambie datos: en ese caso se conserva el `DATA_DATE` commiteado (`scripts/data-date.ts`, con test). Por eso `stats.ts` se regenera y se commitea después de commitear los cambios de datos.
- **Determinismo:** misma entrada ⇒ mismos bytes (se verifica con test).
- **Presupuestos:** datos ≤ 60 KB gz; póster ≤ 12 KB gz.

### 4.4 Render

- **`src/graph/scene/GraphScene.ts`:** clase de three.js puro (`three@0.186.x` y `postprocessing` compatible), independiente del entorno (worker o hilo principal).
  - API: `init(canvas, {width, height, dpr, tier})`, `resize`, `setPointer(x, y)`, `setScroll(section, progress)`, `setMotion(on)`, `focusNode(id)`, `setVisible(bool)`, `dispose()`.
  - Eventos emitidos: `ready`, `hover {id, x, y}`, `tier`.
  - **Lo construido (Plan 2):** `init({canvas, width, height, dpr, tier, motion, graph})`, `resize(width, height, dpr)`, `setPointer(x, y, inside)` (`inside` = el puntero no está sobre contenido), `setScroll(s)` con `s` continuo (índice de sección + progreso, §4.5), `setMotion(on)`, `focusNode(index | null)`, `setVisible(visible)` y `dispose()`. Eventos: `ready`, `hover {index, x, y}`, `hover-end`, `tier` y `error` (p. ej. `webgl-context-lost`). El protocolo con el hilo principal está en `runtime/protocol.ts` y lo aplica `runtime/dispatch.ts`, con un `switch` exhaustivo.
  - **Endurecimiento (Tarea 7 del Plan 2):**
    - el compositor solo se activa con sus programas ya compilados (`compileAsync` sobre la escena y los pases del bloom), así que el primer frame con bloom no compila en síncrono, tampoco al subir de T1 a T2;
    - sin compositor, el renderer vuelve a borrar (`autoClear`), también si el montaje falla;
    - `focusNode` con un índice que no sea un entero en [0, N) equivale a `null`;
    - en pausa, la escena pinta hasta que llegan todas las magnitudes amortiguadas (`scene/damping.ts`) y entonces para;
    - `setVisible(false)` cancela el rAF, y al volver el reloj no salta; `pick()` no reserva memoria por frame;
    - `dispose()` es idempotente, retira los listeners de pérdida de contexto e ignora los mensajes y los cambios de nivel que lleguen después;
    - los colores del fondo salen de `palette.ts` (hoy, a través de `background.ts`, §3.1).
- **`src/graph/worker/graph.worker.ts`:** recibe un `OffscreenCanvas` transferido y reenvía mensajes a `GraphScene`. Sin SharedArrayBuffer.
  - **Plan 2:** lo que llega antes de que la escena esté lista espera en un buzón (`runtime/inbox.ts`) que guarda el último mensaje de cada tipo y se abre al terminar `init`. El mismo buzón lo usa el fallback en el hilo principal. Webpack lo emite como worker clásico que carga sus chunks con `importScripts` (§5.1).
- **Póster (RSC, `src/components/home/Stage.tsx`):** lo pinta el servidor, no la isla. Es `<img src={POSTER_ASSET} fetchpriority="low" decoding="async">` con `object-fit: cover`, que equivale al `xMidYMid slice` del SVG, dentro de `.stage` (`aria-hidden`).
  - No va inline porque inline entraba dos veces en el HTML (marcado y payload RSC, ~10 KB gz).
  - Chrome no lo toma como candidato a LCP porque cubre todo el viewport: el LCP sigue siendo el nombre del h1, y lo comprueba un e2e.
  - Frente a `<svg><use href="…#p">` midió igual (§5.2), y `<img>` no depende de que el navegador resuelva degradados de un documento externo.
- **Isla cliente `src/components/graph/GraphStage.tsx`** (Plan 2): se monta encima del póster. `Stage` monta a su lado la puerta `GraphStageLazy`, que no usa `next/dynamic` en el render y solo hace `import('./GraphStage')` tras el disparador del paso 2 (enmienda H1 del Plan 2, §5.1). El póster no cambia: sigue siendo el `<img>` del servidor.
  1. Ejecuta la sonda de GPU `src/graph/runtime/probe.ts`. Devuelve falso si:
     - `reduced-motion`;
     - `saveData`;
     - `deviceMemory < 4` o `hardwareConcurrency < 4`;
     - no hay WebGL2 con `failIfMajorPerformanceCaveat`;
     - el renderer es software (swiftshader, llvmpipe…).
     Libera el contexto de la prueba.
     - **Plan 2:** la sonda corre en la isla (`GraphStage`), en su propio `requestIdleCallback` (timeout 1.5 s), después de que la puerta la haya cargado: la puerta no la importa (enmienda H1). Con movimiento reducido no se llama y se muestra «Explorar en 3D».
     - **Coste medido (Tarea 6):** en la traza de Lighthouse (Chrome 149 sin GPU, que crea el contexto WebGL2 por SwiftShader aunque se pida `failIfMajorPerformanceCaveat`), el chunk de `GraphStage` se evalúa en 0.6 ms y la sonda ocupa una tarea de 4.1 ms, sin CPU ralentizada. Ni con la ralentización ×4 de móvil llega a tarea larga (50 ms), así que no suma TBT (§5.3). No lo medí con una GPU real: crear el contexto ahí puede costar más.
     - **Parámetros de URL para pruebas:** `?gl=force` se salta la sonda (la escena arranca también con renderer software), `?gl=off` la desactiva (se queda el póster) y `?worker=off` fuerza el fallback en el hilo principal. Los usan los e2e (§6) y las medidas de esta spec.
  2. Disparador: primera interacción (`pointermove`, `touchstart`, `scroll`, `keydown`) o `requestIdleCallback` tras `load` (timeout 1.5 s).
  3. `transferControlToOffscreen` y arranque del worker.
     - Sin OffscreenCanvas con WebGL2, o si el worker falla antes de `ready`: `GraphScene` en el hilo principal con `renderer.compileAsync()`. La sonda solo prueba WebGL2 en un canvas del hilo principal, así que `offscreenWebGL2` (`probe.ts`) prueba también el OffscreenCanvas: Safari 16.4–16.x lo tiene solo 2D.
     - Lo orquesta `src/graph/runtime/launch.ts` (`launchScene`). Los mensajes se encolan desde el primer momento en las dos vías, también mientras se descarga three. Al pasar del worker al hilo principal, la escena nueva arranca con la pausa y el tamaño vigentes y recibe el último mensaje de cada tipo. Si el hilo principal también falla, avisa en consola (`[grafo] fallback sin escena:`) y se queda el póster.
     - Crossfade de 600 ms póster → canvas al recibir `ready`.
  4. Puente de eventos: puntero normalizado agrupado por rAF, `ResizeObserver`, progreso de scroll, `visibilitychange` e `IntersectionObserver`.
     - **Plan 2:** sin `IntersectionObserver`: el escenario es `sticky` a pantalla completa y siempre está visible. Además del puntero (con `inside` falso sobre el contenido: enlaces, paneles, tarjetas, barra, pie y controles del grafo), el `ResizeObserver`, el scroll (`useSectionProgress`) y `visibilitychange`, el puente envía el foco (`focusin`/`focusout` sobre un `[data-node]` → `focus`) y activa el nodo resaltado con un clic fuera del contenido (§2.2).
  5. Tooltip y tarjeta DOM del nodo en coordenadas proyectadas por el worker.
     - **Plan 2:** solo la ficha (`role="tooltip"`), sin tarjeta (§2.2). Ella y los botones de pausa y de «Explorar en 3D» van por un portal dentro de `.home` con `position: fixed` (§4.8).
- **Niveles de calidad:**

  | Nivel | Uso | DPR | Capa decorativa | Efectos |
  |---|---|---|---|---|
  | T0 | Póster | — | — | — |
  | T1 | Móvil | 1 | 1.5k | Halo en shader, sin bloom (no descarga `postprocessing`) |
  | T2 | Por defecto | 1.25–1.5 | 4k | Bloom a media resolución |
  | T3 | Escritorio con GPU dedicada | ≤ 2 | 8k | Bloom (sin DOF: bokeh en el sprite, como en T1 y T2; §3.3) |

  - Regulador: mediana del tiempo de frame cada 90 frames. Baja de nivel si > 20 ms y sube si < 10 ms sostenido durante 5 s.
    - El tiempo de frame se mide de dos formas (`src/graph/runtime/quality.ts`). Para bajar cuenta el intervalo entre frames: incluye la GPU, que va asíncrona, y cualquier atasco, pero nunca baja del refresco de la pantalla (16.7 ms a 60 Hz). Para subir cuenta el coste del frame en CPU (update más envío del render), siempre que el intervalo no sea lento. Con el intervalo solo, en una pantalla de 60 Hz no se podría volver a subir.
    - Ese coste no ve la GPU, así que una subida puede no aguantar. Para que un equipo limitado por la GPU no oscile entre dos niveles, la primera vuelta a un nivel espera 5 s y cada bajada posterior desde él duplica la espera (10 s, 20 s, 40 s), con un tope de 60 s.
    - Tras 60 s en un nivel sin bajar de él se olvidan las bajadas desde ese nivel y desde los de debajo. Las del nivel de arriba se conservan: estar estable en un nivel no dice nada del siguiente. Además, un `resize` que cambia el tamaño o el DPR las olvida todas; el reajuste interno al cambiar de nivel no cuenta.
  - 30 fps tras 8 s sin input.
  - Nivel inicial (`initialTier`): T1 con puntero grueso o menos de 900 px de ancho; T3 con 8 núcleos o más y al menos 1280 px; T2 en el resto.
- **Draw calls objetivo:** ≤ 6 (nodos SDF, hubs, aristas, etiquetas opcionales, postprocesado).
  - **Plan 2:** sin etiquetas, la escena son 4 draw calls (fondo, aristas, nodos y hubs). Con bloom se añaden los pases del compositor: el de luminancia y el desenfoque mipmap a media resolución, y el EffectPass final (bloom, viñeta, grano y tone mapping).
- **Raycast:** fuerza bruta en el worker contra las esferas de los nodos semánticos.
  - **Plan 2:** en pantalla. Proyecta cada nodo semántico (su posición en la forma, sin la respiración) y elige el más cercano al puntero dentro de un radio fijo más medio tamaño del nodo. Sin reservas de memoria por frame (un `Vector3` reutilizado).
- **Cámara:** spline CatmullRom por sección; el progreso de scroll la mueve con amortiguación.
  - **Plan 2:** sin spline. Cada sección tiene una pose (`SECTION_POSE` en `scene/choreography.ts`: distancia, giro, inclinación, objetivo, desplazamiento lateral y atenuación). `frameAt` pasa de una a la siguiente con `smoothstep(0.55, 1, progreso)`, y `GraphScene.update()` amortigua cada magnitud (`scene/damping.ts`). En retrato se aleja 1/aspecto salvo en el hero (§3.4).

### 4.5 Scroll

- **Secciones:** fijadas con CSS `position: sticky` en contenedores de altura definida en CSS.
- **Progreso:** `src/components/home/useSectionProgress.ts`, con `scroll` pasivo y `resize` agrupados por rAF (sin `IntersectionObserver`: el cálculo lee las cajas de las secciones `[data-section]`). Emite un escalar continuo `s` = índice de la sección bajo el centro de la pantalla + progreso dentro de ella (`sectionProgress`, con tests) y lo envía a la escena.
- **Sin GSAP:** salvo que una coreografía concreta lo requiera, y en ese caso solo cargado de forma diferida y sin `pin`.

### 4.6 Estructura de archivos

```
src/app/[locale]/layout.tsx            html/body, fonts, metadata base, static params
src/app/[locale]/(home)/layout.tsx     home.css y variables de las fuentes de la home
src/app/[locale]/(home)/fonts.ts       subconjuntos de fuente de la home (next/font/local; §3.2)
src/app/[locale]/(home)/page.tsx       RSC: compone las secciones, JSON-LD (grupo (home))
src/app/fonts/*.woff2                  fuentes del layout raíz recortadas a latín (Geist, Cormorant, JetBrains Mono, Inter) y subconjuntos de la home
src/app/[locale]/(portal)/...          frentes y lore (grupo (portal), con bootstrap y brand.css)
src/app/[locale]/opengraph-image.tsx   OG por locale
src/components/home/*.tsx              HomeHeader, Stage, Hero, Method, Path, Fronts, Proof, Contact, HomeFooter, SectionHead, ProductSearch (cliente); useSectionProgress.ts (Plan 2)
src/components/graph/GraphStageLazy.tsx  puerta mínima de la ruta crítica (enmienda H1 del Plan 2, §5.1)
src/components/graph/GraphStage.tsx    isla cliente: sonda, worker o fallback, puente de eventos, tooltip, pausa (.graph-motion) y «Explorar en 3D»
src/graph/{model,sources,relations,layouts,codec,palette,camera0,layout-names,random,poster,artifacts}.ts
src/graph/runtime/{protocol,probe,quality,loader,dispatch,inbox,launch}.ts   sin three: también los importa el hilo principal
src/graph/scene/GraphScene.ts          three.js y postprocessing (solo en el worker o en el fallback)
src/graph/scene/{shaders,data,choreography,damping,ribbon,background}.ts   sin three: GLSL, datos de GPU, poses por sección, amortiguación, índice de la cinta y fondo (§3.1)
src/graph/worker/graph.worker.ts       worker con OffscreenCanvas (Tarea 4 del Plan 2)
src/graph/generated/{poster,stats}.ts  (generados, versionados)
src/lib/site.ts                        SITE, locales, helpers de alternates
src/content/home.ts                    textos es/en de la home (una sola fuente i18n para la home)
src/content/proof.ts                   cifras de Prueba derivadas de los datos (§2.1)
src/content/timeline.ts                línea de tiempo canónica de Trayectoria
src/styles/home.css
scripts/build-graph.mts
scripts/data-date.ts                   DATA_DATE (último commit de los datos; clon superficial)
scripts/subset-fonts.sh                regenera los subconjuntos de la home y las fuentes del layout raíz
tests/graph/**/*.test.ts               vitest (también runtime/, scene/ y worker/)
e2e/home.spec.ts                       Playwright
e2e/graph3d.spec.ts                    Playwright, proyecto `3d` (SwiftShader; §6)
e2e/pixels.ts                          PNG y regiones conexas para los e2e por píxeles del 3D
e2e/fixtures.ts                        test y expect de Playwright sin hits reales a GA (§6)
```

**Desviación del Plan 2 en `src/graph`:** el diseño preveía `scene/{shaders/*.ts,layers/*.ts,quality.ts,camera.ts}`. Lo construido es otra cosa:
- **Shaders:** los ocho (fondo, nodos, hubs y aristas, vertex y fragment) van en un solo `scene/shaders.ts`, con un bloque GLSL común (formas, resaltado, respiración y niebla). Así las tres capas comparten la misma `nodePos`.
- **Capas:** no hay `layers/`. Las cuatro mallas las construye `GraphScene.buildMeshes()` desde los arrays de `scene/data.ts`.
- **Regulador y sonda:** van en `runtime/` (`quality.ts`, `probe.ts`) porque el hilo principal importa `initialTier` y la sonda sin arrastrar three.
- **Cámara:** no hay `camera.ts`. Las poses por sección están en `scene/choreography.ts` y la amortiguación en `GraphScene.update()`. La cámara inicial común es `camera0.ts`.

### 4.7 Analítica

- **Carga de GA** (`G-E5NMYWLXER`): la hace un cargador propio, `src/components/Analytics.tsx`, en cliente. Inyecta `gtag.js` y la configuración con la primera interacción (`pointerdown`, `keydown`, `scroll`, `touchstart`) o, en su defecto, 5 s después de `load` con `requestIdleCallback` (sin él, directamente). La lógica está en `scheduleAnalyticsLoad`, con tests. Se conserva el ID y la continuidad de datos, y se sustituye el `<Script afterInteractive>` inline actual.

### 4.8 Accesibilidad

- **Grafo:** va en `.stage`, una capa fija con `aria-hidden="true"` y sin `<figure>`. Contiene el póster y, encima, el canvas del Plan 2 (§4.4). La leyenda visible está en el hero (`.hero-caption`): "Este grafo es mi trayectoria: N nodos, M relaciones reales" y el enlace "Verlo como lista" → `#frentes`.
- **Botón de pausa:** visible, con `aria-pressed` (WCAG 2.2.2). Llega con el Plan 2 (Tarea 4).
  - **Lo construido (Plan 2):** los controles y la ficha del nodo no pueden ir en `.stage`, que es `aria-hidden` (enmienda H3), así que `GraphStage` los monta con un portal dentro de `.home`, con `position: fixed`: el botón de pausa (o, con movimiento reducido, «Explorar el grafo en 3D») abajo a la derecha, y la ficha (`role="tooltip"`) en las coordenadas que proyecta la escena. El botón solo aparece mientras la escena carga o está viva: con el póster (sin GPU, Lighthouse) no hay controles.
  - La pausa se guarda en `localStorage` (`mouseion:motion`), pone `html[data-motion="paused"]` (también detiene las animaciones CSS) y manda `motion` a la escena, que deja de pintar al llegar a su pose.
  - En móvil (390 × 844), el botón queda sobre el borde inferior de la tarjeta del hero, debajo de «Verlo como lista», sin tapar texto.
- **Menú móvil:** por debajo de 900 px el índice es un `<details>` dentro de un `<nav>` (landmark, como `.topnav` en escritorio). Se cierra al elegir una sección, al tocar fuera y con Escape (que devuelve el foco al botón), con un script inline emitido desde el RSC: sin chunk cliente. Es `type="module"` para que no bloquee el parser (§5.2). Lo prueba un e2e en tablet y móvil.
- **Reduced motion:** póster; la escena solo arranca a demanda y sin autoplay.
- **Objetivos táctiles:** ≥ 24 px y foco visible.
- **Estructura:** orden de headings h1 → h2 por sección → h3 por frente o empresa (y en Herramientas) → h4 en tarjetas y grupos del stack.
- **Idioma:** `lang` correcto en el servidor (`es` / `en`).

### 4.9 Barra de accesos y asistente «Pregúntame» (2026-09-24)

- **Barra** (`HomeHeader`, fija): los sitios hermanos (CV Informático, CV Filósofo, Blog · Scholḗ), las secciones (Catálogo, Contacto), el idioma, «Pregúntame», WhatsApp (icono, con el mensaje de entrada precargado) y Servicios. Por debajo de 1 280 px, sitios, secciones y Servicios pasan al menú `<details>`, con «Pregúntame» destacado arriba; WhatsApp sigue visible, y por debajo de 480 px «Pregúntame» queda en la barra como un anillo con la chispa. Los enlaces salen de `src/lib/ecosystem.ts`. «Scholḗ» va en minúsculas y en la sans: ninguna mono tiene «Ḗ».
- **Asistente:** `POST /api/assistant` (Node.js) con Claude Sonnet 5 (`claude-sonnet-5`, sin razonamiento, esfuerzo bajo, 700 tokens de salida como mucho) y respuesta en streaming de texto plano. El system prompt son las instrucciones de `src/assistant/prompt.ts` más `src/assistant/profile.md`, que genera `scripts/build-assistant-profile.mts` a partir de lo publicado (el catálogo, los textos de este repo, los dos CV y los servicios) y que se cachea con `cache_control`. La clave es `ANTHROPIC_API_KEY` en Vercel (production y preview); sin ella, el endpoint responde 503.
- **Protección** (el endpoint es público y lo paga Steven): solo el mismo origen (www.stevenvallejo.com, la URL de la propia preview y, fuera de producción, localhost), solo JSON, preguntas de 800 caracteres como mucho, 8 turnos de historial y un límite en memoria por IP (8 cada 10 min y 40 al día) con un tope global de 500 al día por instancia. Los errores son un código genérico. El límite en memoria es por instancia: frena el abuso casual, no es una cuota exacta.
- **Panel:** `<dialog>` modal (foco atrapado, Escape y clic en el fondo cierran, el foco vuelve al botón que lo abrió o a «Menú»), 3 preguntas sugeridas y un aviso de que las respuestas son de una IA. Su código, su CSS y su copy se importan con el primer clic (§5.1).

### 4.10 Catálogos: Paideía, Kósmos y Daímon (2026-09-24)

- **Qué son:** tres productos que no son apps sino sitios que reúnen otros: Paideía (cursos, ponencias con sitio propio, la tesis y ensayos), Kósmos (proyectos de ciencia, cada uno con su repositorio) y Daímon (proyectos de IA). En `frentes.ts` llevan `tipo: 'catalogo'`, `unidad` («obras», «proyectos») e `incluye: { nombre, url?, kind }[]`, ítem a ítem desde el propio repo de cada catálogo (Kósmos `lib/catalog.ts`, Daímon `lib/components-data.ts`, Paideía `app/trabajos/works.ts` y `app/ponencias`). `catalogoKinds` nombra cada colección en los dos idiomas.
- **Home:** cada catálogo abre su frente, antes de las tarjetas: es un trabajo más del frente, uno que reúne otros. Tarjeta con el color de su marca, borde de luz que la recorre (`--cat-angle`), dos hojas apiladas detrás que se abren en abanico, el rótulo «Catálogo · N …», nombre y cifra en contorno, lema y descripción (dos líneas; completa al pasar por la cabecera), **una escena** (abajo) y la leyenda de colecciones con su cifra.
- **Por qué no en una banda aparte (2026-09-25):** hasta esta fecha iban en una banda «Catálogos» encima de los frentes, cada tarjeta rotulada «§ NN · Frente». Eran cuatro tarjetas, una por frente, seguidas de cuatro secciones con el mismo § y el mismo nombre: dos listas con la misma clave se leen como resumen y detalle, así que cada frente parecía el desarrollo de su catálogo. No lo es: lo que reúnen Kósmos, Daímon y Paideía no está en las tarjetas de su frente (solo el repositorio de la tesis coincide), y las tarjetas del frente no están en su catálogo. Dentro del frente, el catálogo es un hermano de las demás tarjetas, no su cabecera. Humanizar es otra cosa: la vitrina comercial de Humanizar Systems, y sí lista productos que tienen tarjeta propia en varios frentes.
- **Escenas de los catálogos (2026-09-26):** el 2026-09-26 se probó un mapa con el nombre de cada ítem; se descartó porque listar lo que hay dentro quita el motivo para entrar. Ahora cada catálogo tiene una escena propia, que continúa la identidad de su sitio y es a la vez el enlace al catálogo (con su rótulo «Entrar al catálogo ↗» encima): código que se escribe y lanza agentes en Daímon, un cosmos griego (sólidos platónicos y constelaciones) en Paideía, ecuaciones que flotan en 3D en Kósmos (una por repositorio) y una ciudad de operación en Humanizar. Cada escena representa lo que reúne sin nombrarlo (un elemento por ítem, con su colección en `data-k`); al pasar por una colección de la leyenda, sus elementos se encienden (`--hl`, `art/_shared.css`). Los títulos de los ítems siguen en `data-search`: el buscador encuentra el catálogo por su contenido.
- **Tarjetas: el emblema manda (2026-09-26):** cada proyecto tiene un emblema animado propio en la cabecera de su tarjeta (16:10), pensado a partir de su sitio: un mini ST que se ejecuta en Ágora (sintaxis real del lenguaje), artículos de ley que se indexan en Nómos, un autómata celular calculado en Phúsis… El texto visible se reduce al antetítulo, el nombre y los enlaces. La descripción sigue en el HTML (`.card-info`): con puntero se abre sobre toda la tarjeta como un portal en cristal que nace del emblema, con el texto apareciendo tras una máscara que se desliza; en táctil la abre «¿Qué es?» como una hoja inferior (`popover` nativo, `@starting-style`), sin JS. Con movimiento reducido, sin portal ni máscara.
- **El arte (`src/components/home/art`):** una pieza por producto, `<id>.tsx` (componente del servidor, raíz `aria-hidden`) y `<id>.css`, con el contrato de `_shared.css`: caja contenedora de tamaño (todo en `cq*`), estados de reposo y activo (`.art-host:hover/:focus-within`), movimiento solo sin `prefers-reduced-motion` y detenido con la pausa del grafo, selectores con ámbito `.art-<id>` en `@layer home`. `scripts/build-art.mts` (en el prebuild) une las hojas en `public/art/art.<hash>.css` (caché inmutable), que `Fronts.tsx` enlaza en el cuerpo, justo antes del catálogo, y precarga desde `<head>` con prioridad baja: Chrome detiene el análisis en un `<link rel=stylesheet>` del cuerpo hasta tenerla, y sin la precarga Lighthouse la contaba como bloqueante (610 ms simulados en móvil). El mismo script pinta el HTML de cada pieza en cada idioma (`generated.ts`); en producción lo inserta `ArtSlot`, un componente cliente de 96 B gz que en el servidor lo lee y en el navegador va vacío (Next fija `typeof window` al compilar, y React no toca el contenido de un `dangerouslySetInnerHTML` al hidratar). Así el arte viaja una sola vez, en el documento: ni la carga RSC lo repite (la home pasó de 72 a 52 KB gz) ni React recorre sus ~1 300 nodos al hidratar. Vale porque a la home solo se llega por documento (sin `next/link`, más abajo); en desarrollo y en las pruebas se pinta la pieza viva, y `tests/components/art.test.ts` vigila que el HTML esté al día. Las cajas llevan `content-visibility: auto`: fuera de pantalla no se pintan ni animan, y sus fuentes no se piden. `scripts/art-harness.mts <id>` fotografía una pieza en su marco (reposo, activa, móvil, movimiento reducido) y comprueba el contrato, los glifos por familia y los presupuestos.
- **Qué está dentro de qué:** `productoDeItem` dice qué ítem de catálogo es además un producto del portafolio (por su sitio o su repositorio, o por `producto` cuando la URL no lo dice: Graf Commerce es el panel de Graf). Esos ítems llevan el nodo hueco y la leyenda «Tiene además su tarjeta en esta página», y su tarjeta dice «También en Humanizar» (o «en Paideía y Kósmos»). La misma regla hace las aristas `agrupa` del grafo 3D (ahora también `humanizar → graf`). Umbral recorre en 3D los mismos 23 repositorios que Kósmos (`vistaDe`): su subtítulo lo dice y la tarjeta de Kósmos la enlaza.
- **Medido con el mapa (2026-09-26, Lighthouse 13.5 en local, mediana de 5):** móvil 99 / LCP 2.01 s / TBT 47 ms / CLS 0 en `/es` y 99 / 1.99 s / 48 ms / 0 en `/en`; escritorio 100 / 0.56 s en los dos. El HTML de `/es` pasa de 34.0 a 39.3 KB gz (los mapas: variables CSS y aristas); la ruta crítica de JS no cambia (132 646 B, margen de 474 B).
- **Tarjetas del frente:** un separador «N proyectos con sitio propio» corta el catálogo de las tarjetas. Su orden es `ordenHome`: primero lo que está en producción o es la pieza central del frente, después las familias de producto juntas (Érgon delante de sus kits Chrónos y Xenía) y al final lo que aún no está en línea; en Ciencias, Umbral va junto a Kósmos. La entradilla de la sección explica la estructura: cada frente abre con su catálogo y sigue con los proyectos que tienen sitio propio.
- **Cifras:** todas se derivan de `incluye` (título de la banda, rótulos y conteos por colección); el copy no lleva ninguna (`tests/content/home.test.ts`, `tests/components/catalogs.test.ts`).
- **Buscador:** el `data-search` de cada tarjeta lleva los títulos de sus ítems y los nombres de sus colecciones; como la tarjeta vive dentro del `data-front` de su frente, `applySearchFilter` la filtra como a cualquier otra sin cambiar su código.
- **Movimiento:** el borde gira y el punto del rótulo late solo con `prefers-reduced-motion: no-preference` y se detienen con la pausa (`html[data-motion='paused']`); el abanico de las hojas también es solo sin movimiento reducido.
- **Sin JS nuevo:** todo es HTML del servidor y CSS. La ruta crítica pasa de 133 078 a 133 079 B (los hashes que lista el runtime de webpack, §5.1).
- **El puntero sobre una tarjeta es contenido:** `.cat` va en `CONTENT` de `GraphStage` (chunk diferido del 3D), así que ni el hover ni un clic en su fondo llegan al grafo. Lo comprueba un e2e del proyecto `3d`, que pone la tarjeta delante de un nodo (falla sin el cambio).
- **Grafo:** cada catálogo pesa 4, como un frente, y se une (`agrupa`) a los productos del portafolio que reúne (`productoDeItem`: los que comparten sitio o repositorio con uno de sus ítems, o los que el ítem nombra en `producto`).
- **Asistente:** `scripts/build-assistant-profile.mts` añade al perfil lo que reúne cada catálogo, con su enlace.

## 5. Presupuestos (verificados en CI local)

| Métrica | Límite |
|---|---|
| JS de la ruta crítica de la home: los scripts pedidos antes del evento `load` (enmienda H1 del Plan 2) | ≤ 130 KB gz = 133 120 B (antes ~200 KB). Con la puerta del grafo (Plan 2, Tarea 4), 132 947 B con webpack (§4.1): margen de 173 B (§5.1). Tras la ronda de fix 1 de la Tarea 5, 132 948 B (margen de 172 B). **Final del Plan 2 (Tarea 6), 132 943 B: margen de 177 B.** Antes de la puerta, 132 462 B. **Con la barra de accesos y la puerta del asistente (2026-09-24), 133 078 B: margen de 42 B** (§5.1). **Con la banda de catálogos (§4.10), 133 079 B: margen de 41 B**, sin JS nuevo; el límite no cambia |
| 3D: chunk de `GraphStage`, worker y sus chunks (lo que la puerta pide después de `load` o con la primera interacción) | ≤ 175 KB gz = 179 200 B. Medido en la Tarea 4 del Plan 2 (ronda de fix 1): 171 534 B con bloom (niveles T2 y T3) y 154 976 B sin él (T1, móvil). Lo mide el e2e `graph3d.spec.ts` (Tarea 5): 171 672 B en 6 archivos con bloom, margen de 7 528 B (+138 B por la mezcla de las aristas de §3.3). Tras el encuadre en retrato (§3.4), 171 754 B, margen de 7 446 B. **Final del Plan 2 (Tarea 6), con el fondo de §3.1: 172 720 B, margen de 6 480 B** (+966 B, el GLSL del fondo y sus inversas en el chunk de la escena, que pasa a 11 431 B); sin `postprocessing` (T1), 156 162 B |
| Datos del grafo | ≤ 60 KB gz |
| LCP | ≤ 2.5 s en laboratorio móvil (Lighthouse, mediana de 5). Antes decía 1.8 s, que era una estimación de la investigación y no un requisito de Steven (ruling de la Tarea 14 del Plan 1, enmienda H2 del Plan 2). Medido: 1.7–1.9 s en móvil y 0.5–0.6 s en escritorio (§5.2). Al cerrar el Plan 2: mediana de 2.18 s en móvil (de 1.80 a 2.47 s por corrida) y 0.48 s en escritorio (§5.3) |
| TBT | ≤ 100 ms. Al cerrar el Plan 2: medianas de 6.5 y 8.5 ms en móvil (hasta 11 ms por corrida) y 0 en escritorio, también con la escena 3D en marcha (§5.3) |
| CLS | ≤ 0.02. Al cerrar el Plan 2: 0.0002 como mucho |
| Errores de consola | 0. Al cerrar el Plan 2: 0 en las corridas de Lighthouse (póster y 3D) y en el e2e, también en el proyecto `3d` |
| Violaciones de CSP | 0 |

- La home no usa `next/link`, y tampoco el 404 de `[locale]`, que viaja en el árbol RSC de cada página: su módulo cliente cuesta ~3.5 KB gz.
- Peso de la home en `/es` tras la ronda 2 de la Tarea 14: HTML de 31.8 KB gz (antes 43.9), fuentes de 58 KB (antes 184) y 251 KB transferidos en total. Todo lo que se descarga antes del LCP observado cuenta en el LCP simulado (§5.2).

### 5.1 Margen del presupuesto de JS

- **Qué cuenta (enmienda H1 del Plan 2):** los scripts pedidos antes del evento `load`. El e2e lo decide con el Resource Timing de la página, por URL y sin filtrar por `initiatorType` (el runtime de webpack llega por `<link rel="preload">`); un script sin entrada cuenta como crítico. El e2e también exige que la puerta pida algo después de `load` e imprime lo que queda fuera.
- **Medido con la puerta del grafo (Plan 2, Tarea 4):** 132 947 B de 133 120 B. Quedan **173 B, el 0.13 %** (132 944 B antes de recortar `postprocessing`: el runtime de webpack lista el hash de cada chunk, y al cambiar los del 3D cambia unos bytes, el ruido que se describe abajo). La puerta añade 300 B al chunk de la página (995 B frente a 695) y el runtime de webpack crece unos 180 B, porque lista los chunks nuevos del 3D (el de `GraphStage`, el del worker, los dos de three, el de `GraphScene` y el de `postprocessing`). Después de `load` se pide el chunk de `GraphStage`, 5 510 B (5 101 B antes de `launchScene`, que llegó en la ronda de fix 1 sin mover la ruta crítica), que va al presupuesto del 3D. Tras la ronda de fix 1 de la Tarea 5, 132 948 B (margen de 172 B): el encuadre en retrato (§3.4) cambia el chunk de la escena y, con él, el hash que lista el runtime. El chunk de `GraphStage` pasa a 5 549 B: también lleva `choreography.ts`, porque `useSectionProgress` la importa (para `SECTIONS`). En la Tarea 6, 132 943 B (margen de 177 B) y el chunk de `GraphStage`, 5 550 B: el fondo nuevo (§3.1) solo cambia el chunk de la escena, cuyo hash lista el runtime (de 132 948 a 132 943 B en los builds de la tarea).
- **Medido en el fix de la revisión final** (gzip nivel 6 de cada script, igual que el e2e): 132 462 B de 133 120 B, con 658 B de margen. En la Tarea 14 eran 132 501 B (ronda 2) y 132 505 B (ronda 1): el chunk del layout bajó 41 B al quitar los objetos de `next/font/google`. El script inline del menú móvil no cuenta: no es una respuesta de tipo script.
- **Medido con la barra de accesos y el asistente «Pregúntame» (2026-09-24):** 133 078 B de 133 120 B. Quedan **42 B**. La puerta del asistente (`AssistantGate`: un listener de clic delegado en `document` que hace `import('./AssistantPanel')`) suma 230 B al chunk de la página (1 225 B) y el runtime lista un chunk más. Los botones `[data-ask]` son HTML del servidor, y el panel, con su CSS y su copy, se pide con el primer clic. Dos cosas que se probaron y no cabían:
  - **Un `.css` importado desde el chunk diferido** (`import './assistant.css'` en el panel): webpack mete entonces en su runtime el cargador de hojas de mini-css-extract (`miniCssF` y la carga de `<link>`), unos 430 B gz de la ruta crítica; con él, 133 602 B (482 B por encima). El CSS del panel va como texto en `src/components/assistant/styles.ts` y el panel lo pinta en un `<style>`.
  - **Precargar el panel al pasar el puntero o el foco** por el botón: 78 B más (133 156 B, 36 B por encima). El panel pesa pocos KB y llega con el clic.
  - Con 42 B de margen, la puerta no admite más código: lo nuevo del asistente va en el panel.
  - Lighthouse móvil de `/es` con este build, una corrida: 97, LCP 2.40 s, TBT 9.5 ms y 100 / 100 / 100, dentro del rango por corrida de §5.3 (97–100, LCP de 1.80 a 2.47 s).
- **Medido con la banda de catálogos (§4.10, 2026-09-24):** 133 079 B de 133 120 B, margen de 41 B. La banda es HTML del servidor y CSS; la diferencia (de 133 077 a 133 081 B entre los builds de la tarea) viene de los hashes de chunk que lista el runtime de webpack: el chunk de `GraphStage` importa `GRAPH_ASSET`, cuyo hash cambia con el grafo nuevo. Después de `load`, 5 476 B (chunk de `GraphStage`, con los selectores de `CONTENT`); el 3D, 172 528 B (margen de 6 672 B).
- **El framework ocupa el 98.8 %** (medido antes de la puerta del grafo): el runtime de Next, React DOM, el runtime de webpack y `main-app` suman 130 867 B. El código propio de la home eran 1 595 B: el chunk del layout de `[locale]` (cargador de GA y objetos de `next/font` del layout raíz, 900 B) y el de la página (`ProductSearch`, 695 B). No queda código propio cuyo recorte dé un margen real.
- **Ruido de 2 a 3 B por build:** el runtime de webpack lista los ids de los chunks que solo llevan CSS, y esos ids cambian al añadir o quitar módulos. Las fuentes de la home añadieron uno y el runtime creció 3 B. `ProductSearch` sin `useId` ni input controlado compensó 6 B.
- **No hay otro bundler de reserva:** con Turbopack, solo el framework ya pesa 134 143 B (§4.1).
- **Reglas mientras el margen siga así:**
  - Cualquier cambio que añada código cliente a la home, o que suba `next`, `react` o `react-dom`, puede pasarse del límite aunque no haya una regresión propia. Antes de fusionarlo, se vuelve a medir con `npm run build && npm run e2e`. El test imprime el total y el margen.
  - Si el test falla, se recorta o se aplaza el código cliente nuevo. El límite no se sube en el test: cambiarlo lo decide Steven, y se cambia en esta tabla.
  - El Plan 2 monta en la home la isla del grafo. Con `next/dynamic` (`ssr: false`), su chunk y el de `GraphStage` se descargarían tras la hidratación aunque el 3D no llegara a arrancar, y con 658 B no cabían. La enmienda H1 del Plan 2 lo resuelve así: `GraphStageLazy` es una puerta mínima que solo hace `import('./GraphStage')` tras la primera interacción o el idle después de `load`; este presupuesto cuenta los scripts pedidos antes de `load`, y `GraphStage` y el worker van al presupuesto del 3D (≤ 175 KB gz). Implementado y medido en la Tarea 4 del Plan 2 (arriba). Con 173 B de margen, la puerta no admite más código: lo nuevo del 3D va en `GraphStage` o en el worker.
  - Coste si la decisión es errónea: JS diferido que Lighthouse todavía ve como TBT. Lo mide la Tarea 6 del Plan 2. **Medido:** no suma TBT, ni en la ruta del póster ni con la escena en marcha (§5.3).
- **Presupuesto del 3D:** GraphScene importa `postprocessing` destructurando en la propia sentencia del `import()`, para que webpack lo recorte a lo que usa (16.6 KB gz frente a 112.8 KB entero; con él entero, el 3D pasaba de 260 KB). Three va en dos chunks (51.5 y 84.8 KB gz) que comparten el worker y el fallback en el hilo principal. El fallback también destructura el `import()` de `GraphScene`: con el namespace entero, webpack dejaba de compartir con el worker el chunk de la escena (10.3 KB gz) y metía en el worker una copia propia. El worker es clásico: webpack reescribe `{ type: 'module' }` a `undefined` y carga sus chunks con `importScripts`.

### 5.2 Lighthouse en móvil: resuelto en la Tarea 14 (ronda 2)

**Resultado final** (2026-09-24, `npm run lighthouse`, mediana de 5 corridas, host con carga media de 58 a 71 sobre 32 núcleos):

| | Performance | LCP | TBT | CLS | A11y / BP / SEO |
|---|---|---|---|---|---|
| `/es` móvil | 99 | 1.81 s | 73 ms | 0.0002 | 100 / 100 / 100 |
| `/en` móvil | 99 | 1.74 s | 67 ms | 0.0001 | 100 / 100 / 100 |
| `/es` escritorio | 100 | 0.56 s | 0 ms | 0.0001 | 100 / 100 / 100 |
| `/en` escritorio | 100 | 0.56 s | 0 ms | 0.0000 | 100 / 100 / 100 |

- Una segunda tanda completa dio lo mismo: 99 / 1.74 s / 56 ms en `/es` y 99 / 1.91 s / 42 ms en `/en`, con escritorio en 100.
- **Tras el fix de la revisión final** (`npm run lighthouse`, mediana de 5, carga media del host de 18 a 23): `/es` móvil 98 / 2.18 s / 40 ms, `/en` móvil 100 / 1.73 s / 31 ms y escritorio 100 / 0.49 s / 0 ms en los dos; A11y, BP y SEO, 100; CLS ≤ 0.0002. El LCP de `/es` sigue en la carrera de las fuentes sin precarga que describe «Límites que quedan»: en 3 de las 5 corridas terminaron 1–2 ms antes del LCP observado y entraron en el grafo (2.18 s); en las otras 2, justo después (1.81 y 1.96 s).
- **Un script inline clásico en la barra empeora el LCP simulado.** La primera versión del script del menú móvil (§4.8) bloqueaba el parser hasta que llegaba el CSS: Chrome pintaba antes la barra sola (FCP ≈ 50 ms, LCP ≈ 100 ms) y la descarga de `geist-home` y `jetbrains-home` entraba siempre en el grafo del LCP. Resultado: 97 / 2.49 s en `/es` y 97 / 2.52 s en `/en`. Como `type="module"` (diferido) vuelve FCP = LCP. Todo script que se añada antes del h1 tiene que ser diferido.
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
- **Margen de JS para el Plan 2:** 658 B. La isla del grafo no cabe montada con `next/dynamic`; el Plan 2 la monta con la puerta de la enmienda H1 (§5.1), y el margen queda en 173 B. Al cerrar el Plan 2 (Tarea 6), 177 B.

### 5.3 Lighthouse final con el 3D integrado (Tarea 6 del Plan 2)

**Resultado final** (2026-09-24, `npm run lighthouse` sobre el build final, mediana de 5 corridas, Chrome 149, carga media del host de 60 bajando a 9 sobre 32 núcleos: el e2e acababa de terminar):

| | Performance | LCP | TBT | CLS | A11y / BP / SEO |
|---|---|---|---|---|---|
| `/es` móvil | 98 | 2.18 s | 8.5 ms | 0.0002 | 100 / 100 / 100 |
| `/en` móvil | 98 | 2.18 s | 6.5 ms | 0.0001 | 100 / 100 / 100 |
| `/es` escritorio | 100 | 0.48 s | 0 ms | 0.0001 | 100 / 100 / 100 |
| `/en` escritorio | 100 | 0.48 s | 0 ms | 0.0000 | 100 / 100 / 100 |

- Por corrida, en móvil: Performance de 97 a 100, LCP de 1.80 a 2.47 s y TBT de 4 a 11 ms. Escritorio, 100 en todas. A11y, BP y SEO, 100 en las 20 corridas, sin errores de consola.
- Dos tandas previas de la misma tarea, sobre builds anteriores (la ruta crítica solo cambia en el hash del chunk de la escena que lista el runtime, unos bytes): 98 / 2.18 s en `/es` y 97 / 2.46 s en `/en`; después, 98 / 2.18 s y 100 / 1.80 s. Escritorio, 100 en todas. Contando esas tandas y la mitad del A/B de abajo (40 corridas de móvil del Plan 2), la peor Performance fue 97 y el peor LCP, 2.47 s.
- Se cumplen los objetivos de §1 y §5 sin tocarlos: Performance ≥ 95 en móvil y ≥ 98 en escritorio, LCP ≤ 2.5 s, TBT ≤ 100 ms y CLS ≤ 0.02.

**Frente al Plan 1 cerrado.** La Tarea 4 midió 100 / 1.81 s en móvil, y esta tarea, 98 / 2.18 s. Para saber si la diferencia venía del código, se hizo un A/B intercalado en móvil (5 + 5 corridas por idioma, a la vez y en el mismo host) entre el Plan 1 cerrado (`b434b7c`, sin el 3D) y el Plan 2 (`9b687ff`):

| | Plan 1 (`b434b7c`) | Plan 2 (`9b687ff`) |
|---|---|---|
| `/es` móvil | 98 / 2.18 s / 5.5 ms | 98 / 2.18 s / 5 ms |
| `/en` móvil | 98 / 2.18 s / 5 ms | 98 / 2.18 s / 5.5 ms |

- Las corridas caen en tres escalones, en las dos versiones: 1.73–1.80 s (FCP de 1.05 s), 2.18 s (FCP de 1.65 s) y 2.46–2.47 s (FCP de 1.65 s). Los dos primeros son el FCP bimodal de «Límites que quedan» (§5.2). El tercero no lo investigué: sale igual sin el 3D.
- La Tarea 4 midió con el host más cargado (carga de 20 a 26, frente a 6–9 aquí). Que eso cambie cuánto sale cada escalón es una hipótesis que no comprobé.

**Qué hace el 3D con el TBT** (el coste que la enmienda H1 dejaba por medir):
- **Ruta del póster** (la de Lighthouse sin `?gl`). La puerta pide el chunk de `GraphStage` (5 550 B) justo después de `load`. En la traza (`--save-assets`, sin ralentizar la CPU):
  - el chunk se evalúa en 0.6 ms;
  - la sonda ocupa una tarea de 4.1 ms en su `requestIdleCallback`: crea un contexto WebGL2 (el Chrome de Lighthouse lo tiene por SwiftShader), lee el renderer y lo libera; como es software, dice que no y se queda el póster.
  - Ni con la ralentización ×4 de móvil llegan a los 50 ms de una tarea larga. Las únicas tareas largas de la simulación son la evaluación del framework (55–66 ms) y el análisis del HTML, igual que en el Plan 1, y el TBT es el mismo que sin el 3D (A/B de arriba).
- **Ruta 3D** (`?gl=force`: el mismo Chrome, con la escena en marcha en el worker; Lighthouse descarga el worker, three y, en escritorio, `postprocessing`, y su captura final muestra el grafo 3D). Mediana de 5 por fila:

  | | Performance | LCP | TBT | CLS | A11y / BP / SEO |
  |---|---|---|---|---|---|
  | `/es` móvil (T1) | 100 | 1.80 s | 5.5 ms | 0.0002 | 100 / 100 / 100 |
  | `/en` móvil (T1) | 98 | 2.18 s | 5 ms | 0.0001 | 100 / 100 / 100 |
  | `/es` escritorio (T3) | 100 | 0.48 s | 0 ms | 0.0001 | 100 / 100 / 100 |
  | `/en` escritorio (T3) | 100 | 0.54 s | 0 ms | 0.0000 | 100 / 100 / 100 |

  El TBT no cambia: la escena corre en el worker, y en el hilo principal solo quedan la puerta, `GraphStage`, la prueba del OffscreenCanvas, la transferencia del canvas y el puente de eventos. Sin errores de consola en las 20 corridas. Se midió con el fondo de §3.1 ya ajustado.
- **No lo probé:** una GPU real (el host no expone la suya a Chrome sin interfaz: con `--use-angle=gl` o `vulkan` no hay contexto), donde crear el contexto de la sonda puede costar más; el fallback en el hilo principal (Safari 16.4, `?worker=off`), donde three compila y pinta en el hilo principal y sí habría TBT, y T2.

## 6. Pruebas

1. **Unitarias (vitest, escritas antes que el código):**
   - Construcción del modelo: nodos y aristas válidos, sin ids colgantes, cada producto con frente.
   - Determinismo del artefacto: misma entrada ⇒ mismos bytes.
   - Invariantes de cada layout: normalización, L2 ordenado por año, L3 con 4 clusters, L4 sobre la lemniscata.
   - Codificación y decodificación del binario.
   - Proxy: redirecciones, pesos q de `Accept-Language` y matcher (revisión final).
   - `DATA_DATE` en clones superficiales (revisión final).
   - Cobertura de glifos del contenido de la home frente a sus subconjuntos (revisión final, §3.2).
   - Sonda de GPU (con mocks).
   - Regulador de calidad.
   - **Plan 2**, sin GPU:
     - runtime: protocolo y `dispatch` (una aserción por mensaje), buzón, `launchScene` (worker, fallback, relevo y fallos), cargador, sonda (también `offscreenWebGL2`) y regulador con reloj simulado;
     - escena: `GraphScene` con un doble de `WebGLRenderer` (arranque, compositor, `autoClear`, mezcla de las aristas, fondo, niveles, `dispose`, bucle y precompilación), datos de GPU, coreografía (también el encuadre en retrato), amortiguación, índice de la cinta (extrusión en CPU) y shaders (atributos, palabras reservadas, niebla y respiración);
     - fondo (`background.test.ts`, Tarea 6): el halo contra `home.css`, el ACES contra el chunk de three y la viñeta contra el shader de `postprocessing`, y que las inversas deshacen los dos;
     - worker con la escena simulada, la puerta (`GraphStageLazy`) y el progreso de scroll.
2. **E2E (Playwright, Chrome):**
   - `/es` y `/en`:
     - un solo h1;
     - `lang` correcto;
     - canonical y hreflang con www;
     - JSON-LD parseable con los tipos esperados;
     - cero errores de consola;
     - póster cargado desde su archivo con hash, y el LCP en el h1;
     - fuentes: solo los subconjuntos de la home, una precarga (la del h1) y cada carácter con glifo en su familia;
     - botón de pausa operable (Plan 2);
     - navegación por teclado a nodos (Plan 2);
     - ningún texto pequeño sobre el escenario sin scrim (§3.1);
     - enlaces internos 200.
   - `/{es,en}/{frente}` y `/{es,en}/lore` siguen renderizando, sin errores ni violaciones de CSP.
   - GA cargado tras una interacción, sin violaciones de CSP (§4.1).
   - **Ningún e2e manda hits reales a la propiedad de GA.** Todos importan `test` de `e2e/fixtures.ts`, que en cada contexto del navegador:
     - responde con 204 las peticiones a los hosts de medición (`*.google-analytics.com`, `*.analytics.google.com`, `*.doubleclick.net`, `google.*` como `www.google.com/g/collect`, Ads y el resto de `googletagmanager.com`);
     - sirve `gtag.js` con un stub vacío, sin red. Solo el test de GA pide el real (`test.use({ realGtag: true })`), con la medición igualmente en 204, y hace *skip* razonado si `gtag.js` no es alcanzable (salvo que lo bloquee la CSP, que es un fallo). Bajo la CSP, Chromium bloquea antes de la capa de red, así que la ruta no tapa una violación;
     - comprueba al final, con un listener de requests, que ninguna petición a esos hosts salió sin pasar por la ruta;
     - antes de cerrar, silencia a Google en cada página: las balizas keepalive que gtag manda al descargarse (pagehide) no pasan por las rutas de Playwright ni emiten `request`. Medido con un proxy y el NetLog de Chrome: al navegar a `about:blank`, la de GA llegaba a `www.google-analytics.com`, y al cerrar el contexto, la de diagnóstico (`googletagmanager.com/td`) llegó a enviar cabeceras. El fixture activa el opt-out de GA (`window['ga-disable-G-E5NMYWLXER'] = true`), marca la página para que un script de inicio (que envuelve `fetch` y `sendBeacon` antes de que cargue gtag) descarte lo que vaya a Google, y deja un `window.gtag` vacío para que el respaldo de 5 s de `Analytics.tsx` no pida `gtag.js` durante el cierre.
   - Medido con el NetLog de Chrome y un proxy que registra las conexiones, en todo el e2e: ninguna petición de la página a un host de medición llega a la red, y la única que sale a Google es el `gtag.js` real del test de GA. Con los e2e de antes del fixture salían 15 `POST /g/collect` con `tid=G-E5NMYWLXER` en una corrida (el proxy de la medición los rechazó).
   - Además, `playwright.config.ts` lanza Chrome con `--host-resolver-rules` que dejan sin DNS esos hosts (no `googletagmanager.com`), por si algo más escapara a las rutas.
   - Proxy: `/` según `Accept-Language` y conservando la query; sitemap y robots sin redirigir.
   - Menú móvil: landmark, y se cierra al elegir sección y con Escape (§4.8).
   - 404 bilingües.
   - Capturas a 390, 834 y 1440 px.
   - **Grafo 3D (Plan 2, Tarea 5):** el proyecto `3d` de Playwright lanza Chrome con WebGL por SwiftShader (`--use-angle=swiftshader`) y solo ejecuta `e2e/graph3d.spec.ts`; los demás proyectos lo ignoran. Comprueba:
     - que la escena arranca en el worker, pinta y se anima, y que el fallback (`?worker=off`) pinta en el hilo principal;
     - el hover con su ficha, la pausa (la escena se queda quieta y la preferencia persiste al recargar), el foco de teclado en un producto (mueve la cámara con la escena en pausa y sin desplazar la página) y el movimiento reducido (póster y «Explorar en 3D», que arranca en pausa);
     - el recorrido por las cinco secciones con la animación en marcha (morph, pulsos y regulador de calidad), sin errores y con la escena viva al final;
     - una captura de la página por forma, cada una en su test, cuando la cámara llega a su pose (en pausa);
     - el presupuesto del 3D (§5), con el mismo Resource Timing que el de la ruta crítica;
     - por píxeles, en las seis poses y en T3 (1440 × 900) y T1 (390 × 844), que las aristas se ven en la escena real, que las semánticas y las decorativas se ven en reposo (sin pulsos) y que las decorativas son filamentos y no puntos, que ninguna zona se quema a blanco (la mayor región de blanco puro, ≤ 200 px; §3.3) y, salvo en Frentes, que la forma cabe entera (las aristas semánticas en reposo, al menos a un 3 % del lado de cada borde; §3.4). Para eso envuelve WebGL2 desde un script de inicio: omite capas y anula los pulsos sin tocar el código del sitio. Solo ve el hilo principal, así que esta parte usa el fallback, con la misma escena y los mismos shaders que el worker.
     - En pausa, la espera hasta que la cámara llega a su pose no es un tiempo fijo: en SwiftShader un frame tarda cientos de ms (más con la suite en paralelo) y avanza como mucho 50 ms del reloj de la escena. Con el fallback cuenta fotogramas del navegador sin pintar; con el worker, espera a que el escenario lleve 3 s sin cambiar.
     - Cada espera se acota a lo que le queda al test (menos 15 s): si falla, su mensaje sale antes que el timeout del test. El proyecto `3d` corre con 6 workers: con los 16 por defecto, SwiftShader saturaba el host (carga de más de 140 en 32 núcleos) y un test llegaba a 1.9 min de sus 3; con 6, el más lento de la suite completa tarda 1 min.
     - Cero errores de consola y de CSP. El aviso `KHR_parallel_shader_compile extension not supported` de SwiftShader es un `warning`, no un error, y no cuenta.
     - **Fondo del canvas (Tarea 6):** en T3 y T1, en el hero, en pausa y sin las capas del grafo, el canvas se compara píxel a píxel con la página sin el póster (`?gl=off` y la imagen oculta): ningún canal se aparta más de 4 niveles (§3.1). Con el fondo de antes, 39 y 49.
3. **Lighthouse:**
   - Móvil y escritorio, `/es` y `/en`, mediana de 5 corridas.
   - Ruta del póster (sin GPU) y ruta 3D (Chrome con GPU por SwiftShader forzada) documentadas por separado.
   - **Tarea 6 del Plan 2:** las dos, en §5.3. La ruta 3D se mide con `?gl=force`: el Chrome de Lighthouse ya crea el contexto WebGL2 por SwiftShader, sin opciones, pero la sonda lo rechaza por ser software.
   - Caché de npm y `TMPDIR` en `/workspace`: el disco raíz del host está lleno.
4. **Revisión adversarial multiagente** (código, rendimiento, a11y, SEO) antes de la preview.

## 7. Publicación

- Commits por fase en `redesign/home-grafo`.
- **Push a GitHub** para la preview de Vercel: solo con confirmación explícita de Steven.
- **Merge a `main`** (producción): solo con su OK explícito tras revisar la preview.

## 8. Riesgos

| Riesgo | Mitigación |
|---|---|
| OffscreenCanvas y WebGL en Safari < 17 | Fallback al hilo principal con `compileAsync`: sin WebGL2 en el OffscreenCanvas (`offscreenWebGL2`) ni siquiera se crea el worker, y un worker que falla antes de `ready` pasa el relevo al hilo principal en vez de dejar el póster (§4.4, paso 3). |
| Workers con `new URL(..., import.meta.url)` en el build de producción | El build ya es webpack 5 (`next build --webpack`, §4.1), que los emite como chunk propio; lo valida el e2e del Plan 2 (Tarea 5). `next dev` sigue con Turbopack: si ahí el worker no arranca, lo cubre el fallback en el hilo principal. |
| Compatibilidad `postprocessing` ↔ three | Versiones fijadas exactas. |
| El fondo del canvas deja de coincidir con la página (§3.1) si cambia el halo de `home.css`, el ACES de three o la viñeta de `postprocessing` | `background.test.ts` lee los tres (el CSS, el chunk de three y el shader de la viñeta) y falla si no coinciden con `background.ts`; el e2e del fondo lo mide en el navegador. |
| Presupuesto de JS de la home sin margen (173 B con la puerta del grafo, §5.1) | El e2e lo mide en cada build y se vuelve a medir antes de fusionar. El Plan 2 monta `GraphStage` detrás de la puerta mínima de su enmienda H1: lo nuevo del 3D va en `GraphStage` o en el worker, no en la puerta. |
| El 3D no aparece en Lighthouse | Es intencional: el laboratorio mide la ruta del póster. No hay RUM propio: Vercel Speed Insights no cabe en el presupuesto de JS (su script contaría en §5.1), así que no se instala. El dato de campo sale de CrUX, PageSpeed Insights y el informe de Core Web Vitals de Search Console; el 3D, además, con pruebas manuales en GPU real. La Tarea 6 del Plan 2 midió también la ruta 3D con `?gl=force` (§5.3): mismas cifras que la del póster. Sigue sin probarse en una GPU real. |
| Disco raíz del host lleno | Todo lo pesado va a `/workspace`. |
| Contenido nuevo con un carácter que no está en los subconjuntos de fuente de la home o del portal | En la home, `npm test` falla (`tests/content/fonts.test.ts` recorre el texto de la home en ES y EN) y el e2e de glifos también; en el portal, el e2e de las subpáginas. Los dos nombran el archivo y el carácter. Se añade en `scripts/subset-fonts.sh` y se regenera (hace falta Python con fonttools y brotli); si la fuente de origen no lo tiene, se añade a las excepciones del test. |
| Google Fonts responde a veces con URLs sin extensión (`/l/font?kit=…`) para Cormorant pedida con pesos sueltos, y `next/font` 16.3.6 aborta el build (`Cannot read properties of null (reading '1')`) | Resuelto en el fix de la revisión final: ninguna fuente usa ya `next/font/google` (§3.2), así que el build no depende de Google Fonts. Se vio en 2 de unos 15 builds limpios y en 1 de 3 con Node 20; tras el cambio, 5 builds limpios seguidos con Node 20 y `npm ci`, los 5 verdes. |
