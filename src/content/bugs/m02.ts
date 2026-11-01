import type { BugDef } from "../types";

const L = {
  tipos: "js-fundamentos/tipos-y-coercion",
  corto: "js-fundamentos/cortocircuito-y-control",
  funciones: "js-fundamentos/variables-y-funciones",
  numeros: "js-fundamentos/strings-numeros-fechas",
  json: "js-fundamentos/objetos-arrays-json",
  metodos: "js-fundamentos/metodos-de-array",
  spread: "js-fundamentos/destructuring-y-spread",
};

/** Bugs del módulo 2, de principiante a avanzado. */
export const bugsM02: readonly BugDef[] = [
  {
    id: "bug-carrito-suma-texto",
    title: "#B01 · El botón + del carrito escribe 21",
    level: "principiante",
    lessonId: L.tipos,
    report: {
      reportedBy: "QA · Lucía",
      where: "Carrito › selector de cantidad",
      steps: ["Añade un producto al carrito.", "Escribe 2 en el campo de cantidad.", "Pulsa el botón +."],
      actual: "La cantidad pasa a \"21\". Si pulsas + otra vez, \"211\".",
      expected: "La cantidad pasa a 3, luego a 4. Un campo vacío y + da 1.",
    },
    concepts: ["js.coercion"],
    instructions:
      "QA: en el carrito escribo 2 en la cantidad, pulso + y aparece 21. Vuelvo a pulsar y sale 211. El botón − funciona bien. El valor llega desde e.target.value.",
    starter: {
      "/cantidad.js": `// value llega tal cual desde el <input>
export function incrementar(value) {
  return value + 1;
}

export function decrementar(value) {
  return value - 1;
}
`,
    },
    tests: {
      "/cantidad.test.js": `import { incrementar, decrementar } from "./cantidad";

test("suma 1 al número escrito", () => {
  expect(incrementar("2")).toBe(3);
  expect(incrementar("10")).toBe(11);
});

test("devuelve siempre un número", () => {
  expect(typeof incrementar("2")).toBe("number");
  expect(decrementar("5")).toBe(4);
});

test("un campo vacío cuenta como 0", () => {
  expect(incrementar("")).toBe(1);
});
`,
    },
    solution: {
      "/cantidad.js": `export function incrementar(value) {
  return Number(value) + 1;
}

export function decrementar(value) {
  return Number(value) - 1;
}
`,
    },
    hints: ["¿De qué tipo es lo que devuelve un input?", "El + con un string concatena; el − siempre convierte a número."],
  },
  {
    id: "bug-badge-cero",
    title: "#B02 · Un 0 suelto en la bandeja de entrada",
    level: "principiante",
    lessonId: L.corto,
    report: {
      reportedBy: "Diseño · Marco",
      where: "Bandeja de entrada › título",
      steps: ["Marca todos los mensajes como leídos.", "Mira el título de la bandeja."],
      actual: "Aparece un \"0\" suelto junto al título.",
      expected: "Sin mensajes nuevos no se pinta nada (badgeText devuelve null). Con 3 mensajes: \"3 nuevos\".",
    },
    concepts: ["js.cortocircuito"],
    instructions:
      "Diseño: cuando no hay mensajes nuevos, junto al título aparece un 0 suelto. El componente pinta {badgeText(count)} y React pinta cualquier número, también el 0. Si no hay mensajes, badgeText debe devolver null.",
    starter: {
      "/badge.js": `export function badgeText(count) {
  return count && \`\${count} nuevos\`;
}
`,
    },
    tests: {
      "/badge.test.js": `import { badgeText } from "./badge";

test("con mensajes devuelve el texto", () => {
  expect(badgeText(3)).toBe("3 nuevos");
});

test("con 0 no pinta nada", () => {
  expect(badgeText(0)).toBeNull();
});

test("sin dato tampoco", () => {
  expect(badgeText(undefined)).toBeNull();
});
`,
    },
    solution: {
      "/badge.js": `export function badgeText(count) {
  return count > 0 ? \`\${count} nuevos\` : null;
}
`,
    },
    hints: ["&& no devuelve true/false: devuelve uno de sus operandos.", "Si count es 0, ¿qué operando devuelve count && …?"],
  },
  {
    id: "bug-timeout-cero",
    title: "#B03 · No puedo desactivar el timeout",
    level: "principiante",
    lessonId: L.corto,
    report: {
      reportedBy: "Backend · Sergio",
      where: "Cliente HTTP › configuración",
      steps: ["Configura { timeout: 0, retries: 0 } para desactivar ambos.", "Lanza una petición lenta que falla."],
      actual: "La petición se corta a los 3000 ms y se reintenta 3 veces.",
      expected: "timeout 0 y retries 0 se respetan. Solo si faltan (undefined o null) se usan 3000 y 3.",
    },
    concepts: ["js.cortocircuito"],
    instructions:
      "Backend: en la configuración ponemos timeout: 0 para desactivarlo, pero el cliente sigue cortando a los 3000 ms. Igual con retries: 0, que acaba en 3 reintentos.",
    starter: {
      "/config.js": `export function resolveConfig(config) {
  return {
    timeout: config.timeout || 3000,
    retries: config.retries || 3,
  };
}
`,
    },
    tests: {
      "/config.test.js": `import { resolveConfig } from "./config";

test("respeta los ceros explícitos", () => {
  expect(resolveConfig({ timeout: 0, retries: 0 })).toEqual({ timeout: 0, retries: 0 });
});

test("usa los valores por defecto si faltan", () => {
  expect(resolveConfig({})).toEqual({ timeout: 3000, retries: 3 });
  expect(resolveConfig({ timeout: null })).toEqual({ timeout: 3000, retries: 3 });
});

test("respeta los valores dados", () => {
  expect(resolveConfig({ timeout: 500, retries: 1 })).toEqual({ timeout: 500, retries: 1 });
});
`,
    },
    solution: {
      "/config.js": `export function resolveConfig(config) {
  return {
    timeout: config.timeout ?? 3000,
    retries: config.retries ?? 3,
  };
}
`,
    },
    hints: ["0 es falsy.", "Hay un operador que solo usa el valor por defecto con null o undefined."],
  },
  {
    id: "bug-switch-query",
    title: "#B04 · ?vista=2 siempre abre la vista por defecto",
    level: "principiante",
    lessonId: L.corto,
    report: {
      reportedBy: "Soporte · Andrea",
      where: "Proyectos › selector de vista",
      steps: ["Abre /proyectos?vista=2.", "Abre /proyectos?vista=3."],
      actual: "Ambos enlaces abren la vista de lista.",
      expected: "?vista=2 abre el tablero, ?vista=3 el calendario y cualquier otro valor la lista.",
    },
    concepts: ["js.control-flujo", "js.coercion"],
    instructions:
      "Soporte: los enlaces con ?vista=2 o ?vista=3 abren siempre la lista. La vista se lee de la URL con URLSearchParams.",
    starter: {
      "/vista.js": `export function vistaDesdeQuery(search) {
  const vista = new URLSearchParams(search).get("vista");
  switch (vista) {
    case 2:
      return "tablero";
    case 3:
      return "calendario";
    default:
      return "lista";
  }
}
`,
    },
    tests: {
      "/vista.test.js": `import { vistaDesdeQuery } from "./vista";

test("abre el tablero con ?vista=2", () => {
  expect(vistaDesdeQuery("?vista=2")).toBe("tablero");
});

test("abre el calendario con ?vista=3", () => {
  expect(vistaDesdeQuery("?vista=3")).toBe("calendario");
});

test("sin parámetro o con uno desconocido abre la lista", () => {
  expect(vistaDesdeQuery("")).toBe("lista");
  expect(vistaDesdeQuery("?vista=9")).toBe("lista");
});
`,
    },
    solution: {
      "/vista.js": `export function vistaDesdeQuery(search) {
  const vista = Number(new URLSearchParams(search).get("vista"));
  switch (vista) {
    case 2:
      return "tablero";
    case 3:
      return "calendario";
    default:
      return "lista";
  }
}
`,
    },
    hints: ["¿Qué tipo devuelve URLSearchParams#get?", "switch compara con ===."],
  },
  {
    id: "bug-map-sin-return",
    title: "#B05 · La lista de tareas sale vacía tras el refactor",
    level: "intermedio",
    lessonId: L.funciones,
    report: {
      reportedBy: "QA · Lucía",
      where: "Tareas › lista",
      steps: ["Despliega la rama del refactor a arrow functions.", "Abre la lista con dos tareas."],
      actual: "La lista sale vacía (etiquetas devuelve [undefined, undefined]). No hay errores en consola.",
      expected: "[\"✓ Comprar pan\", \"○ Llamar a Ana\"]: una etiqueta por tarea.",
    },
    concepts: ["js.funciones"],
    instructions:
      "Tras pasar los callbacks a arrow functions, la lista de tareas se renderiza vacía y no hay ningún error en consola. El componente pinta lo que devuelve etiquetas(tareas).",
    starter: {
      "/tareas.js": `export function etiquetas(tareas) {
  return tareas.map((t) => {
    \`\${t.done ? "✓" : "○"} \${t.title}\`;
  });
}
`,
    },
    tests: {
      "/tareas.test.js": `import { etiquetas } from "./tareas";

test("devuelve una etiqueta por tarea", () => {
  const tareas = [
    { title: "Comprar pan", done: true },
    { title: "Llamar a Ana", done: false },
  ];
  expect(etiquetas(tareas)).toEqual(["✓ Comprar pan", "○ Llamar a Ana"]);
});

test("una lista vacía da una lista vacía", () => {
  expect(etiquetas([])).toEqual([]);
});
`,
    },
    solution: {
      "/tareas.js": `export function etiquetas(tareas) {
  return tareas.map((t) => \`\${t.done ? "✓" : "○"} \${t.title}\`);
}
`,
    },
    hints: ["Con llaves, una arrow function necesita return.", "Sin llaves, devuelve la expresión directamente."],
  },
  {
    id: "bug-total-decimales",
    title: "#B06 · El total del carrito no cuadra",
    level: "intermedio",
    lessonId: L.numeros,
    report: {
      reportedBy: "Finanzas · Patricia",
      where: "Checkout › total",
      steps: ["Añade un producto de 0.10 y otro de 0.20.", "Compara el total con el del backend."],
      actual: "El total es 0.30000000000000004 y la conciliación con el backend (0.3) falla.",
      expected: "totalCarrito([0.1, 0.2]) === 0.3 y totalCarrito([19.99, 5.01, 0.1, 0.2, 0.3]) === 25.6.",
    },
    concepts: ["js.numeros"],
    instructions:
      "Finanzas: un pedido de 0.10 + 0.20 muestra un total de 0.30000000000000004 y la comparación con el total del backend (0.3) falla. Haz que totalCarrito sume en centavos y devuelva el total exacto en unidades.",
    starter: {
      "/total.js": `// precios en unidades (por ejemplo 19.99)
export function totalCarrito(precios) {
  return precios.reduce((suma, precio) => suma + precio, 0);
}
`,
    },
    tests: {
      "/total.test.js": `import { totalCarrito } from "./total";

test("0.1 + 0.2 da exactamente 0.3", () => {
  expect(totalCarrito([0.1, 0.2])).toBe(0.3);
});

test("suma muchos precios sin arrastrar error", () => {
  expect(totalCarrito([19.99, 5.01, 0.1, 0.2, 0.3])).toBe(25.6);
});

test("un carrito vacío vale 0", () => {
  expect(totalCarrito([])).toBe(0);
});
`,
    },
    solution: {
      "/total.js": `export function totalCarrito(precios) {
  const centavos = precios.reduce((suma, precio) => suma + Math.round(precio * 100), 0);
  return centavos / 100;
}
`,
    },
    hints: ["0.1 no tiene representación exacta en binario.", "Convierte cada precio a centavos enteros con Math.round antes de sumar."],
  },
  {
    id: "bug-emoji-limite",
    title: "#B07 · El límite de caracteres rechaza emojis",
    level: "intermedio",
    lessonId: L.numeros,
    report: {
      reportedBy: "Usuaria · vía soporte",
      where: "Notas › límite de caracteres",
      steps: ["Escribe la nota \"ok 👍👍👍\" con un límite de 6.", "Pulsa Guardar."],
      actual: "Error: la nota supera el límite (longitud 9), aunque el contador muestra 6.",
      expected: "longitud(\"ok 👍👍👍\") === 6 y la nota se guarda. Un emoji cuenta como un carácter.",
    },
    concepts: ["js.strings"],
    instructions:
      "Una usuaria no puede guardar la nota \"ok 👍👍👍\" con el límite de 6 caracteres, aunque el contador de la pantalla dice 6. El límite debe contar caracteres visibles (puntos de código), no unidades UTF-16.",
    starter: {
      "/nota.js": `export function longitud(texto) {
  return texto.length;
}

export function cabe(texto, limite) {
  return longitud(texto) <= limite;
}
`,
    },
    tests: {
      "/nota.test.js": `import { longitud, cabe } from "./nota";

test("cuenta cada emoji como uno", () => {
  expect(longitud("👍")).toBe(1);
  expect(longitud("ok 👍👍👍")).toBe(6);
});

test("acepta la nota dentro del límite", () => {
  expect(cabe("ok 👍👍👍", 6)).toBe(true);
  expect(cabe("ok 👍👍👍!", 6)).toBe(false);
});

test("el texto sin emojis sigue igual", () => {
  expect(longitud("hola")).toBe(4);
});
`,
    },
    solution: {
      "/nota.js": `export function longitud(texto) {
  return [...texto].length;
}

export function cabe(texto, limite) {
  return longitud(texto) <= limite;
}
`,
    },
    hints: ["length cuenta unidades UTF-16; un emoji suele ocupar dos.", "Iterar un string (for…of o spread) recorre puntos de código."],
  },
  {
    id: "bug-localstorage-object",
    title: "#B08 · Las preferencias se guardan como [object Object]",
    level: "intermedio",
    lessonId: L.json,
    report: {
      reportedBy: "QA · Lucía",
      where: "Ajustes › preferencias",
      steps: ["Cambia el tema a oscuro y la fuente a 16.", "Recarga la página.", "Inspecciona localStorage."],
      actual: "Las preferencias vuelven a las de por defecto. En localStorage, prefs = \"[object Object]\".",
      expected: "Tras recargar: { tema: \"oscuro\", fuente: 16 }. Sin datos o con datos corruptos: { tema: \"claro\" }.",
    },
    concepts: ["js.json"],
    instructions:
      "Al recargar, las preferencias del usuario se pierden. En localStorage aparece el texto \"[object Object]\". storage es un objeto con la misma API que localStorage (solo guarda strings).",
    starter: {
      "/prefs.js": `export function guardarPrefs(storage, prefs) {
  storage.setItem("prefs", prefs);
}

export function cargarPrefs(storage) {
  const raw = storage.getItem("prefs");
  return raw ?? { tema: "claro" };
}
`,
    },
    tests: {
      "/prefs.test.js": `import { guardarPrefs, cargarPrefs } from "./prefs";

function crearStorage() {
  const datos = new Map();
  return {
    setItem: (k, v) => datos.set(k, String(v)),
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
  };
}

test("lo que se guarda se recupera igual", () => {
  const storage = crearStorage();
  guardarPrefs(storage, { tema: "oscuro", fuente: 16 });
  expect(cargarPrefs(storage)).toEqual({ tema: "oscuro", fuente: 16 });
});

test("sin nada guardado devuelve el valor por defecto", () => {
  expect(cargarPrefs(crearStorage())).toEqual({ tema: "claro" });
});

test("un valor corrupto no rompe la app", () => {
  const storage = crearStorage();
  storage.setItem("prefs", "[object Object]");
  expect(cargarPrefs(storage)).toEqual({ tema: "claro" });
});
`,
    },
    solution: {
      "/prefs.js": `export function guardarPrefs(storage, prefs) {
  storage.setItem("prefs", JSON.stringify(prefs));
}

export function cargarPrefs(storage) {
  const raw = storage.getItem("prefs");
  if (raw === null) return { tema: "claro" };
  try {
    return JSON.parse(raw);
  } catch {
    return { tema: "claro" };
  }
}
`,
    },
    hints: ["localStorage convierte todo a string con String(valor).", "JSON.parse lanza SyntaxError con un texto que no es JSON."],
  },
  {
    id: "bug-json-fechas",
    title: "#B09 · createdAt.getTime is not a function",
    level: "intermedio",
    lessonId: L.json,
    report: {
      reportedBy: "Monitorización (Sentry)",
      where: "Panel de pedidos",
      steps: ["Abre el panel de pedidos con al menos dos pedidos."],
      actual: "TypeError: createdAt.getTime is not a function. El panel no carga.",
      expected: "parsePedidos devuelve los pedidos con createdAt como Date, y masReciente devuelve el pedido 2.",
    },
    concepts: ["js.json", "js.fechas-intl"],
    instructions:
      "El panel de pedidos explota con TypeError: createdAt.getTime is not a function. Los pedidos llegan de la API como JSON (texto). parsePedidos debe devolver los pedidos con createdAt convertido en Date.",
    starter: {
      "/pedidos.js": `export function parsePedidos(json) {
  return JSON.parse(json);
}

export function masReciente(pedidos) {
  return pedidos.reduce((a, b) => (a.createdAt.getTime() >= b.createdAt.getTime() ? a : b));
}
`,
    },
    tests: {
      "/pedidos.test.js": `import { parsePedidos, masReciente } from "./pedidos";

const json = JSON.stringify([
  { id: 1, total: 20, createdAt: new Date("2026-03-01T10:00:00Z") },
  { id: 2, total: 35, createdAt: new Date("2026-03-05T09:30:00Z") },
]);

test("createdAt vuelve a ser una Date", () => {
  const pedidos = parsePedidos(json);
  expect(pedidos[0].createdAt).toBeInstanceOf(Date);
  expect(pedidos[1].createdAt.toISOString()).toBe("2026-03-05T09:30:00.000Z");
});

test("el resto de campos se mantiene", () => {
  expect(parsePedidos(json)[0].total).toBe(20);
});

test("se puede calcular el más reciente", () => {
  expect(masReciente(parsePedidos(json)).id).toBe(2);
});
`,
    },
    solution: {
      "/pedidos.js": `export function parsePedidos(json) {
  return JSON.parse(json).map((p) => ({ ...p, createdAt: new Date(p.createdAt) }));
}

export function masReciente(pedidos) {
  return pedidos.reduce((a, b) => (a.createdAt.getTime() >= b.createdAt.getTime() ? a : b));
}
`,
    },
    hints: ["JSON no tiene tipo fecha: JSON.stringify convierte una Date en un string ISO.", "Después de parsear, vuelve a construir la Date con new Date(texto)."],
  },
  {
    id: "bug-sort-muta-props",
    title: "#B10 · Ordenar el catálogo cambia el panel de al lado",
    level: "avanzado",
    lessonId: L.metodos,
    report: {
      reportedBy: "QA · Marco",
      where: "Catálogo y panel «Recién llegados»",
      steps: ["Abre el catálogo: el panel muestra los productos 5 y 4.", "Pulsa \"Ordenar por precio\"."],
      actual: "El panel lateral pasa a mostrar 4 y 3, sin que nadie llame a setState. A veces el botón de ordenar no hace nada.",
      expected: "El catálogo se ordena (4, 3, 5) y el panel sigue mostrando 5 y 4. ordenarPorPrecio devuelve un array nuevo.",
    },
    concepts: ["js.metodos-array"],
    instructions:
      "El catálogo y el panel \"Recién llegados\" reciben el mismo array products. Cuando el catálogo ordena por precio, el panel deja de mostrar los productos más nuevos, sin ningún setState. Además, el botón de ordenar a veces no hace nada.",
    starter: {
      "/catalogo.js": `export function ordenarPorPrecio(products) {
  return products.sort((a, b) => a.price - b.price);
}

export function recienLlegados(products) {
  return products.slice(0, 2).map((p) => p.id);
}
`,
    },
    tests: {
      "/catalogo.test.js": `import { ordenarPorPrecio, recienLlegados } from "./catalogo";

const crear = () => [
  { id: 5, price: 30 },
  { id: 4, price: 10 },
  { id: 3, price: 20 },
];

test("ordena por precio", () => {
  expect(ordenarPorPrecio(crear()).map((p) => p.id)).toEqual([4, 3, 5]);
});

test("no modifica el array original", () => {
  const products = crear();
  ordenarPorPrecio(products);
  expect(recienLlegados(products)).toEqual([5, 4]);
});

test("devuelve un array nuevo (React necesita otra referencia)", () => {
  const products = crear();
  expect(ordenarPorPrecio(products)).not.toBe(products);
});
`,
    },
    solution: {
      "/catalogo.js": `export function ordenarPorPrecio(products) {
  return products.toSorted((a, b) => a.price - b.price);
}

export function recienLlegados(products) {
  return products.slice(0, 2).map((p) => p.id);
}
`,
    },
    hints: ["sort ordena en el sitio y devuelve el mismo array.", "toSorted (o [...arr].sort) devuelve una copia ordenada."],
  },
  {
    id: "bug-orden-alfabetico",
    title: "#B11 · \"agua\" y \"Ñoquis\" salen después de \"Zumo\"",
    level: "avanzado",
    lessonId: L.metodos,
    report: {
      reportedBy: "Cliente · tienda de Sevilla",
      where: "Catálogo › orden alfabético",
      steps: ["Ordena el catálogo A → Z."],
      actual: "Orden: Nata, Zumo, agua mineral, Ñoquis, óleo.",
      expected: "Orden de diccionario en español: agua mineral, Nata, Ñoquis, óleo, Zumo.",
    },
    concepts: ["js.metodos-array", "js.strings"],
    instructions:
      "El catálogo ordenado alfabéticamente pone las minúsculas y las palabras con Ñ o tilde al final. Debe ordenarse como en un diccionario en español, sin distinguir mayúsculas.",
    starter: {
      "/nombres.js": `export function ordenarNombres(nombres) {
  return [...nombres].sort((a, b) => (a > b ? 1 : -1));
}
`,
    },
    tests: {
      "/nombres.test.js": `import { ordenarNombres } from "./nombres";

test("ordena como un diccionario en español", () => {
  expect(ordenarNombres(["Zumo", "agua mineral", "Ñoquis", "Nata", "óleo"])).toEqual([
    "agua mineral",
    "Nata",
    "Ñoquis",
    "óleo",
    "Zumo",
  ]);
});

test("no distingue mayúsculas", () => {
  expect(ordenarNombres(["banana", "Arroz", "café"])).toEqual(["Arroz", "banana", "café"]);
});

test("no modifica el array original", () => {
  const nombres = ["b", "a"];
  ordenarNombres(nombres);
  expect(nombres).toEqual(["b", "a"]);
});
`,
    },
    solution: {
      "/nombres.js": `const collator = new Intl.Collator("es", { sensitivity: "base" });

export function ordenarNombres(nombres) {
  return [...nombres].sort(collator.compare);
}
`,
    },
    hints: ["< y > comparan unidades de código: \"Z\" (90) va antes que \"a\" (97).", "localeCompare o Intl.Collator(\"es\") ordenan según el idioma."],
  },
  {
    id: "bug-reduce-sin-inicial",
    title: "#B12 · El resumen de ventas muestra [object Object]",
    level: "avanzado",
    lessonId: L.metodos,
    report: {
      reportedBy: "Producto · Elena",
      where: "Dashboard › resumen de ventas",
      steps: ["Abre el dashboard un día con 2 ventas.", "Ábrelo un día sin ventas."],
      actual: "Con ventas: \"Total: [object Object]20\". Sin ventas: TypeError: Reduce of empty array with no initial value.",
      expected: "Con ventas de 10 y 20: 30. Con una de 7: 7. Sin ventas: 0.",
    },
    concepts: ["js.metodos-array"],
    instructions:
      "El dashboard muestra \"Total: [object Object]20\" en lugar del total, y los días sin ventas la página entera se cae con TypeError: Reduce of empty array with no initial value.",
    starter: {
      "/ventas.js": `export function totalVentas(ventas) {
  return ventas.reduce((total, venta) => total + venta.importe);
}
`,
    },
    tests: {
      "/ventas.test.js": `import { totalVentas } from "./ventas";

test("suma los importes", () => {
  expect(totalVentas([{ importe: 10 }, { importe: 20 }])).toBe(30);
});

test("con una sola venta devuelve su importe", () => {
  expect(totalVentas([{ importe: 7 }])).toBe(7);
});

test("sin ventas devuelve 0", () => {
  expect(totalVentas([])).toBe(0);
});
`,
    },
    solution: {
      "/ventas.js": `export function totalVentas(ventas) {
  return ventas.reduce((total, venta) => total + venta.importe, 0);
}
`,
    },
    hints: ["Sin valor inicial, el primer acumulador es el primer elemento (un objeto).", "Pasa 0 como segundo argumento de reduce."],
  },
  {
    id: "bug-classname-spread",
    title: "#B13 · El botón Guardar no ocupa todo el ancho",
    level: "avanzado",
    lessonId: L.spread,
    report: {
      reportedBy: "Diseño · Marco",
      where: "Formulario de perfil › botón Guardar",
      steps: ["Renderiza <Button className=\"w-full\">Guardar</Button>.", "Mueve {...props} al final del objeto y repite."],
      actual: "Primero se pierde w-full; después se pierde \"btn btn-primary\".",
      expected: "className = \"btn btn-primary w-full\". Sin className del padre: \"btn btn-danger\" (sin espacios sobrantes). variant no llega al DOM.",
    },
    concepts: ["js.spread-rest"],
    instructions:
      "<Button className=\"w-full\"> pierde w-full. Si se mueve {...props} al final, se pierde btn en su lugar. buttonProps calcula las props que van al <button>: debe combinar ambas clases.",
    starter: {
      "/button.js": `export function buttonProps({ variant = "primary", ...props }) {
  return {
    ...props,
    className: \`btn btn-\${variant}\`,
  };
}
`,
    },
    tests: {
      "/button.test.js": `import { buttonProps } from "./button";

test("combina las clases propias con las del padre", () => {
  expect(buttonProps({ className: "w-full" }).className).toBe("btn btn-primary w-full");
});

test("sin className del padre no deja espacios sobrantes", () => {
  expect(buttonProps({ variant: "danger" }).className).toBe("btn btn-danger");
});

test("conserva el resto de props y no pasa variant al DOM", () => {
  const props = buttonProps({ type: "submit", disabled: true });
  expect(props.type).toBe("submit");
  expect(props.disabled).toBe(true);
  expect("variant" in props).toBe(false);
});
`,
    },
    solution: {
      "/button.js": `export function buttonProps({ variant = "primary", className = "", ...props }) {
  return {
    ...props,
    className: \`btn btn-\${variant} \${className}\`.trim(),
  };
}
`,
    },
    hints: ["Con spread, la última clave escrita gana.", "Saca className con destructuring y concaténalo a las clases base."],
  },
  {
    id: "bug-default-null",
    title: "#B14 · Avatares de 0 px",
    level: "avanzado",
    lessonId: L.spread,
    report: {
      reportedBy: "QA · Lucía",
      where: "Comentarios › avatar",
      steps: ["Abre un comentario de un usuario sin tamaño de avatar elegido (la API manda size: null)."],
      actual: "El avatar mide 0 × 0 px.",
      expected: "avatarStyle({ size: null }) → { width: 40, height: 40, borderRadius: \"50%\" }.",
    },
    concepts: ["js.destructuring"],
    instructions:
      "Algunos avatares se pintan de 0 × 0. La API manda size: null cuando el usuario no eligió tamaño, y el valor por defecto (40) no se aplica.",
    starter: {
      "/avatar.js": `export function avatarStyle({ size = 40, rounded = true } = {}) {
  return { width: size, height: size, borderRadius: rounded ? "50%" : 0 };
}
`,
    },
    tests: {
      "/avatar.test.js": `import { avatarStyle } from "./avatar";

test("null usa el tamaño por defecto", () => {
  expect(avatarStyle({ size: null })).toEqual({ width: 40, height: 40, borderRadius: "50%" });
});

test("respeta un tamaño explícito", () => {
  expect(avatarStyle({ size: 64, rounded: false })).toEqual({ width: 64, height: 64, borderRadius: 0 });
});

test("funciona sin argumentos", () => {
  expect(avatarStyle().width).toBe(40);
});
`,
    },
    solution: {
      "/avatar.js": `export function avatarStyle({ size, rounded = true } = {}) {
  const px = size ?? 40;
  return { width: px, height: px, borderRadius: rounded ? "50%" : 0 };
}
`,
    },
    hints: ["Los valores por defecto del destructuring solo se aplican con undefined.", "?? cubre null y undefined."],
  },
  {
    id: "bug-copia-superficial",
    title: "#B15 · Cancelar no deshace el cambio de ciudad",
    level: "avanzado",
    lessonId: L.spread,
    report: {
      reportedBy: "Usuario · vía soporte",
      where: "Perfil › editar dirección",
      steps: ["Pulsa Editar.", "Cambia la ciudad de Quito a Lima.", "Pulsa Cancelar."],
      actual: "El perfil muestra Lima: el usuario original también cambió.",
      expected: "El borrador tiene Lima, el usuario original sigue en Quito y address es un objeto nuevo.",
    },
    concepts: ["js.spread-rest", "js.objetos"],
    instructions:
      "En el formulario de perfil, el borrador se crea con una copia del usuario. Si cambias la ciudad y pulsas Cancelar, la ciudad nueva sigue ahí: el usuario original también cambió.",
    starter: {
      "/perfil.js": `export function cambiarCiudad(user, ciudad) {
  const borrador = { ...user };
  borrador.address.city = ciudad;
  return borrador;
}
`,
    },
    tests: {
      "/perfil.test.js": `import { cambiarCiudad } from "./perfil";

const crear = () => ({ name: "Ana", address: { city: "Quito", zip: "170150" } });

test("el borrador tiene la ciudad nueva", () => {
  expect(cambiarCiudad(crear(), "Lima").address).toEqual({ city: "Lima", zip: "170150" });
});

test("el usuario original no cambia", () => {
  const user = crear();
  cambiarCiudad(user, "Lima");
  expect(user.address.city).toBe("Quito");
});

test("crea un objeto address nuevo", () => {
  const user = crear();
  expect(cambiarCiudad(user, "Lima").address).not.toBe(user.address);
});
`,
    },
    solution: {
      "/perfil.js": `export function cambiarCiudad(user, ciudad) {
  return { ...user, address: { ...user.address, city: ciudad } };
}
`,
    },
    hints: ["El spread copia un solo nivel: address sigue siendo el mismo objeto.", "Copia también el nivel que cambias: { ...user, address: { ...user.address, city } }."],
  },
];
