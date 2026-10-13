"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { revealSolution } from "@/app/modulos/actions";

// Sandpack inyecta estilos y un iframe en el cliente: no se renderiza en el servidor.
const ExerciseSandbox = dynamic(() => import("./exercise-sandbox"), {
  ssr: false,
  loading: () => <div className="h-80 animate-pulse rounded-md bg-subtle" />,
});

type Props = {
  id: string;
  title: string;
  instructions: string;
  starter: Readonly<Record<string, string>>;
  tests: Readonly<Record<string, string>>;
  hints: readonly string[];
};

export function ExerciseClient({ id, title, instructions, starter, tests, hints }: Props) {
  const [hintCount, setHintCount] = useState(0);
  const [solution, setSolution] = useState<Record<string, string> | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <section className="not-prose space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold tracking-wide text-muted uppercase">Ejercicio</p>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm leading-relaxed">{instructions}</p>
        <p className="text-xs text-muted">
          Los tests son la especificación: léelos, escribe tu solución y ejecútalos.
        </p>
      </div>

      <ExerciseSandbox id={id} starter={starter} tests={tests} />

      {hintCount > 0 && (
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          {hints.slice(0, hintCount).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap gap-2">
        {hintCount < hints.length && (
          <Button variant="secondary" onClick={() => setHintCount((n) => n + 1)}>
            {hintCount === 0 ? "Ver una pista" : "Otra pista"}
          </Button>
        )}
        {!solution && (
          <Button
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("¿Seguro? Intenta resolverlo antes; ver la solución no cuenta como aprobado.")) return;
              startTransition(async () => setSolution(await revealSolution(id)));
            }}
          >
            Ver solución
          </Button>
        )}
      </div>

      {solution &&
        Object.entries(solution).map(([file, code]) => (
          <div key={file} className="space-y-1">
            <p className="font-mono text-xs text-muted">{file} (solución de referencia)</p>
            <pre className="overflow-x-auto rounded-md border border-border bg-code-bg p-4 font-mono text-sm">
              {code}
            </pre>
          </div>
        ))}
    </section>
  );
}
