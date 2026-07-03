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
      className="grid place-items-center transition-colors"
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: isActive ? "var(--ds-component-navigation-item-bg-active)" : "transparent",
        color: isActive
          ? "var(--ds-component-navigation-item-text-active)"
          : "var(--ds-component-navigation-item-text-inactive)",
      }}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--ds-component-navigation-item-bg-hover)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
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
    <div className="flex h-full w-full flex-col items-center gap-2 py-3">
      <div
        className="grid place-items-center"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: "var(--ds-theme-intent-accent-fill)",
          color: "var(--ds-theme-intent-accent-on-fill)",
          fontWeight: 700,
          fontSize: 12,
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
        style={{ width: 36, height: 36, borderRadius: 12, color: "var(--ds-theme-content-muted)" }}
      >
        {collapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>
    </div>
  );
}

export function ModulesRail() {
  const ids = useSortedRowIds("modules", "order");
  return (
    <div className="flex h-full w-full flex-col items-center gap-2 py-3">
      <div
        className="grid place-items-center text-xs font-semibold uppercase tracking-wide"
        style={{
          width: 36,
          height: 36,
          borderRadius: 12,
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-muted)",
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