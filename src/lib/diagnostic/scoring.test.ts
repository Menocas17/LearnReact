import { describe, expect, it } from "vitest";
import type { Question } from "@/content/types";
import { scoreConcepts } from "./scoring";

function q(id: string, concepts: string[]): Question {
  return {
    id,
    kind: "opcion",
    concepts,
    difficulty: "base",
    prompt: "",
    options: [{ id: "a", text: "" }],
    correct: "a",
    explanation: "",
  };
}

const questions = [q("q1", ["closures"]), q("q2", ["closures", "this"]), q("q3", ["this"])];

describe("scoreConcepts", () => {
  it("marca dominado solo si todo es correcto y seguro", () => {
    const result = scoreConcepts(questions, [
      { questionId: "q1", correct: true, confident: true },
      { questionId: "q2", correct: true, confident: true },
    ]);
    expect(result.get("closures")?.status).toBe("dominado");
  });

  it("acertar dudando cuenta como frágil", () => {
    const result = scoreConcepts(questions, [{ questionId: "q1", correct: true, confident: false }]);
    expect(result.get("closures")).toEqual({ status: "fragil", score: 0.5, answered: 1 });
  });

  it("mezcla de acierto seguro y fallo es frágil; solo fallos es hueco", () => {
    const result = scoreConcepts(questions, [
      { questionId: "q1", correct: true, confident: true },
      { questionId: "q2", correct: false, confident: true },
      { questionId: "q3", correct: false, confident: false },
    ]);
    expect(result.get("closures")?.status).toBe("fragil");
    expect(result.get("this")?.status).toBe("hueco");
  });

  it("los conceptos sin respuestas no aparecen", () => {
    const result = scoreConcepts(questions, [{ questionId: "q3", correct: true, confident: true }]);
    expect(result.has("closures")).toBe(false);
    expect(result.get("this")?.status).toBe("dominado");
  });

  it("cuenta solo el primer intento de cada pregunta", () => {
    const result = scoreConcepts(questions, [
      { questionId: "q3", correct: false, confident: true },
      { questionId: "q3", correct: true, confident: true },
    ]);
    expect(result.get("this")?.status).toBe("hueco");
  });

  it("las secciones saltadas marcan sus conceptos como hueco", () => {
    const result = scoreConcepts(questions, [], ["react.usestate"]);
    expect(result.get("react.usestate")?.status).toBe("hueco");
  });
});
