"use client";

import { useState, useTransition } from "react";
import { QuestionCard } from "@/components/question-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import type { AnswerResult, PublicQuestion } from "@/lib/questions/public";
import { answerDiagnosticQuestion, finishDiagnostic, skipSection } from "./actions";

export type PublicSection = {
  id: string;
  title: string;
  description: string;
  questions: PublicQuestion[];
};

type Answered = Record<string, { selected: string; result: AnswerResult }>;

type Props = {
  sections: PublicSection[];
  answered: Answered;
  skipped: string[];
};

/** Primera pregunta sin responder de la primera sección no saltada. */
function findPosition(sections: PublicSection[], answered: Answered, skipped: string[]) {
  for (const section of sections) {
    if (skipped.includes(section.id)) continue;
    const question = section.questions.find((q) => !answered[q.id]);
    if (question) return { section, question };
  }
  return null;
}

export function DiagnosticFlow({ sections, answered: initialAnswered, skipped }: Props) {
  const [answered, setAnswered] = useState(initialAnswered);
  // Pregunta recién respondida cuyo feedback se está mostrando.
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  // Secciones en las que se pulsó "Empezar" (o que ya tienen respuestas).
  const [started, setStarted] = useState(
    () => new Set(sections.filter((s) => s.questions.some((q) => initialAnswered[q.id])).map((s) => s.id)),
  );
  const [pending, startTransition] = useTransition();

  const position = findPosition(sections, answered, skipped);
  const activeSections = sections.filter((s) => !skipped.includes(s.id));
  const total = activeSections.reduce((n, s) => n + s.questions.length, 0);
  const done = activeSections.reduce((n, s) => n + s.questions.filter((q) => answered[q.id]).length, 0);
  const reviewing = reviewingId
    ? sections.flatMap((s) => s.questions).find((q) => q.id === reviewingId)
    : undefined;

  let content: React.ReactNode;
  if (reviewing) {
    content = (
      <QuestionCard
        key={reviewing.id}
        question={reviewing}
        answer={answerDiagnosticQuestion}
        initial={answered[reviewing.id]}
        footer={
          <Button onClick={() => setReviewingId(null)} autoFocus>
            {position ? "Siguiente" : "Ver resultado"}
          </Button>
        }
      />
    );
  } else if (!position) {
    content = (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Has terminado todas las secciones</h2>
        <p className="text-muted">
          Al finalizar se calcula el estado de cada concepto (dominado, frágil o hueco) y verás tu mapa.
        </p>
        <form action={finishDiagnostic}>
          <Button type="submit">Finalizar y ver mi mapa</Button>
        </form>
      </div>
    );
  } else if (!started.has(position.section.id)) {
    const { section } = position;
    content = (
      <div className="space-y-4">
        <p className="text-sm text-muted">Sección</p>
        <h2 className="text-xl font-semibold">{section.title}</h2>
        <p>{section.description}</p>
        <p className="text-sm text-muted">{section.questions.length} preguntas</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setStarted((s) => new Set(s).add(section.id))}>Empezar sección</Button>
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => startTransition(() => skipSection(section.id))}
          >
            No lo he visto: marcar como hueco
          </Button>
        </div>
      </div>
    );
  } else {
    const { question, section } = position;
    const index = section.questions.indexOf(question);
    content = (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          {section.title} · pregunta {index + 1} de {section.questions.length}
        </p>
        <QuestionCard
          key={question.id}
          question={question}
          answer={answerDiagnosticQuestion}
          onAnswered={(result, selected) => {
            setAnswered((a) => ({ ...a, [question.id]: { selected, result } }));
            setReviewingId(question.id);
          }}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
      <aside className="space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-sm text-muted">
            <span>Progreso</span>
            <span>
              {done}/{total}
            </span>
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-subtle"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={done}
          >
            <div className="h-full bg-primary transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
          </div>
        </div>
        <ol className="space-y-1 text-sm">
          {sections.map((s) => {
            const count = s.questions.filter((q) => answered[q.id]).length;
            const isSkipped = skipped.includes(s.id);
            return (
              <li
                key={s.id}
                className={cn(
                  "flex justify-between gap-2 rounded px-2 py-1",
                  s.id === position?.section.id && "bg-subtle font-medium",
                  isSkipped && "text-muted line-through",
                )}
              >
                <span>{s.title}</span>
                <span className="text-muted">{isSkipped ? "—" : `${count}/${s.questions.length}`}</span>
              </li>
            );
          })}
        </ol>
      </aside>
      <Card className="min-h-80">{content}</Card>
    </div>
  );
}
