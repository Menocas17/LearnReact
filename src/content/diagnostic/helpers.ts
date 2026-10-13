import type { Question } from "../types";

type CodeLang = NonNullable<Question["code"]>["lang"];

/** Bloque de código: recorta el salto de línea inicial/final del template literal. */
export function code(lang: CodeLang, source: string) {
  return { lang, source: source.replace(/^\n/, "").replace(/\s+$/, "") };
}

/** Opciones a, b, c, d… en el orden dado. */
export function opts(...texts: string[]) {
  return texts.map((text, i) => ({ id: String.fromCharCode(97 + i), text }));
}
