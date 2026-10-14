import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "objetos-corchetes-variable",
    kind: "predecir",
    concepts: ["js.objetos"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const field = "name";
const user = { name: "Ana", field: "rol" };
const patch = { [field]: "Luis" };
console.log(user.field, user[field], patch.name);
`),
    options: opts("rol Ana Luis", "Ana Ana Luis", "rol Ana undefined", "Ana rol Luis"),
    correct: "a",
    explanation:
      "Con punto, lo que escribes es el nombre literal de la propiedad: user.field lee la clave \"field\". Con corchetes se evalúa la expresión: user[field] lee user[\"name\"]. En el literal, [field] es una clave computada, así que patch queda como { name: \"Luis\" }.",
  },
  {
    id: "objetos-inexistente-in-delete",
    kind: "predecir",
    concepts: ["js.objetos"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
const settings = { theme: undefined };
console.log(settings.theme, settings.lang);
console.log("theme" in settings, "lang" in settings);
delete settings.theme;
console.log("theme" in settings);
console.log(settings.lang.toUpperCase());
`),
    options: opts(
      "undefined undefined\ntrue false\nfalse\nUncaught TypeError",
      "undefined Uncaught ReferenceError",
      "undefined undefined\nfalse false\nfalse\nundefined",
      "undefined undefined\ntrue false\ntrue\nUncaught TypeError",
    ),
    correct: "a",
    explanation:
      "Leer una propiedad que no existe no es un error: da undefined. Por eso settings.theme y settings.lang se ven iguales, y solo in distingue \"existe con valor undefined\" de \"no existe\". delete elimina la propiedad (no la pone a undefined). El error llega al ir un nivel más: settings.lang es undefined y undefined.toUpperCase() lanza TypeError.",
  },
  {
    id: "arrays-length-vaciar",
    kind: "predecir",
    concepts: ["js.arrays"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const original = [1, 2, 3];
const alias = original;
const copy = original.slice();
alias.length = 0;
console.log(original.length, copy.length, alias === original);
copy.length = 5;
console.log(copy[4], copy.join("-"));
`),
    options: opts(
      "0 3 true\nundefined 1-2-3--",
      "3 3 true\nundefined 1-2-3",
      "0 0 true\nundefined ",
      "0 3 false\nnull 1-2-3-null-null",
    ),
    correct: "a",
    explanation:
      "length se puede asignar: ponerlo a 0 vacía el array en sitio, y como alias y original son el mismo array, ambos quedan vacíos. slice creó un array distinto, así que copy no se entera. Subir length añade huecos (no elementos): leerlos da undefined y join los trata como cadenas vacías.",
  },
  {
    id: "arrays-splice-retorno",
    kind: "predecir",
    concepts: ["js.arrays"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const todos = ["a", "b", "c", "d"];
const removed = todos.splice(1, 2);
const rest = todos.toSpliced(0, 1);
console.log(removed.join(","));
console.log(todos.join(","));
console.log(rest.join(","), todos.at(-1));
`),
    options: opts(
      "b,c\na,d\nd d",
      "a,d\na,d\nd d",
      "b,c\na,b,c,d\nb,c,d d",
      "a,d\na,b,c,d\nb,c,d undefined",
    ),
    correct: "a",
    explanation:
      "splice muta el array y devuelve los elementos eliminados (no el array resultante): removed es [\"b\", \"c\"] y todos queda [\"a\", \"d\"]. toSpliced hace lo mismo sobre una copia y devuelve esa copia, sin tocar todos. at(-1) cuenta desde el final.",
  },
  {
    id: "arrays-nan-includes",
    kind: "predecir",
    concepts: ["js.arrays"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const values = [1, NaN, 3];
console.log(values.indexOf(NaN), values.includes(NaN));
console.log([, 1].includes(undefined), [, 1].indexOf(undefined));
`),
    options: opts("-1 true\ntrue -1", "1 true\ntrue 0", "-1 false\nfalse -1", "1 true\nfalse -1"),
    correct: "a",
    explanation:
      "indexOf compara con === y NaN === NaN es false, así que nunca lo encuentra. includes usa SameValueZero, que sí considera NaN igual a NaN. Con huecos pasa algo parecido: includes trata el hueco como undefined, pero indexOf se salta los huecos.",
  },
  {
    id: "json-roundtrip-fecha-map",
    kind: "predecir",
    concepts: ["js.json"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const order = {
  createdAt: new Date(0),
  tags: new Map([["vip", true]]),
  total: Infinity,
};
const copy = JSON.parse(JSON.stringify(order));
console.log(typeof copy.createdAt, JSON.stringify(copy.tags), copy.total);
console.log(copy.createdAt.getTime());
`),
    options: opts(
      "string {} null\nUncaught TypeError",
      "object {\"vip\":true} Infinity\n0",
      "string [[\"vip\",true]] null\nUncaught TypeError",
      "object {} null\n0",
    ),
    correct: "a",
    explanation:
      "JSON solo conoce strings, números finitos, booleanos, null, arrays y objetos planos. La fecha se convierte en un string ISO (vía toJSON) y vuelve como string; el Map no tiene propiedades propias enumerables y queda como {}; Infinity se convierte en null. Los strings no tienen getTime, así que la última línea lanza TypeError.",
  },
];
