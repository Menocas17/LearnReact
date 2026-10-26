import { describe, expect, test } from "vitest";
import { checkLessonMdx } from "./check-mdx";

const lesson = { questionIds: ["q1"], exerciseIds: ["e1"] };

describe("checkLessonMdx", () => {
  test("acepta una lección correcta con JSX dentro de bloques de código", async () => {
    const source = [
      "## Título",
      "",
      "```jsx",
      "<Boton onClick={f} />",
      "```",
      "",
      "Usa `<Otro>` en línea.",
      "",
      "<AntesDeSeguir>",
      "",
      "¿Qué imprime?",
      "",
      "<Respuesta>",
      "",
      "Esto.",
      "",
      "</Respuesta>",
      "</AntesDeSeguir>",
      "",
      '<Profundiza titulo="historia">',
      "",
      "Texto.",
      "",
      "</Profundiza>",
      "",
      '<Pregunta id="q1" />',
      "",
      '<Ejercicio id="e1" />',
    ].join("\n");
    expect(await checkLessonMdx(source, lesson)).toEqual([]);
  });

  test("detecta MDX inválido", async () => {
    const problems = await checkLessonMdx("Un valor {sin cerrar\n", lesson);
    expect(problems[0]).toMatch(/no compila/);
  });

  test("detecta componentes desconocidos, ids ajenos y preguntas sin incrustar", async () => {
    const problems = await checkLessonMdx('<Video id="x" />\n\n<Pregunta id="q2" />\n\n<Ejercicio id="e1" />\n', lesson);
    expect(problems).toEqual([
      "componente desconocido <Video>",
      '<Pregunta id="q2"> no es de esta lección',
      '<Pregunta id="q1"> no aparece en la lección',
    ]);
  });
});
