import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  User as UserIcon,
  Sparkles,
  Check,
  Loader2,
  Search,
  FileText,
  AppWindow,
  Zap,
} from "lucide-react";
import { useSortedRowIds, useRow } from "@/store/hooks";
import { ThemeSync } from "@/components/shell/ThemeSync";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAllowedSearch } from "@/components/ai/CommandPalette";

export const Route = createFileRoute("/agente")({
  component: AgentPage,
});

function AgentPage() {
  return (
    <>
      <ThemeSync />
      <div
        className="min-h-dvh w-full px-4 py-6 sm:px-8 sm:py-10"
        style={{
          background: "var(--ds-theme-surface-canvas)",
          color: "var(--ds-theme-content-default)",
        }}
      >
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm"
              style={{ color: "var(--ds-theme-content-muted)" }}
            >
              <ArrowLeft size={14} /> Voltar
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">Agente & IA</h1>
            <p
              className="mt-1 text-sm"
              style={{ color: "var(--ds-theme-content-muted)" }}
            >
              Timeline de ações, busca híbrida com proveniência e geração de página assistida.
            </p>
          </div>

          <Timeline />
          <HybridSearch />
          <PageGeneration />
        </div>
      </div>
    </>
  );
}

function Timeline() {
  const ids = useSortedRowIds("agentActions", "timestamp");
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--ds-theme-content-muted)" }}>
        Linha do tempo
      </h2>
      <div
        className="overflow-hidden"
        style={{
          borderRadius: "var(--ds-component-card-radius, 24px)",
          background: "var(--ds-theme-surface-raised)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <ul className="divide-y" style={{ borderColor: "var(--ds-theme-border-subtle)" }}>
          {ids.map((id) => <TimelineRow key={id} id={id} />)}
        </ul>
      </div>
    </section>
  );
}

function TimelineRow({ id }: { id: string }) {
  const r = useRow("agentActions", id) as {
    actor?: "user" | "agent";
    action?: string;
    timestamp?: string;
    status?: "done" | "in_progress";
  };
  const isAgent = r.actor === "agent";
  const time = r.timestamp ? new Date(r.timestamp).toLocaleString("pt-BR") : "";
  return (
    <li className="flex items-start gap-3 p-4">
      <span
        aria-label={isAgent ? "Ação do agente" : "Ação do usuário"}
        className="flex h-9 w-9 shrink-0 items-center justify-center"
        style={{
          borderRadius: 9999,
          background: isAgent
            ? "var(--ds-theme-intent-accent-fill)"
            : "var(--ds-theme-surface-subdued)",
          color: isAgent
            ? "var(--ds-theme-intent-accent-on-fill)"
            : "var(--ds-theme-content-default)",
        }}
      >
        {isAgent ? <Sparkles size={16} /> : <UserIcon size={16} />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            style={{
              borderColor: isAgent
                ? "var(--ds-theme-intent-accent-fill)"
                : "var(--ds-theme-border-subtle)",
              color: isAgent
                ? "var(--ds-theme-intent-accent-fill)"
                : "var(--ds-theme-content-muted)",
            }}
          >
            {isAgent ? "Agente" : "Você"}
          </Badge>
          <span className="text-sm">{r.action}</span>
        </div>
        <div
          className="mt-1 text-xs"
          style={{ color: "var(--ds-theme-content-muted)" }}
        >
          {time}
        </div>
      </div>
      <span aria-label={r.status === "done" ? "Concluída" : "Em progresso"}>
        {r.status === "done" ? (
          <Check size={16} style={{ color: "var(--ds-theme-content-muted)" }} />
        ) : (
          <Loader2 size={16} className="animate-spin" style={{ color: "var(--ds-theme-intent-accent-fill)" }} />
        )}
      </span>
    </li>
  );
}

function sourceLabel(type: string) {
  if (type === "person") return "Fonte: Contatos";
  if (type === "app") return "Fonte: Módulos";
  if (type === "action") return "Fonte: Ações";
  return "Fonte: Mensagens";
}

function typeIcon(type: string) {
  if (type === "person") return <UserIcon size={14} />;
  if (type === "app") return <AppWindow size={14} />;
  if (type === "action") return <Zap size={14} />;
  return <FileText size={14} />;
}

function HybridSearch() {
  const [q, setQ] = useState("contrato");
  const items = useAllowedSearch(q);
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--ds-theme-content-muted)" }}>
        Recuperação híbrida (RRF)
      </h2>
      <div
        className="space-y-3 p-4"
        style={{
          borderRadius: "var(--ds-component-card-radius, 24px)",
          background: "var(--ds-theme-surface-raised)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <div className="flex items-center gap-2">
          <Search size={16} style={{ color: "var(--ds-theme-content-muted)" }} />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar…"
            aria-label="Consulta de busca híbrida"
          />
        </div>
        {items.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
            Nenhum resultado permitido.
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-start gap-3 p-3"
                style={{
                  borderRadius: 16,
                  background: "var(--ds-theme-surface-subdued)",
                }}
              >
                <span
                  className="mt-0.5 flex h-7 w-7 items-center justify-center"
                  style={{
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-default)",
                  }}
                >
                  {typeIcon(it.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{it.title}</div>
                  <div className="truncate text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {it.snippet}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  style={{
                    borderColor: "var(--ds-theme-border-subtle)",
                    color: "var(--ds-theme-content-muted)",
                  }}
                >
                  {sourceLabel(it.type)}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function PageGeneration() {
  const [phase, setPhase] = useState<"idle" | "streaming" | "done">("idle");
  const [lines, setLines] = useState<string[]>([]);

  const start = () => {
    setPhase("streaming");
    setLines([]);
    const script = [
      "# Página de exemplo gerada",
      "Este é um layout inicial montado pelo agente com base nos seus dados locais.",
      "• Seção 1: resumo de atividades recentes",
      "• Seção 2: pessoas em destaque desta semana",
      "• Seção 3: próximas ações sugeridas",
      "Você pode ajustar tudo antes de aplicar.",
    ];
    let i = 0;
    const iv = setInterval(() => {
      setLines((prev) => [...prev, script[i]]);
      i++;
      if (i >= script.length) {
        clearInterval(iv);
        setPhase("done");
      }
    }, 420);
  };

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide"
        style={{ color: "var(--ds-theme-content-muted)" }}>
        Geração de página com IA
      </h2>
      <div
        className="space-y-4 p-4"
        style={{
          borderRadius: "var(--ds-component-card-radius, 24px)",
          background: "var(--ds-theme-surface-raised)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <Button
          onClick={start}
          disabled={phase === "streaming"}
          style={{
            borderRadius: "var(--ds-component-button-radius, 9999px)",
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          {phase === "streaming" ? (
            <><Loader2 size={14} className="animate-spin" /> Gerando…</>
          ) : (
            <><Sparkles size={14} /> Gerar página de exemplo com IA</>
          )}
        </Button>

        {(phase === "streaming" || phase === "done") && (
          <div
            aria-live="polite"
            className="space-y-2 p-4 text-sm"
            style={{
              borderRadius: 16,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
              minHeight: 140,
            }}
          >
            {lines.length === 0 && phase === "streaming" && (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-full animate-pulse"
                    style={{
                      borderRadius: 8,
                      background: "var(--ds-theme-surface-default)",
                      width: `${80 - i * 10}%`,
                    }}
                  />
                ))}
              </div>
            )}
            {lines.map((l, i) => (
              <div
                key={i}
                style={{
                  fontWeight: l.startsWith("#") ? 600 : 400,
                  fontSize: l.startsWith("#") ? 16 : 14,
                }}
              >
                {l.replace(/^#\s*/, "")}
              </div>
            ))}
          </div>
        )}

        {phase === "done" && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {}}
              style={{
                borderRadius: "var(--ds-component-button-radius, 9999px)",
                background: "var(--ds-theme-intent-accent-fill)",
                color: "var(--ds-theme-intent-accent-on-fill)",
              }}
            >
              Aceitar
            </Button>
            <Button
              variant="outline"
              onClick={() => {}}
              style={{
                borderRadius: "var(--ds-component-button-radius, 9999px)",
                borderColor: "var(--ds-theme-border-default)",
                color: "var(--ds-theme-content-default)",
              }}
            >
              Editar
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}