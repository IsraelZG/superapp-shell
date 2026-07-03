/**
 * B8 — Streaming (T-STR)
 *
 * Módulo renderizado na coluna central do shell FlexLayout (A1). Dados via
 * TinyBase (`@/store/hooks`); tokens `--ds-*` para toda cor/raio.
 *
 * Abas: Descobrir · Canal · Player (VOD/áudio) · Live · Estúdio do criador.
 * Live reusa o padrão visual do layout de chamada em `/mensagens/chamada`.
 */
import { useMemo, useState } from "react";
import { PlayCircle, Radio, Compass, Video, User } from "lucide-react";
import { useTable, useRowIds, useSetCellCallback, useSetRowCallback } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { VideoPlayer } from "./VideoPlayer";
import { ChannelPage } from "./ChannelPage";
import { LiveView } from "./LiveView";
import { CreatorStudio } from "./CreatorStudio";
import { TipModal } from "./TipModal";
import { fmtDuration, fmtViews } from "./utils";

type Tab = "descobrir" | "canal" | "player" | "live" | "estudio";

export function StreamingModule() {
  const [tab, setTab] = useState<Tab>("descobrir");
  const [selectedChannelId, setSelectedChannelId] = useState<string>("ch1");
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");
  const [tipOpen, setTipOpen] = useState(false);

  const channels = useTable("channels") as Record<string, any>;
  const videos = useTable("videos") as Record<string, any>;
  const videoIds = useRowIds("videos");

  const openVideo = (id: string) => {
    const v = videos[id];
    if (!v) return;
    setSelectedVideoId(id);
    setTab(v.kind === "live" ? "live" : "player");
  };

  const openChannel = (id: string) => {
    setSelectedChannelId(id);
    setTab("canal");
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "descobrir", label: "Descobrir", icon: <Compass size={14} aria-hidden /> },
    { key: "canal",     label: "Canal",     icon: <User size={14} aria-hidden /> },
    { key: "player",    label: "Player",    icon: <PlayCircle size={14} aria-hidden /> },
    { key: "live",      label: "Ao vivo",   icon: <Radio size={14} aria-hidden /> },
    { key: "estudio",   label: "Estúdio",   icon: <Video size={14} aria-hidden /> },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
        <header>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Módulo
          </p>
          <h2 className="flex items-center gap-2 text-2xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            <PlayCircle size={22} aria-hidden />
            Streaming
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
            Canais, VOD, transmissões ao vivo e estúdio do criador — dados locais via TinyBase.
          </p>
        </header>

        <nav
          aria-label="Áreas de streaming"
          className="flex flex-wrap items-center gap-1 p-1"
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
                  background: active ? "var(--ds-theme-intent-accent-fill)" : "transparent",
                  color: active ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-default)",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "descobrir" && (
          <DiscoverView
            channels={channels}
            videos={videos}
            videoIds={videoIds}
            onOpenVideo={openVideo}
            onOpenChannel={openChannel}
          />
        )}

        {tab === "canal" && (
          <ChannelPage
            channelId={selectedChannelId}
            onOpenVideo={openVideo}
            onSelectChannel={setSelectedChannelId}
            onTip={() => setTipOpen(true)}
          />
        )}

        {tab === "player" && (
          selectedVideoId && videos[selectedVideoId] ? (
            <VideoPlayer
              videoId={selectedVideoId}
              onTip={() => setTipOpen(true)}
              onOpenChannel={openChannel}
            />
          ) : (
            <EmptyState
              title="Nenhum vídeo selecionado"
              description="Escolha um vídeo em Descobrir ou na página de um canal."
            />
          )
        )}

        {tab === "live" && (
          <LiveView
            preferredVideoId={selectedVideoId}
            onEndedBecomeVod={(id) => { setSelectedVideoId(id); setTab("player"); }}
          />
        )}

        {tab === "estudio" && (
          <CreatorStudio myChannelId="ch1" onOpenVideo={openVideo} />
        )}

        <TipModal
          open={tipOpen}
          onOpenChange={setTipOpen}
          channelName={channels[selectedChannelId]?.name ?? ""}
        />
      </div>
    </div>
  );
}

function DiscoverView({
  channels,
  videos,
  videoIds,
  onOpenVideo,
  onOpenChannel,
}: {
  channels: Record<string, any>;
  videos: Record<string, any>;
  videoIds: readonly string[];
  onOpenVideo: (id: string) => void;
  onOpenChannel: (id: string) => void;
}) {
  const liveIds = useMemo(() => videoIds.filter((id) => videos[id]?.kind === "live"), [videoIds, videos]);
  const vodIds = useMemo(() => videoIds.filter((id) => videos[id]?.kind === "vod"), [videoIds, videos]);
  const channelIds = Object.keys(channels);

  return (
    <div className="flex flex-col gap-6">
      {liveIds.length > 0 && (
        <section>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            <Radio size={14} aria-hidden style={{ color: "var(--ds-theme-intent-accent-fill)" }} />
            Ao vivo agora
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveIds.map((id) => (
              <VideoCard key={id} videoId={id} video={videos[id]} channel={channels[videos[id].channelId]} onOpen={onOpenVideo} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>Canais em destaque</h3>
        <div className="flex flex-wrap gap-2">
          {channelIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onOpenChannel(id)}
              className="flex items-center gap-2 text-left text-xs"
              style={{
                padding: "8px 12px",
                borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)",
                border: "1px solid var(--ds-theme-border-subtle)",
                color: "var(--ds-theme-content-default)",
              }}
            >
              <span
                aria-hidden
                className="grid place-items-center text-[10px] font-bold"
                style={{
                  width: 24, height: 24, borderRadius: 9999,
                  background: "var(--ds-theme-intent-accent-subtle)",
                  color: "var(--ds-theme-intent-accent-on-subtle)",
                }}
              >
                {channels[id].avatarLabel}
              </span>
              <span className="font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{channels[id].name}</span>
              <span style={{ color: "var(--ds-theme-content-muted)" }}>
                {fmtViews(channels[id].subscribers)} inscritos
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>Vídeos recentes</h3>
        {vodIds.length === 0 ? (
          <EmptyState title="Sem vídeos" description="Nenhum vídeo publicado ainda." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vodIds.map((id) => (
              <VideoCard key={id} videoId={id} video={videos[id]} channel={channels[videos[id].channelId]} onOpen={onOpenVideo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function VideoCard({
  videoId,
  video,
  channel,
  onOpen,
}: {
  videoId: string;
  video: any;
  channel: any;
  onOpen: (id: string) => void;
}) {
  const processing = video.renditionStatus === "processando";
  const isLive = video.kind === "live";
  return (
    <button
      type="button"
      onClick={() => onOpen(videoId)}
      className="flex flex-col text-left transition-transform hover:-translate-y-0.5"
      style={{
        borderRadius: "var(--ds-component-card-radius, 20px)",
        background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
        border: "1px solid var(--ds-theme-border-subtle)",
        overflow: "hidden",
      }}
      aria-label={`Abrir vídeo ${video.title}`}
    >
      <div
        className="relative grid place-items-center"
        style={{
          aspectRatio: "16 / 9",
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-muted)",
        }}
      >
        <span className="text-3xl font-bold" style={{ color: "var(--ds-theme-content-subtle)" }}>{video.thumbnailLabel}</span>
        {processing && (
          <div
            className="absolute inset-0 grid place-items-center text-xs font-semibold"
            style={{ background: "color-mix(in oklab, var(--ds-theme-surface-canvas) 70%, transparent)", color: "var(--ds-theme-content-strong)" }}
            role="status"
          >
            Processando…
          </div>
        )}
        {isLive && !processing && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase"
            style={{
              padding: "2px 8px", borderRadius: 9999,
              background: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))",
              color: "var(--ds-theme-intent-danger-on-fill, var(--ds-theme-intent-accent-on-fill))",
            }}
          >
            <span aria-hidden className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            ao vivo
          </span>
        )}
        {!isLive && !processing && (
          <span
            className="absolute bottom-2 right-2 text-[10px] font-semibold"
            style={{ padding: "2px 6px", borderRadius: 6, background: "var(--ds-theme-surface-default)", color: "var(--ds-theme-content-strong)" }}
          >
            {fmtDuration(video.durationSec)}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{video.title}</div>
        <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          {channel?.name ?? "Canal"} · {fmtViews(video.views)} views
        </div>
      </div>
    </button>
  );
}