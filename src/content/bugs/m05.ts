import type { BugDef } from "../types";

const L = {
  eventLoop: "asincronia/event-loop",
  promesas: "asincronia/promesas",
  asyncAwait: "asincronia/async-await",
  fetch: "asincronia/fetch-y-cancelacion",
  carreras: "asincronia/race-conditions-y-debounce",
};

/** Bugs del módulo 5, de principiante a avanzado. */
export const bugsM05: readonly BugDef[] = [
  {
    id: "bug-preferencias-null",
    title: "#E01 · El tema oscuro no se aplica al entrar",
    level: "principiante",
    moduleId: "m05",
    lessonId: L.eventLoop,
    report: {
      reportedBy: "QA · Lucía",
      where: "Ajustes › tema",
      steps: ["Elige el tema oscuro en Ajustes.", "Recarga la página."],
      actual: "La app arranca siempre en tema claro: cargarPreferencias devuelve null.",
      expected: "cargarPreferencias devuelve una promesa que se cumple con las preferencias guardadas.",
    },
    concepts: ["async.event-loop", "async.callbacks"],
    instructions:
      "QA: el tema oscuro se guarda bien, pero al recargar la app arranca en claro. En el useEffect del layout hacemos cargarPreferencias(storage) y siempre llega null. El almacenamiento es lento, por eso lo leemos en un setTimeout.",
    starter: {
      "/preferencias.js": `// storage.leer() es síncrono pero lo diferimos para no bloquear el primer render
export function cargarPreferencias(storage) {
  let prefs = null;
  setTimeout(() => {
    prefs = storage.leer();
  }, 0);
  return prefs;
}
`,
    },
    tests: {
      "/preferencias.test.js": `import { cargarPreferencias } from "./preferencias";

const storage = { leer: () => ({ tema: "oscuro" }) };

test("devuelve una promesa", () => {
  expect(cargarPreferencias(storage)).toBeInstanceOf(Promise);
});

test("la promesa se cumple con las preferencias", async () => {
  await expect(cargarPreferencias(storage)).resolves.toEqual({ tema: "oscuro" });
});
`,
    },
    solution: {
      "/preferencias.js": `export function cargarPreferencias(storage) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(storage.leer());
    }, 0);
  });
}
`,
    },
    hints: [
      "¿Cuándo se ejecuta el callback del setTimeout: antes o después del return?",
      "Un valor que llega más tarde no se puede devolver directamente: envuélvelo en una promesa y llama a resolve dentro del callback.",
    ],
  },
  {
    id: "bug-perfil-then-sin-return",
    title: "#E02 · Guardar perfil falla con «Cannot read properties of undefined»",
    level: "principiante",
    moduleId: "m05",
    lessonId: L.promesas,
    report: {
      reportedBy: "Soporte · Andrea",
      where: "Perfil › botón Guardar",
      steps: ["Edita tu nombre en el perfil.", "Pulsa Guardar."],
      actual: "Sale el toast de error «Cannot read properties of undefined (reading 'id')», aunque a veces el cambio sí se guarda.",
      expected: "guardarPerfil se cumple con el id del perfil guardado.",
    },
    concepts: ["async.promesas"],
    instructions:
      "Soporte: al guardar el perfil aparece un error de «undefined», pero si recargas a veces el cambio está guardado. La cadena primero valida y luego guarda; api.guardar devuelve una promesa con { id }.",
    starter: {
      "/perfil.js": `export function guardarPerfil(api, datos) {
  return api
    .validar(datos)
    .then((validos) => {
      api.guardar(validos);
    })
    .then((respuesta) => respuesta.id);
}
`,
    },
    tests: {
      "/perfil.test.js": `import { guardarPerfil } from "./perfil";

function crearApi() {
  const guardados = [];
  return {
    guardados,
    validar: (d) => Promise.resolve({ ...d, nombre: d.nombre.trim() }),
    guardar: (d) =>
      new Promise((resolve) => {
        setTimeout(() => {
          guardados.push(d);
          resolve({ id: 42 });
        }, 5);
      }),
  };
}

test("se cumple con el id guardado", async () => {
  await expect(guardarPerfil(crearApi(), { nombre: " Ana " })).resolves.toBe(42);
});

test("espera a que se guarde antes de terminar", async () => {
  const api = crearApi();
  try {
    await guardarPerfil(api, { nombre: "Ana" });
  } catch {}
  expect(api.guardados).toEqual([{ nombre: "Ana" }]);
});
`,
    },
    solution: {
      "/perfil.js": `export function guardarPerfil(api, datos) {
  return api
    .validar(datos)
    .then((validos) => api.guardar(validos))
    .then((respuesta) => respuesta.id);
}
`,
    },
    hints: [
      "¿Qué recibe el siguiente .then si el anterior no devuelve nada?",
      "Para encadenar una promesa dentro de un .then tienes que devolverla (return).",
    ],
  },
  {
    id: "bug-pedido-try-sin-await",
    title: "#E03 · La página de pedido explota en vez de mostrar el error",
    level: "principiante",
    moduleId: "m05",
    lessonId: L.asyncAwait,
    report: {
      reportedBy: "QA · Marco",
      where: "Mis pedidos › detalle",
      steps: ["Abre /pedidos/999 (un pedido que no existe).", "Mira la página."],
      actual: "Salta el error boundary de Next con «Pedido no encontrado» en lugar del mensaje amable.",
      expected: "cargarPedido se cumple con { error: \"No se pudo cargar el pedido\" } cuando la carga falla.",
    },
    concepts: ["async.async-await"],
    instructions:
      "QA: cargarPedido tiene un try/catch para devolver un mensaje amable si falla, pero con un pedido inexistente salta igualmente el error boundary. Es como si el catch no existiera.",
    starter: {
      "/pedido.js": `export async function cargarPedido(fetchPedido, id) {
  try {
    return fetchPedido(id);
  } catch {
    return { error: "No se pudo cargar el pedido" };
  }
}
`,
    },
    tests: {
      "/pedido.test.js": `import { cargarPedido } from "./pedido";

test("devuelve el pedido si existe", async () => {
  const fetchPedido = (id) => Promise.resolve({ id, total: 30 });
  await expect(cargarPedido(fetchPedido, 1)).resolves.toEqual({ id: 1, total: 30 });
});

test("si la carga falla, devuelve el mensaje amable", async () => {
  const fetchPedido = () => Promise.reject(new Error("Pedido no encontrado"));
  await expect(cargarPedido(fetchPedido, 999)).resolves.toEqual({ error: "No se pudo cargar el pedido" });
});
`,
    },
    solution: {
      "/pedido.js": `export async function cargarPedido(fetchPedido, id) {
  try {
    return await fetchPedido(id);
  } catch {
    return { error: "No se pudo cargar el pedido" };
  }
}
`,
    },
    hints: [
      "El try solo atrapa errores que ocurren mientras se ejecuta su bloque. ¿Cuándo se rechaza la promesa?",
      "return promesa sale del try sin esperar; return await promesa espera dentro del try.",
    ],
  },
  {
    id: "bug-usuario-404-undefined",
    title: "#E04 · «Hola, undefined» cuando el usuario no existe",
    level: "principiante",
    moduleId: "m05",
    lessonId: L.fetch,
    report: {
      reportedBy: "Diseño · Sara",
      where: "Perfil público › cabecera",
      steps: ["Abre /u/usuario-borrado.", "Mira la cabecera."],
      actual: "Se pinta «Hola, undefined» en vez de la página de no encontrado.",
      expected: "obtenerUsuario rechaza con un Error cuyo mensaje incluye el código HTTP (p. ej. «HTTP 404») si la respuesta no es correcta.",
    },
    concepts: ["async.fetch"],
    instructions:
      "Diseño: con un usuario borrado la API devuelve 404 con { message: \"Not found\" }, pero la cabecera pinta «Hola, undefined». El componente confía en que obtenerUsuario rechaza si algo va mal, y nunca rechaza.",
    starter: {
      "/usuario.js": `export async function obtenerUsuario(id, fetchImpl = fetch) {
  const res = await fetchImpl("/api/usuarios/" + id);
  return res.json();
}
`,
    },
    tests: {
      "/usuario.test.js": `import { obtenerUsuario } from "./usuario";

const responder = (body, status) => async () =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

test("devuelve el usuario si la respuesta es correcta", async () => {
  await expect(obtenerUsuario(1, responder({ nombre: "Ana" }, 200))).resolves.toEqual({ nombre: "Ana" });
});

test("rechaza con el código si es 404", async () => {
  await expect(obtenerUsuario(9, responder({ message: "Not found" }, 404))).rejects.toThrow("404");
});

test("rechaza también con un 500", async () => {
  await expect(obtenerUsuario(9, responder({ message: "Boom" }, 500))).rejects.toThrow("500");
});
`,
    },
    solution: {
      "/usuario.js": `export async function obtenerUsuario(id, fetchImpl = fetch) {
  const res = await fetchImpl("/api/usuarios/" + id);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return res.json();
}
`,
    },
    hints: [
      "fetch solo rechaza si falla la red. Un 404 o un 500 es una respuesta «correcta» para fetch.",
      "Comprueba res.ok (o res.status) antes de leer el cuerpo.",
    ],
  },
  {
    id: "bug-orden-foreach-async",
    title: "#E05 · El orden de la lista no se guarda entero",
    level: "intermedio",
    moduleId: "m05",
    lessonId: L.asyncAwait,
    report: {
      reportedBy: "Producto · Javier",
      where: "Tablero › reordenar tareas",
      steps: ["Arrastra tres tareas para cambiar su orden.", "Pulsa Guardar orden y recarga en cuanto salga «Guardado»."],
      actual: "Sale «Guardado» al instante y al recargar solo algunas tareas tienen la posición nueva.",
      expected: "guardarOrden termina cuando todas las tareas están guardadas, una detrás de otra y en orden (la API exige ese orden).",
    },
    concepts: ["async.async-await"],
    instructions:
      "Producto: al reordenar tareas el toast «Guardado» sale inmediatamente y, si recargas rápido, falta parte del orden. La API necesita recibir las tareas una a una, en orden.",
    starter: {
      "/orden.js": `export async function guardarOrden(tareas, guardar) {
  tareas.forEach(async (tarea, i) => {
    await guardar({ ...tarea, posicion: i });
  });
  return "Guardado";
}
`,
    },
    tests: {
      "/orden.test.js": `import { guardarOrden } from "./orden";

function crearGuardar(retrasos) {
  const guardadas = [];
  const guardar = (t) =>
    new Promise((resolve) => {
      setTimeout(() => {
        guardadas.push(t.id + ":" + t.posicion);
        resolve();
      }, retrasos[t.id]);
    });
  return { guardar, guardadas };
}

test("termina cuando todo está guardado", async () => {
  const { guardar, guardadas } = crearGuardar({ a: 5, b: 5, c: 5 });
  await expect(guardarOrden([{ id: "a" }, { id: "b" }, { id: "c" }], guardar)).resolves.toBe("Guardado");
  expect(guardadas).toHaveLength(3);
});

test("guarda una detrás de otra, en orden", async () => {
  const { guardar, guardadas } = crearGuardar({ a: 30, b: 5, c: 15 });
  await guardarOrden([{ id: "a" }, { id: "b" }, { id: "c" }], guardar);
  expect(guardadas).toEqual(["a:0", "b:1", "c:2"]);
});
`,
    },
    solution: {
      "/orden.js": `export async function guardarOrden(tareas, guardar) {
  for (const [i, tarea] of tareas.entries()) {
    await guardar({ ...tarea, posicion: i });
  }
  return "Guardado";
}
`,
    },
    hints: [
      "forEach no espera a las promesas que devuelve su callback: las lanza todas y sigue.",
      "Un for...of dentro de la función async sí espera cada await antes de pasar a la siguiente vuelta.",
    ],
  },
  {
    id: "bug-dashboard-secuencial",
    title: "#E06 · El dashboard tarda el triple de lo que debería",
    level: "intermedio",
    moduleId: "m05",
    lessonId: L.asyncAwait,
    report: {
      reportedBy: "Rendimiento · Nora",
      where: "Dashboard › carga inicial",
      steps: ["Abre el dashboard con la pestaña Network abierta.", "Mira la cascada de peticiones."],
      actual: "Las peticiones de ventas, usuarios y stock salen una detrás de otra: ~1,5 s en total.",
      expected: "Las tres peticiones salen a la vez (son independientes) y el resultado sigue siendo { ventas, usuarios, stock }.",
    },
    concepts: ["async.async-await", "async.combinadores"],
    instructions:
      "Rendimiento: el Server Component del dashboard hace tres peticiones independientes, pero en Network se ven en cascada. Cada una tarda ~500 ms y la página tarda 1,5 s en pintarse.",
    starter: {
      "/dashboard.js": `export async function cargarDashboard(api) {
  const ventas = await api.ventas();
  const usuarios = await api.usuarios();
  const stock = await api.stock();
  return { ventas, usuarios, stock };
}
`,
    },
    tests: {
      "/dashboard.test.js": `import { cargarDashboard } from "./dashboard";

function crearApi() {
  const llamadas = [];
  const pendientes = {};
  const api = {};
  for (const nombre of ["ventas", "usuarios", "stock"]) {
    api[nombre] = () => {
      llamadas.push(nombre);
      return new Promise((resolve) => (pendientes[nombre] = resolve));
    };
  }
  return { api, llamadas, pendientes };
}

test("lanza las tres peticiones sin esperar a ninguna", async () => {
  const { api, llamadas, pendientes } = crearApi();
  const p = cargarDashboard(api);
  await Promise.resolve();
  expect(llamadas).toEqual(["ventas", "usuarios", "stock"]);
  pendientes.ventas(1);
  pendientes.usuarios(2);
  pendientes.stock(3);
  await p;
});

test("devuelve los tres datos", async () => {
  const api = { ventas: async () => 10, usuarios: async () => 20, stock: async () => 30 };
  await expect(cargarDashboard(api)).resolves.toEqual({ ventas: 10, usuarios: 20, stock: 30 });
});
`,
    },
    solution: {
      "/dashboard.js": `export async function cargarDashboard(api) {
  const [ventas, usuarios, stock] = await Promise.all([api.ventas(), api.usuarios(), api.stock()]);
  return { ventas, usuarios, stock };
}
`,
    },
    hints: [
      "Cada await detiene la función hasta que esa promesa termina. ¿Depende la segunda petición de la primera?",
      "Lanza las tres llamadas primero y espera el conjunto con Promise.all.",
    ],
  },
  {
    id: "bug-spinner-infinito",
    title: "#E07 · El botón Enviar se queda girando para siempre",
    level: "intermedio",
    moduleId: "m05",
    lessonId: L.asyncAwait,
    report: {
      reportedBy: "QA · Lucía",
      where: "Contacto › formulario",
      steps: ["Desconecta la red.", "Rellena el formulario y pulsa Enviar.", "Vuelve a conectar la red."],
      actual: "Sale el toast de error, pero el botón queda deshabilitado con el spinner y ya no se puede reintentar.",
      expected: "setLoading(false) se llama siempre al terminar, haya ido bien o mal, y el error se sigue propagando.",
    },
    concepts: ["async.async-await"],
    instructions:
      "QA: si el envío del formulario falla, el error se muestra pero el botón se queda en estado de carga y no deja reintentar. Hay que recargar la página. Si el envío va bien, todo correcto.",
    starter: {
      "/enviar.js": `export async function enviarFormulario(datos, enviar, setLoading) {
  setLoading(true);
  try {
    const res = await enviar(datos);
    setLoading(false);
    return res;
  } catch (error) {
    throw error;
  }
}
`,
    },
    tests: {
      "/enviar.test.js": `import { enviarFormulario } from "./enviar";

test("si va bien, quita el loading y devuelve la respuesta", async () => {
  const estados = [];
  const res = await enviarFormulario({}, async () => "ok", (v) => estados.push(v));
  expect(res).toBe("ok");
  expect(estados).toEqual([true, false]);
});

test("si falla, quita el loading y propaga el error", async () => {
  const estados = [];
  const enviar = async () => {
    throw new Error("Sin conexión");
  };
  await expect(enviarFormulario({}, enviar, (v) => estados.push(v))).rejects.toThrow("Sin conexión");
  expect(estados).toEqual([true, false]);
});
`,
    },
    solution: {
      "/enviar.js": `export async function enviarFormulario(datos, enviar, setLoading) {
  setLoading(true);
  try {
    return await enviar(datos);
  } finally {
    setLoading(false);
  }
}
`,
    },
    hints: [
      "Sigue el camino del error: ¿pasa alguna vez por setLoading(false)?",
      "El bloque finally se ejecuta tanto si el try termina bien como si lanza.",
    ],
  },
  {
    id: "bug-carrito-uncaught-promise",
    title: "#E08 · Carrito en blanco y «Uncaught (in promise)» en la consola",
    level: "intermedio",
    moduleId: "m05",
    lessonId: L.promesas,
    report: {
      reportedBy: "Soporte · Andrea",
      where: "Carrito › carga inicial",
      steps: ["Inicia sesión con una cuenta que tenga un carrito antiguo (formato viejo).", "Abre el carrito."],
      actual: "El carrito queda en blanco, no aparece el aviso de error y en la consola sale «Uncaught (in promise) TypeError».",
      expected: "Cualquier fallo (de red o al normalizar) llama a onError con el mensaje y la promesa se cumple con [].",
    },
    concepts: ["async.promesas"],
    instructions:
      "Soporte: algunos usuarios con carritos antiguos ven el carrito vacío sin ningún aviso y en la consola aparece «Uncaught (in promise)». Pensábamos que el segundo argumento del then ya manejaba los errores.",
    starter: {
      "/carrito.js": `function normalizar(carrito) {
  return carrito.items.map((it) => ({ id: it.id, cantidad: Number(it.cantidad) }));
}

export function cargarCarrito(api, onError) {
  return api.leer().then(
    (carrito) => normalizar(carrito),
    (error) => {
      onError(error.message);
      return [];
    },
  );
}
`,
    },
    tests: {
      "/carrito.test.js": `import { cargarCarrito } from "./carrito";

test("normaliza un carrito correcto", async () => {
  const api = { leer: async () => ({ items: [{ id: "a", cantidad: "2" }] }) };
  await expect(cargarCarrito(api, () => {})).resolves.toEqual([{ id: "a", cantidad: 2 }]);
});

test("un error de red avisa y devuelve []", async () => {
  const errores = [];
  const api = { leer: async () => { throw new Error("Sin red"); } };
  await expect(cargarCarrito(api, (m) => errores.push(m))).resolves.toEqual([]);
  expect(errores).toEqual(["Sin red"]);
});

test("un carrito con formato viejo también avisa y devuelve []", async () => {
  const errores = [];
  const api = { leer: async () => ({ lineas: [] }) };
  await expect(cargarCarrito(api, (m) => errores.push(m))).resolves.toEqual([]);
  expect(errores).toHaveLength(1);
});
`,
    },
    solution: {
      "/carrito.js": `function normalizar(carrito) {
  return carrito.items.map((it) => ({ id: it.id, cantidad: Number(it.cantidad) }));
}

export function cargarCarrito(api, onError) {
  return api
    .leer()
    .then((carrito) => normalizar(carrito))
    .catch((error) => {
      onError(error.message);
      return [];
    });
}
`,
    },
    hints: [
      "En .then(ok, fallo), ¿quién atrapa un error que se lanza dentro de ok?",
      "Un .catch al final de la cadena atrapa los errores de todos los pasos anteriores.",
    ],
  },
  {
    id: "bug-widgets-promise-all",
    title: "#E09 · Si falla un widget, desaparece todo el panel",
    level: "intermedio",
    moduleId: "m05",
    lessonId: L.promesas,
    report: {
      reportedBy: "Producto · Javier",
      where: "Panel de inicio › widgets",
      steps: ["Provoca un error en el servicio del tiempo (widget «Tiempo»).", "Abre el panel de inicio."],
      actual: "No se pinta ningún widget: el panel entero muestra «Algo salió mal».",
      expected: "Cada widget se resuelve por separado: { estado: \"ok\", datos } o { estado: \"error\", mensaje }, en el mismo orden que los loaders.",
    },
    concepts: ["async.combinadores", "async.promesas"],
    instructions:
      "Producto: el panel tiene varios widgets independientes. Si uno falla, el panel entero muestra «Algo salió mal». Queremos que los widgets que funcionan se pinten y que el roto muestre su error.",
    starter: {
      "/widgets.js": `export async function cargarWidgets(loaders) {
  const datos = await Promise.all(loaders.map((cargar) => cargar()));
  return datos.map((d) => ({ estado: "ok", datos: d }));
}
`,
    },
    tests: {
      "/widgets.test.js": `import { cargarWidgets } from "./widgets";

test("todos bien", async () => {
  await expect(cargarWidgets([async () => 1, async () => 2])).resolves.toEqual([
    { estado: "ok", datos: 1 },
    { estado: "ok", datos: 2 },
  ]);
});

test("un fallo no tumba a los demás", async () => {
  const loaders = [
    async () => "noticias",
    async () => {
      throw new Error("Servicio del tiempo caído");
    },
    async () => "agenda",
  ];
  await expect(cargarWidgets(loaders)).resolves.toEqual([
    { estado: "ok", datos: "noticias" },
    { estado: "error", mensaje: "Servicio del tiempo caído" },
    { estado: "ok", datos: "agenda" },
  ]);
});
`,
    },
    solution: {
      "/widgets.js": `export async function cargarWidgets(loaders) {
  const resultados = await Promise.allSettled(loaders.map((cargar) => cargar()));
  return resultados.map((r) =>
    r.status === "fulfilled" ? { estado: "ok", datos: r.value } : { estado: "error", mensaje: r.reason.message },
  );
}
`,
    },
    hints: [
      "Promise.all rechaza en cuanto una sola promesa rechaza.",
      "Hay un combinador que espera a todas y te dice cuáles fueron bien (fulfilled) y cuáles mal (rejected).",
    ],
  },
  {
    id: "bug-buscador-sin-abort",
    title: "#E10 · El buscador dispara peticiones que nadie cancela",
    level: "avanzado",
    moduleId: "m05",
    lessonId: L.fetch,
    report: {
      reportedBy: "Backend · Sergio",
      where: "Buscador de productos",
      steps: ["Escribe «zapatillas» rápido en el buscador.", "Cierra el buscador antes de que lleguen los resultados.", "Mira los logs del servidor."],
      actual: "Todas las peticiones intermedias llegan al final y el servidor las procesa; al cerrar, la última también sigue viva.",
      expected: "Cada búsqueda nueva aborta la anterior (que se cumple con null, sin error) y cancelar() aborta la que esté en curso.",
    },
    concepts: ["async.abort", "async.fetch"],
    instructions:
      "Backend: cada letra del buscador lanza una petición y ninguna se cancela, ni siquiera al desmontar el componente (el cleanup del useEffect llama a cancelar()). Al abortar una búsqueda, su promesa debe cumplirse con null, no rechazar.",
    starter: {
      "/buscador.js": `export function crearBuscador(fetchImpl) {
  let controller = null;

  async function buscar(q) {
    controller = new AbortController();
    const res = await fetchImpl("/api/buscar?q=" + q, { signal: controller.signal });
    return res.json();
  }

  function cancelar() {
    controller = null;
  }

  return { buscar, cancelar };
}
`,
    },
    tests: {
      "/buscador.test.js": `import { crearBuscador } from "./buscador";

function crearFetch() {
  const signals = [];
  const fetchImpl = (url, { signal }) => {
    signals.push(signal);
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => resolve(new Response(JSON.stringify([url]))), 20);
      signal.addEventListener("abort", () => {
        clearTimeout(t);
        reject(signal.reason);
      });
    });
  };
  return { fetchImpl, signals };
}

test("una búsqueda nueva aborta la anterior", async () => {
  const { fetchImpl, signals } = crearFetch();
  const { buscar } = crearBuscador(fetchImpl);
  const p1 = buscar("z");
  const p2 = buscar("za");
  expect(signals[0].aborted).toBe(true);
  expect(signals[1].aborted).toBe(false);
  await Promise.allSettled([p1, p2]);
});

test("la búsqueda abortada se cumple con null y la última con resultados", async () => {
  const { fetchImpl } = crearFetch();
  const { buscar } = crearBuscador(fetchImpl);
  const p1 = buscar("z");
  const p2 = buscar("za");
  await expect(p1).resolves.toBeNull();
  await expect(p2).resolves.toEqual(["/api/buscar?q=za"]);
});

test("cancelar() aborta la búsqueda en curso", async () => {
  const { fetchImpl, signals } = crearFetch();
  const { buscar, cancelar } = crearBuscador(fetchImpl);
  const p = buscar("z");
  cancelar();
  expect(signals[0].aborted).toBe(true);
  await expect(p).resolves.toBeNull();
});

test("los errores que no son de aborto se propagan", async () => {
  const { buscar } = crearBuscador(async () => {
    throw new TypeError("Failed to fetch");
  });
  await expect(buscar("z")).rejects.toThrow("Failed to fetch");
});
`,
    },
    solution: {
      "/buscador.js": `export function crearBuscador(fetchImpl) {
  let controller = null;

  async function buscar(q) {
    controller?.abort();
    controller = new AbortController();
    try {
      const res = await fetchImpl("/api/buscar?q=" + q, { signal: controller.signal });
      return await res.json();
    } catch (error) {
      if (error.name === "AbortError") return null;
      throw error;
    }
  }

  function cancelar() {
    controller?.abort();
  }

  return { buscar, cancelar };
}
`,
    },
    hints: [
      "Crear un AbortController no cancela nada: alguien tiene que llamar a abort() sobre el anterior.",
      "Una petición abortada rechaza con un error cuyo name es \"AbortError\": distínguelo de los errores de verdad.",
    ],
  },
  {
    id: "bug-perfil-respuesta-vieja",
    title: "#E11 · Al cambiar rápido de usuario se queda el perfil equivocado",
    level: "avanzado",
    moduleId: "m05",
    lessonId: L.carreras,
    report: {
      reportedBy: "QA · Marco",
      where: "Equipo › panel lateral de perfil",
      steps: ["Haz clic en Ana y, enseguida, en Bruno.", "Espera a que termine de cargar."],
      actual: "El panel dice «Bruno» en la cabecera de la lista, pero muestra los datos de Ana.",
      expected: "Solo se pinta la respuesta de la última selección, aunque una respuesta anterior llegue más tarde.",
    },
    concepts: ["async.race-conditions"],
    instructions:
      "QA: si eliges un usuario y enseguida otro, a veces el panel acaba mostrando el primero. Pasa sobre todo con la red lenta: la respuesta de Ana tarda más que la de Bruno y llega la última.",
    starter: {
      "/perfil-panel.js": `export function crearCargadorPerfil(fetchPerfil, setPerfil) {
  return async function cargar(id) {
    const perfil = await fetchPerfil(id);
    setPerfil(perfil);
  };
}
`,
    },
    tests: {
      "/perfil-panel.test.js": `import { crearCargadorPerfil } from "./perfil-panel";

function crearFetch() {
  const pendientes = {};
  const fetchPerfil = (id) => new Promise((resolve) => (pendientes[id] = () => resolve({ id })));
  return { fetchPerfil, pendientes };
}

test("una respuesta vieja que llega tarde no pisa a la nueva", async () => {
  const pintados = [];
  const { fetchPerfil, pendientes } = crearFetch();
  const cargar = crearCargadorPerfil(fetchPerfil, (p) => pintados.push(p.id));
  const ana = cargar("ana");
  const bruno = cargar("bruno");
  pendientes.bruno();
  await bruno;
  pendientes.ana();
  await ana;
  expect(pintados).toEqual(["bruno"]);
});

test("en orden normal pinta cada selección", async () => {
  const pintados = [];
  const { fetchPerfil, pendientes } = crearFetch();
  const cargar = crearCargadorPerfil(fetchPerfil, (p) => pintados.push(p.id));
  const ana = cargar("ana");
  pendientes.ana();
  await ana;
  const bruno = cargar("bruno");
  pendientes.bruno();
  await bruno;
  expect(pintados).toEqual(["ana", "bruno"]);
});
`,
    },
    solution: {
      "/perfil-panel.js": `export function crearCargadorPerfil(fetchPerfil, setPerfil) {
  let ultima = 0;
  return async function cargar(id) {
    const peticion = ++ultima;
    const perfil = await fetchPerfil(id);
    if (peticion === ultima) setPerfil(perfil);
  };
}
`,
    },
    hints: [
      "Las respuestas no tienen por qué llegar en el orden en que se pidieron.",
      "Numera cada petición y, cuando llegue su respuesta, compruébalo: si ya no es la última, ignórala.",
    ],
  },
  {
    id: "bug-autoguardado-debounce",
    title: "#E12 · El autoguardado guarda la primera letra",
    level: "avanzado",
    moduleId: "m05",
    lessonId: L.carreras,
    report: {
      reportedBy: "Producto · Nora",
      where: "Editor de notas › autoguardado",
      steps: ["Escribe «hola» rápido en una nota.", "Espera un segundo y recarga."],
      actual: "La nota guardada contiene solo «h».",
      expected: "Se guarda una sola vez, con el último texto, cuando el usuario lleva `ms` milisegundos sin escribir.",
    },
    concepts: ["async.debounce-throttle"],
    instructions:
      "Producto: el editor llama a guardarConRetraso(texto) en cada onChange para no saturar la API. Solo se envía una petición, bien, pero con el texto de la primera pulsación: lo que escribes después se pierde.",
    starter: {
      "/debounce.js": `export function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    if (timer) return;
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };
}
`,
    },
    tests: {
      "/debounce.test.js": `import { debounce } from "./debounce";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

test("una ráfaga se guarda una vez con el último texto", async () => {
  const guardados = [];
  const guardar = debounce((t) => guardados.push(t), 100);
  guardar("h");
  guardar("ho");
  guardar("hola");
  await esperar(250);
  expect(guardados).toEqual(["hola"]);
});

test("cada pulsación reinicia la espera", async () => {
  const guardados = [];
  const guardar = debounce((t) => guardados.push(t), 100);
  guardar("h");
  await esperar(60);
  guardar("ho");
  await esperar(60);
  guardar("hola");
  await esperar(250);
  expect(guardados).toEqual(["hola"]);
});
`,
    },
    solution: {
      "/debounce.js": `export function debounce(fn, ms) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      fn(...args);
    }, ms);
  };
}
`,
    },
    hints: [
      "¿Qué argumentos captura el setTimeout que llega a ejecutarse?",
      "En un debounce, cada llamada cancela el temporizador anterior (clearTimeout) y programa uno nuevo con sus argumentos.",
    ],
  },
  {
    id: "bug-importar-csv-congela",
    title: "#E13 · La barra de progreso de la importación no se mueve",
    level: "avanzado",
    moduleId: "m05",
    lessonId: L.eventLoop,
    report: {
      reportedBy: "QA · Lucía",
      where: "Clientes › importar CSV",
      steps: ["Importa un CSV de 50 000 filas.", "Mira la barra de progreso y prueba a pulsar Cancelar."],
      actual: "La pestaña se congela, la barra salta de 0 % a 100 % y el clic en Cancelar no responde hasta el final.",
      expected: "Entre lote y lote se cede el hilo principal para que el navegador pueda pintar y atender eventos (macrotarea), y el resultado final no cambia.",
    },
    concepts: ["async.render-navegador", "async.event-loop"],
    instructions:
      "QA: al importar un CSV grande la pestaña se congela. La función ya es async y procesa por lotes, pero la barra no se mueve y los clics no se atienden hasta que termina. Probamos con await Promise.resolve() entre lotes y siguió igual.",
    starter: {
      "/importar.js": `export async function importarPorLotes(filas, tamLote, procesar, onProgreso) {
  const resultado = [];
  for (let i = 0; i < filas.length; i += tamLote) {
    const lote = filas.slice(i, i + tamLote);
    resultado.push(...lote.map(procesar));
    onProgreso(Math.min(i + tamLote, filas.length));
    await Promise.resolve();
  }
  return resultado;
}
`,
    },
    tests: {
      "/importar.test.js": `import { importarPorLotes } from "./importar";

test("procesa todas las filas en orden", async () => {
  const res = await importarPorLotes([1, 2, 3, 4, 5], 2, (n) => n * 10, () => {});
  expect(res).toEqual([10, 20, 30, 40, 50]);
});

test("el navegador puede intervenir entre lotes", async () => {
  const log = [];
  setTimeout(() => log.push("pintar"), 0);
  await importarPorLotes([1, 2, 3, 4, 5, 6], 2, (n) => n, (n) => log.push(n));
  expect(log.indexOf("pintar")).toBeGreaterThan(-1);
  expect(log.indexOf("pintar")).toBeLessThan(log.indexOf(6));
});
`,
    },
    solution: {
      "/importar.js": `const cederHilo = () => new Promise((resolve) => setTimeout(resolve, 0));

export async function importarPorLotes(filas, tamLote, procesar, onProgreso) {
  const resultado = [];
  for (let i = 0; i < filas.length; i += tamLote) {
    const lote = filas.slice(i, i + tamLote);
    resultado.push(...lote.map(procesar));
    onProgreso(Math.min(i + tamLote, filas.length));
    await cederHilo();
  }
  return resultado;
}
`,
    },
    hints: [
      "Las microtareas (promesas) se vacían enteras antes de que el navegador pinte o atienda un clic.",
      "Para ceder de verdad hay que programar una macrotarea: por ejemplo, esperar a un setTimeout(…, 0).",
    ],
  },
];
