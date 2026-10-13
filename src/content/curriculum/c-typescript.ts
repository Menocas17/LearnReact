import type { ModuleDef } from "../types";
import { concept as c } from "./helpers";

export const blockC: readonly ModuleDef[] = [
  {
    id: "m07",
    number: 7,
    slug: "typescript-fundamentos",
    block: "C",
    title: "TypeScript: fundamentos",
    summary: "Tipos, inferencia, uniones, narrowing y modo strict.",
    concepts: [
      c("ts.por-que", "Qué es TypeScript", "Tipado estático: los tipos se borran al compilar y no existen en runtime.", ["js.valores-tipos"]),
      c("ts.tipos-basicos", "Tipos básicos", "Primitivos, arrays, tuplas, any vs unknown vs never.", ["ts.por-que"]),
      c("ts.inferencia", "Inferencia", "Cuándo anotar y cuándo dejar que TS infiera.", ["ts.tipos-basicos"]),
      c("ts.objetos-interfaces", "Tipos de objeto", "type vs interface, propiedades opcionales y readonly.", ["ts.tipos-basicos"]),
      c("ts.funciones", "Tipar funciones", "Parámetros, retorno, callbacks y sobrecargas.", ["ts.inferencia", "js.funciones"]),
      c("ts.uniones-literales", "Uniones y literales", "Uniones, intersecciones y tipos literales.", ["ts.objetos-interfaces"]),
      c("ts.narrowing", "Narrowing", "typeof, in, instanceof, igualdad y truthiness para estrechar tipos.", ["ts.uniones-literales", "js.coercion"]),
      c("ts.as-const-satisfies", "as const, satisfies y as", "Literales inmutables, comprobar sin ensanchar y aserciones.", ["ts.uniones-literales"]),
      c("ts.tipado-estructural", "Tipado estructural", "Compatibilidad por forma y comprobación de exceso de propiedades.", ["ts.objetos-interfaces"]),
      c("ts.tsconfig", "tsconfig y strict", "strict, strictNullChecks, noUncheckedIndexedAccess y compañía.", ["ts.tipos-basicos"]),
      c("ts.enums-alternativas", "Enums y alternativas", "Por qué preferir uniones de literales u objetos as const.", ["ts.uniones-literales"]),
    ],
    projects: [
      {
        id: "p07-migrar-ts",
        title: "Migrar a TypeScript",
        description: "Migra tu app de tareas vanilla a TypeScript en modo strict.",
        concepts: ["ts.narrowing", "ts.objetos-interfaces", "ts.tsconfig"],
      },
    ],
  },
  {
    id: "m08",
    number: 8,
    slug: "typescript-avanzado",
    block: "C",
    title: "TypeScript avanzado",
    summary: "Genéricos, utility types, tipos mapeados y condicionales, uniones discriminadas y Zod.",
    concepts: [
      c("ts.genericos", "Genéricos", "Funciones y tipos parametrizados, restricciones con extends.", ["ts.funciones"]),
      c("ts.utility-types", "Utility types", "Partial, Required, Pick, Omit, Record, ReturnType, Parameters, Awaited.", ["ts.genericos"]),
      c("ts.keyof-typeof", "keyof, typeof e indexado", "Derivar tipos de valores y de otros tipos.", ["ts.genericos"]),
      c("ts.mapped-types", "Tipos mapeados", "Transformar cada propiedad de un tipo.", ["ts.keyof-typeof"]),
      c("ts.conditional-types", "Tipos condicionales", "T extends U ? X : Y, distribución e infer.", ["ts.genericos"]),
      c("ts.template-literal-types", "Template literal types", "Tipos de string construidos con plantillas.", ["ts.uniones-literales", "ts.mapped-types"]),
      c("ts.uniones-discriminadas", "Uniones discriminadas", "Modelar estados válidos y exhaustividad con never.", ["ts.narrowing"]),
      c("ts.type-guards", "Type guards propios", "Predicados (x is T) y assertion functions.", ["ts.narrowing"]),
      c("ts.zod", "Zod", "Validación en runtime con inferencia de tipos (z.infer).", ["ts.uniones-discriminadas", "ts.genericos"]),
      c("ts.declaraciones", "Archivos de declaración", ".d.ts, tipar módulos y ampliar tipos de librerías.", ["ts.objetos-interfaces", "js.modulos"]),
      c("ts.api-tipada", "Datos externos tipados", "Validar en la frontera: fetch + Zod de punta a punta.", ["ts.zod", "async.fetch"]),
    ],
    projects: [
      {
        id: "p08-cliente-api",
        title: "Cliente de API tipado",
        description: "Cliente para una API pública con validación Zod y errores modelados como uniones.",
        concepts: ["ts.api-tipada", "ts.uniones-discriminadas", "ts.genericos"],
      },
    ],
  },
  {
    id: "m09",
    number: 9,
    slug: "tooling-profesional",
    block: "C",
    title: "Tooling profesional",
    summary: "Vite, ESLint, Prettier, Vitest, dependencias, variables de entorno y CI.",
    concepts: [
      c("tools.vite", "Bundlers y Vite", "Qué hace un bundler, dev server con ESM y build de producción.", ["tools.node-npm", "js.modulos"]),
      c("tools.eslint-prettier", "ESLint y Prettier", "Linting vs formateo y reglas que evitan bugs.", ["tools.node-npm"]),
      c("tools.vitest", "Vitest básico", "Escribir y ejecutar tests unitarios.", ["tools.node-npm"]),
      c("tools.semver", "Dependencias", "semver, lockfiles y actualizaciones seguras.", ["tools.node-npm"]),
      c("tools.env", "Variables de entorno", "Configuración, secretos y qué llega al navegador.", ["tools.node-npm"]),
      c("tools.ci", "CI con GitHub Actions", "Workflows que corren lint, typecheck y tests en cada PR.", ["tools.github", "tools.vitest"]),
      c("tools.debugging", "Depuración", "Breakpoints, source maps y la sentencia debugger.", ["web.devtools"]),
    ],
    projects: [
      {
        id: "p09-ci",
        title: "Repo profesional",
        description: "Configura un repo con Vite, ESLint, Prettier, Vitest y CI en GitHub Actions.",
        concepts: ["tools.ci", "tools.vite", "tools.eslint-prettier"],
      },
    ],
  },
];
