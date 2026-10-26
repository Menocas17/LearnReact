import type { ReactNode } from "react";

/** Pausa para predecir: el alumno piensa la respuesta antes de abrir `<Respuesta>`. */
export function AntesDeSeguir({ children }: { children: ReactNode }) {
  return (
    <aside className="space-y-3 rounded-md border border-primary/30 bg-primary/5 p-4">
      <p className="font-semibold">🤔 Antes de seguir</p>
      {children}
    </aside>
  );
}

export function Respuesta({ children }: { children: ReactNode }) {
  return (
    <details className="group rounded-md border border-border bg-background p-3">
      <summary className="cursor-pointer select-none font-medium text-primary">
        <span className="group-open:hidden">Ver respuesta</span>
        <span className="hidden group-open:inline">Respuesta</span>
      </summary>
      <div className="mt-3 space-y-3">{children}</div>
    </details>
  );
}
