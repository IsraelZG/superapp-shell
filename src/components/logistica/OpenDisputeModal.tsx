/**
 * Modal "Abrir disputa — não chegou" — coleta motivo e muda `status` para
 * "disputa". A UI de escrow aparece automaticamente no card da entrega.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { store } from "@/store/hooks";

const reasons = [
  "Encomenda não chegou",
  "Endereço não localizado",
  "Recusada pelo destinatário",
  "Avaria em trânsito",
];

export function OpenDisputeModal({
  deliveryId,
  onClose,
}: {
  deliveryId: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState(reasons[0]);
  const [note, setNote] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    store.setCell("deliveries", deliveryId, "status", "disputa");
    // note ficaria em uma tabela auditoria em produção; aqui é mock.
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abrir disputa</DialogTitle>
          <DialogDescription>
            O valor da entrega ficará em escrow retido até a análise. Nenhum repasse será feito antes da resolução.
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="dp-reason">Motivo</Label>
            <select
              id="dp-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="px-3 py-2 text-sm"
              style={{
                borderRadius: 12,
                background: "var(--ds-theme-surface-default)",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              {reasons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="dp-note">Observações (opcional)</Label>
            <textarea
              id="dp-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="px-3 py-2 text-sm"
              style={{
                borderRadius: 12,
                background: "var(--ds-theme-surface-default)",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" variant="destructive">Abrir disputa</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}