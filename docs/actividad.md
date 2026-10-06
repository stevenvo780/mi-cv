# Qué estoy haciendo

La pestaña `/es/actividad` (también `/en/actividad`) añade una escultura de actividad al CV. En la barra aparece como «Ahora»; el menú y su nombre accesible conservan «Qué estoy haciendo». La portada conserva su grafo y no descarga el código de la nueva visualización.

Semana, mes y año son ventanas móviles de 7, 30 y 365 días, en UTC. Cada cristal representa un día; su tamaño y color reflejan el recuento. Los periodos transforman la geometría de la escultura, actualizan las métricas y filtran los apuntes. El selector de fechas y la línea temporal permiten explorar los datos sin depender del canvas. La reproducción recorre el periodo cronológicamente; los filamentos y partículas son elementos visuales, no contribuciones adicionales.

La escena Three se carga únicamente en actividad. El movimiento tiene pausa y respeta la preferencia del sistema. Sin WebGL o con movimiento reducido permanece disponible la representación SVG y los mismos controles de datos.

## Fuente elegida: GitHub

El dueño indicó «Todo lo que esté en GitHub». `/api/activity` lee únicamente el calendario **público** de `stevenvo780`. No necesita tokens, no accede a repositorios ni lee nombres, autores, diffs o mensajes de commits. Consulta dos años civiles para construir la ventana móvil; GitHub no sirve una ventana móvil arbitraria mediante `from/to`.

El 2026-10-06 se comprobó GraphQL con la autenticación existente de la cuenta propietaria: el recuento de 365 días coincidía con el público (6.629 a las 22:50 UTC). La conexión carece de `read:user`, que GitHub exige para incluir actividad privada/interna en `ContributionsCollection`; esa coincidencia no permite concluir que el recuento privado esté completo. Tampoco `restrictedContributionsCount: 0` demuestra ausencia de trabajo privado. Solo se solicitaron fechas y cantidades; no se copiaron credenciales ni se configuró autenticación en el servidor del CV. La cifra no se fija en la interfaz. Las 14.000 indicadas por el dueño siguen pendientes de verificación privada. Ver [referencia de la API](https://docs.github.com/en/graphql/reference/users#contributionscollection).

GitHub puede incluir contribuciones privadas **anónimas** si activas su opción de mostrarlas en el perfil. El sitio reproduce los números que ese calendario publique; no promete actividad que GitHub no devuelva. Nadie obtiene nombres de repositorios, clientes, archivos o commits. Ver [visibilidad de contribuciones](https://docs.github.com/en/account-and-profile/reference/profile-contributions-reference).

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

No se instalaron schedulers, se creó almacenamiento ni se cambiaron secretos.
