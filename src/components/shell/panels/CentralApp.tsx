import { useCell, useValue } from "@/store/hooks";
import { navIconMap } from "../icons";
import { Columns2, PanelRightOpen, Plus } from "lucide-react";
import { ConversationView } from "@/components/messaging/ConversationView";
import { SocialModule } from "@/components/social/SocialModule";
import { MarketplaceModule } from "@/components/marketplace/MarketplaceModule";
import { StudioModule } from "@/components/studio/StudioModule";
import { ErpModule } from "@/components/erp/ErpModule";
import { ContabilModule } from "@/components/contabil/ContabilModule";
import { MapaModule } from "@/components/mapa/MapaModule";
import { LogisticaModule } from "@/components/logistica/LogisticaModule";
import { StreamingModule } from "@/components/streaming/StreamingModule";
import { AdsModule } from "@/components/ads/AdsModule";
import { EmailModule } from "@/components/email/EmailModule";
import { CalendarioModule } from "@/components/calendario/CalendarioModule";

export function CentralApp({
  onSplit,
  onOpenColumn,
}: {
  onSplit?: () => void;
  onOpenColumn?: (label: string) => void;
}) {
  const activeNav = useValue("activeNav") as string;
  const activeComms = useValue("activeComms") as string;
  const label = (useCell("modules", activeNav, "label") as string) ?? "App";
  const iconName = useCell("modules", activeNav, "icon") as string;
  const Icon = navIconMap[iconName];

  // B10 — quando o item "Email" do CommsRail está ativo, a coluna central
  // renderiza o módulo de Email. Reusa o rail existente (não recria header/rail).
  if (activeComms === "email") {
    return <EmailModule />;
  }

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

  if (activeNav === "mapa") {
    return <MapaModule />;
  }

  if (activeNav === "logistica") {
    return <LogisticaModule />;
  }

  if (activeNav === "streaming") {
    return <StreamingModule />;
  }

  if (activeNav === "ads") {
    return <AdsModule />;
  }

  if (activeNav === "calendario") {
    return <CalendarioModule />;
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-y-auto" style={{ background: "var(--ds-theme-surface-canvas)" }}>
      <div
        aria-hidden
        className="text-ghost pointer-events-none absolute inset-x-0 bottom-0 select-none whitespace-nowrap text-center"
        style={{ fontSize: "clamp(6rem, 18vw, 16rem)" }}
      >
        {label.toUpperCase()}
      </div>
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-10 p-8 brut-stagger">
        <div className="flex items-baseline justify-between border-b border-[color:var(--ds-theme-border-subtle)] pb-3">
          <span className="brut-section-label">[ 001 · APP ATIVO ]</span>
          {onSplit && (
            <button
              type="button"
              onClick={onSplit}
              title="Dividir coluna (exceção)"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{
                padding: "6px 10px",
                borderRadius: 0,
                background: "transparent",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
                fontFamily: "var(--font-mono)",
              }}
            >
              <Columns2 size={12} /> DIVIDIR
            </button>
          )}
        </div>

        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div
              className="grid shrink-0 place-items-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 0,
                background: "var(--ds-theme-content-strong)",
                color: "var(--ds-theme-surface-canvas)",
              }}
            >
              {Icon ? <Icon size={26} /> : null}
            </div>
            <div className="min-w-0 flex-1">
              <h1
                className="truncate"
                style={{
                  color: "var(--ds-theme-content-strong)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "-0.03em",
                  lineHeight: 0.9,
                  fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                }}
              >
                {label}
              </h1>
              <p className="mt-2 brut-meta" style={{ maxWidth: 640 }}>
                MÓDULO CARREGADO DA STORE TINYBASE · TROCA VIA RAIL LATERAL
              </p>
            </div>
          </div>
        </section>

        <div className="border-b border-[color:var(--ds-theme-border-subtle)] pb-3">
          <span className="brut-section-label">[ 002 · ACESSO RÁPIDO ]</span>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          {[
            { title: "Feed", desc: "Toque em um item para abri-lo como nova coluna." },
            { title: "Detalhes", desc: "Este card também pode virar coluna dedicada." },
          ].map((c, i) => (
            <button
              key={c.title}
              type="button"
              onClick={() => onOpenColumn?.(`${label} — ${c.title}`)}
              className="group text-left transition-colors"
              style={{
                background: "transparent",
                border: "1px solid var(--ds-theme-border-subtle)",
                borderRadius: 0,
                padding: "24px",
                marginLeft: i > 0 ? "-1px" : 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-theme-surface-subdued)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <div className="flex items-center justify-between">
                <h3
                  style={{
                    color: "var(--ds-theme-content-strong)",
                    fontFamily: "var(--font-display)",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    fontSize: "1.5rem",
                    letterSpacing: "-0.01em",
                    lineHeight: 1,
                  }}
                >
                  {c.title}
                </h3>
                <PanelRightOpen size={16} style={{ color: "var(--ds-theme-content-muted)" }} />
              </div>
              <p className="mt-3 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
                {c.desc}
              </p>
              <span
                className="mt-4 inline-flex items-center gap-1 text-[10px] font-semibold uppercase"
                style={{ color: "var(--signal, #D71E33)", fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
              >
                <Plus size={12} /> ABRIR EM NOVA COLUNA
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}