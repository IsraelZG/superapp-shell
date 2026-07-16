import { useSortedRowIds, useCell, useValue, useSetValueCallback } from "@/store/hooks";
import { navIconMap } from "../icons";
import { ChevronsRight, ChevronsLeft } from "lucide-react";

function RailItem({ id, table, activeKey }: { id: string; table: "commsMenu" | "modules"; activeKey: "activeComms" | "activeNav" }) {
  const label = useCell(table, id, "label") as string;
  const iconName = useCell(table, id, "icon") as string;
  const active = useValue(activeKey) as string;
  const Icon = navIconMap[iconName];
  const setActive = useSetValueCallback(activeKey, () => id, [id]);
  const isActive = active === id;
  return (
    <button
      type="button"
      onClick={setActive}
      title={label}
      aria-label={label}
      data-active={isActive ? "true" : "false"}
      className="brut-rail-item grid place-items-center transition-colors relative"
      style={{
        width: 48,
        height: 44,
        color: isActive
          ? "var(--ds-theme-content-strong)"
          : "var(--ds-theme-content-muted)",
      }}
    >
      {Icon ? <Icon size={20} /> : null}
    </button>
  );
}

export function CommsRail() {
  const ids = useSortedRowIds("commsMenu", "order");
  const collapsed = useValue("commsRailCollapsed") as boolean;
  const toggle = useSetValueCallback("commsRailCollapsed", () => !collapsed, [collapsed]);
  return (
    <div
      className="flex h-full w-full flex-col items-center gap-1 py-3"
      style={{ borderRight: "1px solid var(--ds-theme-border-subtle)" }}
    >
      <div
        className="grid place-items-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 0,
          background: "var(--ds-theme-intent-accent-fill)",
          color: "var(--ds-theme-intent-accent-on-fill)",
          fontWeight: 800,
          fontSize: 12,
          fontFamily: "var(--font-display)",
          letterSpacing: "0.02em",
        }}
      >
        SA
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {ids.map((id) => (
          <RailItem key={id} id={id} table="commsMenu" activeKey="activeComms" />
        ))}
      </div>
      <div className="flex-1" />
      <button
        type="button"
        onClick={toggle}
        aria-label="Colapsar comunicações"
        className="grid place-items-center"
        style={{ width: 36, height: 36, borderRadius: 0, color: "var(--ds-theme-content-muted)" }}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>
    </div>
  );
}

export function ModulesRail() {
  const ids = useSortedRowIds("modules", "order");
  return (
    <div
      className="flex h-full w-full flex-col items-center gap-1 py-3"
      style={{ borderLeft: "1px solid var(--ds-theme-border-subtle)" }}
    >
      <div
        className="grid place-items-center text-xs font-semibold uppercase"
        style={{
          width: 36,
          height: 36,
          borderRadius: 0,
          border: "1px solid var(--ds-theme-border-subtle)",
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-muted)",
          fontFamily: "var(--font-mono)",
          letterSpacing: "0.12em",
        }}
      >
        M
      </div>
      <div className="mt-2 flex flex-col gap-1">
        {ids.map((id) => (
          <RailItem key={id} id={id} table="modules" activeKey="activeNav" />
        ))}
      </div>
    </div>
  );
}