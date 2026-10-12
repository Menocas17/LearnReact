"use server";

import { randomUUID } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { conceptStatus, diagnosticRun, questionAttempt } from "@/db/schema";
import { getModuleById } from "@/content/curriculum";
import {
  diagnosticQuestions,
  getDiagnosticQuestion,
  getDiagnosticSection,
} from "@/content/diagnostic";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getOpenRun, getRunAttempts } from "@/lib/data/progress";
import { scoreConcepts, sectionConceptIds } from "@/lib/diagnostic/scoring";
import { answerInput, type AnswerInput } from "@/lib/questions/answer-input";
import { gradeAnswer, type AnswerResult } from "@/lib/questions/public";

const conceptsOfModule = (moduleId: string) => getModuleById(moduleId)?.concepts ?? [];

/** Empieza un diagnóstico nuevo (si hay uno abierto, lo reutiliza). */
export async function startDiagnostic() {
  const user = await getCurrentUser();
  if (!(await getOpenRun(user.id))) {
    const db = await getDb();
    await db.insert(diagnosticRun).values({ id: randomUUID(), userId: user.id });
  }
  refresh();
}

/** Marca una sección como "no lo he visto": sus conceptos quedarán como hueco. */
export async function skipSection(sectionId: string) {
  const user = await getCurrentUser();
  const run = await getOpenRun(user.id);
  if (!run || !getDiagnosticSection(sectionId)) throw new Error("Sección o diagnóstico no válido");
  if (!run.skippedSections.includes(sectionId)) {
    const db = await getDb();
    await db
      .update(diagnosticRun)
      .set({ skippedSections: [...run.skippedSections, sectionId] })
      .where(eq(diagnosticRun.id, run.id));
  }
  refresh();
}

export async function answerDiagnosticQuestion(raw: AnswerInput): Promise<AnswerResult> {
  const input = answerInput.parse(raw);
  const user = await getCurrentUser();
  const run = await getOpenRun(user.id);
  const question = getDiagnosticQuestion(input.questionId);
  if (!run || !question) throw new Error("Pregunta o diagnóstico no válido");

  const db = await getDb();
  // Solo cuenta la primera respuesta: si ya existe, se devuelve su resultado.
  const [previous] = await db
    .select()
    .from(questionAttempt)
    .where(
      and(eq(questionAttempt.diagnosticRunId, run.id), eq(questionAttempt.questionId, question.id)),
    )
    .limit(1);
  if (previous) return gradeAnswer(question, previous.selectedOption);

  const result = gradeAnswer(question, input.optionId);
  await db.insert(questionAttempt).values({
    id: randomUUID(),
    userId: user.id,
    questionId: question.id,
    diagnosticRunId: run.id,
    selectedOption: input.optionId,
    correct: result.correct,
    confident: input.confident,
  });
  return result;
}

/** Calcula el estado de cada concepto y cierra el diagnóstico. */
export async function finishDiagnostic() {
  const user = await getCurrentUser();
  const run = await getOpenRun(user.id);
  if (!run) redirect("/mapa");

  const attempts = await getRunAttempts(run.id);
  const skipped = run.skippedSections.flatMap((id) => {
    const section = getDiagnosticSection(id);
    return section ? sectionConceptIds(section, conceptsOfModule) : [];
  });
  const results = scoreConcepts(diagnosticQuestions, attempts, skipped);

  const db = await getDb();
  const rows = [...results].map(([conceptId, r]) => ({
    userId: user.id,
    conceptId,
    status: r.status,
    source: "diagnostico" as const,
    updatedAt: new Date(),
  }));
  if (rows.length > 0) {
    await db
      .insert(conceptStatus)
      .values(rows)
      .onConflictDoUpdate({
        target: [conceptStatus.userId, conceptStatus.conceptId],
        set: {
          status: sql`excluded.status`,
          source: sql`excluded.source`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
  }
  await db.update(diagnosticRun).set({ completedAt: new Date() }).where(eq(diagnosticRun.id, run.id));
  redirect("/mapa");
}
