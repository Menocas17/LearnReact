import type { DiagnosticSection, Question } from "../types";
import { jsAsync, jsDom, jsFuncional, jsFundamentos, jsProfundo } from "./js";
import { nextjs } from "./nextjs";
import { reactAFondo, reactFundamentos, reactModerno, reactTs } from "./react";
import { typescript } from "./typescript";

/** Orden en que se presentan las secciones del diagnóstico. */
export const diagnosticSections: readonly DiagnosticSection[] = [
  jsFundamentos,
  jsProfundo,
  jsDom,
  jsAsync,
  jsFuncional,
  typescript,
  reactFundamentos,
  reactAFondo,
  reactModerno,
  reactTs,
  nextjs,
];

export const diagnosticQuestions: readonly Question[] = diagnosticSections.flatMap(
  (s) => s.questions,
);

const questionById = new Map(diagnosticQuestions.map((q) => [q.id, q]));

export function getDiagnosticQuestion(id: string): Question | undefined {
  return questionById.get(id);
}

export function getDiagnosticSection(id: string): DiagnosticSection | undefined {
  return diagnosticSections.find((s) => s.id === id);
}
