import { useSortedRowIds, useCell } from "@/store/hooks";

function ConversationRow({ id }: { id: string }) {
  const name = useCell("conversations", id, "name") as string;
  const preview = useCell("conversations", id, "preview") as string;
  const time = useCell("conversations", id, "time") as string;
  const unread = (useCell("conversations", id, "unread") as number) ?? 0;
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition-colors"
      style={{ color: "var(--ds-theme-content-default)" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ds-theme-surface-subdued)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div
        className="grid shrink-0 place-items-center text-xs font-semibold"
        style={{
          width: 40,
          height: 40,
          borderRadius: 9999,
          background: "var(--ds-component-avatar-fallback-bg)",
          color: "var(--ds-component-avatar-fallback-text)",
        }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            {name}
          </span>
          <span className="shrink-0 text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
            {time}
          </span>
        </div>
        <p className="truncate text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          {preview}
        </p>
      </div>
      {unread > 0 && (
        <span
          className="grid shrink-0 place-items-center text-[10px] font-bold"
          style={{
            minWidth: 20,
            height: 20,
            padding: "0 6px",
            borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          {unread}
        </span>
      )}
    </button>
  );
}

export function Messaging({ onCompose }: { onCompose?: () => void }) {
  const ids = useSortedRowIds("conversations", "order");
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Comunicações
          </p>
          <h3 className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Mensagens
          </h3>
        </div>
        {onCompose && (
          <button
            type="button"
            onClick={onCompose}
            className="text-xs font-semibold transition-colors"
            style={{
              padding: "6px 12px",
              borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            Escrever email
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        <div className="flex flex-col gap-1">
          {ids.map((id) => (
            <ConversationRow key={id} id={id} />
          ))}
        </div>
      </div>
    </div>
  );
}