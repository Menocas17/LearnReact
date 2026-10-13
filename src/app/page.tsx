import Link from "next/link";
import { Suspense } from "react";
import { blocks, modules } from "@/content/curriculum";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getConceptStatuses, getLastCompletedRun, getOpenRun } from "@/lib/data/progress";
import { moduleCounts, recommendedModule } from "@/lib/progress/summary";
import { Card } from "@/components/ui/card";
import { buttonClasses } from "@/components/ui/button";
import { StatusDot } from "@/components/status";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">De JavaScript a React, sin vacíos</h1>
        <p className="max-w-2xl text-muted">
          {modules.length} módulos y {modules.reduce((n, m) => n + m.concepts.length, 0)} conceptos
          conectados por prerrequisitos. El diagnóstico detecta qué dominas, qué es frágil y dónde
          tienes huecos, y la ruta se adapta a eso.
        </p>
      </section>

      <Suspense fallback={<Card>Cargando tu progreso…</Card>}>
        <NextStep />
      </Suspense>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Currículo</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {blocks.map((block) => (
            <Card key={block.id} className="space-y-2">
              <h3 className="font-medium">
                {block.id}. {block.title}
              </h3>
              <p className="text-sm text-muted">{block.description}</p>
              <ul className="space-y-1 text-sm">
                {modules
                  .filter((m) => m.block === block.id)
                  .map((m) => (
                    <li key={m.id}>
                      <Link href={`/modulos/${m.slug}`} className="hover:underline">
                        {m.number}. {m.title}
                      </Link>
                    </li>
                  ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

async function NextStep() {
  const user = await getCurrentUser();
  const [openRun, lastRun, statuses] = await Promise.all([
    getOpenRun(user.id),
    getLastCompletedRun(user.id),
    getConceptStatuses(user.id),
  ]);

  if (openRun || !lastRun) {
    return (
      <Card className="space-y-3">
        <h2 className="font-semibold">{openRun ? "Tienes un diagnóstico a medias" : "Empieza por el diagnóstico"}</h2>
        <p className="text-sm text-muted">
          {openRun
            ? "Continúa donde lo dejaste. Al terminar verás tu mapa de conceptos."
            : "Antes de estudiar, averigua qué dominas de verdad. Así no repites lo que ya sabes ni te saltas lo que te falta."}
        </p>
        <Link href="/diagnostico" className={buttonClasses()}>
          {openRun ? "Continuar diagnóstico" : "Hacer el diagnóstico"}
        </Link>
      </Card>
    );
  }

  const next = recommendedModule(modules, statuses);
  if (!next) {
    return (
      <Card>
        <p>No hay huecos ni conceptos frágiles en lo evaluado. Revisa el mapa para ver lo que queda sin evaluar.</p>
      </Card>
    );
  }
  const counts = moduleCounts(next, statuses);
  return (
    <Card className="space-y-3">
      <p className="text-sm text-muted">Siguiente paso recomendado</p>
      <h2 className="text-xl font-semibold">
        Módulo {next.number}: {next.title}
      </h2>
      <p className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-1.5">
          <StatusDot status="hueco" /> {counts.hueco} huecos
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot status="fragil" /> {counts.fragil} frágiles
        </span>
        <span className="flex items-center gap-1.5">
          <StatusDot status="dominado" /> {counts.dominado} dominados
        </span>
      </p>
      <div className="flex gap-2">
        <Link href={`/modulos/${next.slug}`} className={buttonClasses()}>
          Ir al módulo
        </Link>
        <Link href="/mapa" className={buttonClasses("secondary")}>
          Ver mapa completo
        </Link>
      </div>
    </Card>
  );
}
