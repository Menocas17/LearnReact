import type { ExerciseDef } from "@/content/types";

const normalizar: ExerciseDef = {
  id: "colecciones-normalizar",
  title: "normalize y groupBy",
  concepts: ["js.objetos-avanzado", "js.map-set"],
  instructions:
    "Implementa dos funciones para preparar datos de una API. normalize(items) recibe un array de entidades con id y devuelve { ids, byId }: ids es el array de ids en el orden en que aparecen (sin repetidos) y byId es un objeto id → entidad (si un id se repite, gana la última entidad). groupBy(items, getKey) devuelve un Map cuya clave es getKey(item) (puede ser de cualquier tipo, no solo string) y cuyo valor es el array de items con esa clave, respetando el orden en que aparece cada clave por primera vez.",
  starter: {
    "/colecciones.js": `export function normalize(items) {
  // Tu código aquí
  return { ids: [], byId: {} };
}

export function groupBy(items, getKey) {
  // Tu código aquí
  return new Map();
}
`,
  },
  tests: {
    "/colecciones.test.js": `import { normalize, groupBy } from "./colecciones";

const users = [
  { id: 30, name: "Ana", admin: true },
  { id: 10, name: "Luis", admin: false },
  { id: 20, name: "Eva", admin: true },
];

describe("normalize", () => {
  test("crea el diccionario byId", () => {
    const { byId } = normalize(users);
    expect(byId[10].name).toBe("Luis");
    expect(byId[30]).toBe(users[0]);
  });

  test("ids conserva el orden original (las claves de byId no)", () => {
    const { ids, byId } = normalize(users);
    expect(ids).toEqual([30, 10, 20]);
    expect(Object.keys(byId)).toEqual(["10", "20", "30"]);
  });

  test("ids repetidos: un solo id y gana la última entidad", () => {
    const { ids, byId } = normalize([
      { id: 1, v: "a" },
      { id: 2, v: "b" },
      { id: 1, v: "c" },
    ]);
    expect(ids).toEqual([1, 2]);
    expect(byId[1].v).toBe("c");
  });

  test("array vacío", () => {
    expect(normalize([])).toEqual({ ids: [], byId: {} });
  });
});

describe("groupBy", () => {
  test("devuelve un Map con claves de cualquier tipo", () => {
    const groups = groupBy(users, (u) => u.admin);
    expect(groups).toBeInstanceOf(Map);
    expect(groups.size).toBe(2);
    expect(groups.get(true).map((u) => u.name)).toEqual(["Ana", "Eva"]);
    expect(groups.get(false).map((u) => u.name)).toEqual(["Luis"]);
    expect(groups.has("true")).toBe(false);
  });

  test("las claves siguen el orden de primera aparición", () => {
    const words = ["pera", "uva", "kiwi", "higo", "melón", "té"];
    const byLength = groupBy(words, (w) => w.length);
    expect([...byLength.keys()]).toEqual([4, 3, 5, 2]);
    expect(byLength.get(4)).toEqual(["pera", "kiwi", "higo"]);
  });

  test("puede agrupar por objetos (por referencia)", () => {
    const teamA = { name: "A" };
    const teamB = { name: "B" };
    const players = [
      { name: "p1", team: teamA },
      { name: "p2", team: teamB },
      { name: "p3", team: teamA },
    ];
    const byTeam = groupBy(players, (p) => p.team);
    expect(byTeam.get(teamA).map((p) => p.name)).toEqual(["p1", "p3"]);
    expect(byTeam.get({ name: "A" })).toBeUndefined();
  });
});
`,
  },
  solution: {
    "/colecciones.js": `export function normalize(items) {
  const byId = Object.fromEntries(items.map((item) => [item.id, item]));
  const ids = [...new Set(items.map((item) => item.id))];
  return { ids, byId };
}

export function groupBy(items, getKey) {
  const groups = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}
`,
  },
  hints: [
    "Para byId, Object.fromEntries acepta un array de pares [clave, valor]: puedes construirlo con items.map. Si una clave se repite, el último par sobrescribe al anterior.",
    "Para ids sin repetidos y en orden, un Set conserva el orden de inserción e ignora duplicados: [...new Set(...)].",
    "En groupBy no uses un objeto: convertiría true en \"true\" y los objetos en \"[object Object]\". Usa un Map: si la clave no existe (has), créala con un array vacío y luego haz push.",
  ],
};

const rangeTake: ExerciseDef = {
  id: "iteradores-range-take",
  title: "range y take con generadores",
  concepts: ["js.iteradores-generadores"],
  instructions:
    "Implementa dos generadores. range(start, end = Infinity, step = 1) produce start, start + step, … mientras el valor sea menor que end (step siempre es positivo). take(iterable, n) produce como mucho los n primeros valores de cualquier iterable (array, Set, generador…). take debe ser perezoso: no puede pedirle al iterable más valores de los que necesita, para que funcione con range infinitos.",
  starter: {
    "/iter.js": `export function range(start, end = Infinity, step = 1) {
  // Tu código aquí
  return [];
}

export function take(iterable, n) {
  // Tu código aquí
  return [];
}
`,
  },
  tests: {
    "/iter.test.js": `import { range, take } from "./iter";

describe("range", () => {
  test("produce valores de start a end (sin incluir end)", () => {
    expect([...range(0, 5)]).toEqual([0, 1, 2, 3, 4]);
  });

  test("respeta step", () => {
    expect([...range(1, 10, 3)]).toEqual([1, 4, 7]);
  });

  test("es un iterador, no un array", () => {
    const r = range(0, 3);
    expect(Array.isArray(r)).toBe(false);
    expect(r.next()).toEqual({ value: 0, done: false });
  });

  test("se puede recorrer con for...of", () => {
    let sum = 0;
    for (const n of range(1, 4)) sum += n;
    expect(sum).toBe(6);
  });
});

describe("take", () => {
  test("funciona con arrays y Sets", () => {
    expect([...take(["a", "b", "c"], 2)]).toEqual(["a", "b"]);
    expect([...take(new Set([1, 1, 2, 3]), 5)]).toEqual([1, 2, 3]);
  });

  test("funciona con range infinito", () => {
    expect([...take(range(10), 3)]).toEqual([10, 11, 12]);
    expect([...take(range(0, Infinity, 5), 4)]).toEqual([0, 5, 10, 15]);
  });

  test("no pide más valores de los necesarios", () => {
    let pulled = 0;
    function* source() {
      let i = 0;
      while (true) {
        pulled++;
        yield i++;
      }
    }
    expect([...take(source(), 3)]).toEqual([0, 1, 2]);
    expect(pulled).toBe(3);
  });

  test("take(x, 0) no produce nada ni consume nada", () => {
    let pulled = 0;
    function* source() {
      pulled++;
      yield 1;
    }
    expect([...take(source(), 0)]).toEqual([]);
    expect(pulled).toBe(0);
  });

  test("es perezoso: no hace nada hasta que lo recorres", () => {
    let pulled = 0;
    function* source() {
      pulled++;
      yield 1;
    }
    const t = take(source(), 1);
    expect(pulled).toBe(0);
    expect([...t]).toEqual([1]);
  });
});
`,
  },
  solution: {
    "/iter.js": `export function* range(start, end = Infinity, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

export function* take(iterable, n) {
  if (n <= 0) return;
  let count = 0;
  for (const value of iterable) {
    yield value;
    count++;
    if (count >= n) return;
  }
}
`,
  },
  hints: [
    "Convierte ambas funciones en generadores con function* y usa yield en vez de construir arrays. Un array con end = Infinity nunca terminaría de llenarse; un generador solo calcula el siguiente valor cuando se lo piden.",
    "En take, recorre el iterable con for...of y haz yield de cada valor. Para cortar, return dentro de un generador lo termina (y for...of cierra el iterable de origen).",
    "Cuidado con el orden: si compruebas el límite antes del yield, el for...of ya habrá pedido un valor de más. Haz yield, cuenta y, si ya llegaste a n, return. Y trata n <= 0 antes de empezar el bucle.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [normalizar, rangeTake];
