import type { DiagnosticSection } from "../types";
import { code, opts } from "./helpers";

export const reactFundamentos: DiagnosticSection = {
  id: "react-fundamentos",
  title: "React: fundamentos",
  description: "JSX, props, estado, eventos, listas y formularios.",
  modules: ["m10"],
  questions: [
    {
      id: "diag-react-jsx",
      kind: "opcion",
      concepts: ["react.jsx", "react.componentes-props"],
      difficulty: "base",
      prompt: "¿Qué es el valor de <Card title=\"Hola\" />?",
      options: opts(
        "El HTML resultante de renderizar Card",
        "Un objeto (elemento de React) que describe qué renderizar; React llamará a Card más tarde",
        "El resultado de llamar Card({ title: \"Hola\" }) en ese momento",
        "Un nodo del DOM",
      ),
      correct: "b",
      explanation:
        "JSX se compila a llamadas como jsx(Card, { title: \"Hola\" }) que devuelven un objeto descriptivo. Crear el elemento no ejecuta el componente: React decide cuándo llamarlo.",
    },
    {
      id: "diag-react-cero",
      kind: "opcion",
      concepts: ["react.renderizado-condicional", "js.cortocircuito"],
      difficulty: "trampa",
      prompt: "Si items es un array vacío, ¿qué se ve en pantalla?",
      code: code("jsx", `
return <div>{items.length && <List items={items} />}</div>;
`),
      options: opts("Nada", "Un 0", "false", "Una lista vacía"),
      correct: "b",
      explanation:
        "items.length && … devuelve 0 cuando la longitud es 0. React no pinta false, null ni undefined, pero sí pinta números. Usa items.length > 0 && … o un ternario.",
    },
    {
      id: "diag-react-keys-indice",
      kind: "opcion",
      concepts: ["react.listas-keys", "react.reconciliacion"],
      difficulty: "trampa",
      prompt:
        "La lista es [A, B, C]. Escribes \"hola\" en el input de la fila B y luego eliminas A. ¿Dónde aparece \"hola\"?",
      code: code("jsx", `
{items.map((item, index) => (
  <li key={index}>
    {item.name} <input />
  </li>
))}
`),
      options: opts(
        "Junto a B, como debería",
        "Junto a C",
        "Desaparece",
        "Junto a B y junto a C",
      ),
      correct: "b",
      explanation:
        "React asocia el estado (el texto del input no controlado) a la key. Tras borrar A, B pasa a tener key 0 y C key 1; la fila con key 1 conserva \"hola\" pero ahora muestra C. Usa un id estable como key.",
    },
    {
      id: "diag-react-snapshot",
      kind: "opcion",
      concepts: ["react.usestate", "react.batching"],
      difficulty: "base",
      prompt: "count vale 0. Haces un click. ¿Qué se imprime y cuánto vale count después?",
      code: code("jsx", `
function handleClick() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
  console.log(count);
}
`),
      options: opts(
        "Imprime 3 y count pasa a 3",
        "Imprime 0 y count pasa a 3",
        "Imprime 0 y count pasa a 1",
        "Imprime 1 y count pasa a 1",
      ),
      correct: "c",
      explanation:
        "count es una constante de este render (vale 0). Las tres llamadas piden \"poner 1\". setState no cambia la variable actual: programa un nuevo render. Para encadenar usa setCount((c) => c + 1).",
    },
    {
      id: "diag-react-mutar-estado",
      kind: "opcion",
      concepts: ["react.estado-inmutable", "js.valor-referencia"],
      difficulty: "base",
      prompt: "¿Qué pasa al llamar add(\"comprar pan\")?",
      code: code("jsx", `
const [todos, setTodos] = useState([]);

function add(text) {
  todos.push({ text });
  setTodos(todos);
}
`),
      options: opts(
        "Funciona bien",
        "No se ve el cambio: el array es el mismo (misma referencia), así que React considera que el estado no cambió y descarta la actualización",
        "Lanza un error porque todos es de solo lectura",
        "Se renderiza dos veces",
      ),
      correct: "b",
      explanation:
        "React compara el estado nuevo con el anterior con Object.is. Mutar y pasar el mismo array hace que parezca idéntico. Crea un array nuevo: setTodos([...todos, { text }]).",
    },
    {
      id: "diag-react-handler",
      kind: "opcion",
      concepts: ["react.eventos"],
      difficulty: "base",
      prompt: "¿Qué hace este botón?",
      code: code("jsx", `
<button onClick={handleDelete(item.id)}>Borrar</button>
`),
      options: opts(
        "Borra el elemento al hacer click",
        "Llama a handleDelete en cada render, no al hacer click",
        "No compila",
        "Borra todos los elementos",
      ),
      correct: "b",
      explanation:
        "onClick necesita una función, pero aquí se pasa el resultado de llamarla. Usa onClick={() => handleDelete(item.id)}.",
    },
    {
      id: "diag-react-estado-derivado",
      kind: "opcion",
      concepts: ["react.estructura-estado", "react.no-necesitas-efecto"],
      difficulty: "base",
      prompt: "¿Cuál es la mejor forma de mantener total?",
      code: code("jsx", `
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0);

useEffect(() => {
  setTotal(items.reduce((sum, item) => sum + item.price, 0));
}, [items]);
`),
      options: opts(
        "Así está bien",
        "Calcularlo durante el render: const total = items.reduce(...)",
        "Guardarlo en un useRef",
        "Moverlo a un Context",
      ),
      correct: "b",
      explanation:
        "total se deriva de items, así que no es estado. Con el efecto se hacen dos renders (uno con total viejo) y hay riesgo de desincronización. Calcúlalo en el render; si fuera caro, useMemo.",
    },
  ],
};

export const reactAFondo: DiagnosticSection = {
  id: "react-a-fondo",
  title: "Cómo funciona React",
  description: "Renders, efectos, closures, refs, context y memoización.",
  modules: ["m11"],
  questions: [
    {
      id: "diag-react-render-hijos",
      kind: "opcion",
      concepts: ["react.render-commit"],
      difficulty: "base",
      prompt:
        "Parent cambia su estado. En su propio JSX, Parent renderiza <Child /> (sin props) y Child no usa memo. Sin React Compiler, ¿se vuelve a renderizar Child?",
      options: opts(
        "No, porque sus props no cambiaron",
        "Sí: por defecto, cuando un componente se renderiza también se renderizan sus hijos",
        "Solo si Child tiene estado",
        "Solo si Child usa Context",
      ),
      correct: "b",
      explanation:
        "Renderizar es llamar a la función del componente. Cuando Parent se renderiza, React también llama a sus hijos, cambien o no sus props. Renderizar no implica tocar el DOM: el commit solo aplica las diferencias.",
    },
    {
      id: "diag-react-deps-objeto",
      kind: "opcion",
      concepts: ["react.useeffect", "js.valor-referencia"],
      difficulty: "trampa",
      prompt: "¿Qué pasa con este efecto?",
      code: code("jsx", `
function Results({ query }) {
  const [results, setResults] = useState([]);
  const options = { query, limit: 10 };

  useEffect(() => {
    fetchResults(options).then(setResults);
  }, [options]);
  // ...
}
`),
      options: opts(
        "Se ejecuta solo cuando cambia query",
        "Se ejecuta en cada render porque options es un objeto nuevo cada vez; como setResults provoca otro render, entra en bucle",
        "Se ejecuta una sola vez",
        "React avisa del error y no lo ejecuta",
      ),
      correct: "b",
      explanation:
        "React compara cada dependencia con Object.is. Un objeto creado en el render es distinto en cada render. Crea options dentro del efecto y usa [query] como dependencia.",
    },
    {
      id: "diag-react-stale-interval",
      kind: "opcion",
      concepts: ["react.stale-closures", "js.closures"],
      difficulty: "trampa",
      prompt: "¿Qué muestra este componente después de 5 segundos?",
      code: code("jsx", `
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return <p>{count}</p>;
}
`),
      options: opts("5", "1", "0", "Crece sin parar de forma errática"),
      correct: "b",
      explanation:
        "El efecto se ejecuta una vez y el callback del intervalo cierra sobre el count del primer render (0). Cada segundo pide \"poner 1\". Solución: setCount((c) => c + 1), que no depende de la variable capturada.",
    },
    {
      id: "diag-react-strictmode",
      kind: "opcion",
      concepts: ["react.strictmode", "react.useeffect"],
      difficulty: "base",
      prompt:
        "En desarrollo con StrictMode, un efecto hace console.log(\"conectar\") y su limpieza console.log(\"desconectar\"). ¿Qué se imprime al montar el componente?",
      options: opts(
        "conectar",
        "conectar, desconectar, conectar",
        "conectar, conectar",
        "desconectar, conectar",
      ),
      correct: "b",
      explanation:
        "StrictMode monta, desmonta y vuelve a montar en desarrollo para comprobar que tu limpieza deshace bien el efecto. Si eso rompe algo, el efecto tiene un bug. En producción solo se ejecuta una vez.",
    },
    {
      id: "diag-react-useref",
      kind: "opcion",
      concepts: ["react.useref"],
      difficulty: "base",
      prompt: "Haces click 3 veces. ¿Qué muestra el botón?",
      code: code("jsx", `
function Clicks() {
  const ref = useRef(0);
  return (
    <button onClick={() => { ref.current += 1; }}>
      {ref.current}
    </button>
  );
}
`),
      options: opts(
        "3",
        "0: ref.current sí cambia, pero modificar una ref no provoca un render",
        "1",
        "Lanza un error por mutar una ref",
      ),
      correct: "b",
      explanation:
        "Las refs guardan valores mutables entre renders sin provocar renders. Si un valor debe verse en pantalla, va en el estado. Leer ref.current durante el render se desaconseja precisamente por esto.",
    },
    {
      id: "diag-react-reconciliacion-mismo-tipo",
      kind: "opcion",
      concepts: ["react.reconciliacion"],
      difficulty: "trampa",
      prompt: "Escribes \"Ana\" en el input y luego isEditing cambia. ¿Qué pasa con el texto?",
      code: code("jsx", `
{isEditing ? (
  <input placeholder="Nombre" />
) : (
  <input placeholder="Email" />
)}
`),
      options: opts(
        "Se borra, porque es otro input",
        "Se conserva: es el mismo tipo de elemento en la misma posición, así que React lo reutiliza",
        "Se duplica en ambos inputs",
        "Depende del navegador",
      ),
      correct: "b",
      explanation:
        "React identifica elementos por tipo y posición en el árbol (y por key). Mismo tipo en la misma posición equivale al mismo elemento, aunque cambien sus props. Para forzar un reset, dale una key distinta a cada uno.",
    },
    {
      id: "diag-react-context-value",
      kind: "opcion",
      concepts: ["react.context", "react.render-commit"],
      difficulty: "trampa",
      prompt:
        "AppProvider se vuelve a renderizar por un motivo que no tiene nada que ver con user. Sin React Compiler, ¿qué pasa con los componentes que usan este contexto?",
      code: code("jsx", `
function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  // ...otro estado que cambia a menudo...
  return (
    <UserContext value={{ user, setUser }}>
      {children}
    </UserContext>
  );
}
`),
      options: opts(
        "Nada, porque user no cambió",
        "Se vuelven a renderizar todos, porque value es un objeto nuevo en cada render",
        "Solo se renderiza el primero",
        "Se desmontan",
      ),
      correct: "b",
      explanation:
        "Los consumidores se renderizan cuando value cambia según Object.is, y { user, setUser } es un objeto nuevo en cada render. Memoízalo con useMemo (o deja que lo haga React Compiler) y separa en contextos el estado que cambia a ritmos distintos.",
    },
    {
      id: "diag-react-usecallback-inutil",
      kind: "opcion",
      concepts: ["react.memo"],
      difficulty: "trampa",
      prompt: "Child no está envuelto en memo. ¿Evita useCallback que Child se vuelva a renderizar?",
      code: code("jsx", `
const handleSave = useCallback(() => save(data), [data]);
return <Child onSave={handleSave} />;
`),
      options: opts(
        "Sí, porque la función es la misma",
        "No: sin memo, Child se renderiza siempre que el padre lo haga; useCallback solo ayuda si el hijo compara props (memo) o la función es dependencia de un efecto",
        "Sí, pero solo en producción",
        "No, y además hace que Child se renderice dos veces",
      ),
      correct: "b",
      explanation:
        "useCallback mantiene la misma referencia, pero eso solo importa si alguien la compara: memo(Child) o un array de dependencias. Por sí solo no evita renders.",
    },
    {
      id: "diag-react-fetch-carrera",
      kind: "opcion",
      concepts: ["react.fetch-en-efectos", "async.race-conditions"],
      difficulty: "base",
      prompt:
        "userId cambia de 1 a 2 rápidamente y la respuesta del usuario 1 llega la última. ¿Cómo lo arreglas dentro del efecto?",
      code: code("jsx", `
useEffect(() => {
  fetchUser(userId).then(setUser);
}, [userId]);
`),
      options: opts(
        "Añadiendo user a las dependencias",
        "Con una limpieza que cancele la petición (AbortController) o marque la respuesta como obsoleta para ignorarla",
        "Usando useLayoutEffect",
        "Llamando a fetchUser fuera del efecto",
      ),
      correct: "b",
      explanation:
        "La limpieza se ejecuta antes del siguiente efecto, así que puede cancelar o invalidar la petición anterior. Por estos detalles se usan librerías como TanStack Query o los datos del framework.",
    },
    {
      id: "diag-react-custom-hook-estado",
      kind: "opcion",
      concepts: ["react.custom-hooks"],
      difficulty: "base",
      prompt: "Header y Sidebar llaman a useCounter() (un custom hook con useState dentro). ¿Comparten el contador?",
      options: opts(
        "Sí, los custom hooks comparten estado",
        "No: cada llamada al hook tiene su propio estado; los hooks comparten lógica, no estado",
        "Sí, si están en el mismo archivo",
        "Solo si están dentro del mismo Provider",
      ),
      correct: "b",
      explanation:
        "Un custom hook es una función que llama a otros hooks. Cada componente que lo usa obtiene su propio estado. Para compartir estado necesitas levantarlo, usar Context o un store externo.",
    },
  ],
};

export const reactModerno: DiagnosticSection = {
  id: "react-moderno",
  title: "React moderno",
  description: "Suspense, transiciones, Actions, Server Components y el Compiler.",
  modules: ["m12"],
  questions: [
    {
      id: "diag-react-suspense",
      kind: "opcion",
      concepts: ["react.suspense", "react.use"],
      difficulty: "base",
      prompt: "¿Cuál de estos casos activa el fallback de un <Suspense> padre?",
      options: opts(
        "Un useEffect que hace fetch y guarda el resultado en el estado",
        "Un hijo que lee una promesa pendiente con use() o un componente cargado con lazy()",
        "Cualquier componente que tenga un estado loading en true",
        "Un error lanzado durante el render",
      ),
      correct: "b",
      explanation:
        "Suspense reacciona cuando un componente suspende durante el render (use() de una promesa pendiente, lazy, frameworks con datos compatibles). Un fetch en un efecto ocurre después del render y React no lo ve. Los errores los capturan los error boundaries.",
    },
    {
      id: "diag-react-transition",
      kind: "opcion",
      concepts: ["react.transiciones"],
      difficulty: "base",
      prompt: "¿Para qué sirve startTransition(() => setFilter(value))?",
      options: opts(
        "Para animar el cambio con CSS",
        "Para marcar la actualización como no urgente: React puede interrumpirla y mantener la UI responsiva (por ejemplo, el input)",
        "Para que el estado se actualice de forma síncrona",
        "Para hacer debounce de la actualización",
      ),
      correct: "b",
      explanation:
        "Las transiciones separan actualizaciones urgentes (escribir) de las que pueden esperar (renderizar una lista enorme filtrada). No retrasan con un timer: el render se puede interrumpir si llega algo más urgente.",
    },
    {
      id: "diag-react-optimistic",
      kind: "opcion",
      concepts: ["react.useoptimistic", "react.actions"],
      difficulty: "base",
      prompt: "Con useOptimistic añades un comentario antes de que responda el servidor. Si la Action falla, ¿qué pasa con el comentario optimista?",
      options: opts(
        "Se queda en pantalla hasta que recargues",
        "Desaparece: al terminar la Action, el valor optimista se descarta y se vuelve al estado real",
        "React reintenta la Action automáticamente",
        "Se convierte en un error visible",
      ),
      correct: "b",
      explanation:
        "El estado optimista solo vive mientras la Action está en curso. Al terminar, se muestra el estado real: si guardaste el comentario aparece desde ahí; si falló, desaparece (y debes mostrar el error tú).",
    },
    {
      id: "diag-react-rsc-hooks",
      kind: "opcion",
      concepts: ["react.server-components"],
      difficulty: "trampa",
      prompt: "¿Qué NO puedes hacer dentro de un Server Component?",
      options: opts(
        "Ser una función async y hacer await de una consulta a la base de datos",
        "Leer archivos o variables de entorno secretas",
        "Usar useState o handlers como onClick",
        "Renderizar un Client Component",
      ),
      correct: "c",
      explanation:
        "Los Server Components se ejecutan en el servidor (al construir o en cada petición) y no existen en el navegador: no tienen estado ni eventos. La interactividad va en Client Components, que sí pueden renderizarse desde un Server Component.",
    },
    {
      id: "diag-react-compiler",
      kind: "opcion",
      concepts: ["react.compiler"],
      difficulty: "base",
      prompt: "¿Qué hace React Compiler?",
      options: opts(
        "Convierte JSX en JavaScript",
        "Memoiza automáticamente componentes y valores en tiempo de compilación, siempre que el código respete las reglas de React",
        "Convierte Client Components en Server Components",
        "Elimina la necesidad de useEffect",
      ),
      correct: "b",
      explanation:
        "El Compiler analiza tus componentes y añade memoización (equivalente a memo, useMemo y useCallback). Depende de que el render sea puro y de que se respeten las reglas de los hooks; si no, se salta ese componente.",
    },
  ],
};

export const reactTs: DiagnosticSection = {
  id: "react-ts",
  title: "React + TypeScript y patrones",
  description: "Tipar componentes y patrones de componentes.",
  modules: ["m13"],
  questions: [
    {
      id: "diag-reactts-evento",
      kind: "opcion",
      concepts: ["reactts.eventos-refs"],
      difficulty: "base",
      prompt: "¿Qué tipo tiene el parámetro e en onChange de un <input>?",
      options: opts(
        "Event",
        "React.ChangeEvent<HTMLInputElement>",
        "React.MouseEvent<HTMLInputElement>",
        "InputEvent",
      ),
      correct: "b",
      explanation:
        "React usa eventos sintéticos con sus propios tipos. ChangeEvent<HTMLInputElement> hace que e.target.value esté tipado.",
    },
    {
      id: "diag-reactts-props-discriminadas",
      kind: "opcion",
      concepts: ["reactts.props-discriminadas", "ts.uniones-discriminadas"],
      difficulty: "trampa",
      prompt: "Un componente Action debe ser un enlace (con href) o un botón (con onClick), nunca ambos. ¿Qué tipo de props lo garantiza?",
      options: opts(
        "{ href?: string; onClick?: () => void }",
        "{ as: \"link\"; href: string } | { as: \"button\"; onClick: () => void }",
        "{ href: string; onClick: () => void }",
        "Record<string, unknown>",
      ),
      correct: "b",
      explanation:
        "Con propiedades opcionales se aceptan ambas o ninguna. Una unión discriminada hace imposible la combinación inválida y estrecha el tipo dentro del componente al comprobar as.",
    },
    {
      id: "diag-patron-controlado",
      kind: "opcion",
      concepts: ["patrones.controlado-no-controlado"],
      difficulty: "base",
      prompt: "Tu componente <Toggle> acepta value y onChange. ¿Qué significa que esté \"controlado\"?",
      options: opts(
        "Que maneja su propio estado internamente",
        "Que el padre guarda el estado y lo pasa con value; el componente solo avisa con onChange",
        "Que tiene validación",
        "Que usa useRef",
      ),
      correct: "b",
      explanation:
        "Controlado: la fuente de verdad es el padre. No controlado: el componente guarda su estado (opcionalmente inicializado con defaultValue). Los buenos componentes de librería soportan ambos modos.",
    },
    {
      id: "diag-patron-compound",
      kind: "opcion",
      concepts: ["patrones.compound", "react.context"],
      difficulty: "base",
      prompt: "En <Tabs><Tabs.List>…</Tabs.List><Tabs.Panel>…</Tabs.Panel></Tabs>, ¿cómo saben los hijos qué pestaña está activa?",
      options: opts(
        "Leyendo una variable global",
        "Tabs guarda el estado y lo comparte con sus partes mediante Context",
        "Cada parte guarda su propio estado y se sincronizan con efectos",
        "Con document.querySelector",
      ),
      correct: "b",
      explanation:
        "Es el patrón de compound components: el componente raíz tiene el estado y lo expone a sus subcomponentes por Context, así el usuario de la API compone las piezas libremente. Así funcionan Radix y shadcn/ui.",
    },
  ],
};
