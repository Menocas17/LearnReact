import { findLessonQuestion } from "@/content/lessons";
import { QuestionCard } from "@/components/question-card";
import { toPublicQuestion } from "@/lib/questions/public";
import { answerLessonQuestion } from "@/app/modulos/actions";

/** <Pregunta id="…" /> en MDX: busca la pregunta en el registro de lecciones. */
export async function Pregunta({ id }: { id: string }) {
  const found = findLessonQuestion(id);
  if (!found) throw new Error(`Pregunta inexistente en MDX: ${id}`);
  const question = await toPublicQuestion(found.question);
  return (
    <div className="not-prose rounded-lg border border-border bg-card p-5">
      <p className="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
        {found.question.kind === "predecir" ? "Predice el resultado" : "Pregunta"}
      </p>
      <QuestionCard question={question} answer={answerLessonQuestion} />
    </div>
  );
}
