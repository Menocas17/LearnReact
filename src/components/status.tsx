import type { ConceptStatus } from "@/content/types";
import { cn } from "@/lib/cn";

export type StatusOrNone = ConceptStatus | "sin-evaluar";

export const statusLabel: Record<StatusOrNone, string> = {
  dominado: "Dominado",
  fragil: "Frágil",
  hueco: "Hueco",
  "sin-evaluar": "Sin evaluar",
};

const dot: Record<StatusOrNone, string> = {
  dominado: "bg-dominado",
  fragil: "bg-fragil",
  hueco: "bg-hueco",
  "sin-evaluar": "bg-sin-evaluar",
};

export function StatusDot({ status, className }: { status: StatusOrNone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block size-2.5 shrink-0 rounded-full", dot[status], className)}
    />
  );
}

export function StatusBadge({ status }: { status: StatusOrNone }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5 text-xs">
      <StatusDot status={status} />
      {statusLabel[status]}
    </span>
  );
}

export function StatusLegend() {
  return (
    <ul className="flex flex-wrap gap-4 text-sm text-muted">
      {(Object.keys(statusLabel) as StatusOrNone[]).map((s) => (
        <li key={s} className="flex items-center gap-1.5">
          <StatusDot status={s} />
          {statusLabel[s]}
        </li>
      ))}
    </ul>
  );
}
