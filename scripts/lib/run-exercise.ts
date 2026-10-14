import { execFile } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { FileMap } from "../../src/content/types";

const exec = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "..", "..");
const TMP = path.join(ROOT, ".validate-tmp");

export type ExerciseVariant = {
  /** Identificador único de la variante, p. ej. "closures-once-solucion". */
  key: string;
  files: FileMap;
  tests: FileMap;
};

type VitestJson = {
  testResults: { name: string; status: string; assertionResults: unknown[] }[];
};

/**
 * Ejecuta los tests de todas las variantes (solución e inicial de cada ejercicio)
 * en UNA sola ejecución de Vitest con globals (describe/test/expect), como hace
 * Sandpack con Jest. Cada variante vive en su propia carpeta y sus resultados se
 * leen del informe JSON. Lanzar un proceso por variante saturaba la máquina y
 * producía fallos falsos por tiempo de espera.
 *
 * Devuelve, por clave, si todos los tests de la variante pasaron.
 */
export async function runExerciseVariants(
  variants: readonly ExerciseVariant[],
): Promise<Map<string, boolean>> {
  await mkdir(TMP, { recursive: true });
  const root = await mkdtemp(path.join(TMP, "run-"));
  try {
    await writeFile(
      path.join(root, "vitest.config.mjs"),
      "export default { test: { globals: true, include: ['**/*.test.js'], testTimeout: 10000 } };\n",
    );
    for (const v of variants) {
      for (const [file, source] of Object.entries({ ...v.files, ...v.tests })) {
        const target = path.join(root, v.key, file);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, source);
      }
    }

    const report = path.join(root, "report.json");
    // Vitest sale con código 1 si algún test falla (lo esperado con los starters).
    await exec(
      path.join(ROOT, "node_modules", ".bin", "vitest"),
      ["run", "--root", root, "--reporter=json", `--outputFile=${report}`],
      { cwd: ROOT, timeout: 300_000, maxBuffer: 64 * 1024 * 1024 },
    ).catch(() => undefined);

    const json = JSON.parse(await readFile(report, "utf8")) as VitestJson;
    const results = new Map<string, boolean>();
    for (const v of variants) {
      const dir = path.join(root, v.key) + path.sep;
      const files = json.testResults.filter((r) => r.name.startsWith(dir));
      const expected = Object.keys(v.tests).length;
      const passed =
        files.length === expected &&
        files.every((r) => r.status === "passed" && r.assertionResults.length > 0);
      results.set(v.key, passed);
    }
    return results;
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
