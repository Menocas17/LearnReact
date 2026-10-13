import { findLessonExercise } from "@/content/lessons";
import { ExerciseClient } from "./exercise-client";

/** <Ejercicio id="…" /> en MDX. La solución no se envía al navegador. */
export function Ejercicio({ id }: { id: string }) {
  const found = findLessonExercise(id);
  if (!found) throw new Error(`Ejercicio inexistente en MDX: ${id}`);
  const { exercise } = found;
  return (
    <ExerciseClient
      id={exercise.id}
      title={exercise.title}
      instructions={exercise.instructions}
      starter={exercise.starter}
      tests={exercise.tests}
      hints={exercise.hints}
    />
  );
}
