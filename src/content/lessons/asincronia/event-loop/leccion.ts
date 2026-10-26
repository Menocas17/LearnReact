import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const eventLoop: LessonDef = {
  id: "asincronia/event-loop",
  moduleId: "m05",
  slug: "event-loop",
  title: "El event loop",
  summary:
    "Un botón que dice \"Exportando…\" y nunca se ve: un solo cocinero, un riel de tareas, notas de microtareas y el pintado entre medias. Timers, INP, requestAnimationFrame y por qué React agrupa tus setState.",
  concepts: ["async.event-loop", "async.callbacks", "async.render-navegador"],
  minutes: 50,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "8aGhZQkoFbQ",
      title: "What the heck is the event loop anyway? | Philip Roberts | JSConf EU",
      channel: "JSConf",
      lang: "en",
      focus:
        "La animación del call stack, las Web APIs y la cola de callbacks. Es de 2014 y no habla de microtareas: complétala con esta lección.",
    },
    {
      youtubeId: "cCOL7MC4Pl0",
      title: "Jake Archibald on the web browser event loop, setTimeout, micro tasks, requestAnimationFrame, ...",
      channel: "JSConf",
      lang: "en",
      focus:
        "Dónde encaja el pintado dentro del loop, por qué un bucle de microtareas congela la página y cuándo se ejecuta requestAnimationFrame.",
    },
  ],
  sources: [
    {
      title: "MDN: El modelo de ejecución de JavaScript",
      url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Execution_model",
    },
    {
      title: "MDN: In depth: Microtasks and the JavaScript runtime environment",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth",
    },
    {
      title: "MDN: Using microtasks in JavaScript with queueMicrotask()",
      url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide",
    },
    { title: "MDN: setTimeout()", url: "https://developer.mozilla.org/es/docs/Web/API/Window/setTimeout" },
    { title: "MDN: setInterval()", url: "https://developer.mozilla.org/es/docs/Web/API/Window/setInterval" },
    {
      title: "MDN: requestAnimationFrame()",
      url: "https://developer.mozilla.org/es/docs/Web/API/Window/requestAnimationFrame",
    },
    {
      title: "HTML Standard: Event loops",
      url: "https://html.spec.whatwg.org/multipage/webappapis.html#event-loops",
    },
    { title: "web.dev: Optimize long tasks", url: "https://web.dev/articles/optimize-long-tasks" },
    { title: "web.dev: Interaction to Next Paint (INP)", url: "https://web.dev/articles/inp" },
    {
      title: "react.dev: Poner en cola una serie de actualizaciones del estado",
      url: "https://es.react.dev/learn/queueing-a-series-of-state-updates",
    },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", react: "19.3" } },
};
