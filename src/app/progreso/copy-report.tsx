"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CopyReport({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sin permiso de portapapeles (p. ej. http en el teléfono): selecciona el texto a mano.
      setCopied(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={copy}>{copied ? "Copiado ✓" : "Copiar resumen"}</Button>
      <textarea
        readOnly
        value={text}
        aria-label="Resumen de progreso"
        onFocus={(e) => e.currentTarget.select()}
        className="h-96 w-full rounded-md border border-border bg-code-bg p-4 font-mono text-xs leading-relaxed"
      />
    </div>
  );
}
