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

export function NewOrderModal({
  open,
  onOpenChange,
  kind,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  kind: "sales" | "purchase";
  onSubmit: (data: { party: string; items: string; total: number }) => void;
}) {
  const isSales = kind === "sales";
  const [party, setParty] = useState("");
  const [items, setItems] = useState("");
  const [totalStr, setTotalStr] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const partyLabel = isSales ? "Cliente" : "Fornecedor";
  const title = isSales ? "Novo pedido de venda" : "Novo pedido de compra";

  const reset = () => {
    setParty("");
    setItems("");
    setTotalStr("");
    setErr(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha o {partyLabel.toLowerCase()}, itens (texto livre) e total. O pedido é criado como <strong>{isSales ? "rascunho" : "solicitado"}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!party.trim()) return setErr(`Informe o ${partyLabel.toLowerCase()}.`);
            if (!items.trim()) return setErr("Descreva os itens.");
            const total = Number(totalStr.replace(",", "."));
            if (!Number.isFinite(total) || total <= 0) return setErr("Total inválido.");
            setErr(null);
            onSubmit({ party: party.trim(), items: items.trim(), total });
            reset();
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="no-party">{partyLabel}</Label>
            <Input
              id="no-party"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              autoFocus
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="no-items">Itens</Label>
            <Input
              id="no-items"
              value={items}
              onChange={(e) => setItems(e.target.value)}
              placeholder="Ex.: 2× Kit branding · 1× Consultoria"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="no-total">Total (R$)</Label>
            <Input
              id="no-total"
              inputMode="decimal"
              value={totalStr}
              onChange={(e) => setTotalStr(e.target.value)}
              placeholder="0,00"
            />
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
            <Button type="submit">Criar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}