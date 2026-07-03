import { Banknote, Clock } from "lucide-react";
import { Banner } from "@/components/catalog/Notifications";

export function FinancePlaceholder() {
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center gap-2">
        <Banknote size={18} aria-hidden style={{ color: "var(--ds-theme-content-strong)" }} />
        <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Instrumentos financeiros
        </h3>
      </header>

      <Banner intent="info" title="Em breve">
        Régua de cobrança, split de pagamento, multi-moeda e antecipação de recebíveis chegam nas próximas
        iterações.
      </Banner>

      <ul className="grid gap-2 sm:grid-cols-2">
        {[
          { title: "Régua de cobrança", desc: "Automatize lembretes e escalonamentos por pedido." },
          { title: "Split de pagamento", desc: "Divida a receita entre parceiros e criadores." },
          { title: "Multi-moeda", desc: "Aceite BRL, USD, EUR — com câmbio local-first." },
          { title: "Antecipação", desc: "Receba adiantado com tarifa transparente." },
        ].map((c) => (
          <li
            key={c.title}
            className="flex items-start gap-3 p-4"
            style={{
              borderRadius: 16,
              background: "var(--ds-theme-surface-default)",
              border: "1px dashed var(--ds-theme-border-subtle)",
            }}
          >
            <Clock size={16} aria-hidden style={{ color: "var(--ds-theme-content-subtle)" }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{c.title}</p>
              <p className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>{c.desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}