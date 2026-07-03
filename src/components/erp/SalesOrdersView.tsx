import { useMemo, useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { OverflowMenu } from "@/components/catalog/Menus";
import { formatBRL, formatDateShort, salesFlow, type SalesStatus } from "./utils";
import { NewOrderModal } from "./NewOrderModal";

type Row = { customerName?: string; items?: string; total?: number; status?: SalesStatus; createdAt?: string };

const statusStyle = (s: SalesStatus): { bg: string; fg: string; border?: string } => {
  switch (s) {
    case "rascunho":
      return { bg: "var(--ds-theme-surface-subdued)", fg: "var(--ds-theme-content-muted)", border: "1px dashed var(--ds-theme-border-subtle)" };
    case "confirmado":
      return { bg: "var(--ds-theme-intent-accent-subtle)", fg: "var(--ds-theme-intent-accent-on-subtle)" };
    case "faturado":
      return { bg: "var(--ds-theme-intent-accent-fill)", fg: "var(--ds-theme-intent-accent-on-fill)" };
  }
};

export function SalesOrdersView() {
  const table = useTable("salesOrders") as Record<string, Row>;
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      Object.entries(table).sort(
        ([, a], [, b]) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      ),
    [table],
  );

  const advance = (id: string, current: SalesStatus | undefined) => {
    const idx = salesFlow.indexOf(current ?? "rascunho");
    const next = salesFlow[Math.min(idx + 1, salesFlow.length - 1)];
    store.setCell("salesOrders", id, "status", next);
  };
  const goBack = (id: string, current: SalesStatus | undefined) => {
    const idx = salesFlow.indexOf(current ?? "rascunho");
    const prev = salesFlow[Math.max(idx - 1, 0)];
    store.setCell("salesOrders", id, "status", prev);
  };

  return (
    <section aria-labelledby="sales-h" className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id="sales-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Pedidos de venda
          </h3>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Rascunho → Confirmado → Faturado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold"
          style={{
            padding: "8px 14px",
            borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          <Plus size={12} aria-hidden /> Novo pedido
        </button>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhum pedido ainda"
          description="Crie o primeiro pedido de venda para começar."
          actionLabel="Novo pedido"
          onAction={() => setOpen(true)}
        />
      ) : (
        <ul aria-label="Pedidos de venda" className="flex flex-col gap-2">
          {rows.map(([id, r]) => {
            const st = (r.status ?? "rascunho") as SalesStatus;
            const ss = statusStyle(st);
            const isLast = st === "faturado";
            const isFirst = st === "rascunho";
            return (
              <li
                key={id}
                className="flex flex-wrap items-center gap-3 p-3 sm:p-4"
                style={{
                  borderRadius: "var(--ds-component-card-radius, 16px)",
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {r.customerName}
                  </p>
                  <p className="truncate text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {r.items} · {formatDateShort(r.createdAt)}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                  {formatBRL(r.total)}
                </span>
                <span
                  aria-label={`Status: ${st}`}
                  className="text-[11px] font-semibold uppercase"
                  style={{
                    padding: "3px 10px",
                    borderRadius: 9999,
                    background: ss.bg,
                    color: ss.fg,
                    border: ss.border,
                  }}
                >
                  {st}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => goBack(id, st)}
                    disabled={isFirst}
                    aria-label="Voltar status"
                    className="text-xs font-semibold"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 9999,
                      background: "var(--ds-theme-surface-subdued)",
                      color: "var(--ds-theme-content-default)",
                      opacity: isFirst ? 0.4 : 1,
                    }}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => advance(id, st)}
                    disabled={isLast}
                    className="inline-flex items-center gap-1 text-xs font-semibold"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 9999,
                      background: "var(--ds-theme-intent-accent-subtle)",
                      color: "var(--ds-theme-intent-accent-on-subtle)",
                      opacity: isLast ? 0.4 : 1,
                    }}
                  >
                    Avançar <ChevronRight size={12} aria-hidden />
                  </button>
                  <OverflowMenu
                    items={[
                      { label: "Duplicar", onSelect: () => {} },
                      { label: "Cancelar pedido", onSelect: () => store.delRow("salesOrders", id) },
                    ]}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <NewOrderModal
        open={open}
        onOpenChange={setOpen}
        kind="sales"
        onSubmit={({ party, items, total }) => {
          const id = `so_${Date.now()}`;
          store.setRow("salesOrders", id, {
            customerName: party,
            items,
            total,
            status: "rascunho",
            createdAt: new Date().toISOString(),
          });
        }}
      />
    </section>
  );
}