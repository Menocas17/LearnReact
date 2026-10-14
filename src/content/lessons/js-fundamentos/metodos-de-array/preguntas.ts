import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "arrays-metodos-map-parseint",
    kind: "predecir",
    concepts: ["js.metodos-array"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const ids = ["1", "2", "3"];
console.log(ids.map(parseInt).join(","));
console.log(ids.map((s) => parseInt(s, 10)).join(","));
`),
    options: opts(
      "1,2,3\n1,2,3",
      "1,NaN,NaN\n1,2,3",
      "NaN,NaN,NaN\n1,2,3",
      "1,NaN,3\n1,2,3",
    ),
    correct: "b",
    explanation:
      "map llama al callback con (item, index, array), y parseInt acepta un segundo parámetro: la base. Así que se ejecuta parseInt(\"1\", 0) → 1 (base 0 significa \"detectar\", es decir 10), parseInt(\"2\", 1) → NaN (base 1 no existe) y parseInt(\"3\", 2) → NaN (\"3\" no es un dígito binario). Pasar una función por referencia a map solo es seguro si ignora los argumentos extra; si no, envuélvela en una flecha.",
  },
  {
    id: "arrays-metodos-array-vacio",
    kind: "predecir",
    concepts: ["js.metodos-array"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const prices = [];
console.log(prices.every((p) => p > 1000));
console.log(prices.some((p) => p > 1000));
console.log(prices.reduce((sum, p) => sum + p, 0));
console.log(prices.reduce((sum, p) => sum + p));
`),
    options: opts(
      "true\nfalse\n0\nUncaught TypeError",
      "false\nfalse\n0\n0",
      "false\nfalse\n0\nUncaught TypeError",
      "true\nfalse\n0\nundefined",
    ),
    correct: "a",
    explanation:
      "every sobre un array vacío devuelve true (no hay ningún elemento que incumpla la condición: \"verdad vacía\"), y some devuelve false (no hay ninguno que la cumpla). reduce con valor inicial devuelve ese valor si el array está vacío; sin valor inicial no tiene con qué empezar y lanza TypeError: Reduce of empty array with no initial value. Por eso, en la práctica, pasa siempre el valor inicial.",
  },
  {
    id: "arrays-metodos-find-vs-filter",
    kind: "predecir",
    concepts: ["js.metodos-array"],
    difficulty: "base",
    prompt: "No existe ningún usuario con id 3. ¿Qué imprime?",
    code: code("js", `
const users = [
  { id: 1, name: "Ana" },
  { id: 2, name: "Luis" },
];
const found = users.find((u) => u.id === 3);
const matches = users.filter((u) => u.id === 3);
const index = users.findIndex((u) => u.id === 3);
console.log(found, matches.length, index);
console.log(found?.name ?? "sin usuario");
`),
    options: opts(
      "undefined 0 -1\nsin usuario",
      "null 0 -1\nsin usuario",
      "undefined 0 undefined\nsin usuario",
      "undefined 0 -1\nUncaught TypeError",
    ),
    correct: "a",
    explanation:
      "find devuelve el primer elemento que cumple la condición o undefined; filter devuelve siempre un array (vacío si no hay coincidencias); findIndex devuelve -1, igual que indexOf. Gracias a ?. no se lanza error al leer name de undefined. Es la diferencia práctica: tras un find tienes que contemplar undefined; tras un filter puedes hacer .map sin miedo.",
  },
  {
    id: "arrays-metodos-sort-localecompare",
    kind: "predecir",
    concepts: ["js.metodos-array"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
const names = ["Óscar", "ana", "Zoe", "Beto"];
console.log(names.toSorted().join(","));
console.log(names.toSorted((a, b) => a.localeCompare(b, "es")).join(","));
console.log(names[0]);
`),
    options: opts(
      "Beto,Zoe,ana,Óscar\nana,Beto,Óscar,Zoe\nÓscar",
      "ana,Beto,Óscar,Zoe\nana,Beto,Óscar,Zoe\nÓscar",
      "Beto,Zoe,ana,Óscar\nana,Beto,Óscar,Zoe\nBeto",
      "Beto,Óscar,Zoe,ana\nana,Beto,Óscar,Zoe\nÓscar",
    ),
    correct: "a",
    explanation:
      "Sin comparador, la ordenación compara strings por unidades de código UTF-16: las mayúsculas (B=66, Z=90) van antes que las minúsculas (a=97) y las letras con tilde (Ó=211) van al final. localeCompare con \"es\" ordena como una persona: ignora mayúsculas y tildes en primera instancia. toSorted devuelve una copia, así que names no cambia.",
  },
  {
    id: "arrays-metodos-sort-muta",
    kind: "predecir",
    concepts: ["js.metodos-array", "js.arrays"],
    difficulty: "trampa",
    prompt: "products viene de las props de un componente. ¿Qué imprime?",
    code: code("js", `
const products = [
  { name: "Té", price: 5 },
  { name: "Café", price: 3 },
  { name: "Agua", price: 1 },
];
function cheapestFirst(list) {
  return list.sort((a, b) => a.price - b.price);
}
const view = cheapestFirst(products);
console.log(view.map((p) => p.name).join(","));
console.log(products[0].name, view === products);
`),
    options: opts(
      "Agua,Café,Té\nTé false",
      "Agua,Café,Té\nAgua true",
      "Agua,Café,Té\nAgua false",
      "Té,Café,Agua\nTé true",
    ),
    correct: "b",
    explanation:
      "sort ordena en el sitio: muta el array que recibe y devuelve ese mismo array, no una copia. cheapestFirst ha reordenado las props del componente (o el estado, o la caché de tu librería de datos). Usa list.toSorted(…) o [...list].sort(…) para obtener un array nuevo.",
  },
  {
    id: "arrays-metodos-reduce-agrupar",
    kind: "predecir",
    concepts: ["js.metodos-array"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
const orders = [
  { customer: "ana", items: ["té", "pan"] },
  { customer: "luis", items: ["café"] },
  { customer: "ana", items: ["café"] },
];
const count = orders.reduce((acc, o) => {
  acc[o.customer] = (acc[o.customer] ?? 0) + 1;
  return acc;
}, {});
const all = orders.flatMap((o) => o.items);
console.log(JSON.stringify(count));
console.log(all.join(","), new Set(all).size);
`),
    options: opts(
      "{\"ana\":2,\"luis\":1}\nté,pan,café,café 3",
      "{\"ana\":1,\"luis\":1}\nté,pan,café,café 4",
      "{\"ana\":2,\"luis\":1}\nté,pan,café,café 4",
      "{\"ana\":2,\"luis\":1}\nté,pan,café 3",
    ),
    correct: "a",
    explanation:
      "reduce recorre los pedidos acumulando un objeto: la primera vez que aparece un cliente, acc[o.customer] es undefined y ?? lo convierte en 0. flatMap aplica el callback y aplana un nivel, así que obtienes los 4 productos en un solo array (con \"café\" repetido); el Set elimina duplicados y deja 3.",
  },
];
