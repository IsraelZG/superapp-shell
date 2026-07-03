import { useMemo, useState } from "react";
import { ShoppingBag, ShoppingCart, PackageCheck, Store, Banknote } from "lucide-react";
import { useTable } from "@/store/hooks";
import { CountBadge } from "@/components/catalog/Notifications";
import { ProductGrid } from "./ProductGrid";
import { ProductDetail } from "./ProductDetail";
import { CartView } from "./CartView";
import { OrdersView } from "./OrdersView";
import { SellerPanel } from "./SellerPanel";
import { FinancePlaceholder } from "./FinancePlaceholder";
import { PaymentModal } from "./PaymentModal";
import { store } from "@/store/hooks";
import { toast } from "sonner";

type Tab = "vitrine" | "carrinho" | "pedidos" | "vendedor" | "financeiro";
type View =
  | { kind: "tab"; tab: Tab }
  | { kind: "product"; id: string };

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "vitrine", label: "Vitrine", icon: <ShoppingBag size={14} aria-hidden /> },
  { key: "carrinho", label: "Carrinho", icon: <ShoppingCart size={14} aria-hidden /> },
  { key: "pedidos", label: "Pedidos", icon: <PackageCheck size={14} aria-hidden /> },
  { key: "vendedor", label: "Vendedor", icon: <Store size={14} aria-hidden /> },
  { key: "financeiro", label: "Financeiro", icon: <Banknote size={14} aria-hidden /> },
];

export function MarketplaceModule() {
  const [view, setView] = useState<View>({ kind: "tab", tab: "vitrine" });
  const [instantPay, setInstantPay] = useState<{ productId: string; qty: number } | null>(null);

  const cart = useTable("cart") as Record<string, { productId: string; quantity: number }>;
  const orders = useTable("orders") as Record<string, { sagaStep?: string }>;
  const cartCount = useMemo(
    () => Object.values(cart).reduce((sum, r) => sum + (r.quantity ?? 0), 0),
    [cart],
  );
  const pendingOrders = useMemo(
    () => Object.values(orders).filter((o) => o.sagaStep === "pendente" || o.sagaStep === "pago").length,
    [orders],
  );

  const goTab = (tab: Tab) => setView({ kind: "tab", tab });

  const startInstantPay = (productId: string, qty: number) => {
    setInstantPay({ productId, qty });
  };

  const products = useTable("products") as Record<string, { title?: string; price?: number; currency?: string }>;
  const instantProduct = instantPay ? products[instantPay.productId] : null;
  const instantAmount = instantPay && instantProduct ? (instantProduct.price ?? 0) * instantPay.qty : 0;

  const onInstantConfirmed = (finalAmount: number, coupon: string | null) => {
    if (!instantPay || !instantProduct) return;
    const orderId = `o_${Date.now()}`;
    store.setRow("orders", orderId, {
      productId: instantPay.productId,
      productTitle: instantProduct.title ?? "Produto",
      buyerNote: coupon ? `Cupom ${coupon} aplicado.` : "",
      totalPrice: Number(finalAmount.toFixed(2)),
      sagaStep: "pendente",
      createdAt: new Date().toISOString(),
      disputeOpen: false,
    });
    const cur = (store.getCell("products", instantPay.productId, "stock") as number) ?? 0;
    store.setCell("products", instantPay.productId, "stock", Math.max(0, cur - instantPay.qty));
    setInstantPay(null);
    toast.success("Pedido criado — acompanhe em Pedidos.");
    goTab("pedidos");
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
              Módulo
            </p>
            <h2 className="text-2xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              Marketplace
            </h2>
          </div>
        </header>

        <nav
          aria-label="Seções do marketplace"
          className="flex flex-wrap items-center gap-1 p-1"
          style={{
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px solid var(--ds-theme-border-subtle)",
            width: "fit-content",
          }}
        >
          {tabs.map((t) => {
            const active = view.kind === "tab" && view.tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => goTab(t.key)}
                aria-current={active ? "page" : undefined}
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{
                  padding: "6px 12px",
                  borderRadius: 9999,
                  background: active ? "var(--ds-theme-intent-accent-fill)" : "transparent",
                  color: active ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-default)",
                }}
              >
                {t.icon}
                {t.label}
                {t.key === "carrinho" && cartCount > 0 && <CountBadge count={cartCount} label="itens no carrinho" />}
                {t.key === "pedidos" && pendingOrders > 0 && <CountBadge count={pendingOrders} label="pedidos pendentes" />}
              </button>
            );
          })}
        </nav>

        {view.kind === "product" ? (
          <ProductDetail
            productId={view.id}
            onBack={() => goTab("vitrine")}
            onCheckoutOne={(pid, qty) => startInstantPay(pid, qty)}
          />
        ) : view.tab === "vitrine" ? (
          <ProductGrid onOpen={(id) => setView({ kind: "product", id })} />
        ) : view.tab === "carrinho" ? (
          <CartView onOpenProduct={(id) => setView({ kind: "product", id })} />
        ) : view.tab === "pedidos" ? (
          <OrdersView />
        ) : view.tab === "vendedor" ? (
          <SellerPanel />
        ) : (
          <FinancePlaceholder />
        )}
      </div>

      <PaymentModal
        open={!!instantPay}
        onOpenChange={(v) => !v && setInstantPay(null)}
        amount={instantAmount}
        currency={(instantProduct?.currency as string) ?? "BRL"}
        onConfirmed={onInstantConfirmed}
      />
    </div>
  );
}