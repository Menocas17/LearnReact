import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "fetch-500-syntaxerror",
    kind: "predecir",
    concepts: ["async.fetch"],
    difficulty: "trampa",
    prompt:
      "fakeFetch se comporta como fetch cuando el servidor responde un 500 con una página HTML. ¿Qué imprime?",
    code: code("js", `
// Simula un servidor que falla con una página de error HTML
const fakeFetch = async () =>
  new Response("<h1>Internal Server Error</h1>", { status: 500 });

try {
  const res = await fakeFetch("/api/perfil");
  console.log("resolvió", res.ok, res.status);
  const data = await res.json();
  console.log("datos", data.name);
} catch (e) {
  console.log("catch", e.name);
}
`),
    options: opts(
      "catch Error",
      "resolvió false 500\ncatch SyntaxError",
      "resolvió false 500\ndatos undefined",
      "resolvió true 500\ncatch SyntaxError",
    ),
    correct: "b",
    explanation:
      "Un 500 es una respuesta HTTP válida: la promesa de fetch se cumple con ok en false (ok solo es true para 200-299). El catch sí se ejecuta, pero por otro motivo: res.json() intenta parsear \"<h1>…\" como JSON y rechaza con SyntaxError. El error que ves no menciona el 500 en ninguna parte; por eso hay que comprobar res.ok antes de leer el cuerpo.",
  },
  {
    id: "fetch-body-una-vez",
    kind: "predecir",
    concepts: ["async.fetch"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const res = new Response('{"name":"Ana"}', { status: 200 });
const text = await res.text();
console.log(text.length, res.bodyUsed);
try {
  const data = await res.json();
  console.log(data.name);
} catch (e) {
  console.log(e.name);
}
`),
    options: opts(
      "14 true\nAna",
      "14 false\nAna",
      "14 true\nTypeError",
      "14 true\nSyntaxError",
    ),
    correct: "c",
    explanation:
      "El cuerpo de una Response es un stream que solo se puede consumir una vez. text() lo lee entero y marca bodyUsed como true; la segunda lectura (json(), text(), blob()…) rechaza con TypeError. Si necesitas el texto y el JSON, lee text() y luego usa JSON.parse(text); si necesitas leerlo dos veces de verdad, usa res.clone() antes de la primera lectura.",
  },
  {
    id: "abort-segunda-vez",
    kind: "predecir",
    concepts: ["async.abort"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
const controller = new AbortController();
const { signal } = controller;
signal.addEventListener("abort", () => console.log("abort"));

console.log(signal.aborted);
controller.abort();
console.log(signal.aborted, signal.reason.name);
controller.abort(new Error("otra vez"));
console.log(signal.reason.name);
`),
    options: opts(
      "false\nabort\ntrue AbortError\nAbortError",
      "false\nabort\ntrue AbortError\nabort\nError",
      "false\ntrue undefined\nError",
      "false\nabort\ntrue Error\nError",
    ),
    correct: "a",
    explanation:
      "abort() sin argumentos pone signal.aborted en true, guarda como reason una DOMException con name \"AbortError\" y dispara el evento \"abort\" de forma síncrona. Una señal solo se aborta una vez: la segunda llamada no hace nada, ni cambia reason ni vuelve a disparar el evento. Por eso un AbortController no se reutiliza: para la siguiente petición creas uno nuevo.",
  },
  {
    id: "abort-timeout-any",
    kind: "predecir",
    concepts: ["async.abort"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
const user = new AbortController();
const signal = AbortSignal.any([user.signal, AbortSignal.timeout(100)]);
signal.addEventListener("abort", () => console.log("abort:", signal.reason.name));

setTimeout(() => {
  user.abort();
  console.log(user.signal.reason.name, signal.reason.name);
}, 300);
`),
    options: opts(
      "abort: AbortError\nAbortError AbortError",
      "abort: TimeoutError\nAbortError AbortError",
      "abort: TimeoutError\nAbortError TimeoutError",
      "abort: TimeoutError\nabort: AbortError\nAbortError TimeoutError",
    ),
    correct: "c",
    explanation:
      "AbortSignal.any() devuelve una señal que se aborta en cuanto lo haga cualquiera de las suyas, con el reason de la primera. A los 100 ms gana el timeout, cuyo reason es una DOMException \"TimeoutError\" (no \"AbortError\"). A los 300 ms el usuario aborta su propio controller, pero la señal combinada ya estaba abortada: conserva su reason y no vuelve a disparar el evento.",
  },
  {
    id: "abort-efecto-catch",
    kind: "opcion",
    concepts: ["async.abort", "async.fetch"],
    difficulty: "trampa",
    prompt:
      "El usuario pasa rápido del perfil 1 al perfil 2. La petición del perfil 2 termina bien. ¿Qué ve en pantalla?",
    code: code("jsx", `
function Perfil({ id }) {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/usuarios/" + id, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => setError(err.name));
    return () => controller.abort();
  }, [id]);

  if (error) return <p>Error: {error}</p>;
  return <p>{user?.name}</p>;
}
`),
    options: opts(
      "El nombre del perfil 2: abortar una petición no produce ningún error",
      "\"Error: AbortError\": la petición abortada del perfil 1 rechaza, el catch guarda el error y nada lo limpia",
      "El nombre del perfil 1: la respuesta abortada llega más tarde y pisa a la del perfil 2",
      "Un error de React por actualizar el estado de un componente desmontado",
    ),
    correct: "b",
    explanation:
      "Al cambiar id, React ejecuta la limpieza: controller.abort() hace que la promesa de fetch del perfil 1 rechace con una DOMException \"AbortError\", que llega al catch y se guarda en error. La petición del perfil 2 hace setUser, pero error sigue con valor y el componente muestra el error. Una cancelación no es un fallo: en el catch hay que ignorar err.name === \"AbortError\". React 18 eliminó el aviso de actualizar componentes desmontados, y la respuesta del perfil 1 no puede pisar a nada porque su promesa ya rechazó.",
  },
  {
    id: "abort-no-deshace",
    kind: "opcion",
    concepts: ["async.abort", "async.fetch"],
    difficulty: "base",
    prompt:
      "Un botón \"Pagar\" envía un POST con fetch y una señal de AbortController. El usuario pulsa \"Cancelar\" (que llama a controller.abort()) un segundo después, cuando la petición ya había llegado al servidor. ¿Qué es cierto?",
    options: opts(
      "El navegador avisa al servidor y este revierte el pago automáticamente",
      "El pago no se procesa: abort() impide que el servidor termine la petición",
      "La promesa de fetch rechaza con AbortError, pero el servidor puede haber procesado el pago; deshacerlo requiere otra petición explícita",
      "abort() no tiene efecto sobre peticiones POST, solo sobre GET",
    ),
    correct: "c",
    explanation:
      "Abortar es una decisión del cliente: deja de esperar la respuesta, cierra la conexión si sigue abierta y hace que la promesa rechace con AbortError. No existe un mensaje de \"deshacer\" en HTTP: si el servidor ya recibió la petición, puede completarla igualmente. Para operaciones con efectos (pagos, envíos) la cancelación real es una petición propia (p. ej. un endpoint de cancelación) y el servidor debe ser idempotente ante reintentos.",
  },
];
