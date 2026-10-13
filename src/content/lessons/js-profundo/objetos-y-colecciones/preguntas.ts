import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "objetos-transformar-orden",
    kind: "predecir",
    concepts: ["js.objetos-avanzado"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const prices = { x: 5, 10: 3, "-1": 2, 9: 1, "01": 4 };
const doubled = Object.fromEntries(
  Object.entries(prices).map(([key, value]) => [key, value * 2]),
);
console.log(Object.keys(doubled).join(","));
console.log(doubled[9], doubled["01"]);
`),
    options: opts(
      "9,10,x,-1,01\n2 8",
      "x,10,-1,9,01\n2 8",
      "-1,01,9,10,x\n2 8",
      "9,10,x,-1,01\n1 4",
    ),
    correct: "a",
    explanation:
      "Object.entries → map → Object.fromEntries crea un objeto nuevo con los valores duplicados. Al enumerar, las claves que son índices enteros canónicos (\"9\", \"10\") van primero y en orden numérico; el resto conserva el orden de inserción. \"-1\" y \"01\" parecen números, pero no son índices enteros canónicos (uno es negativo y el otro tiene un cero delante), así que se tratan como strings normales.",
  },
  {
    id: "objetos-getter-cada-acceso",
    kind: "predecir",
    concepts: ["js.objetos-avanzado"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
let calls = 0;
const cart = {
  items: [10, 20],
  get total() {
    calls++;
    return this.items.reduce((a, b) => a + b, 0);
  },
};
console.log(cart.total);
cart.items.push(5);
console.log(cart.total, calls);
`),
    options: opts("30\n35 2", "30\n30 1", "30\n35 1", "30\n30 2"),
    correct: "a",
    explanation:
      "Un getter no guarda un valor: es una función que se ejecuta en cada lectura de la propiedad. La segunda lectura vuelve a sumar los items (ya con el 5) y calls llega a 2. Si el cálculo es caro, leerlo muchas veces lo repite cada vez.",
  },
  {
    id: "objetos-in-vs-hasown",
    kind: "predecir",
    concepts: ["js.objetos-avanzado"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
const user = { name: "Ana" };
Object.defineProperty(user, "id", { value: 7, enumerable: false });
console.log("toString" in user, Object.hasOwn(user, "toString"));
console.log(Object.keys(user).join(","), Object.hasOwn(user, "id"), user.id);
`),
    options: opts(
      "true false\nname true 7",
      "false false\nname,id true 7",
      "true true\nname true 7",
      "true false\nname false undefined",
    ),
    correct: "a",
    explanation:
      "in busca también en la cadena de prototipos (toString viene de Object.prototype); Object.hasOwn solo mira las propiedades propias. La propiedad id existe y es propia, pero al definirla con enumerable: false no aparece en Object.keys (ni en for...in ni en JSON.stringify).",
  },
  {
    id: "colecciones-claves-objeto",
    kind: "predecir",
    concepts: ["js.map-set", "js.objetos-avanzado"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const a = { id: 1 };
const b = { id: 2 };
const obj = {};
obj[a] = "A";
obj[b] = "B";
const map = new Map([[a, "A"], [b, "B"]]);
console.log(Object.keys(obj).length, obj[a]);
console.log(map.size, map.get(a));
const set = new Set([NaN, NaN, 0, -0, "0"]);
console.log(set.size, set.has(NaN));
`),
    options: opts(
      "1 B\n2 A\n3 true",
      "2 A\n2 A\n3 true",
      "1 B\n2 A\n5 false",
      "2 A\n2 A\n4 false",
    ),
    correct: "a",
    explanation:
      "Las claves de un objeto solo pueden ser strings (o symbols): a y b se convierten a \"[object Object]\", así que obj[b] pisa a obj[a]. Un Map usa el objeto mismo como clave, por referencia. Set y Map comparan con SameValueZero: NaN es igual a NaN (aunque NaN === NaN sea false) y 0 es igual a -0; \"0\" es otro valor. Quedan NaN, 0 y \"0\".",
  },
  {
    id: "iteradores-generador-agotado",
    kind: "predecir",
    concepts: ["js.iteradores-generadores"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
function* numeros() {
  console.log("inicio");
  yield 1;
  yield 2;
}
const gen = numeros();
console.log("creado");
console.log([...gen].join(","));
console.log([...gen].length);
`),
    options: opts(
      "creado\ninicio\n1,2\n0",
      "inicio\ncreado\n1,2\n0",
      "creado\ninicio\n1,2\n2",
      "creado\ninicio\n1,2\ninicio\n2",
    ),
    correct: "a",
    explanation:
      "Llamar a un generador no ejecuta su cuerpo: solo crea el objeto generador. El código corre cuando alguien pide valores con next() (aquí, el primer spread). Un generador se recorre una sola vez: después de terminar está agotado y el segundo spread no obtiene nada. Para recorrerlo de nuevo hay que llamar otra vez a numeros().",
  },
  {
    id: "iteradores-protocolo",
    kind: "predecir",
    concepts: ["js.iteradores-generadores", "js.objetos-avanzado"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
const cuenta = {
  hasta: 3,
  [Symbol.iterator]() {
    let n = 0;
    const hasta = this.hasta;
    return {
      next: () => (n < hasta ? { value: ++n, done: false } : { value: undefined, done: true }),
    };
  },
};
const [primero, ...resto] = cuenta;
console.log(primero, resto.join("-"), Array.from(cuenta).length);
`),
    options: opts("1 2-3 3", "0 1-2 3", "1 2-3 0", "Uncaught TypeError"),
    correct: "a",
    explanation:
      "[Symbol.iterator] es una clave computada: el método que hace iterable al objeto. Cada consumidor (destructuring, Array.from) llama a ese método y recibe un iterador nuevo con su propio n, así que ambos recorren 1, 2, 3 desde el principio.",
  },
];
