import { useEffect, useMemo, useRef, useState, useCallback, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  useCell,
  useValue,
  useSortedRowIds,
  useTable,
  useSetCellCallback,
  store,
} from "@/store/hooks";
import { Paperclip, Send, Phone, Video, Sparkles, Check, CheckCheck, Loader2, WifiOff } from "lucide-react";

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="grid shrink-0 place-items-center text-xs font-semibold"
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        background: "var(--ds-component-avatar-fallback-bg)",
        color: "var(--ds-component-avatar-fallback-text)",
      }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "sending")
    return <Loader2 size={12} className="animate-spin" aria-label="enviando" />;
  if (status === "sent") return <Check size={12} aria-label="enviado" />;
  if (status === "delivered") return <CheckCheck size={12} aria-label="entregue" />;
  if (status === "read")
    return (
      <CheckCheck
        size={12}
        style={{ color: "var(--ds-theme-intent-accent-fill)" }}
        aria-label="lido"
      />
    );
  return null;
}

type MsgRow = {
  conversationId?: string;
  author?: string;
  authorType?: string;
  text?: string;
  time?: string;
  status?: string;
  order?: number;
};

function MessageBubble({
  msg,
  showAuthor,
}: {
  msg: MsgRow;
  showAuthor: boolean;
}) {
  const t = msg.authorType ?? "contact";
  if (t === "system") {
    return (
      <div className="flex justify-center py-1">
        <span
          className="text-[11px]"
          style={{ color: "var(--ds-theme-content-subtle)" }}
        >
          {msg.text}
        </span>
      </div>
    );
  }
  const isMe = t === "me";
  const isAI = t === "ai";
  const align = isMe ? "items-end" : "items-start";
  const bg = isMe
    ? "var(--ds-theme-intent-accent-fill)"
    : isAI
      ? "var(--ds-theme-intent-accent-subtle)"
      : "var(--ds-theme-surface-default)";
  const color = isMe
    ? "var(--ds-theme-intent-accent-on-fill)"
    : isAI
      ? "var(--ds-theme-intent-accent-on-subtle)"
      : "var(--ds-theme-content-default)";
  const border = isMe || isAI ? "transparent" : "var(--ds-theme-border-subtle)";
  return (
    <div className={`flex flex-col ${align} gap-0.5`}>
      {showAuthor && !isMe && (
        <span
          className="px-2 text-[11px] font-semibold"
          style={{ color: "var(--ds-theme-content-muted)" }}
        >
          {isAI ? (
            <span className="inline-flex items-center gap-1">
              <Sparkles size={10} /> {msg.author}
            </span>
          ) : (
            msg.author
          )}
        </span>
      )}
      <div
        className="max-w-[75%] text-sm"
        style={{
          background: bg,
          color,
          border: `1px solid ${border}`,
          borderRadius: 18,
          padding: "8px 12px",
          boxShadow: isMe || isAI ? "none" : "var(--ds-component-card-shadow)",
        }}
      >
        <p className="whitespace-pre-wrap break-words">{msg.text}</p>
        <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-80">
          <span>{msg.time}</span>
          {isMe && <StatusIcon status={msg.status ?? "sent"} />}
        </div>
      </div>
    </div>
  );
}

function GroupAvatars({ conversationId }: { conversationId: string }) {
  const parts = useTable("participants") as Record<
    string,
    { conversationId?: string; name?: string }
  >;
  const list = Object.values(parts).filter((p) => p.conversationId === conversationId);
  return (
    <div className="flex -space-x-2">
      {list.slice(0, 4).map((p, i) => (
        <div
          key={i}
          style={{
            outline: "2px solid var(--ds-theme-surface-canvas)",
            borderRadius: 9999,
          }}
        >
          <Avatar name={p.name ?? "?"} size={28} />
        </div>
      ))}
    </div>
  );
}

export function ConversationView() {
  const activeId = (useValue("activeConversationId") as string) || "";
  const name = useCell("conversations", activeId, "name") as string | undefined;
  const isGroup = Boolean(useCell("conversations", activeId, "isGroup"));
  const online = useValue("online") as boolean;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

  const messages = useTable("messages") as Record<string, MsgRow>;
  const sortedIds = useSortedRowIds("messages", "order");
  const filtered = useMemo(
    () => sortedIds.filter((id) => messages[id]?.conversationId === activeId),
    [sortedIds, messages, activeId],
  );

  // Reset unread when opening
  const resetUnread = useSetCellCallback(
    "conversations",
    () => activeId,
    "unread",
    () => 0,
    [activeId],
  );
  useEffect(() => {
    if (activeId) resetUnread();
  }, [activeId, resetUnread]);

  // Scroll to bottom on message list change
  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [filtered.length, activeId]);

  const send = useCallback(() => {
    const text = draft.trim();
    if (!text || !activeId) return;
    const id = `m-${Date.now()}`;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const nextOrder =
      Math.max(
        0,
        ...Object.values(messages)
          .filter((m) => m.conversationId === activeId)
          .map((m) => (m.order as number) ?? 0),
      ) + 1;
    store.setRow("messages", id, {
      conversationId: activeId,
      author: "Israel",
      authorType: "me",
      text,
      time,
      status: "sending",
      order: nextOrder,
    });
    setDraft("");
    setTimeout(() => {
      store.setCell("messages", id, "status", "sent");
    }, 600);
  }, [draft, activeId, messages]);

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!activeId || !name) {
    return (
      <div
        className="grid h-full w-full place-items-center p-8 text-center"
        style={{ color: "var(--ds-theme-content-muted)" }}
      >
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Selecione uma conversa
          </p>
          <p className="mt-1 text-xs">Escolha uma conversa na lista à esquerda para começar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <header
        className="flex items-center gap-3 border-b px-4 py-3"
        style={{
          borderColor: "var(--ds-theme-border-subtle)",
          background: "var(--ds-theme-surface-default)",
        }}
      >
        {isGroup ? <GroupAvatars conversationId={activeId} /> : <Avatar name={name} />}
        <div className="min-w-0 flex-1">
          <h2
            className="truncate text-sm font-semibold"
            style={{ color: "var(--ds-theme-content-strong)" }}
          >
            {name}
          </h2>
          <p className="text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
            {isGroup ? "Grupo · 4 participantes" : "online · visto agora"}
          </p>
        </div>
        <Link
          to="/mensagens/chamada"
          aria-label="Iniciar chamada de voz"
          className="grid place-items-center transition-colors"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          <Phone size={16} />
        </Link>
        <Link
          to="/mensagens/chamada"
          aria-label="Iniciar chamada de vídeo"
          className="grid place-items-center transition-colors"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-subtle)",
            color: "var(--ds-theme-intent-accent-on-subtle)",
          }}
        >
          <Video size={16} />
        </Link>
      </header>

      {!online && (
        <div
          className="px-4 py-2 text-[11px]"
          style={{
            background: "var(--ds-theme-intent-warning-subtle, var(--ds-theme-surface-subdued))",
            color: "var(--ds-theme-content-default)",
            borderBottom: "1px solid var(--ds-theme-border-subtle)",
          }}
          role="status"
        >
          <span className="inline-flex items-center gap-2">
            <WifiOff size={12} /> Você está offline — mensagens serão enviadas ao reconectar.
          </span>
        </div>
      )}

      {/* Message list */}
      <div
        ref={scrollerRef}
        role="log"
        aria-live="polite"
        aria-label={`Mensagens com ${name}`}
        className="flex-1 overflow-y-auto"
        style={{ background: "var(--ds-theme-surface-canvas)" }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-4">
          {filtered.map((id) => {
            const m = messages[id];
            return (
              <MessageBubble key={id} msg={m} showAuthor={isGroup} />
            );
          })}
        </div>
      </div>

      {/* Composer */}
      <form
        className="flex items-end gap-2 border-t p-3"
        style={{
          borderColor: "var(--ds-theme-border-subtle)",
          background: "var(--ds-theme-surface-default)",
        }}
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <button
          type="button"
          aria-label="Anexar arquivo"
          title="Anexar arquivo (mock)"
          className="grid place-items-center"
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-muted)",
          }}
        >
          <Paperclip size={16} />
        </button>
        <label htmlFor="composer" className="sr-only">
          Mensagem
        </label>
        <textarea
          id="composer"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder="Escreva uma mensagem..."
          className="flex-1 resize-none text-sm outline-none"
          style={{
            minHeight: 40,
            maxHeight: 120,
            padding: "10px 14px",
            borderRadius: 16,
            background: "var(--ds-theme-surface-canvas)",
            border: "1px solid var(--ds-theme-border-subtle)",
            color: "var(--ds-theme-content-default)",
          }}
        />
        <button
          type="submit"
          aria-label="Enviar mensagem"
          disabled={!draft.trim()}
          className="grid place-items-center disabled:opacity-50"
          style={{
            width: 40,
            height: 40,
            borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}