/**
 * WMS — operações de armazém.
 *
 * Lista de `warehouses` com zonas mock ("Zona A · Zona B · …") e uma seção
 * "Inventário cíclico" listando quem tem `cycleCountDue:true`. O botão
 * "Iniciar contagem" é local (não persiste): marca o warehouseId como
 * "em andamento" em estado local por 1.5s, exibindo `SyncingState`.
 */
import { useState } from "react";
import { Warehouse, MapPin, ClipboardList, Play } from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { EmptyState, DoneBadge, PendingBadge, SyncingState } from "@/components/catalog/States";

type WarehouseRow = { name?: string; address?: string; zonesCount?: number; cycleCountDue?: boolean };

function zoneList(count: number): string {
  const letters = Array.from({ length: Math.max(1, Math.min(count, 8)) }, (_, i) =>
    `Zona ${String.fromCharCode(65 + i)}`,
  );
  return letters.join(" · ");
}

export function WmsView() {
  const table = useTable("warehouses") as Record<string, WarehouseRow>;
  const rows = Object.entries(table);
  const dueRows = rows.filter(([, r]) => r.cycleCountDue);
  const [inProgress, setInProgress] = useState<Record<string, boolean>>({});

  const startCount = (id: string) => {
    setInProgress((p) => ({ ...p, [id]: true }));
    window.setTimeout(() => {
      // ao terminar a "contagem" mockada, marca cycleCountDue = false
      store.setCell("warehouses", id, "cycleCountDue", false);
      setInProgress((p) => {
        const next = { ...p };
        delete next[id];
        return next;
      });
    }, 1500);
  };

  if (rows.length === 0) {
    return <EmptyState title="Nenhum depósito cadastrado" description="Cadastre um armazém para começar." />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Depósitos */}
      <section aria-labelledby="wms-depositos" className="flex flex-col gap-3">
        <h3 id="wms-depositos" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          <Warehouse size={16} aria-hidden />
          Depósitos ({rows.length})
        </h3>
        <ul className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(([id, r]) => (
            <li
              key={id}
              className="flex flex-col gap-2 p-4"
              style={{
                borderRadius: "var(--ds-component-card-radius, 20px)",
                background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
                border: "1px solid var(--ds-theme-border-subtle)",
                boxShadow: "var(--ds-component-card-shadow)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{r.name ?? id}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    <MapPin size={11} aria-hidden />
                    <span className="truncate">{r.address ?? "—"}</span>
                  </div>
                </div>
                {r.cycleCountDue ? <PendingBadge label="Contagem devida" /> : <DoneBadge label="Em dia" />}
              </div>
              <div
                className="mt-1 rounded-xl px-3 py-2 text-[11px]"
                style={{
                  background: "var(--ds-theme-surface-subdued)",
                  color: "var(--ds-theme-content-muted)",
                  border: "1px dashed var(--ds-theme-border-subtle)",
                }}
              >
                <div className="mb-1 text-[10px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
                  Endereçamento ({r.zonesCount ?? 0} zonas)
                </div>
                <div>{zoneList(r.zonesCount ?? 0)}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Inventário cíclico */}
      <section aria-labelledby="wms-ciclico" className="flex flex-col gap-3">
        <h3 id="wms-ciclico" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          <ClipboardList size={16} aria-hidden />
          Inventário cíclico
        </h3>
        {dueRows.length === 0 ? (
          <EmptyState
            title="Nenhuma contagem pendente"
            description="Todos os depósitos estão em dia — nada a contar agora."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {dueRows.map(([id, r]) => (
              <li
                key={id}
                className="flex items-center justify-between gap-3 p-3"
                style={{
                  borderRadius: 14,
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium" style={{ color: "var(--ds-theme-content-strong)" }}>{r.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {r.zonesCount ?? 0} zonas · contagem devida
                  </div>
                </div>
                {inProgress[id] ? (
                  <div className="min-w-[180px]"><SyncingState label="Contagem em andamento…" /></div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startCount(id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold"
                    style={{
                      padding: "8px 14px",
                      borderRadius: 9999,
                      background: "var(--ds-theme-intent-accent-fill)",
                      color: "var(--ds-theme-intent-accent-on-fill)",
                    }}
                  >
                    <Play size={12} aria-hidden />
                    Iniciar contagem
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}