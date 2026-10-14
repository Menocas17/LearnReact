import type { ExerciseDef } from "@/content/types";

const productListStarter = `/** Pasa a minúsculas y quita tildes: "Café" → "cafe". Ya está hecha. */
export function normalizeText(text) {
  return text.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
}

export function prepareProductList(
  products,
  { search = "", category = "todas", sortBy = "name" } = {},
) {
  // Tu código aquí: filtra, busca y ordena SIN mutar products
  return products;
}
`;

export const prepararLista: ExerciseDef = {
  id: "arrays-metodos-preparar-lista",
  title: "Lista de productos: filtrar, buscar y ordenar",
  concepts: ["js.metodos-array"],
  instructions:
    "Implementa prepareProductList(products, { search, category, sortBy }), la función que usaría un componente para pintar un catálogo. Devuelve un array nuevo con los productos que: (1) pertenecen a category (si category es \"todas\", no se filtra por categoría); (2) contienen search en su name, sin distinguir mayúsculas ni tildes e ignorando espacios al principio y al final (usa la función normalizeText que ya está hecha). Ordénalos según sortBy: \"name\" (alfabético en español, con localeCompare y \"es\"), \"price-asc\" o \"price-desc\". Si dos productos empatan en precio, conservan el orden original. No mutes el array recibido.",
  starter: {
    "/productos.js": productListStarter,
  },
  tests: {
    "/productos.test.js": `import { prepareProductList } from "./productos";

const products = [
  { id: 1, name: "Té verde", category: "bebidas", price: 4 },
  { id: 2, name: "café", category: "bebidas", price: 3 },
  { id: 3, name: "Arroz", category: "despensa", price: 2 },
  { id: 4, name: "Ñoquis", category: "despensa", price: 3 },
  { id: 5, name: "Álbum", category: "papelería", price: 12 },
  { id: 6, name: "Nueces", category: "despensa", price: 6 },
];
const ids = (list) => list.map((p) => p.id);

describe("prepareProductList", () => {
  test("sin opciones devuelve todo ordenado por nombre en español", () => {
    expect(ids(prepareProductList(products))).toEqual([5, 3, 2, 6, 4, 1]);
  });

  test("filtra por categoría", () => {
    expect(ids(prepareProductList(products, { category: "despensa" }))).toEqual([3, 6, 4]);
  });

  test("busca sin distinguir mayúsculas ni tildes", () => {
    expect(ids(prepareProductList(products, { search: "CAFE" }))).toEqual([2]);
    expect(ids(prepareProductList(products, { search: "  té " }))).toEqual([1]);
    expect(ids(prepareProductList(products, { search: "noq" }))).toEqual([4]);
  });

  test("ordena por precio ascendente conservando el orden en empates", () => {
    expect(ids(prepareProductList(products, { sortBy: "price-asc" }))).toEqual([3, 2, 4, 1, 6, 5]);
  });

  test("ordena por precio descendente conservando el orden en empates", () => {
    expect(ids(prepareProductList(products, { sortBy: "price-desc" }))).toEqual([5, 6, 1, 2, 4, 3]);
  });

  test("combina categoría, búsqueda y orden", () => {
    const result = prepareProductList(products, { category: "despensa", search: "o", sortBy: "price-desc" });
    expect(ids(result)).toEqual([4, 3]);
  });

  test("devuelve [] si nada coincide", () => {
    expect(prepareProductList(products, { search: "pizza" })).toEqual([]);
  });

  test("no muta el array recibido", () => {
    const before = JSON.stringify(products);
    const result = prepareProductList(products, { sortBy: "price-asc" });
    expect(JSON.stringify(products)).toBe(before);
    expect(result).not.toBe(products);
  });
});
`,
  },
  solution: {
    "/productos.js": `/** Pasa a minúsculas y quita tildes: "Café" → "cafe". Ya está hecha. */
export function normalizeText(text) {
  return text.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").toLowerCase();
}

const comparators = {
  name: (a, b) => a.name.localeCompare(b.name, "es"),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
};

export function prepareProductList(
  products,
  { search = "", category = "todas", sortBy = "name" } = {},
) {
  const query = normalizeText(search.trim());

  return products
    .filter((p) => category === "todas" || p.category === category)
    .filter((p) => normalizeText(p.name).includes(query))
    .toSorted(comparators[sortBy]);
}
`,
  },
  hints: [
    "Encadena dos filter (categoría y búsqueda) y termina con toSorted. filter ya devuelve un array nuevo, así que después podrías usar sort sin mutar products, pero toSorted deja la intención clara.",
    "Normaliza las dos partes de la comparación: normalizeText(p.name).includes(normalizeText(search.trim())). Un string vacío está incluido en cualquier string, así que search = \"\" no filtra nada.",
    "No hace falta nada especial para los empates: sort y toSorted son estables desde ES2019. Basta con un comparador que devuelva 0 cuando los precios son iguales, como a.price - b.price.",
  ],
};

export const resumenPedidos: ExerciseDef = {
  id: "arrays-metodos-resumen-pedidos",
  title: "Resumen de pedidos",
  concepts: ["js.metodos-array"],
  instructions:
    "Implementa summarizeOrders(orders). Cada pedido tiene la forma { id, customer, items: [{ product, qty, price }] }. Devuelve un objeto con: totalByCustomer (objeto cliente → suma de qty × price de todos sus pedidos), topProduct (el producto con más unidades vendidas en total; si hay empate, el que apareció primero; null si no hay ventas) y averageOrder (importe medio por pedido; 0 si no hay pedidos). No mutes la entrada.",
  starter: {
    "/pedidos.js": `export function summarizeOrders(orders) {
  // Tu código aquí
  return { totalByCustomer: {}, topProduct: null, averageOrder: 0 };
}
`,
  },
  tests: {
    "/pedidos.test.js": `import { summarizeOrders } from "./pedidos";

const orders = [
  { id: 1, customer: "ana", items: [{ product: "café", qty: 2, price: 3 }, { product: "pan", qty: 1, price: 2 }] },
  { id: 2, customer: "luis", items: [{ product: "té", qty: 2, price: 4 }] },
  { id: 3, customer: "ana", items: [{ product: "café", qty: 1, price: 3 }, { product: "té", qty: 1, price: 4 }] },
  { id: 4, customer: "eva", items: [] },
];

describe("summarizeOrders", () => {
  test("suma el importe por cliente", () => {
    expect(summarizeOrders(orders).totalByCustomer).toEqual({ ana: 15, luis: 8, eva: 0 });
  });

  test("calcula el importe medio por pedido", () => {
    expect(summarizeOrders(orders).averageOrder).toBeCloseTo(5.75);
  });

  test("elige el producto con más unidades (empate: el primero en aparecer)", () => {
    expect(summarizeOrders(orders).topProduct).toBe("café");
  });

  test("el producto más vendido se decide por unidades, no por importe", () => {
    const result = summarizeOrders([
      { id: 1, customer: "ana", items: [{ product: "jamón", qty: 1, price: 50 }, { product: "pan", qty: 4, price: 1 }] },
    ]);
    expect(result.topProduct).toBe("pan");
  });

  test("sin pedidos devuelve valores vacíos sin lanzar errores", () => {
    expect(summarizeOrders([])).toEqual({ totalByCustomer: {}, topProduct: null, averageOrder: 0 });
  });

  test("no muta la entrada", () => {
    const before = JSON.stringify(orders);
    summarizeOrders(orders);
    expect(JSON.stringify(orders)).toBe(before);
  });
});
`,
  },
  solution: {
    "/pedidos.js": `const orderTotal = (order) =>
  order.items.reduce((sum, item) => sum + item.qty * item.price, 0);

export function summarizeOrders(orders) {
  const totalByCustomer = orders.reduce((acc, order) => {
    acc[order.customer] = (acc[order.customer] ?? 0) + orderTotal(order);
    return acc;
  }, {});

  // Un Map conserva el orden de inserción: sirve para desempatar.
  const unitsByProduct = orders
    .flatMap((order) => order.items)
    .reduce(
      (map, item) => map.set(item.product, (map.get(item.product) ?? 0) + item.qty),
      new Map(),
    );

  let topProduct = null;
  let topUnits = 0;
  for (const [product, units] of unitsByProduct) {
    if (units > topUnits) {
      topProduct = product;
      topUnits = units;
    }
  }

  const grandTotal = orders.reduce((sum, order) => sum + orderTotal(order), 0);
  const averageOrder = orders.length === 0 ? 0 : grandTotal / orders.length;

  return { totalByCustomer, topProduct, averageOrder };
}
`,
  },
  hints: [
    "Separa el problema: una función orderTotal(order) que sume los items de un pedido con reduce, y luego úsala para totalByCustomer y para el total general.",
    "Para contar unidades por producto, aplana primero todos los items con flatMap y acumula en un Map (o en un objeto) con reduce. Recuerda pasar siempre el valor inicial: con orders = [] el reduce sin inicial lanza TypeError.",
    "Para el máximo con desempate, recorre las entradas en orden de inserción y solo reemplaza al líder si las unidades son estrictamente mayores (>), no mayores o iguales.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [prepararLista, resumenPedidos];
