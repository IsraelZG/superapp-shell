import { Plus, Link2, Key, ArrowRight } from "lucide-react";
import { useSetValueCallback } from "@/store/hooks";
import { OnboardingCard } from "./OnboardingCard";
import { OnboardingTopBar } from "./OnboardingTopBar";

export function WelcomeScreen() {
  const goCreate = useSetValueCallback("onboardingStep", () => "create", []);
  const goUnlock = useSetValueCallback("onboardingStep", () => "unlock", []);
  // "Entrar com convite" reusa a tela unlock como placeholder no mockup
  const goInvite = useSetValueCallback("onboardingStep", () => "unlock", []);

  return (
    <OnboardingCard>
      <OnboardingTopBar />

      <div className="mt-10 animate-stagger-in text-left" style={{ animationDelay: "0ms" }}>
        <div
          className="font-mono-label mb-4 inline-flex items-center gap-2"
          style={{ color: "var(--ds-theme-content-muted)" }}
        >
          <span style={{ width: 24, height: 1, background: "var(--ds-theme-content-strong)" }} />
          [ 001 · Bem-vindo ]
        </div>
        <h1
          className="text-display"
          style={{ color: "var(--ds-theme-content-strong)" }}
        >
          Bem-vindo<br />
          ao{" "}
          <span style={{ color: "var(--signal)" }}>SuperApp</span>
        </h1>
        <p
          className="mt-5 max-w-md text-base"
          style={{ color: "var(--ds-theme-content-muted)", lineHeight: 1.5 }}
        >
          Sua rede, seus dados — sem servidor central.
        </p>
      </div>

      <div
        className="mt-10 flex flex-col animate-stagger-in"
        style={{ animationDelay: "120ms", borderTop: "1px solid var(--ds-theme-border-subtle)" }}
      >
        <EntryButton
          primary
          icon={<Plus size={20} />}
          title="Criar nova rede"
          desc="Fundar um espaço novo (gênese)"
          onClick={goCreate}
        />
        <EntryButton
          icon={<Link2 size={20} />}
          title="Entrar com convite"
          desc="Recebi um link ou código"
          onClick={goInvite}
        />
        <EntryButton
          icon={<Key size={20} />}
          title="Entrar com identidade"
          desc="Já tenho uma seed ou dispositivo pareado"
          onClick={goUnlock}
        />
      </div>

      <div
        className="font-mono-label mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-5 animate-stagger-in"
        style={{
          animationDelay: "240ms",
          borderColor: "var(--ds-theme-border-subtle)",
          color: "var(--ds-theme-content-muted)",
        }}
      >
        <span>[ Suas chaves nunca saem do dispositivo ]</span>
        <button
          type="button"
          className="font-mono-label underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            color: "var(--signal)",
            outlineColor: "var(--ds-theme-border-focus)",
          }}
        >
          Como funciona →
        </button>
      </div>
    </OnboardingCard>
  );
}

function EntryButton({
  icon,
  title,
  desc,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  primary?: boolean;
}) {
  const bg = primary ? "var(--ink, #0F0F0F)" : "transparent";
  const fg = primary ? "var(--paper, #F2F0EB)" : "var(--ds-theme-content-strong)";
  const descColor = primary
    ? "rgba(242,240,235,0.7)"
    : "var(--ds-theme-content-muted)";
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 hover:[--hover-accent:var(--signal)]"
      style={{
        padding: "20px 4px",
        borderRadius: 0,
        background: bg,
        color: fg,
        borderBottom: "1px solid var(--ds-theme-border-subtle)",
        outlineColor: "var(--ds-theme-border-focus)",
      }}
      onMouseEnter={(e) => {
        if (!primary) e.currentTarget.style.background = "var(--ds-theme-surface-subdued)";
      }}
      onMouseLeave={(e) => {
        if (!primary) e.currentTarget.style.background = "transparent";
      }}
    >
      <span
        className="grid shrink-0 place-items-center"
        style={{
          width: 44,
          height: 44,
          borderRadius: 0,
          border: primary ? "1px solid rgba(242,240,235,0.25)" : "1px solid var(--ds-theme-border-subtle)",
          background: "transparent",
          color: fg,
        }}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className="leading-none"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "1.375rem",
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </span>
        <span
          className="font-mono-label"
          style={{ color: descColor }}
        >
          {desc}
        </span>
      </span>
      <ArrowRight
        size={22}
        aria-hidden
        className="transition-transform group-hover:translate-x-1"
        style={{ color: primary ? fg : "var(--signal)" }}
      />
    </button>
  );
}