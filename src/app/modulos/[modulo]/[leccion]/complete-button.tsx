"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { completeLesson } from "../../actions";

export function CompleteLessonButton({ lessonId }: { lessonId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted">¿Terminaste la lección, las preguntas y los ejercicios?</p>
      <Button disabled={pending} onClick={() => startTransition(() => completeLesson(lessonId))}>
        {pending ? "Guardando…" : "Marcar como completada"}
      </Button>
    </div>
  );
}
