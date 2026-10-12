import type { ExerciseDef, LessonDef, Question } from "../types";
import { closures } from "./js-profundo/closures/leccion";

/**
 * Registro de lecciones. Cada lección vive en
 * src/content/lessons/<slug-del-módulo>/<slug>/ con leccion.mdx + leccion.ts.
 */
export const lessons: readonly LessonDef[] = [closures];

/**
 * Módulos publicados: el validador exige que cada concepto de un módulo
 * publicado esté cubierto por al menos una lección, una pregunta y un ejercicio.
 * Se añade un módulo aquí cuando está completo.
 */
export const publishedModules: readonly string[] = [];

export function lessonsForModule(moduleId: string): LessonDef[] {
  return lessons.filter((l) => l.moduleId === moduleId);
}

export function getLesson(moduleId: string, slug: string): LessonDef | undefined {
  return lessons.find((l) => l.moduleId === moduleId && l.slug === slug);
}

const questionIndex = new Map<string, { question: Question; lesson: LessonDef }>();
const exerciseIndex = new Map<string, { exercise: ExerciseDef; lesson: LessonDef }>();
for (const lesson of lessons) {
  for (const question of lesson.questions) questionIndex.set(question.id, { question, lesson });
  for (const exercise of lesson.exercises) exerciseIndex.set(exercise.id, { exercise, lesson });
}

export function findLessonQuestion(id: string) {
  return questionIndex.get(id);
}

export function findLessonExercise(id: string) {
  return exerciseIndex.get(id);
}
