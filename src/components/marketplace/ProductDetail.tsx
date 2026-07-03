import { useState } from "react";
import { ArrowLeft, Image as ImageIcon, Minus, Plus, Star, ShoppingCart, Zap, Gavel, AlertTriangle } from "lucide-react";
import { useRow, store } from "@/store/hooks";
import { Banner } from "@/components/catalog/Notifications";
import { ConfirmModal, FormModal } from "@/components/catalog/Modals";
import { toast } from "sonner";
import { formatPrice } from "./utils";

export function ProductDetail({
  productId,
  onBack,
  onCheckoutOne,
}: {
  productId: string;
  onBack: () => void;
  onCheckoutOne: (productId: string, qty: number) => void;
}) {
  const p = useRow("products", productId) as {
    sellerName?: string;
    title?: string;
    description?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    stock?: number;
    category?: string;
    rating?: number;
    acceptsOffers?: boolean;
  };
  const [qty, setQty] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [lostBid, setLostBid] = useState(false);
  const [oversellError, setOversellError] = useState(false);

  if (!p.title) {
    return (
      <div className="p-6">
        <p className="text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>Produto não encontrado.</p>
        <button type="button" onClick={onBack} className="mt-2 text-xs underline">Voltar</button>
      </div>
    );
  }

  const stock = (p.stock as number) ?? 0;
  const out = stock === 0;
  const last = stock === 1;

  const attemptBuy = () => {
    // Revalida o estoque no momento do submit (mesmo ciclo do "Simular concorrência")
    const fresh = (store.getCell("products", productId, "stock") as number) ?? 0;
    if (fresh <= 0) {
      setOversellError(true);
      toast.error("Este item acabou de esgotar");
      return;
    }
    if (qty > fresh) {
      setOversellError(true);
      toast.error(`Só restam ${fresh} unidades`);
      return;
    }
    setOversellError(false);
    onCheckoutOne(productId, qty);
  };

  const simulateRace = () => {
    // Simula outro comprador esgotando o item no mesmo instante
    store.setCell("products", productId, "stock", 0);
    toast("Outro comprador levou o item", { description: "Cenário de concorrência ativado." });
  };

  const addToCart = () => {
    const existing = Object.entries(store.getTable("cart") as Record<string, { productId: string; quantity: number }>).find(
      ([, row]) => row.productId === productId,
    );
    if (existing) {
      store.setCell("cart", existing[0], "quantity", (existing[1].quantity ?? 0) + qty);
    } else {
      store.setRow("cart", `ci_${Date.now()}`, { productId, quantity: qty });
    }
    toast.success("Adicionado ao carrinho");
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1 text-xs font-semibold"
        style={{
          padding: "6px 12px",
          borderRadius: 9999,
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-default)",
        }}
      >
        <ArrowLeft size={12} aria-hidden /> Voltar à vitrine
      </button>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div
          className="grid aspect-square w-full place-items-center overflow-hidden"
          style={{
            borderRadius: 20,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-subtle)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          {p.imageUrl ? (
            // eslint-disable-next-line jsx-a11y/alt-text
            <img src={p.imageUrl as string} className="h-full w-full object-cover" alt="" />
          ) : (
            <ImageIcon size={48} aria-hidden />
          )}
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
            {p.sellerName} · {p.category}
          </p>
          <h3 className="text-xl font-semibold leading-tight" style={{ color: "var(--ds-theme-content-strong)" }}>
            {p.title}
          </h3>
          <div className="flex items-center gap-1 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            <Star size={12} aria-hidden />
            <span className="tabular-nums">{(p.rating as number)?.toFixed(1)}</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ds-theme-content-default)" }}>
            {p.description}
          </p>

          <p className="text-2xl font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
            {formatPrice(p.price as number, p.currency as string)}
          </p>

          {out ? (
            <Banner intent="warn" title="Esgotado">
              Este item ficou indisponível. Ative alertas para saber quando voltar.
            </Banner>
          ) : last ? (
            <Banner intent="warn" title="Última unidade!">
              Feche a compra rápido — este é o cenário clássico de oversell.
            </Banner>
          ) : null}

          {oversellError && (
            <Banner intent="error" title="Este item acabou de esgotar">
              Outra compra foi confirmada primeiro. Nenhum valor foi cobrado do seu lado.
            </Banner>
          )}

          {lostBid && (
            <Banner intent="warn" title="Sua oferta foi superada">
              Um comprador ofereceu mais. Envie um novo lance para reentrar na disputa.
            </Banner>
          )}

          <div className="flex items-center gap-3">
            <div
              className="inline-flex items-center gap-1"
              style={{
                border: "1px solid var(--ds-theme-border-subtle)",
                borderRadius: 9999,
                padding: 2,
              }}
              role="group"
              aria-label="Quantidade"
            >
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Diminuir quantidade"
                className="grid h-7 w-7 place-items-center"
                style={{ borderRadius: 9999, color: "var(--ds-theme-content-default)" }}
                disabled={out}
              >
                <Minus size={12} />
              </button>
              <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))}
                aria-label="Aumentar quantidade"
                className="grid h-7 w-7 place-items-center"
                style={{ borderRadius: 9999, color: "var(--ds-theme-content-default)" }}
                disabled={out || qty >= stock}
              >
                <Plus size={12} />
              </button>
            </div>

            <button
              type="button"
              onClick={addToCart}
              disabled={out}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{
                padding: "10px 14px",
                borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-default)",
                opacity: out ? 0.5 : 1,
              }}
            >
              <ShoppingCart size={12} aria-hidden /> Adicionar
            </button>

            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              disabled={out}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{
                padding: "10px 14px",
                borderRadius: 9999,
                background: "var(--ds-theme-intent-accent-fill)",
                color: "var(--ds-theme-intent-accent-on-fill)",
                opacity: out ? 0.5 : 1,
              }}
            >
              <Zap size={12} aria-hidden /> Comprar agora
            </button>
          </div>

          {p.acceptsOffers && (
            <button
              type="button"
              onClick={() => setOfferOpen(true)}
              className="inline-flex w-fit items-center gap-1 text-[11px] font-semibold"
              style={{
                padding: "6px 12px",
                borderRadius: 9999,
                background: "var(--ds-theme-surface-default)",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              <Gavel size={12} aria-hidden /> Fazer oferta
            </button>
          )}

          <div
            className="mt-2 flex items-start gap-2 p-3 text-[11px]"
            style={{
              borderRadius: 14,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-muted)",
              border: "1px dashed var(--ds-theme-border-subtle)",
            }}
          >
            <AlertTriangle size={12} className="mt-0.5" aria-hidden />
            <div className="flex flex-col gap-1">
              <span className="font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                Debug — cenários
              </span>
              <span>
                Use os botões abaixo para reproduzir corridas de estoque e lances perdidos, sem afetar dados reais.
              </span>
              <div className="mt-1 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={simulateRace}
                  className="text-[11px] font-semibold underline"
                  style={{ color: "var(--ds-theme-content-default)" }}
                >
                  Simular concorrência
                </button>
                {p.acceptsOffers && (
                  <button
                    type="button"
                    onClick={() => setLostBid(true)}
                    className="text-[11px] font-semibold underline"
                    style={{ color: "var(--ds-theme-content-default)" }}
                  >
                    Simular lance perdedor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar compra?"
        description={`Você vai finalizar ${qty}× ${p.title} por ${formatPrice((p.price as number) * qty, p.currency as string)}.`}
        confirmLabel="Ir para pagamento"
        onConfirm={attemptBuy}
      />

      <FormModal
        open={offerOpen}
        onOpenChange={setOfferOpen}
        onSubmit={(d) => {
          toast.success(`Oferta de ${d.name} enviada (mock)`);
          setLostBid(true);
        }}
      />
    </div>
  );
}