import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Banner } from "@/components/catalog/Notifications";
import { ShieldCheck, Tag, X, Loader2 } from "lucide-react";
import { formatPrice } from "./utils";

export function PaymentModal({
  open,
  onOpenChange,
  amount,
  currency = "BRL",
  onConfirmed,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  amount: number;
  currency?: string;
  onConfirmed: (finalAmount: number, couponApplied: string | null) => void;
}) {
  const [card, setCard] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setCard("");
      setName("");
      setExp("");
      setCvv("");
      setCoupon("");
      setCouponApplied(null);
      setCouponError(null);
      setErr(null);
      setSubmitting(false);
    }
  }, [open]);

  const discount = couponApplied === "DESCONTO10" ? 0.1 : 0;
  const finalAmount = amount * (1 - discount);

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();
    if (!code) return;
    if (code === "DESCONTO10") {
      setCouponApplied(code);
      setCouponError(null);
    } else {
      setCouponApplied(null);
      setCouponError("Cupom inválido ou expirado.");
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (card.replace(/\s/g, "").length < 12) return setErr("Número do cartão inválido.");
    if (!name.trim()) return setErr("Informe o nome no cartão.");
    if (!/^\d{2}\/\d{2}$/.test(exp)) return setErr("Validade em MM/AA.");
    if (cvv.length < 3) return setErr("CVV inválido.");
    setErr(null);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onConfirmed(finalAmount, couponApplied);
      onOpenChange(false);
    }, 700);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: "var(--ds-theme-intent-accent-fill)" }} aria-hidden />
            <DialogTitle>Pagamento</DialogTitle>
          </div>
          <DialogDescription>
            Ambiente de teste (sandbox BaaS). Nenhum dado real é processado ou armazenado.
          </DialogDescription>
        </DialogHeader>

        <Banner intent="info" title="Sandbox">
          Use qualquer número de cartão. O cupom <code>DESCONTO10</code> aplica 10% de desconto para teste.
        </Banner>

        <form className="flex flex-col gap-3" onSubmit={submit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pm-card">Número do cartão</Label>
            <Input
              id="pm-card"
              inputMode="numeric"
              value={card}
              onChange={(e) => setCard(e.target.value)}
              placeholder="4242 4242 4242 4242"
              autoComplete="off"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pm-name">Nome no cartão</Label>
            <Input id="pm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" autoComplete="off" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="pm-exp">Validade</Label>
              <Input id="pm-exp" value={exp} onChange={(e) => setExp(e.target.value)} placeholder="MM/AA" autoComplete="off" />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="pm-cvv">CVV</Label>
              <Input id="pm-cvv" inputMode="numeric" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" autoComplete="off" />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="pm-coupon" className="flex items-center gap-1">
              <Tag size={12} aria-hidden /> Cupom
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="pm-coupon"
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value);
                  setCouponError(null);
                }}
                placeholder="DESCONTO10"
                autoComplete="off"
              />
              {couponApplied ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setCouponApplied(null);
                    setCoupon("");
                  }}
                  aria-label="Remover cupom"
                >
                  <X size={14} />
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={applyCoupon}>
                  Aplicar
                </Button>
              )}
            </div>
            {couponApplied && (
              <p className="text-[11px]" style={{ color: "var(--ds-theme-intent-accent-fill)" }}>
                Cupom {couponApplied} aplicado (−10%).
              </p>
            )}
            {couponError && (
              <p role="alert" className="text-[11px]" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
                {couponError}
              </p>
            )}
          </div>

          <div
            className="flex items-center justify-between p-3"
            style={{
              borderRadius: 14,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <span className="text-xs font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>Total a pagar</span>
            <span className="text-lg font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
              {formatPrice(finalAmount, currency)}
            </span>
          </div>

          {err && (
            <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
              {err}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={14} className="mr-1 animate-spin" /> Processando…
                </>
              ) : (
                "Pagar (sandbox)"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}