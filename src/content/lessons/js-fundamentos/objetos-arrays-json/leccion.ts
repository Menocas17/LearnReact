import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const objetosArraysJson: LessonDef = {
  id: "js-fundamentos/objetos-arrays-json",
  moduleId: "m02",
  slug: "objetos-arrays-json",
  title: "Objetos, arrays y JSON",
  summary:
    "Por qué createdAt.getTime() explota con datos de una API y localStorage guarda \"[object Object]\": acceso a propiedades, arrays que mutan y lo que JSON pierde por el camino.",
  concepts: ["js.objetos", "js.arrays", "js.json"],
  minutes: 35,
  questions: preguntas,
  exercises: ejercicios,
  videos: [],
  sources: [
    { title: "MDN: Trabajando con objetos", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Working_with_objects" },
    { title: "MDN: Accesores de propiedad", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Property_accessors" },
    { title: "MDN: Array", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array" },
    { title: "MDN: Array.prototype.toSpliced()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced" },
    { title: "MDN: JSON.stringify()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify" },
    { title: "MDN: JSON.parse()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" },
    { title: "Next.js: Pasar datos de Server a Client Components", url: "https://nextjs.org/docs/app/getting-started/server-and-client-components#passing-data-from-server-to-client-components" },
    { title: "react.dev: Parámetros y valores serializables", url: "https://react.dev/reference/rsc/use-server#serializable-parameters-and-return-values" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", next: "16" } },
};
