import { execFile } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import type { FileMap } from "../../src/content/types";

const exec = promisify(execFile);
const ROOT = path.resolve(import.meta.dirname, "..", "..");
const TMP = path.join(ROOT, ".validate-tmp");

/**
 * Ejecuta los tests de un ejercicio contra unos archivos (starter o solución)
 * con Vitest y globals (describe/test/expect), como hace Sandpack con Jest.
 */
export async function exerciseTestsPass(name: string, files: FileMap, tests: FileMap) {
  const dir = path.join(TMP, name);
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "vitest.config.mjs"), "export default { test: { globals: true } };\n");
  for (const [file, source] of Object.entries({ ...files, ...tests })) {
    const target = path.join(dir, file);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, source);
  }
  try {
    await exec(path.join(ROOT, "node_modules", ".bin", "vitest"), ["run", "--root", dir], {
      cwd: ROOT,
      timeout: 60_000,
    });
    return true;
  } catch {
    return false;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
