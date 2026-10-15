import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const fetchYCancelacion: LessonDef = {
  id: "asincronia/fetch-y-cancelacion",
  moduleId: "m05",
  slug: "fetch-y-cancelacion",
  title: "fetch y cancelación",
  summary:
    "Por qué tu pantalla de error nunca sale con un 500 y por qué un perfil muestra al usuario equivocado: Response, res.ok, el cuerpo que se lee una vez y AbortController.",
  concepts: ["async.fetch", "async.abort"],
  minutes: 40,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "FJ-w0tf3d_w",
      title: "Cómo CONSUMIR una API REST con JAVASCRIPT y Fetch + Promises con gestión de Errores",
      channel: "midulive",
      lang: "es",
      focus: "Cómo se comprueba la respuesta antes de usar los datos; compáralo con el patrón if (!res.ok) throw de esta lección.",
    },
    {
      youtubeId: "bLpA9tvABb8",
      title: "How To Abort A Fetch Request With AbortController In JavaScript",
      channel: "Conner Ardman",
      lang: "en",
      focus: "Qué error produce una petición abortada y cómo distinguirlo de un fallo real en el catch.",
    },
  ],
  sources: [
    { title: "MDN: Uso de Fetch", url: "https://developer.mozilla.org/es/docs/Web/API/Fetch_API/Using_Fetch" },
    { title: "MDN: Response", url: "https://developer.mozilla.org/es/docs/Web/API/Response" },
    { title: "MDN: AbortController", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController" },
    { title: "MDN: AbortSignal.timeout()", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static" },
    { title: "MDN: AbortSignal.any()", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static" },
    { title: "react.dev: Sincronizar con Efectos (obtener datos)", url: "https://es.react.dev/learn/synchronizing-with-effects#fetching-data" },
    { title: "react.dev: Quizás no necesites un Efecto (obtener datos)", url: "https://es.react.dev/learn/you-might-not-need-an-effect#fetching-data" },
    { title: "Next.js: Fetching Data (node_modules/next/dist/docs)", url: "https://nextjs.org/docs/app/getting-started/fetching-data" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", react: "19.3", next: "16.4" } },
};
