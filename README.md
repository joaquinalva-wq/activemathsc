# Active Maths Championship

Sistema de inscripción, examen y corrección para las olimpiadas matemáticas internas
de los colegios de la red Active Learning.

- `index.html` — login con Google + registro de colegio/categoría.
- `exam.html` — examen cronometrado (80 min por defecto, configurable).
- `admin.html` — panel de administración: resultados, estadísticas, ejercicios, clasificados, configuración.
- `js/data.js` — configuración de Firebase, catálogos (colegios/categorías) y acceso a datos.
- `css/styles.css` — estilos.
- `firestore.rules` — reglas de seguridad de Firestore (ver más abajo).
- `storage.rules` — reglas de seguridad de Firebase Storage para imágenes de ejercicios.

## Correr localmente

Es un sitio estático, pero usa ES modules (`import`/`export`), así que **no se puede
abrir con doble clic** (`file://` bloquea los módulos). Hace falta un servidor local, por ejemplo:

```
npx serve .
# o
python -m http.server 8080
```

y abrir `http://localhost:<puerto>/index.html`.

## Categorías

Hay exactamente 4 categorías visibles para el estudiante: **Básico** (7N y 8N),
**Intermedio** (9N y 10N), **Avanzado** (11N y 12N) y **Pitágoras**.

`Pitágoras` es la categoría para estudiantes con diagnósticos que los limitan a
rendir al nivel de Básico (ver `CATEGORY_BASE_MAP` en `js/data.js`). Comparte el
mismo banco de ejercicios que Básico — no tiene pestaña propia en "Ejercicios" del
panel admin, así evitamos mantener dos bancos duplicados. La UI nunca menciona el
motivo de la categoría al estudiante, solo el nombre.

## Modelo de datos (Firestore)

| Colección | Quién escribe | Contiene |
|---|---|---|
| `users/{uid}` | Estudiante (una vez) | nombre, colegio, categoría |
| `exam_states/{uid}` | Estudiante (mientras no termina) | respuestas en progreso, tiempo restante, `violationLog` |
| `submissions/{uid}` | Estudiante (una vez) | respuestas finales, `violationLog`, justificaciones |
| `questions/{categoria}` | Admin | enunciados (`id`, `text`, `imageUrl` opcional) — **sin** la respuesta correcta |
| `answer_keys/{categoria}` | Admin | respuesta correcta por `id` de ejercicio |
| `config/settings` | Admin | duración del examen en minutos |

El estudiante nunca recibe `answer_keys` (ni por Firestore ni embebido en el JS):
la corrección automática se calcula en `admin.html`, que es el único que tiene
permiso de leer la clave de respuestas. Esto evita que un estudiante con las
herramientas de desarrollador del navegador vea la respuesta correcta antes de
responder, o falsifique su propio puntaje.

## Control de salidas de ventana / pantalla completa

`exam.html` registra (sin bloquear al estudiante) cada vez que cambia de pestaña/
ventana (`visibilitychange`) o sale de pantalla completa (`fullscreenchange`), con
hora exacta, en `violationLog`. Se guarda en `exam_states` al instante y queda
en la entrega final (`submissions`). En el panel admin (pestaña Resultados) aparece
un badge 🚩 con el conteo, filtro "Ventana" y el detalle completo en "Ver detalle".
La decisión de penalizar o no queda en manos del docente — el sistema no envía el
examen automáticamente.

## Imágenes en los ejercicios (figuras de geometría, etc.)

En la pestaña "Ejercicios" del panel admin, al editar un ejercicio se puede subir
una imagen `.jpg` o `.png` (máx. 5 MB). Se guarda en Firebase Storage, bajo
`exercise-images/{categoría}/...`, y la URL queda en el campo `imageUrl` del
ejercicio en `questions/{categoría}`. Como no es información secreta (a diferencia
de la respuesta correcta), el estudiante sí la recibe y la ve arriba del enunciado
durante el examen. Al reemplazar o quitar una imagen, se borra la anterior de Storage.

## Reglas de seguridad de Firestore

`firestore.rules` en la raíz tiene las reglas recomendadas:
- Un estudiante puede **crear** su perfil/entrega una sola vez; no puede editarlos
  ni borrarlos después (así se garantiza una sola respuesta por cuenta y que no
  pueda cambiar de categoría a mitad de competencia).
- `answer_keys` solo lo puede leer/escribir el admin.
- Las funciones de admin (marcar clasificado, editar ejercicios, borrar una
  entrega para permitir un reintento legítimo) usan la misma lista de emails que
  `ALLOWED_EMAILS` en `admin.html`.

Para aplicarlas: Firebase Console → Firestore Database → Reglas → pegar el
contenido de `firestore.rules` → Publicar.

**Importante:** si nunca configuraste reglas en este proyecto de Firebase, puede
estar todavía en "modo de prueba", que expira solo y bloquea toda lectura/escritura
30 días después de crear el proyecto. Verificá esto antes de la competencia.

## Mantener sincronizados los emails de admin

La lista de administradores está en tres lugares y deben coincidir:
- `admin.html` → constante `ALLOWED_EMAILS`
- `firestore.rules` → función `isAdmin()`
- `storage.rules` → función `isAdmin()`

## Limitaciones conocidas / posibles próximos pasos

- No hay restricción de dominio en el login de Google (decisión actual: cualquier
  cuenta de Google puede registrarse).
- Si un estudiante se equivoca de colegio/categoría al registrarse, no hay botón
  en el panel para corregirlo — hay que editarlo manualmente desde la consola de
  Firebase, o borrar su entrega y dejar que se registre de nuevo (función ya
  disponible en la pestaña Resultados).
- El hosting (Firebase Hosting, GitHub Pages u otro) queda pendiente de decisión.
