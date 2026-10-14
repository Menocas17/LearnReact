import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "destructuring-default-null",
    kind: "predecir",
    concepts: ["js.destructuring"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
function greet({ name = "invitado", role = "user" } = {}) {
  return name + "/" + role;
}
console.log(greet({ name: null, role: undefined }));
console.log(greet());
`),
    options: opts(
      "null/user\ninvitado/user",
      "invitado/user\ninvitado/user",
      "null/undefined\ninvitado/user",
      "null/user\nUncaught TypeError",
    ),
    correct: "a",
    explanation:
      "Un valor por defecto solo se aplica cuando el valor es exactamente undefined. null es un valor \"presente\", así que name queda en null; role: undefined sí activa \"user\". En la segunda llamada no hay argumento: el = {} del parámetro evita el TypeError y luego cada propiedad toma su valor por defecto.",
  },
  {
    id: "destructuring-anidado-null",
    kind: "predecir",
    concepts: ["js.destructuring"],
    difficulty: "trampa",
    prompt: "La API devolvió { data: null }. ¿Qué imprime?",
    code: code("js", `
const res = { data: null };
const { data: { user = "anon" } = {} } = res;
console.log(user);
`),
    options: opts("anon", "undefined", "null", "Uncaught TypeError"),
    correct: "d",
    explanation:
      "El = {} del nivel intermedio solo cubre data === undefined. Como data es null, JavaScript intenta leer null.user y lanza TypeError (Cannot read properties of null). Para datos que pueden ser null, extrae el nivel intermedio y usa ?. o ?? en vez de destructuring anidado.",
  },
  {
    id: "destructuring-usestate-copia",
    kind: "predecir",
    concepts: ["js.destructuring"],
    difficulty: "base",
    prompt: "Este useState de juguete devuelve un array de 2 elementos, como el de React. ¿Qué imprime?",
    code: code("js", `
function useState(initial) {
  let value = initial;
  return [value, (next) => { value = next; }];
}
const [count, setCount] = useState(0);
setCount(5);
console.log(count);
const [, second, , fourth = "x"] = [10, 20, 30];
console.log(second, fourth);
`),
    options: opts("0\n20 x", "5\n20 x", "0\n20 undefined", "5\n10 30"),
    correct: "a",
    explanation:
      "El destructuring de arrays copia el valor de cada posición en una variable nueva: count es una constante con 0 y setCount no puede cambiarla. Por eso en React el valor nuevo solo llega en el siguiente render, con otra constante. Los huecos (,) saltan posiciones y fourth recibe \"x\" porque la posición 3 no existe (es undefined).",
  },
  {
    id: "spread-orden-props",
    kind: "predecir",
    concepts: ["js.spread-rest", "js.destructuring"],
    difficulty: "trampa",
    prompt: "Dos versiones del mismo componente Button, escritas como funciones que devuelven las props finales. ¿Qué imprime?",
    code: code("js", `
function buttonA({ variant = "primary", ...props }) {
  return { ...props, className: "btn-" + variant };
}
function buttonB({ variant = "primary", ...props }) {
  return { className: "btn-" + variant, ...props };
}
const fromParent = { className: "wide", variant: undefined };
console.log(buttonA(fromParent).className);
console.log(buttonB(fromParent).className);
`),
    options: opts("btn-primary\nwide", "wide\nbtn-primary", "btn-primary\nbtn-primary", "wide\nwide"),
    correct: "a",
    explanation:
      "En un objeto literal, si una clave se repite gana la última que se escribe. En buttonA el className fijo va después de ...props y pisa el del padre; en buttonB el del padre (dentro de props) va después y pisa el fijo. Ninguna de las dos combina ambos: para eso hay que extraer className y concatenarlo. variant: undefined activa el valor por defecto \"primary\".",
  },
  {
    id: "spread-null-objeto-array",
    kind: "predecir",
    concepts: ["js.spread-rest"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const extra = null;
const obj = { a: 1, ...extra, ...undefined };
console.log(JSON.stringify(obj));
const arr = [0, ...extra];
console.log(arr.length);
`),
    options: opts(
      "{\"a\":1}\nUncaught TypeError",
      "Uncaught TypeError",
      "{\"a\":1}\n1",
      "{\"a\":1,\"extra\":null}\n2",
    ),
    correct: "a",
    explanation:
      "El spread en objetos copia propiedades propias enumerables y trata null y undefined como \"nada que copiar\". El spread en arrays (y en llamadas a funciones) usa el protocolo de iteración: null no es iterable y lanza TypeError (extra is not iterable).",
  },
  {
    id: "spread-rest-params",
    kind: "predecir",
    concepts: ["js.spread-rest", "js.destructuring"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
function pick({ id, onClose, ...rest }) {
  return Object.keys(rest).join(",");
}
console.log(pick({ id: 1, title: "Hola", onClose() {}, "aria-label": "x" }));
function sum(first, ...others) {
  return first + others.length;
}
console.log(sum(10, 1, 2, 3));
console.log(Math.max(...[3, 9, 2]), Math.max(...[]));
console.log([..."hola", ...new Set([1, 1, 2])].join(""));
`),
    options: opts(
      "title,aria-label\n13\n9 -Infinity\nhola12",
      "id,title,onClose,aria-label\n13\n9 -Infinity\nhola112",
      "title,aria-label\n16\n9 undefined\nhola12",
      "title,aria-label\n13\n9 0\nhola112",
    ),
    correct: "a",
    explanation:
      "...rest en el destructuring recoge las propiedades no extraídas (title y aria-label). ...others en los parámetros es un array real con los argumentos sobrantes: [1, 2, 3], de longitud 3. Math.max(...[]) equivale a Math.max(), que devuelve -Infinity. Los strings y los Set son iterables: el string se separa en caracteres y el Set ya no tiene duplicados.",
  },
];
