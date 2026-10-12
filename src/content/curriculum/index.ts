import type { BlockId, Concept, ModuleDef } from "../types";
import { blockA } from "./a-bases";
import { blockB } from "./b-javascript";
import { blockC } from "./c-typescript";
import { blockD } from "./d-react";
import { blockE } from "./e-ecosistema";
import { blockF } from "./f-fullstack";
import { blockG } from "./g-ia";

export { blocks } from "./blocks";

export const modules: readonly ModuleDef[] = [
  ...blockA,
  ...blockB,
  ...blockC,
  ...blockD,
  ...blockE,
  ...blockF,
  ...blockG,
];

export type ConceptWithModule = Concept & { moduleId: string };

export const concepts: readonly ConceptWithModule[] = modules.flatMap((m) =>
  m.concepts.map((concept) => ({ ...concept, moduleId: m.id })),
);

const conceptById = new Map(concepts.map((c) => [c.id, c]));
const moduleBySlug = new Map(modules.map((m) => [m.slug, m]));
const moduleById = new Map(modules.map((m) => [m.id, m]));

export function getConcept(id: string): ConceptWithModule | undefined {
  return conceptById.get(id);
}

export function getModuleBySlug(slug: string): ModuleDef | undefined {
  return moduleBySlug.get(slug);
}

export function getModuleById(id: string): ModuleDef | undefined {
  return moduleById.get(id);
}

export function modulesInBlock(block: BlockId): ModuleDef[] {
  return modules.filter((m) => m.block === block);
}
