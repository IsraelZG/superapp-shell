import type { ReactNode } from "react";

export function OnboardingCard({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-full"
      style={{
        maxWidth: 560,
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
        borderRadius: 24,
        boxShadow: "var(--ds-component-card-shadow, 0 10px 30px rgba(0,0,0,0.08))",
        padding: 28,
      }}
    >
      {children}
    </div>
  );
}