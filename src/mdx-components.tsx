import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/lesson/callout";
import { CodeBlock } from "@/components/lesson/code-block";
import { Ejercicio } from "@/components/lesson/ejercicio";
import { Pregunta } from "@/components/lesson/pregunta";

const components: MDXComponents = {
  h2: (props) => <h2 className="mt-10 text-2xl font-semibold tracking-tight" {...props} />,
  h3: (props) => <h3 className="mt-6 text-lg font-semibold" {...props} />,
  ul: (props) => <ul className="list-disc space-y-1 pl-6" {...props} />,
  ol: (props) => <ol className="list-decimal space-y-1 pl-6" {...props} />,
  a: (props) => <a className="text-primary hover:underline" {...props} />,
  code: (props) => <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-[0.9em]" {...props} />,
  pre: CodeBlock,
  Callout,
  Pregunta,
  Ejercicio,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
