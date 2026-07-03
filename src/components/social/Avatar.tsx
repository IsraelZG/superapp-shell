import { initials } from "./utils";

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      aria-hidden
      className="grid shrink-0 place-items-center font-semibold"
      style={{
        width: size,
        height: size,
        borderRadius: 9999,
        background: "var(--ds-theme-intent-accent-subtle)",
        color: "var(--ds-theme-intent-accent-on-subtle)",
        fontSize: Math.round(size * 0.36),
      }}
    >
      {initials(name) || "?"}
    </div>
  );
}