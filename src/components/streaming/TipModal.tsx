import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

/**
 * Assinar / PPV / Gorjeta — sandbox. Reusa o padrão de aviso do PaymentModal
 * do Marketplace: banner explícito de "modo sandbox / nenhuma cobrança real".
 */
export function TipModal({
  open,
  onOpenChange,
  channelName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  channelName: string;
}) {
  const [amount, setAmount] = useState("10");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const reset = () => { setSent(false); setAmount("10"); setMsg(""); };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar gorjeta {channelName ? `— ${channelName}` : ""}</DialogTitle>
          <DialogDescription>
            Apoie o criador com um valor único. Também cobre assinatura e PPV neste mockup.
          </DialogDescription>
        </DialogHeader>

        <div
          role="note"
          className="flex items-start gap-2 rounded-2xl p-3 text-xs"
          style={{
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-muted)",
            border: "1px dashed var(--ds-theme-border-subtle)",
          }}
        >
          <AlertTriangle size={14} aria-hidden style={{ color: "var(--ds-theme-intent-accent-fill)" }} />
          <span>Modo sandbox: nenhuma cobrança real é feita. Valores e status são simulados.</span>
        </div>

        {!sent ? (
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="tip-amount">Valor (R$)</Label>
              <Input
                id="tip-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="tip-msg">Mensagem (opcional)</Label>
              <Input
                id="tip-msg"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="obrigado pelo conteúdo!"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">Enviar R$ {amount || "0"}</Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <div
              role="status"
              className="rounded-2xl p-3 text-sm"
              style={{
                background: "var(--ds-theme-intent-accent-subtle)",
                color: "var(--ds-theme-content-strong)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              Gorjeta simulada de R$ {amount} enviada {channelName ? `para ${channelName}` : ""}.
            </div>
            <DialogFooter>
              <Button onClick={() => onOpenChange(false)}>Fechar</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}