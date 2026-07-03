import { useMemo, useState } from "react";
import { useTable, useRowIds, store } from "@/store/hooks";
import { Plus } from "lucide-react";
import { EmptyState, PendingBadge, DoneBadge } from "@/components/catalog/States";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fmtDuration, fmtViews, fmtDate } from "./utils";

export function CreatorStudio({
  myChannelId,
  onOpenVideo,
}: {
  myChannelId: string;
  onOpenVideo: (id: string) => void;
}) {
  const videos = useTable("videos") as Record<string, any>;
  const channels = useTable("channels") as Record<string, any>;
  const videoIds = useRowIds("videos") as string[];
  const channel = channels[myChannelId];
  const mine = useMemo(
    () => videoIds.filter((id) => videos[id]?.channelId === myChannelId),
    [videoIds, videos, myChannelId],
  );
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("video.mp4");

  const publish = (newTitle: string) => {
    const id = `v_${Date.now()}`;
    store.setRow("videos", id, {
      channelId: myChannelId,
      title: newTitle,
      thumbnailLabel: newTitle.slice(0, 3).toUpperCase(),
      durationSec: 600,
      views: 0,
      publishedAt: new Date().toISOString(),
      kind: "vod",
      renditionStatus: "processando",
      hasSeeder: true,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <header
        className="flex flex-wrap items-center justify-between gap-2 p-4"
        style={{
          borderRadius: "var(--ds-component-card-radius, 20px)",
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>Meu canal</p>
          <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{channel?.name ?? "—"}</h3>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{
            padding: "8px 14px", borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          <Plus size={14} aria-hidden />
          Publicar novo vídeo
        </button>
      </header>

      {mine.length === 0 ? (
        <EmptyState title="Nenhum vídeo publicado" description="Publique seu primeiro vídeo para vê-lo aqui." />
      ) : (
        <ul className="flex flex-col gap-2" role="list">
          {mine.map((id) => {
            const v = videos[id];
            const processing = v.renditionStatus === "processando";
            return (
              <li
                key={id}
                className="flex flex-wrap items-center gap-3 p-3"
                style={{
                  borderRadius: 16,
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <div
                  className="grid place-items-center text-sm font-bold"
                  style={{
                    width: 88, height: 56, borderRadius: 12,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-subtle)",
                  }}
                  aria-hidden
                >
                  {v.thumbnailLabel}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{v.title}</div>
                  <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {fmtDate(v.publishedAt)} · {fmtDuration(v.durationSec)} · {fmtViews(v.views)} views
                  </div>
                </div>
                {processing ? <PendingBadge label="Processando" /> : <DoneBadge label="Pronto" />}
                <button
                  type="button"
                  onClick={() => onOpenVideo(id)}
                  disabled={processing}
                  className="text-xs font-semibold disabled:opacity-40"
                  style={{
                    padding: "6px 12px", borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-strong)",
                    border: "1px solid var(--ds-theme-border-subtle)",
                  }}
                >
                  Abrir
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publicar novo vídeo</DialogTitle>
            <DialogDescription>Sandbox — nenhum arquivo real é enviado.</DialogDescription>
          </DialogHeader>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!title.trim()) return;
              publish(title.trim());
              setTitle("");
              setFile("video.mp4");
              setOpen(false);
            }}
          >
            <div className="flex flex-col gap-1">
              <Label htmlFor="pv-title">Título</Label>
              <Input id="pv-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="pv-file">Arquivo (mock)</Label>
              <Input id="pv-file" value={file} onChange={(e) => setFile(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Publicar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}