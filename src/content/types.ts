/**
 * Tipos del contenido del curso. El contenido vive en TypeScript/MDX dentro del
 * repo; `pnpm validate:content` comprueba sus invariantes (grafo sin ciclos,
 * respuestas verificadas por ejecución, ejercicios que pasan sus tests, etc.).
 */

export type BlockId = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type Block = {
  id: BlockId;
  title: string;
  description: string;
};

/** Nodo del grafo de conocimiento. Las preguntas y lecciones se etiquetan con estos ids. */
export type Concept = {
  id: string;
  title: string;
  description: string;
  /** Conceptos que hay que dominar antes. */
  prereqs: readonly string[];
};

export type ProjectDef = {
  id: string;
  title: string;
  description: string;
  /** Conceptos que el proyecto pone en práctica. */
  concepts: readonly string[];
};

export type ModuleDef = {
  id: string;
  number: number;
  slug: string;
  block: BlockId;
  title: string;
  summary: string;
  optional?: boolean;
  concepts: readonly Concept[];
  projects: readonly ProjectDef[];
};

export type ConceptStatus = "dominado" | "fragil" | "hueco";

// ---------------------------------------------------------------------------
// Preguntas (diagnóstico y lecciones)
// ---------------------------------------------------------------------------

export type QuestionOption = {
  id: string;
  /** Para preguntas "predecir" es la salida exacta de consola, línea por línea. */
  text: string;
};

type QuestionBase = {
  id: string;
  /** Conceptos del grafo que evalúa la pregunta. */
  concepts: readonly string[];
  /** "trampa": diseñada para que falle quien lo usa sin entenderlo del todo. */
  difficulty: "base" | "trampa";
  prompt: string;
  code?: { lang: "js" | "ts" | "tsx" | "jsx"; source: string };
  options: readonly QuestionOption[];
  correct: string;
  explanation: string;
};

/**
 * "predecir": el código se ejecuta en CI con Node y la salida real debe
 * coincidir exactamente con la opción correcta (y con ninguna otra).
 * Los errores no capturados se imprimen como "Uncaught TypeError" y las
 * promesas rechazadas sin manejar como "Uncaught (in promise) Error".
 */
export type PredictQuestion = QuestionBase & { kind: "predecir" };

/** "opcion": pregunta conceptual revisada a mano (no ejecutable). */
export type ChoiceQuestion = QuestionBase & { kind: "opcion" };

export type Question = PredictQuestion | ChoiceQuestion;

export type DiagnosticSection = {
  id: string;
  title: string;
  description: string;
  /** Módulos cuyos conceptos cubre la sección. */
  modules: readonly string[];
  questions: readonly Question[];
};

// ---------------------------------------------------------------------------
// Lecciones
// ---------------------------------------------------------------------------

/** Mapa ruta → código, p. ej. { "/once.js": "export function once…" }. */
export type FileMap = Readonly<Record<string, string>>;

export type ExerciseDef = {
  id: string;
  title: string;
  concepts: readonly string[];
  instructions: string;
  /** Archivos que edita el alumno. */
  starter: FileMap;
  /** Tests con globals describe/test/expect (Jest en el navegador, Vitest en CI). */
  tests: FileMap;
  /** Solución de referencia: en CI debe pasar los tests y el starter debe fallar. */
  solution: FileMap;
  hints: readonly string[];
};

export type VideoRef = {
  youtubeId: string;
  /** Título y canal tal como los devuelve YouTube (se verifican en CI). */
  title: string;
  channel: string;
  lang: "es" | "en";
  /** Segundos de inicio/fin si solo interesa un fragmento. */
  start?: number;
  end?: number;
  /** En qué fijarse al verlo. */
  focus: string;
};

export type SourceRef = { title: string; url: string };

export type LessonDef = {
  id: string;
  moduleId: string;
  /** Carpeta en src/content/lessons/<módulo>/<slug>/ con leccion.mdx. */
  slug: string;
  title: string;
  summary: string;
  concepts: readonly string[];
  minutes: number;
  questions: readonly Question[];
  exercises: readonly ExerciseDef[];
  videos: readonly VideoRef[];
  sources: readonly SourceRef[];
  /** Fecha de la última revisión y versiones de las herramientas que asume. */
  reviewed: { date: string; versions?: Readonly<Record<string, string>> };
};
