import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "funciones-arrow-objeto",
    kind: "predecir",
    concepts: ["js.funciones"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const ids = [1, 2];
const a = ids.map((id) => { id });
const b = ids.map((id) => ({ id }));
const c = ids.map((id) => {
  return { id };
});
console.log(a[0]);
console.log(b[0].id, c[1].id);
`),
    options: opts("undefined\n1 2", "1\n1 2", "[object Object]\n1 2", "Uncaught SyntaxError"),
    correct: "a",
    explanation:
      "Tras => una llave abre el cuerpo de la función, no un objeto. En a, { id } es un bloque que evalúa id y lo descarta: no hay return, así que cada callback devuelve undefined. Para devolver un objeto con return implícito hay que envolverlo en paréntesis, como en b; c usa cuerpo de bloque con return explícito.",
  },
  {
    id: "funciones-default-null",
    kind: "predecir",
    concepts: ["js.funciones"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
function label(name = "anónimo") {
  return "[" + name + "]";
}
console.log(label());
console.log(label(undefined));
console.log(label(null));
console.log(label(""));
`),
    options: opts(
      "[anónimo]\n[anónimo]\n[null]\n[]",
      "[anónimo]\n[anónimo]\n[anónimo]\n[anónimo]",
      "[anónimo]\n[undefined]\n[null]\n[]",
      "[anónimo]\n[anónimo]\n[anónimo]\n[]",
    ),
    correct: "a",
    explanation:
      "El valor por defecto solo se usa cuando el argumento es undefined (omitirlo equivale a pasar undefined). null y \"\" son valores reales y se respetan. Si quieres cubrir también null, usa name ?? \"anónimo\" dentro de la función.",
  },
  {
    id: "funciones-default-por-llamada",
    kind: "predecir",
    concepts: ["js.funciones"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
let calls = 0;
function nextId() {
  calls++;
  return calls;
}
function addItem(item, list = [], id = nextId()) {
  list.push(item);
  return id + ":" + list.length;
}
console.log(addItem("a"));
console.log(addItem("b"));
console.log(addItem("c", undefined, 99));
console.log(calls);
`),
    options: opts(
      "1:1\n2:1\n99:1\n2",
      "1:1\n1:2\n99:3\n1",
      "1:1\n2:2\n99:3\n2",
      "1:1\n2:1\n99:1\n3",
    ),
    correct: "a",
    explanation:
      "Los valores por defecto se evalúan en cada llamada en la que hacen falta: cada llamada sin list recibe un array nuevo (no se comparte como en Python) y nextId() se ejecuta solo cuando id llega como undefined. En la tercera llamada id vale 99, así que nextId no se llama y calls se queda en 2.",
  },
  {
    id: "variables-const-mutar",
    kind: "predecir",
    concepts: ["js.variables"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const items = ["a"];
items.push("b");
console.log(items.join(","));
try {
  items = ["c"];
} catch (e) {
  console.log(e.name);
}
console.log(items.length);
`),
    options: opts("a,b\nTypeError\n2", "Uncaught TypeError", "a,b\n1", "a,b\nSyntaxError\n2"),
    correct: "a",
    explanation:
      "const impide reasignar la variable, no modificar el objeto al que apunta: push funciona. La reasignación lanza un TypeError en tiempo de ejecución (\"Assignment to constant variable\"), que aquí se captura; items sigue apuntando al mismo array con 2 elementos.",
  },
  {
    id: "funciones-handler-referencia",
    kind: "predecir",
    concepts: ["js.funciones"],
    difficulty: "base",
    prompt:
      "button() imita lo que hace React con onClick: guarda la prop y la llama cuando hay un click. ¿Qué imprime?",
    code: code("js", `
const log = [];
function handleDelete(id) {
  log.push("borrar " + id);
}
function button(props) {
  return { click: () => props.onClick?.() };
}
const a = button({ onClick: handleDelete(1) });
const b = button({ onClick: () => handleDelete(2) });
log.push("--- click ---");
a.click();
b.click();
console.log(log.join("\\n"));
`),
    options: opts(
      "borrar 1\n--- click ---\nborrar 2",
      "--- click ---\nborrar 1\nborrar 2",
      "borrar 1\nborrar 2\n--- click ---",
      "--- click ---\nborrar 2",
    ),
    correct: "a",
    explanation:
      "handleDelete(1) se ejecuta al construir las props (en React, durante el render) y lo que se guarda como onClick es su resultado, undefined; por eso el click de a no hace nada. En b se pasa una función que todavía no se ha llamado: se ejecuta solo con el click.",
  },
  {
    id: "funciones-rest-arguments",
    kind: "predecir",
    concepts: ["js.funciones"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
function sum(...nums) {
  return nums.reduce((acc, n) => acc + n, 0);
}
function legacy() {
  return Array.isArray(arguments) + " " + arguments.length;
}
function outer() {
  const inner = () => arguments.length;
  return inner(1, 2, 3);
}
console.log(sum(1, 2, 3));
console.log(legacy(1, 2));
console.log(outer("x"));
`),
    options: opts("6\nfalse 2\n1", "6\ntrue 2\n3", "6\nfalse 2\n3", "6\ntrue 2\nUncaught ReferenceError"),
    correct: "a",
    explanation:
      "Los rest params son un array de verdad. arguments es un objeto parecido a un array (no tiene map ni reduce). Las arrow functions no tienen arguments propio: inner ve el de outer, que recibió un solo argumento.",
  },
];
