"use client";

import { useState, useTransition } from "react";
import type { AnswerInput } from "@/lib/questions/answer-input";
import type { AnswerResult, PublicQuestion } from "@/lib/questions/public";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** Si el servidor no responde en este tiempo, se avisa y se permite reintentar. */
const ANSWER_TIMEOUT_MS = 15_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(id);
        resolve(value);
      },
      (error) => {
        clearTimeout(id);
        reject(error);
      },
    );
  });
}

type Props = {
  question: PublicQuestion;
  answer: (input: AnswerInput) => Promise<AnswerResult>;
  /** Resultado previo (si ya se respondió) para mostrar directamente el feedback. */
  initial?: { selected: string; result: AnswerResult };
  onAnswered?: (result: AnswerResult, selected: string) => void;
  footer?: React.ReactNode;
};

export function QuestionCard({ question, answer, initial, onAnswered, footer }: Props) {
  const [selected, setSelected] = useState<string | null>(initial?.selected ?? null);
  const [result, setResult] = useState<AnswerResult | null>(initial?.result ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const predict = question.kind === "predecir";

  function submit(confident: boolean) {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      try {
        const r = await withTimeout(
          answer({ questionId: question.id, optionId: selected, confident }),
          ANSWER_TIMEOUT_MS,
        );
        setResult(r);
        onAnswered?.(r, selected);
      } catch (e) {
        setError(
          e instanceof Error && e.message === "timeout"
            ? "El servidor no respondió al guardar la respuesta. Revisa que la app siga corriendo y vuelve a intentarlo."
            : "No se pudo guardar la respuesta. Inténtalo de nuevo.",
        );
      }
    });
  }

  return (
    <div className="space-y-4">
      <p className="font-medium leading-relaxed">{question.prompt}</p>
      {question.codeHtml && (
        <div
          className="overflow-x-auto rounded-md border border-border bg-code-bg p-4 text-sm [&_pre]:font-mono"
          dangerouslySetInnerHTML={{ __html: question.codeHtml }}
        />
      )}

      <fieldset disabled={result !== null || pending} className="space-y-2">
        <legend className="sr-only">Opciones</legend>
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrect = result?.correctOptionId === option.id;
          const isWrongPick = result && isSelected && !result.correct;
          return (
            <label
              key={option.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-md border border-border p-3 transition-colors",
                !result && "hover:bg-subtle",
                !result && isSelected && "border-primary bg-subtle",
                result && isCorrect && "border-dominado bg-dominado/10",
                isWrongPick && "border-hueco bg-hueco/10",
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={option.id}
                checked={isSelected}
                onChange={() => setSelected(option.id)}
                className="mt-1 accent-[var(--primary)]"
              />
              {predict ? (
                <pre className="flex-1 whitespace-pre-wrap font-mono text-sm">{option.text}</pre>
              ) : (
                <span className="flex-1 text-sm leading-relaxed">{option.text}</span>
              )}
            </label>
          );
        })}
      </fieldset>

      {!result && (
        <div className="flex flex-wrap gap-2">
          <Button disabled={!selected || pending} onClick={() => submit(true)}>
            Responder: estoy seguro
          </Button>
          <Button variant="secondary" disabled={!selected || pending} onClick={() => submit(false)}>
            Responder: tengo dudas
          </Button>
        </div>
      )}
      {pending && (
        <p className="text-sm text-muted" aria-live="polite">
          Guardando respuesta…
        </p>
      )}
      {error && (
        <p className="text-sm text-hueco" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div
          role="status"
          className={cn(
            "space-y-2 rounded-md border p-4 text-sm leading-relaxed",
            result.correct ? "border-dominado/50 bg-dominado/5" : "border-hueco/50 bg-hueco/5",
          )}
        >
          <p className="font-semibold">{result.correct ? "Correcto" : "No es correcto"}</p>
          <p>{result.explanation}</p>
        </div>
      )}
      {result && footer}
    </div>
  );
}
