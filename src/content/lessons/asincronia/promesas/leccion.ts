import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const promesas: LessonDef = {
  id: "asincronia/promesas",
  moduleId: "m05",
  slug: "promesas",
  title: "Promesas",
  summary:
    "Un dashboard que tarda el triple y se cae por lo menos importante: de los callbacks a las promesas, por qué se asientan una sola vez, cómo se encadenan y propagan errores, y Promise.all, allSettled, race y any.",
  concepts: ["async.promesas", "async.combinadores"],
  minutes: 60,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "ZTC0Gfhdzfc",
      title: "Promesas – JavaScript hecho fácil",
      channel: "makigas",
      lang: "es",
      focus: "Cómo se construye una promesa con new Promise y cómo se consumen con then y catch; repasa los estados con la tabla de esta lección.",
    },
    {
      youtubeId: "DHvZLI7Db8E",
      title: "JavaScript Promises In 10 Minutes",
      channel: "Web Dev Simplified",
      lang: "en",
      focus: "La parte final, donde compara Promise.all y Promise.race con varias promesas a la vez.",
    },
  ],
  sources: [
    { title: "MDN: Promise", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise" },
    { title: "MDN: Usar promesas", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Using_promises" },
    { title: "MDN: Promise.prototype.then()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/then" },
    { title: "MDN: Promise.prototype.finally()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally" },
    { title: "MDN: Promise.all()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/all" },
    { title: "MDN: Promise.allSettled()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled" },
    { title: "MDN: Promise.race()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/race" },
    { title: "MDN: Promise.any()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise/any" },
    { title: "MDN: AggregateError", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/AggregateError" },
    { title: "MDN: unhandledrejection", url: "https://developer.mozilla.org/es/docs/Web/API/Window/unhandledrejection_event" },
    { title: "Next.js: Fetching Data (patrones secuencial y paralelo)", url: "https://nextjs.org/docs/app/getting-started/fetching-data" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", next: "16" } },
};
