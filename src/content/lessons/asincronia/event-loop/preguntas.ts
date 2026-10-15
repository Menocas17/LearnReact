import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "event-loop-microtareas-tras-cada-tarea",
    kind: "predecir",
    concepts: ["async.event-loop"],
    difficulty: "trampa",
    prompt: "¿Qué imprime?",
    code: code("js", `
console.log("inicio");
setTimeout(() => {
  console.log("timeout 1");
  Promise.resolve().then(() => console.log("then dentro de timeout 1"));
}, 0);
setTimeout(() => console.log("timeout 2"), 0);
Promise.resolve()
  .then(() => console.log("then 1"))
  .then(() => console.log("then 2"));
console.log("fin");
`),
    options: opts(
      "inicio\nfin\nthen 1\nthen 2\ntimeout 1\nthen dentro de timeout 1\ntimeout 2",
      "inicio\nfin\nthen 1\nthen 2\ntimeout 1\ntimeout 2\nthen dentro de timeout 1",
      "inicio\nfin\nthen 1\ntimeout 1\nthen 2\ntimeout 2\nthen dentro de timeout 1",
      "inicio\nfin\ntimeout 1\ntimeout 2\nthen 1\nthen 2\nthen dentro de timeout 1",
    ),
    correct: "a",
    explanation:
      "El script es la primera tarea: imprime inicio y fin. Al terminar se vacía TODA la cola de microtareas, incluidas las que se encolan mientras se vacía: then 1 encola then 2 y también se ejecuta. Luego el event loop toma una sola tarea (timeout 1), que encola una microtarea; antes de pasar a la siguiente tarea (timeout 2) se vacían otra vez las microtareas. Las microtareas no esperan a que se acaben todos los timers: se vacían después de cada tarea.",
  },
  {
    id: "event-loop-await-continuacion",
    kind: "predecir",
    concepts: ["async.event-loop"],
    difficulty: "trampa",
    prompt: "Un handler llama a una función async sin esperarla. ¿Qué imprime?",
    code: code("js", `
async function guardar() {
  console.log("guardar: inicio");
  await Promise.resolve();
  console.log("guardar: tras await");
}
function onClick() {
  console.log("click: inicio");
  guardar();
  console.log("click: fin");
}
setTimeout(() => console.log("timeout"), 0);
onClick();
Promise.resolve().then(() => console.log("then"));
`),
    options: opts(
      "click: inicio\nguardar: inicio\nguardar: tras await\nclick: fin\nthen\ntimeout",
      "click: inicio\nclick: fin\nguardar: inicio\nguardar: tras await\nthen\ntimeout",
      "click: inicio\nguardar: inicio\nclick: fin\nthen\nguardar: tras await\ntimeout",
      "click: inicio\nguardar: inicio\nclick: fin\nguardar: tras await\nthen\ntimeout",
    ),
    correct: "d",
    explanation:
      "Llamar a una función async ejecuta su cuerpo de forma síncrona hasta el primer await (guardar: inicio). En ese punto la función se suspende, su continuación queda programada como microtarea y el control vuelve a onClick (click: fin). La continuación se encoló antes que el then del script, así que sale antes. El timeout es una tarea: va al final.",
  },
  {
    id: "event-loop-microtareas-infinitas",
    kind: "predecir",
    concepts: ["async.event-loop"],
    difficulty: "base",
    prompt: "Cada microtarea encola otra mientras n < 1000. ¿Qué imprime?",
    code: code("js", `
let n = 0;
setTimeout(() => console.log("timeout: n = " + n), 0);
function tick() {
  n++;
  if (n < 1000) queueMicrotask(tick);
}
queueMicrotask(tick);
console.log("sync: n = " + n);
`),
    options: opts(
      "sync: n = 0\ntimeout: n = 1000",
      "sync: n = 0\ntimeout: n = 1",
      "sync: n = 1000\ntimeout: n = 1000",
      "sync: n = 0\ntimeout: n = 0",
    ),
    correct: "a",
    explanation:
      "La cola de microtareas se vacía por completo antes de pasar a la siguiente tarea, y eso incluye las microtareas que se encolan durante el vaciado. Las 1000 microtareas se ejecutan seguidas y el timeout espera. Si la condición nunca fuera falsa, el timeout no llegaría a ejecutarse jamás (y en el navegador la página no volvería a pintarse).",
  },
  {
    id: "callbacks-retardo-minimo",
    kind: "predecir",
    concepts: ["async.callbacks", "async.event-loop"],
    difficulty: "trampa",
    prompt: "El timeout tiene retardo 0. ¿Qué imprime?",
    code: code("js", `
const inicio = Date.now();
setTimeout(() => {
  const espera = Date.now() - inicio;
  console.log(espera >= 100 ? "esperó 100 ms o más" : "esperó menos de 100 ms");
}, 0);
while (Date.now() - inicio < 100) {
  // trabajo síncrono durante 100 ms
}
console.log("bucle terminado");
`),
    options: opts(
      "esperó menos de 100 ms\nbucle terminado",
      "bucle terminado\nesperó menos de 100 ms",
      "bucle terminado\nesperó 100 ms o más",
      "esperó 100 ms o más\nbucle terminado",
    ),
    correct: "c",
    explanation:
      "El retardo de setTimeout es un mínimo, no una cita: cuando vence, el callback solo se encola como tarea. Una tarea no interrumpe a otra, así que tiene que esperar a que el script termine su bucle de 100 ms. Por eso el callback se ejecuta después de \"bucle terminado\" y mide 100 ms o más, aunque pediste 0.",
  },
  {
    id: "render-microtarea-no-pinta",
    kind: "opcion",
    concepts: ["async.render-navegador", "async.event-loop"],
    difficulty: "trampa",
    prompt:
      "En un handler de click quieres que se vea \"Procesando…\" antes de un cálculo síncrono de 2 segundos, así que lo aplazas con queueMicrotask. ¿Qué ve el usuario en el navegador?",
    code: code("js", `
button.addEventListener("click", () => {
  status.textContent = "Procesando…";
  queueMicrotask(() => {
    calcularTodo(); // bucle síncrono de ~2 s
    status.textContent = "Listo";
  });
});
`),
    options: opts(
      "\"Procesando…\" durante 2 segundos y luego \"Listo\": la microtarea se ejecuta cuando el handler ya terminó.",
      "La página se congela unos 2 segundos sin mostrar \"Procesando…\" y después aparece directamente \"Listo\".",
      "\"Procesando…\" y luego \"Listo\", porque cambiar textContent fuerza un pintado inmediato.",
      "Depende del navegador: Chrome pinta antes de las microtareas y Firefox no.",
    ),
    correct: "b",
    explanation:
      "El navegador solo puede pintar entre tareas, y las microtareas se vacían al terminar la tarea actual, antes de cualquier oportunidad de pintado. Para la pantalla, el handler y la microtarea son un único bloque de trabajo: cuando por fin pinta, el texto ya es \"Listo\". Cambiar el DOM no pinta al instante; solo marca que hay algo que pintar. Para dar opción al pintado hay que ceder con una tarea nueva (setTimeout, scheduler.yield()); como el navegador pinta al ritmo de los frames, para garantizar que el texto se vea antes del cálculo se suele usar requestAnimationFrame y, dentro, un setTimeout.",
  },
  {
    id: "render-trocear-trabajo",
    kind: "opcion",
    concepts: ["async.render-navegador", "async.callbacks"],
    difficulty: "base",
    prompt:
      "Al pulsar un botón tienes que procesar 50 000 filas en el navegador y la interfaz se congela (el INP es malo). Sin usar Web Workers, ¿qué cambio evita el bloqueo?",
    options: opts(
      "Meter el bucle dentro de new Promise((resolve) => { …bucle…; resolve(); }) para que sea asíncrono.",
      "Convertir la función en async y llamarla sin await.",
      "Procesar las filas en bloques pequeños y ceder al event loop entre bloque y bloque con setTimeout o scheduler.yield().",
      "Ejecutar el bucle completo dentro de un callback de requestAnimationFrame.",
    ),
    correct: "c",
    explanation:
      "Lo que bloquea es una tarea larga: mientras corre, el navegador no puede atender clicks ni pintar. El executor de new Promise se ejecuta de forma síncrona, y una función async también lo es hasta su primer await, así que ninguna de las dos trocea nada. requestAnimationFrame solo cambia cuándo empieza el bucle (justo antes del pintado), pero ese frame igualmente se retrasa 2 segundos. Trocear el trabajo en tareas cortas deja huecos para que el navegador responda y pinte.",
  },
];
