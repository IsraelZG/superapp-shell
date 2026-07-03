/**
 * B3 — ERP / CRM
 *
 * Módulo renderizado dentro da coluna central do shell FlexLayout (A1).
 * Navegação interna por abas — cada aba é uma "tela" do módulo (Vendas,
 * Compras, Estoque, Pipeline, Clientes, Financeiro/placeholder,
 * Conciliação/placeholder, Dashboard).
 */
import { useState } from "react";
import {
  Briefcase,
  ShoppingCart,
  Truck,
  Warehouse,
  KanbanSquare,
  Users,
  Wallet,
  ClipboardCheck,
  BarChart3,
} from "lucide-react";
import { SalesOrdersView } from "./SalesOrdersView";
import { PurchaseOrdersView } from "./PurchaseOrdersView";
import { InventoryView } from "./InventoryView";
import { PipelineKanban } from "./PipelineKanban";
import { CustomersView } from "./CustomersView";
import { DashboardView } from "./DashboardView";
import { EmptyState } from "@/components/catalog/States";

type Tab =
  | "dashboard"
  | "sales"
  | "purchase"
  | "inventory"
  | "pipeline"
  | "customers"
  | "finance"
  | "reconcile";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Visão", icon: <BarChart3 size={14} aria-hidden /> },
  { key: "sales", label: "Vendas", icon: <ShoppingCart size={14} aria-hidden /> },
  { key: "purchase", label: "Compras", icon: <Truck size={14} aria-hidden /> },
  { key: "inventory", label: "Estoque", icon: <Warehouse size={14} aria-hidden /> },
  { key: "pipeline", label: "Pipeline", icon: <KanbanSquare size={14} aria-hidden /> },
  { key: "customers", label: "Clientes", icon: <Users size={14} aria-hidden /> },
  { key: "finance", label: "Financeiro", icon: <Wallet size={14} aria-hidden /> },
  { key: "reconcile", label: "Conciliação", icon: <ClipboardCheck size={14} aria-hidden /> },
];

export function ErpModule() {
  const [tab, setTab] = useState<Tab>("dashboard");

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
              Módulo
            </p>
            <h2 className="flex items-center gap-2 text-2xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              <Briefcase size={22} aria-hidden />
              ERP · CRM
            </h2>
          </div>
        </header>

        <nav
          aria-label="Áreas do ERP"
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

        {tab === "dashboard" && <DashboardView />}
        {tab === "sales" && <SalesOrdersView />}
        {tab === "purchase" && <PurchaseOrdersView />}
        {tab === "inventory" && <InventoryView />}
        {tab === "pipeline" && <PipelineKanban />}
        {tab === "customers" && <CustomersView />}
        {tab === "finance" && (
          <EmptyState
            title="Contas a pagar e receber"
            description="Módulo financeiro chega em breve. Você poderá conciliar lançamentos, agendar boletos e acompanhar fluxo de caixa por aqui."
          />
        )}
        {tab === "reconcile" && (
          <EmptyState
            title="Conciliação bancária"
            description="Importação de extratos e correspondência automática com pedidos e ordens de compra estarão disponíveis em breve."
          />
        )}
      </div>
    </div>
  );
}