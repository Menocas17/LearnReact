import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const modulosYErrores: LessonDef = {
  id: "js-profundo/modulos-y-errores",
  moduleId: "m03",
  slug: "modulos-y-errores",
  title: "Módulos y errores",
  summary:
    "Dos tickets: un Next.js que filtra nombres entre usuarios y un error boundary que no ve el error de Guardar. De la era de los script tags a los módulos ES (evaluación única, live bindings, import()) y de throw a Error.cause: cómo viaja un error y dónde se puede capturar.",
  concepts: ["js.modulos", "js.errores"],
  minutes: 50,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "0t-Le4kdaMg",
      title: "Import y Export en Javascript (ES Modules) - Explicación",
      channel: "Fazt Code",
      lang: "es",
      focus: "La sintaxis de named y default exports en archivos reales; la lección cubre lo que el video no: evaluación única y live bindings.",
    },
  ],
  sources: [
    { title: "MDN: Módulos JavaScript", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules" },
    { title: "MDN: import", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/import" },
    { title: "MDN: export", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/export" },
    { title: "MDN: import()", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import" },
    { title: "MDN: try...catch", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/try...catch" },
    { title: "MDN: Error", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Error" },
    { title: "MDN: Error.prototype.cause", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Error/cause" },
    { title: "react.dev: lazy", url: "https://es.react.dev/reference/react/lazy" },
    {
      title: "react.dev: Capturar errores de renderizado con un error boundary",
      url: "https://es.react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary",
    },
  ],
  reviewed: { date: "2026-10-12", versions: { react: "19.3", next: "16.4", node: "22" } },
};
