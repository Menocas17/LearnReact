import type { ExerciseDef } from "@/content/types";

export const registro: ExerciseDef = {
  id: "modulos-registro",
  title: "Un registro compartido entre módulos",
  concepts: ["js.modulos", "js.errores"],
  instructions:
    "Completa /registry.js. Debe exportar: `count` (un `export let` con el número de plugins registrados), `register(name)` (lo añade; si el nombre ya está registrado lanza un Error cuyo mensaje contiene \"ya está registrado\"), `getAll()` (devuelve una copia del array de nombres, en orden de registro) y `reset()` (vacía el registro y deja count en 0). Los archivos /analytics.js y /logger.js ya importan el registro y se registran al evaluarse: no los cambies. Los tests comprueban que ambos usan la misma instancia y que el `count` importado se actualiza solo.",
  starter: {
    "/registry.js": `export let count = 0;
const items = [];

export function register(name) {
  // Tu código aquí
}

export function getAll() {
  // Tu código aquí
}

export function reset() {
  // Tu código aquí
}
`,
    "/analytics.js": `import { register } from "./registry";

register("analytics");

export const plugin = "analytics";
`,
    "/logger.js": `import { register } from "./registry";

register("logger");

export const plugin = "logger";
`,
  },
  tests: {
    "/registry.test.js": `import { count, getAll, register, reset } from "./registry";
import "./analytics";
import "./logger";

describe("al cargar los módulos", () => {
  test("analytics y logger se registraron en la misma instancia", () => {
    expect(getAll()).toEqual(["analytics", "logger"]);
  });

  test("el count importado refleja el valor actual", () => {
    expect(count).toBe(2);
  });
});

describe("registry", () => {
  beforeEach(() => {
    reset();
  });

  test("reset vacía el registro y pone count a 0", () => {
    expect(getAll()).toEqual([]);
    expect(count).toBe(0);
  });

  test("register añade nombres en orden y actualiza count", () => {
    register("a");
    register("b");
    expect(getAll()).toEqual(["a", "b"]);
    expect(count).toBe(2);
  });

  test("un nombre repetido lanza un Error", () => {
    register("a");
    expect(() => register("a")).toThrow("ya está registrado");
    expect(count).toBe(1);
  });

  test("getAll devuelve una copia", () => {
    register("a");
    const list = getAll();
    list.push("intruso");
    expect(getAll()).toEqual(["a"]);
  });
});
`,
  },
  solution: {
    "/registry.js": `export let count = 0;
const items = [];

export function register(name) {
  if (items.includes(name)) {
    throw new Error('"' + name + '" ya está registrado');
  }
  items.push(name);
  count = items.length;
}

export function getAll() {
  return [...items];
}

export function reset() {
  items.length = 0;
  count = 0;
}
`,
    "/analytics.js": `import { register } from "./registry";

register("analytics");

export const plugin = "analytics";
`,
    "/logger.js": `import { register } from "./registry";

register("logger");

export const plugin = "logger";
`,
  },
  hints: [
    "No hace falta nada especial para que analytics.js y logger.js compartan el registro: registry.js se evalúa una sola vez y ambos reciben el mismo array items.",
    "Para que el count importado cambie, asigna a la variable count dentro de registry.js (count = items.length). Quien la importa la ve actualizada porque es un live binding.",
    "En reset no puedes hacer items = [] porque items es const: vacíalo con items.length = 0 (o declara items con let).",
  ],
};

export const validacion: ExerciseDef = {
  id: "errores-validacion",
  title: "ValidationError, parseUser y safe",
  concepts: ["js.errores"],
  instructions:
    "En /errors.js: (1) `class ValidationError extends Error` con constructor(message, { field, cause } = {}): su name debe ser \"ValidationError\", debe guardar `field` y pasar `cause` a Error. (2) `parseUser(json)`: parsea con JSON.parse; si falla con SyntaxError lanza `new ValidationError(\"JSON inválido\", { cause })` con el error original como cause; cualquier otro error se relanza tal cual. Después valida: si el resultado no es un objeto o `name` no es un string no vacío, lanza ValidationError con field \"name\"; si `age` no es un entero mayor o igual que 0, lanza ValidationError con field \"age\". Devuelve `{ name, age }`. (3) `safe(fn)`: ejecuta fn() y devuelve `{ ok: true, value }` o, si lanza, `{ ok: false, error }`.",
  starter: {
    "/errors.js": `export class ValidationError extends Error {
  constructor(message, { field, cause } = {}) {
    super(message);
  }
}

export function parseUser(json) {
  const data = JSON.parse(json);
  return { name: data.name, age: data.age };
}

export function safe(fn) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/errors.test.js": `import { ValidationError, parseUser, safe } from "./errors";

describe("ValidationError", () => {
  test("es un Error con name, field y cause", () => {
    const original = new Error("original");
    const e = new ValidationError("mal", { field: "age", cause: original });
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(ValidationError);
    expect(e.name).toBe("ValidationError");
    expect(e.message).toBe("mal");
    expect(e.field).toBe("age");
    expect(e.cause).toBe(original);
  });
});

describe("parseUser", () => {
  test("devuelve name y age de un JSON válido", () => {
    expect(parseUser('{"name":"Ana","age":30,"extra":true}')).toEqual({ name: "Ana", age: 30 });
  });

  test("envuelve el SyntaxError en un ValidationError con cause", () => {
    let caught;
    try {
      parseUser("{ roto");
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ValidationError);
    expect(caught.message).toBe("JSON inválido");
    expect(caught.cause).toBeInstanceOf(SyntaxError);
  });

  test("relanza tal cual los errores que no son de sintaxis", () => {
    const raro = {
      toString() {
        throw new RangeError("fallo interno");
      },
    };
    expect(() => parseUser(raro)).toThrow(RangeError);
  });

  test("valida name", () => {
    for (const json of ['{"age":3}', '{"name":"","age":3}', "null", "42"]) {
      let caught;
      try {
        parseUser(json);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught.field).toBe("name");
    }
  });

  test("valida age", () => {
    for (const json of ['{"name":"Ana"}', '{"name":"Ana","age":-1}', '{"name":"Ana","age":2.5}', '{"name":"Ana","age":"30"}']) {
      let caught;
      try {
        parseUser(json);
      } catch (e) {
        caught = e;
      }
      expect(caught).toBeInstanceOf(ValidationError);
      expect(caught.field).toBe("age");
    }
  });
});

describe("safe", () => {
  test("devuelve ok: true con el valor", () => {
    expect(safe(() => 42)).toEqual({ ok: true, value: 42 });
  });

  test("devuelve ok: false con el error en vez de lanzar", () => {
    const result = safe(() => parseUser("{ roto"));
    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(ValidationError);
  });
});
`,
  },
  solution: {
    "/errors.js": `export class ValidationError extends Error {
  constructor(message, { field, cause } = {}) {
    super(message, { cause });
    this.name = "ValidationError";
    this.field = field;
  }
}

export function parseUser(json) {
  let data;
  try {
    data = JSON.parse(json);
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new ValidationError("JSON inválido", { cause: e });
    }
    throw e;
  }

  if (typeof data !== "object" || data === null || typeof data.name !== "string" || data.name === "") {
    throw new ValidationError("name es obligatorio", { field: "name" });
  }
  if (!Number.isInteger(data.age) || data.age < 0) {
    throw new ValidationError("age debe ser un entero mayor o igual que 0", { field: "age" });
  }
  return { name: data.name, age: data.age };
}

export function safe(fn) {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    return { ok: false, error };
  }
}
`,
  },
  hints: [
    "En el constructor llama a super(message, { cause }) y después asigna this.name y this.field.",
    "Pon dentro del try solo JSON.parse. En el catch comprueba e instanceof SyntaxError: si lo es, lanza el ValidationError con cause: e; si no, haz throw e.",
    "typeof null es \"object\": compruébalo aparte. Para la edad, Number.isInteger descarta strings, decimales y undefined.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [registro, validacion];
