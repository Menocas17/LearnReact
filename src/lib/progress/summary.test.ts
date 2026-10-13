import { describe, expect, it } from "vitest";
import type { ModuleDef } from "@/content/types";
import { moduleCounts, recommendedModule } from "./summary";

const mod = (id: string, concepts: string[]): ModuleDef => ({
  id,
  number: 0,
  slug: id,
  block: "B",
  title: id,
  summary: "",
  concepts: concepts.map((c) => ({ id: c, title: c, description: "", prereqs: [] })),
  projects: [],
});

describe("progress summary", () => {
  const modules = [mod("m1", ["a", "b"]), mod("m2", ["c", "d"])];

  it("cuenta estados por módulo, con sin-evaluar por defecto", () => {
    const counts = moduleCounts(modules[0], new Map([["a", "dominado"]]));
    expect(counts).toEqual({ dominado: 1, fragil: 0, hueco: 0, "sin-evaluar": 1 });
  });

  it("recomienda el primer módulo con huecos o conceptos frágiles", () => {
    const statuses = new Map([
      ["a", "dominado"],
      ["b", "dominado"],
      ["d", "fragil"],
    ] as const);
    expect(recommendedModule(modules, new Map(statuses))?.id).toBe("m2");
  });
});
