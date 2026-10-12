import type { ModuleDef } from "../types";
import { concept as c } from "./helpers";

export const blockA: readonly ModuleDef[] = [
  {
    id: "m00",
    number: 0,
    slug: "web-y-herramientas",
    block: "A",
    title: "Cómo funciona la web y herramientas",
    summary: "HTTP, el navegador, DevTools, terminal, Git/GitHub y Node.",
    concepts: [
      c("web.http", "HTTP", "Peticiones y respuestas, métodos, cabeceras y códigos de estado."),
      c("web.navegador", "Del URL al píxel", "DNS, descarga, parseo de HTML/CSS/JS, layout y pintado.", ["web.http"]),
      c("web.devtools", "DevTools", "Elementos, consola, red, fuentes y breakpoints.", ["web.navegador"]),
      c("tools.terminal", "Terminal", "Moverse por el sistema de archivos y ejecutar comandos."),
      c("tools.git", "Git", "Commits, ramas, merge, rebase y resolver conflictos.", ["tools.terminal"]),
      c("tools.github", "GitHub", "Remotos, pull requests, revisiones e issues.", ["tools.git"]),
      c("tools.node-npm", "Node.js y gestores de paquetes", "Node, npm/pnpm, package.json y scripts.", ["tools.terminal"]),
    ],
    projects: [
      {
        id: "p00-primer-deploy",
        title: "Primer deploy",
        description: "Repo en GitHub con una página estática desplegada y un PR revisado.",
        concepts: ["tools.github", "tools.git"],
      },
    ],
  },
  {
    id: "m01",
    number: 1,
    slug: "html-css-accesibilidad",
    block: "A",
    title: "HTML, CSS y accesibilidad",
    summary: "HTML semántico, CSS moderno (flexbox, grid, responsive) y accesibilidad base.",
    concepts: [
      c("html.semantica", "HTML semántico", "Elementos con significado y estructura del documento."),
      c("html.formularios", "Formularios nativos", "Inputs, labels, validación nativa y envío.", ["html.semantica"]),
      c("css.cascada", "Cascada y especificidad", "Cómo se decide qué regla gana; herencia; capas."),
      c("css.box-model", "Box model y unidades", "content/padding/border/margin, box-sizing, rem/em/%/vw."),
      c("css.flexbox", "Flexbox", "Layouts en una dimensión.", ["css.box-model"]),
      c("css.grid", "Grid", "Layouts en dos dimensiones.", ["css.box-model"]),
      c("css.responsive", "Responsive", "Mobile-first, media queries y container queries.", ["css.flexbox", "css.grid"]),
      c("css.variables", "Custom properties y theming", "Variables CSS, temas y dark mode.", ["css.cascada"]),
      c("a11y.fundamentos", "Accesibilidad: fundamentos", "Roles, nombre accesible, foco y navegación por teclado.", ["html.semantica"]),
    ],
    projects: [
      {
        id: "p01-landing",
        title: "Landing accesible",
        description: "Landing responsive con Lighthouse ≥ 90 en accesibilidad.",
        concepts: ["css.responsive", "a11y.fundamentos", "html.semantica"],
      },
    ],
  },
];
