import {
  useCell,
  useSortedRowIds,
  useValue,
  useSetValueCallback,
} from "@/store/hooks";
import { navIconMap } from "./icons";
import { ChevronsLeft, ChevronsRight, Sparkles } from "lucide-react";

function NavItem({ id }: { id: string }) {
  const label = useCell("nav", id, "label") as string;
  const icon = useCell("nav", id, "icon") as string;
  const activeNav = useValue("activeNav") as string;
  const collapsed = useValue("sidebarCollapsed") as boolean;
  const setActive = useSetValueCallback("activeNav", () => id, [id]);
  const isActive = activeNav === id;
  const Icon = navIconMap[icon];

  return (
    <button
      type="button"
      onClick={setActive}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      className="group flex w-full items-center transition-colors"
      style={{
        height: "var(--ds-component-navigation-item-height)",
        gap: "var(--ds-component-navigation-item-gap)",
        paddingInline: "var(--ds-component-navigation-item-padding-x)",
        borderRadius: "var(--ds-component-navigation-item-radius)",
        background: isActive
          ? "var(--ds-component-navigation-item-bg-active)"
          : "transparent",
        color: isActive
          ? "var(--ds-component-navigation-item-text-active)"
          : "var(--ds-component-navigation-item-text-inactive)",
        justifyContent: collapsed ? "center" : "flex-start",
      }}
      onMouseEnter={(e) => {
        if (!isActive)
          e.currentTarget.style.background =
            "var(--ds-component-navigation-item-bg-hover)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      {Icon ? <Icon size={20} strokeWidth={2} /> : null}
      {!collapsed && (
        <span className="truncate text-sm font-medium">{label}</span>
      )}
    </button>
  );
}

export function Sidebar() {
  const rowIds = useSortedRowIds("nav", "order");
  const collapsed = useValue("sidebarCollapsed") as boolean;
  const setCollapsed = useSetValueCallback(
    "sidebarCollapsed",
    () => !collapsed,
    [collapsed],
  );

  return (
    <aside
      className="hidden shrink-0 flex-col border-r transition-[width] duration-200 ease-out md:flex"
      style={{
        width: collapsed
          ? "var(--ds-component-navigation-sidebar-width-collapsed)"
          : "var(--ds-component-navigation-sidebar-width)",
        background: "var(--ds-component-navigation-sidebar-bg)",
        borderColor: "var(--ds-theme-border-subtle)",
      }}
    >
      <div
        className="flex items-center gap-2 px-3"
        style={{
          height: 64,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        <div
          className="grid place-items-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 12,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          <Sparkles size={18} />
        </div>
        {!collapsed && (
          <span
            className="text-base font-semibold tracking-tight"
            style={{ color: "var(--ds-theme-content-strong)" }}
          >
            SuperApp
          </span>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
        {rowIds.map((id) => (
          <NavItem key={id} id={id} />
        ))}
      </nav>

      <div className="p-2">
        <button
          type="button"
          onClick={setCollapsed}
          aria-label={
            collapsed ? "Expandir barra lateral" : "Recolher barra lateral"
          }
          className="flex w-full items-center justify-center transition-colors"
          style={{
            height: 36,
            borderRadius: 12,
            color: "var(--ds-theme-content-muted)",
            background: "transparent",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background =
              "var(--ds-theme-surface-subdued)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}