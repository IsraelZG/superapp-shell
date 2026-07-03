import { useMemo, useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { OverflowMenu } from "@/components/catalog/Menus";
import { formatBRL, formatDateShort, purchaseFlow, type PurchaseStatus } from "./utils";
import { NewOrderModal } from "./NewOrderModal";

type Row = { supplierName?: string; items?: string; total?: number; status?: PurchaseStatus; createdAt?: string };

const statusStyle = (s: PurchaseStatus) => {
  switch (s) {
    case "solicitado":
      return { bg: "var(--ds-theme-surface-subdued)", fg: "var(--ds-theme-content-muted)", border: "1px dashed var(--ds-theme-border-subtle)" };
    case "aprovado":
      return { bg: "var(--ds-theme-intent-accent-subtle)", fg: "var(--ds-theme-intent-accent-on-subtle)", border: undefined };
    case "recebido":
      return { bg: "var(--ds-theme-intent-accent-fill)", fg: "var(--ds-theme-intent-accent-on-fill)", border: undefined };
  }
};

export function PurchaseOrdersView() {
  const table = useTable("purchaseOrders") as Record<string, Row>;
  const [open, setOpen] = useState(false);

  const rows = useMemo(
    () =>
      Object.entries(table).sort(
        ([, a], [, b]) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      ),
    [table],
  );

  const advance = (id: string, current: PurchaseStatus | undefined) => {
    const idx = purchaseFlow.indexOf(current ?? "solicitado");
    const next = purchaseFlow[Math.min(idx + 1, purchaseFlow.length - 1)];
    store.setCell("purchaseOrders", id, "status", next);
  };
  const goBack = (id: string, current: PurchaseStatus | undefined) => {
    const idx = purchaseFlow.indexOf(current ?? "solicitado");
    const prev = purchaseFlow[Math.max(idx - 1, 0)];
    store.setCell("purchaseOrders", id, "status", prev);
  };

  return (
    <section aria-labelledby="purchase-h" className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 id="purchase-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Pedidos de compra
          </h3>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Solicitado → Aprovado → Recebido.
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
          <Plus size={12} aria-hidden /> Nova compra
        </button>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhuma compra registrada"
          description="Crie uma requisição para começar."
          actionLabel="Nova compra"
          onAction={() => setOpen(true)}
        />
      ) : (
        <ul aria-label="Pedidos de compra" className="flex flex-col gap-2">
          {rows.map(([id, r]) => {
            const st = (r.status ?? "solicitado") as PurchaseStatus;
            const ss = statusStyle(st);
            const isLast = st === "recebido";
            const isFirst = st === "solicitado";
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
                    {r.supplierName}
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
                      { label: "Cancelar", onSelect: () => store.delRow("purchaseOrders", id) },
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
        kind="purchase"
        onSubmit={({ party, items, total }) => {
          const id = `po_${Date.now()}`;
          store.setRow("purchaseOrders", id, {
            supplierName: party,
            items,
            total,
            status: "solicitado",
            createdAt: new Date().toISOString(),
          });
        }}
      />
    </section>
  );
}