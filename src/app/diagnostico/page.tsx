import { Suspense } from "react";
import { cacheLife } from "next/cache";
import { diagnosticSections } from "@/content/diagnostic";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLastCompletedRun, getOpenRun, getRunAttempts } from "@/lib/data/progress";
import { gradeAnswer, toPublicQuestion } from "@/lib/questions/public";
import { getDiagnosticQuestion } from "@/content/diagnostic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { startDiagnostic } from "./actions";
import { DiagnosticFlow, type PublicSection } from "./diagnostic-flow";

export const metadata = { title: "Diagnóstico · LearnReact" };

/** Las preguntas (sin respuestas) y su código resaltado son estáticos: se cachean. */
async function getPublicSections(): Promise<PublicSection[]> {
  "use cache";
  cacheLife("max");
  return Promise.all(
    diagnosticSections.map(async (s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      questions: await Promise.all(s.questions.map(toPublicQuestion)),
    })),
  );
}

export default function DiagnosticoPage() {
  const total = diagnosticSections.reduce((n, s) => n + s.questions.length, 0);
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Diagnóstico</h1>
        <p className="max-w-2xl text-muted">
          {total} preguntas en {diagnosticSections.length} secciones para encontrar tus huecos. Responde
          sin buscar nada: si dudas, dilo. Una respuesta correcta pero insegura marca el concepto como
          frágil, no como dominado. Puedes dejarlo a medias y continuar después.
        </p>
      </header>
      <Suspense fallback={<Card>Cargando tu diagnóstico…</Card>}>
        <DiagnosticState />
      </Suspense>
    </div>
  );
}

async function DiagnosticState() {
  const user = await getCurrentUser();
  const run = await getOpenRun(user.id);

  if (!run) {
    const last = await getLastCompletedRun(user.id);
    return (
      <Card className="space-y-4">
        <p>
          {last
            ? `Completaste un diagnóstico el ${last.completedAt?.toLocaleDateString("es")}. Puedes repetirlo cuando quieras: el nuevo resultado actualizará tu mapa.`
            : "Aún no has hecho el diagnóstico. Tarda entre 45 y 75 minutos; puedes saltarte las secciones que no hayas visto nunca."}
        </p>
        <form action={startDiagnostic}>
          <Button type="submit">{last ? "Repetir diagnóstico" : "Empezar diagnóstico"}</Button>
        </form>
      </Card>
    );
  }

  const [sections, attempts] = await Promise.all([getPublicSections(), getRunAttempts(run.id)]);
  const answered = Object.fromEntries(
    attempts.flatMap((a) => {
      const q = getDiagnosticQuestion(a.questionId);
      return q ? [[a.questionId, { selected: a.selectedOption, result: gradeAnswer(q, a.selectedOption) }]] : [];
    }),
  );

  return <DiagnosticFlow sections={sections} answered={answered} skipped={run.skippedSections} />;
}
