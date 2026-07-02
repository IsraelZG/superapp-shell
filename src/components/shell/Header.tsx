import { useCell, useValue, useSetValueCallback } from "@/store/hooks";
import { Moon, Sun } from "lucide-react";

export function Header() {
  const theme = useValue("theme") as "light" | "dark";
  const userName = useCell("currentUser", "me", "name") as string;
  const activeNav = useValue("activeNav") as string;
  const activeLabel = useCell("nav", activeNav, "label") as string;

  const toggleTheme = useSetValueCallback(
    "theme",
    () => (theme === "dark" ? "light" : "dark"),
    [theme],
  );

  const initials = (userName ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className="flex h-16 shrink-0 items-center gap-4 border-b px-4 md:px-6"
      style={{
        background: "var(--ds-theme-surface-default)",
        borderColor: "var(--ds-theme-border-subtle)",
      }}
    >
      <div className="min-w-0 flex-1">
        <p
          className="text-xs font-medium uppercase tracking-wide"
          style={{ color: "var(--ds-theme-content-subtle)" }}
        >
          SuperApp
        </p>
        <h1
          className="truncate text-lg font-semibold"
          style={{ color: "var(--ds-theme-content-strong)" }}
        >
          {activeLabel ?? "Início"}
        </h1>
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={
          theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
        }
        className="flex items-center justify-center transition-colors"
        style={{
          width: 40,
          height: 40,
          borderRadius: 9999,
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-default)",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background =
            "var(--ds-component-button-ghost-bg-hover)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background =
            "var(--ds-theme-surface-subdued)")
        }
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div
        className="grid shrink-0 place-items-center text-sm font-semibold"
        style={{
          width: "var(--ds-component-avatar-size-md)",
          height: "var(--ds-component-avatar-size-md)",
          borderRadius: "var(--ds-component-avatar-radius)",
          background: "var(--ds-component-avatar-fallback-bg)",
          color: "var(--ds-component-avatar-fallback-text)",
        }}
        title={userName}
      >
        {initials}
      </div>
    </header>
  );
}