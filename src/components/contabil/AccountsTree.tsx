/**
 * Item ⭐1 — Plano de contas em árvore.
 *
 * Renderização recursiva a partir de `parentCode === null`. Cada nó mostra
 * código, nome e um badge com o `kind` (via `kindStyle`, tokens semânticos).
 * Colapso/expansão é estado local (Set de códigos abertos).
 */
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useTable } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { kindStyle, type AccountKind } from "./utils";

type Account = { code: string; name: string; parentCode: string | null; kind: AccountKind };

export function AccountsTree() {
  const table = useTable("accounts") as Record<string, Account>;
  const rows = useMemo(() => Object.values(table), [table]);

  const [open, setOpen] = useState<Set<string>>(() => new Set(rows.map((r) => r.code)));

  const childrenOf = useMemo(() => {
    const map = new Map<string | null, Account[]>();
    for (const r of rows) {
      const key = r.parentCode ?? null;
      const arr = map.get(key) ?? [];
      arr.push(r);
      map.set(key, arr);
    }
    for (const [, arr] of map) arr.sort((a, b) => a.code.localeCompare(b.code, "pt-BR", { numeric: true }));
    return map;
  }, [rows]);

  const roots = childrenOf.get(null) ?? [];

  const toggle = (code: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  if (rows.length === 0) {
    return <EmptyState title="Plano de contas vazio" description="Nenhuma conta cadastrada ainda." />;
  }

  return (
    <section aria-labelledby="acc-h" className="flex flex-col gap-3">
      <header>
        <h3 id="acc-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Plano de contas
        </h3>
        <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Estrutura hierárquica derivada de `parentCode`.
        </p>
      </header>

      <ul
        role="tree"
        aria-label="Plano de contas"
        className="flex flex-col p-2"
        style={{
          borderRadius: "var(--ds-component-card-radius, 16px)",
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        {roots.map((r) => (
          <TreeNode
            key={r.code}
            node={r}
            depth={0}
            childrenOf={childrenOf}
            open={open}
            onToggle={toggle}
          />
        ))}
      </ul>
    </section>
  );
}

function TreeNode({
  node,
  depth,
  childrenOf,
  open,
  onToggle,
}: {
  node: Account;
  depth: number;
  childrenOf: Map<string | null, Account[]>;
  open: Set<string>;
  onToggle: (code: string) => void;
}) {
  const kids = childrenOf.get(node.code) ?? [];
  const hasKids = kids.length > 0;
  const isOpen = open.has(node.code);
  const style = kindStyle(node.kind);

  return (
    <li role="treeitem" aria-expanded={hasKids ? isOpen : undefined}>
      <div
        className="flex items-center gap-2 py-1.5"
        style={{ paddingLeft: 8 + depth * 20 }}
      >
        {hasKids ? (
          <button
            type="button"
            aria-label={isOpen ? `Recolher ${node.name}` : `Expandir ${node.name}`}
            onClick={() => onToggle(node.code)}
            className="grid h-5 w-5 place-items-center"
            style={{
              borderRadius: 6,
              background: "transparent",
              color: "var(--ds-theme-content-muted)",
            }}
          >
            {isOpen ? <ChevronDown size={14} aria-hidden /> : <ChevronRight size={14} aria-hidden />}
          </button>
        ) : (
          <span aria-hidden className="inline-block h-5 w-5" />
        )}

        <span
          className="inline-block min-w-[3.5rem] shrink-0 text-[11px] font-mono tabular-nums"
          style={{ color: "var(--ds-theme-content-subtle)" }}
        >
          {node.code}
        </span>

        <span
          className="flex-1 truncate text-sm"
          style={{ color: "var(--ds-theme-content-strong)", fontWeight: depth === 0 ? 600 : 500 }}
        >
          {node.name}
        </span>

        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: style.bg, color: style.fg }}
        >
          {style.label}
        </span>
      </div>

      {hasKids && isOpen && (
        <ul role="group" className="flex flex-col">
          {kids.map((k) => (
            <TreeNode
              key={k.code}
              node={k}
              depth={depth + 1}
              childrenOf={childrenOf}
              open={open}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}