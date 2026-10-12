import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const RUNNER = path.join(import.meta.dirname, "snippet-runner.mjs");

/** Normaliza la salida: sin espacios finales por línea ni líneas vacías al final. */
export function normalizeOutput(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd();
}

/** Ejecuta código JS como módulo ES con Node y devuelve su salida de consola. */
export async function runSnippet(source: string): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), "learnreact-snippet-"));
  try {
    const file = path.join(dir, "snippet.mjs");
    await writeFile(file, source);
    const { stdout } = await exec(process.execPath, [RUNNER, file], { timeout: 10_000 });
    return normalizeOutput(stdout);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
