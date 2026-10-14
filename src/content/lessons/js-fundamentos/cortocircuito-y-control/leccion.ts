import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const cortocircuitoYControl: LessonDef = {
  id: "js-fundamentos/cortocircuito-y-control",
  moduleId: "m02",
  slug: "cortocircuito-y-control",
  title: "Cortocircuito y control de flujo",
  summary:
    "Por qué {items.length && <List />} pinta un 0 y config.timeout || 3000 ignora un 0 legítimo: &&, ||, ??, ?. y las estructuras de control sin sorpresas.",
  concepts: ["js.cortocircuito", "js.control-flujo"],
  minutes: 35,
  questions: preguntas,
  exercises: ejercicios,
  videos: [],
  sources: [
    { title: "MDN: AND lógico (&&)", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Logical_AND" },
    { title: "MDN: OR lógico (||)", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Logical_OR" },
    { title: "MDN: Operador de coalescencia nula (??)", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing" },
    { title: "MDN: Encadenamiento opcional (?.)", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Optional_chaining" },
    { title: "MDN: Nullish coalescing assignment (??=)", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment" },
    { title: "MDN: Operador condicional (ternario)", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Conditional_operator" },
    { title: "MDN: switch", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/switch" },
    { title: "MDN: for...of", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/for...of" },
    { title: "MDN: for...in", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/for...in" },
    { title: "MDN: label", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/label" },
    { title: "react.dev: Renderizado condicional", url: "https://es.react.dev/learn/conditional-rendering" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", react: "19.3" } },
};
