import { useMemo, useState } from "react";
import { useRow, useTable, useRowIds, useSetCellCallback } from "@/store/hooks";
import { Mic, MicOff, Video as VideoIcon, VideoOff, LogOut, Users, Radio, Send } from "lucide-react";
import { EmptyState } from "@/components/catalog/States";
import { ConfirmModal } from "@/components/catalog/Modals";

/**
 * Transmissão ao vivo — reusa o padrão visual do layout de chamada
 * (`/mensagens/chamada`, modo "one-on-one"). "Encerrar transmissão" muda
 * `kind` do vídeo para `vod` (live encerrada→VOD).
 */
export function LiveView({
  preferredVideoId,
  onEndedBecomeVod,
}: {
  preferredVideoId?: string;
  onEndedBecomeVod: (id: string) => void;
}) {
  const videos = useTable("videos") as Record<string, any>;
  const videoIds = useRowIds("videos") as string[];
  const liveIds = useMemo(() => videoIds.filter((id) => videos[id]?.kind === "live"), [videoIds, videos]);
  const videoId = preferredVideoId && videos[preferredVideoId]?.kind === "live" ? preferredVideoId : liveIds[0];

  const video = useRow("videos", videoId ?? "") as any;
  const channels = useTable("channels") as Record<string, any>;
  const channel = video ? channels[video.channelId] : null;
  const chat = useTable("liveChat") as Record<string, any>;
  const chatIds = Object.keys(chat).filter((id) => chat[id].videoId === videoId);

  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [viewers, setViewers] = useState<number>(video?.views ?? 0);
  const [msg, setMsg] = useState("");
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [ended, setEnded] = useState(false);

  const setKind = useSetCellCallback(
    "videos",
    () => videoId ?? "",
    "kind",
    () => "vod" as const,
    [videoId],
  );

  if (!videoId || !video) {
    return <EmptyState title="Nenhuma transmissão ao vivo" description="Volte ao Descobrir para encontrar uma live ativa." />;
  }

  if (ended) {
    return (
      <div
        role="status"
        className="mx-auto flex max-w-md flex-col items-center gap-2 p-6 text-center"
        style={{
          borderRadius: "var(--ds-component-card-radius, 24px)",
          background: "var(--ds-theme-surface-subdued)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Transmissão encerrada
        </div>
        <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Este vídeo agora está disponível como VOD.
        </div>
        <button
          type="button"
          onClick={() => onEndedBecomeVod(videoId)}
          className="mt-2 text-xs font-semibold"
          style={{
            padding: "8px 16px", borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          Abrir como VOD
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <div className="flex flex-1 flex-col gap-3">
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "16 / 9",
            borderRadius: "var(--ds-component-card-radius, 20px)",
            background: "#000",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
          aria-label={`Transmissão ao vivo: ${video.title}`}
        >
          <div className="absolute inset-0 grid place-items-center" style={{ color: "rgba(255,255,255,0.4)" }}>
            <span className="text-6xl font-bold">{video.thumbnailLabel}</span>
          </div>
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase"
            style={{
              padding: "4px 10px", borderRadius: 9999,
              background: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))",
              color: "var(--ds-theme-intent-danger-on-fill, var(--ds-theme-intent-accent-on-fill))",
            }}
          >
            <Radio size={12} aria-hidden />
            ao vivo
          </span>
          <span
            className="absolute right-3 top-3 inline-flex items-center gap-1 text-[11px] font-semibold"
            style={{ padding: "4px 10px", borderRadius: 9999, background: "rgba(0,0,0,0.6)", color: "#fff" }}
          >
            <Users size={12} aria-hidden />
            {viewers} espectadores
          </span>
        </div>

        <div
          className="flex flex-col gap-2 p-3"
          style={{
            borderRadius: "var(--ds-component-card-radius, 20px)",
            background: "var(--ds-theme-surface-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{video.title}</h3>
              {channel && (
                <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{channel.name}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setViewers((v) => v + 1)}
              className="text-[11px] font-semibold"
              style={{
                padding: "4px 10px", borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-muted)",
                border: "1px dashed var(--ds-theme-border-subtle)",
              }}
              title="Demonstra atualização do contador de espectadores"
            >
              +1 espectador
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <ChipBtn label={mic ? "Silenciar" : "Ativar mic"} onClick={() => setMic((v) => !v)}>
              {mic ? <Mic size={16} /> : <MicOff size={16} />}
            </ChipBtn>
            <ChipBtn label={cam ? "Desligar câmera" : "Ligar câmera"} onClick={() => setCam((v) => !v)}>
              {cam ? <VideoIcon size={16} /> : <VideoOff size={16} />}
            </ChipBtn>
            <ChipBtn label="Sair da live" intent="danger" onClick={() => setConfirmEnd(true)}>
              <LogOut size={16} />
            </ChipBtn>
          </div>
        </div>
      </div>

      <aside
        className="flex w-full flex-col lg:w-80"
        style={{
          borderRadius: "var(--ds-component-card-radius, 20px)",
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
          maxHeight: 480,
        }}
        aria-label="Chat da transmissão"
      >
        <header
          className="px-3 py-2 text-xs font-semibold"
          style={{ borderBottom: "1px solid var(--ds-theme-border-subtle)", color: "var(--ds-theme-content-strong)" }}
        >
          Chat ao vivo
        </header>
        <ul className="flex-1 space-y-2 overflow-y-auto p-3 text-xs">
          {chatIds.map((id) => (
            <li key={id}>
              <span className="font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{chat[id].author}</span>
              <span style={{ color: "var(--ds-theme-content-muted)" }}> · {chat[id].time}</span>
              <div style={{ color: "var(--ds-theme-content-default)" }}>{chat[id].text}</div>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2 border-t p-2"
          style={{ borderColor: "var(--ds-theme-border-subtle)" }}
          onSubmit={(e) => { e.preventDefault(); setMsg(""); }}
        >
          <label htmlFor="live-msg" className="sr-only">Mensagem</label>
          <input
            id="live-msg"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Diga algo…"
            className="flex-1 text-xs"
            style={{
              padding: "6px 10px", borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-strong)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          />
          <button
            type="submit"
            aria-label="Enviar"
            className="grid place-items-center"
            style={{
              width: 32, height: 32, borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            <Send size={14} />
          </button>
        </form>
      </aside>

      <ConfirmModal
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        title="Encerrar transmissão?"
        description="A live será encerrada e ficará disponível como VOD."
        confirmLabel="Encerrar"
        onConfirm={() => { setKind(); setEnded(true); }}
      />
    </div>
  );
}

function ChipBtn({
  label, onClick, intent = "neutral", children,
}: { label: string; onClick?: () => void; intent?: "neutral" | "danger"; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid place-items-center"
      style={{
        width: 44, height: 44, borderRadius: 9999,
        background: intent === "danger"
          ? "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))"
          : "var(--ds-theme-surface-subdued)",
        color: intent === "danger"
          ? "var(--ds-theme-intent-danger-on-fill, var(--ds-theme-intent-accent-on-fill))"
          : "var(--ds-theme-content-strong)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {children}
    </button>
  );
}