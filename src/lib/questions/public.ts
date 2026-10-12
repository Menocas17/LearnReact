import "server-only";
import type { Question } from "@/content/types";
import { highlight } from "@/lib/highlight";

/** Pregunta sin la respuesta: es lo único que viaja al navegador. */
export type PublicQuestion = {
  id: string;
  kind: Question["kind"];
  prompt: string;
  codeHtml: string | null;
  options: Question["options"];
};

export type AnswerResult = {
  correct: boolean;
  correctOptionId: string;
  explanation: string;
};

export async function toPublicQuestion(q: Question): Promise<PublicQuestion> {
  return {
    id: q.id,
    kind: q.kind,
    prompt: q.prompt,
    codeHtml: q.code ? await highlight(q.code.source, q.code.lang) : null,
    options: q.options,
  };
}

export function gradeAnswer(q: Question, optionId: string): AnswerResult {
  return {
    correct: optionId === q.correct,
    correctOptionId: q.correct,
    explanation: q.explanation,
  };
}
