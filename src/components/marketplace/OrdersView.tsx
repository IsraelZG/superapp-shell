import { useState } from "react";
import { PackageCheck, ChevronRight, Undo2, PlayCircle, ShieldAlert } from "lucide-react";
import { useTable, store } from "@/store/hooks";
import { SagaProgress, CompensationBadge } from "@/components/catalog/SagaFeedback";
import { EmptyState } from "@/components/catalog/States";
import { Banner } from "@/components/catalog/Notifications";
import { FormModal } from "@/components/catalog/Modals";
import { toast } from "sonner";
import { buildSagaSteps, formatPrice, relTime, sagaSteps, type SagaStepKey } from "./utils";

type OrderRow = {
  productId?: string;
  productTitle?: string;
  buyerNote?: string;
  totalPrice?: number;
  sagaStep?: SagaStepKey;
  createdAt?: string;
  disputeOpen?: boolean;
};

function nextStep(cur: SagaStepKey): SagaStepKey {
  const flow: SagaStepKey[] = ["pendente", "pago", "enviado"];
  const idx = flow.indexOf(cur);
  if (idx < 0 || idx === flow.length - 1) return cur;
  return flow[idx + 1];
}

export function OrdersView() {
  const orders = useTable("orders") as Record<string, OrderRow>;
  const [disputeFor, setDisputeFor] = useState<string | null>(null);

  const rows = Object.entries(orders).sort(
    (a, b) => new Date(b[1].createdAt ?? 0).getTime() - new Date(a[1].createdAt ?? 0).getTime(),
  );

  const advance = (id: string) => {
    const cur = (store.getCell("orders", id, "sagaStep") as SagaStepKey) ?? "pendente";
    if (cur === "compensado") {
      toast("Pedido já compensado — não avança.");
      return;
    }
    const next = nextStep(cur);
    store.setCell("orders", id, "sagaStep", next);
    toast.success(`Etapa avançada: ${next}`);
  };

  const compensate = (id: string) => {
    const row = store.getRow("orders", id) as OrderRow;
    store.setCell("orders", id, "sagaStep", "compensado");
    // Repõe estoque do primeiro item (mock)
    if (row.productId) {
      const cur = (store.getCell("products", row.productId, "stock") as number) ?? 0;
      store.setCell("products", row.productId, "stock", cur + 1);
    }
    toast.error("Pagamento estornado", {
      description: "Item retornou ao estoque. Nenhum valor foi retido.",
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2">
        <PackageCheck size={18} aria-hidden style={{ color: "var(--ds-theme-content-strong)" }} />
        <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Pedidos
        </h3>
      </header>

      {rows.length === 0 ? (
        <EmptyState title="Nenhum pedido ainda" description="Finalize uma compra para ver o status da saga aqui." />
      ) : (
        <ul className="flex flex-col gap-3" aria-label="Lista de pedidos">
          {rows.map(([id, o]) => {
            const step = (o.sagaStep as SagaStepKey) ?? "pendente";
            const steps = buildSagaSteps(step);
            const compensated = step === "compensado";
            return (
              <li
                key={id}
                className="flex flex-col gap-3 p-4"
                style={{
                  background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
                  border: "1px solid var(--ds-theme-border-subtle)",
                  borderRadius: "var(--ds-component-card-radius, 20px)",
                  boxShadow: "var(--ds-component-card-shadow)",
                }}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                      {o.productTitle}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
                      Criado {relTime(o.createdAt ?? "")} · #{id}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {compensated && <CompensationBadge label="Compensado" />}
                    {o.disputeOpen && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase"
                        style={{
                          padding: "2px 8px",
                          borderRadius: 9999,
                          background: "var(--ds-theme-intent-warning-subtle, var(--ds-theme-surface-subdued))",
                          color: "var(--ds-theme-content-strong)",
                          border: "1px solid var(--ds-theme-border-subtle)",
                        }}
                      >
                        <ShieldAlert size={10} aria-hidden /> Disputa aberta
                      </span>
                    )}
                    <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                      {formatPrice(o.totalPrice as number, "BRL")}
                    </span>
                  </div>
                </div>

                <SagaProgress steps={steps} />

                {compensated && (
                  <Banner intent="error" title="Pagamento estornado">
                    O valor foi devolvido ao seu método original e o item voltou ao estoque do vendedor.
                  </Banner>
                )}

                {o.buyerNote && (
                  <p className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    Nota: {o.buyerNote}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => advance(id)}
                    disabled={compensated || step === sagaSteps[2]}
                    className="inline-flex items-center gap-1 font-semibold"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 9999,
                      background: "var(--ds-theme-intent-accent-fill)",
                      color: "var(--ds-theme-intent-accent-on-fill)",
                      opacity: compensated || step === sagaSteps[2] ? 0.5 : 1,
                    }}
                  >
                    <PlayCircle size={12} aria-hidden /> Avançar etapa
                  </button>
                  <button
                    type="button"
                    onClick={() => compensate(id)}
                    disabled={compensated}
                    className="inline-flex items-center gap-1 font-semibold"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 9999,
                      background: "var(--ds-theme-surface-subdued)",
                      color: "var(--ds-theme-content-default)",
                      border: "1px solid var(--ds-theme-border-subtle)",
                      opacity: compensated ? 0.5 : 1,
                    }}
                  >
                    <Undo2 size={12} aria-hidden /> Simular falha (compensar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDisputeFor(id)}
                    className="inline-flex items-center gap-1 font-semibold"
                    style={{
                      padding: "6px 12px",
                      borderRadius: 9999,
                      background: "transparent",
                      color: "var(--ds-theme-content-default)",
                      border: "1px solid var(--ds-theme-border-subtle)",
                    }}
                  >
                    <ChevronRight size={12} aria-hidden /> Abrir disputa
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <FormModal
        open={!!disputeFor}
        onOpenChange={(v) => !v && setDisputeFor(null)}
        onSubmit={(d) => {
          if (!disputeFor) return;
          store.setCell("orders", disputeFor, "disputeOpen", true);
          store.setCell("orders", disputeFor, "buyerNote", `Disputa: ${d.name} — contato ${d.email}`);
          toast.success("Disputa registrada (mock)");
          setDisputeFor(null);
        }}
      />
    </div>
  );
}