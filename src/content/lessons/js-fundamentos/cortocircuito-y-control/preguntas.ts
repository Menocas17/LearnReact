import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "cortocircuito-perezoso",
    kind: "predecir",
    concepts: ["js.cortocircuito"],
    difficulty: "trampa",
    prompt: "¿Qué imprime? Fíjate en cuántas veces se llama a track.",
    code: code("js", `
let calls = 0;
function track(value) {
  calls++;
  return value;
}
const a = track(0) && track("x");
const b = track("") || track(null) || track("fin");
console.log(a, b, calls);
`),
    options: opts("0 fin 4", "false fin 5", "0 fin 5", "false true 4"),
    correct: "a",
    explanation:
      "&& y || devuelven uno de sus operandos, no un booleano. track(0) devuelve 0, que es falsy, así que && se detiene ahí y devuelve 0: track(\"x\") nunca se ejecuta. En la segunda línea, || evalúa de izquierda a derecha y se detiene en el primer valor truthy: \"\" y null son falsy, \"fin\" es truthy. En total se llamó a track 4 veces (1 + 3), no 5.",
  },
  {
    id: "cortocircuito-asignacion-logica",
    kind: "predecir",
    concepts: ["js.cortocircuito"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const a = { timeout: 0, retries: null, label: "" };
const b = { timeout: 0, retries: null, label: "" };
a.timeout ||= 3000;
a.retries ||= 3;
a.label ||= "sin nombre";
b.timeout ??= 3000;
b.retries ??= 3;
b.label ??= "sin nombre";
console.log(a.timeout, a.retries, a.label);
console.log(b.timeout, b.retries, JSON.stringify(b.label));
`),
    options: opts(
      "3000 3 sin nombre\n0 3 \"\"",
      "3000 3 sin nombre\n3000 3 \"\"",
      "3000 3 sin nombre\n3000 3 \"sin nombre\"",
      "0 3 \n0 3 \"\"",
    ),
    correct: "a",
    explanation:
      "x ||= y asigna si x es falsy, así que pisa el 0 y el \"\", que eran valores legítimos. x ??= y solo asigna si x es null o undefined: el 0 y el \"\" se quedan y solo retries (null) recibe el valor por defecto. Para configuración, casi siempre quieres ??=.",
  },
  {
    id: "cortocircuito-optional-chaining",
    kind: "predecir",
    concepts: ["js.cortocircuito"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const user = {
  profile: null,
  tags: ["admin"],
  greet() {
    return "hola";
  },
};
console.log(user.profile?.name);
console.log(user.save?.());
console.log(user.greet?.());
console.log(user.tags?.[1] ?? "sin tag");
console.log(user.settings?.theme.color);
`),
    options: opts(
      "undefined\nundefined\nhola\nsin tag\nundefined",
      "undefined\nUncaught TypeError",
      "null\nundefined\nhola\nsin tag\nundefined",
      "undefined\nundefined\nhola\nsin tag\nUncaught TypeError",
    ),
    correct: "a",
    explanation:
      "?. devuelve undefined (no null) si lo de la izquierda es null o undefined. user.save?.() no llama a nada porque save es undefined; greet?.() sí la llama. tags?.[1] es undefined (el índice 1 no existe) y ?? lo reemplaza. La última línea es la trampa: cuando settings?. corta, corta toda la cadena, así que .theme.color ni se evalúa y no hay TypeError.",
  },
  {
    id: "cortocircuito-mezclar-nullish",
    kind: "opcion",
    concepts: ["js.cortocircuito"],
    difficulty: "base",
    prompt: "¿Qué pasa con esta línea?",
    code: code("js", `
const port = process.env.PORT || config.port ?? 8080;
`),
    options: opts(
      "Se evalúa como (process.env.PORT || config.port) ?? 8080",
      "Se evalúa como process.env.PORT || (config.port ?? 8080)",
      "Es un SyntaxError: ?? no se puede combinar con || o && sin paréntesis",
      "Funciona, pero ?? se ignora porque || tiene mayor precedencia",
    ),
    correct: "c",
    explanation:
      "La especificación prohíbe mezclar ?? con || o && sin paréntesis explícitos, justamente para que no tengas que adivinar la precedencia. El archivo entero ni siquiera llega a ejecutarse: falla al parsearse. Escribe (a || b) ?? c o a || (b ?? c) según lo que quieras.",
  },
  {
    id: "control-for-in-array",
    kind: "predecir",
    concepts: ["js.control-flujo"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const tags = ["react", "next"];
tags.source = "api";
let keys = "";
let values = "";
for (const k in tags) keys += k + " ";
for (const v of tags) values += v + " ";
console.log(keys.trim());
console.log(values.trim());
console.log(typeof Object.keys(tags)[0]);
`),
    options: opts(
      "0 1 source\nreact next\nstring",
      "0 1\nreact next\nnumber",
      "0 1 source\nreact next api\nstring",
      "react next\n0 1\nnumber",
    ),
    correct: "a",
    explanation:
      "for...in recorre las claves enumerables del objeto (incluidas las heredadas), no los elementos: incluye la propiedad extra source y las claves son strings (\"0\", \"1\"), no números. for...of usa el iterador del array, que solo produce los elementos indexados. Por eso en arrays se usa for...of (o métodos como map/forEach), nunca for...in.",
  },
  {
    id: "control-switch-fallthrough",
    kind: "predecir",
    concepts: ["js.control-flujo"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
function label(status) {
  let out = "";
  switch (status) {
    case 1:
      out += "uno ";
    case "2":
      out += "dos ";
      break;
    case 2:
      out += "DOS ";
    default:
      out += "otro";
  }
  return out.trim();
}
console.log(label(1));
console.log(label(2));
console.log(label("1"));
`),
    options: opts(
      "uno dos\nDOS otro\notro",
      "uno\nDOS\nuno",
      "uno dos\ndos\nuno dos",
      "uno\nDOS otro\notro",
    ),
    correct: "a",
    explanation:
      "Sin break, un case sigue ejecutando los siguientes (fallthrough): label(1) entra en case 1 y sigue en case \"2\" hasta el break. switch compara con ===, así que 2 no coincide con \"2\" y sí con case 2, que cae en default. \"1\" no es igual a 1 en comparación estricta, así que solo se ejecuta default.",
  },
];
