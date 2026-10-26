import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const stringsNumerosFechas: LessonDef = {
  id: "js-fundamentos/strings-numeros-fechas",
  moduleId: "m02",
  slug: "strings-numeros-fechas",
  title: "Strings, números y fechas",
  summary:
    "Un ticket con tres síntomas (un total con 17 decimales, un emoji que cuenta doble y una cita que sale el día anterior) para entender la distancia entre lo que JavaScript guarda y lo que muestra: strings UTF-16, doubles, BigInt, Date, zonas horarias e Intl.",
  concepts: ["js.strings", "js.numeros", "js.fechas-intl"],
  minutes: 55,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "PZRI1IfStY0",
      title: "Floating Point Numbers - Computerphile",
      channel: "Computerphile",
      lang: "en",
      focus: "Por qué una fracción como 0.1 no cabe exacta en binario (igual que 1/3 en decimal) y qué se pierde al redondear al número representable más cercano.",
    },
  ],
  sources: [
    { title: "MDN: String", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String" },
    { title: "MDN: String.prototype.localeCompare()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/String/localeCompare" },
    { title: "MDN: Number", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Number" },
    { title: "MDN: Number.EPSILON", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON" },
    { title: "MDN: parseInt()", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/parseInt" },
    { title: "MDN: BigInt", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/BigInt" },
    { title: "MDN: Date", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Date" },
    { title: "MDN: Intl", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Intl" },
    { title: "MDN: Temporal", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal" },
    { title: "Next.js: How to prevent flash before hydration", url: "https://nextjs.org/docs/app/guides/preventing-flash-before-hydration" },
  ],
  reviewed: { date: "2026-10-14", versions: { node: "22", next: "16.4" } },
};
