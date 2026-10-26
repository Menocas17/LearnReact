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

Las lecciones son **narrativas**: se leen como una clase que construye una idea, no como una
referencia. Modelo de referencia: `src/content/lessons/asincronia/event-loop/leccion.mdx`.

**Estructura**

1. **Un caso que engancha.** Una situación concreta (un ticket, un bug en producción, una
   revisión de código), idealmente de React o Next. Termina con 2–4 **preguntas explícitas** que
   la lección va a responder. El caso no se abandona: se retoma al final.
2. **Trasfondo.** Por qué el lenguaje o la herramienta es así: qué problema resolvía, qué
   alternativa se descartó, de dónde viene. Una regla con historia se recuerda; una regla suelta
   no. Solo hechos comprobables: nada de citas inventadas ni fechas dudosas (si no estás seguro
   de una fecha, no la pongas).
3. **Un modelo mental que se construye por capas.** Una analogía o imagen central que se presenta
   una vez y se amplía con cada concepto nuevo (no una analogía distinta por sección). Después de
   cada capa, código que la pone a prueba.
4. **Pausas para predecir.** Antes de revelar un comportamiento no obvio, `<AntesDeSeguir>` con el
   código y la pregunta, y la explicación dentro de `<Respuesta>`. Varias por lección, además de
   las `<Pregunta>` evaluadas. Su salida también tiene que ser correcta: ejecútala con Node.
5. **Profundidad real.** Los porqués de segundo nivel ("¿por qué funciona a medias?", "¿por qué
   aquí sí y allí no?"), los casos límite y la conexión con React/Next. Lo opcional (detalles de la
   especificación, historia larga, diferencias entre motores) va en `<Profundiza titulo="…">`.
6. **El caso, resuelto.** Volver al caso inicial y responder cada pregunta con lo aprendido.
7. **Práctica** con los ejercicios, presentados como continuación de la historia.
8. **Cierre** en prosa ("lo que ahora puedes explicar") que conecta con la siguiente lección,
   en lugar de un resumen en viñetas.

**Tono**

- Segunda persona, tuteo, español neutro. Cercano pero preciso: el tono narrativo nunca justifica
  una afirmación imprecisa.
- Párrafos cortos. Tablas solo para comparar; las trazas paso a paso se narran.
- Términos técnicos en inglés cuando son los que usa la industria, explicados la primera vez.
- Las `<Pregunta>` y los `<Ejercicio>` se introducen con una frase que diga qué ponen a prueba.

**Componentes MDX**

- `<Pregunta id="…" />` y `<Ejercicio id="…" />`: cada pregunta y ejercicio de la lección aparece
  exactamente una vez (el validador lo comprueba).
- `<AntesDeSeguir>` … `<Respuesta>` … `</Respuesta>` `</AntesDeSeguir>`: pausa para predecir.
- `<Profundiza titulo="…">`: contexto opcional, plegado.
- `<Callout type="clave|cuidado|nota">`: la idea que hay que llevarse, o una advertencia.
- Citas con `>` para reglas memorables o el texto de un ticket; `---` para separar actos.
- Dentro de un componente, deja líneas en blanco alrededor del Markdown que contiene.

## Flujo para un módulo nuevo

1. Revisar el estado del alumno (mapa de conceptos) para adaptar la profundidad.
2. Escribir lecciones, preguntas y ejercicios siguiendo las reglas.
3. `pnpm check` y `pnpm validate:content --videos`.
4. Revisión independiente de las preguntas "opción" y del texto.
5. Añadir el módulo a `publishedModules` cuando esté completo.
