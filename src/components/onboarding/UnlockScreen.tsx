import { useState } from "react";
import { Eye, EyeOff, Fingerprint, Lock, AlertCircle } from "lucide-react";
import { useSetValueCallback, useRow } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { OnboardingCard } from "./OnboardingCard";
import { OnboardingTopBar } from "./OnboardingTopBar";

export function UnlockScreen() {
  const identity = useRow("identity", "me") as
    | { seedWordCount?: number; confirmed?: boolean; createdAt?: string }
    | undefined;

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgot, setShowForgot] = useState(false);
  const enter = useSetValueCallback("onboardingStep", () => "done", []);

  const submit = () => {
    if (!password.trim()) {
      setError("Digite sua senha para desbloquear.");
      return;
    }
    setError(null);
    enter();
  };

  return (
    <OnboardingCard>
      <OnboardingTopBar />

      <div className="mt-8 flex flex-col items-center text-center">
        <div
          className="grid place-items-center"
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "var(--ds-theme-intent-accent-subtle)",
            color: "var(--ds-theme-intent-accent-on-subtle)",
          }}
          aria-hidden
        >
          <Lock size={24} />
        </div>
        <h1
          className="mt-4 text-xl font-semibold tracking-tight"
          style={{ color: "var(--ds-theme-content-strong)" }}
        >
          Desbloquear identidade
        </h1>
        <p className="mt-1 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          {identity?.confirmed
            ? `Identidade local · ${identity.seedWordCount ?? "?"} palavras`
            : "Entre com sua senha para continuar"}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Label
          htmlFor="unlock-pw"
          className="text-xs font-medium"
          style={{ color: "var(--ds-theme-content-muted)" }}
        >
          Senha
        </Label>
        <div className="relative">
          <Input
            id="unlock-pw"
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-invalid={error ? true : undefined}
            autoFocus
            className="h-11 rounded-2xl pr-11 text-sm"
            style={{
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-strong)",
              borderColor: error
                ? "var(--ds-theme-intent-danger-border)"
                : "var(--ds-theme-border-subtle)",
            }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2 top-1/2 grid -translate-y-1/2 place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              width: 32,
              height: 32,
              borderRadius: 9999,
              color: "var(--ds-theme-content-muted)",
              outlineColor: "var(--ds-theme-border-focus)",
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {error ? (
          <div
            role="alert"
            className="flex items-center gap-1 text-xs"
            style={{ color: "var(--ds-theme-intent-danger-on-subtle)" }}
          >
            <AlertCircle size={12} aria-hidden />
            {error}
          </div>
        ) : null}
      </div>

      <Button
        type="button"
        onClick={submit}
        className="mt-5 h-11 w-full rounded-full text-sm font-semibold"
        style={{
          background: "var(--ds-theme-intent-accent-fill)",
          color: "var(--ds-theme-intent-accent-on-fill)",
        }}
      >
        Desbloquear
      </Button>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ background: "var(--ds-theme-border-subtle)" }} />
        <span className="text-[11px] font-medium uppercase" style={{ color: "var(--ds-theme-content-subtle)" }}>
          ou
        </span>
        <div className="h-px flex-1" style={{ background: "var(--ds-theme-border-subtle)" }} />
      </div>

      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                type="button"
                disabled
                className="h-11 w-full rounded-full text-sm font-semibold"
                style={{
                  background: "var(--ds-theme-surface-subdued)",
                  color: "var(--ds-theme-content-muted)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <Fingerprint size={16} className="mr-2" aria-hidden />
                Usar biometria
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>Disponível no dispositivo real</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="mt-6 text-center text-xs">
        <button
          type="button"
          onClick={() => setShowForgot((s) => !s)}
          className="font-medium underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            color: "var(--ds-theme-content-muted)",
            outlineColor: "var(--ds-theme-border-focus)",
          }}
        >
          Esqueci minha senha
        </button>
        {showForgot ? (
          <p
            className="mt-3 text-xs leading-relaxed"
            style={{ color: "var(--ds-theme-content-muted)" }}
          >
            Este é um sistema local-first: sem sua frase de recuperação, não há
            servidor que possa restaurar seu acesso. Use a frase que você anotou
            durante a criação da identidade.
          </p>
        ) : null}
      </div>
    </OnboardingCard>
  );
}