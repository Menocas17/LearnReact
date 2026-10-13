import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "prototipos-shadowing-delete",
    kind: "predecir",
    concepts: ["js.prototipos"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const base = { saludo: "hola" };
const obj = Object.create(base);
console.log(obj.saludo, Object.hasOwn(obj, "saludo"));
obj.saludo = "hey";
console.log(obj.saludo, base.saludo);
delete obj.saludo;
console.log(obj.saludo);
`),
    options: opts(
      "hola false\nhey hola\nhola",
      "hola true\nhey hola\nundefined",
      "hola false\nhey hey\nhey",
      "hola false\nhey hola\nundefined",
    ),
    correct: "a",
    explanation:
      "obj no tiene saludo propio: la lectura sube por la cadena y lo encuentra en base. Asignar obj.saludo crea una propiedad propia en obj que tapa (shadowing) a la de base, sin tocar base. Al borrarla con delete, la lectura vuelve a llegar hasta base y aparece otra vez \"hola\".",
  },
  {
    id: "prototipos-array-compartido",
    kind: "predecir",
    concepts: ["js.prototipos"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const proto = { tags: [] };
const a = Object.create(proto);
const b = Object.create(proto);
a.tags.push("js");
b.tags = ["react"];
console.log(JSON.stringify([a.tags, b.tags, proto.tags]));
`),
    options: opts(
      "[[\"js\"],[\"react\"],[]]",
      "[[\"js\"],[\"react\"],[\"js\"]]",
      "[[\"js\"],[\"react\",\"js\"],[\"js\"]]",
      "[[\"js\",\"react\"],[\"react\"],[\"js\"]]",
    ),
    correct: "b",
    explanation:
      "a.tags.push(\"js\") es una lectura (a.tags) seguida de una mutación: la lectura encuentra el array de proto y push lo modifica ahí, así que lo ven todos los que heredan de proto. b.tags = [...] es una asignación: crea una propiedad propia en b y tapa la del prototipo. Por eso el estado mutable no se pone en el prototipo, sino en cada instancia.",
  },
  {
    id: "prototipos-metodos-array",
    kind: "predecir",
    concepts: ["js.prototipos"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
const arr = [1, 2];
console.log(Object.hasOwn(arr, "map"), "map" in arr);
console.log(Object.getPrototypeOf(arr) === Array.prototype);
console.log(Object.getPrototypeOf(Array) === Array.prototype);
`),
    options: opts(
      "true true\ntrue\ntrue",
      "false true\ntrue\ntrue",
      "false true\ntrue\nfalse",
      "false false\nfalse\nfalse",
    ),
    correct: "c",
    explanation:
      "map no es propiedad propia del array: vive en Array.prototype, que es el [[Prototype]] de todo array, y el operador in sí mira la cadena. La última línea es la trampa: Array.prototype es el objeto que Array asigna como prototipo a los arrays que crea, no el prototipo de la propia función Array (ese es Function.prototype).",
  },
  {
    id: "clases-metodo-vs-campo-arrow",
    kind: "predecir",
    concepts: ["js.clases", "js.prototipos"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
class Boton {
  label = "OK";
  onClick = () => this.label;
  render() {
    return this.label;
  }
}
const a = new Boton();
const b = new Boton();
console.log(a.render === b.render, a.onClick === b.onClick);
console.log(Object.hasOwn(a, "render"), Object.hasOwn(a, "onClick"));
`),
    options: opts(
      "true true\nfalse false",
      "false false\ntrue true",
      "true false\nfalse true",
      "false true\ntrue false",
    ),
    correct: "c",
    explanation:
      "Los métodos se definen una sola vez en Boton.prototype: todas las instancias comparten la misma función. Los campos (también los que guardan una arrow function) se crean en cada instancia al construirla, así que cada objeto tiene su propia función onClick. Es el precio de fijar this con un campo arrow: una función por instancia.",
  },
  {
    id: "clases-privados-static-getter",
    kind: "predecir",
    concepts: ["js.clases"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
class Usuario {
  #password;
  static count = 0;
  constructor(name, password) {
    this.name = name;
    this.#password = password;
    Usuario.count++;
  }
  get initial() {
    return this.name[0];
  }
  check(p) {
    return p === this.#password;
  }
}
const u = new Usuario("Ana", "1234");
console.log(typeof Usuario, Object.keys(u).join(","));
console.log(u.initial, u.check("1234"), u.count, Usuario.count);
`),
    options: opts(
      "function name\nA true undefined 1",
      "class name,#password\nA true 1 1",
      "object name\nundefined true undefined 1",
      "function name,password\nA true 1 1",
    ),
    correct: "a",
    explanation:
      "Una clase es una función (typeof da \"function\"). Los campos # no son propiedades normales: no aparecen en Object.keys ni se pueden leer desde fuera de la clase. initial es un getter: se lee como propiedad, sin paréntesis. count es static: vive en la propia clase Usuario, no en las instancias.",
  },
  {
    id: "clases-error-propio",
    kind: "predecir",
    concepts: ["js.clases", "js.prototipos"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
class NotFoundError extends HttpError {
  constructor(url) {
    super(404, "No encontrado: " + url);
    this.name = "NotFoundError";
  }
}
try {
  throw new NotFoundError("/api/user");
} catch (e) {
  console.log(e instanceof HttpError, e instanceof Error, e.status);
  console.log(e.name + ": " + e.message);
  console.log(new HttpError(500, "x").name);
}
`),
    options: opts(
      "true true 404\nNotFoundError: No encontrado: /api/user\nHttpError",
      "false true 404\nNotFoundError: No encontrado: /api/user\nError",
      "true true 404\nNotFoundError: No encontrado: /api/user\nError",
      "true true undefined\nError: No encontrado: /api/user\nError",
    ),
    correct: "c",
    explanation:
      "instanceof recorre la cadena de prototipos: NotFoundError.prototype → HttpError.prototype → Error.prototype, así que ambas comprobaciones dan true. super(404, …) ejecuta el constructor de HttpError, que asigna status. La trampa: name no se deduce del nombre de la clase; HttpError no lo asigna, así que se hereda \"Error\" de Error.prototype.name.",
  },
];
