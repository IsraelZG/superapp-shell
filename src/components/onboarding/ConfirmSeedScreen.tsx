import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { store } from "@/store/hooks";
import { useSetValueCallback } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingCard } from "./OnboardingCard";
import { OnboardingTopBar } from "./OnboardingTopBar";
import { seedState } from "./seedState";

export function ConfirmSeedScreen() {
  const { words, count } = seedState.get();
  const goBack = useSetValueCallback("onboardingStep", () => "create", []);

  // Escolhe 3 índices fixos (2ª, 5ª, 9ª) — se seed for de 24, mesmo assim funciona.
  const targets = useMemo(() => {
    const base = [1, 4, 8]; // 0-indexed → posições 2, 5, 9
    return base.filter((i) => i < words.length);
  }, [words.length]);

  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (words.length === 0) {
      setError("Nenhuma frase gerada. Volte e gere uma nova.");
      return;
    }
    const wrong = targets.some(
      (i) => (inputs[i] ?? "").trim().toLowerCase() !== words[i].toLowerCase(),
    );
    if (wrong) {
      setError("Palavras incorretas. Confira a ordem e tente novamente.");
      return;
    }
    setError(null);
    store.setRow("identity", "me", {
      seedWordCount: count,
      confirmed: true,
      createdAt: new Date().toISOString(),
    });
    seedState.clear();
    store.setValue("onboardingStep", "unlock");
  };

  return (
    <OnboardingCard>
      <OnboardingTopBar />

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          onClick={goBack}
          aria-label="Voltar"
          className="grid place-items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            width: 32,
            height: 32,
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
            outlineColor: "var(--ds-theme-border-focus)",
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex flex-col">
          <p
            className="text-[11px] font-medium uppercase tracking-wide"
            style={{ color: "var(--ds-theme-content-subtle)" }}
          >
            Passo 2 de 2
          </p>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--ds-theme-content-strong)" }}
          >
            Confirme sua frase
          </h1>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Digite as palavras nas posições indicadas.
          </p>
        </div>
      </div>

      {words.length === 0 ? (
        <div
          role="alert"
          className="mt-6 flex gap-3 text-xs"
          style={{
            padding: 14,
            borderRadius: 16,
            background: "var(--ds-theme-intent-warning-subtle)",
            color: "var(--ds-theme-intent-warning-on-subtle)",
            border: "1px solid var(--ds-theme-intent-warning-border)",
          }}
        >
          <AlertCircle size={16} aria-hidden />
          Nenhuma frase carregada. Volte e gere uma nova frase de recuperação.
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {targets.map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Label
                htmlFor={`word-${i}`}
                className="text-xs font-medium"
                style={{ color: "var(--ds-theme-content-muted)" }}
              >
                Palavra nº {i + 1}
              </Label>
              <Input
                id={`word-${i}`}
                autoComplete="off"
                spellCheck={false}
                value={inputs[i] ?? ""}
                onChange={(e) => {
                  setInputs((prev) => ({ ...prev, [i]: e.target.value }));
                  if (error) setError(null);
                }}
                aria-invalid={error ? true : undefined}
                className="h-11 rounded-2xl text-sm"
                style={{
                  background: "var(--ds-theme-surface-subdued)",
                  color: "var(--ds-theme-content-strong)",
                  borderColor: error
                    ? "var(--ds-theme-intent-danger-border)"
                    : "var(--ds-theme-border-subtle)",
                }}
              />
            </div>
          ))}
        </div>
      )}

      {error ? (
        <div
          role="alert"
          className="mt-4 flex items-center gap-2 text-xs"
          style={{ color: "var(--ds-theme-intent-danger-on-subtle)" }}
        >
          <AlertCircle size={14} aria-hidden />
          {error}
        </div>
      ) : null}

      <Button
        type="button"
        onClick={submit}
        disabled={words.length === 0}
        className="mt-6 h-11 w-full rounded-full text-sm font-semibold"
        style={{
          background: "var(--ds-theme-intent-accent-fill)",
          color: "var(--ds-theme-intent-accent-on-fill)",
        }}
      >
        <CheckCircle2 size={16} className="mr-1" aria-hidden />
        Confirmar e continuar
      </Button>
    </OnboardingCard>
  );
}