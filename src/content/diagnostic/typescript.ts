import type { DiagnosticSection } from "../types";
import { code, opts } from "./helpers";

export const typescript: DiagnosticSection = {
  id: "typescript",
  title: "TypeScript",
  description: "Del modelo de tipos a genéricos, uniones discriminadas y Zod.",
  modules: ["m07", "m08"],
  questions: [
    {
      id: "diag-ts-runtime",
      kind: "opcion",
      concepts: ["ts.por-que", "ts.api-tipada"],
      difficulty: "base",
      prompt: "La API devuelve { \"name\": \"Ana\" } (sin age). ¿Qué ocurre?",
      code: code("ts", `
type User = { name: string; age: number };

const data: User = await fetch("/api/user").then((r) => r.json());
console.log(data.age.toFixed(0));
`),
      options: opts(
        "No compila porque la API no devuelve age",
        "Compila, y en runtime data.age es undefined, así que toFixed lanza un TypeError",
        "TypeScript lanza un error de validación en runtime al asignar data",
        "Compila y age vale 0 por defecto",
      ),
      correct: "b",
      explanation:
        "Los tipos se borran al compilar: TypeScript no valida datos en runtime. r.json() devuelve any, así que la anotación User es una afirmación que nadie comprueba. Para datos externos necesitas validación en runtime (por ejemplo, Zod).",
    },
    {
      id: "diag-ts-unknown",
      kind: "opcion",
      concepts: ["ts.tipos-basicos"],
      difficulty: "base",
      prompt: "¿Cuál es la diferencia práctica entre any y unknown?",
      options: opts(
        "Ninguna: son sinónimos",
        "unknown no permite asignarle valores",
        "Con unknown no puedes usar el valor hasta estrecharlo (narrowing); con any puedes hacer cualquier cosa sin comprobación",
        "any solo acepta objetos y unknown acepta cualquier tipo",
      ),
      correct: "c",
      explanation:
        "Ambos aceptan cualquier valor, pero any desactiva el sistema de tipos para ese valor. unknown es la versión segura: te obliga a comprobar el tipo (typeof, instanceof, un esquema…) antes de usarlo.",
    },
    {
      id: "diag-ts-narrowing-null",
      kind: "opcion",
      concepts: ["ts.narrowing"],
      difficulty: "trampa",
      prompt: "Con strict activado, ¿compila esta función?",
      code: code("ts", `
function len(value: string | string[] | null) {
  if (typeof value === "object") {
    return value.length;
  }
  return value.length;
}
`),
      options: opts(
        "Sí, todas las ramas son correctas",
        "No: dentro del if value es string[] | null, porque typeof null es \"object\"",
        "No: en el return final value puede ser string[]",
        "Sí, pero solo porque length existe en string y en arrays",
      ),
      correct: "b",
      explanation:
        "TypeScript conoce la rareza de typeof null === \"object\", así que dentro del if value puede ser null y value.length da error. Hay que excluir null antes (if (value === null) …) o usar Array.isArray.",
    },
    {
      id: "diag-ts-union-discriminada",
      kind: "opcion",
      concepts: ["ts.uniones-discriminadas"],
      difficulty: "base",
      prompt: "¿Qué tipo modela mejor el estado de una petición?",
      code: code("ts", `
// A
type StateA = { loading: boolean; error?: string; data?: User };

// B
type StateB =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: string };
`),
      options: opts(
        "A, porque es más corto",
        "B, porque hace imposibles combinaciones inválidas (como loading con error y data a la vez) y TypeScript estrecha el tipo según status",
        "Son equivalentes",
        "Ninguno: el estado de una petición no se debe tipar",
      ),
      correct: "b",
      explanation:
        "A permite 8 combinaciones, la mayoría absurdas. Con la unión discriminada, al comprobar status === \"success\" TypeScript sabe que data existe. Es el patrón más útil de TypeScript en React.",
    },
    {
      id: "diag-ts-generico-inferencia",
      kind: "opcion",
      concepts: ["ts.genericos", "ts.inferencia"],
      difficulty: "trampa",
      prompt: "¿Qué tipo infiere TypeScript para a?",
      code: code("ts", `
function first<T>(items: T[]): T | undefined {
  return items[0];
}
const a = first([1, "dos"]);
`),
      options: opts("number", "string | number | undefined", "unknown", "(string | number)[]"),
      correct: "b",
      explanation:
        "T se infiere a partir del argumento: el array es (string | number)[], así que T es string | number y el retorno es T | undefined.",
    },
    {
      id: "diag-ts-satisfies",
      kind: "opcion",
      concepts: ["ts.as-const-satisfies"],
      difficulty: "trampa",
      prompt: "¿Qué tipo tiene routes.home y qué pasa con routes.contacto?",
      code: code("ts", `
const routes = {
  home: "/",
  profile: "/perfil",
} satisfies Record<string, string>;
`),
      options: opts(
        "routes.home es \"/\" y routes.contacto es string",
        "routes.home es string y routes.contacto da error porque esa clave no existe",
        "routes.home es string y routes.contacto es string | undefined",
        "routes.home es Record<string, string> y routes.contacto da error",
      ),
      correct: "b",
      explanation:
        "satisfies comprueba que el valor cumple el tipo sin cambiar el tipo inferido: se conservan las claves concretas (contacto da error), pero sin as const los strings se ensanchan a string. Si anotaras const routes: Record<string, string>, perderías las claves y contacto sería válido.",
    },
    {
      id: "diag-ts-utility",
      kind: "opcion",
      concepts: ["ts.utility-types", "ts.keyof-typeof"],
      difficulty: "base",
      prompt: "¿Cuál produce { id: string; name: string; email: string }?",
      code: code("ts", `
type User = { id: string; name: string; email: string; password: string };
`),
      options: opts(
        "Omit<User, \"password\">",
        "Pick<User, \"password\">",
        "Partial<User>",
        "Exclude<User, \"password\">",
      ),
      correct: "a",
      explanation:
        "Omit quita claves de un tipo objeto. Exclude trabaja sobre uniones (quita miembros de una unión), no sobre claves de un objeto: Exclude<User, \"password\"> devuelve User tal cual.",
    },
    {
      id: "diag-ts-zod-vs-as",
      kind: "opcion",
      concepts: ["ts.zod", "ts.type-guards"],
      difficulty: "base",
      prompt: "¿Qué aporta UserSchema.parse(json) frente a json as User?",
      options: opts(
        "Nada: ambos le dicen a TypeScript que json es un User",
        "parse valida los datos en runtime y lanza si no cumplen el esquema; as solo silencia al compilador",
        "as es más seguro porque lo comprueba el compilador",
        "parse solo funciona con datos que vienen de formularios",
      ),
      correct: "b",
      explanation:
        "as es una aserción: no genera código ni comprueba nada. Zod valida la forma real de los datos y, con z.infer, te da el tipo derivado del mismo esquema, así que tipo y validación no se desincronizan.",
    },
    {
      id: "diag-ts-condicional-distributivo",
      kind: "opcion",
      concepts: ["ts.conditional-types"],
      difficulty: "trampa",
      prompt: "¿Qué tipo es X?",
      code: code("ts", `
type ToArray<T> = T extends unknown ? T[] : never;
type X = ToArray<string | number>;
`),
      options: opts("(string | number)[]", "string[] | number[]", "never", "unknown[]"),
      correct: "b",
      explanation:
        "Los tipos condicionales sobre un parámetro genérico desnudo son distributivos: se aplican a cada miembro de la unión por separado. Para evitarlo se envuelve: [T] extends [unknown] ? T[] : never.",
    },
  ],
};
