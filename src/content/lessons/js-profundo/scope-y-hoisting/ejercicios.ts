import type { ExerciseDef } from "@/content/types";

const resumenPedidos: ExerciseDef = {
  id: "scope-resumen-pedidos",
  title: "Arregla el resumen de pedidos",
  concepts: ["js.scope", "js.hoisting-tdz"],
  instructions:
    "resumirPedidos(pedidos, cupon) debe devolver { pedidos, total }: pedidos es un array { id, subtotal } con los pedidos que tienen al menos un item (subtotal = suma de precio * cantidad), y total es la suma de todos los subtotales. Si se pasa un cupón { porcentaje }, se descuenta ese porcentaje del total; sin cupón no hay descuento. El código tiene dos bugs causados por var. Arréglalos usando let/const, sin cambiar la firma de la función.",
  starter: {
    "/pedidos.js": `function sumar(items) {
  var suma = 0;
  for (var i = 0; i < items.length; i++) {
    suma += items[i].precio * items[i].cantidad;
  }
  return suma;
}

export function resumirPedidos(pedidos, cupon) {
  var total = 0;
  var resumen = [];

  for (var i = 0; i < pedidos.length; i++) {
    var pedido = pedidos[i];
    if (pedido.items.length > 0) {
      var total = sumar(pedido.items); // el total de este pedido
      resumen.push({ id: pedido.id, subtotal: total });
    }
  }

  for (var i = 0; i < resumen.length; i++) {
    total += resumen[i].subtotal;
  }

  if (cupon) {
    var descuento = cupon.porcentaje / 100;
  }

  return { pedidos: resumen, total: total * (1 - descuento) };
}
`,
  },
  tests: {
    "/pedidos.test.js": `import { resumirPedidos } from "./pedidos";

const pedidos = [
  { id: "a", items: [{ precio: 10, cantidad: 2 }] },
  { id: "b", items: [] },
  { id: "c", items: [{ precio: 5, cantidad: 1 }, { precio: 1, cantidad: 3 }] },
];

describe("resumirPedidos", () => {
  test("calcula el subtotal de cada pedido con items", () => {
    expect(resumirPedidos(pedidos).pedidos).toEqual([
      { id: "a", subtotal: 20 },
      { id: "c", subtotal: 8 },
    ]);
  });

  test("el total es la suma de los subtotales", () => {
    expect(resumirPedidos(pedidos).total).toBe(28);
  });

  test("aplica el cupón", () => {
    expect(resumirPedidos(pedidos, { porcentaje: 25 }).total).toBe(21);
  });

  test("sin pedidos el total es 0", () => {
    expect(resumirPedidos([])).toEqual({ pedidos: [], total: 0 });
  });
});
`,
  },
  solution: {
    "/pedidos.js": `function sumar(items) {
  let suma = 0;
  for (let i = 0; i < items.length; i++) {
    suma += items[i].precio * items[i].cantidad;
  }
  return suma;
}

export function resumirPedidos(pedidos, cupon) {
  let total = 0;
  const resumen = [];

  for (let i = 0; i < pedidos.length; i++) {
    const pedido = pedidos[i];
    if (pedido.items.length > 0) {
      const subtotal = sumar(pedido.items);
      resumen.push({ id: pedido.id, subtotal });
    }
  }

  for (let i = 0; i < resumen.length; i++) {
    total += resumen[i].subtotal;
  }

  let descuento = 0;
  if (cupon) {
    descuento = cupon.porcentaje / 100;
  }

  return { pedidos: resumen, total: total * (1 - descuento) };
}
`,
  },
  hints: [
    "var tiene scope de función: el var total de dentro del if no es una variable nueva, es el mismo total de arriba. ¿Qué valor tiene total cuando empieza el segundo bucle?",
    "Dale al total de cada pedido su propia variable de bloque (const subtotal dentro del if). Si la llamas también total con let, funciona por shadowing, pero un nombre distinto se lee mejor.",
    "Sin cupón, descuento existe (var se eleva) pero vale undefined, y 1 - undefined es NaN. Declara descuento con let y un valor inicial de 0 antes del if.",
  ],
};

const ordenDeInicializacion: ExerciseDef = {
  id: "scope-orden-de-inicializacion",
  title: "Un módulo que falla al importarse",
  concepts: ["js.hoisting-tdz"],
  instructions:
    "Este módulo de temas lanza \"ReferenceError: Cannot access ... before initialization\" en cuanto alguien lo importa, así que ningún test llega a ejecutarse. Arréglalo para que temaInicial sea el tema \"claro\" y crearTema(nombre) devuelva { nombre, fondo, texto } o lance Error(\"Tema desconocido: \" + nombre). Mantén los mismos exports.",
  starter: {
    "/tema.js": `export const temaInicial = crearTema("claro");

const paletas = {
  claro: { fondo: "#fff", texto: "#111" },
  oscuro: { fondo: "#111", texto: "#eee" },
};

export const crearTema = (nombre) => {
  const paleta = paletas[nombre];
  if (!paleta) throw new Error("Tema desconocido: " + nombre);
  return { nombre, ...paleta };
};
`,
  },
  tests: {
    "/tema.test.js": `import { temaInicial, crearTema } from "./tema";

describe("tema", () => {
  test("temaInicial es el tema claro", () => {
    expect(temaInicial).toEqual({ nombre: "claro", fondo: "#fff", texto: "#111" });
  });

  test("crearTema devuelve el tema pedido", () => {
    expect(crearTema("oscuro")).toEqual({ nombre: "oscuro", fondo: "#111", texto: "#eee" });
  });

  test("crearTema lanza con un tema desconocido", () => {
    expect(() => crearTema("sepia")).toThrow("Tema desconocido: sepia");
  });
});
`,
  },
  solution: {
    "/tema.js": `const paletas = {
  claro: { fondo: "#fff", texto: "#111" },
  oscuro: { fondo: "#111", texto: "#eee" },
};

export function crearTema(nombre) {
  const paleta = paletas[nombre];
  if (!paleta) throw new Error("Tema desconocido: " + nombre);
  return { nombre, ...paleta };
}

export const temaInicial = crearTema("claro");
`,
  },
  hints: [
    "Lee el error: ¿qué variable se usa en la primera línea y en qué línea se inicializa? Las const existen desde el inicio del módulo, pero hasta su línea están en la TDZ.",
    "Convertir crearTema en function declaration no basta: la función ya existiría en la línea 1, pero al ejecutarse leería paletas, que sigue en la TDZ.",
    "Ordena el módulo para que cada valor de nivel superior se calcule cuando todo lo que necesita ya está inicializado: primero paletas y crearTema, al final temaInicial.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [resumenPedidos, ordenDeInicializacion];
