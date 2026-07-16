import { useCell, useValue, useSetValueCallback } from "@/store/hooks";
import { useIsMobile } from "@/hooks/use-mobile";
import { Circle, Cloud, CloudOff, Mail, Grid3x3, Shield, KeyRound } from "lucide-react";
import { useSimulateConsentRequest } from "@/components/security/ConsentPrompt";
import { Link } from "@tanstack/react-router";

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

  // DEV/mock trigger — remove when real capability requests are wired.
  const simulateConsent = useSimulateConsentRequest();

  return (
    <footer
      className="flex h-9 shrink-0 items-center gap-3 border-t px-3 text-[10px] uppercase"
      style={{
        background: "var(--ds-theme-surface-default)",
        borderColor: "var(--ds-theme-border-subtle)",
        color: "var(--ds-theme-content-muted)",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.08em",
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
              borderRadius: 0,
              border: "1px solid var(--ds-theme-border-subtle)",
              background:
                overlay === "comms"
                  ? "var(--signal, #D71E33)"
                  : "transparent",
              color:
                overlay === "comms"
                  ? "#fff"
                  : "var(--ds-theme-content-default)",
            }}
          >
            <Mail size={12} /> COMMS
          </button>
          <button
            type="button"
            onClick={toggleModules}
            className="inline-flex items-center gap-1.5"
            style={{
              padding: "4px 10px",
              borderRadius: 0,
              border: "1px solid var(--ds-theme-border-subtle)",
              background:
                overlay === "modules"
                  ? "var(--signal, #D71E33)"
                  : "transparent",
              color:
                overlay === "modules"
                  ? "#fff"
                  : "var(--ds-theme-content-default)",
            }}
          >
            <Grid3x3 size={12} /> APPS
          </button>
        </>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="inline-flex items-center gap-1.5">
          <Circle size={8} fill={dot} stroke="none" />
          <span style={{ color: "var(--ds-theme-content-default)" }}>
            {status === "syncing" ? "SINCRONIZANDO" : status === "offline" ? "OFFLINE" : "SINCRONIZADO"}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          {online ? <Cloud size={12} /> : <CloudOff size={12} />}
          <span>{online ? "ONLINE" : "SEM REDE"}</span>
        </span>
      </div>
      <span
        className="truncate"
        style={{ color: "var(--ds-theme-content-subtle)" }}
      >
        [ {appLabel.toUpperCase()} · PRONTO ]
      </span>
      <button
        type="button"
        onClick={simulateConsent}
        title="Demo: simular pedido de consentimento"
        aria-label="Simular pedido de consentimento"
        className="inline-flex items-center gap-1.5"
        style={{
          padding: "4px 10px",
          borderRadius: 0,
          border: "1px solid var(--ds-theme-border-subtle)",
          background: "transparent",
          color: "var(--ds-theme-content-default)",
        }}
      >
        <Shield size={12} aria-hidden="true" /> CONSENT DEMO
      </button>
      <Link
        to="/configuracoes/permissoes"
        className="inline-flex items-center gap-1.5"
        style={{
          padding: "4px 10px",
          borderRadius: 0,
          border: "1px solid var(--ds-theme-border-subtle)",
          background: "transparent",
          color: "var(--ds-theme-content-default)",
          textDecoration: "none",
        }}
        aria-label="Abrir permissões"
      >
        <KeyRound size={12} aria-hidden="true" /> PERMISSÕES
      </Link>
    </footer>
  );
}