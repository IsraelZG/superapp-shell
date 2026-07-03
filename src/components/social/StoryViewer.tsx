import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useRow, store } from "@/store/hooks";
import { Avatar } from "./Avatar";
import { isExpired, relTime } from "./utils";

const DURATION_MS = 5000;

export function StoryViewer({
  storyId,
  allIds,
  onClose,
  onChange,
}: {
  storyId: string;
  allIds: string[];
  onClose: () => void;
  onChange: (id: string) => void;
}) {
  const s = useRow("stories", storyId) as {
    authorName?: string;
    createdAt?: string;
    expiresAt?: string;
    mediaUrl?: string;
  };
  const expired = isExpired(s.expiresAt ?? "");
  const [progress, setProgress] = useState(0);

  // Marca como visto ao abrir (só se não expirado — expirados não são "vistos")
  useEffect(() => {
    if (!expired) store.setCell("stories", storyId, "viewed", true);
  }, [storyId, expired]);

  // Auto-avanço com barra de progresso (pausa se expirado)
  useEffect(() => {
    if (expired) return;
    setProgress(0);
    const start = Date.now();
    const tick = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / DURATION_MS);
      setProgress(p);
      if (p >= 1) {
        clearInterval(tick);
        const i = allIds.indexOf(storyId);
        if (i >= 0 && i < allIds.length - 1) onChange(allIds[i + 1]);
        else onClose();
      }
    }, 60);
    return () => clearInterval(tick);
  }, [storyId, expired, allIds, onChange, onClose]);

  // Esc fecha
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        const i = allIds.indexOf(storyId);
        if (i < allIds.length - 1) onChange(allIds[i + 1]);
      }
      if (e.key === "ArrowLeft") {
        const i = allIds.indexOf(storyId);
        if (i > 0) onChange(allIds[i - 1]);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [storyId, allIds, onClose, onChange]);

  const idx = allIds.indexOf(storyId);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Story de ${s.authorName ?? ""}`}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <div
        className="relative flex h-full max-h-[900px] w-full max-w-[420px] flex-col overflow-hidden"
        style={{
          background: "var(--ds-theme-surface-default)",
          borderRadius: "var(--ds-component-card-radius, 20px)",
          margin: 12,
        }}
      >
        {/* Barras de progresso */}
        <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
          {allIds.map((id) => (
            <div
              key={id}
              className="h-1 flex-1 overflow-hidden"
              style={{ borderRadius: 999, background: "rgba(255,255,255,0.3)" }}
            >
              <div
                style={{
                  height: "100%",
                  background: "rgba(255,255,255,0.95)",
                  width: id === storyId ? `${progress * 100}%` : allIds.indexOf(id) < idx ? "100%" : "0%",
                  transition: id === storyId ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute inset-x-3 top-8 z-10 flex items-center gap-2">
          <Avatar name={s.authorName ?? "?"} size={32} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold" style={{ color: "white" }}>
              {s.authorName}
            </div>
            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.7)" }}>
              {relTime(s.createdAt ?? "")}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar story"
            className="grid place-items-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: "rgba(0,0,0,0.3)",
              color: "white",
            }}
          >
            <X size={16} aria-hidden />
          </button>
        </div>

        {/* Conteúdo */}
        {expired ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div
              className="grid place-items-center"
              style={{
                width: 56,
                height: 56,
                borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-muted)",
              }}
            >
              <Clock size={24} aria-hidden />
            </div>
            <div className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              Este story expirou
            </div>
            <div className="max-w-xs text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
              Stories ficam disponíveis por 24h após a publicação. Peça para {s.authorName} republicar se quiser rever.
            </div>
          </div>
        ) : (
          <div
            className="grid h-full w-full place-items-center"
            style={{
              background: "linear-gradient(135deg, var(--ds-theme-intent-accent-subtle), var(--ds-theme-surface-subdued))",
              color: "var(--ds-theme-content-strong)",
            }}
          >
            <div className="p-8 text-center">
              <div className="text-3xl font-bold">{s.authorName}</div>
              <div className="mt-2 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
                Story mockup — mídia placeholder
              </div>
            </div>
          </div>
        )}

        {/* Áreas de tap laterais */}
        {!expired && (
          <>
            <button
              type="button"
              aria-label="Story anterior"
              onClick={() => idx > 0 && onChange(allIds[idx - 1])}
              className="absolute inset-y-0 left-0 flex w-1/3 items-center justify-start pl-2 opacity-0 transition-opacity hover:opacity-100"
              style={{ color: "white" }}
            >
              <ChevronLeft size={24} aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Próximo story"
              onClick={() => idx < allIds.length - 1 ? onChange(allIds[idx + 1]) : onClose()}
              className="absolute inset-y-0 right-0 flex w-1/3 items-center justify-end pr-2 opacity-0 transition-opacity hover:opacity-100"
              style={{ color: "white" }}
            >
              <ChevronRight size={24} aria-hidden />
            </button>
          </>
        )}
      </div>
    </div>
  );
}