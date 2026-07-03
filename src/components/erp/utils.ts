/** Formata BRL sem depender de setState (para SSR-safe e i18n-ready). */
export function formatBRL(v: number | undefined): string {
  const n = typeof v === "number" ? v : 0;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatDateShort(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
}

/** "em 12min" · "em 1h" · "expirada". Silencioso quando `iso` vazio. */
export function ttlLabel(iso: string | undefined): { text: string; expired: boolean } {
  if (!iso) return { text: "", expired: false };
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = target - now;
  if (Number.isNaN(target)) return { text: "", expired: false };
  if (diff <= 0) return { text: "expirada", expired: true };
  const mins = Math.round(diff / 60000);
  if (mins < 60) return { text: `${mins}min`, expired: false };
  const hrs = Math.round(mins / 60);
  return { text: `${hrs}h`, expired: false };
}

export type SalesStatus = "rascunho" | "confirmado" | "faturado";
export type PurchaseStatus = "solicitado" | "aprovado" | "recebido";
export type Stage = "prospecção" | "qualificação" | "proposta" | "fechamento";

export const salesFlow: SalesStatus[] = ["rascunho", "confirmado", "faturado"];
export const purchaseFlow: PurchaseStatus[] = ["solicitado", "aprovado", "recebido"];
export const pipelineStages: Stage[] = [
  "prospecção",
  "qualificação",
  "proposta",
  "fechamento",
];