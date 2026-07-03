import { useState } from "react";
import { ArrowLeft, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { useSetValueCallback } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { OnboardingCard } from "./OnboardingCard";
import { OnboardingTopBar } from "./OnboardingTopBar";
import { generateMockSeed, seedState } from "./seedState";

export function CreateIdentityScreen() {
  const [count, setCount] = useState<12 | 24>(12);
  const [words, setWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const goBack = useSetValueCallback("onboardingStep", () => "welcome", []);
  const goConfirm = useSetValueCallback("onboardingStep", () => "confirm", []);

  const generate = () => {
    setLoading(true);
    setWords([]);
    setTimeout(() => {
      const w = generateMockSeed(count);
      setWords(w);
      seedState.set(w, count);
      setLoading(false);
    }, 700);
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
            Passo 1 de 2
          </p>
          <h1
            className="text-xl font-semibold tracking-tight"
            style={{ color: "var(--ds-theme-content-strong)" }}
          >
            Sua frase de recuperação
          </h1>
        </div>
      </div>

      <fieldset className="mt-6">
        <legend
          className="mb-2 text-xs font-medium"
          style={{ color: "var(--ds-theme-content-muted)" }}
        >
          Tamanho da frase
        </legend>
        <div
          className="inline-flex rounded-full p-1"
          style={{ background: "var(--ds-theme-surface-subdued)" }}
          role="radiogroup"
          aria-label="Número de palavras"
        >
          {[12, 24].map((n) => {
            const active = count === n;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  setCount(n as 12 | 24);
                  setWords([]);
                }}
                className="text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  padding: "8px 16px",
                  borderRadius: 9999,
                  background: active
                    ? "var(--ds-theme-surface-default)"
                    : "transparent",
                  color: active
                    ? "var(--ds-theme-content-strong)"
                    : "var(--ds-theme-content-muted)",
                  boxShadow: active
                    ? "0 1px 2px rgba(0,0,0,0.06)"
                    : "none",
                  outlineColor: "var(--ds-theme-border-focus)",
                }}
              >
                {n} palavras
              </button>
            );
          })}
        </div>
      </fieldset>

      {words.length === 0 && !loading ? (
        <div className="mt-6">
          <Button
            type="button"
            onClick={generate}
            className="h-11 w-full rounded-full text-sm font-semibold"
            style={{
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            Gerar frase de recuperação
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div
          className="mt-6 grid gap-2"
          style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
          aria-live="polite"
          aria-busy="true"
        >
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="h-10 animate-pulse"
              style={{
                background: "var(--ds-theme-surface-subdued)",
                borderRadius: 12,
              }}
            />
          ))}
          <div
            className="col-span-3 mt-1 flex items-center gap-2 text-xs"
            style={{ color: "var(--ds-theme-content-muted)" }}
          >
            <Loader2 size={14} className="animate-spin" aria-hidden />
            Gerando frase…
          </div>
        </div>
      ) : null}

      {words.length > 0 && !loading ? (
        <>
          <div
            className="mt-6 grid gap-2"
            style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
            aria-label="Frase de recuperação"
          >
            {words.map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm"
                style={{
                  padding: "10px 12px",
                  borderRadius: 12,
                  background: "var(--ds-theme-surface-subdued)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                  color: "var(--ds-theme-content-strong)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--ds-theme-content-subtle)", minWidth: 18 }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-medium">{w}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={generate}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              color: "var(--ds-theme-content-link)",
              outlineColor: "var(--ds-theme-border-focus)",
            }}
          >
            <RefreshCw size={12} aria-hidden />
            Gerar outra
          </button>

          <div
            role="alert"
            className="mt-5 flex gap-3"
            style={{
              padding: 14,
              borderRadius: 16,
              background: "var(--ds-theme-intent-danger-subtle)",
              color: "var(--ds-theme-intent-danger-on-subtle)",
              border: "1px solid var(--ds-theme-intent-danger-border)",
            }}
          >
            <AlertTriangle size={18} className="mt-0.5 shrink-0" aria-hidden />
            <div className="text-xs leading-relaxed">
              <strong className="block text-sm font-semibold">
                Anote em papel.
              </strong>
              Sem servidor central, perder esta frase = perder o acesso para
              sempre. Ninguém pode recuperá-la por você.
            </div>
          </div>

          <Button
            type="button"
            onClick={goConfirm}
            className="mt-5 h-11 w-full rounded-full text-sm font-semibold"
            style={{
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            Já anotei, continuar
          </Button>
        </>
      ) : null}
    </OnboardingCard>
  );
}