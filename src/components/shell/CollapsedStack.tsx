import { useRowIds, useCell } from "@/store/hooks";
import { ArchiveRestore, Layers } from "lucide-react";

function Chip({
  id,
  onRestore,
}: {
  id: string;
  onRestore: (id: string, name: string, component: string) => void;
}) {
  const name = (useCell("collapsed", id, "name") as string) ?? "Coluna";
  const component = (useCell("collapsed", id, "component") as string) ?? "app-view";
  return (
    <button
      type="button"
      onClick={() => onRestore(id, name, component)}
      className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] transition-colors"
      style={{
        padding: "6px 10px",
        borderRadius: 0,
        background: "transparent",
        color: "var(--ds-theme-content-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
        fontFamily: "var(--font-mono)",
      }}
      title="Restaurar coluna"
    >
      <ArchiveRestore size={12} />
      <span className="max-w-[160px] truncate">{name}</span>
    </button>
  );
}

export function CollapsedStack({
  onRestore,
}: {
  onRestore: (id: string, name: string, component: string) => void;
}) {
  const ids = useRowIds("collapsed");
  if (ids.length === 0) return null;
  return (
    <div
      className="flex shrink-0 items-center gap-2 overflow-x-auto border-t px-3 py-2"
      style={{
        background: "var(--ds-theme-surface-default)",
        borderColor: "var(--ds-theme-border-subtle)",
      }}
    >
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase"
        style={{ color: "var(--ds-theme-content-subtle)", fontFamily: "var(--font-mono)", letterSpacing: "0.12em" }}
      >
        <Layers size={12} /> [ COLUNAS RECOLHIDAS ]
      </span>
      {ids.map((id) => (
        <Chip key={id} id={id} onRestore={onRestore} />
      ))}
    </div>
  );
}