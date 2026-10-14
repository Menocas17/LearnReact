import type { ExerciseDef } from "@/content/types";

const carrito: ExerciseDef = {
  id: "numeros-carrito-centimos",
  title: "Total del carrito en céntimos",
  concepts: ["js.numeros", "js.fechas-intl"],
  instructions:
    "Implementa dos funciones. sumPrices(items) recibe un array de { price, qty } con precios decimales (19.99) y devuelve el total en céntimos como número entero, sin errores de coma flotante. formatPrice(cents, currency, locale) recibe céntimos y devuelve el importe formateado con Intl.NumberFormat en esa moneda y ese locale (por ejemplo 5997, \"USD\", \"en-US\" → \"$59.97\").",
  starter: {
    "/carrito.js": `export function sumPrices(items) {
  // Tu código aquí
}

export function formatPrice(cents, currency, locale) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/carrito.test.js": `import { sumPrices, formatPrice } from "./carrito";

// Intl puede usar espacios especiales (U+00A0, U+202F): los normalizamos.
const plain = (s) => s.replace(/\\s/g, " ");

describe("sumPrices", () => {
  test("0.1 + 0.2 son 30 céntimos exactos", () => {
    expect(sumPrices([{ price: 0.1, qty: 1 }, { price: 0.2, qty: 1 }])).toBe(30);
  });

  test("multiplica por la cantidad", () => {
    expect(sumPrices([{ price: 19.99, qty: 3 }])).toBe(5997);
  });

  test("siempre devuelve un entero", () => {
    const total = sumPrices([
      { price: 1.15, qty: 1 },
      { price: 4.35, qty: 7 },
      { price: 0.07, qty: 3 },
    ]);
    expect(total).toBe(3181);
    expect(Number.isInteger(total)).toBe(true);
  });

  test("un carrito vacío vale 0", () => {
    expect(sumPrices([])).toBe(0);
  });
});

describe("formatPrice", () => {
  test("dólares en en-US", () => {
    expect(formatPrice(5997, "USD", "en-US")).toBe("$59.97");
    expect(formatPrice(123450, "USD", "en-US")).toBe("$1,234.50");
  });

  test("euros en es-ES", () => {
    expect(plain(formatPrice(1999, "EUR", "es-ES"))).toBe("19,99 €");
  });

  test("siempre muestra dos decimales", () => {
    expect(formatPrice(500, "USD", "en-US")).toBe("$5.00");
  });
});
`,
  },
  solution: {
    "/carrito.js": `const toCents = (amount) => Math.round(amount * 100);

export function sumPrices(items) {
  return items.reduce((total, item) => total + toCents(item.price) * item.qty, 0);
}

export function formatPrice(cents, currency, locale) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(cents / 100);
}
`,
  },
  hints: [
    "Convierte cada precio a céntimos en cuanto entra (Math.round(price * 100)) y a partir de ahí suma solo enteros.",
    "No uses toFixed para redondear: devuelve un string y, además, 1.005.toFixed(2) da \"1.00\".",
    "Para formatear: new Intl.NumberFormat(locale, { style: \"currency\", currency }).format(cents / 100). Divide por 100 solo al final, para mostrar.",
  ],
};

const blog: ExerciseDef = {
  id: "strings-slug-fechas-utc",
  title: "Slugs y fechas de un blog",
  concepts: ["js.strings", "js.fechas-intl"],
  instructions:
    "Implementa tres utilidades para un blog. slugify(title): minúsculas, sin acentos (la ñ pasa a n), cualquier grupo de caracteres que no sea letra o número se convierte en un único guion, y sin guiones al principio ni al final. daysBetween(a, b): recibe dos fechas \"YYYY-MM-DD\" y devuelve cuántos días hay de a a b (negativo si b es anterior). addDays(iso, n): devuelve la fecha \"YYYY-MM-DD\" que cae n días después (o antes, si n es negativo). Trabaja siempre en UTC: el resultado no puede depender de la zona horaria de la máquina.",
  starter: {
    "/blog.js": `export function slugify(title) {
  // Tu código aquí
}

export function daysBetween(a, b) {
  // Tu código aquí
}

export function addDays(iso, n) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/blog.test.js": `import { slugify, daysBetween, addDays } from "./blog";

describe("slugify", () => {
  test("minúsculas y guiones", () => {
    expect(slugify("Hola Mundo")).toBe("hola-mundo");
  });

  test("quita acentos y la tilde de la ñ", () => {
    expect(slugify("Año nuevo, canción vieja")).toBe("ano-nuevo-cancion-vieja");
  });

  test("colapsa símbolos y recorta los extremos", () => {
    expect(slugify("  ¡¿Qué es React 19?!  ")).toBe("que-es-react-19");
  });
});

describe("daysBetween", () => {
  test("días dentro del mismo mes", () => {
    expect(daysBetween("2026-10-01", "2026-10-14")).toBe(13);
  });

  test("entero aunque haya un cambio de horario por medio", () => {
    expect(daysBetween("2026-03-01", "2026-04-01")).toBe(31);
    expect(daysBetween("2026-10-20", "2026-11-05")).toBe(16);
  });

  test("años bisiestos y orden inverso", () => {
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
    expect(daysBetween("2027-01-01", "2026-12-25")).toBe(-7);
  });
});

describe("addDays", () => {
  test("cruza meses y años", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });

  test("acepta días negativos", () => {
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });

  test("sumar 0 días devuelve la misma fecha", () => {
    expect(addDays("2026-10-14", 0)).toBe("2026-10-14");
  });
});
`,
  },
  solution: {
    "/blog.js": `export function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DAY_MS = 24 * 60 * 60 * 1000;

// "2026-10-14" (solo fecha) se interpreta como medianoche UTC.
const toUtcMs = (iso) => new Date(iso).getTime();

export function daysBetween(a, b) {
  return Math.round((toUtcMs(b) - toUtcMs(a)) / DAY_MS);
}

export function addDays(iso, n) {
  const date = new Date(toUtcMs(iso));
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}
`,
  },
  hints: [
    "normalize(\"NFD\") separa cada letra acentuada en la letra base más una marca combinable (rango U+0300 a U+036F); elimina esas marcas con replace.",
    "new Date(\"2026-10-14\") ya es medianoche UTC. Lo que rompe en otras zonas es usar getDate()/setDate() (hora local) o construir la fecha con new Date(2026, 9, 14): usa los métodos getUTC*/setUTC* y toISOString().",
    "setUTCDate acepta valores fuera de rango (0, 32, -1…) y desborda al mes anterior o siguiente: deja que Date haga el cálculo del calendario.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [carrito, blog];
