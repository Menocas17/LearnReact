import type { LessonDef } from "@/content/types";
import { ejercicios } from "./ejercicios";
import { preguntas } from "./preguntas";

export const scopeYHoisting: LessonDef = {
  id: "js-profundo/scope-y-hoisting",
  moduleId: "m03",
  slug: "scope-y-hoisting",
  title: "Scope y hoisting",
  summary:
    "Un refactor que rompe la app con \"Cannot access 'X' before initialization\": las habitaciones donde vive cada variable, los casilleros que se instalan antes de ejecutar (hoisting) y el precinto de let y const (TDZ), hasta los imports circulares.",
  concepts: ["js.scope", "js.hoisting-tdz"],
  minutes: 45,
  questions: preguntas,
  exercises: ejercicios,
  videos: [
    {
      youtubeId: "bvkY9ey83yY",
      title: "VAR, LET o CONST: ¿CUÁL DEBERÍA USAR? | JS en Español",
      channel: "La Cocina del Código",
      lang: "es",
      focus: "La diferencia entre scope de función (var) y de bloque (let/const), y por qué hoy no hay motivo para usar var.",
    },
    {
      youtubeId: "BNC6slYCj50",
      title: "let & const in JS 🔥Temporal Dead Zone | | Namaste JavaScript Ep. 8",
      channel: "Akshay Saini",
      lang: "en",
      focus: "Cómo let y const sí se registran en su scope antes de ejecutarse, pero quedan sin inicializar (TDZ) hasta su línea.",
    },
  ],
  sources: [
    { title: "MDN: Hoisting (glosario)", url: "https://developer.mozilla.org/es/docs/Glossary/Hoisting" },
    { title: "MDN: Scope (glosario)", url: "https://developer.mozilla.org/es/docs/Glossary/Scope" },
    { title: "MDN: let (zona muerta temporal)", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/let" },
    { title: "MDN: var", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/var" },
    { title: "MDN: Módulos de JavaScript", url: "https://developer.mozilla.org/es/docs/Web/JavaScript/Guide/Modules" },
    { title: "Axel Rauschmayer: Why is there a temporal dead zone in ES6?", url: "https://2ality.com/2015/10/why-tdz.html" },
    { title: "TypeScript Handbook: Variable Declarations", url: "https://www.typescriptlang.org/docs/handbook/variable-declarations.html" },
  ],
  reviewed: { date: "2026-10-12", versions: { node: "22", react: "19.3" } },
};
