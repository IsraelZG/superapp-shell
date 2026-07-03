import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

/**
 * SaveIndicator — "Salvando..." → "Salvo" com debounce simulado.
 * Recebe uma `signal` (qualquer valor que muda a cada edição) e mostra o estado
 * "salvando" por ~700ms após cada mudança. A gravação real no TinyBase é feita
 * pelo caller — este componente é só feedback visual.
 */
export function SaveIndicator({ signal }: { signal: unknown }) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    // ignora o primeiro render (idle)
    if (signal === undefined || signal === null || signal === "") {
      setState("idle");
      return;
    }
    setState("saving");
    const t = setTimeout(() => setState("saved"), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signal]);

  if (state === "idle") return null;

  return (
    <span
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 text-[11px] font-medium"
      style={{
        padding: "3px 10px",
        borderRadius: 9999,
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-muted)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {state === "saving" ? (
        <>
          <Loader2 size={11} className="animate-spin" aria-hidden />
          Salvando…
        </>
      ) : (
        <>
          <Check size={11} aria-hidden />
          Salvo
        </>
      )}
    </span>
  );
}