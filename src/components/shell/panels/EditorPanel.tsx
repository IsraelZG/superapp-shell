export function EditorPanel({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b px-6 py-4" style={{ borderColor: "var(--ds-theme-border-subtle)" }}>
        <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
          Editor
        </p>
        <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          {title}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div
          className="flex h-full min-h-[240px] flex-col gap-3"
          style={{
            background: "var(--ds-theme-surface-default)",
            border: "1px dashed var(--ds-theme-border-default)",
            borderRadius: 20,
            padding: 20,
          }}
        >
          <input
            placeholder="Assunto"
            className="w-full bg-transparent outline-none"
            style={{
              padding: "10px 14px",
              borderRadius: 16,
              border: "1px solid var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-strong)",
              fontSize: 14,
            }}
          />
          <textarea
            placeholder="Escreva sua mensagem…"
            className="w-full flex-1 resize-none bg-transparent outline-none"
            style={{
              padding: "12px 14px",
              borderRadius: 16,
              border: "1px solid var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-default)",
              minHeight: 180,
              fontSize: 14,
            }}
          />
        </div>
      </div>
    </div>
  );
}