import { useCell, useValue, useSetValueCallback } from "@/store/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Circle, Cloud, CloudOff, Mail, Grid3x3 } from "lucide-react";

export function Footer() {
  const status = (useValue("syncStatus") as string) ?? "synced";
  const online = (useValue("online") as boolean) ?? true;
  const activeNav = useValue("activeNav") as string;
  const appLabel = (useCell("modules", activeNav, "label") as string) ?? "App";
  const isMobile = useIsMobile();
  const overlay = useValue("mobileOverlay") as "" | "comms" | "modules";

  const toggleComms = useSetValueCallback(
    "mobileOverlay",
    () => (overlay === "comms" ? "" : "comms"),
    [overlay],
  );
  const toggleModules = useSetValueCallback(
    "mobileOverlay",
    () => (overlay === "modules" ? "" : "modules"),
    [overlay],
  );

  const dot =
    status === "syncing"
      ? "var(--ds-theme-intent-warning-fill)"
      : status === "offline"
        ? "var(--ds-theme-intent-danger-fill)"
        : "var(--ds-theme-intent-success-fill)";

  return (
    <footer
      className="flex h-10 shrink-0 items-center gap-3 border-t px-3 text-xs"
      style={{
        background: "var(--ds-theme-surface-default)",
        borderColor: "var(--ds-theme-border-subtle)",
        color: "var(--ds-theme-content-muted)",
      }}
    >
      {isMobile && (
        <>
          <button
            type="button"
            onClick={toggleComms}
            className="inline-flex items-center gap-1.5"
            style={{
              padding: "4px 10px",
              borderRadius: 9999,
              background:
                overlay === "comms"
                  ? "var(--ds-component-navigation-item-bg-active)"
                  : "var(--ds-theme-surface-subdued)",
              color:
                overlay === "comms"
                  ? "var(--ds-component-navigation-item-text-active)"
                  : "var(--ds-theme-content-default)",
            }}
          >
            <Mail size={12} /> Comms
          </button>
          <button
            type="button"
            onClick={toggleModules}
            className="inline-flex items-center gap-1.5"
            style={{
              padding: "4px 10px",
              borderRadius: 9999,
              background:
                overlay === "modules"
                  ? "var(--ds-component-navigation-item-bg-active)"
                  : "var(--ds-theme-surface-subdued)",
              color:
                overlay === "modules"
                  ? "var(--ds-component-navigation-item-text-active)"
                  : "var(--ds-theme-content-default)",
            }}
          >
            <Grid3x3 size={12} /> Apps
          </button>
        </>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="inline-flex items-center gap-1.5">
          <Circle size={8} fill={dot} stroke="none" />
          <span style={{ color: "var(--ds-theme-content-default)" }}>
            {status === "syncing" ? "Sincronizando…" : status === "offline" ? "Offline" : "Sincronizado"}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          {online ? <Cloud size={12} /> : <CloudOff size={12} />}
          <span>{online ? "Online" : "Sem rede"}</span>
        </span>
      </div>
      <span
        className="truncate"
        style={{ color: "var(--ds-theme-content-subtle)" }}
      >
        {appLabel} · pronto
      </span>
    </footer>
  );
}