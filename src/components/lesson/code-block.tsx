import { isValidElement, type ReactNode } from "react";
import { highlight } from "@/lib/highlight";

type CodeProps = { className?: string; children?: ReactNode };

/** Reemplaza <pre><code class="language-x"> de MDX por código resaltado en el servidor. */
export async function CodeBlock({ children }: { children?: ReactNode }) {
  const code = isValidElement<CodeProps>(children) ? children.props : undefined;
  const source = typeof code?.children === "string" ? code.children.trimEnd() : "";
  const lang = code?.className?.replace("language-", "") || "text";
  const html = await highlight(source, lang);
  return (
    <div
      className="overflow-x-auto rounded-md border border-border bg-code-bg p-4 text-sm [&_pre]:font-mono"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
