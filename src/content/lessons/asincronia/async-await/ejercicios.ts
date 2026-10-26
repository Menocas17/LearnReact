import type { ExerciseDef } from "@/content/types";

export const guardarTodos: ExerciseDef = {
  id: "async-guardar-todos",
  title: "Arreglar saveAll",
  concepts: ["async.async-await", "js.errores"],
  instructions:
    "saveAll(items, api) tiene bugs: devuelve antes de que se guarde nada y los errores se pierden. Corrígela para que: (1) inicie todos los api.save(item) a la vez, sin esperar uno para empezar el siguiente; (2) si todos van bien, se resuelva con los resultados en el mismo orden que items (no en el orden en que terminan); (3) si alguno falla, espere a que terminen todos y después rechace con un AggregateError cuya propiedad errors tenga los errores en el orden de items y cuyo message sea \"X de N fallaron\" (por ejemplo, \"2 de 5 fallaron\"). Con una lista vacía se resuelve con [].",
  starter: {
    "/saveAll.js": `export async function saveAll(items, api) {
  const results = [];
  items.forEach(async (item) => {
    const saved = await api.save(item);
    results.push(saved);
  });
  return results;
}
`,
  },
  tests: {
    "/saveAll.test.js": `import { saveAll } from "./saveAll";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// API falsa: cada item tarda lo que diga delays y "falla" si su nombre empieza por "x".
function fakeApi(delays) {
  const api = { active: 0, maxActive: 0, finished: 0 };
  api.save = async (item) => {
    api.active++;
    api.maxActive = Math.max(api.maxActive, api.active);
    await wait(delays[item] ?? 10);
    api.active--;
    api.finished++;
    if (item.startsWith("x")) throw new Error("no se pudo guardar " + item);
    return item.toUpperCase();
  };
  return api;
}

describe("saveAll", () => {
  test("espera a que terminen y devuelve los resultados", async () => {
    const api = fakeApi({ a: 20, b: 20 });
    const result = await saveAll(["a", "b"], api);
    expect(result).toEqual(["A", "B"]);
    expect(api.finished).toBe(2);
  });

  test("mantiene el orden de items aunque terminen en otro orden", async () => {
    const api = fakeApi({ a: 60, b: 30, c: 5 });
    expect(await saveAll(["a", "b", "c"], api)).toEqual(["A", "B", "C"]);
  });

  test("inicia todos los guardados a la vez", async () => {
    const api = fakeApi({ a: 30, b: 30, c: 30, d: 30 });
    await saveAll(["a", "b", "c", "d"], api);
    expect(api.maxActive).toBe(4);
  });

  test("lista vacía", async () => {
    expect(await saveAll([], fakeApi({}))).toEqual([]);
  });

  test("rechaza con un AggregateError con todos los errores en orden", async () => {
    const api = fakeApi({ a: 5, xb: 40, c: 10, xd: 5, e: 10 });
    let error;
    try {
      await saveAll(["a", "xb", "c", "xd", "e"], api);
    } catch (e) {
      error = e;
    }
    expect(error).toBeInstanceOf(AggregateError);
    expect(error.message).toBe("2 de 5 fallaron");
    expect(error.errors.map((e) => e.message)).toEqual([
      "no se pudo guardar xb",
      "no se pudo guardar xd",
    ]);
  });

  test("no rechaza hasta que terminan todos", async () => {
    const api = fakeApi({ x1: 5, a: 60 });
    await expect(saveAll(["x1", "a"], api)).rejects.toBeInstanceOf(AggregateError);
    expect(api.finished).toBe(2);
  });
});
`,
  },
  solution: {
    "/saveAll.js": `export async function saveAll(items, api) {
  const errors = [];

  const results = await Promise.all(
    items.map(async (item, index) => {
      try {
        // return await: sin await, el catch no vería el rechazo
        return await api.save(item);
      } catch (error) {
        errors[index] = error;
        return undefined;
      }
    }),
  );

  if (errors.length > 0) {
    const failed = errors.filter(Boolean);
    throw new AggregateError(failed, failed.length + " de " + items.length + " fallaron");
  }
  return results;
}
`,
  },
  hints: [
    "forEach no espera las promesas que devuelve su callback. items.map con un callback async te da un array de promesas que sí puedes esperar con await Promise.all(...).",
    "Promise.all rechaza en cuanto falla la primera promesa y no espera a las demás. Si cada callback captura su propio error con try/catch, ninguna promesa se rechaza y Promise.all espera a todas.",
    "Dentro del try, usa return await api.save(item): con return a secas el rechazo no pasa por tu catch. Guarda cada error en errors[index] para conservar el orden de items.",
  ],
};

export const reintentos: ExerciseDef = {
  id: "async-reintentos",
  title: "retry y fetchJsonSafe",
  concepts: ["async.async-await", "js.errores"],
  instructions:
    "Este archivo tiene dos funciones con bugs. Corrígelas. retry(fn, { attempts = 3, delayMs = 0 }) llama a fn(intento) (intento empieza en 1) hasta que su promesa se cumpla y devuelve ese valor; si falla, espera delayMs y lo vuelve a intentar, como máximo attempts veces en total; si fallan todos, rechaza con el error del último intento. fetchJsonSafe(fetchLike, url) llama a fetchLike(url) (que se comporta como fetch) y nunca lanza: devuelve { ok: true, data } con el JSON de la respuesta, o { ok: false, error } si la petición falla, si la respuesta no es ok (el error debe tener el message \"HTTP \" seguido del status, p. ej. \"HTTP 404\") o si el JSON no se puede leer.",
  starter: {
    "/red.js": `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retry(fn, { attempts = 3, delayMs = 0 } = {}) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return fn(attempt);
    } catch (error) {
      wait(delayMs);
    }
  }
}

export async function fetchJsonSafe(fetchLike, url) {
  try {
    const res = await fetchLike(url);
    return { ok: true, data: res.json() };
  } catch (error) {
    return { ok: false, error };
  }
}
`,
  },
  tests: {
    "/red.test.js": `import { retry, fetchJsonSafe } from "./red";

// Función que falla las primeras \`failures\` veces.
function flaky(failures, value) {
  const calls = [];
  const fn = async (attempt) => {
    calls.push(attempt);
    if (calls.length <= failures) throw new Error("fallo " + calls.length);
    return value;
  };
  return { fn, calls };
}

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => {
      if (body === undefined) throw new SyntaxError("JSON inválido");
      return body;
    },
  };
}

describe("retry", () => {
  test("devuelve el valor si funciona a la primera", async () => {
    const { fn, calls } = flaky(0, "datos");
    expect(await retry(fn)).toBe("datos");
    expect(calls).toEqual([1]);
  });

  test("reintenta hasta que funciona y pasa el número de intento", async () => {
    const { fn, calls } = flaky(2, "datos");
    expect(await retry(fn, { attempts: 3 })).toBe("datos");
    expect(calls).toEqual([1, 2, 3]);
  });

  test("rechaza con el error del último intento", async () => {
    const { fn, calls } = flaky(10, "datos");
    await expect(retry(fn, { attempts: 4 })).rejects.toThrow("fallo 4");
    expect(calls).toEqual([1, 2, 3, 4]);
  });

  test("con attempts: 1 no reintenta", async () => {
    const { fn, calls } = flaky(1, "datos");
    await expect(retry(fn, { attempts: 1 })).rejects.toThrow("fallo 1");
    expect(calls).toEqual([1]);
  });

  test("espera delayMs entre intentos", async () => {
    const times = [];
    const fn = async () => {
      times.push(Date.now());
      if (times.length < 3) throw new Error("todavía no");
      return "ok";
    };
    expect(await retry(fn, { attempts: 3, delayMs: 50 })).toBe("ok");
    expect(times[1] - times[0]).toBeGreaterThanOrEqual(45);
    expect(times[2] - times[1]).toBeGreaterThanOrEqual(45);
  });
});

describe("fetchJsonSafe", () => {
  test("devuelve los datos cuando todo va bien", async () => {
    const fetchLike = async (url) => response(200, { url, items: [1, 2] });
    expect(await fetchJsonSafe(fetchLike, "/api/items")).toEqual({
      ok: true,
      data: { url: "/api/items", items: [1, 2] },
    });
  });

  test("una respuesta no ok es un error", async () => {
    const result = await fetchJsonSafe(async () => response(404, { error: "no existe" }), "/x");
    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.message).toBe("HTTP 404");
  });

  test("un fallo de red no lanza", async () => {
    const network = new TypeError("Failed to fetch");
    const result = await fetchJsonSafe(async () => {
      throw network;
    }, "/x");
    expect(result).toEqual({ ok: false, error: network });
  });

  test("un JSON inválido no lanza", async () => {
    const result = await fetchJsonSafe(async () => response(200, undefined), "/x");
    expect(result.ok).toBe(false);
    expect(result.error).toBeInstanceOf(SyntaxError);
  });
});
`,
  },
  solution: {
    "/red.js": `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function retry(fn, { attempts = 3, delayMs = 0 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await wait(delayMs);
    }
  }
  throw lastError;
}

export async function fetchJsonSafe(fetchLike, url) {
  try {
    const res = await fetchLike(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error };
  }
}
`,
  },
  hints: [
    "return fn(attempt) dentro del try devuelve la promesa sin esperarla: si se rechaza, el catch no se entera y no hay reintento. Necesitas return await.",
    "wait(delayMs) sin await crea el timer pero no pausa el bucle. Y al salir del bucle sin éxito tienes que lanzar el último error: guárdalo en una variable declarada fuera del for.",
    "En fetchJsonSafe, res.json() también devuelve una promesa que puede rechazarse: espérala dentro del try. Para una respuesta no ok, lanza tú un Error dentro del try y deja que el catch lo convierta en { ok: false, error }.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [guardarTodos, reintentos];
