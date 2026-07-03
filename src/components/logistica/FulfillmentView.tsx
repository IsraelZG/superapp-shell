/**
 * Fulfillment — alocação multi-depósito.
 *
 * Lista de `deliveries` com progressão de saga (aguardando → alocado → em rota
 * → entregue). `disputa` é estado terminal alternativo que sinaliza escrow
 * retido (ver bloco "reversa/disputa").
 *
 * Estados obrigatórios cobertos:
 *   - vazio (`EmptyState` do catálogo quando não há aguardando)
 *   - "sem entregadores": ao ativar o botão "Simular pico de demanda", filtra
 *     `surge=true` e a ação "Alocar" mostra estado bloqueado + EmptyState.
 *   - parcial/pendente: badges no ciclo de saga
 *   - "escrow retido": card informativo em cada delivery `disputa`
 */
import { useMemo, useState } from "react";
import { PackageSearch, Zap, AlertOctagon, Undo2, ShieldAlert, DollarSign } from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { SagaProgress, CompensationBadge, type SagaStep } from "@/components/catalog/SagaFeedback";
import { AllocateModal } from "./AllocateModal";
import { OpenDisputeModal } from "./OpenDisputeModal";
import { PayoutModal } from "./PayoutModal";

type DeliveryRow = {
  orderRef?: string;
  customerName?: string;
  address?: string;
  status?: "aguardando" | "alocado" | "em rota" | "entregue" | "disputa";
  courierName?: string;
  warehouseId?: string;
  createdAt?: string;
};
type CourierRow = { name?: string; status?: string; currentDeliveryId?: string };

const cycle: SagaStep["id"][] = ["aguardando", "alocado", "em rota", "entregue"];

function stepsFor(status: DeliveryRow["status"]): SagaStep[] {
  const isDispute = status === "disputa";
  return cycle.map((s, i) => {
    const currentIdx = isDispute ? cycle.indexOf("em rota") : cycle.indexOf(status ?? "aguardando");
    let st: SagaStep["status"] = "pending";
    if (isDispute && s === "entregue") st = "compensated";
    else if (i < currentIdx) st = "done";
    else if (i === currentIdx) st = status === "entregue" ? "done" : "current";
    return { id: s, label: s.charAt(0).toUpperCase() + s.slice(1), status: st };
  });
}

function advance(id: string, current: DeliveryRow["status"]) {
  if (!current || current === "entregue" || current === "disputa") return;
  const idx = cycle.indexOf(current);
  const next = cycle[Math.min(idx + 1, cycle.length - 1)] as DeliveryRow["status"];
  store.setCell("deliveries", id, "status", next!);
}

export function FulfillmentView() {
  const table = useTable("deliveries") as Record<string, DeliveryRow>;
  const couriers = useTable("couriers") as Record<string, CourierRow>;
  const [surge, setSurge] = useState(false);
  const [allocateId, setAllocateId] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [payoutId, setPayoutId] = useState<string | null>(null);

  const availableCouriers = useMemo(
    () => (surge ? [] : Object.values(couriers).filter((c) => c.status === "disponível").map((c) => c.name ?? "—")),
    [couriers, surge],
  );

  const rows = useMemo(
    () =>
      Object.entries(table).sort(
        ([, a], [, b]) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""),
      ),
    [table],
  );
  const waiting = rows.filter(([, r]) => r.status === "aguardando");
  const inFlight = rows.filter(([, r]) => r.status === "alocado" || r.status === "em rota");
  const settled = rows.filter(([, r]) => r.status === "entregue" || r.status === "disputa");

  return (
    <div className="flex flex-col gap-6">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 p-3"
        style={{
          borderRadius: 14,
          background: "var(--ds-theme-surface-subdued)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          <strong style={{ color: "var(--ds-theme-content-strong)" }}>{availableCouriers.length}</strong> entregador(es) disponível(is)
        </div>
        <button
          type="button"
          onClick={() => setSurge((v) => !v)}
          aria-pressed={surge}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{
            padding: "6px 12px",
            borderRadius: 9999,
            background: surge ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-surface-default)",
            color: surge ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-strong)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <Zap size={12} aria-hidden />
          {surge ? "Pico ativo — desligar" : "Simular pico de demanda"}
        </button>
      </div>

      {/* Aguardando alocação */}
      <section aria-labelledby="ff-wait" className="flex flex-col gap-3">
        <h3 id="ff-wait" className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          <PackageSearch size={16} aria-hidden />
          Aguardando alocação ({waiting.length})
        </h3>
        {waiting.length === 0 ? (
          <EmptyState title="Sem entregas na fila" description="Tudo alocado por enquanto." />
        ) : availableCouriers.length === 0 ? (
          <EmptyState
            title="Nenhum entregador disponível no momento"
            description="Tente novamente em instantes — os entregadores estão todos ocupados ou offline."
            icon={<AlertOctagon size={18} />}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {waiting.map(([id, r]) => (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-3 p-3"
                style={{
                  borderRadius: 14,
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {r.orderRef} · {r.customerName}
                  </div>
                  <div className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>{r.address}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setAllocateId(id)}
                  className="text-xs font-semibold"
                  style={{
                    padding: "8px 14px",
                    borderRadius: 9999,
                    background: "var(--ds-theme-intent-accent-fill)",
                    color: "var(--ds-theme-intent-accent-on-fill)",
                  }}
                >
                  Alocar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Em andamento */}
      <section aria-labelledby="ff-flight" className="flex flex-col gap-3">
        <h3 id="ff-flight" className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Em andamento ({inFlight.length})
        </h3>
        {inFlight.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>Nenhuma entrega em curso.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {inFlight.map(([id, r]) => (
              <li
                key={id}
                className="flex flex-col gap-3 p-4"
                style={{
                  borderRadius: "var(--ds-component-card-radius, 20px)",
                  background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
                  border: "1px solid var(--ds-theme-border-subtle)",
                  boxShadow: "var(--ds-component-card-shadow)",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                      {r.orderRef} · {r.customerName}
                    </div>
                    <div className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>{r.address}</div>
                    <div className="mt-1 text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
                      Entregador: <strong style={{ color: "var(--ds-theme-content-default)" }}>{r.courierName || "—"}</strong>
                      {" · "}Depósito: <strong style={{ color: "var(--ds-theme-content-default)" }}>{r.warehouseId || "—"}</strong>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => advance(id, r.status)}
                      className="text-xs font-semibold"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 9999,
                        background: "var(--ds-theme-intent-accent-fill)",
                        color: "var(--ds-theme-intent-accent-on-fill)",
                      }}
                    >
                      Avançar
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayoutId(id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 9999,
                        background: "var(--ds-theme-surface-default)",
                        color: "var(--ds-theme-content-strong)",
                        border: "1px solid var(--ds-theme-border-subtle)",
                      }}
                    >
                      <DollarSign size={12} aria-hidden /> Surge/repasse
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisputeId(id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold"
                      style={{
                        padding: "6px 12px",
                        borderRadius: 9999,
                        background: "var(--ds-theme-surface-default)",
                        color: "var(--ds-theme-content-strong)",
                        border: "1px dashed var(--ds-theme-border-subtle)",
                      }}
                    >
                      <Undo2 size={12} aria-hidden /> Simular falha
                    </button>
                  </div>
                </div>
                <SagaProgress steps={stepsFor(r.status)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Concluídas / disputas */}
      <section aria-labelledby="ff-settled" className="flex flex-col gap-3">
        <h3 id="ff-settled" className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Concluídas & disputas ({settled.length})
        </h3>
        {settled.length === 0 ? (
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>Nada finalizado ainda.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {settled.map(([id, r]) => {
              const isDispute = r.status === "disputa";
              return (
                <li
                  key={id}
                  className="flex flex-col gap-3 p-4"
                  style={{
                    borderRadius: "var(--ds-component-card-radius, 20px)",
                    background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
                    border: "1px solid var(--ds-theme-border-subtle)",
                    boxShadow: "var(--ds-component-card-shadow)",
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                        {r.orderRef} · {r.customerName}
                      </div>
                      <div className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>{r.address}</div>
                    </div>
                    {isDispute ? (
                      <CompensationBadge label="Disputa aberta" />
                    ) : (
                      <span
                        className="text-[11px] font-semibold"
                        style={{
                          padding: "3px 10px",
                          borderRadius: 9999,
                          background: "var(--ds-theme-intent-accent-subtle)",
                          color: "var(--ds-theme-intent-accent-on-subtle)",
                        }}
                      >
                        Entregue
                      </span>
                    )}
                  </div>
                  <SagaProgress steps={stepsFor(r.status)} />
                  {isDispute && (
                    <div
                      role="note"
                      className="flex items-start gap-2 p-3 text-xs"
                      style={{
                        borderRadius: 12,
                        background: "var(--ds-theme-intent-danger-subtle, var(--ds-theme-surface-subdued))",
                        color: "var(--ds-theme-content-strong)",
                        border: "1px solid var(--ds-theme-border-subtle)",
                      }}
                    >
                      <ShieldAlert size={14} aria-hidden />
                      <div>
                        <div className="font-semibold">Valor em escrow retido até resolução</div>
                        <div style={{ color: "var(--ds-theme-content-muted)" }}>
                          O repasse ao entregador e o crédito ao vendedor ficam pausados enquanto a disputa é analisada. Mockup — sem movimentação real de valores.
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {allocateId && (
        <AllocateModal
          deliveryId={allocateId}
          onClose={() => setAllocateId(null)}
          availableCouriers={availableCouriers}
        />
      )}
      {disputeId && (
        <OpenDisputeModal deliveryId={disputeId} onClose={() => setDisputeId(null)} />
      )}
      {payoutId && (
        <PayoutModal deliveryId={payoutId} onClose={() => setPayoutId(null)} />
      )}
    </div>
  );
}