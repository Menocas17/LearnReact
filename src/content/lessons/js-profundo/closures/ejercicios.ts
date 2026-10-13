import type { ExerciseDef } from "@/content/types";

export const once: ExerciseDef = {
  id: "closures-once",
  title: "once(fn)",
  concepts: ["js.closures"],
  instructions:
    "Implementa once(fn): devuelve una función que ejecuta fn solo la primera vez que se llama (con los argumentos de esa llamada) y, en las siguientes, devuelve el mismo resultado sin volver a ejecutar fn.",
  starter: {
    "/once.js": `export function once(fn) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/once.test.js": `import { once } from "./once";

describe("once", () => {
  test("ejecuta fn una sola vez", () => {
    let calls = 0;
    const init = once(() => {
      calls++;
      return "listo";
    });
    expect(init()).toBe("listo");
    expect(init()).toBe("listo");
    expect(calls).toBe(1);
  });

  test("usa los argumentos de la primera llamada", () => {
    const sum = once((a, b) => a + b);
    expect(sum(1, 2)).toBe(3);
    expect(sum(10, 20)).toBe(3);
  });

  test("cada once() es independiente", () => {
    const a = once(() => "a");
    const b = once(() => "b");
    expect(a()).toBe("a");
    expect(b()).toBe("b");
  });

  test("recuerda también resultados undefined", () => {
    let calls = 0;
    const log = once(() => {
      calls++;
    });
    log();
    log();
    expect(calls).toBe(1);
  });
});
`,
  },
  solution: {
    "/once.js": `export function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
`,
  },
  hints: [
    "Necesitas recordar dos cosas entre llamadas: si ya se ejecutó y qué devolvió. ¿Dónde puedes guardar variables que sobrevivan entre llamadas?",
    "Declara las variables dentro de once (fuera de la función que devuelves): la función devuelta las verá gracias al closure.",
    "No uses result === undefined para saber si ya se llamó: fn podría devolver undefined. Usa un booleano aparte.",
  ],
};

export const contador: ExerciseDef = {
  id: "closures-contador",
  title: "Contador con historial",
  concepts: ["js.closures", "patrones.modulo-factory"],
  instructions:
    "Implementa createCounter(initial = 0) que devuelva un objeto con increment(), decrement(), undo() y value(). undo() deshace la última operación (puede llamarse varias veces). El estado debe ser privado: no debe existir ninguna propiedad con el valor en el objeto devuelto.",
  starter: {
    "/counter.js": `export function createCounter(initial = 0) {
  // Tu código aquí
  return {
    increment() {},
    decrement() {},
    undo() {},
    value() {},
  };
}
`,
  },
  tests: {
    "/counter.test.js": `import { createCounter } from "./counter";

describe("createCounter", () => {
  test("incrementa y decrementa", () => {
    const c = createCounter(5);
    c.increment();
    c.increment();
    c.decrement();
    expect(c.value()).toBe(6);
  });

  test("usa 0 como valor inicial por defecto", () => {
    expect(createCounter().value()).toBe(0);
  });

  test("undo deshace operaciones en orden inverso", () => {
    const c = createCounter();
    c.increment();
    c.increment();
    c.decrement();
    c.undo();
    expect(c.value()).toBe(2);
    c.undo();
    c.undo();
    expect(c.value()).toBe(0);
  });

  test("undo sin historial no hace nada", () => {
    const c = createCounter(3);
    c.undo();
    expect(c.value()).toBe(3);
  });

  test("los contadores no comparten estado", () => {
    const a = createCounter();
    const b = createCounter();
    a.increment();
    expect(b.value()).toBe(0);
  });

  test("el estado es privado", () => {
    const c = createCounter(7);
    const values = Object.values(c).filter((v) => typeof v !== "function");
    expect(values).toEqual([]);
  });
});
`,
  },
  solution: {
    "/counter.js": `export function createCounter(initial = 0) {
  let count = initial;
  const history = [];

  return {
    increment() {
      history.push(count);
      count++;
    },
    decrement() {
      history.push(count);
      count--;
    },
    undo() {
      if (history.length > 0) count = history.pop();
    },
    value() {
      return count;
    },
  };
}
`,
  },
  hints: [
    "Guarda el valor actual y una pila (array) con los valores anteriores en variables locales de createCounter.",
    "Antes de cambiar el valor, apila el valor actual; undo saca el último de la pila.",
  ],
};
