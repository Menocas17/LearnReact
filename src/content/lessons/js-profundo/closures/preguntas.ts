import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "closures-cuenta-independiente",
    kind: "predecir",
    concepts: ["js.closures"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
function makeGreeter(greeting) {
  return (name) => greeting + ", " + name;
}
const hola = makeGreeter("Hola");
const hello = makeGreeter("Hello");
console.log(hola("Ana"));
console.log(hello("Ana"));
`),
    options: opts("Hola, Ana\nHello, Ana", "Hello, Ana\nHello, Ana", "Hola, Ana\nHola, Ana", "undefined, Ana\nundefined, Ana"),
    correct: "a",
    explanation:
      "Cada llamada a makeGreeter crea un entorno nuevo con su propio greeting. La función devuelta recuerda el entorno donde nació, aunque makeGreeter ya haya terminado.",
  },
  {
    id: "closures-variable-no-valor",
    kind: "predecir",
    concepts: ["js.closures", "js.scope"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
let fns = [];
let i = 0;
while (i < 3) {
  fns.push(() => i);
  i++;
}
console.log(fns.map((f) => f()).join(","));
`),
    options: opts("0,1,2", "3,3,3", "2,2,2", "undefined,undefined,undefined"),
    correct: "b",
    explanation:
      "Las tres funciones cierran sobre la misma variable i (declarada fuera del bucle). Cuando se ejecutan, i ya vale 3. Un closure guarda la variable, no una foto de su valor. En un for (let i…) cada iteración tendría su propia i.",
  },
  {
    id: "closures-render-snapshot",
    kind: "opcion",
    concepts: ["js.closures", "react.stale-closures"],
    difficulty: "trampa",
    prompt: "Haces click en \"Enviar\" y, antes de 3 segundos, cambias el destinatario de \"Ana\" a \"Luis\". ¿Qué muestra el alert?",
    code: code("jsx", `
function Chat() {
  const [to, setTo] = useState("Ana");
  function handleSend() {
    setTimeout(() => alert("Enviado a " + to), 3000);
  }
  // <select value={to} onChange={(e) => setTo(e.target.value)}>…
  // <button onClick={handleSend}>Enviar</button>
}
`),
    options: opts(
      "Enviado a Luis",
      "Enviado a Ana",
      "Enviado a undefined",
      "Depende de la velocidad del ordenador",
    ),
    correct: "b",
    explanation:
      "handleSend se creó en el render en que to valía \"Ana\" y su closure ve esa constante. Cambiar el estado produce un render nuevo con un to nuevo, pero no modifica la variable que ya capturó el timeout. Es el comportamiento deseado aquí: el mensaje se envió a Ana.",
  },
  {
    id: "closures-fix-interval",
    kind: "opcion",
    concepts: ["react.stale-closures", "js.closures"],
    difficulty: "base",
    prompt: "¿Cuál de estos cambios hace que el contador del inicio de la lección funcione?",
    code: code("jsx", `
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, []);
`),
    options: opts(
      "Cambiar setInterval por setTimeout",
      "Usar setCount((c) => c + 1), que recibe el valor actual en vez de leer el count capturado",
      "Declarar count con let en vez de const",
      "Mover el useEffect antes del useState",
    ),
    correct: "b",
    explanation:
      "La función de actualización no depende de la variable capturada: React le pasa el estado más reciente. Otra opción válida es añadir count a las dependencias (el intervalo se recrea en cada cambio), pero el updater es más simple.",
  },
];
