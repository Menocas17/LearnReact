# LearnReact

Plataforma personal para aprender JS → TypeScript → React → Next.js. Todo el contenido y la UI
están en español.

@AGENTS.md

## Comandos

- `pnpm check`: lint, typecheck, tests y validación de contenido. Ejecútalo antes de cada commit.
- `pnpm test:e2e`: E2E con Playwright (usa `PW_CHROMIUM_PATH` si el Chromium no coincide).
- `pnpm validate:content --videos`: además comprueba los videos de YouTube.

## Convenciones

- Next.js 16 con Cache Components: los datos del usuario se leen dentro de `<Suspense>` a
  través de `getCurrentUser()` (`src/lib/auth/current-user.ts`); los `params` se leen en un hijo
  dentro de `<Suspense>`; lo determinista se cachea con `"use cache"`.
- Mutaciones con Server Actions que validan la entrada con Zod, comprueban el usuario y llaman a
  `refresh()`.
- Las respuestas correctas de las preguntas nunca se envían al navegador: se corrigen en el
  servidor (`gradeAnswer`).
- Cambios en `src/db/schema.ts` → `pnpm db:generate` y commitear la migración.

## Contenido

Antes de crear o modificar lecciones, preguntas o ejercicios, lee `docs/contenido.md`.
