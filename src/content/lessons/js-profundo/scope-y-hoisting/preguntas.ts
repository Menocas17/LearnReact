import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "scope-var-sale-del-bloque",
    kind: "predecir",
    concepts: ["js.scope"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
function f() {
  if (true) {
    var a = 1;
    let b = 2;
  }
  console.log(typeof a);
  console.log(typeof b);
}
f();
`),
    options: opts("number\nundefined", "number\nnumber", "undefined\nundefined", "number\nUncaught ReferenceError"),
    correct: "a",
    explanation:
      "var tiene scope de función: a pertenece a f entera, no al if, así que fuera del bloque vale 1. let tiene scope de bloque: fuera del if no existe ninguna b. typeof sobre un identificador que no está declarado en ningún scope visible devuelve \"undefined\" sin lanzar (no es TDZ: b no está en la TDZ, simplemente no existe en ese scope).",
  },
  {
    id: "scope-shadowing-tdz",
    kind: "predecir",
    concepts: ["js.scope", "js.hoisting-tdz"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const user = "Ana";
function greet() {
  console.log("Hola");
  console.log(user);
  const user = "Luis";
}
greet();
`),
    options: opts("Hola\nAna", "Hola\nLuis", "Hola\nundefined", "Hola\nUncaught ReferenceError"),
    correct: "d",
    explanation:
      "El const user de dentro de greet pertenece a todo el cuerpo de la función, desde su primera línea: hace shadowing del user del módulo en todo ese scope, no solo a partir de donde está escrito. Al llegar a console.log(user), la búsqueda encuentra el user local, que todavía está en la TDZ, y lanza ReferenceError (Cannot access 'user' before initialization). No \"cae\" al user del módulo.",
  },
  {
    id: "hoisting-var-y-function",
    kind: "predecir",
    concepts: ["js.hoisting-tdz"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
console.log(typeof saludar);
console.log(tema);
var tema = "oscuro";
function saludar() {}
console.log(tema);
`),
    options: opts(
      "function\nundefined\noscuro",
      "undefined\nundefined\noscuro",
      "function\nUncaught ReferenceError",
      "function\noscuro\noscuro",
    ),
    correct: "a",
    explanation:
      "Antes de ejecutar el código, JavaScript registra las declaraciones de su scope. Una function declaration se crea completa, así que ya es una función en la línea 1. Una variable var se crea inicializada a undefined; la asignación \"oscuro\" ocurre cuando la ejecución llega a su línea.",
  },
  {
    id: "hoisting-typeof-tdz",
    kind: "predecir",
    concepts: ["js.hoisting-tdz"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
console.log(typeof noExiste);
console.log(typeof tema);
const tema = "oscuro";
`),
    options: opts("undefined\nundefined", "undefined\nstring", "undefined\nUncaught ReferenceError", "Uncaught ReferenceError"),
    correct: "c",
    explanation:
      "typeof sobre un identificador no declarado devuelve \"undefined\". Pero tema sí está declarado en este scope (con const): existe desde el inicio del módulo, solo que sin inicializar. Leerlo en la TDZ lanza ReferenceError, incluso con typeof.",
  },
  {
    id: "hoisting-arrow-y-var",
    kind: "predecir",
    concepts: ["js.hoisting-tdz"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
function render() {
  return format(5);
}
const format = (n) => "$" + n;
console.log(render());
console.log(double(4));
var double = (n) => n * 2;
`),
    options: opts(
      "$5\nUncaught TypeError",
      "Uncaught ReferenceError",
      "$5\n8",
      "$5\nUncaught ReferenceError",
    ),
    correct: "a",
    explanation:
      "La TDZ es temporal, no de posición: render menciona format antes de su línea, pero se llama después de que format se inicializó, así que funciona. En cambio, double es una variable var: existe desde el principio con valor undefined, y la arrow se le asigna más abajo. Llamar a undefined(4) lanza TypeError (double is not a function), no ReferenceError.",
  },
  {
    id: "hoisting-import-circular",
    kind: "opcion",
    concepts: ["js.hoisting-tdz", "js.scope"],
    difficulty: "trampa",
    prompt: "La app entra por main.js, que hace import \"./tokens.js\". ¿Qué ocurre al cargarla?",
    code: code("js", `
// tokens.js
import { Button } from "./Button.js";
export const colors = { primary: "blue" };
export const variants = { primary: Button };

// Button.js
import { colors } from "./tokens.js";
const defaultColor = colors.primary;
export function Button() {
  return defaultColor;
}
`),
    options: opts(
      "Funciona: los import se elevan, así que colors ya está disponible en Button.js",
      "defaultColor queda como undefined y la app sigue funcionando",
      "ReferenceError: Cannot access 'colors' before initialization, al evaluar Button.js",
      "TypeError: Cannot read properties of undefined (reading 'primary')",
    ),
    correct: "c",
    explanation:
      "Un módulo evalúa primero sus dependencias. tokens.js importa Button.js, así que Button.js se ejecuta antes que el cuerpo de tokens.js. En ese momento el binding colors ya existe (los imports enlazan a la variable del otro módulo) pero su const aún no se ha ejecutado: está en la TDZ. Leer colors.primary en el nivel superior de Button.js lanza ReferenceError. No es undefined porque colors es const, no var.",
  },
];
