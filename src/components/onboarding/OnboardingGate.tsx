import { useValue } from "@/store/hooks";
import { AppShell } from "@/components/shell/AppShell";
import { ThemeSync } from "@/components/shell/ThemeSync";
import { WelcomeScreen } from "./WelcomeScreen";
import { CreateIdentityScreen } from "./CreateIdentityScreen";
import { ConfirmSeedScreen } from "./ConfirmSeedScreen";
import { UnlockScreen } from "./UnlockScreen";

export function OnboardingGate() {
  const step = (useValue("onboardingStep") as string) ?? "welcome";

  if (step === "done") return <AppShell />;

  return (
    <>
      <ThemeSync />
      <OnboardingChrome>
        {step === "create" ? (
          <CreateIdentityScreen />
        ) : step === "confirm" ? (
          <ConfirmSeedScreen />
        ) : step === "unlock" ? (
          <UnlockScreen />
        ) : (
          <WelcomeScreen />
        )}
      </OnboardingChrome>
    </>
  );
}

function OnboardingChrome({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-8"
      style={{ background: "var(--ds-theme-surface-canvas)" }}
    >
      <div
        aria-hidden
        className="text-ghost pointer-events-none absolute inset-x-0 -bottom-4 select-none whitespace-nowrap text-center"
        style={{ fontSize: "clamp(6rem, 22vw, 22rem)" }}
      >
        SUPERAPP
      </div>
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}