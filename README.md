¡Claro\! Aquí tienes el código completo en formato Markdown para que lo copies y lo pegues en un archivo llamado `README.md` en la raíz de tu proyecto.

```markdown
# Blog con Node.js, Airtable y Prerenderizado

Este es un proyecto de blog completo, dinámico y optimizado para SEO. Utiliza Node.js con Express para el backend, Airtable como base de datos en la nube, y renderizado del lado del servidor (SSR) con EJS para un excelente posicionamiento en buscadores. Incluye un panel de administración privado para gestionar los contenidos.

---

## Características Principales

* **Backend Robusto:** Construido con Node.js y Express.
* **Base de Datos en la Nube:** Todo el contenido se gestiona desde una base de datos de [Airtable](https://airtable.com/).
* **Optimizado para SEO:** Las páginas se prerenderizan en el servidor (SSR), lo que permite a los buscadores indexar el contenido de forma óptima.
* **URLs Amigables:** Generación automática de "slugs" a partir de los títulos para crear URLs limpias (ej: `/post/mi-primer-articulo`).
* **Panel de Administración:** Una aplicación de una sola página (`/admin`) protegida por contraseña para crear, editar y eliminar posts.
* **Fácil de Desplegar:** Instrucciones detalladas para una instalación sencilla en servidores con Plesk.

---

## Requisitos Previos

Antes de empezar, asegúrate de tener lo siguiente:

1.  Una cuenta gratuita de [Airtable](https://airtable.com/).
2.  Un servidor web o hosting que soporte **Node.js** y tenga el panel de control **Plesk**.
3.  Un dominio apuntando a tu servidor.

---

## Paso 1: Configuración de la Base de Datos en Airtable

La "magia" de este blog reside en Airtable. Sigue estos pasos para crear tu base de datos.

1.  **Crea una nueva Base:** En tu panel de Airtable, haz clic en "Create a base" y elige empezar desde cero. Dale un nombre, por ejemplo, "Blog".
2.  **Crea la Tabla `posts`:** La primera tabla se suele llamar `Table 1`. Renómbrala a `posts` (en minúsculas).
3.  **Configura los Campos (Columnas):** Esta es la parte más importante. Elimina los campos que vienen por defecto y crea los siguientes, asegurándote de que el **nombre del campo** y el **tipo** coincidan exactamente.

| Nombre del Campo    | Tipo de Campo (`Type`) | Descripción                                         |
| ------------------- | ---------------------- | --------------------------------------------------- |
| `title`             | Single line text       | El título principal del post.                       |
| `subtitle`          | Single line text       | (Opcional) Un subtítulo o entradilla.               |
| `author`            | Single line text       | El nombre del autor del post.                       |
| `date`              | Date                   | La fecha de publicación.                            |
| `excerpt`           | Long text              | Un resumen corto del post.                          |
| `content`           | Long text              | El contenido completo del post.                     |
| `imageUrl`          | URL                    | (Opcional) La URL de la imagen principal.           |
| `tags`              | Single line text       | Etiquetas separadas por comas (ej: `seo, nodejs`).  |
| `metaTitle`         | Single line text       | (Opcional) El título para SEO.                      |
| `metaDescription`   | Long text              | (Opcional) La descripción para SEO.                 |
| `slug`              | Single line text       | **Importante:** Se rellenará automáticamente.       |

4.  **Obtén el ID de tu Base:**
    * Ve a la página de ayuda de la API de Airtable: [https://airtable.com/developers/web/api/introduction](https://airtable.com/developers/web/api/introduction)
    * Selecciona la base "Blog" que acabas de crear.
    * El ID de la base (empieza con `app...`) aparecerá en la URL y en la documentación. Cópialo y guárdalo.

---

## Paso 2: Obtener tu API Key de Airtable

Necesitas una clave secreta (API Key) para que tu blog pueda conectarse a Airtable.

1.  **Ve a la sección de Tokens:** Inicia sesión y ve a [https://airtable.com/create/tokens](https://airtable.com/create/tokens).
2.  **Crea un nuevo Token:**
    * **Name:** Dale un nombre descriptivo, como "Clave Blog".
    * **Scopes:** Haz clic en "+ Add a scope" y añade los siguientes **tres** permisos:
        * `data.records:read`
        * `data.records:write`
        * `schema.bases:read`
    * **Access:** Haz clic en "+ Add a base" y selecciona tu base "Blog".
3.  **Copia tu Token:** Haz clic en "Create token". Se te mostrará una clave que empieza por `pat...`. **Cópiala y guárdala en un lugar seguro**. Esta es tu `AIRTABLE_API_KEY`.

---

## Paso 3: Despliegue en Servidor con Plesk

Ahora que tienes la base de datos y las claves, es hora de instalar el blog en tu servidor.

1.  **Sube los archivos del proyecto:**
    * Comprime todos los archivos del proyecto en un `.zip` (recuerda no incluir la carpeta `node_modules` ni el archivo `.env` si lo creaste para pruebas locales).
    * En Plesk, ve a **Sitios web y dominios** > **Administrador de archivos**.
    * Sube el `.zip` a la carpeta `httpdocs` y extráelo.

2.  **Habilita Node.js:**
    * Vuelve a la página principal de tu dominio en Plesk y haz clic en **Node.js**.
    * Configura lo siguiente:
        * **Versión de Node.js:** Elige una versión LTS (ej: 20.x).
        * **Modo de la aplicación:** `production`.
        * **Raíz del documento:** `/httpdocs` (o donde hayas extraído los archivos).
        * **Fichero de inicio de la aplicación:** `server.js`.
    * Haz clic en **Habilitar Node.js**.

3.  **Instala las dependencias:**
    * En la misma pantalla, haz clic en **Instalación de NPM**. Plesk leerá el archivo `package.json` e instalará todo lo necesario (Express, EJS, etc.).

4.  **Configura las Variables de Entorno:**
    * Esta es la forma segura de añadir tus claves secretas en Plesk.
    * En la sección **Variables de entorno**, añade las siguientes variables una por una:

| Nombre de la Variable     | Valor que debes pegar                               |
| ------------------------- | --------------------------------------------------- |
| `AIRTABLE_API_KEY`        | Tu clave secreta que empieza por `pat...`           |
| `AIRTABLE_BASE_ID`        | El ID de tu base que empieza por `app...`           |
| `AIRTABLE_TABLE_NAME`     | `posts`                                             |
| `ADMIN_PASSWORD`          | La contraseña que quieras para el panel de admin.   |

5.  **Inicia la Aplicación:**
    * En la parte superior de la página de Node.js, haz clic en **Reiniciar aplicación**.
    * ¡Listo! Visita tu dominio y tu blog debería estar funcionando.

---

## Paso 4: Uso del Panel de Administración

* **Acceso:** Para gestionar tus posts, ve a `https://tudominio.com/admin`.
* **Contraseña:** Usa la contraseña que definiste en la variable de entorno `ADMIN_PASSWORD`.
* **Creación de Slugs:** Cuando creas o editas un post, el `slug` (la parte de la URL) se genera automáticamente a partir del título. Si tienes posts antiguos en Airtable, tendrás que editarlos y guardarlos desde el panel de admin para que se les genere su slug.

¡Felicidades! Ya tienes tu blog completamente operativo.
```
