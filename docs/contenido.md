# Guía de contenido

El contenido lo genera Claude y no siempre se revisa a mano, así que **ninguna afirmación se
acepta solo porque parezca correcta**. Estas reglas aplican a cualquier lección, pregunta o
ejercicio nuevo.

## Dónde vive cada cosa

| Qué | Dónde |
|---|---|
| Grafo de conceptos (módulos, conceptos, prerrequisitos, proyectos) | `src/content/curriculum/*.ts` |
| Preguntas del diagnóstico | `src/content/diagnostic/*.ts` |
| Lección | `src/content/lessons/<slug-módulo>/<slug>/` con `leccion.mdx`, `leccion.ts`, `preguntas.ts`, `ejercicios.ts` |
| Registro de lecciones | `src/content/lessons/index.ts` y `src/content/lessons/mdx.tsx` |
| Tipos | `src/content/types.ts` |

## Reglas

1. **Fuentes oficiales.** Cada lección se escribe a partir de la documentación oficial
   (react.dev, MDN, el manual de TypeScript, la doc de Next.js en
   `node_modules/next/dist/docs/` para la versión instalada) y las cita en `sources`.
2. **Las preguntas "predecir" se verifican ejecutándolas.** El validador ejecuta el código con
   Node como módulo ES y exige que la salida real coincida con la opción correcta (y con
   ninguna otra). Los errores sin capturar se escriben como `Uncaught TypeError` y las promesas
   rechazadas como `Uncaught (in promise) Error`. No uses `console.log` de objetos o arrays
   (el formato difiere entre Node y el navegador): usa `join`, `JSON.stringify` o valores sueltos.
3. **Las preguntas "opción" pasan una revisión independiente** (un agente revisor distinto del
   autor) con estos criterios: la respuesta es correcta para las versiones instaladas, ninguna
   otra opción es defendible, la explicación es exacta y el enunciado no es ambiguo.
4. **Los ejercicios se verifican.** La solución de referencia debe pasar todos los tests y el
   código inicial debe fallar al menos uno. Los tests usan `describe`/`test`/`expect` globales
   (Jest en el navegador vía Sandpack, Vitest en CI).
5. **Cobertura.** Un módulo solo se añade a `publishedModules` cuando cada uno de sus conceptos
   tiene lección, pregunta y ejercicio; el validador lo comprueba.
6. **Videos de terceros.** Solo cuando aportan algo que el texto no da. Se guardan con título y
   canal exactos (el validador los compara con YouTube oEmbed) y una nota de "en qué fijarse".
   Como no se pueden ver, se eligen por metadatos y se priorizan canales con trayectoria.
7. **Versiones.** Cada lección declara `reviewed.date` y las versiones que asume.

## Estilo de las lecciones

- Empezar por un bug o problema real (idealmente uno de React) y bajar al concepto de JS.
- Explicaciones breves, ejemplo, "predice el resultado", errores comunes, ejercicio, resumen.
- Español neutro, tuteo. Términos técnicos en inglés cuando son los que usa la industria.
- Componentes MDX disponibles: `<Pregunta id="…" />`, `<Ejercicio id="…" />`,
  `<Callout type="clave|cuidado|nota">`.

## Flujo para un módulo nuevo

1. Revisar el estado del alumno (mapa de conceptos) para adaptar la profundidad.
2. Escribir lecciones, preguntas y ejercicios siguiendo las reglas.
3. `pnpm check` y `pnpm validate:content --videos`.
4. Revisión independiente de las preguntas "opción" y del texto.
5. Añadir el módulo a `publishedModules` cuando esté completo.
