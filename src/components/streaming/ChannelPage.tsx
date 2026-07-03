import { useMemo } from "react";
import { useRow, useTable, useRowIds, useSetRowCallback, useDelRowCallback } from "@/store/hooks";
import { HandCoins, BellRing, Bell } from "lucide-react";
import { EmptyState } from "@/components/catalog/States";
import { VideoCard } from "./StreamingModule";
import { fmtViews } from "./utils";

export function ChannelPage({
  channelId,
  onOpenVideo,
  onSelectChannel,
  onTip,
}: {
  channelId: string;
  onOpenVideo: (id: string) => void;
  onSelectChannel: (id: string) => void;
  onTip: () => void;
}) {
  const channels = useTable("channels") as Record<string, any>;
  const channel = useRow("channels", channelId) as any;
  const videos = useTable("videos") as Record<string, any>;
  const videoIds = useRowIds("videos") as string[];
  const subs = useTable("subscriptions") as Record<string, any>;

  const subId = useMemo(() => {
    const entry = Object.entries(subs).find(([, s]) => (s as any).channelId === channelId);
    return entry?.[0];
  }, [subs, channelId]);
  const subscribed = Boolean(subId);

  const subscribe = useSetRowCallback(
    "subscriptions",
    (id: string) => id,
    () => ({ channelId, subscribedAt: new Date().toISOString() }),
    [channelId],
  );
  const unsubscribe = useDelRowCallback("subscriptions", (id: string) => id);

  const channelVideoIds = useMemo(
    () => videoIds.filter((id) => videos[id]?.channelId === channelId),
    [videoIds, videos, channelId],
  );

  if (!channel) {
    return <EmptyState title="Canal não encontrado" description="Selecione outro canal para continuar." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1">
        {Object.keys(channels).map((id) => {
          const active = id === channelId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectChannel(id)}
              className="text-xs font-semibold"
              style={{
                padding: "6px 12px",
                borderRadius: 9999,
                background: active ? "var(--ds-theme-intent-accent-subtle)" : "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-strong)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
              aria-current={active ? "page" : undefined}
            >
              {channels[id].name}
            </button>
          );
        })}
      </div>

      <header
        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
        style={{
          borderRadius: "var(--ds-component-card-radius, 20px)",
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <span
          aria-hidden
          className="grid shrink-0 place-items-center text-lg font-bold"
          style={{
            width: 72, height: 72, borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-subtle)",
            color: "var(--ds-theme-intent-accent-on-subtle)",
          }}
        >
          {channel.avatarLabel}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{channel.name}</h3>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            {fmtViews(channel.subscribers)} inscritos
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--ds-theme-content-default)" }}>{channel.description}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => (subscribed && subId ? unsubscribe(subId) : subscribe(`sub_${channelId}_${Date.now()}`))}
            aria-pressed={subscribed}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{
              padding: "8px 14px", borderRadius: 9999,
              background: subscribed ? "var(--ds-theme-surface-subdued)" : "var(--ds-theme-intent-accent-fill)",
              color: subscribed ? "var(--ds-theme-content-strong)" : "var(--ds-theme-intent-accent-on-fill)",
              border: subscribed ? "1px solid var(--ds-theme-border-subtle)" : "none",
            }}
          >
            {subscribed ? <BellRing size={14} aria-hidden /> : <Bell size={14} aria-hidden />}
            {subscribed ? "Inscrito" : "Inscrever-se"}
          </button>
          <button
            type="button"
            onClick={onTip}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{
              padding: "8px 14px", borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-strong)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <HandCoins size={14} aria-hidden />
            Gorjeta
          </button>
        </div>
      </header>

      {channelVideoIds.length === 0 ? (
        <EmptyState title="Sem vídeos" description="Este canal ainda não publicou nada." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {channelVideoIds.map((id) => (
            <VideoCard key={id} videoId={id} video={videos[id]} channel={channel} onOpen={onOpenVideo} />
          ))}
        </div>
      )}
    </div>
  );
}