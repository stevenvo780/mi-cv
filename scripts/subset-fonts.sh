#!/usr/bin/env bash
# Regenera los subconjuntos de fuentes de la home (src/app/fonts/*-home*.woff2 y cormorant-hero.woff2).
#
# Por qué existen (spec §3.2 y §5.2): el LCP de laboratorio móvil cuenta todos los bytes que llegan antes del
# h1, y las fuentes de Google completas pesaban 184 KB. Cada archivo lleva solo los pesos que usa la home y
# los caracteres que pinta con esa familia, así que si el contenido añade un carácter nuevo hay que añadirlo
# aquí y volver a ejecutar el script. Lo detecta el e2e "tiene cada carácter en el subconjunto de su familia".
#
# Requisitos: python3 con fonttools 4.63.0 y brotli (p. ej. `python3 -m venv v && v/bin/pip install
# fonttools==4.63.0 brotli`; exporta PY=v/bin/python). Red para descargar los TTF de google/fonts.
# Uso: bash scripts/subset-fonts.sh
#
# Fuentes de origen (licencia SIL OFL 1.1, sin nombres reservados; mismas versiones que sirve Google Fonts):
#   - Cormorant Garamond 4.001 y JetBrains Mono 2.211: github.com/google/fonts en el commit fijado abajo.
#   - Geist 1.800: node_modules/geist@1.7.2.
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
cp node_modules/geist/dist/fonts/geist-sans/Geist-Variable.ttf "$TMP/geist.ttf"

# Pesos que usa home.css: Cormorant 400 y 500 (cursiva solo 400), JetBrains 400 y 500, Geist 400 a 600.
$PY -m fontTools.varLib.instancer "$TMP/cg.ttf" wght=500 -q -o "$TMP/cg-500.ttf"
$PY -m fontTools.varLib.instancer "$TMP/cg.ttf" wght=400:500 -q -o "$TMP/cg-400-500.ttf"
$PY -m fontTools.varLib.instancer "$TMP/cgi.ttf" wght=400 -q -o "$TMP/cgi-400.ttf"
$PY -m fontTools.varLib.instancer "$TMP/jb.ttf" wght=400:500 -q -o "$TMP/jb-400-500.ttf"
$PY -m fontTools.varLib.instancer "$TMP/geist.ttf" wght=400:600 -q -o "$TMP/geist-400-600.ttf"

# Solo las features que el navegador aplica por defecto (más lnum y tnum, que pide .figure dd): las demás
# (versalitas, fracciones, alternativas) arrastraban cientos de glifos que la home nunca pinta.
ON=ccmp,locl,mark,mkmk,kern,liga,calt,clig,rlig,rvrn,rclt,curs
ES='¡¿ÁÉÍÓÚÜÑáéíóúüñ'
ASCII=$(printf '%s' ' !"#$%&'"'"'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~')
ALNUM='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '

subset() { # <entrada> <salida> <texto> [features extra]
  $PY -m fontTools.subset "$1" --flavor=woff2 --text="$3" --layout-features="$ON${4:+,$4}" --output-file="$OUT/$2" 2>/dev/null
  printf '%-32s %6d B\n' "$2" "$(wc -c < "$OUT/$2")"
}

# El h1 (elemento LCP): solo los glifos del nombre, peso 500. Se precarga. Si cambia el nombre en
# src/content/home.ts, cambia aquí (lo comprueba tests/content/fonts.test.ts).
subset "$TMP/cg-500.ttf" cormorant-hero.woff2 'Steven Vallejo Ortiz'
# Texto corrido (descripciones, datos): ASCII imprimible + español + la tipografía de la home.
subset "$TMP/geist-400-600.ttf" geist-home.woff2 "$ASCII$ES«»·§–—‘’“”…→↗"
# Titulares, nombres de producto y cifras. (Cormorant no tiene «ḗ»: la pinta la serif del sistema, como siempre.)
subset "$TMP/cg-400-500.ttf" cormorant-home.woff2 "$ASCII$ES·îÎ–—‘’“”…" lnum,tnum
# Cursiva: solo el epígrafe de Método.
subset "$TMP/cgi-400.ttf" cormorant-home-italic.woff2 "$ALNUM$ES.,;:!?'\"()-«»“”‘’–—…"
# Etiquetas, fechas y chips del stack: sin la puntuación ASCII que no usan (sus ligaduras de código pesan). Sin «→»:
# el subconjunto latin de Google no lo trae, así que la home siempre lo pintó con la mono del sistema.
subset "$TMP/jb-400-500.ttf" jetbrains-home.woff2 "$ALNUM$ES#&()+,-./:~_'§·—Î"
