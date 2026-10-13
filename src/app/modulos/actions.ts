"use server";

import { randomUUID } from "node:crypto";
import { refresh } from "next/cache";
import { z } from "zod";
import { getDb } from "@/db";
import { exerciseResult, lessonProgress, questionAttempt } from "@/db/schema";
import { findLessonExercise, findLessonQuestion, lessons } from "@/content/lessons";
import { getCurrentUser } from "@/lib/auth/current-user";
import { answerInput, type AnswerInput } from "@/lib/questions/answer-input";
import { gradeAnswer, type AnswerResult } from "@/lib/questions/public";

export async function answerLessonQuestion(raw: AnswerInput): Promise<AnswerResult> {
  const input = answerInput.parse(raw);
  const user = await getCurrentUser();
  const found = findLessonQuestion(input.questionId);
  if (!found) throw new Error("Pregunta no válida");

  const result = gradeAnswer(found.question, input.optionId);
  const db = await getDb();
  await db.insert(questionAttempt).values({
    id: randomUUID(),
    userId: user.id,
    questionId: found.question.id,
    lessonId: found.lesson.id,
    selectedOption: input.optionId,
    correct: result.correct,
    confident: input.confident,
  });
  return result;
}

const exerciseId = z.string().min(1).max(200);

/** Se llama cuando todos los tests del ejercicio pasan en el navegador. */
export async function recordExercisePassed(rawId: string) {
  const id = exerciseId.parse(rawId);
  const user = await getCurrentUser();
  if (!findLessonExercise(id)) throw new Error("Ejercicio no válido");
  const db = await getDb();
  await db.insert(exerciseResult).values({ userId: user.id, exerciseId: id }).onConflictDoNothing();
  refresh();
}

/** La solución no viaja al navegador hasta que la pides. */
export async function revealSolution(rawId: string): Promise<Record<string, string>> {
  const id = exerciseId.parse(rawId);
  await getCurrentUser();
  const found = findLessonExercise(id);
  if (!found) throw new Error("Ejercicio no válido");
  return { ...found.exercise.solution };
}

export async function completeLesson(rawId: string) {
  const id = z.string().parse(rawId);
  const user = await getCurrentUser();
  if (!lessons.some((l) => l.id === id)) throw new Error("Lección no válida");
  const db = await getDb();
  await db.insert(lessonProgress).values({ userId: user.id, lessonId: id }).onConflictDoNothing();
  refresh();
}
