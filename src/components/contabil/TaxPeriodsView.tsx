/**
 * Item ⭐3 + ◻6 — Apuração fiscal e fechamento de competência.
 *
 * Para cada `taxPeriod`, agrega os `entries` associados:
 *   - receitas: soma dos amounts de contas `kind:"receita"`
 *   - despesas: soma dos amounts de contas `kind:"despesa"`
 *   - resultado: receitas + despesas (despesas já são negativas nos entries)
 *
 * Período aberto exibe botão "Fechar competência" → `DestructiveModal`
 * (aviso de irreversibilidade). Fechado é read-only e exibe `closedAt`.
 * Também expõe "Exportar SPED/NF-e" e "Recálculo retroativo" via modais.
 */
import { useMemo, useState } from "react";
import { Lock, Download, RefreshCw } from "lucide-react";
import { useTable, useSetCellCallback } from "@/store/hooks";
import { DestructiveModal, ConfirmModal } from "@/components/catalog/Modals";
import { SyncingState } from "@/components/catalog/States";
import { formatBRL, formatDateBR, type AccountKind } from "./utils";
import { ExportFiscalModal } from "./ExportFiscalModal";

type Entry = { accountCode: string; amount: number; taxPeriodId: string };
type Account = { code: string; kind: AccountKind };
type Period = { label: string; status: "aberto" | "fechado"; closedAt: string | null };

export function TaxPeriodsView() {
  const periods = useTable("taxPeriods") as Record<string, Period>;
  const entries = useTable("entries") as Record<string, Entry>;
  const accounts = useTable("accounts") as Record<string, Account>;

  const [closeTarget, setCloseTarget] = useState<string | null>(null);
  const [recalcOpen, setRecalcOpen] = useState(false);
  const [recalcRunning, setRecalcRunning] = useState(false);
  const [exportTarget, setExportTarget] = useState<string | null>(null);

  const kindByCode = useMemo(() => {
    const m = new Map<string, AccountKind>();
    for (const a of Object.values(accounts)) m.set(a.code, a.kind);
    return m;
  }, [accounts]);

  const totalsByPeriod = useMemo(() => {
    const map = new Map<string, { receitas: number; despesas: number; count: number }>();
    for (const e of Object.values(entries)) {
      const t = map.get(e.taxPeriodId) ?? { receitas: 0, despesas: 0, count: 0 };
      t.count += 1;
      const k = kindByCode.get(e.accountCode);
      if (k === "receita") t.receitas += e.amount;
      else if (k === "despesa") t.despesas += e.amount;
      map.set(e.taxPeriodId, t);
    }
    return map;
  }, [entries, kindByCode]);

  const closePeriod = useSetCellCallback(
    "taxPeriods",
    (id: string) => id,
    () => "status",
    () => () => "fechado" as const,
  );
  const setClosedAt = useSetCellCallback(
    "taxPeriods",
    (id: string) => id,
    () => "closedAt",
    () => () => new Date().toISOString(),
  );

  const runClose = () => {
    if (!closeTarget) return;
    closePeriod(closeTarget);
    setClosedAt(closeTarget);
    setCloseTarget(null);
  };

  const runRecalc = () => {
    setRecalcOpen(false);
    setRecalcRunning(true);
    window.setTimeout(() => setRecalcRunning(false), 1500);
  };

  const rows = useMemo(
    () => Object.entries(periods).sort(([, a], [, b]) => a.label.localeCompare(b.label)),
    [periods],
  );

  return (
    <section aria-labelledby="tp-h" className="flex flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="tp-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Apuração fiscal por competência
          </h3>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Resumo agregado de receitas e despesas por período. Fechamento é irreversível sem administrador.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRecalcOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{
            padding: "8px 12px",
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <RefreshCw size={14} aria-hidden />
          Recálculo retroativo
        </button>
      </header>

      {recalcRunning && <SyncingState label="Recalculando lançamentos…" />}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rows.map(([id, p]) => {
          const t = totalsByPeriod.get(id) ?? { receitas: 0, despesas: 0, count: 0 };
          const resultado = t.receitas + t.despesas;
          const closed = p.status === "fechado";
          return (
            <article
              key={id}
              aria-label={`Competência ${p.label}, ${closed ? "fechada" : "aberta"}`}
              className="flex flex-col gap-3 p-4"
              style={{
                borderRadius: "var(--ds-component-card-radius, 16px)",
                background: "var(--ds-theme-surface-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
                boxShadow: "var(--ds-component-card-shadow)",
              }}
            >
              <header className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
                    Competência
                  </p>
                  <h4 className="text-lg font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {p.label}
                  </h4>
                </div>
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    padding: "3px 8px",
                    borderRadius: 9999,
                    background: closed
                      ? "var(--ds-theme-intent-warning-subtle, var(--ds-theme-surface-subdued))"
                      : "var(--ds-theme-intent-success-subtle, var(--ds-theme-surface-subdued))",
                    color: closed
                      ? "var(--ds-theme-intent-warning-on-subtle, var(--ds-theme-content-strong))"
                      : "var(--ds-theme-intent-success-on-subtle, var(--ds-theme-content-strong))",
                  }}
                >
                  {closed ? <Lock size={10} aria-hidden /> : null}
                  {closed ? "Fechado" : "Aberto"}
                </span>
              </header>

              <dl className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <dt style={{ color: "var(--ds-theme-content-subtle)" }}>Receitas</dt>
                  <dd className="text-sm font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {formatBRL(t.receitas)}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "var(--ds-theme-content-subtle)" }}>Despesas</dt>
                  <dd className="text-sm font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {formatBRL(t.despesas)}
                  </dd>
                </div>
                <div>
                  <dt style={{ color: "var(--ds-theme-content-subtle)" }}>Resultado</dt>
                  <dd
                    className="text-sm font-semibold tabular-nums"
                    style={{
                      color:
                        resultado >= 0
                          ? "var(--ds-theme-intent-success-on-subtle, var(--ds-theme-content-strong))"
                          : "var(--ds-theme-intent-danger-on-subtle, var(--ds-theme-content-strong))",
                    }}
                  >
                    {formatBRL(resultado)}
                  </dd>
                </div>
              </dl>

              <p className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                {t.count} lançamento{t.count === 1 ? "" : "s"}
                {closed && p.closedAt ? ` · fechado em ${formatDateBR(p.closedAt)}` : ""}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setExportTarget(id)}
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{
                    padding: "6px 10px",
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-default)",
                    border: "1px solid var(--ds-theme-border-subtle)",
                  }}
                >
                  <Download size={12} aria-hidden />
                  Exportar SPED/NF-e
                </button>
                {!closed && (
                  <button
                    type="button"
                    onClick={() => setCloseTarget(id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold"
                    style={{
                      padding: "6px 10px",
                      borderRadius: 9999,
                      background: "var(--ds-theme-intent-accent-fill)",
                      color: "var(--ds-theme-intent-accent-on-fill)",
                    }}
                  >
                    <Lock size={12} aria-hidden />
                    Fechar competência
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <DestructiveModal
        open={closeTarget !== null}
        onOpenChange={(v) => !v && setCloseTarget(null)}
        title={`Fechar competência ${closeTarget ? periods[closeTarget]?.label ?? "" : ""}`}
        description="Após fechado, os lançamentos deste período tornam-se somente leitura. Esta ação pode ser revertida apenas por um administrador."
        onConfirm={runClose}
      />

      <ConfirmModal
        open={recalcOpen}
        onOpenChange={setRecalcOpen}
        title="Recálculo retroativo"
        description="Recalcular todos os lançamentos derivados a partir das fontes originais. Não altera dados de período fechado."
        confirmLabel="Recalcular"
        onConfirm={runRecalc}
      />

      <ExportFiscalModal
        open={exportTarget !== null}
        onOpenChange={(v) => !v && setExportTarget(null)}
        periodLabel={exportTarget ? periods[exportTarget]?.label ?? "" : ""}
      />
    </section>
  );
}