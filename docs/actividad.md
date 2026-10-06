# Qué estoy haciendo

La pestaña `/es/actividad` (también `/en/actividad`) añade una constelación de trabajo al CV. En la barra aparece como «Ahora»; el menú y su nombre accesible conservan «Qué estoy haciendo». La portada conserva su grafo y no descarga el código de la nueva visualización.

Semana, mes y año son ventanas móviles de 7, 30 y 365 días, en UTC. Cada punto representa un día; su tamaño y color reflejan el recuento. Se explora con ratón, flechas del teclado o selector de fechas. Los filtros iluminan su intervalo, actualizan las métricas y filtran los apuntes.

## Fuente elegida: GitHub

El dueño indicó «Todo lo que esté en GitHub». `/api/activity` lee únicamente el calendario **público** de `stevenvo780`. No necesita tokens, no accede a repositorios ni lee nombres, autores, diffs o mensajes de commits. Consulta dos años civiles para construir la ventana móvil; GitHub no sirve una ventana móvil arbitraria mediante `from/to`.

El 2026-10-06 se comprobó GraphQL con la autenticación existente de la cuenta propietaria: el recuento de 365 días coincidía con el público (6.628 durante esa comprobación). Solo se solicitaron fechas y cantidades; no se copiaron credenciales ni se configuró autenticación en el servidor del CV. La cifra no se fija en la interfaz. Las 14.000 indicadas por el dueño no han podido verificarse para esa ventana de tiempo.

GitHub puede incluir contribuciones privadas **anónimas** si activas su opción de mostrarlas en el perfil. El sitio reproduce los números que ese calendario publique; no promete actividad que GitHub no devuelva. Nadie obtiene nombres de repositorios, clientes, archivos o commits. Ver [visibilidad de contribuciones](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference).

GitHub aplica sus propias reglas: no todo commit ni toda rama entra en el calendario. Una contribución tampoco equivale necesariamente a un commit ni mide horas o calidad. Ver [reglas de contribución](https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile).

## Actualización sin despliegues diarios

La página se genera como una estructura estática; sus datos se consultan al entrar. La caché de origen dura una hora y la respuesta pública, 15 minutos con revalidación. Al volver a la pestaña tras una hora se renueva la consulta, sin intervalos permanentes.

Solo hace falta desplegar la implementación una vez. No se necesita scheduler ni nuevo almacenamiento para el calendario elegido. No se ha publicado esta implementación ni cambiado configuración externa.

El adaptador lee los tooltips para recuperar conteos exactos, sin estimarlos a partir de colores. Si GitHub cambia su HTML o falla, muestra indisponibilidad; no inventa ceros. Tiene límites de tamaño, timeout y salida reconstruida por allowlist. El visitante solo consulta el endpoint del mismo sitio, compatible con la CSP actual.

## Contar qué hice sin revelar proyectos privados

La bitácora admite títulos elegidos explícitamente para publicación, por fecha y área (`engineering`, `research`, `design`, `writing`), en español e inglés. No genera narraciones a partir del código o mensajes privados. Un día puede tener apuntes aunque no tenga contribuciones.

Para mantenerla diariamente sin redeploy, el servidor admite `ACTIVITY_FEED_URL`: una ubicación HTTPS estable con un JSON de recuentos y apuntes revisados. Hace falta elegir dónde se guardarán y editarán esos datos; no se ha creado almacenamiento ni activado esta opción. La fuente actualmente elegida sigue siendo GitHub.

El esquema público está en `src/activity/model.ts`. El feed opcional sustituye al calendario, sin sumar fuentes que podrían duplicar trabajo. Solo acepta 365 fechas consecutivas terminadas en el día UTC de generación, conteos enteros no negativos y hasta 180 apuntes de 240 caracteres por idioma. Los campos extra no cruzan la API. `updatedAt` conserva la fecha del generador: consultar un archivo viejo no lo convierte en nuevo y la interfaz avisa si supera 48 horas. Si falla un feed configurado, no cambia silenciosamente de fuente ni métrica.

## Verificación y alcance

- Build, TypeScript, 376 pruebas unitarias y 12 E2E de actividad en escritorio/tablet/móvil pasan. ESLint no tiene errores; conserva cinco advertencias de archivos ajenos a esta función.
- Smoke con datos reales: 365 días, recuento coincidente, sin errores de JavaScript ni desbordamiento horizontal en escritorio o móvil.
- Revisión amplia: 36 E2E pasan, dos se omiten según su proyecto y cuatro fallan por un glifo griego `Κ` ausente en la fuente existente de las páginas de filosofía. El símbolo y la fuente no cambiaron. La suite completa no se presenta como verde.
- No se instalaron schedulers, se creó almacenamiento, se cambiaron secretos ni se publicó a producción.
