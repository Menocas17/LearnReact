import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "modulos-estado-servidor",
    kind: "opcion",
    concepts: ["js.modulos"],
    difficulty: "trampa",
    prompt:
      "Este archivo se usa desde un Server Component en Next.js. El servidor acaba de arrancar. Ana visita /perfil y, segundos después, Luis visita /perfil desde otro navegador. ¿Qué devuelve recientes() en la petición de Luis?",
    code: code("js", `
// lib/vistos.js
const vistos = [];

export function registrarVisita(usuario) {
  vistos.push(usuario);
}

export function recientes() {
  return vistos.join(", ");
}

// app/perfil/page.js (resumido)
// registrarVisita(usuarioActual.nombre);
// return <p>Vistos: {recientes()}</p>;
`),
    options: opts(
      "\"Luis\": cada petición vuelve a ejecutar lib/vistos.js desde cero",
      "\"Ana, Luis\": el módulo se evaluó una vez en el proceso del servidor y todas las peticiones comparten el mismo array",
      "\"\": const impide que el array cambie",
      "Lanza un TypeError porque un módulo no puede modificar una const de nivel superior",
    ),
    correct: "b",
    explanation:
      "Un módulo se evalúa una sola vez por proceso y todos los imports reciben la misma instancia. En el servidor eso significa que vistos es compartido por todas las peticiones de todos los usuarios: Luis ve el nombre de Ana (una fuga de datos). const solo impide reasignar la variable, no mutar el array. El estado por usuario va en la base de datos, en cookies o en variables locales de la función que atiende la petición.",
  },
  {
    id: "modulos-live-binding",
    kind: "opcion",
    concepts: ["js.modulos"],
    difficulty: "trampa",
    prompt: "Son dos archivos. ¿Qué ocurre al ejecutar main.js?",
    code: code("js", `
// contador.js
export let total = 0;
export function sumar() {
  total++;
}

// main.js
import { total, sumar } from "./contador.js";
sumar();
sumar();
console.log(total);
total = 10;
console.log(total);
`),
    options: opts(
      "Imprime 0 y luego 10: el import copió el valor 0 al importar",
      "Imprime 2 y luego 10",
      "Imprime 2 y luego lanza TypeError: un binding importado no se puede reasignar desde fuera",
      "Imprime 0 y luego lanza TypeError",
    ),
    correct: "c",
    explanation:
      "Los imports son live bindings: total en main.js es una vista de solo lectura de la variable de contador.js, así que refleja el valor actual (2). Reasignarla desde el módulo que importa lanza TypeError (Assignment to constant variable). Solo el módulo que la declara puede cambiarla, por ejemplo a través de sumar().",
  },
  {
    id: "modulos-import-dinamico",
    kind: "opcion",
    concepts: ["js.modulos"],
    difficulty: "base",
    prompt: "¿Por qué React.lazy necesita una función que llama a import() en vez de un import estático?",
    code: code("jsx", `
import { lazy, Suspense } from "react";

const Grafica = lazy(() => import("./Grafica.js"));

function Panel({ abierto }) {
  return abierto ? (
    <Suspense fallback={<p>Cargando…</p>}>
      <Grafica />
    </Suspense>
  ) : null;
}
`),
    options: opts(
      "Porque import() devuelve una promesa del módulo y el bundler lo separa en otro archivo (chunk) que solo se descarga cuando se renderiza Grafica por primera vez",
      "Porque import() vuelve a evaluar el módulo en cada render, así Grafica siempre está actualizada",
      "Porque import() es la única forma de importar un export default",
      "Porque los imports estáticos no funcionan dentro de componentes con Suspense",
    ),
    correct: "a",
    explanation:
      "import() es una expresión que devuelve una promesa que se resuelve con el objeto del módulo (lazy usa su propiedad default). Al ver un import() el bundler crea un chunk aparte (code splitting) y lo carga bajo demanda. El módulo se sigue evaluando una sola vez: la segunda llamada a import() devuelve el mismo módulo ya cargado.",
  },
  {
    id: "errores-orden-finally",
    kind: "predecir",
    concepts: ["js.errores"],
    difficulty: "base",
    prompt: "¿Qué imprime?",
    code: code("js", `
function cargar() {
  try {
    console.log("inicio");
    const config = null;
    config.theme;
    console.log("nunca");
  } catch (e) {
    console.log(e.name);
    throw new Error("No se pudo cargar", { cause: e });
  } finally {
    console.log("finally");
  }
}
try {
  cargar();
} catch (e) {
  console.log(e.message + " / " + e.cause.name);
}
`),
    options: opts(
      "inicio\nTypeError\nfinally\nNo se pudo cargar / TypeError",
      "inicio\nTypeError\nNo se pudo cargar / TypeError\nfinally",
      "inicio\nnunca\nTypeError\nfinally\nNo se pudo cargar / TypeError",
      "inicio\nReferenceError\nfinally\nNo se pudo cargar / ReferenceError",
    ),
    correct: "a",
    explanation:
      "Leer una propiedad de null lanza TypeError (ReferenceError es para variables que no existen) y el resto del try se salta. El catch lo relanza envuelto con cause, pero antes de que el error salga de la función se ejecuta finally. Por eso el catch exterior imprime después de \"finally\", y sigue teniendo acceso al error original en e.cause.",
  },
  {
    id: "errores-return-sin-await",
    kind: "predecir",
    concepts: ["js.errores"],
    difficulty: "trampa",
    prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
    code: code("js", `
async function fail() {
  throw new Error("boom");
}
async function conAwait() {
  try {
    return await fail();
  } catch {
    return "capturado";
  }
}
async function sinAwait() {
  try {
    return fail();
  } catch {
    return "capturado";
  }
}
console.log(await conAwait());
sinAwait().then(
  (v) => console.log("resuelta: " + v),
  (e) => console.log("rechazada: " + e.message),
);
`),
    options: opts(
      "capturado\nresuelta: capturado",
      "capturado\nrechazada: boom",
      "rechazada: boom\nrechazada: boom",
      "capturado\nUncaught (in promise) Error",
    ),
    correct: "b",
    explanation:
      "fail() no lanza: devuelve una promesa rechazada. Con return await, la función espera dentro del try, el rechazo se convierte en una excepción ahí mismo y el catch la captura. Con return a secas, la promesa sale del try sin haber fallado todavía; cuando se rechaza, el try/catch ya terminó y el rechazo pasa a la promesa de sinAwait. Un try/catch solo ve los errores de promesas que espera con await.",
  },
  {
    id: "errores-boundary-evento",
    kind: "opcion",
    concepts: ["js.errores"],
    difficulty: "trampa",
    prompt:
      "La app está envuelta en un error boundary que muestra \"Algo salió mal\". El usuario hace click en Guardar y guardar() lanza un error. ¿Qué pasa?",
    code: code("jsx", `
function Formulario() {
  function handleClick() {
    guardar(); // lanza Error("sin conexión")
  }
  return <button onClick={handleClick}>Guardar</button>;
}

// <ErrorBoundary fallback={<p>Algo salió mal</p>}>
//   <Formulario />
// </ErrorBoundary>
`),
    options: opts(
      "El boundary muestra \"Algo salió mal\" en lugar del formulario",
      "React desmonta toda la app y deja la pantalla en blanco",
      "El boundary no se entera: solo captura errores durante el render, en efectos y en métodos de ciclo de vida. El error queda sin capturar (sale en consola) y el formulario sigue en pantalla",
      "El error se ignora en silencio y no aparece en ninguna parte",
    ),
    correct: "c",
    explanation:
      "Un handler de eventos se ejecuta fuera del render, así que los error boundaries no lo ven (tampoco ven código asíncrono como un setTimeout o el resultado de un fetch). Ahí usas try/catch y guardas el error en el estado para mostrarlo; si quieres que lo pinte el boundary, puedes relanzarlo durante el render (por ejemplo: if (error) throw error).",
  },
];
