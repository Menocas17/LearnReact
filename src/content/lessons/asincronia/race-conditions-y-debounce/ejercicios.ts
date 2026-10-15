import type { ExerciseDef } from "@/content/types";

export const debounceThrottle: ExerciseDef = {
  id: "debounce-throttle-implementar",
  title: "debounce (con cancel y flush) y throttle",
  concepts: ["async.debounce-throttle", "js.closures"],
  instructions:
    "Implementa dos funciones en /limitar.js. (1) debounce(fn, ms) devuelve una función que, al llamarla, pospone la ejecución de fn hasta que pasen ms milisegundos sin nuevas llamadas (solo trailing), usando los argumentos de la ÚLTIMA llamada. La función devuelta tiene dos métodos: cancel() descarta la ejecución pendiente, y flush() ejecuta en el acto la pendiente (con los últimos argumentos) y la quita de la cola; si no hay nada pendiente, flush() no hace nada. (2) throttle(fn, ms) devuelve una función que ejecuta fn inmediatamente en la primera llamada y luego ignora todas las llamadas durante ms milisegundos; pasada la ventana, la siguiente llamada vuelve a ejecutar en el acto. Sin trailing: las llamadas ignoradas se pierden.",
  starter: {
    "/limitar.js": `export function debounce(fn, ms) {
  // Tu código aquí
}

export function throttle(fn, ms) {
  // Tu código aquí
}
`,
  },
  tests: {
    "/limitar.test.js": `import { debounce, throttle } from "./limitar";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const MS = 100;
const AFTER = MS * 2 + 50;

function spy() {
  const calls = [];
  const fn = (...args) => {
    calls.push(args);
  };
  fn.calls = calls;
  return fn;
}

describe("debounce", () => {
  test("una ráfaga produce una sola ejecución con los últimos argumentos", async () => {
    const fn = spy();
    const d = debounce(fn, MS);
    d("a");
    d("b");
    d("c", 3);
    expect(fn.calls.length).toBe(0);
    await sleep(AFTER);
    expect(fn.calls).toEqual([["c", 3]]);
  });

  test("llamadas separadas por más de ms se ejecutan por separado", async () => {
    const fn = spy();
    const d = debounce(fn, MS);
    d("a");
    await sleep(AFTER);
    d("b");
    await sleep(AFTER);
    expect(fn.calls).toEqual([["a"], ["b"]]);
  });

  test("cancel() descarta la ejecución pendiente", async () => {
    const fn = spy();
    const d = debounce(fn, MS);
    d("a");
    d.cancel();
    await sleep(AFTER);
    expect(fn.calls.length).toBe(0);
  });

  test("flush() ejecuta en el acto y no vuelve a ejecutar después", async () => {
    const fn = spy();
    const d = debounce(fn, MS);
    d("x");
    d("y");
    d.flush();
    expect(fn.calls).toEqual([["y"]]);
    await sleep(AFTER);
    expect(fn.calls).toEqual([["y"]]);
  });

  test("flush() sin nada pendiente no hace nada", async () => {
    const fn = spy();
    const d = debounce(fn, MS);
    d.flush();
    d("a");
    await sleep(AFTER);
    d.flush();
    expect(fn.calls).toEqual([["a"]]);
  });

  test("cada debounce tiene su propio timer", async () => {
    const f1 = spy();
    const f2 = spy();
    const d1 = debounce(f1, MS);
    const d2 = debounce(f2, MS);
    d1("uno");
    d2("dos");
    await sleep(AFTER);
    expect(f1.calls).toEqual([["uno"]]);
    expect(f2.calls).toEqual([["dos"]]);
  });
});

describe("throttle", () => {
  test("ejecuta la primera llamada en el acto e ignora el resto de la ventana", async () => {
    const fn = spy();
    const t = throttle(fn, MS);
    t(1);
    t(2);
    t(3);
    expect(fn.calls).toEqual([[1]]);
    await sleep(AFTER);
    expect(fn.calls).toEqual([[1]]);
  });

  test("pasada la ventana vuelve a ejecutar en el acto", async () => {
    const fn = spy();
    const t = throttle(fn, MS);
    t("a");
    await sleep(AFTER);
    t("b");
    t("c");
    expect(fn.calls).toEqual([["a"], ["b"]]);
  });

  test("las llamadas ignoradas no alargan la ventana", async () => {
    const fn = spy();
    const t = throttle(fn, 300);
    t(1);
    await sleep(100);
    t(2); // dentro de la ventana: se ignora
    await sleep(250);
    t(3); // pasaron más de 300 ms desde la primera: se ejecuta
    expect(fn.calls).toEqual([[1], [3]]);
  });
});
`,
  },
  solution: {
    "/limitar.js": `export function debounce(fn, ms) {
  let timer = null;
  let lastArgs = null;

  function run() {
    const args = lastArgs;
    timer = null;
    lastArgs = null;
    fn(...args);
  }

  function debounced(...args) {
    lastArgs = args;
    clearTimeout(timer);
    timer = setTimeout(run, ms);
  }

  debounced.cancel = () => {
    clearTimeout(timer);
    timer = null;
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer === null) return;
    clearTimeout(timer);
    run();
  };

  return debounced;
}

export function throttle(fn, ms) {
  let waiting = false;
  return (...args) => {
    if (waiting) return;
    fn(...args);
    waiting = true;
    setTimeout(() => {
      waiting = false;
    }, ms);
  };
}
`,
  },
  hints: [
    "Las dos funciones necesitan estado que sobreviva entre llamadas (el id del timer, los últimos argumentos, si estás en la ventana): decláralo dentro de debounce/throttle, fuera de la función que devuelves.",
    "Para colgar cancel y flush, declara la función devuelta con nombre (function debounced(...args) {…}) y asígnale propiedades: debounced.cancel = …. Las funciones son objetos.",
    "flush necesita saber si hay algo pendiente: pon timer a null cuando se ejecute o se cancele, y comprueba timer === null.",
  ],
};

export const latestOnly: ExerciseDef = {
  id: "race-latest-only",
  title: "latestOnly(asyncFn): el último gana",
  concepts: ["async.race-conditions", "async.abort", "js.closures"],
  instructions:
    "Implementa latestOnly(asyncFn) en /latest.js. Devuelve una función que llama a asyncFn con los mismos argumentos MÁS un AbortSignal como último argumento, y devuelve una promesa. Reglas: (1) si cuando asyncFn termina esa llamada sigue siendo la más reciente, la promesa se resuelve con su resultado (o se rechaza con su mismo error); (2) si mientras tanto se hizo otra llamada, la promesa se rechaza con un StaleError, sin importar si asyncFn tuvo éxito o falló; (3) al hacer una llamada nueva, aborta el signal de la anterior. La clase StaleError ya está escrita. Cada latestOnly(...) es independiente.",
  starter: {
    "/latest.js": `export class StaleError extends Error {
  constructor(message = "Respuesta obsoleta") {
    super(message);
    this.name = "StaleError";
  }
}

export function latestOnly(asyncFn) {
  // Versión ingenua: cada respuesta llega a quien la pidió, aunque ya no sea la última.
  return (...args) => asyncFn(...args);
}
`,
  },
  tests: {
    "/latest.test.js": `import { latestOnly, StaleError } from "./latest";

const reply = (value, ms) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));
const fail = (message, ms) =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));

describe("latestOnly", () => {
  test("una sola llamada se resuelve con el resultado", async () => {
    const search = latestOnly((q, ms) => reply("res:" + q, ms));
    await expect(search("a", 50)).resolves.toBe("res:a");
  });

  test("una respuesta vieja que llega tarde se descarta", async () => {
    const search = latestOnly((q, ms) => reply("res:" + q, ms));
    const old = search("r", 300);
    const latest = search("re", 50);
    const [a, b] = await Promise.allSettled([old, latest]);
    expect(b).toEqual({ status: "fulfilled", value: "res:re" });
    expect(a.status).toBe("rejected");
    expect(a.reason).toBeInstanceOf(StaleError);
  });

  test("una respuesta vieja también se descarta aunque llegue primero", async () => {
    const search = latestOnly((q, ms) => reply("res:" + q, ms));
    const old = search("r", 50);
    const latest = search("re", 250);
    const [a, b] = await Promise.allSettled([old, latest]);
    expect(a.status).toBe("rejected");
    expect(a.reason).toBeInstanceOf(StaleError);
    expect(b).toEqual({ status: "fulfilled", value: "res:re" });
  });

  test("el error de la última llamada se propaga tal cual", async () => {
    const load = latestOnly(() => fail("boom", 50));
    await expect(load()).rejects.toThrow("boom");
  });

  test("el error de una llamada vieja se convierte en StaleError", async () => {
    let n = 0;
    const load = latestOnly(() => (++n === 1 ? fail("boom", 50) : reply("ok", 150)));
    const [a, b] = await Promise.allSettled([load(), load()]);
    expect(a.reason).toBeInstanceOf(StaleError);
    expect(b).toEqual({ status: "fulfilled", value: "ok" });
  });

  test("pasa un AbortSignal y aborta el de la llamada anterior", async () => {
    const signals = [];
    const load = latestOnly((x, signal) => {
      signals.push(signal);
      return reply(x, 50);
    });
    const first = load(1);
    const second = load(2);
    expect(signals.length).toBe(2);
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
    await Promise.allSettled([first, second]);
  });

  test("cada latestOnly es independiente", async () => {
    const a = latestOnly((x) => reply(x, 50));
    const b = latestOnly((x) => reply(x, 100));
    await expect(Promise.all([a("A"), b("B")])).resolves.toEqual(["A", "B"]);
  });
});
`,
  },
  solution: {
    "/latest.js": `export class StaleError extends Error {
  constructor(message = "Respuesta obsoleta") {
    super(message);
    this.name = "StaleError";
  }
}

export function latestOnly(asyncFn) {
  let lastCall = 0;
  let controller = null;

  return async (...args) => {
    const callId = ++lastCall;
    controller?.abort();
    controller = new AbortController();

    let result;
    try {
      result = await asyncFn(...args, controller.signal);
    } catch (error) {
      if (callId !== lastCall) throw new StaleError();
      throw error;
    }
    if (callId !== lastCall) throw new StaleError();
    return result;
  };
}
`,
  },
  hints: [
    "Es el patrón del contador de peticiones: una variable compartida (el número de la última llamada) y una const local en cada llamada con su número. Tras el await, compáralos.",
    "Comprueba si la llamada es obsoleta en los dos caminos: cuando asyncFn se resuelve y cuando se rechaza (en el catch).",
    "Guarda el AbortController de la llamada en curso en una variable del closure; al empezar una llamada nueva, llama a abort() sobre el anterior antes de crear uno nuevo.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [debounceThrottle, latestOnly];
