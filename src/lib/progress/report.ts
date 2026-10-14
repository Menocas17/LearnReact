import type { ConceptStatus, ModuleDef, Question } from "@/content/types";
import { moduleCounts } from "./summary";

type Attempt = { questionId: string; correct: boolean; confident: boolean };

type ReportInput = {
  modules: readonly ModuleDef[];
  statuses: Map<string, ConceptStatus>;
  diagnosticDate: Date | null;
  attempts: readonly Attempt[];
  getQuestion: (id: string) => Question | undefined;
  completedLessons: ReadonlySet<string>;
  passedExercises: ReadonlySet<string>;
};

const label: Record<ConceptStatus, string> = {
  hueco: "Hueco",
  fragil: "Frágil",
  dominado: "Dominado",
};

/**
 * Resumen en texto del progreso para pegarlo en una conversación con Claude:
 * así el contenido de los siguientes módulos se adapta a tus resultados reales.
 */
export function buildProgressReport(input: ReportInput): string {
  const { modules, statuses, diagnosticDate, attempts } = input;
  const lines: string[] = ["# Progreso en LearnReact", ""];

  lines.push(
    diagnosticDate
      ? `Diagnóstico completado el ${diagnosticDate.toISOString().slice(0, 10)}.`
      : "Diagnóstico: no completado.",
  );
  lines.push(
    `Lecciones completadas: ${input.completedLessons.size}. Ejercicios aprobados: ${input.passedExercises.size}.`,
    "",
    "## Conceptos por módulo",
    "",
  );

  for (const mod of modules) {
    const counts = moduleCounts(mod, statuses);
    const evaluated = counts.dominado + counts.fragil + counts.hueco;
    if (evaluated === 0) continue;
    lines.push(
      `### Módulo ${mod.number}: ${mod.title} (${counts.dominado} dominados, ${counts.fragil} frágiles, ${counts.hueco} huecos, ${counts["sin-evaluar"]} sin evaluar)`,
    );
    for (const status of ["hueco", "fragil"] as const) {
      const ids = mod.concepts.filter((c) => statuses.get(c.id) === status);
      if (ids.length) lines.push(`- ${label[status]}: ${ids.map((c) => `${c.id} (${c.title})`).join(", ")}`);
    }
    lines.push("");
  }

  const wrong = attempts.filter((a) => !a.correct);
  const unsure = attempts.filter((a) => a.correct && !a.confident);
  if (attempts.length > 0) {
    lines.push("## Preguntas del diagnóstico", "");
    lines.push(`Respondidas: ${attempts.length}. Falladas: ${wrong.length}. Acertadas con dudas: ${unsure.length}.`);
    const describe = (a: Attempt) => {
      const q = input.getQuestion(a.questionId);
      return `${a.questionId}${q ? ` [${q.concepts.join(", ")}]` : ""}${!a.correct && a.confident ? " (fallada con seguridad)" : ""}`;
    };
    if (wrong.length) lines.push("", "Falladas:", ...wrong.map((a) => `- ${describe(a)}`));
    if (unsure.length) lines.push("", "Acertadas con dudas:", ...unsure.map((a) => `- ${describe(a)}`));
  }

  return lines.join("\n").trimEnd() + "\n";
}
