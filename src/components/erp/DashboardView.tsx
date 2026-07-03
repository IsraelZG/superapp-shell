import { useMemo, useState } from "react";
import { useTable } from "@/store/hooks";
import { ErrorState, SyncingState } from "@/components/catalog/States";
import { formatBRL, type SalesStatus } from "./utils";

type Sale = { total?: number; status?: SalesStatus };
type Purchase = { total?: number; status?: string };
type Deal = { value?: number; stage?: string };

export function DashboardView() {
  const sales = useTable("salesOrders") as Record<string, Sale>;
  const purchases = useTable("purchaseOrders") as Record<string, Purchase>;
  const pipeline = useTable("pipeline") as Record<string, Deal>;

  const [recalc, setRecalc] = useState(false);
  const [costError, setCostError] = useState(false);

  const metrics = useMemo(() => {
    const invoiced = Object.values(sales)
      .filter((s) => s.status === "faturado")
      .reduce((sum, s) => sum + (s.total ?? 0), 0);
    const openSales = Object.values(sales).filter((s) => s.status !== "faturado").length;
    const openPurchases = Object.values(purchases).filter((p) => p.status !== "recebido").length;
    const pipelineValue = Object.values(pipeline).reduce((sum, d) => sum + (d.value ?? 0), 0);
    return { invoiced, openSales, openPurchases, pipelineValue };
  }, [sales, purchases, pipeline]);

  const runReport = () => {
    // Simula que consulta pesada estoura o limite de custo.
    setCostError(true);
  };
  const runRecalc = () => {
    setRecalc(true);
    setTimeout(() => setRecalc(false), 1500);
  };

  return (
    <section aria-labelledby="dash-h" className="flex flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="dash-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Visão geral
          </h3>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Métricas agregadas do mês.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runRecalc}
            className="text-xs font-semibold"
            style={{
              padding: "8px 12px",
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            Simular recálculo
          </button>
          <button
            type="button"
            onClick={runReport}
            className="text-xs font-semibold"
            style={{
              padding: "8px 12px",
              borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            Gerar relatório completo
          </button>
        </div>
      </header>

      {recalc && <SyncingState label="Recalculando projeção…" />}

      {costError && (
        <ErrorState
          title="Consulta excede o limite de custo"
          description="Refine os filtros (período, segmento ou depósito) e tente novamente para gerar o relatório."
          onRetry={() => setCostError(false)}
        />
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card label="Receita faturada" value={formatBRL(metrics.invoiced)} />
        <Card label="Pedidos abertos" value={String(metrics.openSales)} />
        <Card label="Compras pendentes" value={String(metrics.openPurchases)} />
        <Card label="Pipeline (valor)" value={formatBRL(metrics.pipelineValue)} />
      </div>
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 p-4"
      style={{
        borderRadius: "var(--ds-component-card-radius, 16px)",
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
        boxShadow: "var(--ds-component-card-shadow)",
      }}
    >
      <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
        {value}
      </span>
    </div>
  );
}