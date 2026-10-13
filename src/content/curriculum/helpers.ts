import type { Concept } from "../types";

/** Atajo para declarar conceptos de forma compacta. */
export function concept(
  id: string,
  title: string,
  description: string,
  prereqs: readonly string[] = [],
): Concept {
  return { id, title, description, prereqs };
}
