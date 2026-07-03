import { GitMerge } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Nota informativa silenciosa quando o CRDT mesclou automaticamente uma versão
 * conflitante. NÃO é erro — é auditoria discreta.
 */
export function ConflictResolvedIndicator() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Nota de auditoria: versão conflitante mesclada automaticamente"
            className="inline-flex items-center gap-1.5 text-[11px] font-medium"
            style={{
              padding: "3px 10px",
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-muted)",
              border: "1px dashed var(--ds-theme-border-subtle)",
            }}
          >
            <GitMerge size={11} aria-hidden />
            Mesclado
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs text-xs">
          Uma versão conflitante foi mesclada automaticamente às 14:02 (CRDT).
          Nenhuma ação necessária.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}