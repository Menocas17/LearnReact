import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const tiposYCoercion: LessonDef = {
  id: "js-fundamentos/tipos-y-coercion",
  moduleId: "m02",
  slug: "tipos-y-coercion",
  title: "Tipos y coerción",
  summary:
    "Un carrito que muestra \"21\" y confunde el 0 con el vacío: por qué JavaScript cambia tipos en vez de fallar, y las reglas de typeof, operadores, coerción e igualdad.",
  concepts: ["js.valores-tipos", "js.operadores", "js.coercion"],
  minutes: 55,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "qhTnGhgPOwU",
      title: "Stop Using == Use === Instead",
      channel: "Web Dev Simplified",
      lang: "en",
      focus: "Los casos en que == convierte tipos sin avisar y por qué === elimina esa clase de bugs.",
    },
    {
      youtubeId: "00vjwv2BJqE",
      title: "Coercion and Type Conversion in JavaScript, Simplified",
      channel: "Deeecode",
      lang: "en",
      focus: "La diferencia entre conversión explícita (Number, String, Boolean) e implícita, y qué operador dispara cada una.",
    },
  ],
  sources: [
    { title: "MDN: Tipos y estructuras de datos en JavaScript", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Data_structures" },
    { title: "MDN: typeof", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/typeof" },
    { title: "MDN: Precedencia de operadores", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Operator_precedence" },
    { title: "MDN: Comparaciones de igualdad y semejanza", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness" },
    { title: "MDN: Coerción de tipos", url: "https://developer.mozilla.org/es/docs/Glossary/Type_coercion" },
    { title: "MDN: Truthy", url: "https://developer.mozilla.org/es/docs/Glossary/Truthy" },
    { title: "MDN: Falsy", url: "https://developer.mozilla.org/en-US/docs/Glossary/Falsy" },
    { title: "MDN: Number.isNaN()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN" },
    { title: "Wirfs-Brock y Eich: JavaScript: The First 20 Years (HOPL 2020)", url: "https://dl.acm.org/doi/10.1145/3386327" },
    { title: "Chrome for Developers: #SmooshGate FAQ", url: "https://developer.chrome.com/blog/smooshgate" },
    { title: "react.dev: useState (comparación con Object.is)", url: "https://es.react.dev/reference/react/useState" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", react: "19.3" } },
};
