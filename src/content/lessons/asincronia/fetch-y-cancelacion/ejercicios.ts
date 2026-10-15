import type { ExerciseDef } from "@/content/types";

const apiClient: ExerciseDef = {
  id: "fetch-api-client",
  title: "Un cliente de API que no se traga los errores",
  concepts: ["async.fetch"],
  instructions:
    "Implementa createApiClient({ baseUrl, fetchImpl }) que devuelva { get(path, options), post(path, data, options) }. fetchImpl tiene la misma firma que fetch (los tests le pasan uno falso). Requisitos: (1) la URL es baseUrl + path; (2) post envía method \"POST\", el cuerpo con JSON.stringify(data) y la cabecera Content-Type: application/json; (3) options.signal, si existe, se pasa a fetchImpl; (4) el cuerpo se lee de forma segura: vacío → null, JSON válido → el valor parseado, cualquier otra cosa → el texto tal cual; (5) si la respuesta no es ok, lanza un HttpError (ya definido) con el status y el cuerpo leído; si es ok, devuelve el cuerpo leído.",
  starter: {
    "/api.js": `export class HttpError extends Error {
  constructor(status, body) {
    super("HTTP " + status);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

export function createApiClient({ baseUrl, fetchImpl = globalThis.fetch }) {
  async function request(path, init) {
    const res = await fetchImpl(baseUrl + path, init);
    return res.json();
  }

  return {
    get(path, options = {}) {
      return request(path, {});
    },
    post(path, data, options = {}) {
      return request(path, { method: "POST", body: data });
    },
  };
}
`,
  },
  tests: {
    "/api.test.js": `import { createApiClient, HttpError } from "./api";

function fakeFetch(response) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    return response();
  };
  return { fetchImpl, calls };
}

const json = (data, status = 200) =>
  () => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

describe("createApiClient", () => {
  test("get concatena baseUrl y path y devuelve el JSON", async () => {
    const { fetchImpl, calls } = fakeFetch(json({ id: 1, name: "Ana" }));
    const api = createApiClient({ baseUrl: "https://api.test", fetchImpl });
    const user = await api.get("/users/1");
    expect(user).toEqual({ id: 1, name: "Ana" });
    expect(calls[0].url).toBe("https://api.test/users/1");
  });

  test("post envía JSON con método y Content-Type", async () => {
    const { fetchImpl, calls } = fakeFetch(json({ id: 2 }, 201));
    const api = createApiClient({ baseUrl: "", fetchImpl });
    const created = await api.post("/users", { name: "Luis" });
    expect(created).toEqual({ id: 2 });
    const { init } = calls[0];
    expect(init.method).toBe("POST");
    expect(init.body).toBe('{"name":"Luis"}');
    expect(new Headers(init.headers).get("content-type")).toBe("application/json");
  });

  test("un 404 lanza HttpError con status y cuerpo", async () => {
    const { fetchImpl } = fakeFetch(json({ error: "no existe" }, 404));
    const api = createApiClient({ baseUrl: "", fetchImpl });
    const err = await api.get("/users/999").catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(404);
    expect(err.body).toEqual({ error: "no existe" });
  });

  test("un 500 con HTML lanza HttpError (no SyntaxError) con el texto", async () => {
    const { fetchImpl } = fakeFetch(() => new Response("<h1>Internal Server Error</h1>", { status: 500 }));
    const api = createApiClient({ baseUrl: "", fetchImpl });
    const err = await api.get("/x").catch((e) => e);
    expect(err).toBeInstanceOf(HttpError);
    expect(err.status).toBe(500);
    expect(err.body).toBe("<h1>Internal Server Error</h1>");
  });

  test("un 204 sin cuerpo devuelve null", async () => {
    const { fetchImpl } = fakeFetch(() => new Response(null, { status: 204 }));
    const api = createApiClient({ baseUrl: "", fetchImpl });
    expect(await api.post("/logout", {})).toBe(null);
  });

  test("pasa la señal de cancelación a fetch", async () => {
    const { fetchImpl, calls } = fakeFetch(json([]));
    const api = createApiClient({ baseUrl: "", fetchImpl });
    const controller = new AbortController();
    await api.get("/items", { signal: controller.signal });
    await api.post("/items", { a: 1 }, { signal: controller.signal });
    expect(calls[0].init.signal).toBe(controller.signal);
    expect(calls[1].init.signal).toBe(controller.signal);
  });
});
`,
  },
  solution: {
    "/api.js": `export class HttpError extends Error {
  constructor(status, body) {
    super("HTTP " + status);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

async function readBody(res) {
  // El cuerpo solo se puede leer una vez: text() y luego JSON.parse.
  const text = await res.text();
  if (text === "") return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function createApiClient({ baseUrl, fetchImpl = globalThis.fetch }) {
  async function request(path, init) {
    const res = await fetchImpl(baseUrl + path, init);
    const body = await readBody(res);
    if (!res.ok) throw new HttpError(res.status, body);
    return body;
  }

  return {
    get(path, options = {}) {
      return request(path, { signal: options.signal });
    },
    post(path, data, options = {}) {
      return request(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: options.signal,
      });
    },
  };
}
`,
  },
  hints: [
    "fetch no lanza con un 404 ni con un 500: comprueba res.ok tú mismo y lanza el HttpError.",
    "No llames a res.json() directamente: falla con cuerpos vacíos o HTML. Lee res.text() una sola vez y luego intenta JSON.parse dentro de un try/catch.",
    "El cuerpo de un POST es un string: JSON.stringify(data). Sin la cabecera Content-Type: application/json muchos servidores no lo interpretan como JSON.",
  ],
};

const ultimaBusqueda: ExerciseDef = {
  id: "abort-ultima-busqueda",
  title: "Solo cuenta la última búsqueda",
  concepts: ["async.abort", "async.fetch"],
  instructions:
    "Implementa dos funciones. (1) cancellableDelay(ms, signal): devuelve una promesa que se cumple tras ms milisegundos; si signal ya está abortada rechaza enseguida con signal.reason, y si se aborta durante la espera cancela el timer y rechaza con signal.reason. (2) createLatestSearch(fetchImpl): devuelve una función search(query) que llama a fetchImpl(\"/api/search?q=\" + encodeURIComponent(query), { signal }) y devuelve el JSON de la respuesta. Cada llamada a search debe abortar la petición anterior si sigue en curso, de modo que solo la última puede cumplirse y las anteriores rechazan con AbortError.",
  starter: {
    "/search.js": `export function cancellableDelay(ms, signal) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createLatestSearch(fetchImpl) {
  return async function search(query) {
    const res = await fetchImpl("/api/search?q=" + encodeURIComponent(query), {});
    return res.json();
  };
}
`,
  },
  tests: {
    "/search.test.js": `import { cancellableDelay, createLatestSearch } from "./search";

// fetch falso que tarda "delay" ms y respeta la señal como el fetch real
function slowFetch(delays) {
  const signals = [];
  const fetchImpl = (url, { signal } = {}) => {
    signals.push(signal);
    const q = new URL(url, "http://x").searchParams.get("q");
    return new Promise((resolve, reject) => {
      if (signal?.aborted) return reject(signal.reason);
      const id = setTimeout(
        () => resolve(new Response(JSON.stringify({ q }), { status: 200 })),
        delays[q] ?? 10,
      );
      signal?.addEventListener("abort", () => {
        clearTimeout(id);
        reject(signal.reason);
      });
    });
  };
  return { fetchImpl, signals };
}

describe("cancellableDelay", () => {
  test("se cumple tras el tiempo indicado", async () => {
    const controller = new AbortController();
    await expect(cancellableDelay(10, controller.signal)).resolves.toBe(undefined);
  });

  test("rechaza con el reason si se aborta durante la espera", async () => {
    const controller = new AbortController();
    const p = cancellableDelay(1000, controller.signal);
    controller.abort();
    const err = await p.catch((e) => e);
    expect(err.name).toBe("AbortError");
  });

  test("rechaza enseguida si la señal ya estaba abortada", async () => {
    const reason = new Error("ya no");
    const err = await cancellableDelay(1000, AbortSignal.abort(reason)).catch((e) => e);
    expect(err).toBe(reason);
  });
});

describe("createLatestSearch", () => {
  test("la búsqueda anterior se aborta y solo se cumple la última", async () => {
    const { fetchImpl, signals } = slowFetch({ re: 200, rea: 20 });
    const search = createLatestSearch(fetchImpl);
    const first = search("re");
    const second = search("rea");
    const err = await first.catch((e) => e);
    expect(err.name).toBe("AbortError");
    expect(signals[0].aborted).toBe(true);
    expect(await second).toEqual({ q: "rea" });
  });

  test("codifica la query en la URL", async () => {
    const { fetchImpl } = slowFetch({});
    const search = createLatestSearch(fetchImpl);
    expect(await search("café & té")).toEqual({ q: "café & té" });
  });

  test("búsquedas secuenciales no se abortan entre sí", async () => {
    const { fetchImpl } = slowFetch({});
    const search = createLatestSearch(fetchImpl);
    expect(await search("a")).toEqual({ q: "a" });
    expect(await search("b")).toEqual({ q: "b" });
  });

  test("cada búsqueda usa una señal nueva", async () => {
    const { fetchImpl, signals } = slowFetch({});
    const search = createLatestSearch(fetchImpl);
    await search("a");
    await search("b");
    expect(signals[0]).toBeInstanceOf(AbortSignal);
    expect(signals[1]).not.toBe(signals[0]);
    expect(signals[1].aborted).toBe(false);
  });
});
`,
  },
  solution: {
    "/search.js": `export function cancellableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const id = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(id);
      reject(signal.reason);
    }
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export function createLatestSearch(fetchImpl) {
  let controller = null;

  return async function search(query) {
    controller?.abort();
    const current = new AbortController();
    controller = current;

    const res = await fetchImpl("/api/search?q=" + encodeURIComponent(query), {
      signal: current.signal,
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  };
}
`,
  },
  hints: [
    "En cancellableDelay, comprueba signal.aborted antes de crear el timer y escucha el evento \"abort\" para hacer clearTimeout y rechazar con signal.reason.",
    "createLatestSearch necesita recordar el controller de la búsqueda anterior entre llamadas: guárdalo en una variable de su closure.",
    "En cada search: aborta el controller anterior (si existe), crea uno nuevo y pasa su signal a fetchImpl. Abortar un controller cuya petición ya terminó no hace nada.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [apiClient, ultimaBusqueda];
