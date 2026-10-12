import type { LessonDef } from "@/content/types";
import { contador, once } from "./ejercicios";
import { preguntas } from "./preguntas";

export const closures: LessonDef = {
  id: "js-profundo/closures",
  moduleId: "m03",
  slug: "closures",
  title: "Closures",
  summary:
    "Por qué un setInterval dentro de useEffect se queda atascado: funciones que recuerdan el scope donde nacieron.",
  concepts: ["js.closures", "react.stale-closures"],
  minutes: 35,
  questions: preguntas,
  exercises: [once, contador],
  videos: [
    {
      youtubeId: "xa8lhVwQBw4",
      title: "CLOSURES en JavaScript: Qué son y cómo funcionan",
      channel: "Carlos Azaustre - AprendiendoDEV",
      lang: "es",
      focus: "Cómo la función interna conserva acceso a las variables de la externa cuando esta ya terminó.",
    },
    {
      youtubeId: "3a0I8ICR1Vg",
      title: "Learn Closures In 7 Minutes",
      channel: "Web Dev Simplified",
      lang: "en",
      focus: "Repaso rápido con ejemplos; fíjate en cómo cada llamada crea un entorno nuevo.",
    },
  ],
  sources: [
    { title: "MDN: Closures", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Closures" },
    { title: "react.dev: El estado como una instantánea", url: "https://es.react.dev/learn/state-as-a-snapshot" },
    { title: "react.dev: Actualizar el estado basándote en el anterior", url: "https://es.react.dev/reference/react/useState#updating-state-based-on-the-previous-state" },
  ],
  reviewed: { date: "2026-10-12", versions: { react: "19.3", node: "22" } },
};
