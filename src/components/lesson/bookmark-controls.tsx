"use client";

import { useEffect, useState, useTransition } from "react";
import { saveBookmark } from "@/app/marcador/actions";

type Props = {
  lessonId: string;
  /** Marcador guardado si está en esta lección. */
  saved: { block: number; excerpt: string } | null;
};

const CONTAINER = "[data-lesson-content]";
const textOf = (el: Element) => (el.textContent ?? "").replace(/\s+/g, " ").trim();

function blocks(): HTMLElement[] {
  const container = document.querySelector(CONTAINER);
  return container ? (Array.from(container.children) as HTMLElement[]) : [];
}

/** Busca el bloque por su texto; si la lección cambió y no aparece, usa la posición. */
function findBlock(saved: { block: number; excerpt: string }): HTMLElement | undefined {
  const all = blocks();
  return all.find((el) => saved.excerpt && textOf(el).startsWith(saved.excerpt)) ?? all[saved.block];
}

function highlight(target: HTMLElement | undefined) {
  for (const el of document.querySelectorAll("[data-bookmark]")) el.removeAttribute("data-bookmark");
  target?.setAttribute("data-bookmark", "");
}

/**
 * Botón flotante "Marcar aquí": guarda el bloque que está arriba de la pantalla. Al entrar con
 * #marcador en la URL, lleva al bloque guardado.
 */
export function BookmarkControls({ lessonId, saved }: Props) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!saved) return;
    let tries = 0;
    let frame = 0;
    const apply = () => {
      const target = findBlock(saved);
      if (!target && tries++ < 60) {
        frame = requestAnimationFrame(apply);
        return;
      }
      highlight(target);
      if (target && window.location.hash === "#marcador") target.scrollIntoView({ block: "start" });
    };
    apply();
    return () => cancelAnimationFrame(frame);
  }, [saved]);

  function mark() {
    const all = blocks();
    // El primer bloque cuyo final queda por debajo de la cabecera es el que estás leyendo.
    const index = Math.max(0, all.findIndex((el) => el.getBoundingClientRect().bottom > 96));
    const target = all[index];
    if (!target) return;
    highlight(target);
    startTransition(async () => {
      try {
        await saveBookmark({ lessonId, block: index, excerpt: textOf(target).slice(0, 120) });
        setMessage("Marcador guardado aquí");
      } catch {
        setMessage("No se pudo guardar el marcador");
      }
      setTimeout(() => setMessage(null), 2500);
    });
  }

  return (
    <div className="fixed right-4 bottom-4 z-20 flex flex-col items-end gap-2">
      {message && (
        <p role="status" className="rounded-md bg-foreground px-3 py-1.5 text-sm text-background shadow">
          {message}
        </p>
      )}
      <button
        type="button"
        onClick={mark}
        disabled={pending}
        title="Guarda el párrafo que tienes arriba de la pantalla"
        className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-60"
      >
        🔖 Marcar aquí
      </button>
    </div>
  );
}
