import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const asyncAwait: LessonDef = {
  id: "asincronia/async-await",
  moduleId: "m05",
  slug: "async-await",
  title: "async/await y errores asíncronos",
  summary:
    "Por qué un try/catch no ve el error y un forEach con async termina antes de tiempo: qué hace realmente await, promesas flotantes, secuencial vs paralelo, y async en useEffect y Server Components.",
  concepts: ["async.async-await", "js.errores"],
  minutes: 40,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "vn3tm0quoqE",
      title: "The Async Await Episode I Promised",
      channel: "Fireship",
      lang: "en",
      focus:
        "Repaso rápido y visual de async/await. Míralo después de la lección y comprueba que reconoces lo que has visto aquí: microtareas, manejo de errores y ejecución en serie frente a en paralelo.",
    },
  ],
  sources: [
    { title: "MDN: async function", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/async_function" },
    { title: "MDN: await", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/await" },
    { title: "MDN: Array.prototype.forEach()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach" },
    { title: "MDN: Promise.all()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/all" },
    { title: "MDN: AggregateError", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/AggregateError" },
    { title: "react.dev: useEffect (obtener datos con Efectos)", url: "https://es.react.dev/reference/react/useEffect#fetching-data-with-effects" },
    { title: "Next.js: Fetching Data", url: "https://nextjs.org/docs/app/getting-started/fetching-data" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", react: "19.3", next: "16.4" } },
};
