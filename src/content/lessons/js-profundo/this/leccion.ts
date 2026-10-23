import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const thisLesson: LessonDef = {
  id: "js-profundo/this",
  moduleId: "m03",
  slug: "this",
  title: "this",
  summary:
    "Un editor de clases que pierde this al hacer clic: por qué JavaScript decide this en cada llamada, cómo lo fijan bind y las arrow functions, y por qué React acabó en los hooks.",
  concepts: ["js.this", "js.call-apply-bind", "js.modo-estricto"],
  minutes: 50,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "qy6IIjlykD0",
      title: "Curso JavaScript: 58. call, apply, bind - #jonmircha",
      channel: "jonmircha",
      lang: "es",
      focus: "Las diferencias prácticas entre call, apply y bind; fíjate en que bind no ejecuta la función, devuelve otra.",
    },
    {
      youtubeId: "2mRN8FyjnE4",
      title: "JavaScript \"this\" Keyword Explained",
      channel: "dcode",
      lang: "en",
      focus: "Repaso de los casos de this con ejemplos cortos; compáralos con la tabla de reglas de la lección.",
    },
  ],
  sources: [
    { title: "MDN: this", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/this" },
    { title: "MDN: Function.prototype.call()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Function/call" },
    { title: "MDN: Function.prototype.apply()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Function/apply" },
    { title: "MDN: Function.prototype.bind()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Function/bind" },
    { title: "MDN: Funciones flecha", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/Arrow_functions" },
    { title: "MDN: Modo estricto", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Strict_mode" },
    { title: "MDN: EventTarget.addEventListener() (el valor de this)", url: "https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#the_value_of_this_within_the_handler" },
    { title: "react.dev: Component (API de clases heredada)", url: "https://es.react.dev/reference/react/Component" },
  ],
  reviewed: { date: "2026-10-12", versions: { node: "22", react: "19.3" } },
};
