import type { ModuleDef } from "../types";
import { concept as c } from "./helpers";

export const blockG: readonly ModuleDef[] = [
  {
    id: "m25",
    number: 25,
    slug: "ia-y-agentes",
    block: "G",
    title: "IA y agentes con React",
    summary: "LLMs desde el servidor, streaming, tool use, agentes, RAG, MCP, seguridad y evals.",
    concepts: [
      c("ai.llms", "LLMs para devs", "Tokens, contexto, costo, latencia y alucinaciones."),
      c("ai.arquitectura", "Llamar a un LLM desde el servidor", "API keys solo en el servidor, límites y costos.", ["ai.llms", "next.route-handlers", "tools.env"]),
      c("ai.streaming-ui", "Streaming en la UI", "Mostrar respuestas a medida que llegan y cancelarlas.", ["ai.arquitectura", "async.abort", "react.useeffect"]),
      c("ai.structured-outputs", "Structured outputs", "Respuestas que cumplen un esquema (Zod).", ["ai.arquitectura", "ts.zod"]),
      c("ai.tool-use", "Tool use", "El modelo llama funciones de tu app.", ["ai.structured-outputs"]),
      c("ai.generative-ui", "Generative UI", "Renderizar componentes a partir de las herramientas usadas.", ["ai.tool-use", "ai.streaming-ui"]),
      c("ai.agentes", "Agentes", "El loop agéntico, pasos múltiples, presupuestos y errores.", ["ai.tool-use"]),
      c("ai.human-in-the-loop", "Aprobaciones humanas", "Confirmar acciones del agente desde la UI.", ["ai.agentes", "ai.generative-ui"]),
      c("ai.rag", "RAG", "Embeddings, chunking, búsqueda vectorial y citas.", ["ai.arquitectura", "back.postgres"]),
      c("ai.mcp", "MCP", "Consumir y crear servidores Model Context Protocol.", ["ai.tool-use", "back.http-api"]),
      c("ai.agent-sdk", "Claude Agent SDK", "Agentes que trabajan sobre archivos y herramientas.", ["ai.agentes"]),
      c("ai.seguridad", "Seguridad con LLMs", "Prompt injection, validación de salidas y permisos.", ["ai.agentes", "back.seguridad"]),
      c("ai.evals", "Evals y observabilidad", "Medir si tu feature de IA funciona; trazas y costos.", ["ai.structured-outputs", "test.estrategia"]),
      c("ai.programar-con-agentes", "Programar con agentes", "Claude Code y Cursor: spec → plan → implementar → revisar.", ["eng.code-review"]),
    ],
    projects: [
      {
        id: "p25-agente-devboard",
        title: "Agente en DevBoard",
        description: "Agente que consulta y organiza tareas con tools, pide aprobación, responde en streaming y tiene evals.",
        concepts: ["ai.agentes", "ai.human-in-the-loop", "ai.streaming-ui", "ai.evals"],
      },
    ],
  },
  {
    id: "m26",
    number: 26,
    slug: "capstone",
    block: "G",
    title: "Capstone",
    summary: "Una app de producción propia, de la idea al deploy, y su defensa técnica.",
    concepts: [
      c("capstone.alcance", "Producto y alcance", "Definir problema, usuarios y un MVP realista.", ["eng.arquitectura"]),
      c("capstone.produccion", "Checklist de producción", "Tests, accesibilidad, performance, seguridad y observabilidad.", ["eng.cicd", "test.e2e", "perf.web-vitals", "back.seguridad"]),
      c("capstone.defensa", "Defensa técnica", "Explicar y justificar decisiones en una entrevista simulada.", ["eng.entrevistas", "capstone.produccion"]),
    ],
    projects: [
      {
        id: "p26-capstone",
        title: "Proyecto final",
        description: "App full-stack desplegada con tests, CI, accesibilidad, presupuesto de performance y una feature de IA.",
        concepts: ["capstone.produccion", "capstone.defensa", "ai.agentes"],
      },
    ],
  },
];
