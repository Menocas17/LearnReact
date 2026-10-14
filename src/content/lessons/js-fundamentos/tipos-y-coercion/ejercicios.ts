import type { ExerciseDef } from "@/content/types";

export const typeOfPreciso: ExerciseDef = {
  id: "tipos-typeof-preciso",
  title: "typeOf(value) sin rarezas",
  concepts: ["js.valores-tipos", "js.coercion"],
  instructions:
    "Implementa typeOf(value), un typeof que corrige sus rarezas. Debe devolver \"null\" para null, \"nan\" para NaN, \"array\" para arrays, \"date\" para fechas válidas e \"invalid-date\" para fechas inválidas (new Date(\"hola\")). En el resto de casos devuelve lo mismo que typeof (\"number\", \"string\", \"bigint\", \"function\", \"object\"…). Los wrappers como new String(\"x\") son objetos: devuelve \"object\".",
  starter: {
    "/typeOf.js": `export function typeOf(value) {
  // Tu código aquí
  return typeof value;
}
`,
  },
  tests: {
    "/typeOf.test.js": `import { typeOf } from "./typeOf";

describe("typeOf", () => {
  test("primitivos normales", () => {
    expect(typeOf(42)).toBe("number");
    expect(typeOf("hola")).toBe("string");
    expect(typeOf(true)).toBe("boolean");
    expect(typeOf(undefined)).toBe("undefined");
    expect(typeOf(10n)).toBe("bigint");
    expect(typeOf(Symbol("id"))).toBe("symbol");
  });

  test("null no es un objeto", () => {
    expect(typeOf(null)).toBe("null");
  });

  test("NaN se distingue de los demás números", () => {
    expect(typeOf(NaN)).toBe("nan");
    expect(typeOf(Number("abc"))).toBe("nan");
    expect(typeOf(Infinity)).toBe("number");
  });

  test("un string no numérico no es nan", () => {
    expect(typeOf("abc")).toBe("string");
    expect(typeOf(undefined)).toBe("undefined");
    expect(typeOf({})).toBe("object");
  });

  test("arrays y funciones", () => {
    expect(typeOf([])).toBe("array");
    expect(typeOf([1, 2])).toBe("array");
    expect(typeOf(() => {})).toBe("function");
    expect(typeOf(class {})).toBe("function");
  });

  test("fechas válidas e inválidas", () => {
    expect(typeOf(new Date(2026, 0, 1))).toBe("date");
    expect(typeOf(new Date("hola"))).toBe("invalid-date");
  });

  test("objetos y wrappers", () => {
    expect(typeOf({ a: 1 })).toBe("object");
    expect(typeOf(new String("x"))).toBe("object");
    expect(typeOf(new Boolean(false))).toBe("object");
  });
});
`,
  },
  solution: {
    "/typeOf.js": `export function typeOf(value) {
  if (value === null) return "null";
  if (Number.isNaN(value)) return "nan";
  if (Array.isArray(value)) return "array";
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "invalid-date" : "date";
  }
  return typeof value;
}
`,
  },
  hints: [
    "Trata primero los casos especiales y deja typeof para el final. Para null basta con value === null.",
    "Para NaN usa Number.isNaN, no isNaN: el isNaN global convierte antes de comprobar e isNaN(\"abc\") o isNaN(undefined) dan true.",
    "Array.isArray distingue arrays; para fechas usa instanceof Date y comprueba si getTime() devuelve NaN.",
  ],
};

export const sumarCantidades: ExerciseDef = {
  id: "coercion-sumar-cantidades",
  title: "Sumar cantidades de un formulario",
  concepts: ["js.coercion", "js.operadores"],
  instructions:
    "Los inputs de un formulario devuelven strings (aunque sean type=\"number\") y a veces llegan vacíos, null o con basura. Implementa toQuantity(raw), que devuelve el número o null si raw no es una cantidad válida, y sumQuantities(raws), que suma solo las cantidades válidas. Reglas de toQuantity: acepta números finitos y strings numéricos (con espacios alrededor); 0 y \"0\" son válidos; devuelve null para strings vacíos o solo con espacios, strings no numéricos (\"12abc\"), NaN, Infinity, null, undefined y cualquier otro tipo (booleanos, arrays…).",
  starter: {
    "/cantidades.js": `export function toQuantity(raw) {
  return raw ? Number(raw) : null;
}

export function sumQuantities(raws) {
  return raws.reduce((total, raw) => total + raw, 0);
}
`,
  },
  tests: {
    "/cantidades.test.js": `import { sumQuantities, toQuantity } from "./cantidades";

describe("toQuantity", () => {
  test("convierte strings numéricos", () => {
    expect(toQuantity("2")).toBe(2);
    expect(toQuantity("2.5")).toBe(2.5);
    expect(toQuantity(" 3 ")).toBe(3);
  });

  test("0 es una cantidad válida", () => {
    expect(toQuantity(0)).toBe(0);
    expect(toQuantity("0")).toBe(0);
  });

  test("vacío no es 0", () => {
    expect(toQuantity("")).toBeNull();
    expect(toQuantity("   ")).toBeNull();
    expect(toQuantity(null)).toBeNull();
    expect(toQuantity(undefined)).toBeNull();
  });

  test("rechaza lo que no es un número finito", () => {
    expect(toQuantity("12abc")).toBeNull();
    expect(toQuantity(NaN)).toBeNull();
    expect(toQuantity(Infinity)).toBeNull();
  });

  test("rechaza tipos que Number() convertiría sin avisar", () => {
    expect(toQuantity(true)).toBeNull();
    expect(toQuantity([5])).toBeNull();
  });
});

describe("sumQuantities", () => {
  test("suma números aunque lleguen como strings", () => {
    expect(sumQuantities(["2", "1"])).toBe(3);
  });

  test("ignora los valores inválidos", () => {
    expect(sumQuantities(["2", 1, "", "x", " 0.5 ", null])).toBe(3.5);
  });

  test("lista vacía suma 0", () => {
    expect(sumQuantities([])).toBe(0);
  });
});
`,
  },
  solution: {
    "/cantidades.js": `export function toQuantity(raw) {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string" || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function sumQuantities(raws) {
  let total = 0;
  for (const raw of raws) {
    const n = toQuantity(raw);
    if (n !== null) total += n;
  }
  return total;
}
`,
  },
  hints: [
    "El starter tiene dos bugs de coerción: raw ? … descarta el 0 (es falsy) y total + raw concatena en cuanto raw es un string (0 + \"2\" es \"02\").",
    "Filtra por tipo antes de convertir: solo acepta typeof \"number\" o \"string\". Number(\"\"), Number(\"  \"), Number(null), Number(true) y Number([5]) devuelven números, así que no te fíes solo de Number().",
    "Number.isFinite descarta NaN e Infinity sin convertir. En sumQuantities, suma solo lo que toQuantity no devuelva como null (compáralo con !== null, no con un if truthy).",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [typeOfPreciso, sumarCantidades];
