import type { ReactNode } from "react";
import { Inbox, AlertTriangle, WifiOff, Loader2, Clock, CheckCircle2 } from "lucide-react";

export { AccessDeniedState, BlockedContentPlaceholder } from "@/components/security/AccessStates";

function Card({ children, role }: { children: ReactNode; role?: string }) {
  return (
    <div
      role={role}
      className="mx-auto flex max-w-md flex-col items-center gap-2 p-6 text-center"
      style={{
        borderRadius: "var(--ds-component-card-radius, 24px)",
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {children}
    </div>
  );
}

function IconBubble({ children }: { children: ReactNode }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-10 w-10 items-center justify-center"
      style={{ borderRadius: 9999, background: "var(--ds-theme-surface-default)" }}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title = "Nada por aqui ainda",
  description = "Quando houver conteúdo, ele aparece nesta área.",
  actionLabel,
  onAction,
  icon,
}: {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}) {
  return (
    <Card>
      <IconBubble>{icon ?? <Inbox size={18} />}</IconBubble>
      <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{title}</div>
      <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{description}</div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-2 text-xs font-semibold"
          style={{
            padding: "8px 16px",
            borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          {actionLabel}
        </button>
      )}
    </Card>
  );
}

export function ErrorState({
  title = "Não foi possível carregar",
  description = "Verifique sua conexão e tente novamente.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <Card role="alert">
      <IconBubble>
        <AlertTriangle size={18} style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }} />
      </IconBubble>
      <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{title}</div>
      <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{description}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-xs font-semibold"
          style={{
            padding: "8px 16px",
            borderRadius: 9999,
            background: "var(--ds-theme-surface-default)",
            color: "var(--ds-theme-content-strong)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          Tentar novamente
        </button>
      )}
    </Card>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-3 p-4"
      style={{
        borderRadius: "var(--ds-component-card-radius, 24px)",
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      <div
        className="animate-pulse"
        style={{ height: 14, width: "50%", borderRadius: 8, background: "var(--ds-theme-surface-subdued)" }}
      />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            height: 10,
            width: i === lines - 1 ? "70%" : "100%",
            borderRadius: 8,
            background: "var(--ds-theme-surface-subdued)",
          }}
        />
      ))}
    </div>
  );
}

export function OfflineBanner({ label = "Você está offline — mostrando dados em cache." }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex items-center gap-2 px-4 py-2 text-xs"
      style={{
        borderRadius: 12,
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-muted)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      <WifiOff size={14} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export function SyncingState({ label = "Sincronizando…" }: { label?: string }) {
  return (
    <Card role="status">
      <IconBubble>
        <Loader2 size={18} className="animate-spin" />
      </IconBubble>
      <div className="text-sm font-medium">{label}</div>
    </Card>
  );
}

export function PendingBadge({ label = "Pendente" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
      style={{
        padding: "3px 10px",
        borderRadius: 9999,
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-strong)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      <span
        aria-hidden
        className="animate-pulse"
        style={{
          width: 8,
          height: 8,
          borderRadius: 9999,
          background: "var(--ds-theme-intent-accent-fill)",
        }}
      />
      {label}
    </span>
  );
}

export function DoneBadge({ label = "Finalizado" }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
      style={{
        padding: "3px 10px",
        borderRadius: 9999,
        background: "var(--ds-theme-intent-accent-subtle)",
        color: "var(--ds-theme-content-strong)",
      }}
    >
      <CheckCircle2 size={12} aria-hidden />
      {label}
    </span>
  );
}

export function TTLLock({ until, label = "Reservado até" }: { until: string; label?: string }) {
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
      aria-label={`${label} ${until}`}
    >
      <Clock size={12} aria-hidden />
      {label} {until}
    </span>
  );
}