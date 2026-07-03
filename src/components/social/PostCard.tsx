import { useState } from "react";
import { Heart, MessageCircle, Share2, Globe, Users, Lock, Sparkles, Image as ImageIcon } from "lucide-react";
import { useRow, store } from "@/store/hooks";
import { OverflowMenu } from "@/components/catalog/Menus";
import { DestructiveModal, FormModal } from "@/components/catalog/Modals";
import { toast } from "sonner";
import { Avatar } from "./Avatar";
import { relTime, visibilityLabel } from "./utils";

const visIcon: Record<string, React.ReactNode> = {
  public: <Globe size={11} aria-hidden />,
  connections: <Users size={11} aria-hidden />,
  private: <Lock size={11} aria-hidden />,
};

export function PostCard({ id, onOpenProfile }: { id: string; onOpenProfile?: (authorId: string) => void }) {
  const row = useRow("posts", id) as {
    authorId?: string;
    authorName?: string;
    text?: string;
    imageUrl?: string;
    createdAt?: string;
    likes?: number;
    comments?: number;
    visibility?: string;
    isAd?: boolean;
  };
  const [liked, setLiked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);

  if (!row.authorName) return null;
  const isAd = !!row.isAd;
  const vis = (row.visibility as string) ?? "public";

  const toggleLike = () => {
    const cur = (row.likes as number) ?? 0;
    const next = liked ? cur - 1 : cur + 1;
    store.setCell("posts", id, "likes", next);
    setLiked((v) => !v);
  };

  return (
    <article
      className="flex flex-col gap-3 p-4"
      style={{
        background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
        border: "1px solid var(--ds-theme-border-subtle)",
        borderRadius: "var(--ds-component-card-radius, 20px)",
        boxShadow: "var(--ds-component-card-shadow)",
      }}
      aria-label={isAd ? "Publicação patrocinada" : "Publicação"}
    >
      <header className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => row.authorId && onOpenProfile?.(row.authorId)}
          className="flex items-center gap-3 text-left"
        >
          <Avatar name={row.authorName} size={40} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                {row.authorName}
              </span>
              {isAd && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    padding: "2px 8px",
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-muted)",
                    border: "1px solid var(--ds-theme-border-subtle)",
                  }}
                >
                  <Sparkles size={10} aria-hidden /> Patrocinado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
              <span>{relTime(row.createdAt ?? "")}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1" aria-label={`Visibilidade: ${visibilityLabel[vis]}`}>
                {visIcon[vis]} {visibilityLabel[vis]}
              </span>
            </div>
          </div>
        </button>
        <div className="ml-auto">
          <OverflowMenu
            items={[
              { label: "Compartilhar", onSelect: () => toast("Link copiado (mock)") },
              { label: "Denunciar", onSelect: () => setReportOpen(true) },
              { label: "Bloquear autor", onSelect: () => setBlockOpen(true) },
            ]}
          />
        </div>
      </header>

      {row.text && (
        <p className="text-sm leading-relaxed" style={{ color: "var(--ds-theme-content-default)" }}>
          {row.text}
        </p>
      )}

      <div
        className="grid aspect-video w-full place-items-center overflow-hidden"
        style={{
          borderRadius: 16,
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-subtle)",
        }}
        aria-label={row.imageUrl ? "Imagem do post" : "Placeholder de imagem"}
      >
        {row.imageUrl ? (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img src={row.imageUrl as string} className="h-full w-full object-cover" alt="" />
        ) : (
          <ImageIcon size={28} aria-hidden />
        )}
      </div>

      <footer className="flex items-center gap-1 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? "Descurtir" : "Curtir"}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-colors"
          style={{
            borderRadius: 9999,
            background: liked ? "var(--ds-theme-intent-accent-subtle)" : "transparent",
            color: liked ? "var(--ds-theme-intent-accent-on-subtle)" : "var(--ds-theme-content-muted)",
          }}
        >
          <Heart size={14} fill={liked ? "currentColor" : "none"} aria-hidden />
          <span className="tabular-nums">{(row.likes as number) ?? 0}</span>
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5"
          style={{ borderRadius: 9999, color: "var(--ds-theme-content-muted)" }}
          onClick={() => toast("Painel de comentários (mock)")}
        >
          <MessageCircle size={14} aria-hidden />
          <span className="tabular-nums">{(row.comments as number) ?? 0}</span>
        </button>
        <button
          type="button"
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5"
          style={{ borderRadius: 9999, color: "var(--ds-theme-content-muted)" }}
          onClick={() => toast("Compartilhado (mock)")}
          aria-label="Compartilhar"
        >
          <Share2 size={14} aria-hidden />
        </button>
      </footer>

      <FormModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        onSubmit={(d) => toast.success(`Denúncia enviada (motivo: ${d.name})`)}
      />
      <DestructiveModal
        open={blockOpen}
        onOpenChange={setBlockOpen}
        title={`Bloquear ${row.authorName}?`}
        description="Você não verá mais publicações desta pessoa. Ela também deixará de ver as suas."
        onConfirm={() => toast.error(`${row.authorName} bloqueado (mock)`)}
      />
    </article>
  );
}