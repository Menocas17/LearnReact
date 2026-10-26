import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";

/** Componentes que `src/mdx-components.tsx` expone a las lecciones. */
export const mdxComponents = new Set(["Pregunta", "Ejercicio", "Callout", "AntesDeSeguir", "Respuesta", "Profundiza"]);

/** Quita bloques de código y código en línea, donde `<Algo>` es texto y no JSX. */
function stripCode(source: string): string {
  return source.replace(/^```[\s\S]*?^```/gm, "").replace(/`[^`\n]*`/g, "");
}

/**
 * Comprueba que una lección MDX compila, que solo usa componentes conocidos y que incrusta
 * exactamente sus propias preguntas y ejercicios.
 */
export async function checkLessonMdx(
  source: string,
  lesson: { questionIds: string[]; exerciseIds: string[] },
): Promise<string[]> {
  const problems: string[] = [];
  try {
    await compile(source, { remarkPlugins: [remarkGfm] });
  } catch (error) {
    problems.push(`el MDX no compila: ${error instanceof Error ? error.message : String(error)}`);
    return problems;
  }
  const prose = stripCode(source);
  for (const [, tag] of prose.matchAll(/<([A-Z]\w*)/g)) {
    if (!mdxComponents.has(tag)) problems.push(`componente desconocido <${tag}>`);
  }
  const embedded = (tag: string) => [...prose.matchAll(new RegExp(`<${tag}\\s+id="([^"]+)"`, "g"))].map((m) => m[1]);
  for (const [tag, own] of [
    ["Pregunta", lesson.questionIds],
    ["Ejercicio", lesson.exerciseIds],
  ] as const) {
    const ids = embedded(tag);
    for (const id of ids) {
      if (!own.includes(id)) problems.push(`<${tag} id="${id}"> no es de esta lección`);
      if (ids.indexOf(id) !== ids.lastIndexOf(id)) problems.push(`<${tag} id="${id}"> aparece más de una vez`);
    }
    for (const id of own) if (!ids.includes(id)) problems.push(`<${tag} id="${id}"> no aparece en la lección`);
  }
  return [...new Set(problems)];
}
