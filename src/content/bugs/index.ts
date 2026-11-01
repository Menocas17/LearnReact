import type { BugDef, BugLevel } from "../types";
import { bugsM02 } from "./m02";

/** Todos los bugs, ordenados de principiante a avanzado dentro de cada módulo. */
export const bugs: readonly BugDef[] = [...bugsM02];

export const levelLabel: Record<BugLevel, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export function getBug(id: string): BugDef | undefined {
  return bugs.find((b) => b.id === id);
}
