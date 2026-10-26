import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const objetosYColecciones: LessonDef = {
  id: "js-profundo/objetos-y-colecciones",
  moduleId: "m03",
  slug: "objetos-y-colecciones",
  title: "Objetos y colecciones",
  summary:
    "Por qué un objeto hizo de diccionario durante años y dónde falla (orden de claves, claves de papel, propiedades heredadas), qué arreglan Map, Set y WeakMap, y cómo funcionan iteradores y generadores.",
  concepts: ["js.objetos-avanzado", "js.map-set", "js.iteradores-generadores"],
  minutes: 50,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "vra1CscMtQs",
      title: "MAP Y SET EN JAVASCRIPT",
      channel: "Vida MRR - Programacion web",
      lang: "es",
      focus: "Las operaciones básicas de Map y Set (set, get, has, delete, size) y cómo se recorren con for...of.",
    },
    {
      youtubeId: "k2kVPWPmagQ",
      title: "JavaScript Generators in 7 Minutes: What They Are and How They're the Overpowered Iterator",
      channel: "Ijemma Onwuzulike",
      lang: "en",
      focus: "Cómo cada next() reanuda el generador justo después del último yield y lo pausa en el siguiente.",
    },
  ],
  sources: [
    { title: "MDN: Object.entries()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/entries" },
    { title: "MDN: Object.fromEntries()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries" },
    { title: "MDN: Object.defineProperty()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty" },
    { title: "MDN: Object.hasOwn()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn" },
    { title: "MDN: get", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/get" },
    { title: "MDN: Colecciones con clave (Map y Set)", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Keyed_collections" },
    { title: "MDN: Map", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Map" },
    { title: "MDN: WeakMap", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/WeakMap" },
    { title: "MDN: Igualdad y SameValueZero", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Equality_comparisons_and_sameness" },
    { title: "MDN: Iteradores y generadores", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Iterators_and_generators" },
    { title: "MDN: Protocolos de iteración", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Iteration_protocols" },
    { title: "Redux: Normalizar la forma del estado", url: "https://redux.js.org/usage/structuring-reducers/normalizing-state-shape" },
  ],
  reviewed: { date: "2026-10-12", versions: { node: "22" } },
};
