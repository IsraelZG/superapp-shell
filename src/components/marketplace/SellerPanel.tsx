import { useMemo, useState } from "react";
import { Store, Eye, TrendingUp, Plus } from "lucide-react";
import { useTable, store } from "@/store/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/catalog/States";
import { toast } from "sonner";
import { formatPrice } from "./utils";

type ListingRow = {
  productId?: string;
  title?: string;
  status?: "ativo" | "pausado" | "vendido";
  views?: number;
  sales?: number;
  revenue?: number;
};

export function SellerPanel() {
  const listings = useTable("sellerListings") as Record<string, ListingRow>;
  const [newOpen, setNewOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const rows = Object.entries(listings);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, [, l]) => {
        acc.revenue += (l.revenue as number) ?? 0;
        acc.sales += (l.sales as number) ?? 0;
        acc.views += (l.views as number) ?? 0;
        return acc;
      },
      { revenue: 0, sales: 0, views: 0 },
    );
  }, [rows]);

  const togglePaused = (id: string, current: ListingRow["status"]) => {
    const next = current === "ativo" ? "pausado" : "ativo";
    store.setCell("sellerListings", id, "status", next);
    toast(`Anúncio ${next === "ativo" ? "reativado" : "pausado"}`);
  };

  const submitNew = (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    const stockNum = Number(stock);
    if (!title.trim()) return setErr("Informe o título.");
    if (!Number.isFinite(priceNum) || priceNum <= 0) return setErr("Preço inválido.");
    if (!Number.isInteger(stockNum) || stockNum < 0) return setErr("Estoque inválido.");
    setErr(null);
    const pid = `pr_${Date.now()}`;
    const lid = `sl_${Date.now()}`;
    store.setRow("products", pid, {
      sellerName: "Israel",
      title: title.trim(),
      description: "Anúncio criado pelo painel do vendedor (mock).",
      price: priceNum,
      currency: "BRL",
      imageUrl: "",
      stock: stockNum,
      category: "novo",
      rating: 0,
      acceptsOffers: false,
    });
    store.setRow("sellerListings", lid, {
      productId: pid,
      title: title.trim(),
      status: "ativo",
      views: 0,
      sales: 0,
      revenue: 0,
    });
    toast.success("Anúncio publicado");
    setTitle("");
    setPrice("");
    setStock("");
    setNewOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Store size={18} aria-hidden style={{ color: "var(--ds-theme-content-strong)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Painel do vendedor
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold"
          style={{
            padding: "8px 14px",
            borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          <Plus size={12} aria-hidden /> Novo anúncio
        </button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryCard label="Receita total" value={formatPrice(totals.revenue, "BRL")} icon={<TrendingUp size={16} aria-hidden />} />
        <SummaryCard label="Vendas" value={String(totals.sales)} icon={<Store size={16} aria-hidden />} />
        <SummaryCard label="Visualizações" value={totals.views.toLocaleString("pt-BR")} icon={<Eye size={16} aria-hidden />} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Sem anúncios" description="Crie seu primeiro anúncio para começar a vender." actionLabel="Novo anúncio" onAction={() => setNewOpen(true)} />
      ) : (
        <div
          className="overflow-x-auto"
          style={{
            borderRadius: 16,
            border: "1px solid var(--ds-theme-border-subtle)",
            background: "var(--ds-theme-surface-default)",
          }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Vendas</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(([id, l]) => {
                const isSold = l.status === "vendido";
                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{l.title}</TableCell>
                    <TableCell>
                      <span
                        className="inline-flex items-center text-[10px] font-semibold uppercase"
                        style={{
                          padding: "2px 8px",
                          borderRadius: 9999,
                          background:
                            l.status === "ativo"
                              ? "var(--ds-theme-intent-accent-subtle)"
                              : "var(--ds-theme-surface-subdued)",
                          color:
                            l.status === "ativo"
                              ? "var(--ds-theme-intent-accent-on-subtle)"
                              : "var(--ds-theme-content-muted)",
                          border: "1px solid var(--ds-theme-border-subtle)",
                        }}
                      >
                        {l.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{(l.views as number) ?? 0}</TableCell>
                    <TableCell className="text-right tabular-nums">{(l.sales as number) ?? 0}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice((l.revenue as number) ?? 0, "BRL")}</TableCell>
                    <TableCell className="text-right">
                      <Switch
                        checked={l.status === "ativo"}
                        onCheckedChange={() => togglePaused(id, l.status)}
                        disabled={isSold}
                        aria-label={`Alternar ${l.title}`}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo anúncio</DialogTitle>
            <DialogDescription>Preencha os dados básicos. O anúncio entra como ativo.</DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-3" onSubmit={submitNew}>
            <div className="flex flex-col gap-1">
              <Label htmlFor="sp-title">Título</Label>
              <Input id="sp-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="sp-price">Preço (BRL)</Label>
                <Input id="sp-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="99.90" />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="sp-stock">Estoque</Label>
                <Input id="sp-stock" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="10" />
              </div>
            </div>
            {err && (
              <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
                {err}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setNewOpen(false)}>Cancelar</Button>
              <Button type="submit">Publicar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 p-4"
      style={{
        borderRadius: 16,
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      <div
        className="grid h-9 w-9 place-items-center"
        style={{
          borderRadius: 12,
          background: "var(--ds-theme-intent-accent-subtle)",
          color: "var(--ds-theme-intent-accent-on-subtle)",
        }}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>{label}</p>
        <p className="text-lg font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>{value}</p>
      </div>
    </div>
  );
}