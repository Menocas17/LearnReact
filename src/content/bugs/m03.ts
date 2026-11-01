import type { BugDef } from "../types";

const L = {
  closures: "js-profundo/closures",
  scope: "js-profundo/scope-y-hoisting",
  referencias: "js-profundo/valores-y-referencias",
  this: "js-profundo/this",
  clases: "js-profundo/prototipos-y-clases",
  colecciones: "js-profundo/objetos-y-colecciones",
  modulos: "js-profundo/modulos-y-errores",
};

/** React en miniatura para probar componentes sin navegador. Se añade a los tests como "/mini-react.js". */
const miniReact = `// React en miniatura: useState, useRef y un useEffect(fn, []) llamado useMountEffect.
// No hace falta tocar este archivo.
export function montar(Componente, extras = {}) {
  const estado = [];
  let montado = false;
  let salida;

  function render() {
    let cursor = 0;
    const efectos = [];
    const hooks = {
      ...extras,
      useState(inicial) {
        const i = cursor++;
        if (!(i in estado)) estado[i] = inicial;
        const setState = (next) => {
          estado[i] = typeof next === "function" ? next(estado[i]) : next;
          render();
        };
        return [estado[i], setState];
      },
      useRef(inicial) {
        const i = cursor++;
        if (!(i in estado)) estado[i] = { current: inicial };
        return estado[i];
      },
      // Como useEffect(fn, []): solo se ejecuta después del primer render.
      useMountEffect(fn) {
        efectos.push(fn);
      },
    };
    salida = Componente(hooks);
    if (!montado) {
      montado = true;
      efectos.forEach((fn) => fn());
    }
  }

  render();
  return { salida: () => salida };
}
`;

/** Bugs del módulo 3, de principiante a avanzado. */
export const bugsM03: readonly BugDef[] = [
  {
    id: "bug-tabs-var-bucle",
    title: "#C01 · Todas las pestañas abren una pantalla en blanco",
    level: "principiante",
    moduleId: "m03",
    lessonId: L.closures,
    report: {
      reportedBy: "QA · Lucía",
      where: "Ajustes › barra de pestañas",
      steps: ["Abre Ajustes.", "Pulsa la pestaña «Perfil».", "Pulsa la pestaña «Seguridad»."],
      actual: "Cualquier pestaña deja el panel en blanco. En la consola, la pestaña activa es undefined.",
      expected: "Cada pestaña activa la suya: «Perfil» devuelve \"Perfil\", «Seguridad» devuelve \"Seguridad\".",
    },
    concepts: ["js.closures", "js.scope"],
    instructions:
      "QA: en Ajustes, pulse la pestaña que pulse, el panel se queda en blanco. Los onClick se crean en un bucle con crearHandlers(tabs) y cada uno debería devolver su pestaña, pero todos devuelven undefined.",
    starter: {
      "/tabs.js": `// Crea un onClick por pestaña. Cada uno devuelve la pestaña que hay que activar.
export function crearHandlers(tabs) {
  const handlers = [];
  for (var i = 0; i < tabs.length; i++) {
    handlers.push(() => tabs[i]);
  }
  return handlers;
}
`,
    },
    tests: {
      "/tabs.test.js": `import { crearHandlers } from "./tabs";

const tabs = ["Perfil", "Seguridad", "Notificaciones"];

test("cada handler devuelve su pestaña", () => {
  const handlers = crearHandlers(tabs);
  expect(handlers[0]()).toBe("Perfil");
  expect(handlers[1]()).toBe("Seguridad");
  expect(handlers[2]()).toBe("Notificaciones");
});

test("hay un handler por pestaña", () => {
  expect(crearHandlers(tabs)).toHaveLength(3);
});
`,
    },
    solution: {
      "/tabs.js": `export function crearHandlers(tabs) {
  const handlers = [];
  for (let i = 0; i < tabs.length; i++) {
    handlers.push(() => tabs[i]);
  }
  return handlers;
}
`,
    },
    hints: [
      "Los handlers se ejecutan después de que el bucle termine. ¿Cuánto vale i en ese momento?",
      "Con var hay una sola i para todo el bucle; con let, cada vuelta tiene la suya.",
    ],
  },
  {
    id: "bug-tema-tdz",
    title: "#C02 · La app no arranca: «Cannot access 'PALETAS' before initialization»",
    level: "principiante",
    moduleId: "m03",
    lessonId: L.scope,
    report: {
      reportedBy: "Frontend · Andrés",
      where: "Layout raíz › tema.js",
      steps: ["Haz pull de main.", "Ejecuta pnpm dev y abre cualquier página."],
      actual: "Pantalla de error: ReferenceError: Cannot access 'PALETAS' before initialization.",
      expected: "La app arranca con el tema oscuro: tema vale { modo: \"oscuro\", fondo: \"#111\", texto: \"#eee\" }.",
    },
    concepts: ["js.hoisting-tdz"],
    instructions:
      "Frontend: después del último merge en tema.js la app no arranca. Sale un ReferenceError sobre PALETAS. Lo raro es que crearTema sí existe al llamarla, porque las funciones se elevan.",
    starter: {
      "/tema.js": `export const tema = crearTema("oscuro");

export function crearTema(modo) {
  return { modo, ...PALETAS[modo] };
}

const PALETAS = {
  claro: { fondo: "#fff", texto: "#111" },
  oscuro: { fondo: "#111", texto: "#eee" },
};
`,
    },
    tests: {
      "/tema.test.js": `import { tema, crearTema } from "./tema";

test("el tema por defecto es el oscuro", () => {
  expect(tema).toEqual({ modo: "oscuro", fondo: "#111", texto: "#eee" });
});

test("se puede crear el tema claro", () => {
  expect(crearTema("claro")).toEqual({ modo: "claro", fondo: "#fff", texto: "#111" });
});
`,
    },
    solution: {
      "/tema.js": `const PALETAS = {
  claro: { fondo: "#fff", texto: "#111" },
  oscuro: { fondo: "#111", texto: "#eee" },
};

export function crearTema(modo) {
  return { modo, ...PALETAS[modo] };
}

export const tema = crearTema("oscuro");
`,
    },
    hints: [
      "La declaración de una función se eleva completa; la de un const también se eleva, pero queda en la zona muerta temporal.",
      "Mira en qué orden se ejecutan las líneas del módulo: ¿PALETAS ya tiene valor cuando se llama a crearTema?",
    ],
  },
  {
    id: "bug-filtros-mutados",
    title: "#C03 · «Limpiar filtros» no limpia nada",
    level: "principiante",
    moduleId: "m03",
    lessonId: L.referencias,
    report: {
      reportedBy: "QA · Marco",
      where: "Catálogo › panel de filtros",
      steps: ["Elige la categoría «Camisetas».", "Añade la etiqueta «rojo».", "Pulsa «Limpiar filtros»."],
      actual: "Los filtros siguen en «Camisetas» y «rojo». Además, al añadir etiquetas la lista no se repinta hasta que cambias otra cosa.",
      expected: "«Limpiar filtros» vuelve a { categoria: \"todas\", etiquetas: [] } y cada cambio devuelve un objeto nuevo.",
    },
    concepts: ["js.valor-referencia", "js.inmutabilidad"],
    instructions:
      "QA: después de filtrar, «Limpiar filtros» no devuelve el panel a su estado inicial. El componente hace setFiltros(filtrosIniciales()) y setFiltros(conEtiqueta(filtros, etiqueta)). Al añadir una etiqueta, la lista tampoco se repinta.",
    starter: {
      "/filtros.js": `const FILTROS_INICIALES = { categoria: "todas", etiquetas: [] };

export function filtrosIniciales() {
  return FILTROS_INICIALES;
}

export function conCategoria(filtros, categoria) {
  filtros.categoria = categoria;
  return filtros;
}

export function conEtiqueta(filtros, etiqueta) {
  filtros.etiquetas.push(etiqueta);
  return filtros;
}
`,
    },
    tests: {
      "/filtros.test.js": `import { filtrosIniciales, conCategoria, conEtiqueta } from "./filtros";

test("limpiar filtros vuelve al estado inicial", () => {
  conEtiqueta(conCategoria(filtrosIniciales(), "camisetas"), "rojo");
  expect(filtrosIniciales()).toEqual({ categoria: "todas", etiquetas: [] });
});

test("conEtiqueta devuelve un objeto nuevo y no toca el anterior", () => {
  const antes = filtrosIniciales();
  const despues = conEtiqueta(antes, "rojo");
  expect(despues).not.toBe(antes);
  expect(despues.etiquetas).toEqual(["rojo"]);
  expect(antes.etiquetas).toEqual([]);
});

test("conCategoria tampoco toca el anterior", () => {
  const antes = filtrosIniciales();
  const despues = conCategoria(antes, "tazas");
  expect(despues).not.toBe(antes);
  expect(despues.categoria).toBe("tazas");
  expect(antes.categoria).toBe("todas");
});
`,
    },
    solution: {
      "/filtros.js": `const FILTROS_INICIALES = { categoria: "todas", etiquetas: [] };

export function filtrosIniciales() {
  return { ...FILTROS_INICIALES, etiquetas: [...FILTROS_INICIALES.etiquetas] };
}

export function conCategoria(filtros, categoria) {
  return { ...filtros, categoria };
}

export function conEtiqueta(filtros, etiqueta) {
  return { ...filtros, etiquetas: [...filtros.etiquetas, etiqueta] };
}
`,
    },
    hints: [
      "filtrosIniciales devuelve siempre el mismo objeto. ¿Qué pasa con él cuando alguien hace push sobre sus etiquetas?",
      "Devuelve copias: { ...filtros, etiquetas: [...filtros.etiquetas, etiqueta] }. React compara referencias.",
    ],
  },
  {
    id: "bug-perfil-catch-silencioso",
    title: "#C04 · El perfil sale vacío en vez de mostrar el error",
    level: "principiante",
    moduleId: "m03",
    lessonId: L.modulos,
    report: {
      reportedBy: "Soporte · Elena",
      where: "/perfil › carga de datos",
      steps: ["Inicia sesión y deja caducar la sesión.", "Entra en /perfil."],
      actual: "La página muestra el formulario con nombre y email vacíos. Varios usuarios lo han guardado así y han borrado sus datos.",
      expected: "Si la API falla, cargarPerfil rechaza con el error original y el error.tsx de la ruta muestra «No pudimos cargar tu perfil».",
    },
    concepts: ["js.errores"],
    instructions:
      "Soporte: cuando la sesión caduca, /perfil no muestra ningún error: aparece el formulario vacío y la gente lo guarda así. La ruta tiene un error.tsx, pero nunca se activa.",
    starter: {
      "/perfil.js": `// La página hace: const perfil = await cargarPerfil(api.getPerfil)
export async function cargarPerfil(pedirPerfil) {
  try {
    const datos = await pedirPerfil();
    return { nombre: datos.name, email: datos.email };
  } catch {
    return { nombre: "", email: "" };
  }
}
`,
    },
    tests: {
      "/perfil.test.js": `import { cargarPerfil } from "./perfil";

test("adapta los datos de la API", async () => {
  const perfil = await cargarPerfil(async () => ({ name: "Ana", email: "ana@ejemplo.com" }));
  expect(perfil).toEqual({ nombre: "Ana", email: "ana@ejemplo.com" });
});

test("si la API falla, el error llega a la página", async () => {
  const pedir = async () => {
    throw new Error("401: sesión caducada");
  };
  await expect(cargarPerfil(pedir)).rejects.toThrow("401");
});
`,
    },
    solution: {
      "/perfil.js": `// Si no sabemos qué hacer con el error, no lo capturamos: que llegue a error.tsx.
export async function cargarPerfil(pedirPerfil) {
  const datos = await pedirPerfil();
  return { nombre: datos.name, email: datos.email };
}
`,
    },
    hints: [
      "Un catch que devuelve datos falsos convierte un fallo en un «éxito» vacío.",
      "Si esta función no puede arreglar el error, deja que se propague (quita el try o vuelve a lanzarlo).",
    ],
  },
  {
    id: "bug-tracker-this-perdido",
    title: "#C05 · «Cannot read properties of undefined (reading 'pendientes')»",
    level: "intermedio",
    moduleId: "m03",
    lessonId: L.this,
    report: {
      reportedBy: "Producto · Nerea",
      where: "Analítica › botones de la home",
      steps: ["Abre la home.", "Pulsa «Empezar curso»."],
      actual: "El botón no hace nada y en la consola sale TypeError: Cannot read properties of undefined (reading 'pendientes'). En el panel de analítica no llega ningún evento.",
      expected: "track funciona aunque se desestructure (const { track } = tracker) o se pase como callback (items.forEach(tracker.track)). Cada 3 eventos se envía un lote.",
    },
    concepts: ["js.this", "js.call-apply-bind"],
    instructions:
      "Producto: desde que los componentes hacen const { track } = useTracker() y <button onClick={track}>, la analítica está rota y salta un TypeError. Llamando a tracker.track(\"x\") directamente funciona.",
    starter: {
      "/tracker.js": `export class Tracker {
  constructor(enviar) {
    this.enviar = enviar;
    this.pendientes = [];
  }

  track(evento) {
    this.pendientes.push(evento);
    if (this.pendientes.length >= 3) this.flush();
  }

  flush() {
    this.enviar(this.pendientes);
    this.pendientes = [];
  }
}
`,
    },
    tests: {
      "/tracker.test.js": `import { Tracker } from "./tracker";

test("funciona llamado como método", () => {
  const tracker = new Tracker(() => {});
  tracker.track("abrir");
  expect(tracker.pendientes).toEqual(["abrir"]);
});

test("funciona al desestructurarlo", () => {
  const tracker = new Tracker(() => {});
  const { track } = tracker;
  track("abrir");
  expect(tracker.pendientes).toEqual(["abrir"]);
});

test("funciona pasado como callback y envía el lote", () => {
  const lotes = [];
  const tracker = new Tracker((lote) => lotes.push(lote));
  ["a", "b", "c"].forEach(tracker.track);
  expect(lotes).toEqual([["a", "b", "c"]]);
  expect(tracker.pendientes).toEqual([]);
});
`,
    },
    solution: {
      "/tracker.js": `export class Tracker {
  constructor(enviar) {
    this.enviar = enviar;
    this.pendientes = [];
  }

  // Una arrow function como campo de clase toma el this de la instancia.
  track = (evento) => {
    this.pendientes.push(evento);
    if (this.pendientes.length >= 3) this.flush();
  };

  flush() {
    this.enviar(this.pendientes);
    this.pendientes = [];
  }
}
`,
    },
    hints: [
      "this depende de cómo se llama la función, no de dónde se definió. ¿Qué hay a la izquierda del punto en track(\"abrir\")?",
      "Fija el this: this.track = this.track.bind(this) en el constructor, o declara track como arrow function en un campo de clase.",
    ],
  },
  {
    id: "bug-cronometro-stale",
    title: "#C06 · El cronómetro del examen se queda en «1 s»",
    level: "intermedio",
    moduleId: "m03",
    lessonId: L.closures,
    report: {
      reportedBy: "QA · Lucía",
      where: "Examen › <Cronometro />",
      steps: ["Empieza un examen.", "Espera unos segundos mirando el cronómetro."],
      actual: "Pasa de «0 s» a «1 s» y ahí se queda, aunque el intervalo se sigue ejecutando cada segundo.",
      expected: "Cada tick del intervalo suma un segundo: tras 3 ticks muestra «3 s». Solo se crea un intervalo.",
    },
    concepts: ["js.closures"],
    instructions:
      "QA: el cronómetro del examen marca 1 s y se congela. Con un console.log dentro del setInterval vemos que se ejecuta cada segundo, pero el número no sube. El componente usa un efecto que solo corre al montar. Para los tests usamos un React en miniatura (mini-react.js) y un reloj falso.",
    starter: {
      "/Cronometro.js": `export function Cronometro({ useState, useMountEffect, setInterval }) {
  const [segundos, setSegundos] = useState(0);

  useMountEffect(() => {
    setInterval(() => {
      setSegundos(segundos + 1);
    }, 1000);
  });

  return \`\${segundos} s\`;
}
`,
    },
    tests: {
      "/mini-react.js": miniReact,
      "/Cronometro.test.js": `import { montar } from "./mini-react";
import { Cronometro } from "./Cronometro";

function relojFalso() {
  const callbacks = [];
  return {
    callbacks,
    setInterval: (fn) => callbacks.push(fn),
    tick: () => callbacks.forEach((fn) => fn()),
  };
}

test("empieza en 0 s", () => {
  const reloj = relojFalso();
  const app = montar(Cronometro, { setInterval: reloj.setInterval });
  expect(app.salida()).toBe("0 s");
});

test("suma un segundo en cada tick", () => {
  const reloj = relojFalso();
  const app = montar(Cronometro, { setInterval: reloj.setInterval });
  reloj.tick();
  reloj.tick();
  reloj.tick();
  expect(app.salida()).toBe("3 s");
});

test("solo crea un intervalo", () => {
  const reloj = relojFalso();
  montar(Cronometro, { setInterval: reloj.setInterval });
  reloj.tick();
  expect(reloj.callbacks).toHaveLength(1);
});
`,
    },
    solution: {
      "/Cronometro.js": `export function Cronometro({ useState, useMountEffect, setInterval }) {
  const [segundos, setSegundos] = useState(0);

  useMountEffect(() => {
    setInterval(() => {
      // La forma funcional recibe el valor actual, no el del primer render.
      setSegundos((s) => s + 1);
    }, 1000);
  });

  return \`\${segundos} s\`;
}
`,
    },
    hints: [
      "La función del intervalo se creó en el primer render. ¿Qué valor de segundos quedó guardado en su closure?",
      "setSegundos acepta una función que recibe el estado actual: setSegundos((s) => s + 1).",
    ],
  },
  {
    id: "bug-httperror-sin-name",
    title: "#C07 · Todos los fallos muestran «Algo salió mal»",
    level: "intermedio",
    moduleId: "m03",
    lessonId: L.clases,
    report: {
      reportedBy: "Backend · Sergio",
      where: "Cliente HTTP › toasts de error y Sentry",
      steps: ["Abre /curso/no-existe (la API responde 404).", "Envía el formulario de registro con un email inválido (422)."],
      actual: "Ambos casos muestran el toast genérico «Algo salió mal». En Sentry todos los errores aparecen como «Error: …», sin tipo.",
      expected: "Un 404 muestra «No encontramos lo que buscas.», un 422 «Revisa estos campos: email». Los errores se llaman HttpError y ValidacionError.",
    },
    concepts: ["js.errores", "js.clases"],
    instructions:
      "Backend: creamos HttpError y ValidacionError para dar mensajes útiles, pero el usuario siempre ve «Algo salió mal» y en Sentry todo sale como «Error». mensajeParaUsuario decide según error.name.",
    starter: {
      "/errores.js": `export class HttpError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.status = status;
  }
}

export class ValidacionError extends HttpError {
  constructor(campos) {
    super(422, "Datos inválidos");
    this.campos = campos;
  }
}

export function mensajeParaUsuario(error) {
  switch (error.name) {
    case "ValidacionError":
      return "Revisa estos campos: " + error.campos.join(", ");
    case "HttpError":
      if (error.status === 404) return "No encontramos lo que buscas.";
      if (error.status >= 500) return "El servidor tuvo un problema. Inténtalo más tarde.";
  }
  return "Algo salió mal.";
}
`,
    },
    tests: {
      "/errores.test.js": `import { HttpError, ValidacionError, mensajeParaUsuario } from "./errores";

test("los errores tienen su propio nombre", () => {
  expect(new HttpError(404, "No existe").name).toBe("HttpError");
  expect(new ValidacionError(["email"]).name).toBe("ValidacionError");
  expect(String(new HttpError(500, "Caído"))).toBe("HttpError: Caído");
});

test("siguen siendo errores normales", () => {
  const error = new ValidacionError(["email"]);
  expect(error).toBeInstanceOf(HttpError);
  expect(error).toBeInstanceOf(Error);
  expect(error.status).toBe(422);
});

test("mensajes para el usuario", () => {
  expect(mensajeParaUsuario(new HttpError(404, "No existe"))).toBe("No encontramos lo que buscas.");
  expect(mensajeParaUsuario(new HttpError(503, "Caído"))).toBe("El servidor tuvo un problema. Inténtalo más tarde.");
  expect(mensajeParaUsuario(new ValidacionError(["email", "nombre"]))).toBe("Revisa estos campos: email, nombre");
  expect(mensajeParaUsuario(new Error("x"))).toBe("Algo salió mal.");
});
`,
    },
    solution: {
      "/errores.js": `export class HttpError extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.name = "HttpError";
    this.status = status;
  }
}

export class ValidacionError extends HttpError {
  constructor(campos) {
    super(422, "Datos inválidos");
    this.name = "ValidacionError";
    this.campos = campos;
  }
}

export function mensajeParaUsuario(error) {
  switch (error.name) {
    case "ValidacionError":
      return "Revisa estos campos: " + error.campos.join(", ");
    case "HttpError":
      if (error.status === 404) return "No encontramos lo que buscas.";
      if (error.status >= 500) return "El servidor tuvo un problema. Inténtalo más tarde.";
  }
  return "Algo salió mal.";
}
`,
    },
    hints: [
      "Haz console.log(new HttpError(404, \"x\").name). ¿De dónde sale ese valor?",
      "name se hereda de Error.prototype. Asígnalo en cada constructor: this.name = \"HttpError\".",
    ],
  },
  {
    id: "bug-favoritos-duplicados",
    title: "#C08 · Favoritos duplicados al volver a tener conexión",
    level: "intermedio",
    moduleId: "m03",
    lessonId: L.colecciones,
    report: {
      reportedBy: "Móvil · Iván",
      where: "Favoritos › sincronización offline",
      steps: ["Desconéctate y marca como favorito el curso «React básico» (ya lo era en el servidor).", "Vuelve a conectarte."],
      actual: "«React básico» aparece dos veces en la lista y el corazón del curso sale vacío.",
      expected: "Cada producto aparece una vez (mismo id = mismo producto) y esFavorito lo reconoce aunque sea otro objeto.",
    },
    concepts: ["js.map-set", "js.valor-referencia"],
    instructions:
      "Móvil: al sincronizar los favoritos guardados sin conexión con los del servidor, salen duplicados. Usamos un Set para quitarlos, pero no quita ninguno. Además, el corazón de la ficha del curso no se marca.",
    starter: {
      "/favoritos.js": `// Une los favoritos del servidor con los marcados sin conexión, sin repetir.
export function fusionarFavoritos(delServidor, locales) {
  return [...new Set([...delServidor, ...locales])];
}

export function esFavorito(favoritos, producto) {
  return new Set(favoritos).has(producto);
}
`,
    },
    tests: {
      "/favoritos.test.js": `import { fusionarFavoritos, esFavorito } from "./favoritos";

// Cada lista viene de un JSON distinto: mismos datos, objetos distintos.
const delServidor = () => [{ id: 1, titulo: "React básico" }, { id: 2, titulo: "TypeScript" }];
const locales = () => [{ id: 1, titulo: "React básico" }, { id: 3, titulo: "Next.js" }];

test("no repite productos con el mismo id", () => {
  const ids = fusionarFavoritos(delServidor(), locales()).map((p) => p.id);
  expect(ids).toEqual([1, 2, 3]);
});

test("reconoce un favorito aunque sea otro objeto", () => {
  expect(esFavorito(delServidor(), { id: 2, titulo: "TypeScript" })).toBe(true);
  expect(esFavorito(delServidor(), { id: 9, titulo: "Vue" })).toBe(false);
});
`,
    },
    solution: {
      "/favoritos.js": `export function fusionarFavoritos(delServidor, locales) {
  const porId = new Map();
  for (const producto of [...delServidor, ...locales]) {
    if (!porId.has(producto.id)) porId.set(producto.id, producto);
  }
  return [...porId.values()];
}

export function esFavorito(favoritos, producto) {
  return favoritos.some((p) => p.id === producto.id);
}
`,
    },
    hints: [
      "Un Set compara objetos por referencia: dos objetos con los mismos datos son distintos.",
      "Usa un valor primitivo como clave: un Map de id → producto.",
    ],
  },
  {
    id: "bug-cache-precios-mutados",
    title: "#C09 · Cada visita a /ofertas baja más los precios del catálogo",
    level: "avanzado",
    moduleId: "m03",
    lessonId: L.referencias,
    report: {
      reportedBy: "Cliente · tienda de Valencia",
      where: "/ofertas y /catalogo (caché compartida)",
      steps: ["Abre /catalogo: la taza cuesta 100.", "Abre /ofertas (10 % de descuento): 90.", "Vuelve a /catalogo y luego otra vez a /ofertas."],
      actual: "El catálogo muestra 90 y la oferta pasa a 81. Cada visita a /ofertas baja el precio otro 10 %.",
      expected: "El catálogo siempre muestra 100 y la oferta siempre 90. conDescuento y conIva no modifican los productos de la caché.",
    },
    concepts: ["js.valor-referencia", "js.inmutabilidad", "js.modulos"],
    instructions:
      "Cliente: los precios del catálogo bajan solos después de visitar las ofertas y cada visita los baja más. getProductos guarda la respuesta en una caché del módulo para no repetir la petición. Ya probamos a copiar el array con [...productos] y no sirvió.",
    starter: {
      "/catalogo-api.js": `// Módulo compartido por todas las páginas: se evalúa una sola vez.
let cache = null;

export async function getProductos(pedir) {
  if (!cache) cache = await pedir();
  return cache;
}

export function vaciarCache() {
  cache = null;
}
`,
      "/precios.js": `export function conDescuento(productos, porcentaje) {
  return productos.map((p) => {
    p.precio = Math.round(p.precio * (1 - porcentaje / 100));
    return p;
  });
}

export function conIva(productos) {
  const copia = [...productos];
  copia.forEach((p) => {
    p.precio = Math.round(p.precio * 1.21);
  });
  return copia;
}
`,
    },
    tests: {
      "/precios.test.js": `import { getProductos, vaciarCache } from "./catalogo-api";
import { conDescuento, conIva } from "./precios";

const pedir = async () => [
  { id: 1, nombre: "Taza", precio: 100 },
  { id: 2, nombre: "Lámina", precio: 200 },
];
const precios = (lista) => lista.map((p) => p.precio);

beforeEach(() => vaciarCache());

test("la página de ofertas no cambia el catálogo", async () => {
  const ofertas = conDescuento(await getProductos(pedir), 10);
  expect(precios(ofertas)).toEqual([90, 180]);
  expect(precios(await getProductos(pedir))).toEqual([100, 200]);
});

test("visitar ofertas dos veces no acumula el descuento", async () => {
  conDescuento(await getProductos(pedir), 10);
  const segunda = conDescuento(await getProductos(pedir), 10);
  expect(precios(segunda)).toEqual([90, 180]);
});

test("conIva tampoco toca los originales y conserva el resto de datos", async () => {
  const conImpuestos = conIva(await getProductos(pedir));
  expect(conImpuestos[0]).toEqual({ id: 1, nombre: "Taza", precio: 121 });
  expect(precios(await getProductos(pedir))).toEqual([100, 200]);
});
`,
    },
    solution: {
      "/catalogo-api.js": `// Módulo compartido por todas las páginas: se evalúa una sola vez.
let cache = null;

export async function getProductos(pedir) {
  if (!cache) cache = await pedir();
  return cache;
}

export function vaciarCache() {
  cache = null;
}
`,
      "/precios.js": `// Copiar el array no copia los objetos: hay que crear un producto nuevo.
export function conDescuento(productos, porcentaje) {
  return productos.map((p) => ({ ...p, precio: Math.round(p.precio * (1 - porcentaje / 100)) }));
}

export function conIva(productos) {
  return productos.map((p) => ({ ...p, precio: Math.round(p.precio * 1.21) }));
}
`,
    },
    hints: [
      "[...productos] crea un array nuevo, pero ¿los objetos de dentro son nuevos o los mismos de la caché?",
      "Dentro del map devuelve un objeto nuevo: ({ ...p, precio: nuevoPrecio }).",
    ],
  },
  {
    id: "bug-formulario-sin-finally",
    title: "#C10 · El botón se queda en «Enviando…» para siempre",
    level: "avanzado",
    moduleId: "m03",
    lessonId: L.modulos,
    report: {
      reportedBy: "QA · Marco",
      where: "Contacto › <FormularioContacto />",
      steps: ["Envía el formulario con un email inválido.", "Corrige el email e intenta enviarlo otra vez."],
      actual: "Aparece el mensaje de error, pero el botón sigue deshabilitado con «Enviando…». Si se cae la red pasa lo mismo, sin mensaje.",
      expected: "Pase lo que pase, al terminar enviando vuelve a false. Un error de validación se muestra; cualquier otro error se propaga (lo recoge error.tsx).",
    },
    concepts: ["js.errores"],
    instructions:
      "QA: si el envío del formulario falla, el botón se queda en «Enviando…» y no deja reintentar. El componente deshabilita el botón mientras estado.enviando es true.",
    starter: {
      "/formulario.js": `export class ValidacionError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ValidacionError";
  }
}

// <FormularioContacto> lee estado y llama a guardar(datos) al enviar.
export function crearFormulario(enviar) {
  const estado = { enviando: false, error: null };

  async function guardar(datos) {
    estado.enviando = true;
    estado.error = null;
    try {
      await enviar(datos);
      estado.enviando = false;
      return true;
    } catch (error) {
      if (error instanceof ValidacionError) {
        estado.error = error.message;
        return false;
      }
      throw error;
    }
  }

  return { estado, guardar };
}
`,
    },
    tests: {
      "/formulario.test.js": `import { crearFormulario, ValidacionError } from "./formulario";

test("un envío correcto deja el botón libre", async () => {
  const form = crearFormulario(async () => {});
  expect(await form.guardar({ email: "ana@ejemplo.com" })).toBe(true);
  expect(form.estado).toEqual({ enviando: false, error: null });
});

test("un error de validación se muestra y libera el botón", async () => {
  const form = crearFormulario(async () => {
    throw new ValidacionError("El email no es válido");
  });
  expect(await form.guardar({ email: "ana" })).toBe(false);
  expect(form.estado).toEqual({ enviando: false, error: "El email no es válido" });
});

test("un error inesperado se propaga y también libera el botón", async () => {
  const form = crearFormulario(async () => {
    throw new Error("Network error");
  });
  await expect(form.guardar({})).rejects.toThrow("Network error");
  expect(form.estado.enviando).toBe(false);
});

test("al reintentar se limpia el error anterior", async () => {
  let intentos = 0;
  const form = crearFormulario(async () => {
    intentos++;
    if (intentos === 1) throw new ValidacionError("El email no es válido");
  });
  await form.guardar({});
  expect(await form.guardar({})).toBe(true);
  expect(form.estado).toEqual({ enviando: false, error: null });
});
`,
    },
    solution: {
      "/formulario.js": `export class ValidacionError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ValidacionError";
  }
}

export function crearFormulario(enviar) {
  const estado = { enviando: false, error: null };

  async function guardar(datos) {
    estado.enviando = true;
    estado.error = null;
    try {
      await enviar(datos);
      return true;
    } catch (error) {
      if (error instanceof ValidacionError) {
        estado.error = error.message;
        return false;
      }
      throw error;
    } finally {
      // Se ejecuta siempre: tras el return, tras el catch y aunque se relance el error.
      estado.enviando = false;
    }
  }

  return { estado, guardar };
}
`,
    },
    hints: [
      "¿En cuántos caminos de guardar se vuelve a poner enviando en false? Cuenta los return y el throw.",
      "Lo que tiene que pasar siempre va en un bloque finally.",
    ],
  },
  {
    id: "bug-onboarding-generador-agotado",
    title: "#C11 · El onboarding sale vacío la segunda vez",
    level: "avanzado",
    moduleId: "m03",
    lessonId: L.colecciones,
    report: {
      reportedBy: "Producto · Nerea",
      where: "Home › <OnboardingModal />",
      steps: ["Abre el modal de bienvenida: se ven los 3 pasos.", "Ciérralo y ábrelo otra vez desde «Ayuda»."],
      actual: "La segunda vez el modal no tiene pasos. Si antes se pinta el banner con el primer paso, el modal sale vacío desde el principio.",
      expected: "Cada vez que se recorren los pasos salen los 3, en orden, y primerPaso() siempre devuelve «Bienvenida».",
    },
    concepts: ["js.iteradores-generadores", "js.modulos"],
    instructions:
      "Producto: el modal de onboarding muestra los pasos solo la primera vez que se abre. Si el banner de la home usa primerPaso() antes, el modal ya sale vacío. Los pasos vienen de un generador exportado por onboarding.js.",
    starter: {
      "/onboarding.js": `function* generarPasos() {
  yield "Bienvenida";
  yield "Elige tu nivel";
  yield "Conecta GitHub";
}

// Lo importan el banner y el modal.
export const pasos = generarPasos();

export function titulosDelModal() {
  return [...pasos];
}

export function primerPaso() {
  for (const paso of pasos) return paso;
}
`,
    },
    tests: {
      "/onboarding.test.js": `import { pasos, titulosDelModal, primerPaso } from "./onboarding";

const TODOS = ["Bienvenida", "Elige tu nivel", "Conecta GitHub"];

test("el banner muestra el primer paso", () => {
  expect(primerPaso()).toBe("Bienvenida");
});

test("el modal muestra todos los pasos aunque el banner ya los leyera", () => {
  primerPaso();
  expect(titulosDelModal()).toEqual(TODOS);
});

test("abrir el modal dos veces muestra lo mismo", () => {
  expect(titulosDelModal()).toEqual(TODOS);
  expect(titulosDelModal()).toEqual(TODOS);
});

test("pasos se puede recorrer varias veces", () => {
  expect([...pasos]).toEqual(TODOS);
  expect([...pasos]).toEqual(TODOS);
});
`,
    },
    solution: {
      "/onboarding.js": `// Un iterable (no un iterador): cada for...of o spread pide un generador nuevo.
export const pasos = {
  *[Symbol.iterator]() {
    yield "Bienvenida";
    yield "Elige tu nivel";
    yield "Conecta GitHub";
  },
};

export function titulosDelModal() {
  return [...pasos];
}

export function primerPaso() {
  for (const paso of pasos) return paso;
}
`,
    },
    hints: [
      "Un objeto generador solo se puede recorrer una vez, y salir de un for...of con return lo cierra.",
      "Exporta algo con un método [Symbol.iterator] que cree un generador nuevo en cada recorrido.",
    ],
  },
  {
    id: "bug-medicion-pierde-this",
    title: "#C12 · Activar la medición de rendimiento rompe el carrito",
    level: "avanzado",
    moduleId: "m03",
    lessonId: L.this,
    report: {
      reportedBy: "Frontend · Andrés",
      where: "Carrito › panel de rendimiento",
      steps: ["Activa la medición de rendimiento.", "Añade un producto al carrito."],
      actual: "TypeError: Cannot read properties of undefined (reading 'items'). Sin la medición, el carrito funciona.",
      expected: "Los métodos medidos se comportan igual que los originales (mismo this, mismos argumentos y mismo valor devuelto) y se registra cada llamada.",
    },
    concepts: ["js.this", "js.call-apply-bind", "js.prototipos"],
    instructions:
      "Frontend: conMedicion envuelve métodos del prototipo para contar cuántas veces se llaman. Desde que lo activamos en Carrito, agregar y total lanzan un TypeError. carrito.js está bien; el problema está en el envoltorio.",
    starter: {
      "/medicion.js": `export const mediciones = [];

// Envuelve una función para registrar cada llamada.
export function conMedicion(nombre, fn) {
  return (...args) => {
    mediciones.push(nombre);
    return fn(...args);
  };
}
`,
      "/carrito.js": `import { conMedicion } from "./medicion";

export class Carrito {
  constructor() {
    this.items = [];
  }

  agregar(item) {
    this.items.push(item);
    return this;
  }

  total() {
    return this.items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  }
}

Carrito.prototype.agregar = conMedicion("Carrito.agregar", Carrito.prototype.agregar);
Carrito.prototype.total = conMedicion("Carrito.total", Carrito.prototype.total);
`,
    },
    tests: {
      "/carrito.test.js": `import { Carrito } from "./carrito";
import { conMedicion, mediciones } from "./medicion";

test("el carrito sigue funcionando", () => {
  const carrito = new Carrito();
  carrito.agregar({ precio: 10, cantidad: 2 }).agregar({ precio: 5, cantidad: 1 });
  expect(carrito.total()).toBe(25);
});

test("se registran las llamadas", () => {
  new Carrito().agregar({ precio: 1, cantidad: 1 }).total();
  expect(mediciones).toContain("Carrito.agregar");
  expect(mediciones).toContain("Carrito.total");
});

test("conMedicion respeta el this y los argumentos", () => {
  const contador = {
    valor: 2,
    sumar: conMedicion("sumar", function (a, b) {
      return this.valor + a + b;
    }),
  };
  expect(contador.sumar(3, 4)).toBe(9);
});
`,
    },
    solution: {
      "/medicion.js": `export const mediciones = [];

// Una function normal recibe el this de la llamada; apply se lo pasa a fn.
export function conMedicion(nombre, fn) {
  return function (...args) {
    mediciones.push(nombre);
    return fn.apply(this, args);
  };
}
`,
      "/carrito.js": `import { conMedicion } from "./medicion";

export class Carrito {
  constructor() {
    this.items = [];
  }

  agregar(item) {
    this.items.push(item);
    return this;
  }

  total() {
    return this.items.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  }
}

Carrito.prototype.agregar = conMedicion("Carrito.agregar", Carrito.prototype.agregar);
Carrito.prototype.total = conMedicion("Carrito.total", Carrito.prototype.total);
`,
    },
    hints: [
      "fn(...args) llama a fn sin nada a la izquierda del punto: ¿qué this recibe?",
      "Una arrow function no tiene this propio. Usa function (...args) y fn.apply(this, args) (o fn.call(this, ...args)).",
    ],
  },
  {
    id: "bug-editor-atajo-stale",
    title: "#C13 · Ctrl+S guarda versiones vacías del borrador",
    level: "avanzado",
    moduleId: "m03",
    lessonId: L.closures,
    report: {
      reportedBy: "QA · Lucía",
      where: "Editor de notas › atajo Ctrl+S",
      steps: ["Escribe «Hola» y pulsa Ctrl+S.", "Escribe «Hola mundo» y pulsa Ctrl+S.", "Abre el historial de versiones."],
      actual: "El historial está vacío: Ctrl+S no guarda nada. Con el botón «Guardar» sí funciona.",
      expected: "El historial tiene «Hola» y «Hola mundo», en ese orden. Un borrador vacío no se guarda. Solo hay una suscripción al teclado.",
    },
    concepts: ["js.closures"],
    instructions:
      "QA: el atajo Ctrl+S del editor no guarda el texto que hay escrito. El componente se suscribe al teclado una sola vez, al montar (no queremos volver a suscribirnos en cada tecla). Para los tests usamos un React en miniatura (mini-react.js) con useState, useRef y useMountEffect.",
    starter: {
      "/Editor.js": `export function Editor({ useState, useMountEffect, teclado }) {
  const [texto, setTexto] = useState("");
  const [versiones, setVersiones] = useState([]);

  // Nos suscribimos una sola vez, al montar.
  useMountEffect(() => {
    teclado.on("ctrl+s", () => {
      if (texto.trim() === "") return;
      setVersiones([...versiones, texto]);
    });
  });

  return { texto, versiones, escribir: setTexto };
}
`,
    },
    tests: {
      "/mini-react.js": miniReact,
      "/Editor.test.js": `import { montar } from "./mini-react";
import { Editor } from "./Editor";

function tecladoFalso() {
  const handlers = [];
  return {
    handlers,
    on: (atajo, fn) => handlers.push({ atajo, fn }),
    pulsar: (atajo) => handlers.filter((h) => h.atajo === atajo).forEach((h) => h.fn()),
  };
}

test("Ctrl+S guarda el texto actual cada vez", () => {
  const teclado = tecladoFalso();
  const app = montar(Editor, { teclado });
  app.salida().escribir("Hola");
  teclado.pulsar("ctrl+s");
  app.salida().escribir("Hola mundo");
  teclado.pulsar("ctrl+s");
  expect(app.salida().versiones).toEqual(["Hola", "Hola mundo"]);
});

test("no guarda borradores vacíos", () => {
  const teclado = tecladoFalso();
  const app = montar(Editor, { teclado });
  teclado.pulsar("ctrl+s");
  expect(app.salida().versiones).toEqual([]);
});

test("solo se suscribe una vez", () => {
  const teclado = tecladoFalso();
  const app = montar(Editor, { teclado });
  app.salida().escribir("a");
  app.salida().escribir("ab");
  expect(teclado.handlers).toHaveLength(1);
});
`,
    },
    solution: {
      "/Editor.js": `export function Editor({ useState, useRef, useMountEffect, teclado }) {
  const [texto, setTexto] = useState("");
  const [versiones, setVersiones] = useState([]);

  // El ref es el mismo objeto en todos los renders: guarda siempre el texto más reciente.
  const textoRef = useRef(texto);
  textoRef.current = texto;

  useMountEffect(() => {
    teclado.on("ctrl+s", () => {
      const actual = textoRef.current;
      if (actual.trim() === "") return;
      setVersiones((anteriores) => [...anteriores, actual]);
    });
  });

  return { texto, versiones, escribir: setTexto };
}
`,
    },
    hints: [
      "El handler de Ctrl+S se creó en el primer render: texto y versiones son los de ese render para siempre.",
      "Guarda el texto actual en un ref (textoRef.current = texto en cada render) y usa la forma funcional de setVersiones.",
    ],
  },
];
