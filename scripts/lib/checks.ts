import type { Concept, DiagnosticSection, ModuleDef, Question } from "../../src/content/types";

export type Problem = string;

export function checkGraph(modules: readonly ModuleDef[]): Problem[] {
  const problems: Problem[] = [];
  const ids = new Set<string>();
  const all: Concept[] = [];

  modules.forEach((m, index) => {
    if (m.number !== index) problems.push(`Módulo ${m.id}: número ${m.number}, se esperaba ${index}`);
    for (const c of m.concepts) {
      if (ids.has(c.id)) problems.push(`Concepto duplicado: ${c.id}`);
      ids.add(c.id);
      all.push(c);
    }
  });
  for (const key of ["id", "slug"] as const) {
    const seen = new Set<string>();
    for (const m of modules) {
      if (seen.has(m[key])) problems.push(`Módulo con ${key} duplicado: ${m[key]}`);
      seen.add(m[key]);
    }
  }

  for (const c of all) {
    for (const p of c.prereqs) {
      if (!ids.has(p)) problems.push(`${c.id}: prerrequisito inexistente ${p}`);
      if (p === c.id) problems.push(`${c.id}: es prerrequisito de sí mismo`);
    }
  }
  for (const m of modules) {
    for (const p of m.projects) {
      for (const c of p.concepts) {
        if (!ids.has(c)) problems.push(`Proyecto ${p.id}: concepto inexistente ${c}`);
      }
    }
  }

  // Detección de ciclos (DFS con colores).
  const byId = new Map(all.map((c) => [c.id, c]));
  const state = new Map<string, "visiting" | "done">();
  const visit = (id: string, stack: string[]) => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") {
      problems.push(`Ciclo de prerrequisitos: ${[...stack, id].join(" → ")}`);
      return;
    }
    state.set(id, "visiting");
    for (const p of byId.get(id)?.prereqs ?? []) if (byId.has(p)) visit(p, [...stack, id]);
    state.set(id, "done");
  };
  for (const c of all) visit(c.id, []);

  return problems;
}

export function checkQuestion(q: Question, conceptIds: Set<string>): Problem[] {
  const problems: Problem[] = [];
  const where = `Pregunta ${q.id}`;
  if (q.concepts.length === 0) problems.push(`${where}: sin conceptos`);
  for (const c of q.concepts) if (!conceptIds.has(c)) problems.push(`${where}: concepto inexistente ${c}`);
  if (q.options.length < 2) problems.push(`${where}: necesita al menos 2 opciones`);
  const optionIds = new Set(q.options.map((o) => o.id));
  if (optionIds.size !== q.options.length) problems.push(`${where}: ids de opción duplicados`);
  const texts = new Set(q.options.map((o) => o.text));
  if (texts.size !== q.options.length) problems.push(`${where}: opciones con el mismo texto`);
  if (!optionIds.has(q.correct)) problems.push(`${where}: la respuesta correcta no existe`);
  if (q.kind === "predecir" && q.code?.lang !== "js") {
    problems.push(`${where}: las preguntas "predecir" necesitan código js ejecutable`);
  }
  if (!q.explanation.trim()) problems.push(`${where}: sin explicación`);
  return problems;
}

export function checkSections(
  sections: readonly DiagnosticSection[],
  moduleIds: Set<string>,
): Problem[] {
  const problems: Problem[] = [];
  const seen = new Set<string>();
  for (const s of sections) {
    if (seen.has(s.id)) problems.push(`Sección duplicada: ${s.id}`);
    seen.add(s.id);
    for (const m of s.modules) if (!moduleIds.has(m)) problems.push(`Sección ${s.id}: módulo inexistente ${m}`);
    if (s.questions.length === 0) problems.push(`Sección ${s.id}: sin preguntas`);
  }
  return problems;
}
