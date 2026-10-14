import type { ReactNode } from "react";
import TiposYCoercion from "./js-fundamentos/tipos-y-coercion/leccion.mdx";
import CortocircuitoYControl from "./js-fundamentos/cortocircuito-y-control/leccion.mdx";
import VariablesYFunciones from "./js-fundamentos/variables-y-funciones/leccion.mdx";
import StringsNumerosFechas from "./js-fundamentos/strings-numeros-fechas/leccion.mdx";
import ObjetosArraysJson from "./js-fundamentos/objetos-arrays-json/leccion.mdx";
import MetodosDeArray from "./js-fundamentos/metodos-de-array/leccion.mdx";
import DestructuringYSpread from "./js-fundamentos/destructuring-y-spread/leccion.mdx";
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
  "js-fundamentos/tipos-y-coercion": () => <TiposYCoercion />,
  "js-fundamentos/cortocircuito-y-control": () => <CortocircuitoYControl />,
  "js-fundamentos/variables-y-funciones": () => <VariablesYFunciones />,
  "js-fundamentos/strings-numeros-fechas": () => <StringsNumerosFechas />,
  "js-fundamentos/objetos-arrays-json": () => <ObjetosArraysJson />,
  "js-fundamentos/metodos-de-array": () => <MetodosDeArray />,
  "js-fundamentos/destructuring-y-spread": () => <DestructuringYSpread />,
  "js-profundo/closures": () => <Closures />,
  "js-profundo/scope-y-hoisting": () => <ScopeYHoisting />,
  "js-profundo/valores-y-referencias": () => <ValoresYReferencias />,
  "js-profundo/this": () => <This />,
  "js-profundo/prototipos-y-clases": () => <PrototiposYClases />,
  "js-profundo/objetos-y-colecciones": () => <ObjetosYColecciones />,
  "js-profundo/modulos-y-errores": () => <ModulosYErrores />,
};
