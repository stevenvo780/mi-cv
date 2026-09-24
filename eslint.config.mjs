// ESLint queda fijado en 9.39.5 (spec: "ESLint 9"). Es la última 9.x (dist-tag `maintenance`) y npm
// marca todas las 9.x como "no longer supported" (https://eslint.org/version-support). No se sube a 10
// porque eslint-config-next 16.3.6 trae eslint-plugin-react 7.37.5, eslint-plugin-import 2.32.0 y
// eslint-plugin-jsx-a11y 6.10.x, cuyos peer admiten eslint hasta ^9. Revisar cuando eslint-config-next
// soporte ESLint 10.
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
