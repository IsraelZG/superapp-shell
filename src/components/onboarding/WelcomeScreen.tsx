import { Sparkles, Plus, Link2, Key, ChevronRight } from "lucide-react";
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

      <div className="mt-8 flex flex-col items-center text-center">
        <div
          className="grid place-items-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
          aria-hidden
        >
          <Sparkles size={28} />
        </div>
        <h1
          className="mt-5 text-2xl font-semibold tracking-tight"
          style={{ color: "var(--ds-theme-content-strong)" }}
        >
          Bem-vindo ao SuperApp
        </h1>
        <p
          className="mt-2 text-sm"
          style={{ color: "var(--ds-theme-content-muted)" }}
        >
          Sua rede, seus dados — sem servidor central.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
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
        className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t pt-5 text-xs"
        style={{
          borderColor: "var(--ds-theme-border-subtle)",
          color: "var(--ds-theme-content-muted)",
        }}
      >
        <span>Suas chaves nunca saem do dispositivo.</span>
        <button
          type="button"
          className="font-semibold underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            color: "var(--ds-theme-content-link)",
            outlineColor: "var(--ds-theme-border-focus)",
          }}
        >
          Como funciona?
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
  const bg = primary
    ? "var(--ds-theme-intent-accent-fill)"
    : "var(--ds-theme-surface-subdued)";
  const fg = primary
    ? "var(--ds-theme-intent-accent-on-fill)"
    : "var(--ds-theme-content-strong)";
  const descColor = primary
    ? "var(--ds-theme-intent-accent-on-fill)"
    : "var(--ds-theme-content-muted)";
  const border = primary ? "transparent" : "var(--ds-theme-border-subtle)";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 text-left transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.99]"
      style={{
        padding: 16,
        borderRadius: 18,
        background: bg,
        color: fg,
        border: `1px solid ${border}`,
        outlineColor: "var(--ds-theme-border-focus)",
      }}
    >
      <span
        className="grid shrink-0 place-items-center"
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: primary
            ? "rgba(255,255,255,0.18)"
            : "var(--ds-theme-surface-default)",
          color: fg,
        }}
        aria-hidden
      >
        {icon}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-semibold leading-tight">{title}</span>
        <span className="text-xs" style={{ color: descColor, opacity: primary ? 0.9 : 1 }}>
          {desc}
        </span>
      </span>
      <ChevronRight size={18} aria-hidden style={{ opacity: 0.7 }} />
    </button>
  );
}