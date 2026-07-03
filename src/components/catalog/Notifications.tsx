import type { ReactNode } from "react";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

type Intent = "info" | "warn" | "error" | "success";

const intentToken: Record<Intent, { bg: string; fg: string; icon: ReactNode }> = {
  info: {
    bg: "var(--ds-theme-intent-accent-subtle, var(--ds-theme-surface-subdued))",
    fg: "var(--ds-theme-content-strong)",
    icon: <Info size={16} aria-hidden />,
  },
  warn: {
    bg: "var(--ds-theme-intent-warning-subtle, var(--ds-theme-surface-subdued))",
    fg: "var(--ds-theme-content-strong)",
    icon: <AlertTriangle size={16} aria-hidden />,
  },
  error: {
    bg: "var(--ds-theme-intent-danger-subtle, var(--ds-theme-surface-subdued))",
    fg: "var(--ds-theme-content-strong)",
    icon: <XCircle size={16} aria-hidden />,
  },
  success: {
    bg: "var(--ds-theme-intent-success-subtle, var(--ds-theme-intent-accent-subtle))",
    fg: "var(--ds-theme-content-strong)",
    icon: <CheckCircle2 size={16} aria-hidden />,
  },
};

export function Banner({
  intent = "info",
  title,
  children,
}: {
  intent?: Intent;
  title: string;
  children?: ReactNode;
}) {
  const t = intentToken[intent];
  return (
    <div
      role={intent === "error" ? "alert" : "status"}
      className="flex items-start gap-3 px-4 py-3"
      style={{
        borderRadius: 16,
        background: t.bg,
        color: t.fg,
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      <span className="mt-0.5">{t.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{title}</div>
        {children && (
          <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{children}</div>
        )}
      </div>
    </div>
  );
}

export function CountBadge({ count, label }: { count: number; label?: string }) {
  if (count <= 0) return null;
  return (
    <span
      aria-label={label ? `${count} ${label}` : `${count} não lidos`}
      className="grid place-items-center text-[10px] font-bold"
      style={{
        minWidth: 20,
        height: 20,
        padding: "0 6px",
        borderRadius: 9999,
        background: "var(--ds-theme-intent-accent-fill)",
        color: "var(--ds-theme-intent-accent-on-fill)",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}