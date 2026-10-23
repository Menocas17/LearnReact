import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const raceConditionsYDebounce: LessonDef = {
  id: "asincronia/race-conditions-y-debounce",
  moduleId: "m05",
  slug: "race-conditions-y-debounce",
  title: "Race conditions, debounce y throttle",
  summary:
    "Un buscador que muestra resultados viejos, pedidos duplicados y un debounce que no ahorra nada: por qué un solo hilo también tiene carreras, cómo hacer que gane la última petición en salir y cómo limitar la frecuencia con debounce y throttle.",
  concepts: ["async.race-conditions", "async.debounce-throttle"],
  minutes: 55,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "cjIswDCKgu0",
      title: "Learn Debounce And Throttle In 16 Minutes",
      channel: "Web Dev Simplified",
      lang: "en",
      focus:
        "Fíjate en la comparación, con la misma entrada, de lo que se ejecuta sin limitar, con debounce y con throttle; contrástalo con las líneas de tiempo de la lección.",
    },
  ],
  sources: [
    {
      title: "react.dev: Puede que no necesites un efecto (obtener datos)",
      url: "https://es.react.dev/learn/you-might-not-need-an-effect#fetching-data",
    },
    {
      title: "react.dev: useEffect, obtener datos con efectos",
      url: "https://es.react.dev/reference/react/useEffect#fetching-data-with-effects",
    },
    {
      title: "react.dev: useDeferredValue (diferir un valor vs debounce y throttle)",
      url: "https://es.react.dev/reference/react/useDeferredValue",
    },
    { title: "MDN: Debounce", url: "https://developer.mozilla.org/en-US/docs/Glossary/Debounce" },
    { title: "MDN: Throttle", url: "https://developer.mozilla.org/en-US/docs/Glossary/Throttle" },
    { title: "MDN: AbortController", url: "https://developer.mozilla.org/en-US/docs/Web/API/AbortController" },
  ],
  reviewed: { date: "2026-10-14", versions: { react: "19.3", node: "22" } },
};
