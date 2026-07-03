/**
 * App do entregador — visão mobile-first.
 *
 * Renderizada dentro da coluna central, mas limitada a `max-width: 420px`
 * para simular a viewport de um app de celular mesmo em desktop. Fila de
 * entregas filtrada por `courierName` (dropdown "logado como"), botão
 * "Iniciar navegação" (mock, aponta conceitualmente ao módulo Mapa B5),
 * "Simular replanejamento de rota" (`SyncingState` por 1.5s), e
 * "Confirmar entrega" com prova mock (foto placeholder + assinatura).
 */
import { useMemo, useState } from "react";
import {
  Smartphone,
  Navigation as NavIcon,
  Camera,
  PenLine,
  RefreshCw,
  CheckCircle2,
  Package,
  MapPin,
} from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { EmptyState, SyncingState } from "@/components/catalog/States";
import { ConfirmModal } from "@/components/catalog/Modals";

type DeliveryRow = {
  orderRef?: string;
  customerName?: string;
  address?: string;
  status?: string;
  courierName?: string;
  warehouseId?: string;
};
type CourierRow = { name?: string; status?: string };

export function CourierAppView() {
  const couriers = useTable("couriers") as Record<string, CourierRow>;
  const deliveries = useTable("deliveries") as Record<string, DeliveryRow>;
  const courierNames = useMemo(
    () => Object.values(couriers).map((c) => c.name ?? "").filter(Boolean),
    [couriers],
  );
  const [logged, setLogged] = useState(
    () => courierNames.find((n) => n === "João Silva") ?? courierNames[0] ?? "",
  );
  const [recalc, setRecalc] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [proofFor, setProofFor] = useState<string | null>(null);

  const queue = useMemo(
    () =>
      Object.entries(deliveries).filter(
        ([, r]) =>
          r.courierName === logged &&
          (r.status === "alocado" || r.status === "em rota"),
      ),
    [deliveries, logged],
  );

  const startNav = (id: string) => {
    // Se a entrega está "alocado", start navegação avança para "em rota".
    if (deliveries[id]?.status === "alocado") {
      store.setCell("deliveries", id, "status", "em rota");
    }
  };

  const triggerRecalc = () => {
    setRecalc(true);
    window.setTimeout(() => setRecalc(false), 1500);
  };

  const confirmDelivery = () => {
    if (!confirmId) return;
    store.setCell("deliveries", confirmId, "status", "entregue");
    setProofFor(null);
    setConfirmId(null);
  };

  return (
    <div className="flex justify-center">
      <div
        className="flex w-full flex-col gap-4 p-4"
        style={{
          maxWidth: 420,
          borderRadius: 24,
          background: "var(--ds-theme-surface-subdued)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        {/* Header do "app" */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            <Smartphone size={14} aria-hidden /> App do entregador
          </div>
          <span className="text-[10px]" style={{ color: "var(--ds-theme-content-subtle)" }}>mockup mobile-first</span>
        </div>

        {/* "Logado como" */}
        <label className="flex flex-col gap-1 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
          Logado como
          <select
            value={logged}
            onChange={(e) => setLogged(e.target.value)}
            className="px-3 py-2 text-sm"
            style={{
              borderRadius: 12,
              background: "var(--ds-theme-surface-default)",
              color: "var(--ds-theme-content-default)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            {courierNames.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        {/* Recalculando (SyncingState) */}
        {recalc && <SyncingState label="Recalculando rota…" />}

        {/* Fila */}
        {queue.length === 0 ? (
          <EmptyState
            title="Sem entregas na sua fila"
            description="Você não tem entregas atribuídas no momento."
            icon={<Package size={18} />}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {queue.map(([id, r]) => (
              <li
                key={id}
                className="flex flex-col gap-3 p-3"
                style={{
                  borderRadius: 16,
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <div>
                  <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {r.orderRef} · {r.customerName}
                  </div>
                  <div className="flex items-start gap-1 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    <MapPin size={11} aria-hidden className="mt-0.5" />
                    <span>{r.address}</span>
                  </div>
                  <div className="mt-1 inline-flex text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
                    Status: {r.status}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => startNav(id)}
                    title="Abre o Mapa (mock — sem navegação real)"
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      background: "var(--ds-theme-surface-subdued)",
                      color: "var(--ds-theme-content-strong)",
                      border: "1px solid var(--ds-theme-border-subtle)",
                    }}
                  >
                    <NavIcon size={12} aria-hidden />
                    Iniciar navegação
                  </button>
                  <button
                    type="button"
                    onClick={() => setProofFor(id)}
                    className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold"
                    style={{
                      padding: "8px 10px",
                      borderRadius: 12,
                      background: "var(--ds-theme-intent-accent-fill)",
                      color: "var(--ds-theme-intent-accent-on-fill)",
                    }}
                  >
                    <CheckCircle2 size={12} aria-hidden />
                    Confirmar entrega
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Ações do "app" no rodapé */}
        <button
          type="button"
          onClick={triggerRecalc}
          className="inline-flex items-center justify-center gap-1.5 self-start text-[11px] font-semibold"
          style={{
            padding: "6px 12px",
            borderRadius: 9999,
            background: "var(--ds-theme-surface-default)",
            color: "var(--ds-theme-content-strong)",
            border: "1px dashed var(--ds-theme-border-subtle)",
          }}
        >
          <RefreshCw size={11} aria-hidden />
          Simular replanejamento de rota
        </button>
      </div>

      {/* Sheet inline de "prova de entrega" — abre antes do ConfirmModal */}
      {proofFor && (
        <ProofDrawer
          onCancel={() => setProofFor(null)}
          onSubmit={() => {
            setConfirmId(proofFor);
          }}
        />
      )}
      {confirmId && (
        <ConfirmModal
          open
          onOpenChange={(v) => !v && setConfirmId(null)}
          title="Confirmar entrega?"
          description="A entrega será marcada como concluída. Repasse ao entregador será liberado. Continuar?"
          confirmLabel="Confirmar entrega"
          onConfirm={confirmDelivery}
        />
      )}
    </div>
  );
}

function ProofDrawer({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Prova de entrega"
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onCancel}
      onKeyDown={(e) => { if (e.key === "Escape") onCancel(); }}
    >
      <div
        className="w-full max-w-sm flex flex-col gap-3 p-5"
        style={{
          borderRadius: 20,
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>Prova de entrega</h3>
        <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Anexe uma foto do local e capture a assinatura. Este é um mockup — sem captura real.
        </p>
        <div
          className="grid place-items-center gap-2 py-6"
          style={{
            borderRadius: 14,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px dashed var(--ds-theme-border-subtle)",
          }}
        >
          <Camera size={22} aria-hidden style={{ color: "var(--ds-theme-content-subtle)" }} />
          <span className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>Foto do pacote no local</span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-6"
          style={{
            borderRadius: 14,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px dashed var(--ds-theme-border-subtle)",
          }}
        >
          <PenLine size={16} aria-hidden style={{ color: "var(--ds-theme-content-subtle)" }} />
          <span className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>Assinatura do destinatário</span>
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold"
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-strong)",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onSubmit}
            className="text-xs font-semibold"
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            Anexar prova
          </button>
        </div>
      </div>
    </div>
  );
}