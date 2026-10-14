import type { ExerciseDef } from "@/content/types";

const carrito: ExerciseDef = {
  id: "json-carrito-persistente",
  title: "Guardar y recuperar el carrito",
  concepts: ["js.json", "js.objetos"],
  instructions:
    "Implementa saveCart(storage, cart) y loadCart(storage). storage es un objeto con getItem(key) y setItem(key, value) que, como localStorage, solo guarda strings y devuelve null si la clave no existe. Usa la clave \"cart\". loadCart debe devolver las fechas como Date (cualquier propiedad cuyo nombre termine en \"At\" y cuyo valor sea un string) y, si no hay nada guardado o los datos están corruptos, devolver { items: [], updatedAt: null }.",
  starter: {
    "/cart.js": `export function saveCart(storage, cart) {
  storage.setItem("cart", cart);
}

export function loadCart(storage) {
  return JSON.parse(storage.getItem("cart"));
}
`,
  },
  tests: {
    "/cart.test.js": `import { saveCart, loadCart } from "./cart";

function createStorage(initial = {}) {
  const data = { ...initial };
  return {
    getItem: (key) => (Object.hasOwn(data, key) ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
  };
}

const sample = () => ({
  items: [{ id: "p1", qty: 2, addedAt: new Date("2026-01-02T10:00:00.000Z") }],
  updatedAt: new Date("2026-01-03T12:30:00.000Z"),
});

describe("saveCart / loadCart", () => {
  test("guarda JSON válido, no [object Object]", () => {
    const storage = createStorage();
    saveCart(storage, sample());
    const raw = storage.getItem("cart");
    expect(raw).not.toBe("[object Object]");
    expect(JSON.parse(raw).items[0].id).toBe("p1");
  });

  test("recupera los datos", () => {
    const storage = createStorage();
    saveCart(storage, sample());
    const cart = loadCart(storage);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].qty).toBe(2);
  });

  test("revive las fechas, también las anidadas", () => {
    const storage = createStorage();
    saveCart(storage, sample());
    const cart = loadCart(storage);
    expect(cart.updatedAt instanceof Date).toBe(true);
    expect(cart.updatedAt.getTime()).toBe(Date.parse("2026-01-03T12:30:00.000Z"));
    expect(cart.items[0].addedAt instanceof Date).toBe(true);
  });

  test("no convierte en Date lo que no es un string", () => {
    const storage = createStorage();
    saveCart(storage, { items: [], updatedAt: null });
    expect(loadCart(storage)).toEqual({ items: [], updatedAt: null });
  });

  test("sin datos guardados devuelve el carrito vacío", () => {
    expect(loadCart(createStorage())).toEqual({ items: [], updatedAt: null });
  });

  test("con datos corruptos devuelve el carrito vacío", () => {
    const storage = createStorage({ cart: "[object Object]" });
    expect(loadCart(storage)).toEqual({ items: [], updatedAt: null });
  });

  test("devuelve un carrito vacío nuevo en cada llamada", () => {
    const a = loadCart(createStorage());
    const b = loadCart(createStorage());
    a.items.push("x");
    expect(b.items).toEqual([]);
  });
});
`,
  },
  solution: {
    "/cart.js": `const KEY = "cart";

function emptyCart() {
  return { items: [], updatedAt: null };
}

function reviveDates(key, value) {
  if (key.endsWith("At") && typeof value === "string") return new Date(value);
  return value;
}

export function saveCart(storage, cart) {
  storage.setItem(KEY, JSON.stringify(cart));
}

export function loadCart(storage) {
  const raw = storage.getItem(KEY);
  if (raw === null) return emptyCart();
  try {
    return JSON.parse(raw, reviveDates);
  } catch (error) {
    if (error instanceof SyntaxError) return emptyCart();
    throw error;
  }
}
`,
  },
  hints: [
    "setItem convierte lo que le pases en string con String(value): un objeto se convierte en \"[object Object]\". Serialízalo tú antes con JSON.stringify.",
    "JSON.parse acepta un segundo argumento (reviver) que se llama con cada par clave/valor, también en los niveles anidados. Lo que devuelvas sustituye al valor.",
    "JSON.parse lanza SyntaxError con datos inválidos: envuélvelo en try/catch. Ojo: getItem devuelve null si la clave no existe, y JSON.parse(null) devuelve null sin lanzar.",
  ],
};

const sinMutar: ExerciseDef = {
  id: "arrays-sin-mutar",
  title: "Utilidades de array que no mutan",
  concepts: ["js.arrays"],
  instructions:
    "Este código funciona, pero muta el array que recibe (si fuera el estado de React, el componente no se volvería a renderizar). Reescribe removeAt(list, index), moveItem(list, from, to) y replaceAt(list, index, value) para que devuelvan siempre un array nuevo sin tocar el original. removeAt y replaceAt aceptan índices negativos (contando desde el final, como at). removeAt con un índice fuera de rango devuelve una copia sin cambios; replaceAt con un índice fuera de rango lanza RangeError.",
  starter: {
    "/list.js": `export function removeAt(list, index) {
  list.splice(index, 1);
  return list;
}

export function moveItem(list, from, to) {
  const [item] = list.splice(from, 1);
  list.splice(to, 0, item);
  return list;
}

export function replaceAt(list, index, value) {
  list[index] = value;
  return list;
}
`,
  },
  tests: {
    "/list.test.js": `import { removeAt, moveItem, replaceAt } from "./list";

const frozen = (...items) => Object.freeze(items);

describe("removeAt", () => {
  test("elimina sin mutar", () => {
    const list = frozen("a", "b", "c");
    const result = removeAt(list, 1);
    expect(result).toEqual(["a", "c"]);
    expect(list).toEqual(["a", "b", "c"]);
  });

  test("acepta índices negativos", () => {
    expect(removeAt(frozen("a", "b", "c"), -1)).toEqual(["a", "b"]);
  });

  test("fuera de rango devuelve una copia sin cambios", () => {
    const list = frozen("a", "b");
    const result = removeAt(list, 5);
    expect(result).toEqual(["a", "b"]);
    expect(result).not.toBe(list);
    expect(removeAt(list, -3)).toEqual(["a", "b"]);
  });
});

describe("moveItem", () => {
  test("mueve hacia delante y hacia atrás", () => {
    const list = frozen("a", "b", "c", "d");
    expect(moveItem(list, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(moveItem(list, 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(list).toEqual(["a", "b", "c", "d"]);
  });

  test("devuelve un array nuevo aunque no cambie nada", () => {
    const list = frozen("a", "b");
    const result = moveItem(list, 1, 1);
    expect(result).toEqual(["a", "b"]);
    expect(result).not.toBe(list);
  });
});

describe("replaceAt", () => {
  test("reemplaza sin mutar, también con índices negativos", () => {
    const list = frozen(1, 2, 3);
    expect(replaceAt(list, 0, 10)).toEqual([10, 2, 3]);
    expect(replaceAt(list, -1, 30)).toEqual([1, 2, 30]);
    expect(list).toEqual([1, 2, 3]);
  });

  test("fuera de rango lanza RangeError", () => {
    expect(() => replaceAt(frozen(1, 2), 2, 0)).toThrow(RangeError);
  });
});
`,
  },
  solution: {
    "/list.js": `export function removeAt(list, index) {
  if (index >= list.length || index < -list.length) return list.slice();
  return list.toSpliced(index, 1);
}

export function moveItem(list, from, to) {
  const item = list[from];
  return list.toSpliced(from, 1).toSpliced(to, 0, item);
}

export function replaceAt(list, index, value) {
  return list.with(index, value);
}
`,
  },
  hints: [
    "Cada método que muta tiene una versión que devuelve una copia: splice → toSpliced, arr[i] = x → with(i, x), sort → toSorted.",
    "with ya lanza RangeError con índices fuera de rango y acepta negativos. toSpliced, en cambio, ajusta el índice al rango: toSpliced(-10, 1) eliminaría el primero. Comprueba el rango antes.",
    "Para moveItem, guarda el elemento, quítalo con toSpliced y vuelve a insertarlo con otro toSpliced (deleteCount 0).",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [carrito, sinMutar];
