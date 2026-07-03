import { useMemo, useState } from "react";
import { Heading1, List, Pilcrow, Image as ImageIcon, Link2 } from "lucide-react";
import { store, useRow, useTable } from "@/store/hooks";
import { EditorChrome } from "./EditorChrome";
import { InsertMediaModal } from "./InsertMediaModal";
import { toast } from "sonner";

type Block = { id: string; type: "h1" | "p" | "li"; text: string };

// Corpo do doc é serializado como JSON string no cell `body` de documents.
// Fallback: bloco parágrafo único com placeholder.
function parseBody(raw: unknown): Block[] {
  if (typeof raw !== "string" || !raw) {
    return [{ id: "b1", type: "p", text: "" }];
  }
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as Block[];
  } catch {
    /* ignore */
  }
  return [{ id: "b1", type: "p", text: String(raw) }];
}

export function DocEditor({
  documentId,
  onClose,
  onOpenDoc,
}: {
  documentId: string;
  onClose: () => void;
  onOpenDoc: (id: string) => void;
}) {
  const doc = useRow("documents", documentId) as { body?: string; title?: string };
  const allDocs = useTable("documents") as Record<
    string,
    { title?: string; kind?: string }
  >;

  const [blocks, setBlocks] = useState<Block[]>(() => parseBody(doc.body));
  const [insertOpen, setInsertOpen] = useState(false);
  const [saveSignal, setSaveSignal] = useState<string>("");

  const persist = (next: Block[]) => {
    setBlocks(next);
    store.setCell("documents", documentId, "body", JSON.stringify(next));
    store.setCell("documents", documentId, "updatedAt", new Date().toISOString());
    setSaveSignal(`${Date.now()}`);
  };

  const updateBlock = (id: string, text: string) => {
    persist(blocks.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  const addBlock = (type: Block["type"]) => {
    persist([...blocks, { id: `b_${Date.now()}`, type, text: "" }]);
  };

  // backlinks mock: 1-2 outros docs "que citam este"
  const backlinks = useMemo(() => {
    const others = Object.entries(allDocs).filter(
      ([id, d]) => id !== documentId && d.kind === "doc",
    );
    return others.slice(0, 2);
  }, [allDocs, documentId]);

  return (
    <EditorChrome
      documentId={documentId}
      onClose={onClose}
      saveSignal={saveSignal}
      allowedFormats={["pdf", "docx"]}
    >
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 sm:p-8">
        {/* Toolbar de blocos */}
        <div
          role="toolbar"
          aria-label="Inserir bloco"
          className="flex flex-wrap items-center gap-1 p-1"
          style={{
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px solid var(--ds-theme-border-subtle)",
            width: "fit-content",
          }}
        >
          <BlockBtn onClick={() => addBlock("h1")} label="Título" icon={<Heading1 size={14} aria-hidden />} />
          <BlockBtn onClick={() => addBlock("p")} label="Parágrafo" icon={<Pilcrow size={14} aria-hidden />} />
          <BlockBtn onClick={() => addBlock("li")} label="Lista" icon={<List size={14} aria-hidden />} />
          <BlockBtn onClick={() => setInsertOpen(true)} label="Mídia" icon={<ImageIcon size={14} aria-hidden />} />
        </div>

        {/* Blocos */}
        <div className="flex flex-col gap-3">
          {blocks.map((b) => {
            const common = {
              value: b.text,
              onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
                updateBlock(b.id, e.target.value),
              "aria-label": `Bloco ${b.type}`,
              className: "w-full resize-none bg-transparent outline-none",
              style: {
                padding: "8px 12px",
                borderRadius: 12,
                color: "var(--ds-theme-content-default)",
                border: "1px solid transparent",
              } as React.CSSProperties,
              onFocus: (e: React.FocusEvent<HTMLElement>) => {
                (e.currentTarget as HTMLElement).style.borderColor =
                  "var(--ds-theme-border-subtle)";
                (e.currentTarget as HTMLElement).style.background =
                  "var(--ds-theme-surface-subdued)";
              },
              onBlur: (e: React.FocusEvent<HTMLElement>) => {
                (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              },
            };
            if (b.type === "h1") {
              return (
                <input
                  key={b.id}
                  {...common}
                  placeholder="Título"
                  className="w-full bg-transparent text-2xl font-bold outline-none"
                  style={{
                    ...common.style,
                    color: "var(--ds-theme-content-strong)",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                />
              );
            }
            if (b.type === "li") {
              return (
                <div key={b.id} className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-3 shrink-0"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 9999,
                      background: "var(--ds-theme-content-muted)",
                    }}
                  />
                  <textarea {...common} placeholder="Item da lista" rows={1} />
                </div>
              );
            }
            return (
              <textarea
                key={b.id}
                {...common}
                placeholder="Escreva um parágrafo…"
                rows={3}
              />
            );
          })}
        </div>

        {/* Backlinks */}
        {backlinks.length > 0 && (
          <section
            aria-label="Backlinks"
            className="mt-4 flex flex-col gap-2 p-4"
            style={{
              borderRadius: 16,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px dashed var(--ds-theme-border-subtle)",
            }}
          >
            <p
              className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--ds-theme-content-subtle)" }}
            >
              Backlinks
            </p>
            <ul className="flex flex-col gap-1">
              {backlinks.map(([id, d]) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onOpenDoc(id)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium"
                    style={{ color: "var(--ds-theme-intent-accent-fill)" }}
                  >
                    <Link2 size={12} aria-hidden />
                    {d.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <InsertMediaModal
        open={insertOpen}
        onOpenChange={setInsertOpen}
        onPick={(name) => toast.success(`Inserido: ${name} (mock)`)}
      />
    </EditorChrome>
  );
}

function BlockBtn({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold"
      style={{
        padding: "6px 12px",
        borderRadius: 9999,
        background: "transparent",
        color: "var(--ds-theme-content-default)",
      }}
    >
      {icon}
      {label}
    </button>
  );
}