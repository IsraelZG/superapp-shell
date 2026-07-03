import { useState, type ReactNode } from "react";
import { ArrowLeft, FileDown } from "lucide-react";
import { store, useRow } from "@/store/hooks";
import { SaveIndicator } from "./SaveIndicator";
import { PresenceAvatars } from "./PresenceAvatars";
import { ConflictResolvedIndicator } from "./ConflictIndicator";
import { ExportModal } from "./ExportModal";

type DocRow = {
  title?: string;
  kind?: string;
  ownerName?: string;
  collaborators?: string;
  syncStatus?: string;
};

/**
 * Chrome comum aos 4 editores: header com voltar, título editável, indicadores
 * de sync/presença/conflito, botão exportar. Renderiza o conteúdo do editor
 * como children num container que ocupa o restante do overlay.
 */
export function EditorChrome({
  documentId,
  onClose,
  saveSignal,
  toolbarExtra,
  allowedFormats,
  children,
}: {
  documentId: string;
  onClose: () => void;
  saveSignal: unknown;
  toolbarExtra?: ReactNode;
  allowedFormats?: ("pdf" | "pptx" | "docx")[];
  children: ReactNode;
}) {
  const doc = useRow("documents", documentId) as DocRow;
  const [exportOpen, setExportOpen] = useState(false);
  const [titleLocal, setTitleLocal] = useState(doc.title ?? "");
  const [titleSignal, setTitleSignal] = useState<string>("");

  // sincroniza título local com store se doc mudar externamente
  // (não usamos useEffect aqui de propósito — edição é single-source local).

  const commitTitle = (value: string) => {
    if (value.trim() === "") return;
    store.setCell("documents", documentId, "title", value);
    store.setCell("documents", documentId, "updatedAt", new Date().toISOString());
    setTitleSignal(`${Date.now()}`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header
        className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-6"
        style={{
          borderBottom: "1px solid var(--ds-theme-border-subtle)",
          background: "var(--ds-theme-surface-default)",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Voltar à Studio"
          className="grid place-items-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          <ArrowLeft size={16} aria-hidden />
        </button>

        <input
          aria-label="Título do documento"
          value={titleLocal}
          onChange={(e) => setTitleLocal(e.target.value)}
          onBlur={(e) => commitTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          }}
          className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none"
          style={{
            color: "var(--ds-theme-content-strong)",
            padding: "4px 8px",
            borderRadius: 8,
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          <SaveIndicator signal={titleSignal || saveSignal} />
          {doc.syncStatus === "conflict-resolved" && <ConflictResolvedIndicator />}
          <PresenceAvatars collaborators={doc.collaborators ?? ""} />
          {toolbarExtra}
          <button
            type="button"
            onClick={() => setExportOpen(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            <FileDown size={12} aria-hidden /> Exportar
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>

      <ExportModal
        open={exportOpen}
        onOpenChange={setExportOpen}
        docTitle={doc.title ?? "Documento"}
        allowedFormats={allowedFormats}
      />
    </div>
  );
}