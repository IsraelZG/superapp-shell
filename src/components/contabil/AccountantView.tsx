/**
 * Item ⭐4 — Visão do contador.
 *
 * Mesmos dados do plano de contas + lançamentos, com um banner claro no topo
 * indicando que o acesso é escopado ao subgrafo fiscal do cliente. Não é
 * controle de acesso real — é sinalização visual de que existe um modelo de
 * escopo compartilhado com terceiros.
 *
 * Também inclui o estado obrigatório de **jurisdição ausente** quando o
 * contador tenta gerar uma NF-e diretamente daqui.
 */
import { useState } from "react";
import { ShieldCheck, AlertTriangle, FileText } from "lucide-react";
import { AccountsTree } from "./AccountsTree";
import { EntriesView } from "./EntriesView";

export function AccountantView() {
  const [showJurisdictionError, setShowJurisdictionError] = useState(false);

  return (
    <section aria-labelledby="acc-view-h" className="flex flex-col gap-4">
      <div
        role="note"
        aria-live="polite"
        className="flex items-start gap-2 p-3 text-xs"
        style={{
          borderRadius: 12,
          background: "var(--ds-theme-intent-accent-subtle)",
          color: "var(--ds-theme-intent-accent-on-subtle)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <ShieldCheck size={16} aria-hidden />
        <div>
          <p className="font-semibold">Visão de terceiro — contador externo</p>
          <p className="mt-0.5">
            Acesso escopado ao <strong>subgrafo fiscal</strong> deste cliente. Você vê apenas plano
            de contas, lançamentos e apurações — nunca o restante do SuperApp do titular.
          </p>
        </div>
      </div>

      <h3 id="acc-view-h" className="sr-only">
        Visão do contador
      </h3>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Ferramentas rápidas do contador para este cliente.
        </p>
        <button
          type="button"
          onClick={() => setShowJurisdictionError(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{
            padding: "6px 10px",
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <FileText size={12} aria-hidden />
          Emitir NF-e
        </button>
      </div>

      {showJurisdictionError && (
        <div
          role="alert"
          className="flex items-start justify-between gap-2 p-3 text-xs"
          style={{
            borderRadius: 12,
            background: "var(--ds-theme-intent-warning-subtle, var(--ds-theme-surface-subdued))",
            color: "var(--ds-theme-intent-warning-on-subtle, var(--ds-theme-content-strong))",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <span className="flex items-start gap-2">
            <AlertTriangle size={14} aria-hidden />
            <span>
              <strong>Jurisdição fiscal não configurada</strong> — funcionalidade indisponível até
              configurar em Configurações.
            </span>
          </span>
          <button
            type="button"
            onClick={() => setShowJurisdictionError(false)}
            className="shrink-0 text-[11px] font-semibold underline"
            style={{ color: "var(--ds-theme-intent-warning-on-subtle, var(--ds-theme-content-strong))" }}
          >
            Ok
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <AccountsTree />
        <EntriesView />
      </div>
    </section>
  );
}