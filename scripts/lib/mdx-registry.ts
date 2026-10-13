import { readFileSync } from "node:fs";
import path from "node:path";

// tsx no puede importar .mdx, así que se leen las claves del registro como texto.
const source = readFileSync(
  path.join(import.meta.dirname, "..", "..", "src", "content", "lessons", "mdx.tsx"),
  "utf8",
);
export const lessonIdsWithContent = new Set(
  [...source.matchAll(/^\s*"([^"]+)":\s*\(\)\s*=>/gm)].map((m) => m[1]),
);
