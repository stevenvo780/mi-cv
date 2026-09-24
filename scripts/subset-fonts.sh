#!/usr/bin/env bash
# Regenera las fuentes auto-alojadas de src/app/fonts:
#   1. Los subconjuntos de la home (*-home*.woff2 y cormorant-hero.woff2), que carga [locale]/(home)/fonts.ts.
#   2. Las fuentes del layout raíz (*-latin.woff2), que usan el portal y el 404 de [locale].
#
# 1. Home. Por qué existen (spec §3.2 y §5.2): el LCP de laboratorio móvil cuenta todos los bytes que llegan antes
# del h1, y las fuentes de Google completas pesaban 184 KB. Cada archivo lleva solo los pesos que usa la home y
# los caracteres que pinta con esa familia, así que si el contenido añade un carácter nuevo hay que añadirlo
# aquí y volver a ejecutar el script. Lo detectan `npm test` (tests/content/fonts.test.ts recorre el texto de la
# home en ES y EN) y el e2e "tiene cada carácter en el subconjunto de su familia", que además mira la familia.
#
# 2. Layout raíz. Cormorant, JetBrains Mono e Inter sustituyen a next/font/google, que falla en algunos builds
# limpios (spec §8). Son las mismas fuentes que servía Google Fonts con subsets: ['latin']: variables, con el rango
# unicode "latin" de Google, sus mismas features y sin hinting; contornos, métricas y features coinciden con los
# archivos de Google (comprobado con fontTools). Además del rango latin llevan los caracteres que el portal pinta con
# esa familia y que la fuente tiene (flechas, «ḗ», símbolos de las fichas): los vigila el e2e de las subpáginas, que
# recorre el texto de cada frente y de lore. Geist (geist-sans-latin) es la del 404 de [locale].
#
# Requisitos: python3 con fonttools 4.63.0 y brotli (p. ej. `python3 -m venv v && v/bin/pip install
# fonttools==4.63.0 brotli`; exporta PY=v/bin/python). Red para descargar los TTF de google/fonts.
# Uso: bash scripts/subset-fonts.sh
#
# Fuentes de origen (licencia SIL OFL 1.1, sin nombres reservados, con su texto en src/app/fonts/OFL-<familia>.txt;
# mismas versiones que sirve Google Fonts):
#   - Cormorant Garamond 4.001, JetBrains Mono 2.211 e Inter 4.001: github.com/google/fonts en el commit fijado abajo.
#   - Geist 1.800: node_modules/geist@1.7.2.
# Todos los archivos conservan la tabla name entera (--name-IDs='*'; por defecto fontTools solo deja los IDs 0–6), así
# que el aviso de la licencia (nameID 13) y su URL (14) viajan dentro de cada woff2. Cuesta de 76 a 336 B por archivo.
set -euo pipefail
cd "$(dirname "$0")/.."

PY=${PY:-python3}
# Fecha fija en head.modified (fontTools respeta SOURCE_DATE_EPOCH): misma entrada, mismos bytes.
export SOURCE_DATE_EPOCH=1767225600
GF_COMMIT=b5efa9c32e8f9b63005f5cdb1ad5527a77d2cd04
GF=https://raw.githubusercontent.com/google/fonts/$GF_COMMIT/ofl
OUT=src/app/fonts
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

curl -sSfL -o "$TMP/cg.ttf" "$GF/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf"
curl -sSfL -o "$TMP/cgi.ttf" "$GF/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf"
curl -sSfL -o "$TMP/jb.ttf" "$GF/jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf"
curl -sSfL -o "$TMP/inter.ttf" "$GF/inter/Inter%5Bopsz,wght%5D.ttf"
cp node_modules/geist/dist/fonts/geist-sans/Geist-Variable.ttf "$TMP/geist.ttf"

# El texto de la licencia de cada familia va junto a sus archivos (OFL 1.1, condición 2), del mismo origen fijado.
curl -sSfL -o "$OUT/OFL-cormorant-garamond.txt" "$GF/cormorantgaramond/OFL.txt"
curl -sSfL -o "$OUT/OFL-jetbrains-mono.txt" "$GF/jetbrainsmono/OFL.txt"
curl -sSfL -o "$OUT/OFL-inter.txt" "$GF/inter/OFL.txt"
cp node_modules/geist/LICENSE.txt "$OUT/OFL-geist.txt"

# ── 1. Home ──

# Pesos que usa home.css: Cormorant 400 y 500 (sin cursiva), JetBrains 400 y 500, Geist 400 a 600.
$PY -m fontTools.varLib.instancer "$TMP/cg.ttf" wght=500 -q -o "$TMP/cg-500.ttf"
$PY -m fontTools.varLib.instancer "$TMP/cg.ttf" wght=400:500 -q -o "$TMP/cg-400-500.ttf"
$PY -m fontTools.varLib.instancer "$TMP/jb.ttf" wght=400:500 -q -o "$TMP/jb-400-500.ttf"
$PY -m fontTools.varLib.instancer "$TMP/geist.ttf" wght=400:600 -q -o "$TMP/geist-400-600.ttf"

# Solo las features que el navegador aplica por defecto (más lnum y tnum, que pide .figure dd): las demás
# (versalitas, fracciones, alternativas) arrastraban cientos de glifos que la home nunca pinta.
ON=ccmp,locl,mark,mkmk,kern,liga,calt,clig,rlig,rvrn,rclt,curs
ES='¡¿ÁÉÍÓÚÜÑáéíóúüñ'
ASCII=$(printf '%s' ' !"#$%&'"'"'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~')
ALNUM='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '

subset() { # <entrada> <salida> <texto> [features extra]
  $PY -m fontTools.subset "$1" --flavor=woff2 --text="$3" --layout-features="$ON${4:+,$4}" --name-IDs='*' \
    --output-file="$OUT/$2" 2>/dev/null
  printf '%-40s %6d B\n' "$2" "$(wc -c < "$OUT/$2")"
}

# El h1 (elemento LCP): solo los glifos del nombre, peso 500. Se precarga. Si cambia el nombre en
# src/content/home.ts, cambia aquí (lo comprueba tests/content/fonts.test.ts).
subset "$TMP/cg-500.ttf" cormorant-hero.woff2 'Steven Vallejo Ortiz'
# Texto corrido (descripciones, datos): ASCII imprimible + español + la tipografía de la home.
subset "$TMP/geist-400-600.ttf" geist-home.woff2 "$ASCII$ES«»·§–—‘’“”…→↗"
# Titulares, nombres de producto y cifras. (Cormorant no tiene «ḗ»: la pinta la serif del sistema, como siempre.)
subset "$TMP/cg-400-500.ttf" cormorant-home.woff2 "$ASCII$ES·îÎ–—‘’“”…" lnum,tnum
# Etiquetas, fechas y chips del stack: sin la puntuación ASCII que no usan (sus ligaduras de código pesan). Sin «→»:
# el subconjunto latin de Google no lo trae, así que la home siempre lo pintó con la mono del sistema. «▶» es el del
# botón de pausa del grafo cuando está pausado; su «❚❚» no está en ninguna de las fuentes de origen (la del sistema).
subset "$TMP/jb-400-500.ttf" jetbrains-home.woff2 "$ALNUM$ES#&()+,-./:~_'§·—Î▶"

# ── 2. Layout raíz (portal y 404 de [locale]) ──

# Rango "latin" de Google Fonts, el mismo que declaraba next/font/google con subsets: ['latin'].
LATIN='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD'
# Las features que conserva Google Fonts en esas fuentes (sin versalitas, alternativas estilísticas ni onum).
GF_FEATURES=ccmp,locl,mark,mkmk,kern,liga,calt,clig,rlig,rvrn,rclt,curs,frac,numr,dnom,lnum,pnum,tnum

latin() { # <entrada> <salida> [unicodes que pinta el portal, además del rango latin]
  $PY -m fontTools.subset "$1" --flavor=woff2 --unicodes="$LATIN${3:+,$3}" --layout-features="$GF_FEATURES" --no-hinting \
    --name-IDs='*' --output-file="$OUT/$2" 2>/dev/null
  printf '%-40s %6d B\n' "$2" "$(wc -c < "$OUT/$2")"
}

# Google sirve Inter solo con el eje wght (opsz fijado en su valor por defecto, 14) cuando se pide wght@100..900.
$PY -m fontTools.varLib.instancer "$TMP/inter.ttf" opsz=14 -q -o "$TMP/inter-14.ttf"
# Cormorant: Ω y ∞ de las fichas de símbolo. No tiene ε, Π, ◎ ni «ḗ», y los demás símbolos no están en ninguna fuente.
# Su ◇ sí existe, pero es un rombo de texto diminuto al lado de los demás símbolos: se queda en la fuente del sistema.
latin "$TMP/cg.ttf" cormorant-garamond-latin.woff2 'U+03A9,U+221E'
latin "$TMP/cgi.ttf" cormorant-garamond-italic-latin.woff2
# JetBrains Mono: ← (volver a la home) y ↗ (enlaces en vivo). No tiene «ḗ» ni «Ḗ» (Pinakothḗke en versalitas).
latin "$TMP/jb.ttf" jetbrains-mono-latin.woff2 'U+2190,U+2197'
# Inter: «ḗ» (Pinakothḗke, Apothḗke, Scholḗ), → de las descripciones y ↗.
latin "$TMP/inter-14.ttf" inter-latin.woff2 'U+1E17,U+2192,U+2197'

# Geist (geist@1.7.2, variable), del 404 de [locale]: rango latin más «ḗ» y las flechas, con todas sus features.
$PY -m fontTools.subset "$TMP/geist.ttf" --flavor=woff2 --layout-features='*' --name-IDs='*' \
  --unicodes='U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+1E17,U+2000-206F,U+20AC,U+2122,U+2190-2193,U+2197,U+2212,U+2215,U+FEFF,U+FFFD' \
  --output-file="$OUT/geist-sans-latin.woff2" 2>/dev/null
printf '%-40s %6d B\n' geist-sans-latin.woff2 "$(wc -c < "$OUT/geist-sans-latin.woff2")"
