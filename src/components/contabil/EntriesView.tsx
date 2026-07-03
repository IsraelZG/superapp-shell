/**
 * Item ⭐2 — Livro/lançamentos derivados.
 *
 * Cada lançamento (`entries`) mostra explicitamente sua origem (`derivedFrom`)
 * — reforça o princípio de que a contabilidade é derivada de eventos
 * sistêmicos (pedidos, folha, etc.), não digitada à mão. Filtros por conta
 * e por competência.
 *
 * Se o `taxPeriod` associado estiver `fechado`, tentar editar dispara um
 * aviso in-line (padrão "período fechado read-only" do módulo).
 */
import { useMemo, useState } from "react";
import { Lock, ArrowRight } from "lucide-react";
import { useTable } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { formatBRL, formatDateBR } from "./utils";

type Entry = {
  accountCode: string;
  description: string;
  amount: number;
  date: string;
  derivedFrom: string;
  taxPeriodId: string;
};
type Account = { code: string; name: string };
type Period = { label: string; status: "aberto" | "fechado" };

export function EntriesView() {
  const entries = useTable("entries") as Record<string, Entry>;
  const accounts = useTable("accounts") as Record<string, Account>;
  const periods = useTable("taxPeriods") as Record<string, Period>;

  const [accountFilter, setAccountFilter] = useState<string>("");
  const [periodFilter, setPeriodFilter] = useState<string>("");
  const [blockedNote, setBlockedNote] = useState<string | null>(null);

  const accountByCode = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of Object.values(accounts)) m.set(a.code, a.name);
    return m;
  }, [accounts]);

  const rows = useMemo(() => {
    return Object.entries(entries)
      .filter(([, e]) => (accountFilter ? e.accountCode === accountFilter : true))
      .filter(([, e]) => (periodFilter ? e.taxPeriodId === periodFilter : true))
      .sort(([, a], [, b]) => (b.date ?? "").localeCompare(a.date ?? ""));
  }, [entries, accountFilter, periodFilter]);

  const accountOptions = useMemo(
    () =>
      Object.values(accounts)
        .map((a) => a.code)
        .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true })),
    [accounts],
  );

  const attemptEdit = (id: string, e: Entry) => {
    const p = periods[e.taxPeriodId];
    if (p?.status === "fechado") {
      setBlockedNote(
        `Lançamento ${id} pertence à competência ${p.label} (fechada). Reabertura requer administrador.`,
      );
      window.setTimeout(() => setBlockedNote(null), 4000);
      return;
    }
    setBlockedNote(`Edição de lançamentos ainda não implementada neste mockup (${id}).`);
    window.setTimeout(() => setBlockedNote(null), 3000);
  };

  return (
    <section aria-labelledby="ent-h" className="flex flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="ent-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Livro de lançamentos
          </h3>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Lançamentos são <strong>derivados</strong> de eventos do sistema — a coluna origem mostra a fonte.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
            <span className="sr-only">Filtrar por conta</span>
            <select
              aria-label="Filtrar por conta"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="text-xs"
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: "var(--ds-theme-surface-default)",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              <option value="">Todas as contas</option>
              {accountOptions.map((code) => (
                <option key={code} value={code}>
                  {code} — {accountByCode.get(code)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
            <span className="sr-only">Filtrar por competência</span>
            <select
              aria-label="Filtrar por competência"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="text-xs"
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: "var(--ds-theme-surface-default)",
                color: "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              <option value="">Todas as competências</option>
              {Object.entries(periods).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.label} · {p.status}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {blockedNote && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 text-xs"
          style={{
            borderRadius: 12,
            background: "var(--ds-theme-intent-warning-subtle, var(--ds-theme-surface-subdued))",
            color: "var(--ds-theme-intent-warning-on-subtle, var(--ds-theme-content-strong))",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <Lock size={14} aria-hidden />
          <span>{blockedNote}</span>
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState title="Sem lançamentos" description="Nenhum lançamento para os filtros selecionados." />
      ) : (
        <ul aria-label="Lançamentos" className="flex flex-col gap-2">
          {rows.map(([id, e]) => {
            const p = periods[e.taxPeriodId];
            const closed = p?.status === "fechado";
            const positive = e.amount >= 0;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => attemptEdit(id, e)}
                  className="flex w-full flex-wrap items-center gap-3 p-3 text-left transition-transform hover:-translate-y-0.5"
                  style={{
                    borderRadius: "var(--ds-component-card-radius, 16px)",
                    background: "var(--ds-theme-surface-default)",
                    border: "1px solid var(--ds-theme-border-subtle)",
                    opacity: closed ? 0.85 : 1,
                  }}
                  aria-label={`Lançamento ${id}, ${e.description}, ${formatBRL(e.amount)}${closed ? ", período fechado" : ""}`}
                >
                  <span
                    className="shrink-0 text-[10px] font-mono uppercase tracking-wide"
                    style={{
                      padding: "3px 8px",
                      borderRadius: 9999,
                      background: "var(--ds-theme-surface-subdued)",
                      color: "var(--ds-theme-content-muted)",
                    }}
                  >
                    {e.accountCode}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                      {e.description}
                    </span>
                    <span className="flex flex-wrap items-center gap-1 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                      <span>{formatDateBR(e.date)}</span>
                      <ArrowRight size={10} aria-hidden />
                      <span className="font-mono">{e.derivedFrom}</span>
                      {p && (
                        <>
                          <ArrowRight size={10} aria-hidden />
                          <span>{p.label}</span>
                        </>
                      )}
                    </span>
                  </span>

                  {closed && (
                    <span
                      className="inline-flex items-center gap-1 shrink-0 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        padding: "3px 8px",
                        borderRadius: 9999,
                        background: "var(--ds-theme-intent-warning-subtle, var(--ds-theme-surface-subdued))",
                        color: "var(--ds-theme-intent-warning-on-subtle, var(--ds-theme-content-strong))",
                      }}
                    >
                      <Lock size={10} aria-hidden /> Fechado
                    </span>
                  )}

                  <span
                    className="shrink-0 text-sm font-semibold tabular-nums"
                    style={{
                      color: positive
                        ? "var(--ds-theme-intent-success-on-subtle, var(--ds-theme-content-strong))"
                        : "var(--ds-theme-intent-danger-on-subtle, var(--ds-theme-content-strong))",
                    }}
                  >
                    {positive ? "+" : ""}
                    {formatBRL(e.amount)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}