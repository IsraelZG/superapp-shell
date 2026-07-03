import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  useValue,
  useSetValueCallback,
  useTable,
  store,
} from "@/store/hooks";
import {
  Search,
  Zap,
  Sparkles,
  Settings as SettingsIcon,
  Moon,
  MessageCircle,
  ShieldAlert,
  User as UserIcon,
  AppWindow,
  FileText,
  ChevronRight,
  Loader2,
} from "lucide-react";

type Mode = "search" | "act" | "generate";

export function CommandPalette() {
  const open = useValue("commandPaletteOpen") as boolean;
  const setOpen = useSetValueCallback(
    "commandPaletteOpen",
    (v: boolean) => v,
    [],
  );
  const navigate = useNavigate();

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setMode("search");
    }
  }, [open]);

  useEffect(() => {
    if (mode !== "search") return;
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 220);
    return () => clearTimeout(t);
  }, [query, mode]);

  const doAction = (id: string) => {
    setOpen(false);
    if (id === "settings") navigate({ to: "/configuracoes" });
    else if (id === "permissions") navigate({ to: "/configuracoes/permissoes" });
    else if (id === "agent") navigate({ to: "/agente" });
    else if (id === "theme") {
      const t = (store.getValue("theme") as string) === "dark" ? "light" : "dark";
      store.setValue("theme", t);
    } else if (id === "nav-mensagens") store.setValue("activeNav", "mensagens");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overflow-hidden p-0"
        style={{
          background: "var(--ds-theme-surface-raised)",
          color: "var(--ds-theme-content-default)",
          borderRadius: "var(--ds-component-card-radius, 24px)",
          borderColor: "var(--ds-theme-border-subtle)",
        }}
      >
        <VisuallyHidden>
          <DialogTitle>Paleta de comandos</DialogTitle>
          <DialogDescription>
            Busque, execute ações ou peça algo à IA. Use as setas e Enter.
          </DialogDescription>
        </VisuallyHidden>
        <ModeTabs mode={mode} setMode={setMode} />
        <Command shouldFilter={mode !== "search"} loop>
          <CommandInput
            value={query}
            onValueChange={setQuery}
            placeholder={
              mode === "search"
                ? "Buscar em conversas, contatos, arquivos…"
                : mode === "act"
                ? "Filtrar ações…"
                : "Peça algo à IA…"
            }
            aria-label="Campo de busca da paleta"
          />
          <CommandList>
            {mode === "search" && (
              <SearchResults query={query} loading={loading} onPick={() => setOpen(false)} />
            )}
            {mode === "act" && <ActList onPick={doAction} />}
            {mode === "generate" && <GenerateMode query={query} />}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function ModeTabs({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const tabs: { id: Mode; label: string; icon: React.ReactNode }[] = [
    { id: "search", label: "Buscar", icon: <Search size={12} /> },
    { id: "act", label: "Agir", icon: <Zap size={12} /> },
    { id: "generate", label: "Gerar", icon: <Sparkles size={12} /> },
  ];
  return (
    <div
      role="tablist"
      aria-label="Modo da paleta"
      className="flex items-center gap-1 border-b px-3 py-2"
      style={{ borderColor: "var(--ds-theme-border-subtle)" }}
    >
      {tabs.map((t) => {
        const active = mode === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => setMode(t.id)}
            className="inline-flex items-center gap-1.5 text-xs"
            style={{
              padding: "6px 10px",
              borderRadius: 9999,
              background: active
                ? "var(--ds-theme-intent-accent-fill)"
                : "var(--ds-theme-surface-subdued)",
              color: active
                ? "var(--ds-theme-intent-accent-on-fill)"
                : "var(--ds-theme-content-muted)",
            }}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function typeIcon(type: string) {
  if (type === "person") return <UserIcon size={14} />;
  if (type === "app") return <AppWindow size={14} />;
  if (type === "action") return <Zap size={14} />;
  return <FileText size={14} />;
}

export function useAllowedSearch(query: string) {
  const rows = useTable("searchIndex") as Record<
    string,
    { title: string; type: string; snippet: string; allowed: boolean }
  >;
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(rows)
      .filter(([, r]) => r.allowed)
      .filter(([, r]) =>
        q === ""
          ? true
          : r.title.toLowerCase().includes(q) ||
            r.snippet.toLowerCase().includes(q) ||
            r.type.toLowerCase().includes(q),
      )
      .map(([id, r]) => ({ id, ...r }));
  }, [rows, query]);
}

function SearchResults({
  query,
  loading,
  onPick,
}: {
  query: string;
  loading: boolean;
  onPick: () => void;
}) {
  const items = useAllowedSearch(query);
  if (loading) {
    return (
      <div className="space-y-2 p-3" aria-live="polite">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-9 w-full animate-pulse"
            style={{
              borderRadius: 12,
              background: "var(--ds-theme-surface-subdued)",
            }}
          />
        ))}
      </div>
    );
  }
  return (
    <>
      <CommandEmpty>Nenhum resultado.</CommandEmpty>
      <CommandGroup heading="Resultados">
        {items.map((it) => (
          <CommandItem key={it.id} value={`${it.title} ${it.snippet}`} onSelect={onPick}>
            {typeIcon(it.type)}
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm">{it.title}</span>
              <span
                className="truncate text-xs"
                style={{ color: "var(--ds-theme-content-muted)" }}
              >
                {it.snippet}
              </span>
            </div>
            <span
              className="ml-2 rounded px-1.5 py-0.5 text-[10px] uppercase"
              style={{
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-muted)",
              }}
            >
              {it.type}
            </span>
          </CommandItem>
        ))}
      </CommandGroup>
    </>
  );
}

function ActList({ onPick }: { onPick: (id: string) => void }) {
  const actions = [
    { id: "settings", label: "Abrir Configurações", icon: <SettingsIcon size={14} /> },
    { id: "permissions", label: "Abrir Permissões & segurança", icon: <ShieldAlert size={14} /> },
    { id: "agent", label: "Abrir painel do Agente", icon: <Sparkles size={14} /> },
    { id: "theme", label: "Alternar tema claro/escuro", icon: <Moon size={14} /> },
    { id: "nav-mensagens", label: "Ir para Mensagens", icon: <MessageCircle size={14} /> },
  ];
  return (
    <CommandGroup heading="Ações">
      {actions.map((a) => (
        <CommandItem key={a.id} value={a.label} onSelect={() => onPick(a.id)}>
          {a.icon}
          <span className="flex-1 text-sm">{a.label}</span>
          <ChevronRight size={14} style={{ color: "var(--ds-theme-content-muted)" }} />
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

function GenerateMode({ query }: { query: string }) {
  const [phase, setPhase] = useState<"idle" | "streaming" | "done" | "refused">("idle");
  const [text, setText] = useState("");

  const refused = /senha|excluir conta/i.test(query);

  const send = () => {
    if (refused) {
      setPhase("refused");
      return;
    }
    setPhase("streaming");
    setText("");
    const words =
      "Aqui está um rascunho baseado no seu pedido. Este conteúdo é gerado localmente como demonstração do padrão de streaming. Você pode aceitar ou editar antes de aplicar.".split(
        " ",
      );
    let i = 0;
    const iv = setInterval(() => {
      setText((t) => (t ? t + " " : "") + words[i]);
      i++;
      if (i >= words.length) {
        clearInterval(iv);
        setPhase("done");
      }
    }, 90);
  };

  return (
    <div className="space-y-3 p-3">
      <button
        type="button"
        onClick={send}
        disabled={phase === "streaming" || query.trim() === ""}
        className="inline-flex w-full items-center justify-center gap-2 text-sm font-medium"
        style={{
          height: 40,
          borderRadius: "var(--ds-component-button-radius, 9999px)",
          background: "var(--ds-theme-intent-accent-fill)",
          color: "var(--ds-theme-intent-accent-on-fill)",
          opacity: phase === "streaming" || query.trim() === "" ? 0.6 : 1,
        }}
      >
        {phase === "streaming" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        {phase === "streaming" ? "Gerando…" : "Enviar para IA"}
      </button>

      {phase === "refused" && (
        <div
          role="alert"
          className="p-3 text-xs"
          style={{
            borderRadius: 12,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          Isso está fora do que posso fazer aqui. Peça no assistente de conta.
        </div>
      )}

      {(phase === "streaming" || phase === "done") && (
        <div
          className="p-3 text-sm"
          style={{
            borderRadius: 12,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
            minHeight: 80,
          }}
          aria-live="polite"
        >
          {text}
          {phase === "streaming" && <span className="ml-0.5 animate-pulse">▍</span>}
        </div>
      )}
    </div>
  );
}