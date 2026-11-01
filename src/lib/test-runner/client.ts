import type { RunResult } from "./core";

/**
 * Ejecuta los tests en un Web Worker nuevo. Si tardan demasiado (un bucle infinito, por
 * ejemplo), el worker se termina y la página sigue respondiendo.
 */
export function runInWorker(files: Record<string, string>, timeoutMs = 15000): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ results: [], logs: [], error: `Los tests tardaron más de ${timeoutMs / 1000} s. ¿Hay un bucle infinito?` });
    }, timeoutMs);
    worker.onmessage = (event: MessageEvent<RunResult>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ results: [], logs: [], error: event.message || "Error al ejecutar los tests" });
    };
    worker.postMessage({ files });
  });
}
