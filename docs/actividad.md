# Qué estoy haciendo

La pestaña `/es/actividad` (también `/en/actividad`) añade una escultura de actividad al CV. En la barra aparece como «Ahora»; el menú y su nombre accesible conservan «Qué estoy haciendo». La portada conserva su grafo y no descarga el código de la nueva visualización.

Semana, mes y año son ventanas móviles de 7, 30 y 365 días, en UTC. Cada cristal representa un día; su tamaño y color reflejan el recuento. Los periodos transforman la geometría de la escultura, actualizan las métricas y filtran los apuntes. El selector de fechas y la línea temporal permiten explorar los datos sin depender del canvas. La reproducción recorre el periodo cronológicamente; los filamentos y partículas son elementos visuales, no contribuciones adicionales.

La escena Three se carga únicamente en actividad. El movimiento tiene pausa y respeta la preferencia del sistema. Sin WebGL o con movimiento reducido permanece disponible la representación SVG y los mismos controles de datos.

## Fuente elegida: GitHub

El dueño indicó «Todo lo que esté en GitHub». `/api/activity` lee únicamente el calendario **público** de `stevenvo780`. No necesita tokens, no accede a repositorios ni lee nombres, autores, diffs o mensajes de commits. Consulta dos años civiles para construir la ventana móvil; GitHub no sirve una ventana móvil arbitraria mediante `from/to`.

El 2026-10-06 el dueño activó la publicación de contribuciones privadas anónimas. La comprobación a las 23:09 UTC confirmó 16.130 contribuciones en 365 días, 4.040 en 30 días, 1.425 en siete días y 14.640 en el año civil 2026. La caché de datos y el CDN se invalidaron sin desplegar código; `/api/activity` mostró el nuevo recuento en producción. Estos son valores de esa comprobación, no cifras fijadas en la interfaz. No se copiaron credenciales ni se configuró autenticación en el servidor del CV.

GitHub incluye contribuciones privadas **anónimas** si activas su opción de mostrarlas en el perfil. El calendario reproduce esos números sin revelar nombres de repositorios privados, clientes, archivos o commits. Ver [visibilidad de contribuciones](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference).

## Bestiario de proyectos

La sección independiente bajo la experiencia anterior muestra doce proyectos públicos seleccionados. `src/activity/projects/catalog.ts` conserva una lista explícita; sus nombres y enlaces proceden del catálogo ya publicado (`src/data/frentes.ts`) y de Mouseîon. No enumera repositorios autenticados ni publica identidades privadas.

El publicador diario cuenta commits de `stevenvo780` alcanzables desde la rama predeterminada de cada repositorio público, en ventanas UTC de 7, 30 y 365 días. No usa estrellas, fechas de push ni eventos incompletos como sustitutos. Consulta `per_page=1` y comprueba el último número de página para obtener el total exacto; admite las URLs canónicas numéricas y el caso real `next=2 / last=1` de un historial de un solo commit. Publica solamente identidad aprobada, recuentos, última fecha de actividad y fecha de medición; descarta autores, emails, hashes, mensajes y archivos. Ver [API de commits](https://docs.github.com/en/rest/commits/commits#list-commits) y [paginación](https://docs.github.com/en/rest/using-the-rest-api/using-pagination-in-the-rest-api).

El ranking cubre esta selección y utiliza una métrica distinta del calendario superior: commits por proyecto, no todas las contribuciones del perfil. Las contribuciones privadas anónimas no permiten asignar actividad a nombres. El tamaño y la energía de las criaturas reflejan actividad registrada, nunca complejidad, calidad u horas. Las seis anatomías son caracterizaciones artísticas.

Las lecturas anónimas REST permiten solo 60 peticiones por hora e IP; las comprobaciones reales agotaron esa cuota durante la depuración. La versión final prioriza el archivo publicado y conserva REST anónimo como alternativa: un workflow diario en el repositorio del CV utiliza el token temporal nativo de GitHub Actions para leer únicamente la lista pública y publicar `projects.json` como asset de la release `activity-feed`. Ese token permanece dentro del job de GitHub; no se copia ninguna credencial a la web ni se configura un secreto nuevo. La publicación de datos no genera commits ni despliegues diarios. Ver [límites de GitHub](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).

`/api/activity/projects` lee ese archivo público con caché de una hora. Su validador exige todos los IDs aprobados, recuentos enteros coherentes y fechas válidas; reconstruye los nombres y enlaces desde el catálogo local, descartando campos adicionales. Conserva la fecha original de medición. Si el archivo falta o tiene más de seis horas, consulta también los mismos repositorios públicos mediante un lote REST anónimo cacheado durante seis horas con clave agregada estable; si GitHub limita esa consulta, conserva el archivo publicado con su fecha real. La métrica nunca cambia ni se inventan ceros. El cliente solicita el mismo dominio al acercarse al viewport y al recuperar el foco tras una hora. Un registro viejo avisa al superar 48 horas.

La primera ejecución de Actions del 2026-10-06 (`37547936574`) no pudo arrancar: GitHub devolvió “The job was not started because your account is locked due to a billing issue.” Es un bloqueo externo de la cuenta, no una ejecución exitosa del publicador. El cron queda configurado; su ejecución requiere que el dueño desbloquee Actions. La fuente pública alternativa permite actualizar sin ese job y sin secretos en Vercel. La inclusión de proyectos privados requiere además los alias aprobados y una conexión de lectura limitada; no se configuró ni publicó una identidad privada.

GitHub aplica sus propias reglas: no todo commit ni toda rama entra en el calendario. Una contribución tampoco equivale necesariamente a un commit ni mide horas o calidad. Ver [reglas de contribución](https://docs.github.com/en/account-and-profile/concepts/contributions-on-your-profile).

## Actualización sin despliegues diarios

La página se genera como una estructura estática; sus datos se consultan al entrar. La caché de origen dura una hora y la respuesta pública, 15 minutos con revalidación. Al volver a la pestaña tras una hora se renueva la consulta, sin intervalos permanentes.

Solo hace falta desplegar la implementación una vez. No se necesita scheduler ni nuevo almacenamiento para el calendario elegido. La primera versión se publicó el 2026-10-06; las actualizaciones de datos no cambian esa publicación.

El adaptador lee los tooltips para recuperar conteos exactos, sin estimarlos a partir de colores. Si GitHub cambia su HTML o falla, muestra indisponibilidad; no inventa ceros. Tiene límites de tamaño, timeout y salida reconstruida por allowlist. El visitante solo consulta el endpoint del mismo sitio, compatible con la CSP actual.

## Contar qué hice sin revelar proyectos privados

La bitácora admite títulos elegidos explícitamente para publicación, por fecha y área (`engineering`, `research`, `design`, `writing`), en español e inglés. No genera narraciones a partir del código o mensajes privados. Un día puede tener apuntes aunque no tenga contribuciones.

Para mantenerla diariamente sin redeploy, el servidor admite `ACTIVITY_FEED_URL`: una ubicación HTTPS estable con un JSON de recuentos y apuntes revisados. Hace falta elegir dónde se guardarán y editarán esos datos; no se ha creado almacenamiento ni activado esta opción. La fuente actualmente elegida sigue siendo GitHub.

El esquema público está en `src/activity/model.ts`. El feed opcional sustituye al calendario, sin sumar fuentes que podrían duplicar trabajo. Solo acepta 365 fechas consecutivas terminadas en el día UTC de generación, conteos enteros no negativos y hasta 180 apuntes de 240 caracteres por idioma. Los campos extra no cruzan la API. `updatedAt` conserva la fecha del generador: consultar un archivo viejo no lo convierte en nuevo y la interfaz avisa si supera 48 horas. Si falla un feed configurado, no cambia silenciosamente de fuente ni métrica.

## Verificación y alcance

La versión inicial pasó build, TypeScript, 400 pruebas unitarias y 12 E2E de actividad en escritorio/tablet/móvil. El smoke con datos reales confirmó 365 días, recuento coincidente, sin errores de JavaScript ni desbordamiento horizontal.

La revisión animada pasa build, TypeScript, 400 pruebas unitarias y 15 E2E de actividad. ESLint no tiene errores; conserva cuatro advertencias en archivos ajenos a la función. Las pruebas del canvas real con SwiftShader comprueban diferencias de píxeles entre momentos, inmovilidad al pausar, transformación entre periodos, persistencia de la pausa, reproducción, teclado en móvil y recuperación ante pérdida de WebGL.

La revisión independiente en navegador confirma selección real por puntero, cero llamadas de dibujo en pausa o con la pestaña oculta, ausencia de errores JavaScript y fallback inmediato al activar movimiento reducido. Se inspeccionaron capturas y vídeo con movimiento normal en escritorio, tablet y móvil; no se usó movimiento reducido para juzgar el acabado animado.

El bestiario pasa TypeScript, build y 414 pruebas unitarias. Las 26 E2E de actividad y proyectos incluyen navegación, tres tamaños de pantalla, localización, datos indisponibles, diferencias de píxeles entre instantes, pausa exacta, cambio de anatomía y fallback por pérdida de contexto. La revisión independiente comprobó seis anatomías, cero dibujos en pausa o fuera del viewport, liberación del canvas y ausencia de errores JavaScript o CSP.

No se añadieron bases de datos ni servicios locales. La automatización nueva es el workflow diario y su archivo público en GitHub Releases; no se cambiaron ni transfirieron secretos.
