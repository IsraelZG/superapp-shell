import { useMemo, useState } from "react";
import { ArrowLeft, Mail, Tag } from "lucide-react";
import { useTable } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { formatBRL, formatDateShort, type SalesStatus, type Stage } from "./utils";

type Customer = {
  name?: string;
  email?: string;
  segment?: string;
  lifetimeValue?: number;
  lastContact?: string;
};

type Sale = { customerName?: string; items?: string; total?: number; status?: SalesStatus; createdAt?: string };
type Deal = { dealName?: string; customerName?: string; stage?: Stage; value?: number; owner?: string };

export function CustomersView() {
  const customers = useTable("customers") as Record<string, Customer>;
  const sales = useTable("salesOrders") as Record<string, Sale>;
  const pipeline = useTable("pipeline") as Record<string, Deal>;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const rows = useMemo(() => Object.entries(customers), [customers]);
  const selected = selectedId ? customers[selectedId] : null;

  const related = useMemo(() => {
    if (!selected?.name) return { sales: [] as Array<[string, Sale]>, deals: [] as Array<[string, Deal]> };
    const name = selected.name;
    return {
      sales: Object.entries(sales).filter(([, s]) => s.customerName === name),
      deals: Object.entries(pipeline).filter(([, d]) => d.customerName === name),
    };
  }, [selected, sales, pipeline]);

  if (selected && selectedId) {
    const openDealsValue = related.deals.reduce((sum, [, d]) => sum + (d.value ?? 0), 0);
    return (
      <section aria-labelledby="cus360-h" className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="inline-flex w-fit items-center gap-1 text-xs font-semibold"
          style={{
            padding: "6px 12px",
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          <ArrowLeft size={12} aria-hidden /> Voltar
        </button>

        <header
          className="flex flex-wrap items-center gap-4 p-4"
          style={{
            borderRadius: "var(--ds-component-card-radius, 16px)",
            background: "var(--ds-theme-surface-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <div
            className="grid h-14 w-14 place-items-center text-lg font-bold"
            style={{
              borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-subtle)",
              color: "var(--ds-theme-intent-accent-on-subtle)",
            }}
            aria-hidden
          >
            {selected.name?.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="cus360-h" className="truncate text-xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              {selected.name}
            </h3>
            <p className="flex items-center gap-3 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
              <span className="inline-flex items-center gap-1">
                <Mail size={12} aria-hidden /> {selected.email}
              </span>
              <span className="inline-flex items-center gap-1">
                <Tag size={12} aria-hidden /> {selected.segment}
              </span>
            </p>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          <Metric label="LTV" value={formatBRL(selected.lifetimeValue)} />
          <Metric label="Último contato" value={formatDateShort(selected.lastContact)} />
          <Metric label="Pipeline aberto" value={formatBRL(openDealsValue)} />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Panel title="Pedidos de venda">
            {related.sales.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                Nenhum pedido registrado.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {related.sales.map(([id, s]) => (
                  <li key={id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate" style={{ color: "var(--ds-theme-content-default)" }}>
                      {s.items}
                    </span>
                    <span className="shrink-0 tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                      {formatBRL(s.total)} · {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Oportunidades no pipeline">
            {related.deals.length === 0 ? (
              <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                Nenhuma oportunidade ativa.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {related.deals.map(([id, d]) => (
                  <li key={id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="min-w-0 truncate" style={{ color: "var(--ds-theme-content-default)" }}>
                      {d.dealName}
                    </span>
                    <span className="shrink-0 tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                      {formatBRL(d.value)} · {d.stage}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="cus-h" className="flex flex-col gap-3">
      <header>
        <h3 id="cus-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Clientes
        </h3>
        <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Toque num cliente para abrir a visão 360.
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState title="Nenhum cliente cadastrado" description="Adicione contatos para começar." />
      ) : (
        <ul aria-label="Lista de clientes" className="flex flex-col gap-2">
          {rows.map(([id, c]) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setSelectedId(id)}
                className="flex w-full items-center gap-3 p-3 text-left transition-transform hover:-translate-y-0.5"
                style={{
                  borderRadius: "var(--ds-component-card-radius, 16px)",
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <span
                  className="grid h-10 w-10 place-items-center text-sm font-bold"
                  style={{
                    borderRadius: 9999,
                    background: "var(--ds-theme-intent-accent-subtle)",
                    color: "var(--ds-theme-intent-accent-on-subtle)",
                  }}
                  aria-hidden
                >
                  {c.name?.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {c.name}
                  </span>
                  <span className="block truncate text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {c.email} · {c.segment}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block text-sm font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {formatBRL(c.lifetimeValue)}
                  </span>
                  <span className="block text-[10px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
                    LTV
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 p-4"
      style={{
        borderRadius: "var(--ds-component-card-radius, 16px)",
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      <span className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
        {label}
      </span>
      <span className="text-xl font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
        {value}
      </span>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="flex flex-col gap-2 p-4"
      style={{
        borderRadius: "var(--ds-component-card-radius, 16px)",
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      <h4 className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
        {title}
      </h4>
      {children}
    </section>
  );
}