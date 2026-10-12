import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getConcept, getModuleById, getModuleBySlug } from "@/content/curriculum";
import { getLesson, lessons } from "@/content/lessons";
import { lessonContent } from "@/content/lessons/mdx";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCompletedLessons } from "@/lib/data/progress";
import { Card } from "@/components/ui/card";
import { VideoList } from "@/components/lesson/video";
import { CompleteLessonButton } from "./complete-button";

export function generateStaticParams() {
  return lessons.map((l) => ({ modulo: getModuleById(l.moduleId)!.slug, leccion: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/modulos/[modulo]/[leccion]">) {
  const { modulo, leccion } = await params;
  const mod = getModuleBySlug(modulo);
  const lesson = mod && getLesson(mod.id, leccion);
  return { title: lesson ? `${lesson.title} · LearnReact` : "Lección" };
}

export default function LessonPage({ params }: PageProps<"/modulos/[modulo]/[leccion]">) {
  // params se lee dentro de Suspense para que el App Shell no dependa de la URL.
  return (
    <Suspense fallback={<div className="mx-auto h-96 max-w-3xl animate-pulse rounded-lg bg-subtle" />}>
      <Lesson params={params} />
    </Suspense>
  );
}

async function Lesson({ params }: Pick<PageProps<"/modulos/[modulo]/[leccion]">, "params">) {
  const { modulo, leccion } = await params;
  const mod = getModuleBySlug(modulo);
  const lesson = mod && getLesson(mod.id, leccion);
  const renderContent = lesson && lessonContent[lesson.id];
  if (!mod || !lesson || !renderContent) notFound();

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <p className="text-sm text-muted">
          <Link href={`/modulos/${mod.slug}`} className="hover:underline">
            Módulo {mod.number}: {mod.title}
          </Link>
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">{lesson.title}</h1>
        <p className="text-muted">{lesson.summary}</p>
        <p className="text-sm text-muted">
          {lesson.minutes} min · Conceptos: {lesson.concepts.map((c) => getConcept(c)?.title ?? c).join(", ")}
        </p>
      </header>

      <div className="lesson-prose space-y-5 leading-relaxed">
        {renderContent()}
      </div>

      {lesson.videos.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Videos de refuerzo</h2>
          <VideoList videos={lesson.videos} />
        </section>
      )}

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Fuentes</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {lesson.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} className="text-primary hover:underline" target="_blank" rel="noreferrer">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted">
          Revisada el {lesson.reviewed.date}
          {lesson.reviewed.versions &&
            ` · ${Object.entries(lesson.reviewed.versions)
              .map(([k, v]) => `${k} ${v}`)
              .join(", ")}`}
        </p>
      </section>

      <Card>
        <Suspense fallback={<p className="text-sm text-muted">Cargando progreso…</p>}>
          <LessonCompletion lessonId={lesson.id} />
        </Suspense>
      </Card>
    </article>
  );
}

async function LessonCompletion({ lessonId }: { lessonId: string }) {
  const user = await getCurrentUser();
  const done = (await getCompletedLessons(user.id)).has(lessonId);
  return done ? (
    <p className="text-sm text-dominado">✓ Lección completada</p>
  ) : (
    <CompleteLessonButton lessonId={lessonId} />
  );
}
