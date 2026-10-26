import type { ExerciseDef } from "@/content/types";

export const runInChunks: ExerciseDef = {
  id: "event-loop-run-in-chunks",
  title: "Trocear trabajo largo",
  concepts: ["async.render-navegador", "async.event-loop"],
  instructions:
    "Implementa runInChunks(items, fn, options) para procesar un array grande sin bloquear el event loop. Llama a fn(item, index) para cada elemento, en orden, en bloques de options.chunkSize elementos (por defecto 100). El primer bloque se procesa de inmediato (de forma síncrona); antes de cada bloque siguiente cede el control llamando a options.schedule(callback) (por defecto, (cb) => setTimeout(cb, 0)). Devuelve una promesa que se resuelve cuando se han procesado todos los elementos y se rechaza con el error si fn lanza.",
  starter: {
    "/chunks.js": `export function runInChunks(items, fn, options = {}) {
  const { chunkSize = 100, schedule = (cb) => setTimeout(cb, 0) } = options;
  // Esto bloquea el hilo hasta terminar: trocéalo.
  items.forEach((item, index) => fn(item, index));
  return Promise.resolve();
}
`,
  },
  tests: {
    "/chunks.test.js": `import { runInChunks } from "./chunks";

describe("runInChunks", () => {
  test("procesa todos los elementos en orden con su índice", async () => {
    const seen = [];
    await runInChunks(["a", "b", "c", "d", "e"], (item, i) => seen.push(item + i), {
      chunkSize: 2,
    });
    expect(seen).toEqual(["a0", "b1", "c2", "d3", "e4"]);
  });

  test("procesa el primer bloque de forma síncrona y cede antes de cada bloque siguiente", async () => {
    const pending = [];
    const schedule = (cb) => pending.push(cb);
    let processed = 0;
    const done = runInChunks([1, 2, 3, 4, 5, 6, 7], () => processed++, {
      chunkSize: 3,
      schedule,
    });
    expect(processed).toBe(3);
    expect(pending.length).toBe(1);
    pending.shift()();
    expect(processed).toBe(6);
    expect(pending.length).toBe(1);
    pending.shift()();
    expect(processed).toBe(7);
    expect(pending.length).toBe(0);
    await done;
  });

  test("otra tarea puede ejecutarse entre bloques (schedule por defecto)", async () => {
    const log = [];
    const items = Array.from({ length: 10 }, (_, i) => i);
    const done = runInChunks(items, (n) => log.push("item " + n), { chunkSize: 3 });
    setTimeout(() => log.push("otra tarea"), 0);
    await done;
    const pos = log.indexOf("otra tarea");
    expect(pos).toBeGreaterThan(0);
    expect(pos).toBeLessThan(log.length - 1);
    expect(log.filter((x) => x !== "otra tarea").length).toBe(10);
  });

  test("con un array vacío se resuelve sin llamar a fn", async () => {
    let calls = 0;
    await runInChunks([], () => calls++);
    expect(calls).toBe(0);
  });

  test("usa bloques de 100 por defecto", async () => {
    const pending = [];
    let processed = 0;
    runInChunks(new Array(250).fill(0), () => processed++, {
      schedule: (cb) => pending.push(cb),
    });
    expect(processed).toBe(100);
    expect(pending.length).toBe(1);
  });

  test("rechaza si fn lanza en un bloque posterior", async () => {
    const done = runInChunks([1, 2, 3, 4], (n) => {
      if (n === 4) throw new Error("fila inválida");
    }, { chunkSize: 2 });
    await expect(done).rejects.toThrow("fila inválida");
  });
});
`,
  },
  solution: {
    "/chunks.js": `export function runInChunks(items, fn, options = {}) {
  const { chunkSize = 100, schedule = (cb) => setTimeout(cb, 0) } = options;

  return new Promise((resolve, reject) => {
    let index = 0;

    function processChunk() {
      try {
        const end = Math.min(index + chunkSize, items.length);
        for (; index < end; index++) {
          fn(items[index], index);
        }
      } catch (error) {
        reject(error);
        return;
      }
      if (index < items.length) {
        schedule(processChunk);
      } else {
        resolve();
      }
    }

    processChunk();
  });
}
`,
  },
  hints: [
    "Envuelve todo en new Promise((resolve, reject) => …): el executor se ejecuta de forma síncrona, así que el primer bloque saldrá síncrono sin hacer nada especial.",
    "Guarda el índice por el que vas en una variable fuera de la función que procesa un bloque. Al terminar un bloque, si quedan elementos, pasa esa misma función a schedule; si no, llama a resolve().",
    "Un throw dentro de un callback de setTimeout no rechaza la promesa por sí solo: captúralo con try/catch y llama a reject.",
  ],
};

export const ticker: ExerciseDef = {
  id: "callbacks-ticker",
  title: "Un ticker que no se solapa",
  concepts: ["async.callbacks"],
  instructions:
    "El código inicial usa setInterval: si onTick tarda más que el intervalo, los ticks se encadenan sin respiro, y llamar dos veces a start() crea dos intervalos. Reescribe createTicker(onTick, intervalMs) con setTimeout recursivo. start() empieza a contar (el primer tick llega tras intervalMs) y no hace nada si ya está en marcha; stop() cancela el timer pendiente y puede llamarse desde dentro de onTick. onTick recibe el número de tick (1, 2, 3…). Entre el final de un tick y el comienzo del siguiente deben pasar al menos intervalMs.",
  starter: {
    "/ticker.js": `export function createTicker(onTick, intervalMs) {
  let id = null;
  let count = 0;

  return {
    start() {
      id = setInterval(() => {
        count++;
        onTick(count);
      }, intervalMs);
    },
    stop() {
      clearInterval(id);
      id = null;
    },
  };
}
`,
  },
  tests: {
    "/ticker.test.js": `import { createTicker } from "./ticker";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("createTicker", () => {
  test("hace ticks periódicos numerados desde 1", async () => {
    const ticks = [];
    const t = createTicker((n) => ticks.push(n), 20);
    t.start();
    await wait(150);
    t.stop();
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks.length).toBeLessThanOrEqual(7);
    expect(ticks).toEqual(ticks.map((_, i) => i + 1));
  });

  test("stop cancela el timer pendiente", async () => {
    let count = 0;
    const t = createTicker(() => count++, 20);
    t.start();
    await wait(70);
    t.stop();
    const atStop = count;
    await wait(120);
    expect(count).toBe(atStop);
  });

  test("stop funciona desde dentro de onTick", async () => {
    const ticks = [];
    const t = createTicker((n) => {
      ticks.push(n);
      if (n === 2) t.stop();
    }, 15);
    t.start();
    await wait(400);
    expect(ticks).toEqual([1, 2]);
  });

  test("llamar dos veces a start no duplica los ticks", async () => {
    let count = 0;
    const t = createTicker(() => count++, 60);
    t.start();
    t.start();
    await wait(150);
    t.stop();
    expect(count).toBeLessThanOrEqual(2);
  });

  test("no se solapa: espera intervalMs desde el final de cada tick", async () => {
    const starts = [];
    const ends = [];
    const t = createTicker(() => {
      starts.push(Date.now());
      const until = Date.now() + 30;
      while (Date.now() < until) {
        // tick lento: 30 ms de trabajo síncrono
      }
      ends.push(Date.now());
    }, 15);
    t.start();
    await wait(250);
    t.stop();
    expect(starts.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < starts.length; i++) {
      expect(starts[i] - ends[i - 1]).toBeGreaterThanOrEqual(14);
    }
  });
});
`,
  },
  solution: {
    "/ticker.js": `export function createTicker(onTick, intervalMs) {
  let id = null;
  let running = false;
  let count = 0;

  function schedule() {
    id = setTimeout(() => {
      count++;
      onTick(count);
      if (running) schedule();
    }, intervalMs);
  }

  return {
    start() {
      if (running) return;
      running = true;
      schedule();
    },
    stop() {
      running = false;
      clearTimeout(id);
      id = null;
    },
  };
}
`,
  },
  hints: [
    "En vez de un intervalo, programa un solo setTimeout; al final de su callback, después de llamar a onTick, programa el siguiente.",
    "Si stop() se llama dentro de onTick, clearTimeout no sirve de nada (ese timer ya se está ejecutando y el siguiente aún no existe). Usa un booleano running y programa el siguiente tick solo si sigue en true.",
  ],
};

export const ejercicios: readonly ExerciseDef[] = [runInChunks, ticker];
