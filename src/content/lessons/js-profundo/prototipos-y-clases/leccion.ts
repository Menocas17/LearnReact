import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const prototiposYClases: LessonDef = {
  id: "js-profundo/prototipos-y-clases",
  moduleId: "m03",
  slug: "prototipos-y-clases",
  title: "Prototipos y clases",
  summary:
    "Qué es de verdad una clase en JavaScript: la cadena de prototipos, por qué todos los arrays tienen map y cómo escribir error boundaries y errores propios con class.",
  concepts: ["js.prototipos", "js.clases"],
  minutes: 40,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "nS5FmAx4u_0",
      title: "Curso JavaScript: 22. Prototipos - #jonmircha",
      channel: "jonmircha",
      lang: "es",
      focus: "Cómo se escribían las \"clases\" antes de class con funciones constructoras y .prototype; compáralo con lo que hace class por debajo.",
    },
    {
      youtubeId: "GhJTy5-X3kA",
      title: "Understanding the JavaScript Prototype Chain",
      channel: "Steve Griffith - Prof3ssorSt3v3",
      lang: "en",
      focus: "Recorrido de la cadena en la consola del navegador: fíjate en cómo se sube eslabón a eslabón hasta Object.prototype y null.",
    },
  ],
  sources: [
    {
      title: "MDN: Herencia y la cadena de prototipos",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain",
    },
    {
      title: "MDN: Object.create()",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/create",
    },
    {
      title: "MDN: Object.getPrototypeOf()",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf",
    },
    {
      title: "MDN: Object.hasOwn()",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn",
    },
    { title: "MDN: Clases", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes" },
    {
      title: "MDN: Elementos privados",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Classes/Private_elements",
    },
    {
      title: "MDN: Error (tipos de error personalizados)",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Error",
    },
    {
      title: "react.dev: Capturar errores de renderizado con un Error Boundary",
      url: "https://es.react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
    },
  ],
  reviewed: { date: "2026-10-12", versions: { react: "19.3", node: "22" } },
};
