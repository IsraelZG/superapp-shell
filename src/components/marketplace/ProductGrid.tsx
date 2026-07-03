import { useMemo, useState } from "react";
import { Image as ImageIcon, Star, ShoppingCart, PackageX } from "lucide-react";
import { useTable, store } from "@/store/hooks";
import { SearchInput } from "@/components/catalog/Navigation";
import { EmptyState, SkeletonCard } from "@/components/catalog/States";
import { toast } from "sonner";
import { formatPrice } from "./utils";

type ProductRow = {
  sellerName?: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  stock?: number;
  category?: string;
  rating?: number;
};

export function ProductGrid({
  onOpen,
  loading = false,
}: {
  onOpen: (id: string) => void;
  loading?: boolean;
}) {
  const products = useTable("products") as Record<string, ProductRow>;
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    const list = Object.entries(products);
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter(([, p]) => {
      const t = (p.title ?? "").toLowerCase();
      const c = (p.category ?? "").toLowerCase();
      const s = (p.sellerName ?? "").toLowerCase();
      return t.includes(needle) || c.includes(needle) || s.includes(needle);
    });
  }, [products, q]);

  const addToCart = (productId: string) => {
    const existing = Object.entries(store.getTable("cart") as Record<string, { productId: string; quantity: number }>).find(
      ([, row]) => row.productId === productId,
    );
    if (existing) {
      store.setCell("cart", existing[0], "quantity", (existing[1].quantity ?? 0) + 1);
    } else {
      store.setRow("cart", `ci_${Date.now()}`, { productId, quantity: 1 });
    }
    toast.success("Adicionado ao carrinho");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-sm flex-1">
          <SearchInput value={q} onChange={setQ} placeholder="Buscar produtos, categorias, vendedores…" />
        </div>
        <p className="text-xs" style={{ color: "var(--ds-theme-content-subtle)" }}>
          {items.length} {items.length === 1 ? "resultado" : "resultados"}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} lines={3} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Nenhum produto encontrado"
          description={q ? `Sem resultados para “${q}”. Tente outro termo.` : "A vitrine está vazia por enquanto."}
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Vitrine de produtos">
          {items.map(([id, p]) => {
            const stock = (p.stock as number) ?? 0;
            const out = stock === 0;
            const last = stock === 1;
            return (
              <li
                key={id}
                className="flex flex-col gap-3 p-3"
                style={{
                  background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
                  border: "1px solid var(--ds-theme-border-subtle)",
                  borderRadius: "var(--ds-component-card-radius, 20px)",
                  boxShadow: "var(--ds-component-card-shadow)",
                }}
              >
                <button
                  type="button"
                  onClick={() => onOpen(id)}
                  className="grid aspect-video w-full place-items-center overflow-hidden text-left"
                  style={{
                    borderRadius: 14,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-subtle)",
                  }}
                  aria-label={`Abrir ${p.title ?? "produto"}`}
                >
                  {p.imageUrl ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <img src={p.imageUrl as string} className="h-full w-full object-cover" alt="" />
                  ) : (
                    <ImageIcon size={28} aria-hidden />
                  )}
                </button>
                <div className="flex flex-col gap-1">
                  <p className="text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
                    {p.sellerName}
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpen(id)}
                    className="text-left text-sm font-semibold leading-tight"
                    style={{ color: "var(--ds-theme-content-strong)" }}
                  >
                    {p.title}
                  </button>
                  <div className="flex items-center gap-1 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    <Star size={11} aria-hidden />
                    <span className="tabular-nums">{(p.rating as number)?.toFixed(1)}</span>
                    <span aria-hidden>·</span>
                    <span>{p.category}</span>
                  </div>
                </div>
                <div className="mt-auto flex items-end justify-between gap-2">
                  <div>
                    <p className="text-base font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                      {formatPrice(p.price as number, p.currency as string)}
                    </p>
                    {out ? (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase"
                        style={{
                          padding: "2px 8px",
                          borderRadius: 9999,
                          background: "var(--ds-theme-surface-subdued)",
                          color: "var(--ds-theme-content-muted)",
                          border: "1px dashed var(--ds-theme-border-subtle)",
                        }}
                      >
                        <PackageX size={10} aria-hidden /> Esgotado
                      </span>
                    ) : last ? (
                      <span
                        className="text-[10px] font-semibold uppercase"
                        style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}
                      >
                        Última unidade!
                      </span>
                    ) : (
                      <span className="text-[10px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
                        {stock} em estoque
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => (out ? toast.error("Produto esgotado") : addToCart(id))}
                    aria-label={`Adicionar ${p.title} ao carrinho`}
                    disabled={out}
                    className="inline-flex items-center gap-1 text-xs font-semibold"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 9999,
                      background: out ? "var(--ds-theme-surface-subdued)" : "var(--ds-theme-intent-accent-fill)",
                      color: out ? "var(--ds-theme-content-subtle)" : "var(--ds-theme-intent-accent-on-fill)",
                      opacity: out ? 0.7 : 1,
                    }}
                  >
                    <ShoppingCart size={12} aria-hidden />
                    Adicionar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}