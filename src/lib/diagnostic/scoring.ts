import type { ConceptStatus, DiagnosticSection, Question } from "@/content/types";

export type AttemptInput = {
  questionId: string;
  correct: boolean;
  /** true = "estoy seguro"; false = "estoy dudando". */
  confident: boolean;
};

export type ConceptResult = {
  status: ConceptStatus;
  /** Puntuación media 0–1: correcta y segura = 1, correcta dudando = 0.5, fallo = 0. */
  score: number;
  answered: number;
};

function points(attempt: AttemptInput): number {
  if (!attempt.correct) return 0;
  return attempt.confident ? 1 : 0.5;
}

/**
 * Convierte las respuestas del diagnóstico en un estado por concepto:
 * - dominado: todas las preguntas del concepto correctas y respondidas con seguridad.
 * - frágil: puntuación media ≥ 0.5 (aciertas, pero dudas o fallas alguna variante).
 * - hueco: puntuación media < 0.5, o la sección se marcó como "no lo he visto".
 * Los conceptos sin preguntas respondidas no aparecen (quedan "sin evaluar").
 * Si una pregunta tiene varios intentos, cuenta el primero: es el que refleja lo que sabías.
 */
export function scoreConcepts(
  questions: readonly Question[],
  attempts: readonly AttemptInput[],
  skippedConceptIds: Iterable<string> = [],
): Map<string, ConceptResult> {
  const firstAttempt = new Map<string, AttemptInput>();
  for (const attempt of attempts) {
    if (!firstAttempt.has(attempt.questionId)) firstAttempt.set(attempt.questionId, attempt);
  }

  const pointsByConcept = new Map<string, number[]>();
  for (const question of questions) {
    const attempt = firstAttempt.get(question.id);
    if (!attempt) continue;
    for (const conceptId of question.concepts) {
      const list = pointsByConcept.get(conceptId) ?? [];
      list.push(points(attempt));
      pointsByConcept.set(conceptId, list);
    }
  }

  const results = new Map<string, ConceptResult>();
  for (const conceptId of skippedConceptIds) {
    results.set(conceptId, { status: "hueco", score: 0, answered: 0 });
  }
  for (const [conceptId, list] of pointsByConcept) {
    const score = list.reduce((sum, p) => sum + p, 0) / list.length;
    const status: ConceptStatus = score === 1 ? "dominado" : score >= 0.5 ? "fragil" : "hueco";
    results.set(conceptId, { status, score, answered: list.length });
  }
  return results;
}

/** Ids de los conceptos de los módulos que cubre una sección. */
export function sectionConceptIds(
  section: DiagnosticSection,
  conceptsByModule: (moduleId: string) => readonly { id: string }[],
): string[] {
  return section.modules.flatMap((m) => conceptsByModule(m).map((c) => c.id));
}
