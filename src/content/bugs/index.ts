import type { BugDef, BugLevel } from "../types";
import { bugsM02 } from "./m02";
import { bugsM03 } from "./m03";
import { bugsM04 } from "./m04";
import { bugsM05 } from "./m05";

/** Todos los bugs, ordenados de principiante a avanzado dentro de cada módulo. */
export const bugs: readonly BugDef[] = [...bugsM02, ...bugsM03, ...bugsM04, ...bugsM05];

export const levelLabel: Record<BugLevel, string> = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export function getBug(id: string): BugDef | undefined {
  return bugs.find((b) => b.id === id);
}
