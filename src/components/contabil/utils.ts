/**
 * B4 — Contábil / Fiscal / RH
 * Utilitários compartilhados.
 */

export type AccountKind = "ativo" | "passivo" | "receita" | "despesa" | "patrimonio";
export type PeriodStatus = "aberto" | "fechado";

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

export function formatBRL(v: number | undefined): string {
  return BRL.format(typeof v === "number" ? v : 0);
}

export function formatDateBR(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
}

/**
 * Cores/rotulos por tipo de conta contábil. Cada tipo mapeia para um par
 * (background, foreground) do tema — sempre via tokens `--ds-*`.
 */
export function kindStyle(kind: AccountKind | string) {
  switch (kind) {
    case "ativo":
      return {
        label: "Ativo",
        bg: "var(--ds-theme-intent-success-subtle, var(--ds-theme-surface-subdued))",
        fg: "var(--ds-theme-intent-success-on-subtle, var(--ds-theme-content-strong))",
      };
    case "passivo":
      return {
        label: "Passivo",
        bg: "var(--ds-theme-intent-danger-subtle, var(--ds-theme-surface-subdued))",
        fg: "var(--ds-theme-intent-danger-on-subtle, var(--ds-theme-content-strong))",
      };
    case "receita":
      return {
        label: "Receita",
        bg: "var(--ds-theme-intent-accent-subtle)",
        fg: "var(--ds-theme-intent-accent-on-subtle)",
      };
    case "despesa":
      return {
        label: "Despesa",
        bg: "var(--ds-theme-intent-warning-subtle, var(--ds-theme-surface-subdued))",
        fg: "var(--ds-theme-intent-warning-on-subtle, var(--ds-theme-content-strong))",
      };
    default:
      return {
        label: "Patrimônio",
        bg: "var(--ds-theme-surface-subdued)",
        fg: "var(--ds-theme-content-default)",
      };
  }
}