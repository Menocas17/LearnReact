import type { Question } from "@/content/types";
import { code, opts } from "@/content/diagnostic/helpers";

export const preguntas: readonly Question[] = [
  {
    id: "async-siempre-promesa",
    kind: "predecir",
    concepts: ["async.async-await"],
    difficulty: "base",
    prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
    code: code("js", `
async function getUser() {
  return { name: "Ana" };
}
async function checkAge(age) {
  if (age < 18) throw new Error("menor de edad");
  return "ok";
}
const user = getUser();
console.log(user.name);
const result = checkAge(15);
console.log(result instanceof Promise);
result.catch((e) => console.log("rechazada: " + e.message));
console.log((await user).name);
`),
    options: opts(
      "Ana\nUncaught Error",
      "undefined\ntrue\nrechazada: menor de edad\nAna",
      "Ana\nfalse\nrechazada: menor de edad\nAna",
      "undefined\nUncaught Error",
    ),
    correct: "b",
    explanation:
      "Una función async siempre devuelve una promesa: si haces return de un valor, la promesa se cumple con él; si lanzas, la promesa se rechaza. Por eso user es una promesa (user.name es undefined) y checkAge(15) no lanza nada en la línea donde se llama: devuelve una promesa rechazada, que el .catch maneja. Para obtener el objeto hay que esperar la promesa con await.",
  },
  {
    id: "async-sincrono-hasta-await",
    kind: "predecir",
    concepts: ["async.async-await", "async.event-loop"],
    difficulty: "trampa",
    prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
    code: code("js", `
async function save(label) {
  console.log("validando " + label);
  await Promise.resolve();
  console.log("guardado " + label);
}
console.log("antes");
const pending = save("A");
save("B");
console.log("después");
await pending;
console.log("fin");
`),
    options: opts(
      "antes\nvalidando A\nguardado A\nvalidando B\nguardado B\ndespués\nfin",
      "antes\ndespués\nvalidando A\nvalidando B\nguardado A\nguardado B\nfin",
      "antes\nvalidando A\nvalidando B\ndespués\nguardado A\nguardado B\nfin",
      "antes\nvalidando A\nvalidando B\ndespués\nguardado A\nfin\nguardado B",
    ),
    correct: "c",
    explanation:
      "Llamar a una función async ejecuta su cuerpo de inmediato, de forma síncrona, hasta el primer await: por eso \"validando A\" sale justo después de \"antes\". El await pausa solo esa función y devuelve el control a quien la llamó, que sigue con save(\"B\") y \"después\". Cuando la pila queda vacía, las continuaciones se ejecutan como microtareas en el orden en que se encolaron (A, luego B). La continuación del await pending se encola cuando A termina, es decir, detrás de la de B que ya estaba en la cola.",
  },
  {
    id: "async-foreach-no-espera",
    kind: "predecir",
    concepts: ["async.async-await", "js.errores"],
    difficulty: "trampa",
    prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
    code: code("js", `
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function saveItem(id) {
  await wait(10);
  if (id === 3) throw new Error("conflicto");
  console.log("guardado " + id);
}

async function saveAll(ids) {
  try {
    ids.forEach(async (id) => {
      await saveItem(id);
    });
    console.log("todos guardados");
  } catch {
    console.log("capturado");
  }
}

await saveAll([1, 2, 3]);
console.log("siguiente paso");
`),
    options: opts(
      "guardado 1\nguardado 2\ncapturado\nsiguiente paso",
      "guardado 1\nguardado 2\ntodos guardados\nUncaught (in promise) Error",
      "todos guardados\nsiguiente paso\nguardado 1\nguardado 2\ncapturado",
      "todos guardados\nsiguiente paso\nguardado 1\nguardado 2\nUncaught (in promise) Error",
    ),
    correct: "d",
    explanation:
      "forEach llama al callback async, recibe una promesa y la descarta: no la espera ni mira si se rechaza. El bucle termina al instante, se imprime \"todos guardados\" y saveAll se resuelve antes de que se haya guardado nada, así que el await del nivel superior no espera ningún guardado. Cuando el tercero falla, su promesa no está en manos de nadie (es una promesa flotante): el try/catch hace rato que terminó y el rechazo acaba como Uncaught (in promise). Con for...of y await, o con await Promise.all(ids.map(saveItem)), saveAll sí esperaría y el catch vería el error.",
  },
  {
    id: "async-secuencial-vs-paralelo",
    kind: "predecir",
    concepts: ["async.async-await"],
    difficulty: "trampa",
    prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
    code: code("js", `
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function load(name, ms) {
  console.log("empieza " + name);
  await wait(ms);
  console.log("termina " + name);
  return name;
}

await load("perfil", 200);
await load("posts", 100);
console.log("---");
const [a, b] = await Promise.all([load("perfil", 200), load("posts", 100)]);
console.log(a + "," + b);
`),
    options: opts(
      "empieza perfil\ntermina perfil\nempieza posts\ntermina posts\n---\nempieza perfil\nempieza posts\ntermina posts\ntermina perfil\nperfil,posts",
      "empieza perfil\ntermina perfil\nempieza posts\ntermina posts\n---\nempieza perfil\nempieza posts\ntermina posts\ntermina perfil\nposts,perfil",
      "empieza perfil\nempieza posts\ntermina posts\ntermina perfil\n---\nempieza perfil\nempieza posts\ntermina posts\ntermina perfil\nperfil,posts",
      "empieza perfil\ntermina perfil\nempieza posts\ntermina posts\n---\nempieza perfil\ntermina perfil\nempieza posts\ntermina posts\nperfil,posts",
    ),
    correct: "a",
    explanation:
      "Con un await detrás de otro, la segunda carga ni siquiera empieza hasta que termina la primera: tardan 200 + 100 ms. En la segunda parte, las dos llamadas se hacen antes de esperar nada, así que las dos cargas empiezan ya y corren a la vez (unos 200 ms en total); posts termina antes porque tarda menos. Promise.all no las inicia: solo espera promesas que ya están en marcha. Aun así devuelve los resultados en el orden del array, no en el orden en que terminaron.",
  },
  {
    id: "async-finally-con-await",
    kind: "predecir",
    concepts: ["async.async-await", "js.errores"],
    difficulty: "trampa",
    prompt: "Se ejecuta como módulo, así que se permite await en el nivel superior. ¿Qué imprime?",
    code: code("js", `
async function submit(form) {
  try {
    console.log("enviando");
    if (!form.email) throw new Error("falta el email");
    await null;
    return "ok";
  } catch (e) {
    console.log("error: " + e.message);
    return "falló";
  } finally {
    console.log("loading = false");
  }
}
const first = submit({ email: "ana@mail.com" });
const second = submit({});
console.log("sigue el render");
console.log((await first) + " / " + (await second));
`),
    options: opts(
      "enviando\nenviando\nerror: falta el email\nsigue el render\nloading = false\nloading = false\nok / falló",
      "enviando\nloading = false\nenviando\nerror: falta el email\nloading = false\nsigue el render\nok / falló",
      "enviando\nenviando\nerror: falta el email\nloading = false\nsigue el render\nloading = false\nok / falló",
      "enviando\nenviando\nerror: falta el email\nloading = false\nsigue el render\nok / falló",
    ),
    correct: "c",
    explanation:
      "La primera llamada imprime \"enviando\" y se pausa en el await, antes del return; su finally todavía no puede ejecutarse. La segunda lanza antes de llegar a ningún await, así que todo su try/catch/finally ocurre de forma síncrona: \"error\", y luego \"loading = false\" aunque el catch haya hecho return (finally se ejecuta siempre, y el valor de retorno espera a que termine). Después sigue el código síncrono. Cuando la primera se reanuda, hace return \"ok\" y entonces se ejecuta su finally. Las dos promesas se cumplen: el error de la segunda quedó capturado dentro de la función.",
  },
  {
    id: "async-useeffect-async",
    kind: "opcion",
    concepts: ["async.async-await"],
    difficulty: "base",
    prompt: "¿Cuál es el problema real de este efecto?",
    code: code("jsx", `
useEffect(async () => {
  const res = await fetch("/api/products?q=" + query);
  setProducts(await res.json());
}, [query]);
`),
    options: opts(
      "Ninguno: React espera a que la promesa se resuelva antes de volver a ejecutar el efecto",
      "Que el callback async devuelve una promesa, y React espera que un efecto no devuelva nada o devuelva una función de limpieza: no hay limpieza posible y React lo advierte en desarrollo",
      "Que el await bloquea el render del componente hasta que llega la respuesta",
      "Que el fetch se ejecuta dos veces por cada cambio de query, una por cada await",
    ),
    correct: "b",
    explanation:
      "Lo que devuelve el callback de useEffect se interpreta como la función de limpieza. Una función async siempre devuelve una promesa, así que React recibe algo que no es una función y lo advierte en desarrollo; y cuando intente limpiar el efecto (al cambiar query, al desmontar o en el doble montaje de Strict Mode) llamará a esa promesa como si fuera una función y lanzará un TypeError. Además pierdes la limpieza, que es justo lo que necesitas para ignorar respuestas de un query anterior. React no espera la promesa ni bloquea el render: el efecto se ejecuta después del commit, y cada cambio de query lanza un solo fetch. El patrón correcto es declarar una función async dentro del efecto, llamarla y devolver una limpieza normal.",
  },
];
