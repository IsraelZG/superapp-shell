import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

/**
 * Avatares mock dos colaboradores + bolinha "editando agora".
 * Clicar abre popover com "X está editando o parágrafo N" (mock, sem sync real).
 */
export function PresenceAvatars({ collaborators }: { collaborators: string }) {
  const names = collaborators
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  const [open, setOpen] = useState(false);

  if (names.length === 0) {
    return (
      <span className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
        Sem colaboradores
      </span>
    );
  }

  const initials = (n: string) =>
    n
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${names.length} colaboradores — ver presença`}
          className="flex -space-x-2"
        >
          {names.slice(0, 3).map((n, i) => (
            <span
              key={n}
              className="relative grid h-7 w-7 place-items-center text-[10px] font-bold"
              style={{
                borderRadius: 9999,
                background: "var(--ds-theme-intent-accent-subtle)",
                color: "var(--ds-theme-intent-accent-on-subtle)",
                border: "2px solid var(--ds-theme-surface-default)",
                zIndex: 10 - i,
              }}
            >
              {initials(n)}
              {i === 0 && (
                <span
                  aria-hidden
                  className="absolute animate-pulse"
                  style={{
                    right: -1,
                    bottom: -1,
                    width: 8,
                    height: 8,
                    borderRadius: 9999,
                    background: "var(--ds-theme-intent-accent-fill)",
                    border: "2px solid var(--ds-theme-surface-default)",
                  }}
                />
              )}
            </span>
          ))}
          {names.length > 3 && (
            <span
              className="grid h-7 w-7 place-items-center text-[10px] font-bold"
              style={{
                borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-muted)",
                border: "2px solid var(--ds-theme-surface-default)",
              }}
            >
              +{names.length - 3}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
          Co-edição (mock)
        </p>
        <ul className="flex flex-col gap-2">
          {names.map((n, i) => (
            <li key={n} className="flex items-center gap-2 text-xs">
              <span
                className="grid h-6 w-6 place-items-center text-[9px] font-bold"
                style={{
                  borderRadius: 9999,
                  background: "var(--ds-theme-intent-accent-subtle)",
                  color: "var(--ds-theme-intent-accent-on-subtle)",
                }}
              >
                {initials(n)}
              </span>
              <span className="flex-1" style={{ color: "var(--ds-theme-content-default)" }}>
                <strong>{n}</strong>{" "}
                {i === 0
                  ? "está editando o parágrafo 3"
                  : i === 1
                    ? "visualizando o topo"
                    : "ausente há 2 min"}
              </span>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
}