/// <reference lib="webworker" />
import { format, runTestFiles } from "./core";

const logs: string[] = [];
for (const level of ["log", "info", "warn", "error"] as const) {
  console[level] = (...args: unknown[]) => {
    if (logs.length < 200) logs.push(args.map((a) => (typeof a === "string" ? a : format(a))).join(" "));
  };
}

// Un rechazo sin manejar en el código del alumno no debe tumbar el runner.
self.addEventListener("unhandledrejection", (event) => {
  event.preventDefault();
  logs.push(`Rechazo sin manejar: ${format(event.reason)}`);
});

self.onmessage = async (event: MessageEvent<{ files: Record<string, string> }>) => {
  const result = await runTestFiles(event.data.files, {
    makeUrl: (code) => URL.createObjectURL(new Blob([code], { type: "text/javascript" })),
    importModule: (url) => import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url),
  });
  self.postMessage({ ...result, logs });
};
