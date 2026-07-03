import { useValue, useSetValueCallback } from "@/store/hooks";
import { Command, Moon, Settings, Sparkles, Sun } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Header() {
  const theme = useValue("theme") as "light" | "dark";
  const toggleTheme = useSetValueCallback(
    "theme",
    () => (theme === "dark" ? "light" : "dark"),
    [theme],
  );

  return (
    <header
      className="flex h-14 shrink-0 items-center gap-3 border-b px-4"
      style={{
        background: "var(--ds-theme-surface-default)",
        borderColor: "var(--ds-theme-border-subtle)",
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div
          className="grid place-items-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          <Sparkles size={16} />
        </div>
        <span
          className="truncate text-sm font-semibold tracking-tight"
          style={{ color: "var(--ds-theme-content-strong)" }}
        >
          SuperApp
        </span>
      </div>

      <button
        type="button"
        className="hidden items-center gap-2 md:inline-flex"
        style={{
          height: 34,
          padding: "0 12px",
          borderRadius: 9999,
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-muted)",
          fontSize: 12,
        }}
      >
        <Command size={14} />
        <span>Buscar…</span>
        <span
          className="ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold"
          style={{
            background: "var(--ds-theme-surface-default)",
            color: "var(--ds-theme-content-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          ⌘K
        </span>
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
        className="grid place-items-center transition-colors"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-default)",
        }}
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <Link
        to="/configuracoes"
        aria-label="Abrir configurações"
        className="grid place-items-center transition-colors"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-default)",
        }}
      >
        <Settings size={16} />
      </Link>
    </header>
  );
}