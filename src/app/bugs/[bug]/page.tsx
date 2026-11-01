import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { bugs, getBug, levelLabel } from "@/content/bugs";
import { getModuleById } from "@/content/curriculum";
import { lessons } from "@/content/lessons";
import { ExerciseClient } from "@/components/lesson/exercise-client";

export function generateStaticParams() {
  return bugs.map((b) => ({ bug: b.id }));
}

export async function generateMetadata({ params }: PageProps<"/bugs/[bug]">) {
  const bug = getBug((await params).bug);
  return { title: bug ? `${bug.title} · LearnReact` : "Bug" };
}

export default function BugPage({ params }: PageProps<"/bugs/[bug]">) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-subtle" />}>
      <Bug params={params} />
    </Suspense>
  );
}

async function Bug({ params }: Pick<PageProps<"/bugs/[bug]">, "params">) {
  const bug = getBug((await params).bug);
  if (!bug) notFound();
  const index = bugs.indexOf(bug);
  const prev = bugs[index - 1];
  const next = bugs[index + 1];
  const lesson = lessons.find((l) => l.id === bug.lessonId);
  const mod = getModuleById(bug.moduleId);

  return (
    <article className="mx-auto max-w-4xl space-y-4">
      <p className="text-sm text-muted">
        <Link href="/bugs" className="hover:underline">
          Bugs
        </Link>{" "}
        · {levelLabel[bug.level]} · {index + 1} de {bugs.length}
      </p>
      <ExerciseClient
        id={bug.id}
        title={bug.title}
        instructions={bug.instructions}
        starter={bug.starter}
        tests={bug.tests}
        hints={bug.hints}
        header={
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded bg-hueco/15 px-2 py-0.5 font-semibold text-hueco">BUG</span>
              <span className="rounded border border-border px-2 py-0.5">{levelLabel[bug.level]}</span>
              <span className="text-muted">Reportado por {bug.report.reportedBy}</span>
            </div>
            <h1 className="text-xl font-semibold">{bug.title}</h1>
            <dl className="grid gap-3 text-sm sm:grid-cols-[10rem_1fr]">
              <dt className="font-medium text-muted">Dónde</dt>
              <dd>{bug.report.where}</dd>
              <dt className="font-medium text-muted">Descripción</dt>
              <dd>{bug.instructions}</dd>
              <dt className="font-medium text-muted">Pasos</dt>
              <dd>
                <ol className="list-decimal space-y-1 pl-5">
                  {bug.report.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </dd>
              <dt className="font-medium text-hueco">Resultado actual</dt>
              <dd>{bug.report.actual}</dd>
              <dt className="font-medium text-dominado">Resultado esperado</dt>
              <dd>{bug.report.expected}</dd>
            </dl>
            <p className="text-xs text-muted">
              Los tests reproducen el ticket: arregla el código hasta que pasen todos.
            </p>
          </header>
        }
      />
      <p className="text-sm text-muted">
        ¿Te falta la base?{" "}
        {lesson ? (
          <>
            Lección:{" "}
            <Link href={`/modulos/${lesson.id}`} className="text-primary hover:underline">
              {lesson.title}
            </Link>
          </>
        ) : (
          mod && (
            <>
              Módulo:{" "}
              <Link href={`/modulos/${mod.slug}`} className="text-primary hover:underline">
                {mod.title}
              </Link>
            </>
          )
        )}
      </p>
      <nav className="flex justify-between text-sm">
        {prev ? <Link href={`/bugs/${prev.id}`} className="hover:underline">← {prev.title}</Link> : <span />}
        {next ? <Link href={`/bugs/${next.id}`} className="hover:underline">{next.title} →</Link> : <span />}
      </nav>
    </article>
  );
}
