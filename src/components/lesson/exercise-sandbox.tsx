"use client";

import {
  SandpackCodeEditor,
  SandpackLayout,
  SandpackProvider,
  SandpackTests,
  type SandpackFiles,
} from "@codesandbox/sandpack-react";
import { useMemo, useRef, useState } from "react";
import { recordExercisePassed } from "@/app/modulos/actions";

type Spec = Parameters<NonNullable<Parameters<typeof SandpackTests>[0]["onComplete"]>>[0][string];
type Describe = Pick<Spec, "tests" | "describes">;

/** Recorre describes anidados y devuelve [aprobados, total]. */
function countTests(node: Describe): [number, number] {
  let passed = 0;
  let total = 0;
  for (const test of Object.values(node.tests)) {
    total++;
    if (test.status === "pass") passed++;
  }
  for (const child of Object.values(node.describes)) {
    const [p, t] = countTests(child);
    passed += p;
    total += t;
  }
  return [passed, total];
}

type Props = {
  id: string;
  starter: Readonly<Record<string, string>>;
  tests: Readonly<Record<string, string>>;
};

export default function ExerciseSandbox({ id, starter, tests }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const recorded = useRef(false);

  // files, customSetup y options deben conservar su referencia entre renders: si
  // cambian, Sandpack reinicia el editor al código inicial. Las props pueden llegar
  // como objetos nuevos con el mismo contenido, así que se memoizan por contenido.
  const starterKey = JSON.stringify(starter);
  const testsKey = JSON.stringify(tests);
  const { files, customSetup, options } = useMemo(() => {
    const starterFiles: Record<string, string> = JSON.parse(starterKey);
    const testFiles: Record<string, string> = JSON.parse(testsKey);
    // La entrada es el archivo del alumno: los tests los ejecuta SandpackTests.
    const entry = Object.keys(starterFiles)[0];
    return {
      files: {
        ...starterFiles,
        ...Object.fromEntries(
          Object.entries(testFiles).map(([path, code]) => [path, { code, readOnly: true }]),
        ),
        "/package.json": JSON.stringify({ main: entry, dependencies: {} }),
      } satisfies SandpackFiles,
      customSetup: { environment: "parcel" as const, entry },
      options: {
        visibleFiles: [...Object.keys(starterFiles), ...Object.keys(testFiles)],
        activeFile: entry,
      },
    };
  }, [starterKey, testsKey]);

  return (
    <div className="space-y-2">
      <SandpackProvider
        files={files}
        customSetup={customSetup}
        options={options}
        theme="auto"
      >
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers showTabs wrapContent style={{ height: 420 }} />
          <SandpackTests
            style={{ height: 420 }}
            onComplete={(specs) => {
              let passed = 0;
              let total = 0;
              for (const spec of Object.values(specs)) {
                const [p, t] = countTests(spec);
                passed += p;
                total += t;
              }
              // SandpackTests llama a onComplete durante su render: se aplaza el setState.
              queueMicrotask(() => {
                setSummary(`${passed}/${total} tests aprobados`);
                if (total > 0 && passed === total && !recorded.current) {
                  recorded.current = true;
                  void recordExercisePassed(id);
                }
              });
            }}
          />
        </SandpackLayout>
      </SandpackProvider>
      {summary && <p className="text-sm text-muted" role="status">{summary}</p>}
    </div>
  );
}
