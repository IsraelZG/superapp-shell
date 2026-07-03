import { useMemo, useState } from "react";
import { Trash2, Image as ImageIcon, ShoppingBag } from "lucide-react";
import { useTable, store } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { PaymentModal } from "./PaymentModal";
import { toast } from "sonner";
import { formatPrice } from "./utils";

type CartRow = { productId: string; quantity: number };

export function CartView({ onOpenProduct }: { onOpenProduct: (id: string) => void }) {
  const cart = useTable("cart") as Record<string, CartRow>;
  const products = useTable("products") as Record<string, { title?: string; price?: number; currency?: string; imageUrl?: string; stock?: number }>;
  const [payOpen, setPayOpen] = useState(false);

  const rows = Object.entries(cart);

  const items = useMemo(
    () =>
      rows.map(([id, row]) => {
        const p = products[row.productId] ?? {};
        return {
          id,
          productId: row.productId,
          quantity: row.quantity ?? 1,
          title: p.title ?? "Produto",
          price: (p.price as number) ?? 0,
          currency: (p.currency as string) ?? "BRL",
          imageUrl: p.imageUrl as string,
          stock: (p.stock as number) ?? 0,
        };
      }),
    [rows, products],
  );

  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const currency = items[0]?.currency ?? "BRL";

  const remove = (id: string) => {
    store.delRow("cart", id);
  };

  const clearCart = () => {
    Object.keys(store.getTable("cart")).forEach((id) => store.delRow("cart", id));
  };

  const onPaymentConfirmed = (finalAmount: number, coupon: string | null) => {
    // Cria uma order por item (mockup: agrupamos em uma order sintética se houver 1+ item)
    const first = items[0];
    if (!first) return;
    const now = new Date().toISOString();
    const orderId = `o_${Date.now()}`;
    const title = items.length === 1 ? first.title : `${first.title} + ${items.length - 1}`;
    store.setRow("orders", orderId, {
      productId: first.productId,
      productTitle: title,
      buyerNote: coupon ? `Cupom ${coupon} aplicado.` : "",
      totalPrice: Number(finalAmount.toFixed(2)),
      sagaStep: "pendente",
      createdAt: now,
      disputeOpen: false,
    });
    // Decrementa estoque de cada item (respeita o invariante — nunca abaixo de 0)
    items.forEach((it) => {
      const cur = (store.getCell("products", it.productId, "stock") as number) ?? 0;
      store.setCell("products", it.productId, "stock", Math.max(0, cur - it.quantity));
    });
    clearCart();
    toast.success("Pagamento confirmado — pedido criado", { description: "Acompanhe o status da saga em Pedidos." });
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2">
        <ShoppingBag size={18} aria-hidden style={{ color: "var(--ds-theme-content-strong)" }} />
        <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Carrinho
        </h3>
      </header>

      {items.length === 0 ? (
        <EmptyState
          title="Seu carrinho está vazio"
          description="Adicione produtos pela vitrine para começar."
        />
      ) : (
        <>
          <ul className="flex flex-col gap-2" aria-label="Itens do carrinho">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-center gap-3 p-3"
                style={{
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                  borderRadius: 16,
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpenProduct(it.productId)}
                  className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden"
                  style={{ borderRadius: 12, background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-subtle)" }}
                  aria-label={`Abrir ${it.title}`}
                >
                  {it.imageUrl ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img src={it.imageUrl} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <ImageIcon size={20} aria-hidden />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {it.title}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
                    {it.quantity}× · {formatPrice(it.price, it.currency)}
                  </p>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                  {formatPrice(it.price * it.quantity, it.currency)}
                </span>
                <button
                  type="button"
                  onClick={() => remove(it.id)}
                  aria-label={`Remover ${it.title}`}
                  className="grid h-8 w-8 place-items-center"
                  style={{ borderRadius: 9999, color: "var(--ds-theme-content-muted)" }}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>

          <div
            className="flex items-center justify-between p-3"
            style={{
              borderRadius: 16,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              Subtotal
            </span>
            <span className="text-lg font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
              {formatPrice(subtotal, currency)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold"
              style={{
                padding: "8px 14px",
                borderRadius: 9999,
                background: "var(--ds-theme-surface-default)",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              Esvaziar
            </button>
            <button
              type="button"
              onClick={() => setPayOpen(true)}
              className="text-xs font-semibold"
              style={{
                padding: "10px 16px",
                borderRadius: 9999,
                background: "var(--ds-theme-intent-accent-fill)",
                color: "var(--ds-theme-intent-accent-on-fill)",
              }}
            >
              Finalizar compra
            </button>
          </div>
        </>
      )}

      <PaymentModal
        open={payOpen}
        onOpenChange={setPayOpen}
        amount={subtotal}
        currency={currency}
        onConfirmed={onPaymentConfirmed}
      />
    </div>
  );
}