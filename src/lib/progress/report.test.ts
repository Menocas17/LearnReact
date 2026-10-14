import { describe, expect, it } from "vitest";
import type { ModuleDef } from "@/content/types";
import { buildProgressReport } from "./report";

const mod: ModuleDef = {
  id: "m02",
  number: 2,
  slug: "js",
  block: "B",
  title: "JS",
  summary: "",
  concepts: ["a", "b", "c"].map((id) => ({ id, title: id.toUpperCase(), description: "", prereqs: [] })),
  projects: [],
};

describe("buildProgressReport", () => {
  it("lista huecos, frágiles y preguntas falladas", () => {
    const text = buildProgressReport({
      modules: [mod],
      statuses: new Map([
        ["a", "hueco"],
        ["b", "fragil"],
        ["c", "dominado"],
      ]),
      diagnosticDate: new Date("2026-10-14T10:00:00Z"),
      attempts: [
        { questionId: "q1", correct: false, confident: true },
        { questionId: "q2", correct: true, confident: false },
      ],
      getQuestion: () => undefined,
      completedLessons: new Set(),
      passedExercises: new Set(),
    });
    expect(text).toContain("Diagnóstico completado el 2026-10-14.");
    expect(text).toContain("### Módulo 2: JS (1 dominados, 1 frágiles, 1 huecos, 0 sin evaluar)");
    expect(text).toContain("- Hueco: a (A)");
    expect(text).toContain("- Frágil: b (B)");
    expect(text).toContain("- q1 (fallada con seguridad)");
    expect(text).toContain("Acertadas con dudas:\n- q2");
  });
});
