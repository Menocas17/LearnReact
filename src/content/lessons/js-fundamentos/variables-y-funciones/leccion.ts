import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const variablesYFunciones: LessonDef = {
  id: "js-fundamentos/variables-y-funciones",
  moduleId: "m02",
  slug: "variables-y-funciones",
  title: "Variables y funciones",
  summary:
    "Por qué un map con llaves no pinta nada y un onClick se dispara al renderizar: const vs let, arrow functions, return implícito, parámetros por defecto y funciones como valores.",
  concepts: ["js.variables", "js.funciones"],
  minutes: 30,
  questions: preguntas,
  exercises: ejercicios,
  videos: [],
  sources: [
    { title: "MDN: const", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/const" },
    { title: "MDN: let", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/let" },
    { title: "MDN: Funciones", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Functions" },
    {
      title: "MDN: Funciones flecha",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/Arrow_functions",
    },
    {
      title: "MDN: Parámetros predeterminados",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/Default_parameters",
    },
    {
      title: "MDN: Parámetros rest",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/rest_parameters",
    },
    {
      title: "MDN: El objeto arguments",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/arguments",
    },
    { title: "react.dev: Responder a eventos", url: "https://es.react.dev/learn/responding-to-events" },
    { title: "react.dev: Renderizado de listas", url: "https://es.react.dev/learn/rendering-lists" },
  ],
  reviewed: { date: "2026-10-14", versions: { react: "19.3", node: "22" } },
};
