/**
 * Modal — Exportar SPED/NF-e.
 *
 * Estado obrigatório: **Conector fiscal ausente**.
 * No mockup, jurisdição fiscal e conector NUNCA estão configurados — o modal
 * mostra a pré-condição como bloqueio claro *antes* mesmo de permitir tentar
 * exportar. Não há erro genérico "depois" — a impossibilidade é anunciada
 * upfront.
 */
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Download } from "lucide-react";

type Format = "sped" | "nfe";

export function ExportFiscalModal({
  open,
  onOpenChange,
  periodLabel,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  periodLabel: string;
}) {
  const [format, setFormat] = useState<Format>("sped");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar documento fiscal</DialogTitle>
          <DialogDescription>
            Competência <strong>{periodLabel || "—"}</strong>. Escolha o formato de saída.
          </DialogDescription>
        </DialogHeader>

        {/* Pré-condição: conector fiscal ausente — mockup */}
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
          <AlertTriangle size={14} aria-hidden />
          <span>
            <strong>Conector fiscal ausente.</strong> Nenhum provedor SPED/NF-e está configurado e a
            jurisdição fiscal não foi definida. Configure um conector em Configurações antes de
            exportar.
          </span>
        </div>

        <fieldset className="flex flex-col gap-2 pt-1">
          <legend className="sr-only">Formato</legend>
          {(
            [
              { id: "sped", label: "SPED Fiscal (.txt)" },
              { id: "nfe", label: "NF-e (lote XML)" },
            ] as { id: Format; label: string }[]
          ).map((opt) => (
            <Label
              key={opt.id}
              htmlFor={`fmt-${opt.id}`}
              className="flex cursor-pointer items-center gap-2 rounded-xl p-2 text-sm"
              style={{
                background:
                  format === opt.id
                    ? "var(--ds-theme-intent-accent-subtle)"
                    : "var(--ds-theme-surface-subdued)",
                color:
                  format === opt.id
                    ? "var(--ds-theme-intent-accent-on-subtle)"
                    : "var(--ds-theme-content-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              <input
                id={`fmt-${opt.id}`}
                type="radio"
                name="fiscal-format"
                value={opt.id}
                checked={format === opt.id}
                onChange={() => setFormat(opt.id)}
              />
              {opt.label}
            </Label>
          ))}
        </fieldset>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled aria-disabled title="Conector fiscal ausente">
            <Download size={14} aria-hidden />
            Exportar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}