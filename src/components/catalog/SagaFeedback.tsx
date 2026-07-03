import { CheckCircle2, Loader2, Circle, Undo2 } from "lucide-react";

export type SagaStep = { id: string; label: string; status: "done" | "current" | "pending" | "compensated" };

export function SagaProgress({ steps }: { steps: SagaStep[] }) {
  return (
    <ol className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-0" aria-label="Progresso da saga">
      {steps.map((s, i) => {
        const isDone = s.status === "done";
        const isCurrent = s.status === "current";
        const isCompensated = s.status === "compensated";
        const icon = isDone ? (
          <CheckCircle2 size={14} />
        ) : isCurrent ? (
          <Loader2 size={14} className="animate-spin" />
        ) : isCompensated ? (
          <Undo2 size={14} />
        ) : (
          <Circle size={14} />
        );
        const bg = isDone
          ? "var(--ds-theme-intent-accent-fill)"
          : isCurrent
            ? "var(--ds-theme-intent-accent-subtle)"
            : isCompensated
              ? "var(--ds-theme-surface-subdued)"
              : "var(--ds-theme-surface-default)";
        const fg = isDone
          ? "var(--ds-theme-intent-accent-on-fill)"
          : "var(--ds-theme-content-strong)";
        return (
          <li key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold"
              style={{
                borderRadius: 9999,
                background: bg,
                color: fg,
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              {icon}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className="hidden h-[2px] flex-1 sm:block"
                style={{
                  background: isDone
                    ? "var(--ds-theme-intent-accent-fill)"
                    : "var(--ds-theme-surface-subdued)",
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function CompensationBadge({ label = "Compensado" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
      style={{
        padding: "3px 10px",
        borderRadius: 9999,
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-muted)",
        border: "1px dashed var(--ds-theme-border-subtle)",
      }}
    >
      <Undo2 size={12} aria-hidden />
      {label}
    </span>
  );
}

export { TTLLock } from "./States";