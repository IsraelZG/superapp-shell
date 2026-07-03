/**
 * B6 — Logística & Fulfillment (T-LOG)
 *
 * Módulo renderizado na coluna central do shell FlexLayout (A1). Toda leitura
 * vem de TinyBase via `@/store/hooks`; tokens `--ds-*` para toda cor/raio.
 *
 * Abas:
 *   - WMS (operações de armazém + inventário cíclico)
 *   - Fulfillment (alocação multi-depósito + saga + disputa/escrow)
 *   - App do entregador (mobile-first, mesmo em desktop)
 *   - Rastreio ao vivo (placeholder ◻)
 *   - Cotação / etiqueta (placeholder ◻)
 */
import { useState } from "react";
import { Truck, Warehouse, PackageSearch, Smartphone, MapPin, Tag } from "lucide-react";
import { WmsView } from "./WmsView";
import { FulfillmentView } from "./FulfillmentView";
import { CourierAppView } from "./CourierAppView";
import { EmptyState } from "@/components/catalog/States";

type Tab = "wms" | "fulfillment" | "courier" | "tracking" | "quote";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "wms",         label: "WMS",           icon: <Warehouse size={14} aria-hidden /> },
  { key: "fulfillment", label: "Fulfillment",   icon: <PackageSearch size={14} aria-hidden /> },
  { key: "courier",     label: "App entregador",icon: <Smartphone size={14} aria-hidden /> },
  { key: "tracking",    label: "Rastreio",      icon: <MapPin size={14} aria-hidden /> },
  { key: "quote",       label: "Cotação",       icon: <Tag size={14} aria-hidden /> },
];

export function LogisticaModule() {
  const [tab, setTab] = useState<Tab>("wms");

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
              Módulo
            </p>
            <h2 className="flex items-center gap-2 text-2xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              <Truck size={22} aria-hidden />
              Logística
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
              WMS, alocação multi-depósito e app do entregador — dados locais via TinyBase.
            </p>
          </div>
        </header>

        <nav
          aria-label="Áreas de logística"
          className="flex flex-wrap items-center gap-1 p-1"
          style={{
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px solid var(--ds-theme-border-subtle)",
            width: "fit-content",
          }}
        >
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={active ? "page" : undefined}
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{
                  padding: "6px 12px",
                  borderRadius: 9999,
                  background: active ? "var(--ds-theme-intent-accent-fill)" : "transparent",
                  color: active ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-default)",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "wms" && <WmsView />}
        {tab === "fulfillment" && <FulfillmentView />}
        {tab === "courier" && <CourierAppView />}
        {tab === "tracking" && (
          <EmptyState
            title="Rastreio ao vivo em breve"
            description="Vamos reusar o módulo Mapa (B5) para plotar pins das entregas em rota. Sem posicionamento em tempo real neste mockup."
          />
        )}
        {tab === "quote" && (
          <EmptyState
            title="Cotação e etiqueta em breve"
            description="Cotação de frete multitransportadora e geração de etiqueta ficam nesta área — placeholder navegável."
          />
        )}
      </div>
    </div>
  );
}