import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const objetosArraysJson: LessonDef = {
  id: "js-fundamentos/objetos-arrays-json",
  moduleId: "m02",
  slug: "objetos-arrays-json",
  title: "Objetos, arrays y JSON",
  summary:
    "Un ticket con tres fallos (una fecha que llega como string, un carrito guardado como \"[object Object]\" y un sort que React no ve) para entender objetos y arrays como cajas con etiquetas y JSON como la carta en la que viajan.",
  concepts: ["js.objetos", "js.arrays", "js.json"],
  minutes: 45,
  questions: preguntas,
  exercises: ejercicios,
  videos: [],
  sources: [
    { title: "MDN: Trabajando con objetos", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Working_with_objects" },
    { title: "MDN: Accesores de propiedad", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Operators/Property_accessors" },
    { title: "MDN: Array", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array" },
    { title: "MDN: Array.prototype.toSpliced()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/toSpliced" },
    { title: "MDN: JSON.stringify()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify" },
    { title: "json.org: Introducing JSON", url: "https://www.json.org/json-es.html" },
    { title: "Douglas Crockford: The Discovery of JSON (2008)", url: "https://nofluffjuststuff.com/blog/douglas_crockford/2008/01/the_discovery_of_json" },
    { title: "Douglas Crockford: The JSON Saga (transcripción de la charla)", url: "https://mamund.site44.com/rwcbook/the-json-saga/index.html" },
    { title: "TC39: propuesta JSON superset (ES2019)", url: "https://github.com/tc39/proposal-json-superset" },
    { title: "MDN: JSON.parse()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" },
    { title: "Next.js: Pasar datos de Server a Client Components", url: "https://nextjs.org/docs/app/getting-started/server-and-client-components#passing-data-from-server-to-client-components" },
    { title: "react.dev: Tipos serializables en las props de Client Components", url: "https://react.dev/reference/rsc/use-client#serializable-types" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", next: "16" } },
};
