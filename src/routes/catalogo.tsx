import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSortedRowIds, useCell } from "@/store/hooks";
import {
  ConfirmModal,
  DestructiveModal,
  FormModal,
  BottomSheet,
  WizardModal,
} from "@/components/catalog/Modals";
import {
  ContextMenuExample,
  OverflowMenu,
  ComboboxSelect,
  SimpleDropdown,
} from "@/components/catalog/Menus";
import {
  EmptyState,
  ErrorState,
  SkeletonCard,
  OfflineBanner,
  SyncingState,
  PendingBadge,
  DoneBadge,
  AccessDeniedState,
  BlockedContentPlaceholder,
  TTLLock,
} from "@/components/catalog/States";
import { Banner, CountBadge } from "@/components/catalog/Notifications";
import {
  BreadcrumbDemo,
  Paginator,
  InfiniteList,
  SearchInput,
} from "@/components/catalog/Navigation";
import { SagaProgress, CompensationBadge, type SagaStep } from "@/components/catalog/SagaFeedback";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo — SuperApp" },
      { name: "description", content: "Referência viva dos componentes reutilizáveis do SuperApp." },
    ],
  }),
  component: CatalogPage,
});

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <header>
        <h2 className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          {title}
        </h2>
        {description && (
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{description}</p>
        )}
      </header>
      <div
        className="flex flex-wrap items-start gap-3 p-4"
        style={{
          borderRadius: "var(--ds-component-card-radius, 24px)",
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        {children}
      </div>
    </section>
  );
}

function CatalogItemRow({ id }: { id: string }) {
  const title = useCell("catalogItems", id, "title") as string;
  const subtitle = useCell("catalogItems", id, "subtitle") as string;
  const status = useCell("catalogItems", id, "status") as string;
  return (
    <div
      className="flex items-center justify-between gap-3 px-3 py-2"
      style={{
        borderRadius: 12,
        background: "var(--ds-theme-surface-subdued)",
      }}
    >
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{title}</div>
        <div className="truncate text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>{subtitle}</div>
      </div>
      {status === "done" ? <DoneBadge /> : <PendingBadge />}
    </div>
  );
}

function CatalogPage() {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [destructiveOpen, setDestructiveOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const [combo, setCombo] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [saga, setSaga] = useState<SagaStep[]>([
    { id: "1", label: "Reservado", status: "done" },
    { id: "2", label: "Pago", status: "current" },
    { id: "3", label: "Enviado", status: "pending" },
    { id: "4", label: "Concluído", status: "pending" },
  ]);

  const itemIds = useSortedRowIds("catalogItems", "order");
  const infiniteItems = Array.from({ length: 20 }, (_, i) => `Item de exemplo #${i + 1}`);

  const advanceSaga = () => {
    setSaga((prev) => {
      const i = prev.findIndex((s) => s.status === "current");
      if (i === -1) return prev;
      const next = [...prev];
      next[i] = { ...next[i], status: "done" };
      if (i + 1 < next.length) next[i + 1] = { ...next[i + 1], status: "current" };
      return next;
    });
  };
  const compensateSaga = () => {
    setSaga((prev) =>
      prev.map((s) => (s.status === "current" || s.status === "done" ? { ...s, status: "compensated" } : s)),
    );
  };
  const resetSaga = () => {
    setSaga([
      { id: "1", label: "Reservado", status: "done" },
      { id: "2", label: "Pago", status: "current" },
      { id: "3", label: "Enviado", status: "pending" },
      { id: "4", label: "Concluído", status: "pending" },
    ]);
  };

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "var(--ds-theme-surface-canvas)", color: "var(--ds-theme-content-default)" }}
    >
      <Toaster />
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--ds-theme-border-subtle)", background: "var(--ds-theme-surface-default)" }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            SuperApp
          </p>
          <h1 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Catálogo de componentes
          </h1>
        </div>
        <Link
          to="/"
          className="text-xs font-semibold"
          style={{
            padding: "8px 14px",
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          Voltar ao app
        </Link>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <Tabs defaultValue="modais">
          <TabsList className="flex w-full flex-wrap gap-1">
            <TabsTrigger value="modais">Modais</TabsTrigger>
            <TabsTrigger value="menus">Menus</TabsTrigger>
            <TabsTrigger value="estados">Estados</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="navegacao">Navegação</TabsTrigger>
            <TabsTrigger value="saga">Saga</TabsTrigger>
          </TabsList>

          <TabsContent value="modais" className="mt-4 flex flex-col gap-6">
            <Section title="Confirmação" description="Ação reversível — Dialog padrão.">
              <Button onClick={() => setConfirmOpen(true)}>Abrir confirmação</Button>
            </Section>
            <Section title="Destrutivo" description="Exige acknowledgment antes de habilitar o botão.">
              <Button variant="destructive" onClick={() => setDestructiveOpen(true)}>Excluir conta…</Button>
            </Section>
            <Section title="Formulário" description="Validação inline, foco no primeiro campo.">
              <Button onClick={() => setFormOpen(true)}>Novo contato</Button>
            </Section>
            <Section title="Sheet inferior" description="Ideal para ações rápidas em mobile.">
              <Button variant="outline" onClick={() => setSheetOpen(true)}>Abrir sheet</Button>
            </Section>
            <Section title="Wizard multi-passo" description="Stepper + Voltar/Próximo/Concluir.">
              <Button onClick={() => setWizardOpen(true)}>Iniciar wizard</Button>
            </Section>
          </TabsContent>

          <TabsContent value="menus" className="mt-4 flex flex-col gap-6">
            <Section title="Contexto (right-click / long-press)" description="Clique com o botão direito no card.">
              <ContextMenuExample>
                <Card
                  className="grid h-24 w-56 place-items-center text-xs"
                  style={{
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-muted)",
                  }}
                >
                  Clique com o botão direito
                </Card>
              </ContextMenuExample>
            </Section>
            <Section title="Overflow (⋯)">
              <OverflowMenu
                items={[
                  { label: "Editar", onSelect: () => toast("Editar acionado") },
                  { label: "Duplicar", onSelect: () => toast("Duplicado") },
                  { label: "Excluir", onSelect: () => toast.error("Excluído") },
                ]}
              />
            </Section>
            <Section title="Combobox (Select com busca)">
              <div className="w-64">
                <ComboboxSelect
                  value={combo}
                  onChange={setCombo}
                  options={[
                    { value: "pt-BR", label: "Português (Brasil)" },
                    { value: "en", label: "English" },
                    { value: "es", label: "Español" },
                    { value: "fr", label: "Français" },
                    { value: "de", label: "Deutsch" },
                    { value: "it", label: "Italiano" },
                  ]}
                />
              </div>
            </Section>
            <Section title="Dropdown simples">
              <SimpleDropdown
                label="Ordenar por"
                items={[
                  { label: "Mais recentes", onSelect: () => toast("Ordenado por data") },
                  { label: "Alfabético", onSelect: () => toast("Ordenado A-Z") },
                ]}
              />
            </Section>
            <Section title="Comando (paleta global)" description="Reusa CommandPalette de A5 — atalho ⌘K / Ctrl+K.">
              <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                Pressione ⌘K / Ctrl+K em qualquer tela do app para abrir.
              </p>
            </Section>
          </TabsContent>

          <TabsContent value="estados" className="mt-4 grid gap-4 md:grid-cols-2">
            <EmptyState actionLabel="Criar item" onAction={() => toast("Item criado")} />
            <ErrorState onRetry={() => toast("Retentando…")} />
            <SkeletonCard />
            <SyncingState label="Sincronizando peers…" />
            <AccessDeniedState />
            <BlockedContentPlaceholder />
            <div className="md:col-span-2">
              <OfflineBanner />
            </div>
            <Section title="Pendente vs Finalizado (via TinyBase)">
              <div className="flex w-full flex-col gap-2">
                {itemIds.map((id) => (
                  <CatalogItemRow key={id} id={id} />
                ))}
              </div>
            </Section>
            <Section title="Lock com TTL">
              <TTLLock until="14:32" />
            </Section>
          </TabsContent>

          <TabsContent value="notificacoes" className="mt-4 flex flex-col gap-4">
            <Section title="Toasts (sonner)">
              <Button onClick={() => toast("Alterações salvas")}>Toast neutro</Button>
              <Button onClick={() => toast.success("Pedido confirmado")}>Toast sucesso</Button>
              <Button onClick={() => toast.error("Falha ao sincronizar")}>Toast erro</Button>
              <Button
                onClick={() =>
                  toast("Convite enviado", {
                    description: "Ana Ribeiro receberá em instantes.",
                  })
                }
              >
                Toast com descrição
              </Button>
            </Section>
            <Section title="Banners">
              <div className="flex w-full flex-col gap-2">
                <Banner intent="info" title="Nova versão disponível">SuperApp 1.4 traz melhorias no editor de tema.</Banner>
                <Banner intent="warn" title="Sincronização pendente">3 mudanças aguardando peers.</Banner>
                <Banner intent="error" title="Não foi possível conectar">Verifique sua rede.</Banner>
                <Banner intent="success" title="Backup concluído">Todos os dispositivos em dia.</Banner>
              </div>
            </Section>
            <Section title="Badges de contagem">
              <div className="flex items-center gap-3">
                <CountBadge count={3} />
                <CountBadge count={42} />
                <CountBadge count={128} />
              </div>
            </Section>
            <Section title="Central de notificações">
              <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                Definida em A4 — acesse em <Link to="/configuracoes" className="underline">Configurações → Notificações</Link>.
              </p>
            </Section>
          </TabsContent>

          <TabsContent value="navegacao" className="mt-4 flex flex-col gap-4">
            <Section title="Tabs">
              <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                Esta própria página usa o padrão de tabs (shadcn Tabs).
              </p>
            </Section>
            <Section title="Breadcrumb">
              <BreadcrumbDemo />
            </Section>
            <Section title="Busca com debounce">
              <div className="w-full max-w-sm">
                <SearchInput value={search} onChange={setSearch} placeholder="Buscar itens…" />
              </div>
            </Section>
            <Section title="Paginação numérica">
              <Paginator page={page} total={5} onChange={setPage} />
            </Section>
            <Section title="Scroll infinito">
              <div className="w-full">
                <InfiniteList items={infiniteItems} />
              </div>
            </Section>
          </TabsContent>

          <TabsContent value="saga" className="mt-4 flex flex-col gap-4">
            <Section title="Progresso da saga" description="Reservado → Pago → Enviado → Concluído.">
              <div className="w-full">
                <SagaProgress steps={saga} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={advanceSaga}>Avançar etapa</Button>
                <Button size="sm" variant="outline" onClick={compensateSaga}>Simular compensação</Button>
                <Button size="sm" variant="ghost" onClick={resetSaga}>Reiniciar</Button>
              </div>
            </Section>
            <Section title="Badge de compensação">
              <CompensationBadge />
            </Section>
            <Section title="Lock com TTL">
              <TTLLock until="14:32" />
              <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                Comunica que um recurso está temporariamente reservado.
              </p>
            </Section>
          </TabsContent>
        </Tabs>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Marcar como lido?"
        description="Todos os itens desta conversa serão marcados como lidos."
        onConfirm={() => toast.success("Marcado como lido")}
      />
      <DestructiveModal
        open={destructiveOpen}
        onOpenChange={setDestructiveOpen}
        title="Excluir conta"
        description="Esta ação remove sua conta local e todas as chaves associadas. Não há como recuperar."
        onConfirm={() => toast.error("Conta excluída (mock)")}
      />
      <FormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={(d) => toast.success(`Contato ${d.name} salvo`)}
      />
      <BottomSheet open={sheetOpen} onOpenChange={setSheetOpen} title="Ações rápidas">
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => { toast("Compartilhado"); setSheetOpen(false); }}>Compartilhar</Button>
          <Button variant="outline" onClick={() => { toast("Arquivado"); setSheetOpen(false); }}>Arquivar</Button>
          <Button variant="destructive" onClick={() => { toast.error("Excluído"); setSheetOpen(false); }}>Excluir</Button>
        </div>
      </BottomSheet>
      <WizardModal
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        onFinish={() => toast.success("Configuração concluída")}
      />
    </div>
  );
}