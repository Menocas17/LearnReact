/**
 * Mini runner de tests compatible con el subconjunto de Jest/Vitest que usan los ejercicios.
 * Ejecuta los módulos de forma nativa (sin transpilar): en el navegador dentro de un Web Worker
 * con URLs blob, y en Node (validación) con URLs data.
 */

export type TestResult = { name: string; passed: boolean; error?: string };
export type RunResult = { results: TestResult[]; logs: string[]; error?: string };

type Files = Readonly<Record<string, string>>;
type Hook = () => unknown;
type TestCase = { name: string; fn: () => unknown; before: Hook[]; after: Hook[] };

export type RunOptions = {
  /** Convierte código fuente en una URL importable (blob: o data:). */
  makeUrl: (code: string) => string;
  importModule: (url: string) => Promise<unknown>;
  testTimeoutMs?: number;
};

export const isTestFile = (path: string) => /\.test\.[jt]s$/.test(path);

// ---------------------------------------------------------------------------
// Formato y comparación

export function format(value: unknown, depth = 0): string {
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "bigint") return `${value}n`;
  if (Object.is(value, -0)) return "-0";
  if (typeof value === "function") return `[Function ${value.name || "anónima"}]`;
  if (typeof value === "symbol") return value.toString();
  if (value === null || typeof value !== "object") return String(value);
  if (depth > 3) return Array.isArray(value) ? "[…]" : "{…}";
  if (value instanceof Date) return `Date(${Number.isNaN(value.getTime()) ? "Invalid Date" : value.toISOString()})`;
  if (value instanceof RegExp) return String(value);
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (value instanceof Map)
    return `Map {${[...value].map(([k, v]) => `${format(k, depth + 1)} => ${format(v, depth + 1)}`).join(", ")}}`;
  if (value instanceof Set) return `Set {${[...value].map((v) => format(v, depth + 1)).join(", ")}}`;
  if (Array.isArray(value)) return `[${value.map((v) => format(v, depth + 1)).join(", ")}]`;
  const entries = Object.entries(value).map(([k, v]) => `${k}: ${format(v, depth + 1)}`);
  return `{${entries.join(", ")}}`;
}

/** Igualdad de `toEqual`: recursiva, ignora propiedades con valor undefined y el prototipo. */
export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
  if (a instanceof Date || b instanceof Date)
    return a instanceof Date && b instanceof Date && Object.is(a.getTime(), b.getTime());
  if (a instanceof RegExp || b instanceof RegExp) return String(a) === String(b);
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  if (a instanceof Map || b instanceof Map) {
    if (!(a instanceof Map && b instanceof Map) || a.size !== b.size) return false;
    return [...a].every(([k, v]) => b.has(k) && deepEqual(v, b.get(k)));
  }
  if (a instanceof Set || b instanceof Set) {
    if (!(a instanceof Set && b instanceof Set) || a.size !== b.size) return false;
    return [...a].every((v) => b.has(v) || [...b].some((w) => deepEqual(v, w)));
  }
  const keys = (o: object) => Object.keys(o).filter((k) => (o as Record<string, unknown>)[k] !== undefined);
  const ka = keys(a);
  const kb = keys(b);
  return (
    ka.length === kb.length &&
    ka.every((k) => deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
  );
}

// ---------------------------------------------------------------------------
// expect

class AssertionError extends Error {}

function throwMatches(error: unknown, expected: unknown): boolean {
  if (expected === undefined) return true;
  const message = error instanceof Error ? error.message : String(error);
  if (typeof expected === "string") return message.includes(expected);
  if (expected instanceof RegExp) return expected.test(message);
  if (typeof expected === "function") return error instanceof (expected as new () => unknown);
  if (expected instanceof Error) return message === expected.message;
  return false;
}

type Check = [ok: boolean, message: string];

function matchers(actual: unknown): Record<string, (...args: never[]) => Check> {
  const n = actual as number;
  return {
    toBe: (expected: unknown) => [Object.is(actual, expected), `se esperaba ${format(expected)} y se recibió ${format(actual)}`],
    toEqual: (expected: unknown) => [deepEqual(actual, expected), `se esperaba ${format(expected)} y se recibió ${format(actual)}`],
    toStrictEqual: (expected: unknown) => [deepEqual(actual, expected), `se esperaba ${format(expected)} y se recibió ${format(actual)}`],
    toBeNull: () => [actual === null, `se esperaba null y se recibió ${format(actual)}`],
    toBeUndefined: () => [actual === undefined, `se esperaba undefined y se recibió ${format(actual)}`],
    toBeDefined: () => [actual !== undefined, "se esperaba un valor definido"],
    toBeTruthy: () => [Boolean(actual), `se esperaba un valor truthy y se recibió ${format(actual)}`],
    toBeFalsy: () => [!actual, `se esperaba un valor falsy y se recibió ${format(actual)}`],
    toBeNaN: () => [Number.isNaN(actual), `se esperaba NaN y se recibió ${format(actual)}`],
    toBeGreaterThan: (e: number) => [n > e, `se esperaba > ${format(e)} y se recibió ${format(actual)}`],
    toBeGreaterThanOrEqual: (e: number) => [n >= e, `se esperaba >= ${format(e)} y se recibió ${format(actual)}`],
    toBeLessThan: (e: number) => [n < e, `se esperaba < ${format(e)} y se recibió ${format(actual)}`],
    toBeLessThanOrEqual: (e: number) => [n <= e, `se esperaba <= ${format(e)} y se recibió ${format(actual)}`],
    toBeCloseTo: (e: number, digits = 2) => [
      Math.abs(n - e) < 10 ** -digits / 2,
      `se esperaba un número cercano a ${format(e)} y se recibió ${format(actual)}`,
    ],
    toBeInstanceOf: (cls: new () => unknown) => [
      actual instanceof cls,
      `se esperaba una instancia de ${cls.name} y se recibió ${format(actual)}`,
    ],
    toHaveLength: (len: number) => [
      (actual as { length?: number } | null)?.length === len,
      `se esperaba longitud ${len} y se recibió ${format((actual as { length?: number } | null)?.length)}`,
    ],
    toContain: (item: unknown) => [
      typeof actual === "string" ? actual.includes(item as string) : Array.isArray(actual) && actual.includes(item),
      `se esperaba que ${format(actual)} contuviera ${format(item)}`,
    ],
    toMatch: (re: RegExp | string) => [
      typeof actual === "string" && (typeof re === "string" ? actual.includes(re) : re.test(actual)),
      `se esperaba que ${format(actual)} coincidiera con ${format(re)}`,
    ],
    toThrow: (expected?: unknown) => {
      if (typeof actual !== "function") return [false, "toThrow necesita una función"];
      try {
        (actual as () => unknown)();
      } catch (error) {
        return [throwMatches(error, expected), `lanzó ${format(error)}, que no coincide con ${format(expected)}`];
      }
      return [false, "se esperaba que lanzara un error y no lanzó nada"];
    },
  };
}

type Expectation = Record<string, (...args: unknown[]) => unknown>;

function build(actual: unknown, negate: boolean): Expectation {
  const out: Expectation = {};
  for (const [name, check] of Object.entries(matchers(actual))) {
    out[name] = (...args: unknown[]) => {
      const [ok, message] = (check as (...a: unknown[]) => Check)(...args);
      if (ok === negate) throw new AssertionError(negate ? `.not.${name}: no debía cumplirse (${message})` : message);
    };
  }
  return out;
}

function settled(promise: unknown, mode: "resolves" | "rejects", negate: boolean): Expectation {
  const out: Expectation = {};
  for (const name of Object.keys(matchers(undefined))) {
    out[name] = async (...args: unknown[]) => {
      let value: unknown;
      try {
        value = await promise;
      } catch (error) {
        if (mode === "resolves") throw new AssertionError(`se esperaba que se cumpliera y se rechazó con ${format(error)}`);
        // En .rejects.toThrow el "valor" es el error: se envuelve en una función que lo lanza.
        const subject = name === "toThrow" ? () => { throw error; } : error;
        return build(subject, negate)[name](...args);
      }
      if (mode === "rejects") throw new AssertionError(`se esperaba un rechazo y se cumplió con ${format(value)}`);
      return build(value, negate)[name](...args);
    };
  }
  return out;
}

function expect(actual: unknown) {
  return Object.assign(build(actual, false), {
    not: build(actual, true),
    resolves: Object.assign(settled(actual, "resolves", false), { not: settled(actual, "resolves", true) }),
    rejects: Object.assign(settled(actual, "rejects", false), { not: settled(actual, "rejects", true) }),
  });
}

// ---------------------------------------------------------------------------
// Carga de módulos

function normalize(path: string): string {
  const out: string[] = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return `/${out.join("/")}`;
}

function linkModules(files: Files, makeUrl: (code: string) => string, prelude: string) {
  const urls = new Map<string, string>();
  const resolve = (from: string, spec: string) => {
    const base = normalize(`${from.slice(0, from.lastIndexOf("/") + 1)}${spec}`);
    const found = [base, `${base}.js`, `${base}/index.js`].find((p) => p in files);
    if (!found) throw new Error(`${from}: no existe el archivo importado "${spec}"`);
    return found;
  };
  const link = (path: string, stack: string[]): string => {
    const cached = urls.get(path);
    if (cached) return cached;
    if (stack.includes(path)) throw new Error(`Import circular: ${[...stack, path].join(" → ")}`);
    const code = files[path].replace(
      /(\bfrom\s*|\bimport\s*\(?\s*)(["'])(\.{1,2}\/[^"']*)\2/g,
      (_m, pre: string, quote: string, spec: string) => `${pre}${quote}${link(resolve(path, spec), [...stack, path])}${quote}`,
    );
    const url = makeUrl(isTestFile(path) ? `${prelude}\n${code}` : code);
    urls.set(path, url);
    return url;
  };
  return (path: string) => link(path, []);
}

// ---------------------------------------------------------------------------
// Ejecución

const message = (error: unknown) => (error instanceof Error ? error.message : format(error));

export async function runTestFiles(files: Files, options: RunOptions): Promise<RunResult> {
  const { makeUrl, importModule, testTimeoutMs = 5000 } = options;
  const tests: TestCase[] = [];
  const logs: string[] = [];
  const scope = { names: [] as string[], before: [] as Hook[], after: [] as Hook[] };

  const api = {
    describe(name: string, fn: () => void) {
      const saved = { ...scope, before: [...scope.before], after: [...scope.after] };
      scope.names = [...scope.names, name];
      try {
        fn();
      } finally {
        Object.assign(scope, saved);
      }
    },
    test(name: string, fn: () => unknown) {
      tests.push({ name: [...scope.names, name].join(" › "), fn, before: [...scope.before], after: [...scope.after] });
    },
    beforeEach: (fn: Hook) => void scope.before.push(fn),
    afterEach: (fn: Hook) => void scope.after.push(fn),
    expect,
  };
  const key = "__learnReactTests";
  (globalThis as Record<string, unknown>)[key] = { ...api, it: api.test };
  const prelude = `const { describe, test, it, expect, beforeEach, afterEach } = globalThis.${key};`;

  try {
    const urlOf = linkModules(files, makeUrl, prelude);
    for (const path of Object.keys(files).filter(isTestFile)) await importModule(urlOf(path));
  } catch (error) {
    return { results: [], logs, error: `No se pudo cargar el código: ${message(error)}` };
  }

  const results: TestResult[] = [];
  for (const t of tests) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      for (const hook of t.before) await hook();
      await Promise.race([
        Promise.resolve().then(t.fn),
        new Promise((_, reject) => {
          timer = setTimeout(() => reject(new Error(`el test tardó más de ${testTimeoutMs / 1000} s`)), testTimeoutMs);
        }),
      ]);
      for (const hook of t.after) await hook();
      results.push({ name: t.name, passed: true });
    } catch (error) {
      results.push({ name: t.name, passed: false, error: message(error) });
    } finally {
      clearTimeout(timer);
    }
  }
  return { results, logs };
}
