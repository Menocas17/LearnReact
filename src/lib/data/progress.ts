import "server-only";
import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { getDb } from "@/db";
import {
  conceptStatus,
  diagnosticRun,
  exerciseResult,
  lessonProgress,
  questionAttempt,
} from "@/db/schema";
import type { ConceptStatus } from "@/content/types";

export type DiagnosticRun = typeof diagnosticRun.$inferSelect;

export async function getOpenRun(userId: string): Promise<DiagnosticRun | undefined> {
  const db = await getDb();
  const [run] = await db
    .select()
    .from(diagnosticRun)
    .where(and(eq(diagnosticRun.userId, userId), isNull(diagnosticRun.completedAt)))
    .orderBy(desc(diagnosticRun.startedAt))
    .limit(1);
  return run;
}

export async function getLastCompletedRun(userId: string): Promise<DiagnosticRun | undefined> {
  const db = await getDb();
  const [run] = await db
    .select()
    .from(diagnosticRun)
    .where(and(eq(diagnosticRun.userId, userId), isNotNull(diagnosticRun.completedAt)))
    .orderBy(desc(diagnosticRun.completedAt))
    .limit(1);
  return run;
}

export async function getRunAttempts(runId: string) {
  const db = await getDb();
  return db
    .select()
    .from(questionAttempt)
    .where(eq(questionAttempt.diagnosticRunId, runId))
    .orderBy(asc(questionAttempt.createdAt));
}

export async function getConceptStatuses(userId: string): Promise<Map<string, ConceptStatus>> {
  const db = await getDb();
  const rows = await db
    .select({ conceptId: conceptStatus.conceptId, status: conceptStatus.status })
    .from(conceptStatus)
    .where(eq(conceptStatus.userId, userId));
  return new Map(rows.map((r) => [r.conceptId, r.status]));
}

export async function getCompletedLessons(userId: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, userId));
  return new Set(rows.map((r) => r.lessonId));
}

export async function getPassedExercises(userId: string): Promise<Set<string>> {
  const db = await getDb();
  const rows = await db
    .select({ exerciseId: exerciseResult.exerciseId })
    .from(exerciseResult)
    .where(eq(exerciseResult.userId, userId));
  return new Set(rows.map((r) => r.exerciseId));
}

export async function getLessonAttempts(userId: string, lessonId: string) {
  const db = await getDb();
  return db
    .select()
    .from(questionAttempt)
    .where(and(eq(questionAttempt.userId, userId), eq(questionAttempt.lessonId, lessonId)))
    .orderBy(asc(questionAttempt.createdAt));
}
