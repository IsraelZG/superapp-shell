import { Lock, RefreshCw, EyeOff } from "lucide-react";

function Wrap({
  icon,
  title,
  children,
  role,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  role?: string;
}) {
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
      <div
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center"
        style={{
          borderRadius: 9999,
          background: "var(--ds-theme-surface-default)",
        }}
      >
        {icon}
      </div>
      <div className="text-sm font-medium">{title}</div>
      <div
        className="text-xs"
        style={{ color: "var(--ds-theme-content-muted)" }}
      >
        {children}
      </div>
    </div>
  );
}

export function AccessDeniedState() {
  return (
    <Wrap icon={<Lock size={18} />} title="Sem permissão">
      Você não tem permissão para ver este conteúdo.
    </Wrap>
  );
}

export function KeyRotationState() {
  return (
    <Wrap
      icon={<RefreshCw size={18} className="animate-spin" />}
      title="Sincronizando chaves de acesso…"
      role="status"
    >
      Tente novamente em instantes.
    </Wrap>
  );
}

export function BlockedContentPlaceholder() {
  return (
    <Wrap icon={<EyeOff size={18} />} title="Conteúdo oculto">
      Perfil bloqueado — o conteúdo desta pessoa está filtrado para você.
    </Wrap>
  );
}