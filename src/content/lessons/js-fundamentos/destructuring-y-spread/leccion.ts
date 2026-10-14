import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const destructuringYSpread: LessonDef = {
  id: "js-fundamentos/destructuring-y-spread",
  moduleId: "m02",
  slug: "destructuring-y-spread",
  title: "Destructuring y spread",
  summary:
    "Por qué el className que le pasas a un Button desaparece: destructuring con valores por defecto, rest para separar props y spread, donde el orden decide quién gana.",
  concepts: ["js.destructuring", "js.spread-rest"],
  minutes: 35,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "Qyn8xDb5lRo",
      title: "DESESTRUCTURACIÓN en #JAVASCRIPT y #TYPESCRIPT: extrae datos de objetos y arrays 💯",
      channel: "EfisioDev | Aprende Angular",
      lang: "es",
      focus: "Repaso en español de la sintaxis (renombrar, valores por defecto, anidado); compáralo con las trampas de null y del nivel intermedio de esta lección.",
    },
    {
      youtubeId: "UgEaJBz3bjY",
      title: "JS Destructuring in 100 Seconds",
      channel: "Fireship",
      lang: "en",
      focus: "Resumen ultrarrápido de objetos, arrays y parámetros; útil como repaso después de leer la lección.",
    },
  ],
  sources: [
    { title: "MDN: Desestructuración", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Destructuring" },
    { title: "MDN: Sintaxis de propagación (spread)", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Spread_syntax" },
    { title: "MDN: Parámetros rest", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/rest_parameters" },
    { title: "MDN: Parámetros predeterminados", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Functions/Default_parameters" },
    { title: "react.dev: Pasar props a un componente", url: "https://es.react.dev/learn/passing-props-to-a-component" },
    { title: "react.dev: useState", url: "https://es.react.dev/reference/react/useState" },
  ],
  reviewed: { date: "2026-10-14", versions: { react: "19.3", node: "22" } },
};
