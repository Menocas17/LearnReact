import Link from "next/link";
import { Suspense } from "react";
import { blocks, modules } from "@/content/curriculum";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getConceptStatuses } from "@/lib/data/progress";
import { moduleCounts } from "@/lib/progress/summary";
import { Card } from "@/components/ui/card";
import { StatusDot, StatusLegend, statusLabel } from "@/components/status";

export const metadata = { title: "Mapa · LearnReact" };

export default function MapaPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold">Mapa de conceptos</h1>
        <p className="max-w-2xl text-muted">
          Cada punto es un concepto. El color indica tu dominio según el diagnóstico y tus lecciones.
        </p>
        <StatusLegend />
      </header>
      <Suspense fallback={<Card>Cargando tu mapa…</Card>}>
        <ConceptMap />
      </Suspense>
    </div>
  );
}

async function ConceptMap() {
  const user = await getCurrentUser();
  const statuses = await getConceptStatuses(user.id);

  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <section key={block.id} className="space-y-3">
          <h2 className="text-lg font-semibold">
            {block.id}. {block.title}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {modules
              .filter((m) => m.block === block.id)
              .map((m) => {
                const counts = moduleCounts(m, statuses);
                return (
                  <Card key={m.id} className="space-y-3 p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <Link href={`/modulos/${m.slug}`} className="font-medium hover:underline">
                        {m.number}. {m.title}
                      </Link>
                      <span className="shrink-0 text-xs text-muted">
                        {counts.dominado}/{m.concepts.length}
                      </span>
                    </div>
                    <ul className="flex flex-wrap gap-1.5">
                      {m.concepts.map((c) => {
                        const status = statuses.get(c.id) ?? "sin-evaluar";
                        return (
                          <li key={c.id} title={`${c.title} — ${statusLabel[status]}`}>
                            <StatusDot status={status} className="size-3.5" />
                            <span className="sr-only">
                              {c.title}: {statusLabel[status]}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </Card>
                );
              })}
          </div>
        </section>
      ))}
    </div>
  );
}
