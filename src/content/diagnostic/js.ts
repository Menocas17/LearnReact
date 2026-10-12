import type { DiagnosticSection } from "../types";
import { code, opts } from "./helpers";

export const jsFundamentos: DiagnosticSection = {
  id: "js-fundamentos",
  title: "JavaScript: fundamentos",
  description: "Tipos, coerción, operadores, arrays y objetos.",
  modules: ["m02"],
  questions: [
    {
      id: "diag-js-typeof",
      kind: "predecir",
      concepts: ["js.valores-tipos"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
console.log(typeof null, typeof [], typeof function () {}, typeof NaN);
`),
      options: opts(
        "null array function NaN",
        "object array function number",
        "object object function number",
        "object object object number",
      ),
      correct: "c",
      explanation:
        "typeof null es \"object\" (un error histórico del lenguaje). Los arrays son objetos, así que typeof [] también es \"object\" (usa Array.isArray para distinguirlos). Las funciones son el único objeto con typeof propio: \"function\". NaN es un valor del tipo number.",
    },
    {
      id: "diag-js-coercion-suma",
      kind: "predecir",
      concepts: ["js.coercion", "js.operadores"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
console.log(1 + "2", "3" * "4", true + 1);
`),
      options: opts("3 12 2", "12 12 2", "12 34 true1", "12 12 true1"),
      correct: "b",
      explanation:
        "Con + si uno de los operandos es string, se concatena: 1 + \"2\" es \"12\". Los demás operadores aritméticos convierten a número: \"3\" * \"4\" es 12. true se convierte a 1, así que true + 1 es 2.",
    },
    {
      id: "diag-js-igualdad",
      kind: "predecir",
      concepts: ["js.coercion"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
console.log(null == undefined, null === undefined, NaN === NaN, [1] == 1);
`),
      options: opts(
        "true false false true",
        "false false false false",
        "true false true true",
        "true true false false",
      ),
      correct: "a",
      explanation:
        "null == undefined es true por una regla especial de ==, pero === exige el mismo tipo. NaN no es igual a nada, ni a sí mismo (usa Number.isNaN). [1] == 1 convierte el array a string (\"1\") y luego a número: true. Por eso se recomienda usar siempre ===.",
    },
    {
      id: "diag-js-cortocircuito",
      kind: "predecir",
      concepts: ["js.cortocircuito", "js.coercion"],
      difficulty: "trampa",
      prompt: "¿Qué imprime? (Pista: piensa en {count && <Lista />} en React.)",
      code: code("js", `
const count = 0;
const name = "";
console.log(count && "hay elementos");
console.log(count || 10, count ?? 10);
console.log(name?.length ?? "sin nombre");
`),
      options: opts(
        "false\n10 10\nsin nombre",
        "0\n10 10\n0",
        "0\n10 0\n0",
        "undefined\n10 0\nsin nombre",
      ),
      correct: "c",
      explanation:
        "&& y || no devuelven booleanos: devuelven uno de sus operandos. count && ... devuelve 0 porque 0 es falsy (por eso React pinta un \"0\"). || descarta cualquier falsy (0 → 10), mientras que ?? solo descarta null y undefined (0 se queda). name es \"\", no null, así que name?.length es 0 y ?? no lo reemplaza.",
    },
    {
      id: "diag-js-numeros",
      kind: "predecir",
      concepts: ["js.numeros"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
console.log(0.1 + 0.2 === 0.3);
console.log(parseInt("42px"), Number("42px"));
`),
      options: opts("true\n42 42", "false\n42 NaN", "false\nNaN NaN", "true\n42 NaN"),
      correct: "b",
      explanation:
        "Los números son coma flotante binaria: 0.1 + 0.2 da 0.30000000000000004. parseInt lee dígitos hasta encontrar uno inválido (42), mientras que Number exige que todo el string sea un número válido (NaN).",
    },
    {
      id: "diag-js-sort",
      kind: "predecir",
      concepts: ["js.metodos-array", "js.arrays"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
const nums = [10, 1, 5, 100];
const sorted = nums.sort();
console.log(sorted.join(","));
console.log(nums === sorted);
`),
      options: opts("1,5,10,100\nfalse", "1,10,100,5\ntrue", "1,5,10,100\ntrue", "1,10,100,5\nfalse"),
      correct: "b",
      explanation:
        "Sin función de comparación, sort ordena como strings (\"100\" va antes que \"5\"). Además sort muta el array original y devuelve el mismo array. Usa nums.toSorted((a, b) => a - b) para obtener una copia ordenada numéricamente sin mutar.",
    },
    {
      id: "diag-js-reduce",
      kind: "predecir",
      concepts: ["js.metodos-array"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
const items = [{ price: 10, qty: 2 }, { price: 5, qty: 4 }];
const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);
const names = ["ana", "luis"].map((n) => n.toUpperCase()).filter((n) => n.startsWith("L"));
console.log(total, names.join(","));
`),
      options: opts("40 LUIS", "30 LUIS", "40 luis", "NaN LUIS"),
      correct: "a",
      explanation:
        "reduce acumula 0 + 10·2 + 5·4 = 40. map transforma cada nombre a mayúsculas y luego filter se queda con los que empiezan por \"L\".",
    },
    {
      id: "diag-js-destructuring",
      kind: "predecir",
      concepts: ["js.destructuring", "js.spread-rest"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
const user = { name: "Ana", address: { city: "Lima" } };
const { name: userName, age = 30, ...rest } = user;
console.log(userName, age, Object.keys(rest).join(","));
`),
      options: opts("Ana 30 address", "Ana undefined address", "undefined 30 name,address", "Ana 30 name,age,address"),
      correct: "a",
      explanation:
        "name: userName renombra la variable. age no existe en el objeto, así que toma el valor por defecto 30. ...rest recoge las propiedades que no se extrajeron: solo address.",
    },
    {
      id: "diag-js-json",
      kind: "predecir",
      concepts: ["js.json"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
const data = { date: new Date(0), fn() {}, missing: undefined, n: NaN };
console.log(JSON.stringify(data));
`),
      options: opts(
        '{"date":{},"fn":null,"missing":null,"n":null}',
        '{"date":"1970-01-01T00:00:00.000Z","n":null}',
        '{"date":"1970-01-01T00:00:00.000Z","missing":null,"n":"NaN"}',
        '{"date":0,"n":NaN}',
      ),
      correct: "b",
      explanation:
        "JSON no tiene fechas, funciones, undefined ni NaN. Las fechas se convierten a string ISO (con toJSON), las funciones y undefined se omiten y NaN se convierte en null. Al hacer JSON.parse la fecha vuelve como string, no como Date.",
    },
  ],
};

export const jsProfundo: DiagnosticSection = {
  id: "js-profundo",
  title: "JavaScript profundo",
  description: "Scope, closures, referencias, this, prototipos, módulos y errores.",
  modules: ["m03"],
  questions: [
    {
      id: "diag-js-var-let-loop",
      kind: "predecir",
      concepts: ["js.closures", "js.scope", "js.variables"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
for (var i = 0; i < 3; i++) setTimeout(() => console.log("var", i));
for (let j = 0; j < 3; j++) setTimeout(() => console.log("let", j));
`),
      options: opts(
        "var 0\nvar 1\nvar 2\nlet 0\nlet 1\nlet 2",
        "var 3\nvar 3\nvar 3\nlet 0\nlet 1\nlet 2",
        "var 3\nvar 3\nvar 3\nlet 3\nlet 3\nlet 3",
        "var 0\nlet 0\nvar 1\nlet 1\nvar 2\nlet 2",
      ),
      correct: "b",
      explanation:
        "var tiene scope de función: hay una sola i compartida y cuando corren los timeouts ya vale 3. let crea una variable nueva por iteración, así que cada closure captura su propia j.",
    },
    {
      id: "diag-js-closure-contador",
      kind: "predecir",
      concepts: ["js.closures"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    get: () => count,
  };
}
const a = createCounter();
const b = createCounter();
a.increment();
a.increment();
b.increment();
console.log(a.get(), b.get());
`),
      options: opts("2 1", "3 3", "2 2", "1 1"),
      correct: "a",
      explanation:
        "Cada llamada a createCounter crea un scope nuevo con su propio count. Las funciones devueltas cierran sobre ese scope: a y b no comparten estado.",
    },
    {
      id: "diag-js-closure-snapshot",
      kind: "predecir",
      concepts: ["js.closures"],
      difficulty: "trampa",
      prompt:
        "Imagina que render es un componente de React que se ejecuta en cada render. ¿Qué imprime?",
      code: code("js", `
function render(count) {
  const handleClick = () => setTimeout(() => console.log("count:", count), 0);
  return handleClick;
}
const click = render(0);
render(1);
render(2);
click();
`),
      options: opts("count: 2", "count: 0", "count: undefined", "count: 3"),
      correct: "b",
      explanation:
        "Cada ejecución de render tiene su propio parámetro count. click se creó en la primera ejecución, así que su closure ve count = 0 aunque después haya habido otros \"renders\". Así funciona el estado en React: cada render ve una instantánea.",
    },
    {
      id: "diag-js-closure-binding",
      kind: "predecir",
      concepts: ["js.closures", "js.scope"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
let value = "inicial";
function makeLogger() {
  const captured = value;
  return () => console.log(captured, value);
}
const log = makeLogger();
value = "cambiado";
log();
`),
      options: opts("inicial inicial", "cambiado cambiado", "inicial cambiado", "cambiado inicial"),
      correct: "c",
      explanation:
        "Un closure captura variables, no valores. captured se asignó una vez con el valor de entonces (\"inicial\"). value es la misma variable externa, que después se reasignó, así que el closure lee su valor actual.",
    },
    {
      id: "diag-js-hoisting-tdz",
      kind: "predecir",
      concepts: ["js.hoisting-tdz"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
console.log(typeof greet, typeof sayHi);
function greet() {}
var sayHi = function () {};
console.log(typeof x);
let x = 1;
`),
      options: opts(
        "function undefined\nundefined",
        "function function\nundefined",
        "function undefined\nUncaught ReferenceError",
        "undefined undefined\nUncaught ReferenceError",
      ),
      correct: "c",
      explanation:
        "Las declaraciones de función se elevan completas. De var solo se eleva la declaración (vale undefined hasta la asignación). let también se eleva, pero queda en la Temporal Dead Zone: acceder antes de su declaración lanza ReferenceError, incluso con typeof.",
    },
    {
      id: "diag-js-referencias",
      kind: "predecir",
      concepts: ["js.valor-referencia"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
const a = { n: 1 };
const b = a;
const c = { n: 1 };
b.n = 2;
console.log(a.n, a === b, a === c);
`),
      options: opts("1 true false", "2 true true", "2 true false", "1 false false"),
      correct: "c",
      explanation:
        "b no es una copia: apunta al mismo objeto que a, así que mutar b.n cambia a.n. === entre objetos compara identidad (referencia), no contenido: c tiene el mismo contenido pero es otro objeto.",
    },
    {
      id: "diag-js-copia-superficial",
      kind: "predecir",
      concepts: ["js.inmutabilidad", "js.spread-rest"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
const state = { user: { name: "Ana" }, tags: ["a"] };
const copy = { ...state };
copy.user.name = "Luis";
copy.tags = [...copy.tags, "b"];
console.log(state.user.name, state.tags.length);
`),
      options: opts("Ana 1", "Luis 2", "Luis 1", "Ana 2"),
      correct: "c",
      explanation:
        "El spread hace una copia superficial: copy.user sigue siendo el mismo objeto que state.user, así que mutarlo afecta a ambos. En cambio copy.tags se reasignó a un array nuevo y state.tags no cambia. En React, actualiza cada nivel anidado con su propia copia.",
    },
    {
      id: "diag-js-this-perdido",
      kind: "predecir",
      concepts: ["js.this", "js.modo-estricto"],
      difficulty: "trampa",
      prompt: "El código se ejecuta como módulo ES (modo estricto), igual que en un proyecto con Vite o Next. ¿Qué imprime?",
      code: code("js", `
const obj = {
  name: "obj",
  regular() {
    return this?.name;
  },
  arrow: () => this?.name,
};
const fn = obj.regular;
console.log(obj.regular(), fn(), obj.arrow());
`),
      options: opts("obj obj obj", "obj undefined obj", "obj undefined undefined", "obj obj undefined"),
      correct: "c",
      explanation:
        "this depende de cómo se llama la función: obj.regular() lo enlaza a obj, pero fn() es una llamada simple y en modo estricto this es undefined. Las arrow functions no tienen this propio: usan el del scope donde se definieron (el módulo, donde this es undefined), no el del objeto.",
    },
    {
      id: "diag-js-this-clase",
      kind: "predecir",
      concepts: ["js.this", "js.call-apply-bind", "js.clases"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
class Button {
  label = "Guardar";
  handleClick() {
    return this?.label;
  }
  handleArrow = () => this.label;
}
const btn = new Button();
const { handleClick, handleArrow } = btn;
console.log(handleClick(), handleArrow(), handleClick.call(btn));
`),
      options: opts(
        "Guardar Guardar Guardar",
        "undefined Guardar Guardar",
        "undefined undefined Guardar",
        "Guardar undefined undefined",
      ),
      correct: "b",
      explanation:
        "Al extraer el método se pierde el this (el cuerpo de una clase siempre está en modo estricto, así que es undefined). Un campo con arrow function captura el this de la instancia al crearse. call fija this explícitamente.",
    },
    {
      id: "diag-js-prototipos",
      kind: "predecir",
      concepts: ["js.prototipos", "js.clases"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
class Animal {
  speak() {
    return "...";
  }
}
class Dog extends Animal {
  speak() {
    return "guau";
  }
}
const d = new Dog();
console.log(
  d.speak(),
  Object.getPrototypeOf(d) === Dog.prototype,
  d instanceof Animal,
  Object.hasOwn(d, "speak"),
);
`),
      options: opts("guau true true false", "guau true true true", "... true false false", "guau false true false"),
      correct: "a",
      explanation:
        "Los métodos de clase viven en el prototipo, no en cada instancia (por eso hasOwn es false). La búsqueda de speak encuentra primero Dog.prototype.speak. instanceof recorre la cadena: Dog.prototype → Animal.prototype.",
    },
    {
      id: "diag-js-orden-claves",
      kind: "predecir",
      concepts: ["js.objetos-avanzado"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
const obj = { b: 1, 2: "dos", a: 2, 1: "uno" };
console.log(Object.keys(obj).join(","));
`),
      options: opts("b,2,a,1", "1,2,b,a", "a,b,1,2", "b,a,1,2"),
      correct: "b",
      explanation:
        "Las claves que parecen índices enteros se ordenan primero, en orden numérico. El resto de claves string mantiene el orden de inserción.",
    },
    {
      id: "diag-js-map-set",
      kind: "predecir",
      concepts: ["js.map-set", "js.valor-referencia"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
const set = new Set([1, 2, 2, "2", { a: 1 }, { a: 1 }]);
const map = new Map();
const key = { id: 1 };
map.set(key, "ok");
console.log(set.size, map.get({ id: 1 }), map.get(key));
`),
      options: opts("3 ok ok", "4 undefined ok", "5 undefined ok", "5 ok ok"),
      correct: "c",
      explanation:
        "Set y Map comparan claves con SameValueZero (como ===, salvo que NaN es igual a NaN): 2 y \"2\" son distintos, y los objetos se comparan por referencia, así que dos literales { a: 1 } son distintos. Por eso map.get con un objeto nuevo no encuentra nada.",
    },
    {
      id: "diag-js-finally",
      kind: "predecir",
      concepts: ["js.errores"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
function run() {
  try {
    return "try";
  } finally {
    console.log("finally");
  }
}
console.log(run());
`),
      options: opts("try", "finally", "try\nfinally", "finally\ntry"),
      correct: "d",
      explanation:
        "finally se ejecuta siempre, incluso cuando try hace return: el valor de retorno queda pendiente, se ejecuta finally y después la función devuelve \"try\".",
    },
    {
      id: "diag-js-modulos",
      kind: "opcion",
      concepts: ["js.modulos"],
      difficulty: "base",
      prompt:
        "config.js tiene un console.log(\"cargando config\") en su nivel superior. Tres archivos distintos hacen import de config.js. ¿Cuántas veces se imprime al arrancar la app?",
      options: opts(
        "Una vez: un módulo se evalúa una sola vez y después se reutiliza",
        "Tres veces: una por cada import",
        "Ninguna: los imports solo traen las exportaciones",
        "Depende de si usas default o named exports",
      ),
      correct: "a",
      explanation:
        "Los módulos ES se evalúan una única vez por grafo de módulos; los imports siguientes reciben la misma instancia. Por eso un módulo puede guardar estado compartido (un singleton), algo que verás en stores y clientes de base de datos.",
    },
  ],
};

export const jsDom: DiagnosticSection = {
  id: "dom",
  title: "DOM y eventos",
  description: "Lo que React hace por ti en el navegador.",
  modules: ["m04"],
  questions: [
    {
      id: "diag-dom-target",
      kind: "opcion",
      concepts: ["dom.propagacion", "dom.delegacion"],
      difficulty: "base",
      prompt:
        "Tienes un <ul> con 100 <li> y un único listener de click en el <ul>. Haces click en un <li>. Dentro del listener, ¿qué son event.target y event.currentTarget?",
      options: opts(
        "target es el <li> clicado y currentTarget es el <ul>",
        "Ambos son el <ul>",
        "target es el <ul> y currentTarget es el <li>",
        "Ambos son el <li>",
      ),
      correct: "a",
      explanation:
        "El evento burbujea desde el <li> hasta el <ul>. target es donde se originó el evento; currentTarget es el elemento cuyo listener se está ejecutando. Esto es la delegación de eventos: un listener en el padre atiende a todos los hijos.",
    },
    {
      id: "diag-dom-innerhtml",
      kind: "opcion",
      concepts: ["dom.manipulacion"],
      difficulty: "base",
      prompt: "Muestras el comentario de un usuario con el.innerHTML = comentario. ¿Cuál es el problema principal?",
      options: opts(
        "Ninguno, innerHTML es la forma estándar de mostrar texto",
        "Es lento: textContent es más rápido",
        "Permite inyectar HTML y scripts (XSS); para texto debes usar textContent",
        "No funciona con caracteres especiales como tildes",
      ),
      correct: "c",
      explanation:
        "innerHTML interpreta el string como HTML, así que un comentario con <img src=x onerror=...> ejecuta código. textContent lo trata como texto. React escapa el texto por defecto por esta razón, y por eso dangerouslySetInnerHTML se llama así.",
    },
    {
      id: "diag-dom-render-estado",
      kind: "opcion",
      concepts: ["dom.render-desde-estado", "react.modelo-mental"],
      difficulty: "base",
      prompt:
        "En una app vanilla, cada vez que el usuario añade una tarea haces list.appendChild(nuevoLi) y actualizas un contador con counter.textContent = n. ¿Qué problema resuelve el enfoque \"UI = f(estado)\" que usa React?",
      options: opts(
        "Que appendChild es más lento que innerHTML",
        "Que con actualizaciones manuales es fácil que la UI y los datos se desincronicen al crecer la app",
        "Que el DOM no permite añadir elementos dinámicamente",
        "Que los eventos no funcionan en elementos creados con JS",
      ),
      correct: "b",
      explanation:
        "Al actualizar el DOM a mano tienes que recordar todos los lugares que dependen de cada cambio. Con UI = f(estado) describes la interfaz completa para un estado dado y la librería calcula los cambios mínimos en el DOM.",
    },
  ],
};

export const jsAsync: DiagnosticSection = {
  id: "async",
  title: "Asincronía",
  description: "Event loop, promesas, async/await, fetch y cancelación.",
  modules: ["m05"],
  questions: [
    {
      id: "diag-async-event-loop",
      kind: "predecir",
      concepts: ["async.event-loop", "async.promesas"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
console.log("A");
setTimeout(() => console.log("B"), 0);
Promise.resolve().then(() => console.log("C"));
console.log("D");
`),
      options: opts("A\nB\nC\nD", "A\nD\nB\nC", "A\nD\nC\nB", "A\nC\nD\nB"),
      correct: "c",
      explanation:
        "Primero se ejecuta todo el código síncrono (A, D). Después el event loop vacía la cola de microtareas (el then: C) y solo entonces toma la siguiente tarea (el setTimeout: B), aunque su retardo sea 0.",
    },
    {
      id: "diag-async-await-orden",
      kind: "predecir",
      concepts: ["async.event-loop", "async.async-await"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
async function task() {
  console.log("1");
  await null;
  console.log("2");
}
setTimeout(() => console.log("3"), 0);
task();
queueMicrotask(() => console.log("4"));
console.log("5");
`),
      options: opts("1\n2\n4\n5\n3", "1\n5\n2\n4\n3", "1\n5\n4\n2\n3", "5\n1\n2\n4\n3"),
      correct: "b",
      explanation:
        "Una función async se ejecuta de forma síncrona hasta el primer await (imprime 1). El resto se programa como microtarea en ese momento, antes de que queueMicrotask encole la suya. Tras el código síncrono (5) se vacían las microtareas en orden (2, 4) y por último el timeout (3).",
    },
    {
      id: "diag-async-error-sin-await",
      kind: "predecir",
      concepts: ["async.async-await", "js.errores"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
async function load() {
  throw new Error("falló");
}
try {
  load();
  console.log("después");
} catch (e) {
  console.log("capturado");
}
`),
      options: opts(
        "capturado",
        "después\ncapturado",
        "después\nUncaught (in promise) Error",
        "Uncaught Error",
      ),
      correct: "c",
      explanation:
        "Una función async nunca lanza de forma síncrona: devuelve una promesa rechazada. Sin await, el try/catch no ve el error y la promesa queda rechazada sin manejar. Con await load() sí se habría capturado.",
    },
    {
      id: "diag-async-combinadores",
      kind: "predecir",
      concepts: ["async.combinadores"],
      difficulty: "base",
      prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
      code: code("js", `
const ok = (v, ms) => new Promise((resolve) => setTimeout(() => resolve(v), ms));
const fail = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error("x")), ms));

const results = await Promise.allSettled([ok("a", 20), fail(10)]);
console.log(results.map((r) => r.status).join(","));
try {
  await Promise.all([ok("a", 20), fail(10)]);
} catch (e) {
  console.log("all falló:", e.message);
}
console.log(await Promise.race([ok("lento", 30), ok("rápido", 5)]));
`),
      options: opts(
        "fulfilled,rejected\nall falló: x\nrápido",
        "fulfilled,fulfilled\nall falló: x\nlento",
        "rejected\nall falló: x\nrápido",
        "fulfilled,rejected\na\nrápido",
      ),
      correct: "a",
      explanation:
        "allSettled espera a todas y nunca rechaza: devuelve el estado de cada una. Promise.all rechaza en cuanto una falla. race se resuelve con la primera que termine.",
    },
    {
      id: "diag-async-debounce",
      kind: "predecir",
      concepts: ["async.debounce-throttle", "js.closures"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
function debounce(fn, ms) {
  let id;
  return (...args) => {
    clearTimeout(id);
    id = setTimeout(() => fn(...args), ms);
  };
}
const search = debounce((q) => console.log("buscar:", q), 200);
search("r");
search("re");
setTimeout(() => search("rea"), 50);
setTimeout(() => search("react"), 600);
`),
      options: opts(
        "buscar: react",
        "buscar: r\nbuscar: re\nbuscar: rea\nbuscar: react",
        "buscar: rea\nbuscar: react",
        "buscar: re\nbuscar: react",
      ),
      correct: "c",
      explanation:
        "Cada llamada cancela el timer anterior (todas comparten id gracias al closure). \"rea\" llega a los 50 ms y programa la búsqueda para los 250 ms; nada la cancela, así que se ejecuta. \"react\" llega a los 600 ms y se ejecuta a los 800 ms.",
    },
    {
      id: "diag-async-fetch-404",
      kind: "opcion",
      concepts: ["async.fetch"],
      difficulty: "trampa",
      prompt: "El servidor responde 404 con el cuerpo JSON { \"error\": \"no existe\" }. ¿Qué se imprime?",
      code: code("js", `
try {
  const res = await fetch("/api/usuarios/999");
  const data = await res.json();
  console.log("ok", data);
} catch {
  console.log("error");
}
`),
      options: opts(
        "error",
        "ok { error: \"no existe\" }",
        "ok undefined",
        "No imprime nada: fetch se queda esperando",
      ),
      correct: "b",
      explanation:
        "fetch solo rechaza ante errores de red (o cancelación). Un 404 o un 500 son respuestas válidas: tienes que comprobar res.ok (o res.status) y lanzar tú el error.",
    },
    {
      id: "diag-async-race",
      kind: "opcion",
      concepts: ["async.race-conditions", "async.abort"],
      difficulty: "base",
      prompt:
        "Un buscador lanza una petición en cada tecla. El usuario escribe \"re\" y luego \"rea\", pero la respuesta de \"re\" llega después que la de \"rea\" y la pantalla termina mostrando resultados de \"re\". ¿Cuál es la solución robusta?",
      options: opts(
        "Esperar con un setTimeout antes de mostrar los resultados",
        "Usar async/await en lugar de then",
        "Cancelar la petición anterior con AbortController (o ignorar respuestas que no correspondan a la última búsqueda)",
        "Lanzar todas las búsquedas con Promise.all",
      ),
      correct: "c",
      explanation:
        "El orden de llegada de las respuestas no está garantizado. La solución es asegurar que solo la última búsqueda puede actualizar la pantalla: cancelando las anteriores o descartando sus resultados. El debounce reduce peticiones pero no elimina la carrera.",
    },
  ],
};

export const jsFuncional: DiagnosticSection = {
  id: "funcional",
  title: "Funcional y patrones",
  description: "Funciones puras, memoización y el patrón observer.",
  modules: ["m06"],
  questions: [
    {
      id: "diag-fp-pura",
      kind: "opcion",
      concepts: ["fp.funciones-puras"],
      difficulty: "base",
      prompt: "¿Cuál de estas funciones es pura?",
      options: opts(
        "(items) => { items.push(\"nuevo\"); return items; }",
        "(items) => items.filter((i) => i.done).length",
        "() => Date.now() > deadline",
        "(id) => { log.push(id); return id * 2; }",
      ),
      correct: "b",
      explanation:
        "Una función pura devuelve lo mismo para las mismas entradas y no tiene efectos secundarios. La primera muta su argumento, la tercera depende de la hora y de una variable externa, y la cuarta modifica un array externo. React exige que el render sea puro por la misma razón.",
    },
    {
      id: "diag-fp-memo-referencia",
      kind: "predecir",
      concepts: ["fp.memoizacion", "js.valor-referencia"],
      difficulty: "trampa",
      prompt: "¿Qué imprime?",
      code: code("js", `
function memoize(fn) {
  const cache = new Map();
  return (arg) => {
    if (!cache.has(arg)) cache.set(arg, fn(arg));
    return cache.get(arg);
  };
}
let calls = 0;
const total = memoize((items) => {
  calls++;
  return items.length;
});
const list = [1, 2, 3];
total(list);
total(list);
total([1, 2, 3]);
console.log(calls);
`),
      options: opts("1", "2", "3", "0"),
      correct: "b",
      explanation:
        "La caché usa el array como clave y compara por referencia: [1, 2, 3] escrito de nuevo es otro array, así que no hay acierto. Es exactamente lo que pasa con los arrays de dependencias de useMemo y useEffect.",
    },
    {
      id: "diag-patron-observer",
      kind: "predecir",
      concepts: ["patrones.observer", "js.closures"],
      difficulty: "base",
      prompt: "¿Qué imprime?",
      code: code("js", `
function createStore(initial) {
  let state = initial;
  const listeners = new Set();
  return {
    get: () => state,
    set: (next) => {
      state = next;
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
const store = createStore(0);
const unsubscribe = store.subscribe((s) => console.log("A", s));
store.subscribe((s) => console.log("B", s));
store.set(1);
unsubscribe();
store.set(2);
`),
      options: opts("A 1\nB 1\nA 2\nB 2", "A 1\nB 1\nB 2", "B 1\nB 2", "A 1\nB 1"),
      correct: "b",
      explanation:
        "subscribe devuelve una función que elimina al listener (el mismo contrato que usan Zustand y useSyncExternalStore). Tras desuscribir A, solo B recibe la segunda actualización.",
    },
  ],
};
