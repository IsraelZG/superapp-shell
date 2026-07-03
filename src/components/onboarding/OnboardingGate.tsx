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
      className="flex min-h-dvh w-full items-center justify-center px-4 py-8"
      style={{ background: "var(--ds-theme-surface-canvas)" }}
    >
      {children}
    </div>
  );
}