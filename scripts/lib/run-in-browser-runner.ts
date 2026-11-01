import { runTestFiles, type RunResult } from "../../src/lib/test-runner/core";
import type { FileMap } from "../../src/content/types";

/** Ejecuta en Node el mismo runner que usa el navegador (módulos como URLs data:). */
export function runWithBrowserRunner(files: FileMap): Promise<RunResult> {
  return runTestFiles(files, {
    makeUrl: (code) => `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`,
    importModule: (url) => import(url),
  });
}

export const allPassed = (r: RunResult) => !r.error && r.results.length > 0 && r.results.every((t) => t.passed);
