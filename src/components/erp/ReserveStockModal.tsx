import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ReserveStockModal({
  open,
  onOpenChange,
  target,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  target: { id: string; sku: string; name: string; warehouseName: string; qtyAvailable: number } | null;
  onConfirm: (id: string, qty: number, expiresAt: string) => void;
}) {
  const [qty, setQty] = useState("1");
  const [mins, setMins] = useState("15");
  const [err, setErr] = useState<string | null>(null);

  if (!target) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setQty("1");
          setMins("15");
          setErr(null);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reservar estoque</DialogTitle>
          <DialogDescription>
            <strong>{target.name}</strong> · {target.warehouseName} · {target.qtyAvailable} disponíveis.
            <br />
            A reserva expira automaticamente após o tempo definido (TTL Lock).
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const q = Number(qty);
            const m = Number(mins);
            if (!Number.isFinite(q) || q <= 0) return setErr("Quantidade inválida.");
            if (q > target.qtyAvailable) return setErr("Quantidade excede o disponível.");
            if (!Number.isFinite(m) || m <= 0) return setErr("TTL inválido.");
            setErr(null);
            const expiresAt = new Date(Date.now() + m * 60_000).toISOString();
            onConfirm(target.id, q, expiresAt);
            onOpenChange(false);
          }}
        >
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <Label htmlFor="rs-qty">Quantidade</Label>
              <Input
                id="rs-qty"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <Label htmlFor="rs-mins">TTL (minutos)</Label>
              <Input
                id="rs-mins"
                inputMode="numeric"
                value={mins}
                onChange={(e) => setMins(e.target.value)}
              />
            </div>
          </div>
          {err && (
            <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
              {err}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Reservar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}