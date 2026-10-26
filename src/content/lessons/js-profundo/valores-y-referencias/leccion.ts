import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const valoresYReferencias: LessonDef = {
  id: "js-profundo/valores-y-referencias",
  moduleId: "m03",
  slug: "valores-y-referencias",
  title: "Valores y referencias",
  summary:
    "Un ticket con tres bugs de React y una sola causa: variables como fichas que llevan a cajas compartidas, comparación por identidad y cómo copiar solo el camino para actualizar estado sin mutarlo.",
  concepts: ["js.valor-referencia", "js.inmutabilidad"],
  minutes: 45,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "goeSKnHqJJk",
      title: "16. Valor y Referencia - JavaScript: la guía completa",
      channel: "Marluan Espiritusanto",
      lang: "es",
      focus: "Cómo una variable con un objeto guarda una referencia y qué pasa al asignarla a otra variable o pasarla a una función.",
    },
    {
      youtubeId: "-hBJz2PPIVE",
      title: "Reference Vs Value In JavaScript",
      channel: "Web Dev Simplified",
      lang: "en",
      focus: "El modelo mental de variables que apuntan a direcciones de memoria; fíjate en la diferencia entre reasignar y mutar.",
    },
  ],
  sources: [
    { title: "MDN: Estructuras de datos y tipos en JavaScript", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Data_structures" },
    { title: "MDN: Comparaciones de igualdad e identidad", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness" },
    { title: "MDN: Object.is()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/is" },
    { title: "MDN: Copia superficial", url: "https://developer.mozilla.org/es/docs/Glossary/Shallow_copy" },
    { title: "MDN: Deep copy", url: "https://developer.mozilla.org/en-US/docs/Glossary/Deep_copy" },
    { title: "MDN: structuredClone()", url: "https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone" },
    { title: "MDN: Object.freeze()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze" },
    { title: "MDN: Array.prototype.toSorted()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted" },
    { title: "TC39: propuesta Record & Tuple (retirada)", url: "https://github.com/tc39/proposal-record-tuple" },
    { title: "react.dev: Actualizar objetos en el estado", url: "https://es.react.dev/learn/updating-objects-in-state" },
    { title: "react.dev: Actualizar arrays en el estado", url: "https://es.react.dev/learn/updating-arrays-in-state" },
    { title: "react.dev: useEffect — eliminar dependencias de objetos innecesarias", url: "https://es.react.dev/reference/react/useEffect#removing-unnecessary-object-dependencies" },
  ],
  reviewed: { date: "2026-10-12", versions: { react: "19.3", node: "22" } },
};
