import { useState } from "react";
import {
  Crop,
  SunMedium,
  Sparkles,
  Wand2,
  Scissors,
  Music,
  Video,
  Image as ImageIcon,
  Volume2,
  Lock,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EditorChrome } from "./EditorChrome";

type Tab = "image" | "video" | "audio";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "image", label: "Imagem", icon: <ImageIcon size={14} aria-hidden /> },
  { key: "video", label: "Vídeo", icon: <Video size={14} aria-hidden /> },
  { key: "audio", label: "Áudio", icon: <Music size={14} aria-hidden /> },
];

const actionsFor: Record<Tab, { label: string; icon: React.ReactNode }[]> = {
  image: [
    { label: "Recortar", icon: <Crop size={14} aria-hidden /> },
    { label: "Brilho", icon: <SunMedium size={14} aria-hidden /> },
  ],
  video: [
    { label: "Recortar", icon: <Scissors size={14} aria-hidden /> },
    { label: "Volume", icon: <Volume2 size={14} aria-hidden /> },
  ],
  audio: [
    { label: "Aparar", icon: <Scissors size={14} aria-hidden /> },
    { label: "Volume", icon: <Volume2 size={14} aria-hidden /> },
  ],
};

export function MediaEditor({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>("image");
  const [saveSignal] = useState<string>("");

  return (
    <EditorChrome
      documentId={documentId}
      onClose={onClose}
      saveSignal={saveSignal}
      allowedFormats={["pdf"]}
    >
      <div className="flex h-full min-h-0 flex-col lg:flex-row">
        {/* Canvas central */}
        <div className="flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-6">
          {/* Tabs por tipo */}
          <nav
            aria-label="Tipo de mídia"
            className="flex items-center gap-1 p-1"
            style={{
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
              width: "fit-content",
            }}
          >
            {tabs.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  aria-current={active ? "page" : undefined}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 9999,
                    background: active
                      ? "var(--ds-theme-intent-accent-fill)"
                      : "transparent",
                    color: active
                      ? "var(--ds-theme-intent-accent-on-fill)"
                      : "var(--ds-theme-content-default)",
                  }}
                >
                  {t.icon}
                  {t.label}
                </button>
              );
            })}
          </nav>

          {/* Preview placeholder */}
          <div
            className="grid flex-1 place-items-center"
            style={{
              minHeight: 260,
              borderRadius: 16,
              background:
                "repeating-conic-gradient(var(--ds-theme-surface-subdued) 0deg 90deg, var(--ds-theme-surface-default) 90deg 180deg)",
              backgroundSize: "24px 24px",
              border: "1px dashed var(--ds-theme-border-subtle)",
            }}
          >
            <div
              className="flex flex-col items-center gap-2 p-6 text-center"
              style={{
                borderRadius: 12,
                background: "var(--ds-theme-surface-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
                color: "var(--ds-theme-content-muted)",
              }}
            >
              {tabs.find((t) => t.key === tab)?.icon}
              <p className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                Pré-visualização de {tabs.find((t) => t.key === tab)?.label.toLowerCase()}
              </p>
              <p className="text-xs">Área de preview do editor (mock).</p>
            </div>
          </div>
        </div>

        {/* Painel lateral de ações */}
        <aside
          aria-label="Ações do editor"
          className="flex shrink-0 flex-col gap-4 p-4 sm:p-6 lg:w-72"
          style={{
            background: "var(--ds-theme-surface-subdued)",
            borderLeft: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <section>
            <p
              className="mb-2 text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: "var(--ds-theme-content-subtle)" }}
            >
              Ações
            </p>
            <ul className="flex flex-col gap-2">
              {actionsFor[tab].map((a) => (
                <li key={a.label}>
                  <button
                    type="button"
                    onClick={() => {
                      /* no-op placeholder */
                    }}
                    className="flex w-full items-center gap-2 text-sm"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "var(--ds-theme-surface-default)",
                      color: "var(--ds-theme-content-default)",
                      border: "1px solid var(--ds-theme-border-subtle)",
                    }}
                  >
                    {a.icon}
                    {a.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Ações de IA — placeholder desabilitado */}
          <section
            aria-label="Ações de IA (em breve)"
            className="flex flex-col gap-2 p-3"
            style={{
              borderRadius: 14,
              background: "var(--ds-theme-surface-default)",
              border: "1px dashed var(--ds-theme-intent-accent-fill)",
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={14} aria-hidden style={{ color: "var(--ds-theme-intent-accent-fill)" }} />
              <span
                className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: "var(--ds-theme-intent-accent-fill)" }}
              >
                Ações de IA
              </span>
              <span
                className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold"
                style={{
                  padding: "2px 8px",
                  borderRadius: 9999,
                  background: "var(--ds-theme-intent-accent-subtle)",
                  color: "var(--ds-theme-intent-accent-on-subtle)",
                }}
              >
                <Lock size={10} aria-hidden /> em breve
              </span>
            </div>
            <TooltipProvider delayDuration={150}>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Remover fundo", icon: <Wand2 size={14} aria-hidden /> },
                  { label: "Aumentar resolução", icon: <Sparkles size={14} aria-hidden /> },
                  { label: "Gerar variação", icon: <Wand2 size={14} aria-hidden /> },
                ].map((a) => (
                  <Tooltip key={a.label}>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="flex w-full items-center gap-2 text-sm"
                        style={{
                          padding: "10px 12px",
                          borderRadius: 10,
                          background: "var(--ds-theme-surface-subdued)",
                          color: "var(--ds-theme-content-muted)",
                          border: "1px solid var(--ds-theme-border-subtle)",
                          cursor: "not-allowed",
                          opacity: 0.75,
                        }}
                      >
                        {a.icon}
                        {a.label}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="text-xs">
                      IA de edição — em breve
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
          </section>
        </aside>
      </div>
    </EditorChrome>
  );
}