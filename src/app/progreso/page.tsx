import { Suspense } from "react";
import { modules } from "@/content/curriculum";
import { getDiagnosticQuestion } from "@/content/diagnostic";
import { getCurrentUser } from "@/lib/auth/current-user";
import {
  getCompletedLessons,
  getConceptStatuses,
  getLastCompletedRun,
  getPassedExercises,
  getRunAttempts,
} from "@/lib/data/progress";
import { buildProgressReport } from "@/lib/progress/report";
import { Card } from "@/components/ui/card";
import { CopyReport } from "./copy-report";

export const metadata = { title: "Progreso · LearnReact" };

export default function ProgresoPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Tu progreso</h1>
        <p className="max-w-2xl text-muted">
          Copia este resumen y pégalo en tu conversación con Claude: con él se generan los
          siguientes módulos adaptados a tus huecos y conceptos frágiles.
        </p>
      </header>
      <Suspense fallback={<Card>Preparando el resumen…</Card>}>
        <Report />
      </Suspense>
    </div>
  );
}

async function Report() {
  const user = await getCurrentUser();
  const [statuses, run, lessons, exercises] = await Promise.all([
    getConceptStatuses(user.id),
    getLastCompletedRun(user.id),
    getCompletedLessons(user.id),
    getPassedExercises(user.id),
  ]);
  const attempts = run ? await getRunAttempts(run.id) : [];
  const text = buildProgressReport({
    modules,
    statuses,
    diagnosticDate: run?.completedAt ?? null,
    attempts,
    getQuestion: getDiagnosticQuestion,
    completedLessons: lessons,
    passedExercises: exercises,
  });
  return <CopyReport text={text} />;
}
