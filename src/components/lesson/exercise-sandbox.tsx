"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
  useSandpack,
  type SandpackFiles,
} from "@codesandbox/sandpack-react";
import { useMemo, useRef, useState } from "react";
import { recordExercisePassed } from "@/app/modulos/actions";
import { Button } from "@/components/ui/button";
import { runInWorker } from "@/lib/test-runner/client";
import type { RunResult } from "@/lib/test-runner/core";

type Props = {
  id: string;
  starter: Readonly<Record<string, string>>;
  tests: Readonly<Record<string, string>>;
};

/**
 * Editor de Sandpack (solo como editor) y un runner propio: los tests se ejecutan de forma
 * nativa en un Web Worker, así que admiten la sintaxis moderna y no dependen de CodeSandbox.
 */
export default function ExerciseSandbox({ id, starter, tests }: Props) {
  // files y options deben conservar su referencia entre renders: si cambian, Sandpack
  // reinicia el editor al código inicial. Se memoizan por contenido.
  const starterKey = JSON.stringify(starter);
  const testsKey = JSON.stringify(tests);
  const { files, options, paths } = useMemo(() => {
    const starterFiles: Record<string, string> = JSON.parse(starterKey);
    const testFiles: Record<string, string> = JSON.parse(testsKey);
    const visible = [...Object.keys(starterFiles), ...Object.keys(testFiles)];
    return {
      files: {
        ...starterFiles,
        ...Object.fromEntries(Object.entries(testFiles).map(([path, code]) => [path, { code, readOnly: true }])),
      } satisfies SandpackFiles,
      options: { visibleFiles: visible, activeFile: visible[0] },
      paths: visible,
    };
  }, [starterKey, testsKey]);

  return (
    <SandpackProvider files={files} options={options} theme="auto">
      <SandpackLayout>
        <SandpackCodeEditor showLineNumbers showTabs wrapContent style={{ height: 380 }} />
      </SandpackLayout>
      <TestPanel id={id} paths={paths} />
    </SandpackProvider>
  );
}

function TestPanel({ id, paths }: { id: string; paths: string[] }) {
  const { sandpack } = useSandpack();
  const [result, setResult] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const recorded = useRef(false);

  async function run() {
    setRunning(true);
    const current = Object.fromEntries(paths.map((p) => [p, sandpack.files[p]?.code ?? ""]));
    const next = await runInWorker(current);
    setResult(next);
    setRunning(false);
    const passed = next.results.filter((r) => r.passed).length;
    if (!next.error && next.results.length > 0 && passed === next.results.length && !recorded.current) {
      recorded.current = true;
      void recordExercisePassed(id);
    }
  }

  const passed = result?.results.filter((r) => r.passed).length ?? 0;
  const total = result?.results.length ?? 0;
  const allPassed = !!result && !result.error && total > 0 && passed === total;

  return (
    <div className="mt-2 space-y-3 rounded-md border border-border p-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={running}>
          {running ? "Ejecutando…" : "▶ Ejecutar tests"}
        </Button>
        {result && (
          <p role="status" className={allPassed ? "text-sm font-medium text-dominado" : "text-sm text-muted"}>
            {result.error ? "Error" : `${passed}/${total} tests aprobados${allPassed ? " ✓" : ""}`}
          </p>
        )}
      </div>
      {result?.error && (
        <pre role="alert" className="overflow-x-auto rounded bg-hueco/10 p-2 font-mono text-xs whitespace-pre-wrap">
          {result.error}
        </pre>
      )}
      {result && result.results.length > 0 && (
        <ul className="space-y-1 font-mono text-xs">
          {result.results.map((r) => (
            <li key={r.name}>
              <span className={r.passed ? "text-dominado" : "text-hueco"}>{r.passed ? "✓" : "✗"}</span> {r.name}
              {r.error && <span className="block pl-4 whitespace-pre-wrap text-muted">{r.error}</span>}
            </li>
          ))}
        </ul>
      )}
      {result && result.logs.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted">console ({result.logs.length})</summary>
          <pre className="mt-1 overflow-x-auto font-mono whitespace-pre-wrap">{result.logs.join("\n")}</pre>
        </details>
      )}
    </div>
  );
}
