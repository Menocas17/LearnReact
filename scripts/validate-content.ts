/**
 * Valida todo el contenido del curso. Se ejecuta en CI y antes de cada commit
 * de contenido: el contenido generado no se acepta solo porque "parece correcto".
 *
 *   pnpm validate:content            grafo, preguntas, snippets y ejercicios
 *   pnpm validate:content --videos   además comprueba que los videos existen (red)
 */
import { access } from "node:fs/promises";
import path from "node:path";
import { concepts, modules } from "../src/content/curriculum";
import { diagnosticQuestions, diagnosticSections } from "../src/content/diagnostic";
import { lessons, publishedModules } from "../src/content/lessons";
import { lessonIdsWithContent } from "./lib/mdx-registry";
import type { Question } from "../src/content/types";
import { checkGraph, checkQuestion, checkSections, type Problem } from "./lib/checks";
import { exerciseTestsPass } from "./lib/run-exercise";
import { normalizeOutput, runSnippet } from "./lib/run-snippet";

const problems: Problem[] = [];
const conceptIds = new Set(concepts.map((c) => c.id));
const moduleIds = new Set(modules.map((m) => m.id));

function section(title: string) {
  console.log(`\n▸ ${title}`);
}

// 1. Grafo de conceptos -------------------------------------------------------
section("Grafo de conceptos");
problems.push(...checkGraph(modules));
console.log(`  ${modules.length} módulos, ${concepts.length} conceptos`);

// 2. Preguntas -----------------------------------------------------------------
section("Preguntas");
problems.push(...checkSections(diagnosticSections, moduleIds));
const allQuestions: Question[] = [
  ...diagnosticQuestions,
  ...lessons.flatMap((l) => l.questions),
];
const questionIds = new Set<string>();
for (const q of allQuestions) {
  if (questionIds.has(q.id)) problems.push(`Pregunta duplicada: ${q.id}`);
  questionIds.add(q.id);
  problems.push(...checkQuestion(q, conceptIds));
}
console.log(`  ${diagnosticQuestions.length} de diagnóstico, ${allQuestions.length - diagnosticQuestions.length} de lecciones`);

// 3. Preguntas "predecir": la respuesta se verifica ejecutando el código --------
section("Ejecutando snippets de preguntas \"predecir\"");
const predict = allQuestions.filter((q) => q.kind === "predecir" && q.code);
await Promise.all(
  predict.map(async (q) => {
    const actual = await runSnippet(q.code!.source);
    const expected = normalizeOutput(q.options.find((o) => o.id === q.correct)?.text ?? "");
    if (actual !== expected) {
      problems.push(
        `Pregunta ${q.id}: la salida real no coincide con la respuesta correcta.\n    real:     ${JSON.stringify(actual)}\n    esperada: ${JSON.stringify(expected)}`,
      );
    }
    const others = q.options.filter((o) => o.id !== q.correct && normalizeOutput(o.text) === actual);
    if (others.length > 0) problems.push(`Pregunta ${q.id}: una opción incorrecta coincide con la salida real`);
  }),
);
console.log(`  ${predict.length} snippets ejecutados`);

// 4. Lecciones y ejercicios ----------------------------------------------------
section("Lecciones y ejercicios");
const exerciseIds = new Set<string>();
for (const lesson of lessons) {
  const where = `Lección ${lesson.id}`;
  const mod = modules.find((m) => m.id === lesson.moduleId);
  if (!mod) {
    problems.push(`${where}: módulo inexistente ${lesson.moduleId}`);
    continue;
  }
  if (lesson.id !== `${mod.slug}/${lesson.slug}`) problems.push(`${where}: el id debe ser ${mod.slug}/${lesson.slug}`);
  for (const c of lesson.concepts) if (!conceptIds.has(c)) problems.push(`${where}: concepto inexistente ${c}`);
  try {
    await access(path.join(import.meta.dirname, "..", "src", "content", "lessons", mod.slug, lesson.slug, "leccion.mdx"));
  } catch {
    problems.push(`${where}: falta leccion.mdx`);
  }
  if (!lessonIdsWithContent.has(lesson.id)) problems.push(`${where}: falta su entrada en src/content/lessons/mdx.tsx`);
  for (const v of lesson.videos) {
    if (!/^[\w-]{11}$/.test(v.youtubeId)) problems.push(`${where}: youtubeId inválido ${v.youtubeId}`);
  }
  for (const ex of lesson.exercises) {
    if (exerciseIds.has(ex.id)) problems.push(`Ejercicio duplicado: ${ex.id}`);
    exerciseIds.add(ex.id);
    for (const c of ex.concepts) if (!conceptIds.has(c)) problems.push(`Ejercicio ${ex.id}: concepto inexistente ${c}`);
  }
}
await Promise.all(
  lessons.flatMap((l) =>
    l.exercises.map(async (ex) => {
      const [solutionOk, starterOk] = await Promise.all([
        exerciseTestsPass(`${ex.id}-solucion`, ex.solution, ex.tests),
        exerciseTestsPass(`${ex.id}-inicial`, ex.starter, ex.tests),
      ]);
      if (!solutionOk) problems.push(`Ejercicio ${ex.id}: la solución no pasa los tests`);
      if (starterOk) problems.push(`Ejercicio ${ex.id}: el código inicial ya pasa los tests`);
    }),
  ),
);
console.log(`  ${lessons.length} lecciones, ${exerciseIds.size} ejercicios verificados`);

// 5. Cobertura de módulos publicados -------------------------------------------
section("Cobertura");
for (const moduleId of publishedModules) {
  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) {
    problems.push(`Módulo publicado inexistente: ${moduleId}`);
    continue;
  }
  const inModule = lessons.filter((l) => l.moduleId === moduleId);
  for (const c of mod.concepts) {
    const lesson = inModule.some((l) => l.concepts.includes(c.id));
    const question = inModule.some((l) => l.questions.some((q) => q.concepts.includes(c.id)));
    const exercise = inModule.some((l) => l.exercises.some((e) => e.concepts.includes(c.id)));
    if (!lesson || !question || !exercise) {
      problems.push(
        `Módulo ${moduleId}: el concepto ${c.id} no está cubierto (lección: ${lesson}, pregunta: ${question}, ejercicio: ${exercise})`,
      );
    }
  }
}
const covered = new Set(lessons.flatMap((l) => l.concepts));
const diagnosed = new Set(diagnosticQuestions.flatMap((q) => q.concepts));
console.log(`  Conceptos con lección: ${covered.size}/${concepts.length}`);
console.log(`  Conceptos evaluados en el diagnóstico: ${diagnosed.size}/${concepts.length}`);
console.log(`  Módulos publicados: ${publishedModules.length}/${modules.length}`);

// 6. Videos (opcional, requiere red) --------------------------------------------
if (process.argv.includes("--videos")) {
  section("Videos (YouTube oEmbed)");
  for (const lesson of lessons) {
    for (const v of lesson.videos) {
      const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${v.youtubeId}`)}`;
      const res = await fetch(url);
      if (!res.ok) {
        problems.push(`Video ${v.youtubeId} (${lesson.id}): no disponible (HTTP ${res.status})`);
        continue;
      }
      const data = (await res.json()) as { title: string; author_name: string };
      if (data.title !== v.title || data.author_name !== v.channel) {
        problems.push(`Video ${v.youtubeId}: título/canal no coinciden ("${data.title}" — ${data.author_name})`);
      }
    }
  }
  console.log("  videos comprobados");
}

// Resultado --------------------------------------------------------------------
if (problems.length > 0) {
  console.error(`\n✗ ${problems.length} problema(s):\n`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("\n✓ Contenido válido");
