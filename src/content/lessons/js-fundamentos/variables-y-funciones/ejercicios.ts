import type { ExerciseDef } from "@/content/types";

export const utilidadesRotas: ExerciseDef = {
  id: "funciones-utilidades-rotas",
  title: "Arregla las utilidades",
  concepts: ["js.funciones", "js.variables"],
  instructions:
    "Este módulo tiene tres funciones pequeñas, cada una con un bug típico. toOptions debe convertir usuarios en opciones { value, label } para un <select>. createTask debe devolver una tarea cuyas etiquetas sean las recibidas (o [\"nuevo\"] si no se pasan) más \"pendiente\", sin modificar ningún array existente. makeButton debe devolver un botón cuyo onClick, al llamarse, invoque handler(id), y no antes. Arregla los bugs sin cambiar las firmas.",
  starter: {
    "/utils.js": `export const toOptions = (users) =>
  users.map((user) => {
    const label = user.name.trim();
    ({ value: user.id, label });
  });

const DEFAULT_TAGS = ["nuevo"];

export function createTask(title, tags = DEFAULT_TAGS) {
  tags.push("pendiente");
  return { title, tags };
}

export const makeButton = (id, handler) => ({
  id,
  onClick: handler(id),
});
`,
  },
  tests: {
    "/utils.test.js": `import { toOptions, createTask, makeButton } from "./utils";

describe("toOptions", () => {
  test("devuelve un objeto por usuario", () => {
    const users = [
      { id: 1, name: " Ana " },
      { id: 2, name: "Luis" },
    ];
    expect(toOptions(users)).toEqual([
      { value: 1, label: "Ana" },
      { value: 2, label: "Luis" },
    ]);
  });
});

describe("createTask", () => {
  test("usa las etiquetas por defecto", () => {
    expect(createTask("a").tags).toEqual(["nuevo", "pendiente"]);
  });

  test("las llamadas sin etiquetas no se contaminan entre sí", () => {
    createTask("a");
    createTask("b");
    expect(createTask("c").tags).toEqual(["nuevo", "pendiente"]);
  });

  test("no modifica el array que recibe", () => {
    const tags = ["urgente"];
    const task = createTask("a", tags);
    expect(task.tags).toEqual(["urgente", "pendiente"]);
    expect(tags).toEqual(["urgente"]);
  });
});

describe("makeButton", () => {
  test("no llama al handler al crear el botón", () => {
    let calls = 0;
    makeButton(3, () => {
      calls++;
    });
    expect(calls).toBe(0);
  });

  test("onClick llama al handler con el id", () => {
    const received = [];
    const button = makeButton(3, (id) => {
      received.push(id);
    });
    button.onClick();
    button.onClick();
    expect(received).toEqual([3, 3]);
  });
});
`,
  },
  solution: {
    "/utils.js": `export const toOptions = (users) =>
  users.map((user) => {
    const label = user.name.trim();
    return { value: user.id, label };
  });

const DEFAULT_TAGS = ["nuevo"];

export function createTask(title, tags = DEFAULT_TAGS) {
  return { title, tags: tags.concat("pendiente") };
}

export const makeButton = (id, handler) => ({
  id,
  onClick: () => handler(id),
});
`,
  },
  hints: [
    "toOptions: un callback con llaves necesita return. Ese objeto entre paréntesis se evalúa y se descarta.",
    "createTask: const DEFAULT_TAGS no impide hacerle push, y todas las llamadas sin tags reciben ese mismo array. Crea un array nuevo en vez de mutar (concat devuelve uno nuevo).",
    "makeButton: handler(id) se ejecuta en el momento y guarda su resultado. Guarda una función que lo llame más tarde.",
  ],
};

export const formatterYPipe: ExerciseDef = {
  id: "funciones-formatter-pipe",
  title: "createFormatter y pipe",
  concepts: ["js.funciones"],
  instructions:
    "Implementa dos funciones que devuelven funciones. createFormatter(currency = \"USD\", decimals = 2) devuelve una función que recibe un número y lo formatea con toFixed(decimals) seguido de un espacio y la moneda (\"5.00 USD\"). Si currency es null significa \"sin moneda\": devuelve solo el número formateado. pipe(...fns) devuelve una función que recibe un valor y le aplica las funciones de izquierda a derecha; sin funciones, devuelve el valor tal cual.",
  starter: {
    "/format.js": `export function createFormatter(currency = "USD", decimals = 2) {
  // Tu código aquí
}

export function pipe(...fns) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/format.test.js": `import { createFormatter, pipe } from "./format";

describe("createFormatter", () => {
  test("usa los valores por defecto", () => {
    expect(createFormatter()(5)).toBe("5.00 USD");
  });

  test("undefined activa el valor por defecto", () => {
    expect(createFormatter(undefined, 0)(5.4)).toBe("5 USD");
  });

  test("null significa sin moneda", () => {
    expect(createFormatter(null)(3)).toBe("3.00");
  });

  test("cada formatter es independiente", () => {
    const eur = createFormatter("EUR", 1);
    const usd = createFormatter();
    expect(eur(2)).toBe("2.0 EUR");
    expect(usd(2)).toBe("2.00 USD");
  });
});

describe("pipe", () => {
  test("aplica las funciones de izquierda a derecha", () => {
    const double = (n) => n * 2;
    const inc = (n) => n + 1;
    expect(pipe(double, inc)(5)).toBe(11);
    expect(pipe(inc, double)(5)).toBe(12);
  });

  test("acepta cualquier número de funciones", () => {
    const inc = (n) => n + 1;
    expect(pipe(inc, inc, inc, inc)(0)).toBe(4);
  });

  test("sin funciones devuelve el valor", () => {
    expect(pipe()("hola")).toBe("hola");
  });

  test("se combina con createFormatter", () => {
    const withTax = (n) => n * 1.5;
    expect(pipe(withTax, createFormatter("EUR"))(10)).toBe("15.00 EUR");
  });
});
`,
  },
  solution: {
    "/format.js": `export function createFormatter(currency = "USD", decimals = 2) {
  return (amount) => {
    const fixed = amount.toFixed(decimals);
    return currency === null ? fixed : fixed + " " + currency;
  };
}

export function pipe(...fns) {
  return (value) => {
    let result = value;
    for (const fn of fns) {
      result = fn(result);
    }
    return result;
  };
}
`,
  },
  hints: [
    "Ambas funciones devuelven otra función: return (amount) => … y return (value) => ….",
    "El valor por defecto de currency no se aplica con null: compruébalo tú con currency === null.",
    "En pipe, fns ya es un array: recórrelo con for…of pasando el resultado de cada función a la siguiente.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [utilidadesRotas, formatterYPipe];
