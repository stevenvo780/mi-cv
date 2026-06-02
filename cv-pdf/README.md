# Hoja de vida en PDF (fuente)

PDF de una página, dos columnas, estética Cloud Atlas — diseñado para ser **compacto, directo y que se genere sin problemas**.

- Fuente editable: [`cv_es.html`](cv_es.html) · [`cv_en.html`](cv_en.html)
- Salida servida por el botón "CV" del sitio: `public/pdf/CV_es.pdf` · `public/pdf/CV_en.pdf`

## Regenerar el PDF (método confiable, sin librerías)

Usa Chrome/Chromium headless. Edita el HTML y corre:

```bash
google-chrome --headless=new --no-pdf-header-footer \
  --print-to-pdf=public/pdf/CV_es.pdf cv-pdf/cv_es.html
google-chrome --headless=new --no-pdf-header-footer \
  --print-to-pdf=public/pdf/CV_en.pdf cv-pdf/cv_en.html
```

El layout está fijado a A4 (`@page { size: A4; margin: 0 }`) con `print-color-adjust: exact` para que el sidebar oscuro imprima bien. Mantén el contenido en **una sola página**: si agregas algo, recorta en otro lado.

## Para actualizar datos

El contenido (experiencia, perfil, proyectos) está escrito directo en el HTML. Mantenlo alineado con los datos del sitio (`src/locales/*/common/`) y con el perfil canónico del repo de estrategia.
