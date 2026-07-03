/**
 * Modal informativo de surge/repasse — mostra a decomposição do cálculo de
 * repasse ao entregador. Todos os valores são mockados nesta tela.
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRow } from "@/store/hooks";
import { DollarSign } from "lucide-react";

const base = 8.0;
const surgeMultiplier = 0.2; // 20%

function money(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PayoutModal({
  deliveryId,
  onClose,
}: {
  deliveryId: string;
  onClose: () => void;
}) {
  const row = useRow("deliveries", deliveryId) as { orderRef?: string; customerName?: string };
  const surge = base * surgeMultiplier;
  const total = base + surge;

  const line = (label: string, value: string, bold = false) => (
    <div className="flex items-center justify-between text-sm" style={{ color: bold ? "var(--ds-theme-content-strong)" : "var(--ds-theme-content-default)" }}>
      <span>{label}</span>
      <span style={{ fontWeight: bold ? 600 : 400 }}>{value}</span>
    </div>
  );

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DollarSign size={18} aria-hidden style={{ color: "var(--ds-theme-intent-accent-fill)" }} />
            <DialogTitle>Surge / repasse</DialogTitle>
          </div>
          <DialogDescription>
            Cálculo do repasse ao entregador para a entrega {row.orderRef} · {row.customerName}.
          </DialogDescription>
        </DialogHeader>
        <div
          className="flex flex-col gap-2 p-4"
          style={{
            borderRadius: 14,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          {line("Base", money(base))}
          {line(`Surge (${(surgeMultiplier * 100).toFixed(0)}%)`, money(surge))}
          <div style={{ height: 1, background: "var(--ds-theme-border-subtle)" }} />
          {line("Total ao entregador", money(total), true)}
        </div>
        <p className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
          Repasse ocorre após confirmação de entrega. Em disputa, valor fica em escrow retido.
        </p>
        <DialogFooter>
          <Button type="button" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}