import type { ExerciseDef } from "@/content/types";

export const withTimeout: ExerciseDef = {
  id: "promesas-with-timeout",
  title: "delay y withTimeout",
  concepts: ["async.promesas", "async.combinadores"],
  instructions:
    "Implementa tres piezas en timeout.js. (1) delay(ms, value): devuelve una promesa que se cumple con value tras ms milisegundos. (2) La clase TimeoutError, que extiende Error, tiene name \"TimeoutError\" y guarda ms en una propiedad ms. (3) withTimeout(promise, ms): devuelve una promesa que se asienta igual que promise si esta termina antes de ms; si no, se rechaza con un TimeoutError. Cuando promise termine primero (bien o mal), limpia el temporizador con clearTimeout para no dejarlo vivo.",
  starter: {
    "/timeout.js": `export class TimeoutError extends Error {
  // Tu código aquí
}

export function delay(ms, value) {
  // Tu código aquí
}

export function withTimeout(promise, ms) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/timeout.test.js": `import { TimeoutError, delay, withTimeout } from "./timeout";

describe("delay", () => {
  test("devuelve una promesa que se cumple con el valor", async () => {
    const p = delay(10, "hola");
    expect(p).toBeInstanceOf(Promise);
    await expect(p).resolves.toBe("hola");
  });

  test("espera al menos los milisegundos indicados", async () => {
    const start = Date.now();
    await delay(60);
    expect(Date.now() - start).toBeGreaterThanOrEqual(50);
  });
});

describe("TimeoutError", () => {
  test("es un Error con name y ms", () => {
    const e = new TimeoutError(250);
    expect(e).toBeInstanceOf(Error);
    expect(e).toBeInstanceOf(TimeoutError);
    expect(e.name).toBe("TimeoutError");
    expect(e.ms).toBe(250);
  });
});

describe("withTimeout", () => {
  test("se cumple con el valor si la promesa llega a tiempo", async () => {
    await expect(withTimeout(delay(10, "ok"), 1000)).resolves.toBe("ok");
  });

  test("se rechaza con TimeoutError si la promesa tarda demasiado", async () => {
    const error = await withTimeout(delay(1000, "tarde"), 20).catch((e) => e);
    expect(error).toBeInstanceOf(TimeoutError);
    expect(error.ms).toBe(20);
  });

  test("propaga el rechazo original si llega antes del timeout", async () => {
    const error = await withTimeout(Promise.reject(new Error("red")), 1000).catch((e) => e);
    expect(error).not.toBeInstanceOf(TimeoutError);
    expect(error.message).toBe("red");
  });

  test("limpia el temporizador cuando la promesa termina antes", async () => {
    const original = globalThis.clearTimeout;
    let cleared = 0;
    globalThis.clearTimeout = (id) => {
      cleared++;
      return original(id);
    };
    try {
      await withTimeout(delay(5, "ok"), 1000);
      await withTimeout(Promise.reject(new Error("x")), 1000).catch(() => {});
    } finally {
      globalThis.clearTimeout = original;
    }
    expect(cleared).toBeGreaterThanOrEqual(2);
  });
});
`,
  },
  solution: {
    "/timeout.js": `export class TimeoutError extends Error {
  constructor(ms) {
    super("Tiempo agotado tras " + ms + " ms");
    this.name = "TimeoutError";
    this.ms = ms;
  }
}

export function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(ms)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
`,
  },
  hints: [
    "delay es el ejemplo típico de promisificar: new Promise((resolve) => …) y llamar a resolve(value) dentro del setTimeout.",
    "withTimeout es una carrera entre dos promesas: la original y una que se rechaza con TimeoutError cuando vence el timer. Promise.race se asienta con la primera.",
    "Guarda el id del setTimeout en una variable de fuera y llama a clearTimeout en un finally encadenado al race: se ejecuta tanto si gana la promesa como si falla, y no altera el resultado.",
  ],
};

export const dashboard: ExerciseDef = {
  id: "combinadores-dashboard",
  title: "loadDashboard y promisify",
  concepts: ["async.combinadores", "async.promesas"],
  instructions:
    "Implementa dos funciones en dashboard.js. (1) loadDashboard(api): api tiene getUser(), getProjects() y getNotifications(), y cada una devuelve una promesa. Lanza las tres peticiones en paralelo (no una tras otra) y devuelve una promesa de { user, projects, notifications }. Si falla getUser o getProjects, la promesa se rechaza con ese error; si falla getNotifications, la página debe cargar igual con notifications: []. (2) promisify(fn): recibe una función estilo Node cuyo último argumento es un callback (err, value) y devuelve una función que acepta los mismos argumentos (sin el callback) y devuelve una promesa.",
  starter: {
    "/dashboard.js": `export async function loadDashboard(api) {
  // Versión secuencial y sin tolerancia a fallos: arréglala
  const user = await api.getUser();
  const projects = await api.getProjects();
  const notifications = await api.getNotifications();
  return { user, projects, notifications };
}

export function promisify(fn) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/dashboard.test.js": `import { loadDashboard, promisify } from "./dashboard";

function controlledApi() {
  const started = [];
  const pending = {};
  const make = (name) => () => {
    started.push(name);
    return new Promise((resolve, reject) => {
      pending[name] = { resolve, reject };
    });
  };
  return {
    started,
    pending,
    api: {
      getUser: make("user"),
      getProjects: make("projects"),
      getNotifications: make("notifications"),
    },
  };
}

describe("loadDashboard", () => {
  test("lanza las tres peticiones en paralelo", async () => {
    const { started, pending, api } = controlledApi();
    const result = loadDashboard(api);
    expect([...started].sort()).toEqual(["notifications", "projects", "user"]);
    pending.notifications.resolve(["n1"]);
    pending.projects.resolve(["p1", "p2"]);
    pending.user.resolve({ name: "Ana" });
    await expect(result).resolves.toEqual({
      user: { name: "Ana" },
      projects: ["p1", "p2"],
      notifications: ["n1"],
    });
  });

  test("si fallan las notificaciones, devuelve []", async () => {
    const api = {
      getUser: () => Promise.resolve({ name: "Ana" }),
      getProjects: () => Promise.resolve([]),
      getNotifications: () => Promise.reject(new Error("503")),
    };
    await expect(loadDashboard(api)).resolves.toEqual({
      user: { name: "Ana" },
      projects: [],
      notifications: [],
    });
  });

  test("si falla el usuario, se rechaza con ese error", async () => {
    const api = {
      getUser: () => Promise.reject(new Error("sin sesión")),
      getProjects: () => Promise.resolve([]),
      getNotifications: () => Promise.resolve([]),
    };
    await expect(loadDashboard(api)).rejects.toThrow("sin sesión");
  });

  test("si fallan los proyectos, se rechaza con ese error", async () => {
    const api = {
      getUser: () => Promise.resolve({ name: "Ana" }),
      getProjects: () => Promise.reject(new Error("db caída")),
      getNotifications: () => Promise.resolve([]),
    };
    await expect(loadDashboard(api)).rejects.toThrow("db caída");
  });
});

describe("promisify", () => {
  const readUser = (id, cb) => {
    setTimeout(() => {
      if (id < 0) cb(new Error("id inválido"));
      else cb(null, "user-" + id);
    }, 5);
  };

  test("devuelve una función que devuelve una promesa", () => {
    const p = promisify(readUser)(1);
    expect(p).toBeInstanceOf(Promise);
    return p;
  });

  test("se cumple con el valor del callback", async () => {
    await expect(promisify(readUser)(7)).resolves.toBe("user-7");
  });

  test("se rechaza con el error del callback", async () => {
    await expect(promisify(readUser)(-1)).rejects.toThrow("id inválido");
  });

  test("pasa todos los argumentos", async () => {
    const add = (a, b, cb) => cb(null, a + b);
    await expect(promisify(add)(2, 3)).resolves.toBe(5);
  });
});
`,
  },
  solution: {
    "/dashboard.js": `export async function loadDashboard(api) {
  const [user, projects, notifications] = await Promise.all([
    api.getUser(),
    api.getProjects(),
    api.getNotifications().catch(() => []),
  ]);
  return { user, projects, notifications };
}

export function promisify(fn) {
  return (...args) =>
    new Promise((resolve, reject) => {
      fn(...args, (err, value) => {
        if (err) reject(err);
        else resolve(value);
      });
    });
}
`,
  },
  hints: [
    "Para que vayan en paralelo, llama a las tres funciones antes de esperar nada y pasa las tres promesas a Promise.all. Desestructura el array resultante: su orden es el de entrada.",
    "No necesitas allSettled para todo: basta con que la promesa de notificaciones no pueda fallar. Encadénale un .catch que devuelva [] antes de meterla en el Promise.all.",
    "promisify devuelve (...args) => new Promise(…). Dentro, llama a fn con los args más un callback propio (err, value) que llame a reject o a resolve.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [withTimeout, dashboard];
