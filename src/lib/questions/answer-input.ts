import { z } from "zod";

/** Validación de la entrada de las Server Actions de respuesta. */
export const answerInput = z.object({
  questionId: z.string().min(1).max(200),
  optionId: z.string().min(1).max(10),
  confident: z.boolean(),
});

export type AnswerInput = z.infer<typeof answerInput>;
