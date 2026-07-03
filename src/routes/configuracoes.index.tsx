import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  User as UserIcon,
  Languages,
  Palette,
  Rows3,
  Accessibility,
  Wifi,
  Activity,
  Bell,
  Sparkles,
  Download,
  Circle,
} from "lucide-react";
import {
  useValue,
  useSetValueCallback,
  useRow,
  useSortedRowIds,
  useCell,
  useSetCellCallback,
  store,
} from "@/store/hooks";
import { ThemeSync } from "@/components/shell/ThemeSync";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

export const Route = createFileRoute("/configuracoes/")({
  component: ConfiguracoesPage,
});

const cardStyle: React.CSSProperties = {
  borderRadius: "var(--ds-component-card-radius, 24px)",
  background: "var(--ds-theme-surface-raised)",
  border: "1px solid var(--ds-theme-border-subtle)",
};

const LOCALES: { value: string; label: string; rtl?: boolean }[] = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
];

function ConfiguracoesPage() {
  const density = useValue("density") as "cozy" | "compact";
  const pad = density === "compact" ? "px-3 py-4 sm:px-6 sm:py-6" : "px-4 py-6 sm:px-8 sm:py-10";
  return (
    <>
      <ThemeSync />
      <div
        className={`min-h-dvh w-full ${pad}`}
        style={{
          background: "var(--ds-theme-surface-canvas)",
          color: "var(--ds-theme-content-default)",
        }}
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm"
              style={{ color: "var(--ds-theme-content-muted)" }}
              aria-label="Voltar"
            >
              <ArrowLeft size={14} /> Voltar
            </Link>
          </div>
          <h1 className="text-2xl font-semibold">Configurações</h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--ds-theme-content-muted)" }}
          >
            Ajustes do seu SuperApp — conta, aparência, rede e notificações.
          </p>

          <Tabs defaultValue="geral" className="mt-6">
            <TabsList className="flex w-full flex-wrap justify-start gap-1 overflow-x-auto">
              <TabsTrigger value="geral">
                <UserIcon size={14} className="mr-1.5" /> Geral
              </TabsTrigger>
              <TabsTrigger value="tema">
                <Palette size={14} className="mr-1.5" /> Editor de tema
              </TabsTrigger>
              <TabsTrigger value="rede">
                <Wifi size={14} className="mr-1.5" /> Rede
              </TabsTrigger>
              <TabsTrigger value="telemetria">
                <Activity size={14} className="mr-1.5" /> Telemetria
              </TabsTrigger>
              <TabsTrigger value="notificacoes">
                <Bell size={14} className="mr-1.5" /> Notificações
              </TabsTrigger>
              <TabsTrigger value="permissoes" asChild>
                <Link
                  to="/configuracoes/permissoes"
                  className="inline-flex items-center"
                >
                  <ShieldCheck size={14} className="mr-1.5" /> Permissões
                </Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="mt-4">
              <GeralPanel />
            </TabsContent>
            <TabsContent value="tema" className="mt-4">
              <ThemeEditorPanel />
            </TabsContent>
            <TabsContent value="rede" className="mt-4">
              <RedePanel />
            </TabsContent>
            <TabsContent value="telemetria" className="mt-4">
              <TelemetriaPanel />
            </TabsContent>
            <TabsContent value="notificacoes" className="mt-4">
              <NotificacoesPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function SectionCard({
  title,
  icon,
  children,
  description,
}: {
  title: string;
  icon?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
}) {
  const density = useValue("density") as "cozy" | "compact";
  const inner = density === "compact" ? "p-4" : "p-6";
  return (
    <section style={cardStyle} className={inner}>
      <header className="mb-4 flex items-center gap-2">
        {icon ? (
          <span
            aria-hidden="true"
            className="grid place-items-center"
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
            }}
          >
            {icon}
          </span>
        ) : null}
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description ? (
            <p
              className="text-xs"
              style={{ color: "var(--ds-theme-content-muted)" }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function Row({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-t py-3 first:border-t-0 first:pt-0"
      style={{ borderColor: "var(--ds-theme-border-subtle)" }}
    >
      <div className="min-w-0">
        <Label
          htmlFor={htmlFor}
          className="text-sm font-medium"
          style={{ color: "var(--ds-theme-content-default)" }}
        >
          {label}
        </Label>
        {hint ? (
          <div
            className="text-xs"
            style={{ color: "var(--ds-theme-content-muted)" }}
          >
            {hint}
          </div>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/* ============================ GERAL ============================ */

function GeralPanel() {
  const me = useRow("currentUser", "me") as { name?: string; avatarUrl?: string };
  const setName = useSetCellCallback(
    "currentUser",
    "me",
    "name",
    (v: string) => v,
    [],
  );

  const locale = useValue("locale") as string;
  const setLocale = useSetValueCallback("locale", (v: string) => v, []);

  const theme = useValue("theme") as "light" | "dark";
  const setTheme = useSetValueCallback("theme", (v: "light" | "dark") => v, []);

  const density = useValue("density") as "cozy" | "compact";
  const setDensity = useSetValueCallback(
    "density",
    (v: "cozy" | "compact") => v,
    [],
  );

  const highContrast = useValue("highContrast") as boolean;
  const setHC = useSetValueCallback("highContrast", (v: boolean) => v, []);

  const reduceMotion = useValue("reduceMotion") as boolean;
  const setRM = useSetValueCallback("reduceMotion", (v: boolean) => v, []);

  const [devices, setDevices] = useState([
    { id: "d1", name: "MacBook Pro — Israel", info: "Sessão atual · São Paulo" },
    { id: "d2", name: "iPhone 15 — Israel", info: "Ativo há 2 min" },
  ]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <SectionCard title="Conta" icon={<UserIcon size={14} />}>
        <Row label="Nome" htmlFor="acc-name" hint="Como você aparece na sua rede.">
          <Input
            id="acc-name"
            value={me.name ?? ""}
            onChange={(e) => setName(e.target.value)}
            className="w-64"
            style={{
              borderRadius: 16,
              background: "var(--ds-theme-surface-subdued)",
              borderColor: "var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-default)",
            }}
          />
        </Row>
        <div
          className="mt-3 border-t pt-3"
          style={{ borderColor: "var(--ds-theme-border-subtle)" }}
        >
          <div className="mb-2 text-sm font-medium">Dispositivos pareados</div>
          <ul className="space-y-2">
            {devices.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 p-3"
                style={{
                  borderRadius: 16,
                  background: "var(--ds-theme-surface-subdued)",
                }}
              >
                <div className="min-w-0">
                  <div className="text-sm">{d.name}</div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--ds-theme-content-muted)" }}
                  >
                    {d.info}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setDevices((xs) => xs.filter((x) => x.id !== d.id))
                  }
                  aria-label={`Revogar sessão de ${d.name}`}
                  style={{
                    borderRadius: "var(--ds-component-button-radius, 9999px)",
                    borderColor: "var(--ds-theme-border-default)",
                    color: "var(--ds-theme-content-default)",
                  }}
                >
                  Revogar sessão
                </Button>
              </li>
            ))}
            {devices.length === 0 ? (
              <li
                className="p-3 text-xs"
                style={{ color: "var(--ds-theme-content-muted)" }}
              >
                Nenhum dispositivo pareado.
              </li>
            ) : null}
          </ul>
        </div>
      </SectionCard>

      <SectionCard title="Idioma & região" icon={<Languages size={14} />}>
        <Row label="Idioma" htmlFor="locale-select" hint="Alguns idiomas usam RTL (ex.: árabe, hebraico) — o design já suporta.">
          <Select value={locale} onValueChange={(v) => setLocale(v)}>
            <SelectTrigger id="locale-select" className="w-64"
              style={{
                borderRadius: 16,
                background: "var(--ds-theme-surface-subdued)",
                borderColor: "var(--ds-theme-border-subtle)",
                color: "var(--ds-theme-content-default)",
              }}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOCALES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </SectionCard>

      <SectionCard title="Aparência" icon={<Palette size={14} />}>
        <Row label="Tema" hint="Claro ou escuro — reflete em todo o app.">
          <div className="flex gap-1" role="radiogroup" aria-label="Tema">
            {(["light", "dark"] as const).map((t) => {
              const active = theme === t;
              return (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setTheme(t)}
                  className="px-3 py-1.5 text-xs font-medium"
                  style={{
                    borderRadius: 9999,
                    background: active
                      ? "var(--ds-theme-intent-accent-fill)"
                      : "var(--ds-theme-surface-subdued)",
                    color: active
                      ? "var(--ds-theme-intent-accent-on-fill)"
                      : "var(--ds-theme-content-default)",
                  }}
                >
                  {t === "light" ? "Claro" : "Escuro"}
                </button>
              );
            })}
          </div>
        </Row>
        <Row label="Densidade" hint="Cozy = respiração; Compact = mais informação por tela.">
          <div className="flex gap-1" role="radiogroup" aria-label="Densidade">
            {(["cozy", "compact"] as const).map((d) => {
              const active = density === d;
              return (
                <button
                  key={d}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setDensity(d)}
                  className="px-3 py-1.5 text-xs font-medium"
                  style={{
                    borderRadius: 9999,
                    background: active
                      ? "var(--ds-theme-intent-accent-fill)"
                      : "var(--ds-theme-surface-subdued)",
                    color: active
                      ? "var(--ds-theme-intent-accent-on-fill)"
                      : "var(--ds-theme-content-default)",
                  }}
                >
                  {d === "cozy" ? "Cozy" : "Compact"}
                </button>
              );
            })}
          </div>
        </Row>
      </SectionCard>

      <SectionCard title="Acessibilidade" icon={<Accessibility size={14} />}>
        <Row label="Alto contraste" htmlFor="hc-switch" hint="Reforça bordas e contraste de texto.">
          <Switch id="hc-switch" checked={highContrast} onCheckedChange={(v) => setHC(v)} />
        </Row>
        <Row label="Reduzir movimento" htmlFor="rm-switch" hint="Diminui transições e animações.">
          <Switch id="rm-switch" checked={reduceMotion} onCheckedChange={(v) => setRM(v)} />
        </Row>
      </SectionCard>
    </div>
  );
}

/* ========================== THEME EDITOR ========================== */

const THEME_LEVELS = [
  { id: "app", label: "App", hint: "Tokens globais aplicados a toda a experiência." },
  { id: "modulo", label: "Módulo", hint: "Sobrepõe tokens dentro de um módulo (ex.: Studio)." },
  { id: "pagina", label: "Página", hint: "Refina tokens em uma página específica." },
  { id: "componente", label: "Componente", hint: "Ajustes finos em um componente." },
];

const EDITABLE_TOKENS = [
  { id: "accent", label: "Cor de destaque", default: "#8b5cf6", kind: "color" as const },
  { id: "bg", label: "Cor de fundo", default: "#ffffff", kind: "color" as const },
  { id: "text", label: "Cor de texto", default: "#0f172a", kind: "color" as const },
  { id: "muted", label: "Cor de texto secundário", default: "#64748b", kind: "color" as const },
  { id: "border", label: "Cor de borda", default: "#e2e8f0", kind: "color" as const },
  { id: "radius", label: "Raio de borda (px)", default: "24", kind: "number" as const },
];

function ThemeEditorPanel() {
  const [level, setLevel] = useState("app");
  const [tokens, setTokens] = useState<Record<string, string>>(
    Object.fromEntries(EDITABLE_TOKENS.map((t) => [t.id, t.default])),
  );

  const previewStyle: React.CSSProperties = {
    background: tokens.bg,
    color: tokens.text,
    borderRadius: `${tokens.radius}px`,
    border: `1px solid ${tokens.border}`,
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
      <SectionCard title="Hierarquia" icon={<Rows3 size={14} />}
        description="4 níveis de sobreposição.">
        <Accordion type="single" collapsible defaultValue="app">
          {THEME_LEVELS.map((lvl) => (
            <AccordionItem key={lvl.id} value={lvl.id}>
              <AccordionTrigger onClick={() => setLevel(lvl.id)}>
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="inline-block"
                    style={{
                      width: 8, height: 8, borderRadius: 9999,
                      background: level === lvl.id
                        ? "var(--ds-theme-intent-accent-fill)"
                        : "var(--ds-theme-border-default)",
                    }}
                  />
                  {lvl.label}
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                  {lvl.hint}
                </p>
                <button
                  type="button"
                  onClick={() => setLevel(lvl.id)}
                  className="mt-2 text-xs underline"
                  style={{ color: "var(--ds-theme-intent-accent-fill)" }}
                >
                  Editar tokens deste nível
                </button>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </SectionCard>

      <SectionCard title={`Tokens — ${THEME_LEVELS.find((l) => l.id === level)?.label}`} icon={<Palette size={14} />}>
        <div className="space-y-1">
          {EDITABLE_TOKENS.map((t) => (
            <Row key={t.id} label={t.label} htmlFor={`tok-${t.id}`}>
              {t.kind === "color" ? (
                <div className="flex items-center gap-2">
                  <input
                    id={`tok-${t.id}`}
                    type="color"
                    aria-label={t.label}
                    value={tokens[t.id]}
                    onChange={(e) =>
                      setTokens((prev) => ({ ...prev, [t.id]: e.target.value }))
                    }
                    style={{
                      width: 40, height: 32, borderRadius: 10,
                      border: "1px solid var(--ds-theme-border-subtle)",
                      background: "transparent",
                    }}
                  />
                  <code
                    className="text-xs"
                    style={{ color: "var(--ds-theme-content-muted)" }}
                  >
                    {tokens[t.id]}
                  </code>
                </div>
              ) : (
                <Input
                  id={`tok-${t.id}`}
                  type="number"
                  value={tokens[t.id]}
                  onChange={(e) =>
                    setTokens((prev) => ({ ...prev, [t.id]: e.target.value }))
                  }
                  className="w-24"
                  style={{
                    borderRadius: 12,
                    background: "var(--ds-theme-surface-subdued)",
                    borderColor: "var(--ds-theme-border-subtle)",
                    color: "var(--ds-theme-content-default)",
                  }}
                />
              )}
            </Row>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={() => toast.success("Tema customizado salvo (mock)")}
            style={{ borderRadius: "var(--ds-component-button-radius, 9999px)" }}
          >
            <Sparkles size={14} className="mr-1.5" /> Salvar como tema customizado
          </Button>
        </div>
      </SectionCard>

      <SectionCard title="Preview ao vivo" icon={<Palette size={14} />}>
        <div className="p-4" style={previewStyle}>
          <div
            className="mb-2 inline-block px-2 py-1 text-xs font-medium"
            style={{
              background: tokens.accent,
              color: "#fff",
              borderRadius: 9999,
            }}
          >
            Destaque
          </div>
          <div className="text-sm font-semibold" style={{ color: tokens.text }}>
            Card de exemplo
          </div>
          <div className="mt-1 text-xs" style={{ color: tokens.muted }}>
            As alterações são aplicadas apenas neste preview.
          </div>
          <button
            type="button"
            className="mt-3 px-3 py-1.5 text-xs font-medium"
            style={{
              background: tokens.accent,
              color: "#fff",
              borderRadius: 9999,
            }}
          >
            Ação primária
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

/* ============================ REDE ============================ */

function RedePanel() {
  const online = useValue("online") as boolean;
  const syncStatus = useValue("syncStatus") as "synced" | "syncing" | "offline";
  const ids = useSortedRowIds("peers", "name");

  return (
    <div className="grid gap-4">
      <SectionCard title="Status P2P" icon={<Wifi size={14} />}>
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            tone={online ? "success" : "neutral"}
            label={online ? "Online" : "Offline"}
          />
          <StatusBadge
            tone={syncStatus === "synced" ? "success" : syncStatus === "syncing" ? "warning" : "neutral"}
            label={
              syncStatus === "synced"
                ? "Sincronizado"
                : syncStatus === "syncing"
                  ? "Sincronizando…"
                  : "Sem sincronização"
            }
          />
        </div>
      </SectionCard>

      <SectionCard title="Peers" icon={<UserIcon size={14} />}
        description="Dispositivos e pessoas conectados à sua rede local-first.">
        <ul className="divide-y" style={{ borderColor: "var(--ds-theme-border-subtle)" }}>
          {ids.map((id) => (
            <PeerRow key={id} id={id} />
          ))}
          {ids.length === 0 ? (
            <li className="py-4 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
              Nenhum peer descoberto.
            </li>
          ) : null}
        </ul>
      </SectionCard>
    </div>
  );
}

function PeerRow({ id }: { id: string }) {
  const row = useRow("peers", id) as { name?: string; status?: "online" | "offline" | "syncing"; lastSeen?: string };
  const tone =
    row.status === "online" ? "success" : row.status === "syncing" ? "warning" : "neutral";
  return (
    <li className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{row.name}</div>
        <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Visto {row.lastSeen}
        </div>
      </div>
      <StatusBadge tone={tone} label={row.status ?? ""} />
    </li>
  );
}

function StatusBadge({ tone, label }: { tone: "success" | "warning" | "neutral"; label: string }) {
  const bg =
    tone === "success"
      ? "var(--ds-theme-intent-success-surface, var(--ds-theme-surface-subdued))"
      : tone === "warning"
        ? "var(--ds-theme-intent-warning-surface, var(--ds-theme-surface-subdued))"
        : "var(--ds-theme-surface-subdued)";
  const fg =
    tone === "success"
      ? "var(--ds-theme-intent-success-fill, var(--ds-theme-content-default))"
      : tone === "warning"
        ? "var(--ds-theme-intent-warning-fill, var(--ds-theme-content-default))"
        : "var(--ds-theme-content-muted)";
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium capitalize"
      style={{ background: bg, color: fg, borderRadius: 9999 }}
    >
      <Circle size={8} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      {label}
    </span>
  );
}

/* ========================== TELEMETRIA ========================== */

function TelemetriaPanel() {
  const bars = useMemo(() => [12, 18, 9, 22, 15, 28, 19, 24, 30, 21, 17, 25], []);
  const max = Math.max(...bars);
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="RTT médio" value="47 ms" hint="Últimos 5 minutos" />
        <Metric label="Bytes por onda" value="12,4 KB" hint="Média por sincronização" />
        <Metric label="Tamanho do WAL" value="3,1 MB" hint="Log local pendente" />
      </div>

      <SectionCard title="Tráfego (últimas horas)" icon={<Activity size={14} />}>
        <div className="flex items-end gap-1.5" style={{ height: 120 }}>
          {bars.map((v, i) => (
            <div
              key={i}
              aria-label={`Barra ${i + 1}: ${v}`}
              style={{
                flex: 1,
                height: `${(v / max) * 100}%`,
                background: "var(--ds-theme-intent-accent-fill)",
                borderRadius: 6,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => toast.success("Exportado (mock)")}
            style={{
              borderRadius: "var(--ds-component-button-radius, 9999px)",
              borderColor: "var(--ds-theme-border-default)",
              color: "var(--ds-theme-content-default)",
            }}
          >
            <Download size={14} className="mr-1.5" /> Exportar
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div style={cardStyle} className="p-5">
      <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{label}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{hint}</div>
    </div>
  );
}

/* ========================== NOTIFICATIONS ========================== */

function NotificacoesPanel() {
  const ids = useSortedRowIds("notifications", "createdAt", true);
  return (
    <SectionCard title="Central de notificações" icon={<Bell size={14} />}
      description="Toque em uma notificação para marcá-la como lida.">
      <ul className="divide-y" style={{ borderColor: "var(--ds-theme-border-subtle)" }}>
        {ids.map((id) => (
          <NotificationRow key={id} id={id} />
        ))}
        {ids.length === 0 ? (
          <li className="py-4 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
            Sem notificações.
          </li>
        ) : null}
      </ul>
    </SectionCard>
  );
}

function NotificationRow({ id }: { id: string }) {
  const row = useRow("notifications", id) as {
    title?: string; body?: string; read?: boolean; createdAt?: string; kind?: string;
  };
  const read = useCell("notifications", id, "read") as boolean;
  const markRead = useSetCellCallback(
    "notifications",
    id,
    "read",
    () => true,
    [],
  );
  const date = row.createdAt ? new Date(row.createdAt) : null;
  const day = date ? date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : "";
  const time = date ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

  return (
    <li>
      <button
        type="button"
        onClick={() => markRead()}
        aria-label={`${row.title} — ${read ? "lida" : "não lida"}`}
        className="flex w-full items-start gap-3 py-3 text-left"
      >
        <span
          aria-hidden="true"
          className="mt-1.5 inline-block shrink-0"
          style={{
            width: 8, height: 8, borderRadius: 9999,
            background: read
              ? "var(--ds-theme-border-default)"
              : "var(--ds-theme-intent-accent-fill)",
          }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="text-sm font-medium">{row.title}</div>
            <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
              {day} · {time}
            </div>
          </div>
          <div className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            {row.body}
          </div>
          {row.kind ? (
            <Badge
              variant="outline"
              className="mt-1 capitalize"
              style={{
                borderColor: "var(--ds-theme-border-subtle)",
                color: "var(--ds-theme-content-muted)",
              }}
            >
              {row.kind}
            </Badge>
          ) : null}
        </div>
      </button>
    </li>
  );
}