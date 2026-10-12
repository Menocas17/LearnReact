import type { ReactNode } from "react";
import Closures from "./js-profundo/closures/leccion.mdx";

/**
 * Contenido MDX de cada lección, por id. Los imports son estáticos a propósito:
 * así Next conoce en el build todos los Client Components que usa cada lección.
 * El validador comprueba que cada lección del registro tenga su entrada aquí.
 */
export const lessonContent: Readonly<Record<string, () => ReactNode>> = {
  "js-profundo/closures": () => <Closures />,
};
