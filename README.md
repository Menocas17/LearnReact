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

## Desplegar (opcional)

1. Crea una base de datos Postgres (por ejemplo, Neon) y aplica las migraciones:
   `DATABASE_URL=… pnpm db:migrate`.
2. Crea una OAuth App en GitHub con callback `https://TU-DOMINIO/api/auth/callback/github`.
3. Configura las variables de `.env.example` (`DATABASE_URL`, `BETTER_AUTH_SECRET`,
   `BETTER_AUTH_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `ALLOWED_EMAILS`).

En producción con `DATABASE_URL` siempre se exige login con GitHub, y solo pueden entrar los
emails de `ALLOWED_EMAILS`.

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
