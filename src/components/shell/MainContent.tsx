import type { ReactNode } from "react";
import { useCell, useValue } from "@/store/hooks";
import { navIconMap } from "./icons";

function TokenCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--ds-component-card-bg)",
        border: "1px solid var(--ds-theme-border-subtle)",
        borderRadius: "var(--ds-component-card-radius)",
        padding: "var(--ds-component-card-padding)",
        boxShadow: "var(--ds-component-card-shadow)",
      }}
    >
      <h3
        className="text-base font-semibold"
        style={{ color: "var(--ds-theme-content-strong)" }}
      >
        {title}
      </h3>
      <p
        className="mt-1 text-sm"
        style={{ color: "var(--ds-theme-content-muted)" }}
      >
        {description}
      </p>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function MainContent() {
  const activeNav = useValue("activeNav") as string;
  const label = useCell("nav", activeNav, "label") as string;
  const iconName = useCell("nav", activeNav, "icon") as string;
  const Icon = navIconMap[iconName];

  return (
    <main
      className="flex-1 overflow-y-auto"
      style={{ background: "var(--ds-theme-surface-canvas)" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6 md:p-10">
        <section
          className="flex items-center gap-4"
          style={{
            padding: "var(--ds-component-card-padding)",
            background: "var(--ds-theme-surface-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
            borderRadius: "var(--ds-component-card-radius)",
            boxShadow: "var(--ds-component-card-shadow)",
          }}
        >
          <div
            className="grid shrink-0 place-items-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: 20,
              background: "var(--ds-theme-intent-accent-subtle)",
              color: "var(--ds-theme-intent-accent-on-subtle)",
            }}
          >
            {Icon ? <Icon size={26} /> : null}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-xs font-medium uppercase tracking-wide"
              style={{ color: "var(--ds-theme-content-subtle)" }}
            >
              Destino ativo
            </p>
            <h2
              className="truncate text-2xl font-semibold"
              style={{ color: "var(--ds-theme-content-strong)" }}
            >
              {label}
            </h2>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--ds-theme-content-muted)" }}
            >
              Este espaço reflete a rota selecionada — lido diretamente do
              TinyBase (values.activeNav).
            </p>
          </div>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <TokenCard
            title="Tokens do design system"
            description="Cores, raios e sombras vêm de --ds-*. Nada é hardcoded."
          >
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["Accent", "var(--ds-theme-intent-accent-fill)"],
                  ["Success", "var(--ds-theme-intent-success-fill)"],
                  ["Warning", "var(--ds-theme-intent-warning-fill)"],
                  ["Danger", "var(--ds-theme-intent-danger-fill)"],
                  ["Info", "var(--ds-theme-intent-info-fill)"],
                ] as const
              ).map(([name, color]) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-2 text-xs font-semibold"
                  style={{
                    paddingInline: "var(--ds-component-badge-padding-x)",
                    paddingBlock: "var(--ds-component-badge-padding-y)",
                    borderRadius: "var(--ds-component-badge-radius)",
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-default)",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 9999,
                      background: color,
                    }}
                  />
                  {name}
                </span>
              ))}
            </div>
          </TokenCard>

          <TokenCard
            title="Estado local-first"
            description="Toda leitura/escrita passa pela store TinyBase — persistida em localStorage."
          >
            <button
              type="button"
              className="inline-flex items-center justify-center text-sm transition-colors"
              style={{
                height: "var(--ds-component-button-height-md)",
                paddingInline: "var(--ds-component-button-padding-x-md)",
                borderRadius: "var(--ds-component-button-radius)",
                fontWeight: 600,
                background: "var(--ds-theme-intent-primary-fill)",
                color: "var(--ds-theme-intent-primary-on-fill)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background =
                  "var(--ds-theme-intent-primary-fill-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background =
                  "var(--ds-theme-intent-primary-fill)")
              }
            >
              Ação primária
            </button>
          </TokenCard>
        </div>
      </div>
    </main>
  );
}