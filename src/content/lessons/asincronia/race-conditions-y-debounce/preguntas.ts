import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "race-respuesta-vieja-gana",
    kind: "predecir",
    concepts: ["async.race-conditions"],
    difficulty: "trampa",
    prompt:
      "Un buscador simulado: la búsqueda de \"r\" tarda 400 ms y la de \"re\" 100 ms. El usuario teclea \"r\" y, 100 ms después, \"re\". ¿Qué imprime?",
    code: code("js", `
const latency = { r: 400, re: 100 };
function fakeSearch(q) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("resultados de " + q), latency[q]);
  });
}

let screen = "(vacío)";
async function onInput(q) {
  const results = await fakeSearch(q);
  screen = results;
  console.log("pinta:", results);
}

onInput("r");
setTimeout(() => onInput("re"), 100);
setTimeout(() => console.log("pantalla:", screen), 700);
`),
    options: opts(
      "pinta: resultados de r\npinta: resultados de re\npantalla: resultados de re",
      "pinta: resultados de re\npinta: resultados de r\npantalla: resultados de r",
      "pinta: resultados de re\npinta: resultados de r\npantalla: resultados de re",
      "pinta: resultados de re\npantalla: resultados de re",
    ),
    correct: "b",
    explanation:
      "La búsqueda de \"r\" sale a los 0 ms y vuelve a los 400; la de \"re\" sale a los 100 y vuelve a los 200. Cada respuesta pinta cuando llega, así que la última en llegar (la vieja, \"r\") sobrescribe a la buena. Nada en async/await mantiene el orden de las peticiones: el orden lo decide la red.",
  },
  {
    id: "race-id-de-peticion",
    kind: "predecir",
    concepts: ["async.race-conditions", "js.closures"],
    difficulty: "base",
    prompt: "Mismo escenario, ahora con un contador de peticiones. ¿Qué imprime?",
    code: code("js", `
const latency = { r: 400, re: 100 };
function fakeSearch(q) {
  return new Promise((resolve) => {
    setTimeout(() => resolve("resultados de " + q), latency[q]);
  });
}

let lastRequest = 0;
async function onInput(q) {
  const requestId = ++lastRequest;
  const results = await fakeSearch(q);
  if (requestId !== lastRequest) {
    console.log("descarta:", q);
    return;
  }
  console.log("pinta:", results);
}

onInput("r");
setTimeout(() => onInput("re"), 100);
`),
    options: opts(
      "pinta: resultados de re\ndescarta: r",
      "descarta: r\npinta: resultados de re",
      "pinta: resultados de re\npinta: resultados de r",
      "descarta: re\npinta: resultados de r",
    ),
    correct: "a",
    explanation:
      "Cada llamada guarda en su propia const requestId el número que le tocó (1 para \"r\", 2 para \"re\") y, tras el await, lo compara con lastRequest, que es una variable compartida que ya vale 2. \"re\" llega primero (200 ms) y pinta; \"r\" llega a los 400 ms, ve que 1 !== 2 y se descarta. Ojo: la petición de \"r\" se completó igualmente; solo ignoramos su resultado.",
  },
  {
    id: "race-leer-modificar-escribir",
    kind: "predecir",
    concepts: ["async.race-conditions"],
    difficulty: "trampa",
    prompt: "Dos reservas concurrentes sobre el mismo stock. ¿Qué imprime?",
    code: code("js", `
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let stock = 10;
async function reserve(units, latencyMs) {
  const current = stock;      // leer
  await wait(latencyMs);      // "guardar en el servidor"
  stock = current - units;    // escribir
  console.log("reserva de", units, "-> stock", stock);
}

await Promise.all([reserve(2, 100), reserve(3, 300)]);
console.log("final:", stock);
`),
    options: opts(
      "reserva de 2 -> stock 8\nreserva de 3 -> stock 5\nfinal: 5",
      "reserva de 2 -> stock 8\nreserva de 3 -> stock 7\nfinal: 7",
      "reserva de 3 -> stock 7\nreserva de 2 -> stock 8\nfinal: 8",
      "reserva de 2 -> stock 8\nreserva de 3 -> stock 7\nfinal: 5",
    ),
    correct: "b",
    explanation:
      "Las dos llamadas leen stock (10) de forma síncrona, antes de que ninguna llegue a escribir. La de 2 escribe 10 - 2 = 8 a los 100 ms; la de 3 escribe 10 - 3 = 7 a los 300 ms, pisando a la primera. Se pierde una actualización. Es el mismo bug que setCount(count + 1) en un callback asíncrono: la solución es no leer el valor antes del await (calcular sobre el valor actual en el momento de escribir, o que lo haga el servidor de forma atómica).",
  },
  {
    id: "debounce-cancel-linea-tiempo",
    kind: "predecir",
    concepts: ["async.debounce-throttle", "js.closures"],
    difficulty: "base",
    prompt: "debounce con cancel(), espera de 300 ms. ¿Qué imprime?",
    code: code("js", `
function debounce(fn, ms) {
  let timer;
  const debounced = (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

const save = debounce((v) => console.log("guarda", v), 300);

save("a");                                // t = 0
setTimeout(() => save("b"), 100);         // t = 100
setTimeout(() => save("c"), 600);         // t = 600
setTimeout(() => save.cancel(), 700);     // t = 700
setTimeout(() => save("d"), 800);         // t = 800
`),
    options: opts(
      "guarda b\nguarda d",
      "guarda a\nguarda b\nguarda c\nguarda d",
      "guarda b\nguarda c\nguarda d",
      "guarda d",
    ),
    correct: "a",
    explanation:
      "\"a\" programa la ejecución para t = 300, pero \"b\" (t = 100) la cancela y la reprograma para t = 400: se imprime \"guarda b\". \"c\" (t = 600) programa t = 900, pero cancel() en t = 700 borra ese timer. \"d\" (t = 800) se ejecuta en t = 1100. Todas las llamadas comparten la variable timer gracias al closure.",
  },
  {
    id: "throttle-vs-debounce-salida",
    kind: "predecir",
    concepts: ["async.debounce-throttle"],
    difficulty: "trampa",
    prompt:
      "La misma ráfaga de eventos pasa por un throttle y por un debounce, ambos de 300 ms. ¿Qué imprime?",
    code: code("js", `
function throttle(fn, ms) {
  let waiting = false;
  return (...args) => {
    if (waiting) return;
    fn(...args);
    waiting = true;
    setTimeout(() => { waiting = false; }, ms);
  };
}
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

const t = throttle((e) => console.log("T:" + e), 300);
const d = debounce((e) => console.log("D:" + e), 300);
const events = [["a", 0], ["b", 100], ["c", 200], ["d", 400], ["e", 500], ["f", 900]];
for (const [name, at] of events) {
  setTimeout(() => { t(name); d(name); }, at);
}
`),
    options: opts(
      "T:a\nT:d\nD:e\nT:f\nD:f",
      "T:a\nD:c\nT:d\nD:e\nT:f\nD:f",
      "T:a\nT:d\nT:f\nD:f",
      "D:a\nT:a\nT:d\nD:e\nT:f\nD:f",
    ),
    correct: "a",
    explanation:
      "Throttle ejecuta en el acto y luego ignora durante 300 ms: a (t = 0) pasa, b y c caen en la ventana, d (t = 400) pasa y abre otra ventana hasta 700 que se traga a e, y f (t = 900) pasa. Debounce solo ejecuta tras 300 ms de silencio: el timer de c (para 500) lo cancela d en 400; el de e (para 800) llega a cumplirse antes de f, así que imprime D:e en t = 800; f imprime D:f en t = 1200. Throttle garantiza un ritmo; debounce espera a que la ráfaga termine.",
  },
  {
    id: "debounce-recreado-en-render",
    kind: "opcion",
    concepts: ["async.debounce-throttle", "js.closures"],
    difficulty: "base",
    prompt:
      "Con este componente, el usuario escribe \"hola\" rápido (las 4 teclas en menos de 300 ms). ¿Qué pasa y por qué?",
    code: code("jsx", `
function Buscador() {
  const [q, setQ] = useState("");
  const buscarLuego = debounce((texto) => buscar(texto), 300);

  return (
    <input
      value={q}
      onChange={(e) => {
        setQ(e.target.value);
        buscarLuego(e.target.value);
      }}
    />
  );
}
`),
    options: opts(
      "Se llama a buscar una sola vez con \"hola\": el debounce funciona aunque esté dentro del componente",
      "Se llama a buscar 4 veces (\"h\", \"ho\", \"hol\", \"hola\"): cada render crea un debounce nuevo con su propio timer, y el clearTimeout de una instancia no puede cancelar el timer de otra",
      "No se llama nunca a buscar: setQ provoca un render que cancela todos los timers pendientes",
      "Se llama a buscar 4 veces porque los eventos de React no son compatibles con setTimeout",
    ),
    correct: "b",
    explanation:
      "Cada tecla provoca un render, y cada render ejecuta debounce(...) de nuevo: un closure nuevo con una variable timer nueva (undefined). La llamada de la tecla siguiente usa esa instancia nueva, cuyo clearTimeout no conoce el timer de la anterior, así que los 4 timers siguen vivos y se disparan. React no cancela timers al renderizar. Solución: crear la función una sola vez (useMemo o useRef) y limpiarla al desmontar, o debouncear el valor en vez de la función.",
  },
];
