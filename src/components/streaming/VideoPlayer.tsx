import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize, Captions, HandCoins, User as UserIcon, WifiOff, Loader2,
} from "lucide-react";
import { useRow, useTable } from "@/store/hooks";
import { SyncingState } from "@/components/catalog/States";
import { fmtDuration, fmtViews, fmtDate } from "./utils";

type Quality = "auto" | "1080p" | "720p" | "480p";

/**
 * Player VOD (mockup) — sem reprodução real. Todos os controles são visuais;
 * a barra de progresso "avança" com um timer local quando `playing=true`.
 * Aceita variante `audioOnly` que troca a área de vídeo por waveform placeholder.
 */
export function VideoPlayer({
  videoId,
  audioOnly = false,
  onTip,
  onOpenChannel,
}: {
  videoId: string;
  audioOnly?: boolean;
  onTip?: () => void;
  onOpenChannel?: (channelId: string) => void;
}) {
  const video = useRow("videos", videoId) as any;
  const channels = useTable("channels") as Record<string, any>;
  const channel = video ? channels[video.channelId] : null;

  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // segundos
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [quality, setQuality] = useState<Quality>("auto");
  const [captions, setCaptions] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const duration = Math.max(1, video?.durationSec ?? 1);
  const processing = video?.renditionStatus === "processando";
  const noSeeder = video && video.hasSeeder === false;

  useEffect(() => {
    if (!playing || buffering || processing) return;
    const t = setInterval(() => {
      setProgress((p) => (p + 1 >= duration ? duration : p + 1));
    }, 1000);
    return () => clearInterval(t);
  }, [playing, buffering, processing, duration]);

  const seek = (clientX: number) => {
    const el = barRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setProgress(Math.floor(duration * ratio));
  };

  const simulateBuffering = () => {
    setBuffering(true);
    setTimeout(() => setBuffering(false), 1500);
  };

  if (!video) return null;

  return (
    <div className="flex flex-col gap-4">
      {/* Área de vídeo */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16 / 9",
          borderRadius: "var(--ds-component-card-radius, 20px)",
          background: "#000",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
        aria-label={`Player de vídeo: ${video.title}`}
      >
        {audioOnly ? (
          <div className="absolute inset-0 flex items-end gap-1 p-6">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                aria-hidden
                className={playing && !buffering ? "animate-pulse" : ""}
                style={{
                  flex: 1,
                  height: `${20 + Math.abs(Math.sin(i * 0.6)) * 60}%`,
                  background: "var(--ds-theme-intent-accent-fill)",
                  opacity: 0.7,
                  borderRadius: 4,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center" style={{ color: "rgba(255,255,255,0.5)" }}>
            <button
              type="button"
              aria-label={playing ? "Pausar" : "Reproduzir"}
              onClick={() => setPlaying((v) => !v)}
              className="grid place-items-center"
              style={{
                width: 96, height: 96, borderRadius: 9999,
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                backdropFilter: "blur(6px)",
              }}
              disabled={processing}
            >
              {playing ? <Pause size={40} /> : <Play size={40} />}
            </button>
          </div>
        )}

        {processing && (
          <div
            className="absolute inset-0 grid place-items-center text-sm font-semibold"
            style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}
            role="status"
          >
            Processando renditions… play indisponível
          </div>
        )}

        {buffering && !processing && (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{ background: "rgba(0,0,0,0.35)", color: "#fff" }}
            role="status"
            aria-label="Carregando"
          >
            <Loader2 size={40} className="animate-spin" />
          </div>
        )}

        {noSeeder && !processing && (
          <div className="absolute left-3 top-3">
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold"
              style={{
                padding: "4px 10px", borderRadius: 9999,
                background: "rgba(0,0,0,0.65)", color: "#fff",
              }}
            >
              <WifiOff size={12} aria-hidden />
              Sem seeder P2P
            </span>
          </div>
        )}
      </div>

      {/* Aviso "sem seeder" — reusa padrão SyncingState */}
      {noSeeder && !processing && (
        <SyncingState label="Nenhum seeder disponível no momento — tentando reconectar…" />
      )}

      {/* Controles */}
      <div
        className="flex flex-col gap-3 p-3"
        style={{
          borderRadius: "var(--ds-component-card-radius, 20px)",
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        {/* Barra de progresso */}
        <div className="flex items-center gap-3 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          <span aria-label="Tempo atual">{fmtDuration(progress)}</span>
          <div
            ref={barRef}
            role="slider"
            aria-label="Progresso"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={progress}
            tabIndex={0}
            onClick={(e) => seek(e.clientX)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") setProgress((p) => Math.min(duration, p + 5));
              if (e.key === "ArrowLeft")  setProgress((p) => Math.max(0, p - 5));
            }}
            className="relative h-2 flex-1 cursor-pointer"
            style={{ borderRadius: 9999, background: "var(--ds-theme-surface-subdued)" }}
          >
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${(progress / duration) * 100}%`,
                background: "var(--ds-theme-intent-accent-fill)",
                borderRadius: 9999,
              }}
            />
          </div>
          <span>{fmtDuration(duration)}</span>
        </div>

        {/* Botões */}
        <div className="flex flex-wrap items-center gap-2">
          <IconBtn label={playing ? "Pausar" : "Reproduzir"} onClick={() => setPlaying((v) => !v)} disabled={processing}>
            {playing ? <Pause size={16} /> : <Play size={16} />}
          </IconBtn>
          <IconBtn label={muted ? "Ativar som" : "Silenciar"} onClick={() => setMuted((v) => !v)}>
            {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </IconBtn>
          <input
            type="range"
            aria-label="Volume"
            min={0} max={1} step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => { setMuted(false); setVolume(parseFloat(e.target.value)); }}
            className="w-24"
          />

          <label className="ml-2 flex items-center gap-1 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Qualidade
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as Quality)}
              className="text-xs"
              style={{
                padding: "4px 8px", borderRadius: 8,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-strong)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
              aria-label="Selecionar qualidade"
            >
              <option value="auto">Auto</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setCaptions((v) => !v)}
            aria-pressed={captions}
            className="inline-flex items-center gap-1 text-xs font-semibold"
            style={{
              padding: "6px 10px", borderRadius: 9999,
              background: captions ? "var(--ds-theme-intent-accent-subtle)" : "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-strong)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <Captions size={14} aria-hidden />
            Legendas {captions ? "on" : "off"}
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={simulateBuffering}
              className="text-xs font-semibold"
              style={{
                padding: "6px 10px", borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-strong)",
                border: "1px dashed var(--ds-theme-border-subtle)",
              }}
              title="Demonstra o estado de buffering por ~1,5s"
            >
              Simular buffering
            </button>
            <IconBtn label={fullscreen ? "Sair de tela cheia" : "Tela cheia"} onClick={() => setFullscreen((v) => !v)}>
              <Maximize size={16} />
            </IconBtn>
          </div>
        </div>

        {captions && (
          <div
            className="mx-auto max-w-xl rounded-md px-3 py-1.5 text-center text-xs"
            style={{ background: "rgba(0,0,0,0.75)", color: "#fff" }}
            aria-live="polite"
          >
            [Legenda mock] …e é assim que os tokens semânticos se conectam ao tema.
          </div>
        )}
      </div>

      {/* Meta do vídeo */}
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{video.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          <span>{fmtViews(video.views)} views</span>
          <span>·</span>
          <span>{fmtDate(video.publishedAt)}</span>
        </div>
        {channel && (
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChannel?.(video.channelId)}
              className="flex items-center gap-2 text-left"
            >
              <span
                aria-hidden
                className="grid place-items-center text-xs font-bold"
                style={{
                  width: 36, height: 36, borderRadius: 9999,
                  background: "var(--ds-theme-intent-accent-subtle)",
                  color: "var(--ds-theme-intent-accent-on-subtle)",
                }}
              >
                {channel.avatarLabel}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{channel.name}</span>
                <span className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{fmtViews(channel.subscribers)} inscritos</span>
              </span>
            </button>
            <button
              type="button"
              onClick={onTip}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{
                padding: "8px 14px", borderRadius: 9999,
                background: "var(--ds-theme-intent-accent-fill)",
                color: "var(--ds-theme-intent-accent-on-fill)",
              }}
            >
              <HandCoins size={14} aria-hidden />
              Enviar gorjeta
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({
  label, onClick, disabled, children,
}: { label: string; onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
      className="grid place-items-center disabled:opacity-40"
      style={{
        width: 36, height: 36, borderRadius: 9999,
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-strong)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {children}
    </button>
  );
}