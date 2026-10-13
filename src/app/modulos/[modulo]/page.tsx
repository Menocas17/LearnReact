import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getConcept, getModuleBySlug, modules } from "@/content/curriculum";
import { lessonsForModule } from "@/content/lessons";
import type { ConceptStatus, ModuleDef } from "@/content/types";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCompletedLessons, getConceptStatuses } from "@/lib/data/progress";
import { Card } from "@/components/ui/card";
import { StatusBadge, StatusLegend } from "@/components/status";

export function generateStaticParams() {
  return modules.map((m) => ({ modulo: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/modulos/[modulo]">) {
  const mod = getModuleBySlug((await params).modulo);
  return { title: mod ? `${mod.title} · LearnReact` : "Módulo" };
}

export default function ModulePage({ params }: PageProps<"/modulos/[modulo]">) {
  // params se lee dentro de Suspense para que el App Shell no dependa de la URL.
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-subtle" />}>
      <Module params={params} />
    </Suspense>
  );
}

async function Module({ params }: Pick<PageProps<"/modulos/[modulo]">, "params">) {
  const mod = getModuleBySlug((await params).modulo);
  if (!mod) notFound();
  const lessons = lessonsForModule(mod.id);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted">
          Módulo {mod.number} · Bloque {mod.block}
        </p>
        <h1 className="text-2xl font-semibold">{mod.title}</h1>
        <p className="max-w-2xl text-muted">{mod.summary}</p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lecciones</h2>
        {lessons.length === 0 ? (
          <Card className="text-sm text-muted">
            Las lecciones de este módulo se generan cuando llegues a él, adaptadas a tu diagnóstico.
          </Card>
        ) : (
          <ul className="space-y-2">
            {lessons.map((l) => (
              <li key={l.id}>
                <Card className="flex items-center justify-between gap-4 p-4">
                  <div>
                    <Link href={`/modulos/${mod.slug}/${l.slug}`} className="font-medium hover:underline">
                      {l.title}
                    </Link>
                    <p className="text-sm text-muted">{l.summary}</p>
                  </div>
                  <span className="shrink-0 text-sm text-muted">
                    {l.minutes} min
                    <Suspense fallback={null}>
                      <LessonDone lessonId={l.id} />
                    </Suspense>
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">Conceptos ({mod.concepts.length})</h2>
          <StatusLegend />
        </div>
        <Suspense fallback={<ConceptList mod={mod} />}>
          <ConceptListWithStatus mod={mod} />
        </Suspense>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Proyecto</h2>
        {mod.projects.map((p) => (
          <Card key={p.id} className="space-y-1">
            <h3 className="font-medium">{p.title}</h3>
            <p className="text-sm text-muted">{p.description}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}

async function LessonDone({ lessonId }: { lessonId: string }) {
  const user = await getCurrentUser();
  const done = await getCompletedLessons(user.id);
  return done.has(lessonId) ? <span className="ml-2 text-dominado">✓ completada</span> : null;
}

async function ConceptListWithStatus({ mod }: { mod: ModuleDef }) {
  const user = await getCurrentUser();
  return <ConceptList mod={mod} statuses={await getConceptStatuses(user.id)} />;
}

function ConceptList({ mod, statuses }: { mod: ModuleDef; statuses?: Map<string, ConceptStatus> }) {
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {mod.concepts.map((c) => (
        <li key={c.id} className="flex flex-col gap-1 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <p className="font-medium">{c.title}</p>
            <p className="text-sm text-muted">{c.description}</p>
            {c.prereqs.length > 0 && (
              <p className="text-xs text-muted">
                Requiere: {c.prereqs.map((p) => getConcept(p)?.title ?? p).join(", ")}
              </p>
            )}
          </div>
          {statuses && <StatusBadge status={statuses.get(c.id) ?? "sin-evaluar"} />}
        </li>
      ))}
    </ul>
  );
}
