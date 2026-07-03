/**
 * Modal de alocação — seleciona `warehouseId` e `courierName` e avança o
 * `status` da entrega para "alocado".
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
import { store, useTable } from "@/store/hooks";

export function AllocateModal({
  deliveryId,
  onClose,
  availableCouriers,
}: {
  deliveryId: string;
  onClose: () => void;
  availableCouriers: string[];
}) {
  const warehouses = useTable("warehouses") as Record<string, { name?: string }>;
  const whIds = Object.keys(warehouses);
  const [warehouseId, setWarehouseId] = useState(whIds[0] ?? "");
  const [courier, setCourier] = useState(availableCouriers[0] ?? "");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId) return setErr("Selecione um depósito.");
    if (!courier) return setErr("Selecione um entregador.");
    store.setPartialRow("deliveries", deliveryId, {
      warehouseId,
      courierName: courier,
      status: "alocado",
    });
    onClose();
  };

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alocar entrega</DialogTitle>
          <DialogDescription>Escolha o depósito de origem e o entregador responsável.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="al-wh">Depósito</Label>
            <select
              id="al-wh"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              className="px-3 py-2 text-sm"
              style={{
                borderRadius: 12,
                background: "var(--ds-theme-surface-default)",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              {whIds.map((id) => (
                <option key={id} value={id}>{warehouses[id]?.name ?? id}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="al-co">Entregador</Label>
            <select
              id="al-co"
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="px-3 py-2 text-sm"
              style={{
                borderRadius: 12,
                background: "var(--ds-theme-surface-default)",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              {availableCouriers.length === 0 ? (
                <option value="">Nenhum disponível</option>
              ) : (
                availableCouriers.map((n) => <option key={n} value={n}>{n}</option>)
              )}
            </select>
          </div>
          {err && (
            <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
              {err}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">Alocar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}