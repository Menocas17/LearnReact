import Link from "next/link";
import { Suspense } from "react";
import { bugs, levelLabel } from "@/content/bugs";
import { lessons } from "@/content/lessons";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getPassedExercises } from "@/lib/data/progress";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Bugs · LearnReact" };

export default function BugsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Bugs</h1>
        <p className="max-w-2xl text-muted">
          Tickets reales, de principiante a avanzado. Lees el ticket, arreglas el código y los tests te dicen si
          quedó resuelto. Si te atascas, cada bug enlaza a la lección que explica la causa.
        </p>
      </header>
      <ol className="space-y-2">
        {bugs.map((bug) => {
          const lesson = lessons.find((l) => l.id === bug.lessonId);
          return (
            <li key={bug.id}>
              <Card className="flex items-center justify-between gap-4 p-4">
                <div className="space-y-1">
                  <Link href={`/bugs/${bug.id}`} className="font-medium hover:underline">
                    {bug.title}
                  </Link>
                  <p className="text-xs text-muted">
                    {levelLabel[bug.level]}
                    {lesson && ` · ${lesson.title}`}
                  </p>
                </div>
                <Suspense fallback={null}>
                  <Solved id={bug.id} />
                </Suspense>
              </Card>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

async function Solved({ id }: { id: string }) {
  const user = await getCurrentUser();
  const passed = await getPassedExercises(user.id);
  return passed.has(id) ? <span className="shrink-0 text-sm text-dominado">✓ resuelto</span> : null;
}
