import type { ReactNode } from "react";

/** Contexto opcional (historia, especificación, casos raros) plegado por defecto. */
export function Profundiza({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <details className="rounded-md border border-border bg-subtle p-4">
      <summary className="cursor-pointer select-none font-semibold">📚 Para profundizar: {titulo}</summary>
      <div className="mt-3 space-y-3 text-sm">{children}</div>
    </details>
  );
}
