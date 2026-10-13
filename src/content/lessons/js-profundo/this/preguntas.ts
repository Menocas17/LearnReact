import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "this-depende-de-la-llamada",
    kind: "predecir",
    concepts: ["js.this"],
    difficulty: "base",
    prompt: "La misma función who se usa de tres formas. ¿Qué imprime?",
    code: code("js", `
function who() {
  return this?.name ?? "sin this";
}
function Persona(name) {
  this.name = name;
  this.who = who;
}
const ana = new Persona("Ana");
const suelta = ana.who;
const luis = { name: "Luis", who: ana.who };
console.log(ana.who());
console.log(suelta());
console.log(luis.who());
`),
    options: opts(
      "Ana\nsin this\nLuis",
      "Ana\nAna\nAna",
      "Ana\nsin this\nAna",
      "Ana\nAna\nLuis",
    ),
    correct: "a",
    explanation:
      "new Persona(\"Ana\") crea un objeto nuevo y lo usa como this dentro del constructor. Después, this se decide en cada llamada: ana.who() lo enlaza a ana, suelta() es una llamada simple (en un módulo, modo estricto, this es undefined) y luis.who() lo enlaza a luis. Que la función se haya \"sacado\" de ana no importa: no recuerda de dónde vino.",
  },
  {
    id: "this-arrow-en-callback",
    kind: "predecir",
    concepts: ["js.this"],
    difficulty: "trampa",
    prompt: "Dos métodos usan map con un callback. ¿Qué imprime?",
    code: code("js", `
const carrito = {
  iva: 0.21,
  conFunction(precios) {
    return precios.map(function (p) {
      return p * (1 + (this?.iva ?? 0));
    });
  },
  conArrow(precios) {
    return precios.map((p) => p * (1 + this.iva));
  },
};
console.log(carrito.conFunction([100]).join(","));
console.log(carrito.conArrow([100]).join(","));
`),
    options: opts("100\n121", "121\n121", "121\n100", "100\nUncaught TypeError"),
    correct: "a",
    explanation:
      "map llama al callback como una función simple (salvo que le pases un segundo argumento thisArg), así que dentro de la function this es undefined y se usa 0. La arrow function no tiene this propio: usa el de conArrow, que se llamó como carrito.conArrow(…), así que ve carrito.iva.",
  },
  {
    id: "this-bind-no-se-reenlaza",
    kind: "predecir",
    concepts: ["js.call-apply-bind", "js.this"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
function saludar(saludo, signo) {
  return saludo + ", " + this.name + signo;
}
const ana = { name: "Ana" };
const luis = { name: "Luis" };
const hola = saludar.bind(ana, "Hola");
console.log(hola("!"));
console.log(hola.call(luis, "?"));
console.log(hola.bind(luis)("."));
console.log(saludar.apply(luis, ["Hey", "!"]));
`),
    options: opts(
      "Hola, Ana!\nHola, Ana?\nHola, Ana.\nHey, Luis!",
      "Hola, Ana!\nHola, Luis?\nHola, Luis.\nHey, Luis!",
      "Hola, Ana!\nHola, Luis?\nHola, Ana.\nHey, Luis!",
      "Hola, Ana!\n?, Luisundefined\n., Luisundefined\nHey, Luis!",
    ),
    correct: "a",
    explanation:
      "bind devuelve una función nueva con this fijado a ana y el primer argumento (\"Hola\") ya aplicado. Ese this no se puede cambiar después: call y un segundo bind sobre la función enlazada solo aportan argumentos, el this que pasan se ignora. apply sobre la función original sí fija this (y recibe los argumentos como array).",
  },
  {
    id: "this-listener-currenttarget",
    kind: "opcion",
    concepts: ["js.this"],
    difficulty: "base",
    prompt:
      "Este código está en un módulo ES (type=\"module\"). El botón contiene un <span> y haces click justo sobre el span. ¿Qué se imprime?",
    code: code("js", `
const button = document.querySelector("button");

button.addEventListener("click", function (e) {
  console.log("function:", this === e.currentTarget, this === e.target);
});

button.addEventListener("click", (e) => {
  console.log("arrow:", this === e.currentTarget);
});
`),
    options: opts(
      "function: true false\narrow: false",
      "function: true true\narrow: true",
      "function: false true\narrow: false",
      "function: true false\narrow: true",
    ),
    correct: "a",
    explanation:
      "Con una function normal, el navegador llama al listener con this igual al elemento que tiene el listener registrado, que es e.currentTarget (el button). e.target es el elemento donde se originó el click (el span), por eso la segunda comparación es false. La arrow function no recibe ese this: usa el del módulo, que es undefined.",
  },
  {
    id: "this-script-vs-modulo",
    kind: "opcion",
    concepts: ["js.modo-estricto", "js.this"],
    difficulty: "trampa",
    prompt:
      "Cargas este mismo archivo en el navegador de dos formas: con <script src=\"a.js\"> (clásico, sin \"use strict\") y con <script type=\"module\" src=\"a.js\">. ¿Qué imprime en cada caso?",
    code: code("js", `
function f() {
  return this === globalThis;
}
console.log(f());
`),
    options: opts(
      "Script clásico: true. Módulo: false",
      "Script clásico: true. Módulo: true",
      "Script clásico: false. Módulo: false",
      "Script clásico: false. Módulo: true",
    ),
    correct: "a",
    explanation:
      "En una llamada simple, el modo no estricto (sloppy) sustituye un this undefined por el objeto global (globalThis, que en el navegador es window). Los módulos ES son siempre estrictos, sin necesidad de \"use strict\", así que ahí this queda undefined y la comparación es false.",
  },
  {
    id: "this-estricto-errores",
    kind: "predecir",
    concepts: ["js.modo-estricto"],
    difficulty: "base",
    prompt: "Recuerda que el código se ejecuta como módulo ES. ¿Qué imprime?",
    code: code("js", `
const config = Object.freeze({ debug: false });
try {
  config.debug = true;
} catch (e) {
  console.log(e.name);
}
try {
  contador = 1;
} catch (e) {
  console.log(e.name);
}
console.log(typeof this);
`),
    options: opts(
      "TypeError\nReferenceError\nundefined",
      "ReferenceError\nobject",
      "TypeError\nobject",
      "TypeError\nReferenceError\nobject",
    ),
    correct: "a",
    explanation:
      "En modo estricto, asignar a una propiedad de solo lectura (un objeto congelado) lanza TypeError en vez de fallar en silencio, y asignar a una variable no declarada lanza ReferenceError en vez de crear una global. Además, en el nivel superior de un módulo this es undefined. En un script sloppy no se imprimiría ningún error y typeof this sería \"object\".",
  },
];
