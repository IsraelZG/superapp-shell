import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { EditorChrome } from "./EditorChrome";

type SlideRow = { documentId?: string; order?: number; title?: string; body?: string };

export function SlidesEditor({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const slidesTable = useTable("slides") as Record<string, SlideRow>;
  const [saveSignal, setSaveSignal] = useState<string>("");

  const slides = useMemo(() => {
    return Object.entries(slidesTable)
      .filter(([, s]) => s.documentId === documentId)
      .sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0));
  }, [slidesTable, documentId]);

  const [currentId, setCurrentId] = useState<string | null>(slides[0]?.[0] ?? null);
  const currentIndex = slides.findIndex(([id]) => id === currentId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const current = slides[safeIndex];

  const goto = (idx: number) => {
    if (idx < 0 || idx >= slides.length) return;
    setCurrentId(slides[idx][0]);
  };

  const updateField = (field: "title" | "body", value: string) => {
    if (!current) return;
    store.setCell("slides", current[0], field, value);
    store.setCell("documents", documentId, "updatedAt", new Date().toISOString());
    setSaveSignal(`${Date.now()}`);
  };

  const addSlide = () => {
    const nextOrder = (slides[slides.length - 1]?.[1].order ?? 0) + 1;
    const id = `sl_${documentId}_${Date.now()}`;
    store.setRow("slides", id, {
      documentId,
      order: nextOrder,
      title: "Novo slide",
      body: "",
    });
    setCurrentId(id);
    setSaveSignal(`${Date.now()}`);
  };

  const deleteSlide = () => {
    if (!current || slides.length <= 1) return;
    const idxBefore = safeIndex;
    store.delRow("slides", current[0]);
    const nextIdx = Math.max(0, idxBefore - 1);
    setCurrentId(slides[nextIdx === idxBefore ? idxBefore + 1 : nextIdx]?.[0] ?? null);
    setSaveSignal(`${Date.now()}`);
  };

  return (
    <EditorChrome
      documentId={documentId}
      onClose={onClose}
      saveSignal={saveSignal}
      allowedFormats={["pdf", "pptx"]}
    >
      <div className="flex h-full min-h-0 flex-col md:flex-row">
        {/* Sidebar de miniaturas */}
        <aside
          aria-label="Miniaturas dos slides"
          className="flex shrink-0 flex-row gap-2 overflow-x-auto p-3 md:h-full md:w-52 md:flex-col md:overflow-y-auto"
          style={{
            background: "var(--ds-theme-surface-subdued)",
            borderRight: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          {slides.map(([id, s], i) => {
            const active = id === current?.[0];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setCurrentId(id)}
                aria-current={active ? "true" : undefined}
                className="flex shrink-0 flex-col gap-1 p-2 text-left"
                style={{
                  minWidth: 140,
                  borderRadius: 10,
                  background: "var(--ds-theme-surface-default)",
                  border: `2px solid ${active ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-border-subtle)"}`,
                }}
              >
                <span
                  className="text-[10px] font-bold uppercase tabular-nums"
                  style={{ color: "var(--ds-theme-content-muted)" }}
                >
                  Slide {i + 1}
                </span>
                <span
                  className="line-clamp-2 text-[11px] font-semibold"
                  style={{ color: "var(--ds-theme-content-strong)" }}
                >
                  {s.title || "Sem título"}
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={addSlide}
            className="flex shrink-0 items-center justify-center gap-1 text-xs font-semibold"
            style={{
              minWidth: 140,
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--ds-theme-intent-accent-subtle)",
              color: "var(--ds-theme-intent-accent-on-subtle)",
              border: "1px dashed var(--ds-theme-border-subtle)",
            }}
          >
            <Plus size={12} aria-hidden /> Novo slide
          </button>
        </aside>

        {/* Slide atual */}
        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
          {current ? (
            <>
              <div
                className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 p-8"
                style={{
                  aspectRatio: "16 / 9",
                  background: "var(--ds-theme-surface-default)",
                  borderRadius: 16,
                  border: "1px solid var(--ds-theme-border-subtle)",
                  boxShadow: "var(--ds-component-card-shadow)",
                }}
              >
                <input
                  aria-label="Título do slide"
                  value={current[1].title ?? ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Título do slide"
                  className="w-full bg-transparent text-3xl font-bold outline-none"
                  style={{ color: "var(--ds-theme-content-strong)" }}
                />
                <textarea
                  aria-label="Corpo do slide"
                  value={current[1].body ?? ""}
                  onChange={(e) => updateField("body", e.target.value)}
                  placeholder="Adicione o conteúdo do slide…"
                  rows={8}
                  className="w-full flex-1 resize-none bg-transparent text-base outline-none"
                  style={{ color: "var(--ds-theme-content-default)" }}
                />
              </div>

              {/* Nav */}
              <div className="mx-auto mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goto(safeIndex - 1)}
                  disabled={safeIndex === 0}
                  aria-label="Slide anterior"
                  className="grid place-items-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-default)",
                    opacity: safeIndex === 0 ? 0.4 : 1,
                  }}
                >
                  <ChevronLeft size={16} aria-hidden />
                </button>
                <span
                  className="text-xs tabular-nums"
                  style={{ color: "var(--ds-theme-content-muted)" }}
                >
                  {safeIndex + 1} / {slides.length}
                </span>
                <button
                  type="button"
                  onClick={() => goto(safeIndex + 1)}
                  disabled={safeIndex >= slides.length - 1}
                  aria-label="Próximo slide"
                  className="grid place-items-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-default)",
                    opacity: safeIndex >= slides.length - 1 ? 0.4 : 1,
                  }}
                >
                  <ChevronRight size={16} aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={deleteSlide}
                  disabled={slides.length <= 1}
                  aria-label="Excluir slide"
                  className="ml-2 grid place-items-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-muted)",
                    opacity: slides.length <= 1 ? 0.4 : 1,
                  }}
                >
                  <Trash2 size={14} aria-hidden />
                </button>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center">
              <button
                type="button"
                onClick={addSlide}
                className="text-xs font-semibold"
                style={{
                  padding: "10px 16px",
                  borderRadius: 9999,
                  background: "var(--ds-theme-intent-accent-fill)",
                  color: "var(--ds-theme-intent-accent-on-fill)",
                }}
              >
                Criar primeiro slide
              </button>
            </div>
          )}
        </div>
      </div>
    </EditorChrome>
  );
}