# LearnReact

Plataforma personal para aprender de los fundamentos de JavaScript hasta React + TypeScript
a nivel medio/avanzado, sin dejar vacíos: diagnóstico por conceptos, lecciones interactivas,
preguntas con feedback, ejercicios con tests en el navegador y proyectos.

## Estado: fase 0

- **Grafo de conceptos completo**: 27 módulos y 259 conceptos con prerrequisitos
  (`src/content/curriculum`).
- **Diagnóstico**: 78 preguntas en 11 secciones (JS, TS, React, Next.js). Cada concepto queda
  como *dominado*, *frágil* o *hueco* (`src/content/diagnostic`, `src/lib/diagnostic`).
- **Lección piloto**: Closures (módulo 3) con preguntas, dos ejercicios con Sandpack y videos.
- **Progreso** guardado en Postgres (PGlite en local, sin instalar nada).
- **Validador de contenido** que ejecuta el código de las preguntas y los ejercicios.

## Arrancar en local

Requisitos: Node 22 y pnpm.

```bash
pnpm install
pnpm dev
```

Abre <http://localhost:3000>. En desarrollo no hace falta login (modo `local`, un único usuario)
y la base de datos es PGlite en `./.data/pglite`, que se crea y migra sola. Tu progreso vive ahí:
no borres esa carpeta si quieres conservarlo.

Para usarlo como app "de verdad" en tu máquina:

```bash
pnpm build
AUTH_MODE=local pnpm start
```

## Desplegar en Vercel

Necesitas tres cosas: una base de datos Postgres, una OAuth App de GitHub y las variables de
entorno. En producción siempre se exige login con GitHub y solo entran los emails de
`ALLOWED_EMAILS`.

1. **Importa el repo en Vercel** (framework: Next.js, sin cambiar los comandos). Vercel despliega
   a producción la rama `main`: fusiona esta rama en `main` o cambia la *Production Branch* en
   Settings → Git.
2. **Base de datos.** En el proyecto de Vercel: Storage → Create → Neon (Postgres). Copia la
   cadena de conexión **pooled** (el host incluye `-pooler`) como `DATABASE_URL`.
3. **Migraciones.** Desde tu máquina, una vez (y cada vez que cambie el esquema):
   `DATABASE_URL="<cadena de Neon>" pnpm db:migrate`.
4. **OAuth App de GitHub** (GitHub → Settings → Developer settings → OAuth Apps → New):
   - Homepage URL: `https://TU-DOMINIO.vercel.app`
   - Authorization callback URL: `https://TU-DOMINIO.vercel.app/api/auth/callback/github`
5. **Variables de entorno** en Vercel (Settings → Environment Variables, entorno *Production*):

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | Cadena pooled de Neon |
   | `BETTER_AUTH_SECRET` | Aleatorio: `openssl rand -base64 32` |
   | `BETTER_AUTH_URL` | `https://TU-DOMINIO.vercel.app` |
   | `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | Los de la OAuth App |
   | `ALLOWED_EMAILS` | Tu email de GitHub (el principal o uno verificado) |

6. **Redeploy** para que tome las variables y entra con GitHub.

Notas: el login solo funciona en el dominio de `BETTER_AUTH_URL` (no en las URLs de preview).
Tu progreso local (PGlite en `./.data`) no se migra a Neon: en producción empiezas de cero.

## Scripts

| Script | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm check` | lint + typecheck + tests + validación de contenido |
| `pnpm test` | Tests unitarios (Vitest) |
| `pnpm test:e2e` | Tests E2E (Playwright) con una base de datos aparte |
| `pnpm validate:content` | Valida el contenido; `--videos` comprueba además los videos |
| `pnpm db:generate` | Genera migraciones tras cambiar `src/db/schema.ts` |
| `pnpm db:migrate` | Aplica migraciones a `DATABASE_URL` |

Si tu Chromium no es el que espera Playwright, indica cuál usar con `PW_CHROMIUM_PATH`.

## Stack

Next.js 16 (App Router, Cache Components) · React 19 · TypeScript strict · Tailwind CSS 4 ·
MDX · Drizzle ORM + Postgres/PGlite · Better Auth · Sandpack · Shiki · Zod · Vitest · Playwright.

## Cómo se garantiza la calidad del contenido

Ver [`docs/contenido.md`](docs/contenido.md).
