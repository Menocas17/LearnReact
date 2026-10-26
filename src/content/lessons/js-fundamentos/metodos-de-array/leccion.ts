import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const metodosDeArray: LessonDef = {
  id: "js-fundamentos/metodos-de-array",
  moduleId: "m02",
  slug: "metodos-de-array",
  title: "Métodos de array",
  summary:
    "Un catálogo que desordena otro componente: los métodos de array como una cadena de montaje, qué sale de cada estación, cuáles tocan la cinta original y las trampas (parseInt, arrays vacíos, sort que compara como strings).",
  concepts: ["js.metodos-array"],
  minutes: 55,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "tP8JiVUiyDo",
      title: "19. MAP, FILTER y REDUCE EN JAVASCRIPT",
      channel: "La Cocina del Código",
      lang: "es",
      focus: "Repaso de los tres métodos base; fíjate en qué recibe el callback de reduce y en el papel del valor inicial.",
    },
    {
      youtubeId: "mSBnJvHtgD0",
      title: "20+ Must Know Array Methods That Almost Nobody Knows",
      channel: "Web Dev Simplified",
      lang: "en",
      focus: "Recorrido por métodos menos conocidos; para cada uno, fíjate en si devuelve un array nuevo o muta el original.",
    },
  ],
  sources: [
    { title: "MDN: Array", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array" },
    { title: "MDN: Array.prototype.map()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/map" },
    { title: "MDN: Array.prototype.reduce()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce" },
    { title: "MDN: Array.prototype.sort()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/sort" },
    { title: "MDN: Array.prototype.toSorted()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted" },
    { title: "MDN: Array.prototype.every()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/every" },
    { title: "MDN: Array.from()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/from" },
    { title: "MDN: Object.groupBy()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/groupBy" },
    { title: "MDN: String.prototype.localeCompare()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare" },
    { title: "react.dev: Renderizado de listas", url: "https://es.react.dev/learn/rendering-lists" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", ecmascript: "2024", react: "19.3" } },
};
