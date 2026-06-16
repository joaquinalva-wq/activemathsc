# Active Maths Championship

Sistema de inscripción, examen y corrección para las olimpiadas matemáticas internas
de los colegios de la red Active Learning.

- `index.html` — login con Google + registro de colegio/categoría.
- `exam.html` — examen cronometrado (80 min por defecto, configurable).
- `admin.html` — panel de administración: resultados, estadísticas, ejercicios, clasificados, configuración.
- `js/data.js` — configuración de Firebase, catálogos (colegios/categorías) y acceso a datos.
- `css/styles.css` — estilos.
- `firestore.rules` — reglas de seguridad de Firestore (ver más abajo).
- `images/exercises/` — imágenes de figuras para los ejercicios (ver más abajo).

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

No usamos Firebase Storage para esto (requiere el plan Blaze con tarjeta —
ver más abajo). En su lugar, las imágenes son archivos del propio repositorio:

1. Subí el `.jpg`/`.png` a la carpeta `images/exercises/` (por GitHub o
   pidiéndoselo a Claude en una sesión).
2. En el panel admin → pestaña "Ejercicios" → editar el ejercicio → campo
   "Imagen del ejercicio", escribí la ruta exacta (ej. `images/exercises/b1.jpg`).
   La vista previa se actualiza al tipear; si no encuentra el archivo, avisa.
3. Guardar el ejercicio guarda esa ruta como texto en `questions/{categoría}`
   (no es información secreta, así que el estudiante la recibe igual que el
   enunciado, y la ve arriba del problema durante el examen).

Como es un archivo del repo, hay que volver a desplegar (push a GitHub) cada
vez que se agrega o cambia una imagen para que quede disponible en el sitio.

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

La lista de administradores está en dos lugares y deben coincidir:
- `admin.html` → constante `ALLOWED_EMAILS`
- `firestore.rules` → función `isAdmin()`

## Limitaciones conocidas / posibles próximos pasos

- No hay restricción de dominio en el login de Google (decisión actual: cualquier
  cuenta de Google puede registrarse).
- Si un estudiante se equivoca de colegio/categoría al registrarse, no hay botón
  en el panel para corregirlo — hay que editarlo manualmente desde la consola de
  Firebase, o borrar su entrega y dejar que se registre de nuevo (función ya
  disponible en la pestaña Resultados).
- Las imágenes de ejercicios son archivos del repo (no Firebase Storage) porque
  habilitar Storage por primera vez exige el plan Blaze del proyecto, que pide
  tarjeta — ver sección "Imágenes en los ejercicios" arriba. Si en algún momento
  se habilita Blaze, se podría volver a un flujo de carga directa desde el panel.

## Hosting (Netlify)

El sitio se despliega en Netlify (sin paso de build, `netlify.toml` ya deja
`publish = "."`). Para conectarlo: Netlify → Add new site → Import an existing
project → elegir el repo de GitHub `activemathsc` → Deploy. Cualquier push a
`main` vuelve a desplegar automáticamente.
