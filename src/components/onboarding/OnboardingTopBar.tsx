import { useState } from "react";
import { Moon, Sun, Globe } from "lucide-react";
import { useValue, useSetValueCallback } from "@/store/hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCALES = [
  { code: "pt-BR", label: "Português (BR)" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
];

export function OnboardingTopBar() {
  const theme = (useValue("theme") as "light" | "dark") ?? "light";
  const toggleTheme = useSetValueCallback(
    "theme",
    () => (theme === "dark" ? "light" : "dark"),
    [theme],
  );
  const [locale, setLocale] = useState("pt-BR");

  return (
    <div className="flex items-center justify-between gap-3">
      <div
        className="inline-flex items-center gap-2"
        style={{
          height: 28,
          padding: "0 10px",
          borderRadius: 9999,
          background: "var(--ds-theme-intent-accent-subtle)",
          color: "var(--ds-theme-intent-accent-on-subtle)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: 0.2,
        }}
      >
        <ShieldIcon />
        <span>Local-first · P2P</span>
      </div>

      <div className="flex items-center gap-2">
        <Select value={locale} onValueChange={setLocale}>
          <SelectTrigger
            aria-label="Selecionar idioma"
            className="h-9 gap-2 rounded-full border-0 text-xs"
            style={{
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
              paddingInline: 12,
            }}
          >
            <Globe size={14} aria-hidden />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LOCALES.map((l) => (
              <SelectItem key={l.code} value={l.code}>
                {l.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
          className="grid place-items-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
            outlineColor: "var(--ds-theme-border-focus)",
          }}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}