import { useMemo, useState } from "react";
import { AlertTriangle, Warehouse, Lock } from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { EmptyState, TTLLock, SyncingState } from "@/components/catalog/States";
import { SearchInput } from "@/components/catalog/Navigation";
import { ttlLabel } from "./utils";
import { ReserveStockModal } from "./ReserveStockModal";

type Row = {
  sku?: string;
  name?: string;
  warehouseId?: string;
  warehouseName?: string;
  qtyAvailable?: number;
  qtyReserved?: number;
  lockExpiresAt?: string;
};

type Grouped = {
  sku: string;
  name: string;
  warehouses: Array<{
    id: string; // inventory row id
    warehouseName: string;
    qtyAvailable: number;
    qtyReserved: number;
    lockExpiresAt: string;
  }>;
};

export function InventoryView() {
  const table = useTable("inventory") as Record<string, Row>;
  const [query, setQuery] = useState("");
  const [recalc, setRecalc] = useState(false);
  const [target, setTarget] = useState<null | {
    id: string;
    sku: string;
    name: string;
    warehouseName: string;
    qtyAvailable: number;
  }>(null);

  const grouped: Grouped[] = useMemo(() => {
    const map = new Map<string, Grouped>();
    for (const [id, r] of Object.entries(table)) {
      const sku = r.sku ?? "—";
      if (!map.has(sku)) {
        map.set(sku, { sku, name: r.name ?? sku, warehouses: [] });
      }
      map.get(sku)!.warehouses.push({
        id,
        warehouseName: r.warehouseName ?? "—",
        qtyAvailable: r.qtyAvailable ?? 0,
        qtyReserved: r.qtyReserved ?? 0,
        lockExpiresAt: r.lockExpiresAt ?? "",
      });
    }
    const q = query.trim().toLowerCase();
    const arr = Array.from(map.values());
    return q
      ? arr.filter(
          (g) =>
            g.sku.toLowerCase().includes(q) || g.name.toLowerCase().includes(q),
        )
      : arr;
  }, [table, query]);

  const doReserve = (id: string, qty: number, expiresAt: string) => {
    const current = (table[id]?.qtyReserved as number) ?? 0;
    const avail = (table[id]?.qtyAvailable as number) ?? 0;
    store.setCell("inventory", id, "qtyReserved", current + qty);
    store.setCell("inventory", id, "qtyAvailable", Math.max(0, avail - qty));
    store.setCell("inventory", id, "lockExpiresAt", expiresAt);
  };

  const simulateRecalc = () => {
    setRecalc(true);
    setTimeout(() => setRecalc(false), 1500);
  };

  return (
    <section aria-labelledby="inv-h" className="flex flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="inv-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Estoque multi-depósito
          </h3>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Agrupado por SKU. Itens com reserva ativa mostram o TTL Lock.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar SKU ou nome…" />
          <button
            type="button"
            onClick={simulateRecalc}
            className="inline-flex items-center gap-1 text-xs font-semibold"
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
        </div>
      </header>

      {recalc && <SyncingState label="Recalculando projeção…" />}

      {grouped.length === 0 ? (
        <EmptyState
          title="Nenhum item encontrado"
          description="Ajuste a busca ou cadastre novos SKUs."
        />
      ) : (
        <ul aria-label="Inventário por SKU" className="flex flex-col gap-2">
          {grouped.map((g) => (
            <li
              key={g.sku}
              className="flex flex-col gap-3 p-4"
              style={{
                borderRadius: "var(--ds-component-card-radius, 16px)",
                background: "var(--ds-theme-surface-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {g.name}
                  </p>
                  <p className="text-[11px] tabular-nums" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {g.sku}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-[11px] font-semibold"
                  style={{
                    padding: "3px 10px",
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-muted)",
                  }}
                >
                  <Warehouse size={12} aria-hidden />
                  {g.warehouses.length} {g.warehouses.length === 1 ? "depósito" : "depósitos"}
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {g.warehouses.map((w) => {
                  const ttl = ttlLabel(w.lockExpiresAt);
                  const hasReserve = w.qtyReserved > 0;
                  const expired = hasReserve && ttl.expired;
                  return (
                    <div
                      key={w.id}
                      className="flex flex-col gap-2 p-3"
                      style={{
                        borderRadius: 12,
                        background: hasReserve
                          ? "var(--ds-theme-intent-accent-subtle)"
                          : "var(--ds-theme-surface-subdued)",
                        border: `1px ${expired ? "dashed" : "solid"} var(--ds-theme-border-subtle)`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                          {w.warehouseName}
                        </span>
                        <span className="text-sm font-bold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                          {w.qtyAvailable}
                        </span>
                      </div>
                      {hasReserve && (
                        <div className="flex flex-col gap-1">
                          <span
                            className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold uppercase"
                            style={{
                              padding: "2px 8px",
                              borderRadius: 9999,
                              background: "var(--ds-theme-surface-default)",
                              color: "var(--ds-theme-intent-accent-on-subtle)",
                            }}
                          >
                            <Lock size={10} aria-hidden /> {w.qtyReserved} reservado
                          </span>
                          {expired ? (
                            <span
                              role="status"
                              className="inline-flex w-fit items-center gap-1 text-[10px] font-semibold"
                              style={{
                                padding: "3px 8px",
                                borderRadius: 9999,
                                background: "var(--ds-theme-surface-default)",
                                color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))",
                                border: "1px dashed var(--ds-theme-border-subtle)",
                              }}
                            >
                              <AlertTriangle size={10} aria-hidden />
                              Reserva expirada — estoque deveria ser liberado
                            </span>
                          ) : (
                            <TTLLock until={`em ${ttl.text}`} />
                          )}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setTarget({
                            id: w.id,
                            sku: g.sku,
                            name: g.name,
                            warehouseName: w.warehouseName,
                            qtyAvailable: w.qtyAvailable,
                          })
                        }
                        disabled={w.qtyAvailable <= 0}
                        className="mt-1 text-[11px] font-semibold"
                        style={{
                          padding: "6px 10px",
                          borderRadius: 9999,
                          background: "var(--ds-theme-surface-default)",
                          color: "var(--ds-theme-content-default)",
                          border: "1px solid var(--ds-theme-border-subtle)",
                          opacity: w.qtyAvailable <= 0 ? 0.4 : 1,
                        }}
                      >
                        Reservar
                      </button>
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <ReserveStockModal
        open={!!target}
        onOpenChange={(v) => !v && setTarget(null)}
        target={target}
        onConfirm={doReserve}
      />
    </section>
  );
}