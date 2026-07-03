import { createFileRoute } from "@tanstack/react-router";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <OnboardingGate />;
}
