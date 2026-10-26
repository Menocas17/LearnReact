import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "promesas-executor-sincrono",
    kind: "predecir",
    concepts: ["async.promesas"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const p = new Promise((resolve, reject) => {
  console.log("executor");
  resolve("primero");
  resolve("segundo");
  reject(new Error("tarde"));
  console.log("sigue");
});
console.log("después");
p.then((v) => console.log(v));
`),
    options: opts(
      "executor\nsigue\ndespués\nprimero",
      "después\nexecutor\nsigue\nprimero",
      "executor\nprimero\nsigue\ndespués",
      "executor\nsigue\ndespués\nsegundo",
    ),
    correct: "a",
    explanation:
      "El executor de new Promise se ejecuta de forma síncrona, en el mismo momento en que se crea la promesa: por eso \"executor\" y \"sigue\" salen antes que \"después\". resolve no interrumpe la función (no es un return). Una promesa se asienta una sola vez: el primer resolve gana y las llamadas posteriores a resolve o reject se ignoran en silencio. El then siempre se ejecuta como microtarea, después del código síncrono, aunque la promesa ya esté cumplida.",
  },
  {
    id: "promesas-olvidar-return",
    kind: "predecir",
    concepts: ["async.promesas"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
Promise.resolve(1)
  .then((n) => {
    n * 2;
  })
  .then((n) => console.log("A", n));

Promise.resolve(1)
  .then((n) => Promise.resolve(n * 2))
  .then((n) => console.log("B", n));
`),
    options: opts(
      "A undefined\nB 2",
      "A 2\nB 2",
      "A undefined\nB [object Promise]",
      "A 2\nB [object Promise]",
    ),
    correct: "a",
    explanation:
      "then devuelve siempre una promesa nueva, que se resuelve con lo que devuelva el callback. En A el callback tiene llaves y no tiene return, así que devuelve undefined y el siguiente then recibe undefined: es el bug clásico de olvidar el return. En B el callback devuelve una promesa, y la promesa del then adopta su estado (se aplana): el siguiente then recibe 2, nunca la promesa.",
  },
  {
    id: "promesas-catch-finally",
    kind: "predecir",
    concepts: ["async.promesas"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
Promise.resolve(1)
  .then((n) => {
    throw new Error("boom " + n);
  })
  .then(() => console.log("no llego"))
  .catch((e) => {
    console.log("catch:", e.message);
    return "recuperado";
  })
  .finally(() => {
    console.log("finally");
    return "ignorado";
  })
  .then((v) => console.log("then:", v));
`),
    options: opts(
      "catch: boom 1\nfinally\nthen: recuperado",
      "catch: boom 1\nfinally\nthen: ignorado",
      "no llego\ncatch: boom 1\nfinally\nthen: recuperado",
      "catch: boom 1\nfinally",
    ),
    correct: "a",
    explanation:
      "Un throw dentro de un then rechaza la promesa que ese then devolvió. El rechazo se salta los then sin manejador de error (\"no llego\" no se imprime) hasta llegar al catch. catch es un then(undefined, fn): si su callback devuelve un valor, la cadena vuelve a estar cumplida con ese valor. finally no recibe argumentos y su valor de retorno se ignora: deja pasar el resultado anterior (\"recuperado\"). Solo cambiaría el resultado si lanzara o devolviera una promesa rechazada.",
  },
  {
    id: "promesas-rechazo-sin-manejar",
    kind: "predecir",
    concepts: ["async.promesas"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const p = Promise.reject(new Error("x"));
p.catch((e) => console.log("manejado:", e.message));
p.then(() => console.log("ok"));
console.log("fin");
`),
    options: opts(
      "fin\nmanejado: x\nUncaught (in promise) Error",
      "fin\nmanejado: x",
      "manejado: x\nfin",
      "fin\nmanejado: x\nok",
    ),
    correct: "a",
    explanation:
      "p tiene dos consumidores independientes. p.catch maneja el rechazo de p, pero p.then(...) crea otra promesa que también queda rechazada (el then no tiene manejador de error, así que el rechazo se propaga) y nadie la maneja. Cada then crea una rama nueva: el catch tiene que colgar del final de la cadena que lo necesita, no de la promesa original.",
  },
  {
    id: "combinadores-all-orden",
    kind: "predecir",
    concepts: ["async.combinadores"],
    difficulty: "trampa",
    prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
    code: code("js", `
const task = (v, ms, fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      console.log("termina", v);
      fail ? reject(new Error(v)) : resolve(v);
    }, ms),
  );

const r = await Promise.all([task("a", 200), task("b", 0), task("c", 100)]);
console.log(r.join(","));

try {
  await Promise.all([task("lento", 300), task("roto", 0, true)]);
} catch (e) {
  console.log("all:", e.message);
}
`),
    options: opts(
      "termina b\ntermina c\ntermina a\na,b,c\ntermina roto\nall: roto\ntermina lento",
      "termina b\ntermina c\ntermina a\nb,c,a\ntermina roto\nall: roto\ntermina lento",
      "termina b\ntermina c\ntermina a\na,b,c\ntermina roto\ntermina lento\nall: roto",
      "termina b\ntermina c\ntermina a\na,b,c\ntermina roto\nall: roto",
    ),
    correct: "a",
    explanation:
      "Las tareas terminan en orden de duración, pero Promise.all coloca cada resultado en la posición de su promesa en el array de entrada: a,b,c. En el segundo caso all falla rápido: se rechaza en cuanto \"roto\" falla, sin esperar a \"lento\". Pero \"lento\" no se cancela: su timer sigue vivo y termina 300 ms después. Promise.all solo deja de esperar; no detiene nada.",
  },
  {
    id: "combinadores-race-any",
    kind: "predecir",
    concepts: ["async.combinadores"],
    difficulty: "base",
    prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
    code: code("js", `
const after = (ms, v, fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(v)) : resolve(v)), ms),
  );

const r1 = await Promise.race([after(300, "datos"), after(0, "timeout", true)])
  .catch((e) => "race falló: " + e.message);
console.log(r1);

console.log(await Promise.any([after(0, "x", true), after(100, "y")]));

try {
  await Promise.any([after(0, "p", true), after(0, "q", true)]);
} catch (e) {
  console.log(e.constructor.name, e.errors.map((err) => err.message).join(","));
}
`),
    options: opts(
      "race falló: timeout\ny\nAggregateError p,q",
      "datos\ny\nAggregateError p,q",
      "race falló: timeout\nx\nAggregateError p,q",
      "race falló: timeout\ny\nError p",
    ),
    correct: "a",
    explanation:
      "race se asienta igual que la primera promesa que se asiente, sea cumplimiento o rechazo: el timeout falla antes y gana (es la base del patrón de timeout). any ignora los rechazos y se cumple con la primera promesa que se cumpla (\"y\"). Si todas se rechazan, any se rechaza con un AggregateError cuyo array errors contiene los motivos en el orden de entrada.",
  },
];
