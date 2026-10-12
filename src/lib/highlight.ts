import "server-only";
import { cacheLife } from "next/cache";
import { codeToHtml } from "shiki";

/**
 * Resalta código en el servidor con temas claro/oscuro (variables CSS de Shiki).
 * El resultado solo depende de (code, lang), así que se cachea indefinidamente;
 * además Shiki lee Date.now() internamente, algo que el prerender no permite sin caché.
 */
export async function highlight(code: string, lang: string): Promise<string> {
  "use cache";
  cacheLife("max");
  return codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });
}
