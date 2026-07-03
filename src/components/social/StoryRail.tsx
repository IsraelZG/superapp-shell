import { Plus } from "lucide-react";
import { useTable } from "@/store/hooks";
import { Avatar } from "./Avatar";
import { isExpired } from "./utils";

export function StoryRail({
  onOpen,
  onCompose,
}: {
  onOpen: (id: string) => void;
  onCompose: () => void;
}) {
  const stories = useTable("stories") as Record<
    string,
    { authorName?: string; expiresAt?: string; viewed?: boolean }
  >;
  const ids = Object.keys(stories);

  return (
    <div
      className="flex items-center gap-3 overflow-x-auto p-3"
      style={{
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
        borderRadius: "var(--ds-component-card-radius, 20px)",
      }}
      role="list"
      aria-label="Stories"
    >
      <button
        type="button"
        onClick={onCompose}
        className="flex shrink-0 flex-col items-center gap-1"
        aria-label="Criar novo story"
      >
        <div
          className="relative grid place-items-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            border: "2px dashed var(--ds-theme-border-subtle)",
            color: "var(--ds-theme-content-muted)",
          }}
        >
          <Plus size={20} aria-hidden />
        </div>
        <span className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>Seu story</span>
      </button>
      {ids.map((id) => {
        const s = stories[id];
        const expired = isExpired(s.expiresAt ?? "");
        const viewed = !!s.viewed;
        const ring = expired
          ? "var(--ds-theme-border-subtle)"
          : viewed
            ? "var(--ds-theme-content-subtle)"
            : "var(--ds-theme-intent-accent-fill)";
        return (
          <button
            key={id}
            type="button"
            onClick={() => onOpen(id)}
            className="flex shrink-0 flex-col items-center gap-1"
            role="listitem"
            aria-label={`Story de ${s.authorName}${expired ? " (expirado)" : ""}`}
          >
            <div
              className="grid place-items-center"
              style={{
                width: 60,
                height: 60,
                borderRadius: 9999,
                padding: 2,
                background: ring,
                opacity: expired ? 0.55 : 1,
              }}
            >
              <div
                className="grid h-full w-full place-items-center"
                style={{ borderRadius: 9999, background: "var(--ds-theme-surface-default)", padding: 2 }}
              >
                <Avatar name={s.authorName ?? "?"} size={52} />
              </div>
            </div>
            <span
              className="max-w-[68px] truncate text-[11px]"
              style={{ color: expired ? "var(--ds-theme-content-subtle)" : "var(--ds-theme-content-muted)" }}
            >
              {expired ? "expirado" : s.authorName}
            </span>
          </button>
        );
      })}
    </div>
  );
}