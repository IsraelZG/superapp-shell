import type { ReactNode } from "react";

export function OnboardingCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-full"
      style={{
        maxWidth: 640,
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
        borderRadius: 0,
        boxShadow: "none",
        padding: 32,
      }}
    >
      {children}
    </div>
  );
}