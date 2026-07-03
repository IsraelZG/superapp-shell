import { useCell, useValue } from "@/store/hooks";
import { navIconMap } from "../icons";
import { Columns2, PanelRightOpen, Plus } from "lucide-react";
import { ConversationView } from "@/components/messaging/ConversationView";
import { SocialModule } from "@/components/social/SocialModule";
import { MarketplaceModule } from "@/components/marketplace/MarketplaceModule";
import { StudioModule } from "@/components/studio/StudioModule";
import { ErpModule } from "@/components/erp/ErpModule";
import { ContabilModule } from "@/components/contabil/ContabilModule";

export function CentralApp({
  onSplit,
  onOpenColumn,
}: {
  onSplit?: () => void;
  onOpenColumn?: (label: string) => void;
}) {
  const activeNav = useValue("activeNav") as string;
  const label = (useCell("modules", activeNav, "label") as string) ?? "App";
  const iconName = useCell("modules", activeNav, "icon") as string;
  const Icon = navIconMap[iconName];

  if (activeNav === "mensagens") {
    return <ConversationView />;
  }

  if (activeNav === "social") {
    return <SocialModule />;
  }

  if (activeNav === "marketplace") {
    return <MarketplaceModule />;
  }

  if (activeNav === "studio") {
    return <StudioModule />;
  }

  if (activeNav === "erp") {
    return <ErpModule />;
  }

  if (activeNav === "contabil") {
    return <ContabilModule />;
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
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
            <p className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
              App ativo
            </p>
            <h2 className="truncate text-2xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              {label}
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
              Módulo carregado a partir da store TinyBase — trocar app no menu direito abre este espaço.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            {onSplit && (
              <button
                type="button"
                onClick={onSplit}
                title="Dividir coluna (exceção)"
                className="grid place-items-center transition-colors"
                style={{ width: 40, height: 40, borderRadius: 12, background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-default)" }}
              >
                <Columns2 size={16} />
              </button>
            )}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "Feed", desc: "Toque em um item para abri-lo como nova coluna." },
            { title: "Detalhes", desc: "Este card também pode virar coluna dedicada." },
          ].map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => onOpenColumn?.(`${label} — ${c.title}`)}
              className="text-left transition-transform hover:-translate-y-0.5"
              style={{
                background: "var(--ds-component-card-bg)",
                border: "1px solid var(--ds-theme-border-subtle)",
                borderRadius: "var(--ds-component-card-radius)",
                padding: "var(--ds-component-card-padding)",
                boxShadow: "var(--ds-component-card-shadow)",
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                  {c.title}
                </h3>
                <PanelRightOpen size={16} style={{ color: "var(--ds-theme-content-muted)" }} />
              </div>
              <p className="mt-1 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
                {c.desc}
              </p>
              <span
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold"
                style={{ color: "var(--ds-theme-intent-accent-fill)" }}
              >
                <Plus size={12} /> abrir em nova coluna
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}