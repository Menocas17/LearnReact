import type { ExerciseDef, LessonDef, Question } from "../types";
import { tiposYCoercion } from "./js-fundamentos/tipos-y-coercion/leccion";
import { cortocircuitoYControl } from "./js-fundamentos/cortocircuito-y-control/leccion";
import { variablesYFunciones } from "./js-fundamentos/variables-y-funciones/leccion";
import { stringsNumerosFechas } from "./js-fundamentos/strings-numeros-fechas/leccion";
import { objetosArraysJson } from "./js-fundamentos/objetos-arrays-json/leccion";
import { metodosDeArray } from "./js-fundamentos/metodos-de-array/leccion";
import { destructuringYSpread } from "./js-fundamentos/destructuring-y-spread/leccion";
import { closures } from "./js-profundo/closures/leccion";
import { scopeYHoisting } from "./js-profundo/scope-y-hoisting/leccion";
import { valoresYReferencias } from "./js-profundo/valores-y-referencias/leccion";
import { thisLesson } from "./js-profundo/this/leccion";
import { prototiposYClases } from "./js-profundo/prototipos-y-clases/leccion";
import { objetosYColecciones } from "./js-profundo/objetos-y-colecciones/leccion";
import { modulosYErrores } from "./js-profundo/modulos-y-errores/leccion";

/**
 * Registro de lecciones. Cada lección vive en
 * src/content/lessons/<slug-del-módulo>/<slug>/ con leccion.mdx + leccion.ts.
 */
export const lessons: readonly LessonDef[] = [
  tiposYCoercion,
  cortocircuitoYControl,
  variablesYFunciones,
  stringsNumerosFechas,
  objetosArraysJson,
  metodosDeArray,
  destructuringYSpread,
  scopeYHoisting,
  closures,
  valoresYReferencias,
  thisLesson,
  prototiposYClases,
  objetosYColecciones,
  modulosYErrores,
];

/**
 * Módulos publicados: el validador exige que cada concepto de un módulo
 * publicado esté cubierto por al menos una lección, una pregunta y un ejercicio.
 * Se añade un módulo aquí cuando está completo.
 */
export const publishedModules: readonly string[] = ["m02", "m03"];

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
