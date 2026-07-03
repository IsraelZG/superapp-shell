export function formatPrice(price: number, currency: string = "BRL"): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: currency || "BRL",
    }).format(price ?? 0);
  } catch {
    return `${currency ?? ""} ${(price ?? 0).toFixed(2)}`;
  }
}

export function relTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  return d.toLocaleDateString("pt-BR");
}

export const sagaSteps = ["pendente", "pago", "enviado", "compensado"] as const;
export type SagaStepKey = (typeof sagaSteps)[number];

export const sagaOrder: Record<SagaStepKey, number> = {
  pendente: 0,
  pago: 1,
  enviado: 2,
  compensado: -1,
};

export function buildSagaSteps(current: SagaStepKey) {
  const flow: { id: string; label: string; key: SagaStepKey }[] = [
    { id: "pendente", label: "Reservado", key: "pendente" },
    { id: "pago", label: "Pago", key: "pago" },
    { id: "enviado", label: "Enviado", key: "enviado" },
  ];
  const isCompensated = current === "compensado";
  const curIdx = flow.findIndex((s) => s.key === current);
  return flow.map((s, i) => {
    let status: "done" | "current" | "pending" | "compensated" = "pending";
    if (isCompensated) status = "compensated";
    else if (i < curIdx) status = "done";
    else if (i === curIdx) status = "current";
    return { id: s.id, label: s.label, status };
  });
}