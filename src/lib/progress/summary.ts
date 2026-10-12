import type { ConceptStatus, ModuleDef } from "@/content/types";
import type { StatusOrNone } from "@/components/status";

export type StatusCounts = Record<StatusOrNone, number>;

export function emptyCounts(): StatusCounts {
  return { dominado: 0, fragil: 0, hueco: 0, "sin-evaluar": 0 };
}

export function moduleCounts(mod: ModuleDef, statuses: Map<string, ConceptStatus>): StatusCounts {
  const counts = emptyCounts();
  for (const c of mod.concepts) counts[statuses.get(c.id) ?? "sin-evaluar"]++;
  return counts;
}

/**
 * Siguiente módulo recomendado: el primero (en orden del currículo) que tenga
 * conceptos frágiles o huecos, saltando los opcionales.
 */
export function recommendedModule(
  modules: readonly ModuleDef[],
  statuses: Map<string, ConceptStatus>,
): ModuleDef | undefined {
  return modules.find((m) => {
    if (m.optional) return false;
    const counts = moduleCounts(m, statuses);
    return counts.hueco + counts.fragil > 0;
  });
}
