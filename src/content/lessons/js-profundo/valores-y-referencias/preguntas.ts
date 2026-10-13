import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "referencias-igualdad-objetos",
    kind: "predecir",
    concepts: ["js.valor-referencia"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
const a = { id: 1 };
const b = { id: 1 };
const c = a;
console.log(a === b, a === c, Object.is(a, b));
console.log(JSON.stringify(a) === JSON.stringify(b));
`),
    options: opts(
      "false true false\ntrue",
      "true true true\ntrue",
      "false true true\ntrue",
      "false false false\nfalse",
    ),
    correct: "a",
    explanation:
      "Entre objetos, === y Object.is comparan identidad (si son el mismo objeto en memoria), no contenido. a y b son dos objetos distintos con el mismo contenido: false. c apunta al mismo objeto que a: true. Las dos cadenas JSON sí son primitivos iguales, por eso la última comparación da true.",
  },
  {
    id: "referencias-parametro-reasignado",
    kind: "predecir",
    concepts: ["js.valor-referencia"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
function update(user) {
  user.name = "Luis";
  user = { name: "Eva" };
  user.name = "Sara";
}

const u = { name: "Ana" };
update(u);
console.log(u.name);
`),
    options: opts("Ana", "Luis", "Eva", "Sara"),
    correct: "b",
    explanation:
      "El parámetro user recibe una copia de la referencia: apunta al mismo objeto que u. La primera línea muta ese objeto compartido (name pasa a \"Luis\"). La segunda reasigna la variable local user a un objeto nuevo; u sigue apuntando al original, así que lo que se haga después con user ya no le afecta.",
  },
  {
    id: "referencias-react-push",
    kind: "opcion",
    concepts: ["js.valor-referencia", "js.inmutabilidad"],
    difficulty: "base",
    prompt: "Al hacer click, la tarea se añade al array pero la lista no se vuelve a pintar. ¿Por qué?",
    code: code("jsx", `
const [todos, setTodos] = useState([]);

function handleAdd(text) {
  todos.push({ id: Date.now(), text });
  setTodos(todos);
}
`),
    options: opts(
      "Porque push es asíncrono y setTodos se ejecuta antes de que termine",
      "Porque setTodos recibe el mismo array que ya tenía el estado; React lo compara con Object.is, ve que no cambió y no vuelve a renderizar",
      "Porque useState no admite arrays; hay que usar useReducer",
      "Porque falta un key en cada elemento de la lista",
    ),
    correct: "b",
    explanation:
      "push muta el array existente y devuelve su nueva longitud; todos sigue siendo la misma referencia. React decide si el estado cambió con Object.is(anterior, nuevo), que da true, así que omite el render. La solución es crear un array nuevo: setTodos([...todos, { id: Date.now(), text }]).",
  },
  {
    id: "inmutabilidad-spread-anidado",
    kind: "predecir",
    concepts: ["js.inmutabilidad", "js.valor-referencia"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const state = { user: { name: "Ana" }, tags: ["a"] };
const copy = { ...state };

copy.user.name = "Luis";
copy.tags = [...copy.tags, "b"];

console.log(state.user.name, state.tags.join(","));
console.log(copy.user === state.user, copy.tags === state.tags);
`),
    options: opts(
      "Luis a\ntrue false",
      "Ana a\nfalse false",
      "Luis a,b\ntrue true",
      "Ana a\ntrue false",
    ),
    correct: "a",
    explanation:
      "El spread hace una copia superficial: copy es un objeto nuevo, pero copy.user es la misma referencia que state.user, así que cambiar su name cambia también el de state. En cambio, copy.tags se reasignó a un array nuevo: state.tags no se toca y ya no son el mismo array.",
  },
  {
    id: "inmutabilidad-sort-muta",
    kind: "predecir",
    concepts: ["js.inmutabilidad"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const nums = [3, 1, 2];
const sorted = nums.sort();
const reversed = nums.toReversed();

console.log(nums.join(","), sorted === nums);
console.log(reversed.join(","), reversed === nums);
`),
    options: opts(
      "1,2,3 true\n3,2,1 false",
      "3,1,2 false\n2,1,3 false",
      "1,2,3 false\n3,2,1 false",
      "1,2,3 true\n3,2,1 true",
    ),
    correct: "a",
    explanation:
      "sort ordena el array en el sitio y devuelve ese mismo array: nums queda ordenado y sorted === nums. toReversed (ES2023) no muta: devuelve un array nuevo invertido a partir del nums ya ordenado. Si no quieres tocar el original, usa toSorted en lugar de sort.",
  },
  {
    id: "inmutabilidad-freeze-superficial",
    kind: "predecir",
    concepts: ["js.inmutabilidad"],
    difficulty: "trampa",
    prompt: "El código se ejecuta como módulo ES (modo estricto). ¿Qué imprime?",
    code: code("js", `
const config = Object.freeze({ theme: { color: "azul" } });

try {
  config.theme = { color: "verde" };
} catch (e) {
  console.log(e.name);
}

config.theme.color = "rojo";
console.log(config.theme.color);
`),
    options: opts("TypeError\nrojo", "TypeError\nazul", "verde", "rojo"),
    correct: "a",
    explanation:
      "Object.freeze congela solo el primer nivel: reasignar config.theme lanza TypeError en modo estricto (fuera de él se ignoraría en silencio). Pero config.theme sigue siendo un objeto normal, no congelado, así que su color sí cambia a \"rojo\". Para congelar en profundidad hay que recorrer el objeto y congelar cada nivel.",
  },
];
