import type { ReactNode } from "react";
import Closures from "./js-profundo/closures/leccion.mdx";
import ScopeYHoisting from "./js-profundo/scope-y-hoisting/leccion.mdx";
import ValoresYReferencias from "./js-profundo/valores-y-referencias/leccion.mdx";
import This from "./js-profundo/this/leccion.mdx";
import PrototiposYClases from "./js-profundo/prototipos-y-clases/leccion.mdx";
import ObjetosYColecciones from "./js-profundo/objetos-y-colecciones/leccion.mdx";
import ModulosYErrores from "./js-profundo/modulos-y-errores/leccion.mdx";

/**
 * Contenido MDX de cada lección, por id. Los imports son estáticos a propósito:
 * así Next conoce en el build todos los Client Components que usa cada lección.
 * El validador comprueba que cada lección del registro tenga su entrada aquí.
 */
export const lessonContent: Readonly<Record<string, () => ReactNode>> = {
  "js-profundo/closures": () => <Closures />,
  "js-profundo/scope-y-hoisting": () => <ScopeYHoisting />,
  "js-profundo/valores-y-referencias": () => <ValoresYReferencias />,
  "js-profundo/this": () => <This />,
  "js-profundo/prototipos-y-clases": () => <PrototiposYClases />,
  "js-profundo/objetos-y-colecciones": () => <ObjetosYColecciones />,
  "js-profundo/modulos-y-errores": () => <ModulosYErrores />,
};
