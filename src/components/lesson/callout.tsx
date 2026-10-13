import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const styles = {
  clave: { label: "Clave", className: "border-primary/50 bg-primary/5" },
  cuidado: { label: "Cuidado", className: "border-fragil/60 bg-fragil/5" },
  nota: { label: "Nota", className: "border-border bg-subtle" },
} as const;

export function Callout({ type = "nota", children }: { type?: keyof typeof styles; children: ReactNode }) {
  const style = styles[type];
  return (
    <aside className={cn("rounded-md border-l-4 p-4 text-sm [&>p]:m-0", style.className)}>
      <p className="mb-1 font-semibold">{style.label}</p>
      {children}
    </aside>
  );
}
