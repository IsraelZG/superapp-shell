/**
 * B9 — Anúncios (T-AD)
 *
 * Renderiza na coluna central do shell FlexLayout (A1). Dados via TinyBase
 * (`@/store/hooks`); tokens `--ds-*` em toda cor/raio.
 *
 * Abas:
 *   - Campanhas (lista + criar/promover)
 *   - Criativos (por campanha, com preview no estilo SuperCard/PostCard do B7)
 *   - Segmentação ◻ (mockup declarativo)
 *   - Dashboard ◻ (métricas ingênuas)
 *
 * Invariantes visuais reforçados aqui:
 *   - Verba estourada (`budgetSpent >= budgetTotal`) → badge "Orçamento
 *     esgotado" + progress em vermelho, independente do `status` no store.
 *   - `targetingBlocked:true` → aviso genérico "critérios não aplicados —
 *     dado de origem restrito" (não revela quais critérios).
 *   - `suspiciousClicks > 0` → badge anti-fraude "N cliques suspeitos
 *     excluídos da cobrança" (transparência, não é erro).
 */
import { useMemo, useState } from "react";
import {
  Megaphone, Plus, Sparkles, ShieldAlert, ShieldCheck, Image as ImageIcon,
  Activity, Users, Layers, MapPin, Wallet, ArrowUpFromLine,
} from "lucide-react";
import {
  useTable, useRowIds, useRow, useSetRowCallback, store,
} from "@/store/hooks";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, PendingBadge, DoneBadge } from "@/components/catalog/States";

type Tab = "campanhas" | "criativos" | "segmentacao" | "dashboard";

const objectiveLabels: Record<string, string> = {
  trafego: "Tráfego",
  conversao: "Conversão",
  engajamento: "Engajamento",
  instalacoes: "Instalações",
  reconhecimento: "Reconhecimento",
};

function brl(n: number) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtN(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}
function pct(a: number, b: number) {
  if (!b) return 0;
  return Math.min(100, (a / b) * 100);
}

export function AdsModule() {
  const [tab, setTab] = useState<Tab>("campanhas");
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("ca1");
  const [newOpen, setNewOpen] = useState(false);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [newCreativeOpen, setNewCreativeOpen] = useState(false);

  const campaigns = useTable("campaigns") as Record<string, any>;
  const campaignIds = useRowIds("campaigns") as string[];

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "campanhas",   label: "Campanhas",   icon: <Layers size={14} aria-hidden /> },
    { key: "criativos",   label: "Criativos",   icon: <ImageIcon size={14} aria-hidden /> },
    { key: "segmentacao", label: "Segmentação", icon: <Users size={14} aria-hidden /> },
    { key: "dashboard",   label: "Medição",     icon: <Activity size={14} aria-hidden /> },
  ];

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
              Módulo
            </p>
            <h2 className="flex items-center gap-2 text-2xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              <Megaphone size={22} aria-hidden />
              Anúncios
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
              Campanhas, criativos, segmentação declarativa e medição — dados locais via TinyBase.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPromoteOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{
                padding: "8px 12px", borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-strong)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              <ArrowUpFromLine size={14} aria-hidden />
              Promover item existente
            </button>
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{
                padding: "8px 12px", borderRadius: 9999,
                background: "var(--ds-theme-intent-accent-fill)",
                color: "var(--ds-theme-intent-accent-on-fill)",
              }}
            >
              <Plus size={14} aria-hidden />
              Nova campanha
            </button>
          </div>
        </header>

        <nav
          aria-label="Áreas de anúncios"
          className="flex flex-wrap items-center gap-1 p-1"
          style={{
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px solid var(--ds-theme-border-subtle)",
            width: "fit-content",
          }}
        >
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={active ? "page" : undefined}
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{
                  padding: "6px 12px", borderRadius: 9999,
                  background: active ? "var(--ds-theme-intent-accent-fill)" : "transparent",
                  color: active ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-default)",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "campanhas" && (
          <CampaignsList
            campaigns={campaigns}
            campaignIds={campaignIds}
            selectedCampaignId={selectedCampaignId}
            onSelect={(id) => { setSelectedCampaignId(id); setTab("criativos"); }}
          />
        )}

        {tab === "criativos" && (
          <CreativesView
            campaignId={selectedCampaignId}
            onSelectCampaign={setSelectedCampaignId}
            onNewCreative={() => setNewCreativeOpen(true)}
          />
        )}

        {tab === "segmentacao" && <TargetingView />}

        {tab === "dashboard" && <DashboardView />}

        <CampaignFormModal open={newOpen} onOpenChange={setNewOpen} />
        <PromoteItemModal open={promoteOpen} onOpenChange={setPromoteOpen} />
        <CreativeFormModal
          open={newCreativeOpen}
          onOpenChange={setNewCreativeOpen}
          campaignId={selectedCampaignId}
        />
      </div>
    </div>
  );
}

/* ────────────────────────── Campanhas ────────────────────────── */

function CampaignsList({
  campaigns, campaignIds, selectedCampaignId, onSelect,
}: {
  campaigns: Record<string, any>;
  campaignIds: string[];
  selectedCampaignId: string;
  onSelect: (id: string) => void;
}) {
  if (campaignIds.length === 0) {
    return <EmptyState title="Sem campanhas" description="Crie sua primeira campanha para começar." />;
  }
  return (
    <ul className="flex flex-col gap-2" role="list">
      {campaignIds.map((id) => {
        const c = campaigns[id];
        const overspent = c.budgetSpent >= c.budgetTotal;
        const isSelected = id === selectedCampaignId;
        return (
          <li key={id}>
            <button
              type="button"
              onClick={() => onSelect(id)}
              className="flex w-full flex-col gap-3 p-4 text-left transition-transform hover:-translate-y-0.5"
              style={{
                borderRadius: "var(--ds-component-card-radius, 20px)",
                background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
                border: isSelected
                  ? "1px solid var(--ds-theme-intent-accent-fill)"
                  : "1px solid var(--ds-theme-border-subtle)",
                boxShadow: "var(--ds-component-card-shadow)",
              }}
              aria-current={isSelected ? "true" : undefined}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                      {c.name}
                    </h3>
                    <StatusBadge status={c.status} overspent={overspent} />
                    {c.targetingBlocked && (
                      <span
                        className="inline-flex items-center gap-1 text-[10px] font-semibold"
                        style={{
                          padding: "2px 8px", borderRadius: 9999,
                          background: "var(--ds-theme-surface-subdued)",
                          color: "var(--ds-theme-content-muted)",
                          border: "1px dashed var(--ds-theme-border-subtle)",
                        }}
                        title="Alguns critérios de segmentação não puderam ser aplicados"
                      >
                        <ShieldAlert size={10} aria-hidden />
                        segmentação parcial
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {objectiveLabels[c.objective] ?? c.objective} · {c.pacing === "acelerado" ? "Ritmo acelerado" : "Ritmo uniforme"} · {c.startDate} → {c.endDate}
                  </p>
                </div>
                <div className="text-right text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                  <div className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {brl(c.budgetSpent)} <span className="font-normal" style={{ color: "var(--ds-theme-content-muted)" }}>/ {brl(c.budgetTotal)}</span>
                  </div>
                  <div>gasto</div>
                </div>
              </div>

              <BudgetBar spent={c.budgetSpent} total={c.budgetTotal} />

              {overspent && (
                <p
                  role="status"
                  className="text-xs"
                  style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}
                >
                  Orçamento esgotado — a campanha parou de rodar automaticamente.
                </p>
              )}
              {c.targetingBlocked && <TargetingRestrictedNote />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function StatusBadge({ status, overspent }: { status: string; overspent: boolean }) {
  if (overspent) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase"
        style={{
          padding: "2px 8px", borderRadius: 9999,
          background: "var(--ds-theme-intent-danger-subtle, var(--ds-theme-surface-subdued))",
          color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-content-strong))",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        pausada (orçamento esgotado)
      </span>
    );
  }
  if (status === "ativa") return <DoneBadge label="Ativa" />;
  if (status === "pausada") return <PendingBadge label="Pausada" />;
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase"
      style={{
        padding: "2px 8px", borderRadius: 9999,
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-muted)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {status}
    </span>
  );
}

function BudgetBar({ spent, total }: { spent: number; total: number }) {
  const p = pct(spent, total);
  const over = spent >= total;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={Math.min(spent, total)}
      aria-label="Orçamento gasto"
      className="relative h-2 w-full overflow-hidden"
      style={{ borderRadius: 9999, background: "var(--ds-theme-surface-subdued)" }}
    >
      <div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${p}%`,
          background: over
            ? "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))"
            : "var(--ds-theme-intent-accent-fill)",
        }}
      />
    </div>
  );
}

function TargetingRestrictedNote() {
  return (
    <div
      role="note"
      className="flex items-start gap-2 rounded-2xl p-3 text-xs"
      style={{
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-muted)",
        border: "1px dashed var(--ds-theme-border-subtle)",
      }}
    >
      <ShieldAlert size={14} aria-hidden style={{ color: "var(--ds-theme-intent-accent-fill)" }} />
      <span>
        <strong style={{ color: "var(--ds-theme-content-strong)" }}>
          Alguns critérios de segmentação não puderam ser aplicados
        </strong>
        {" — "}
        dado de origem restrito por permissão. Os critérios exatos não são exibidos.
      </span>
    </div>
  );
}

/* ────────────────────────── Criativos ────────────────────────── */

function CreativesView({
  campaignId, onSelectCampaign, onNewCreative,
}: {
  campaignId: string;
  onSelectCampaign: (id: string) => void;
  onNewCreative: () => void;
}) {
  const campaigns = useTable("campaigns") as Record<string, any>;
  const campaignIds = useRowIds("campaigns") as string[];
  const campaign = useRow("campaigns", campaignId) as any;
  const creatives = useTable("creatives") as Record<string, any>;
  const creativeIds = useRowIds("creatives") as string[];

  const cIds = useMemo(
    () => creativeIds.filter((id) => creatives[id]?.campaignId === campaignId),
    [creativeIds, creatives, campaignId],
  );

  if (!campaign) {
    return <EmptyState title="Campanha não encontrada" description="Selecione uma campanha para gerenciar criativos." />;
  }

  const overspent = campaign.budgetSpent >= campaign.budgetTotal;

  return (
    <div className="flex flex-col gap-4">
      {/* Seletor de campanha */}
      <div className="flex flex-wrap gap-1">
        {campaignIds.map((id) => {
          const active = id === campaignId;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectCampaign(id)}
              className="text-xs font-semibold"
              style={{
                padding: "6px 12px", borderRadius: 9999,
                background: active ? "var(--ds-theme-intent-accent-subtle)" : "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-strong)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
              aria-current={active ? "page" : undefined}
            >
              {campaigns[id].name}
            </button>
          );
        })}
      </div>

      {/* Header da campanha selecionada */}
      <div
        className="flex flex-col gap-3 p-4"
        style={{
          borderRadius: "var(--ds-component-card-radius, 20px)",
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            {campaign.name}
          </h3>
          <button
            type="button"
            onClick={onNewCreative}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{
              padding: "8px 12px", borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            <Plus size={14} aria-hidden />
            Novo criativo
          </button>
        </div>

        <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          <Sparkles size={12} className="mr-1 inline" aria-hidden />
          Este criativo pode aparecer no <strong>feed Social</strong> (posts com badge Patrocinado)
          e como <strong>pré-roll no Streaming</strong>. Slots são renderizados nesses módulos —
          aqui você só gerencia o criativo.
        </p>

        {overspent && (
          <p
            role="status"
            className="text-xs"
            style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}
          >
            Orçamento esgotado — novos criativos ficam salvos, mas não entregam impressões até
            você aumentar o orçamento.
          </p>
        )}
        {campaign.targetingBlocked && <TargetingRestrictedNote />}
      </div>

      {/* Lista de criativos */}
      {cIds.length === 0 ? (
        <EmptyState
          title="Sem criativos nesta campanha"
          description="Adicione o primeiro criativo para começar a rodar."
          actionLabel="Novo criativo"
          onAction={onNewCreative}
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {cIds.map((id) => (
            <CreativeCard key={id} creativeId={id} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Preview visual do criativo — reusa o vocabulário do PostCard do B7:
 * mesmo container, badge "Patrocinado" idêntico, hierarquia de header +
 * corpo + imagem placeholder. Mantém consistência com o feed Social.
 */
function CreativeCard({ creativeId }: { creativeId: string }) {
  const c = useRow("creatives", creativeId) as any;
  const campaign = useRow("campaigns", c?.campaignId) as any;
  if (!c || !campaign) return null;

  const suspicious = (c.suspiciousClicks as number) ?? 0;
  const billableClicks = Math.max(0, (c.clicks as number) - suspicious);

  return (
    <article
      className="flex flex-col gap-3 p-4"
      style={{
        background: "var(--ds-component-card-bg, var(--ds-theme-surface-default))",
        border: "1px solid var(--ds-theme-border-subtle)",
        borderRadius: "var(--ds-component-card-radius, 20px)",
        boxShadow: "var(--ds-component-card-shadow)",
      }}
      aria-label="Preview do criativo patrocinado"
    >
      <header className="flex items-center gap-3">
        <div
          aria-hidden
          className="grid place-items-center text-xs font-bold"
          style={{
            width: 40, height: 40, borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-subtle)",
            color: "var(--ds-theme-intent-accent-on-subtle)",
          }}
        >
          {campaign.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              {campaign.name}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
              style={{
                padding: "2px 8px", borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-muted)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              <Sparkles size={10} aria-hidden /> Patrocinado
            </span>
          </div>
          <div className="text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Preview de como aparece no feed
          </div>
        </div>
      </header>

      <h4 className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
        {c.headline}
      </h4>
      <p className="text-sm leading-relaxed" style={{ color: "var(--ds-theme-content-default)" }}>
        {c.bodyText}
      </p>

      <div
        className="grid aspect-video w-full place-items-center overflow-hidden"
        style={{
          borderRadius: 16,
          background: "var(--ds-theme-surface-subdued)",
          color: "var(--ds-theme-content-subtle)",
        }}
        aria-label="Imagem placeholder do anúncio"
      >
        <span className="text-3xl font-bold">{c.imageLabel}</span>
      </div>

      {/* Métricas do criativo */}
      <dl className="grid grid-cols-3 gap-2 text-xs">
        <Metric label="Impressões" value={fmtN(c.impressions)} />
        <Metric label="Cliques" value={fmtN(billableClicks)} sub={suspicious > 0 ? `de ${fmtN(c.clicks)}` : undefined} />
        <Metric label="CTR" value={`${c.ctr.toFixed(1)}%`} />
      </dl>

      {suspicious > 0 && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-2xl p-2.5 text-xs"
          style={{
            background: "var(--ds-theme-intent-accent-subtle)",
            color: "var(--ds-theme-content-strong)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <ShieldCheck size={14} aria-hidden style={{ color: "var(--ds-theme-intent-accent-fill)" }} />
          <span>
            {fmtN(suspicious)} cliques suspeitos detectados e <strong>excluídos da cobrança</strong>
            {" "}(anti-fraude ativa).
          </span>
        </div>
      )}
    </article>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      className="flex flex-col gap-0.5 p-2"
      style={{
        borderRadius: 12,
        background: "var(--ds-theme-surface-subdued)",
      }}
    >
      <dt className="text-[10px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
        {label}
      </dt>
      <dd className="text-sm font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
        {value}
      </dd>
      {sub && <span className="text-[10px]" style={{ color: "var(--ds-theme-content-muted)" }}>{sub}</span>}
    </div>
  );
}

/* ────────────────────────── Segmentação (◻) ────────────────────────── */

function TargetingView() {
  const [ages, setAges] = useState<string[]>(["18-24", "25-34"]);
  const [regions, setRegions] = useState<string[]>(["Sudeste"]);
  const [interests, setInterests] = useState<string[]>(["design", "tecnologia"]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Fieldset icon={<Users size={14} aria-hidden />} legend="Faixa etária">
        {["18-24", "25-34", "35-44", "45-54", "55+"].map((v) => (
          <Check key={v} label={v} checked={ages.includes(v)} onChange={() => toggle(ages, setAges, v)} id={`age-${v}`} />
        ))}
      </Fieldset>
      <Fieldset icon={<MapPin size={14} aria-hidden />} legend="Região">
        {["Sudeste", "Sul", "Nordeste", "Norte", "Centro-Oeste"].map((v) => (
          <Check key={v} label={v} checked={regions.includes(v)} onChange={() => toggle(regions, setRegions, v)} id={`reg-${v}`} />
        ))}
      </Fieldset>
      <Fieldset icon={<Sparkles size={14} aria-hidden />} legend="Interesses">
        {["design", "tecnologia", "finanças", "arte", "educação"].map((v) => (
          <Check key={v} label={v} checked={interests.includes(v)} onChange={() => toggle(interests, setInterests, v)} id={`int-${v}`} />
        ))}
      </Fieldset>

      <div className="md:col-span-3">
        <TargetingRestrictedNote />
        <p className="mt-2 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Segmentação declarativa — os critérios acima são <em>intenção</em>. A entrega real depende
          das permissões que os usuários concederam sobre seus dados. Anunciante nunca vê
          os atributos individuais, apenas resultados agregados.
        </p>
      </div>
    </div>
  );
}

function Fieldset({ icon, legend, children }: { icon: React.ReactNode; legend: string; children: React.ReactNode }) {
  return (
    <fieldset
      className="flex flex-col gap-2 p-4"
      style={{
        borderRadius: "var(--ds-component-card-radius, 20px)",
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      <legend className="flex items-center gap-1.5 px-1 text-xs font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
        {icon}
        {legend}
      </legend>
      <div className="flex flex-col gap-1.5">{children}</div>
    </fieldset>
  );
}

function Check({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-xs" style={{ color: "var(--ds-theme-content-default)" }}>
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}

/* ────────────────────────── Dashboard (◻) ────────────────────────── */

function DashboardView() {
  const campaigns = useTable("campaigns") as Record<string, any>;
  const campaignIds = useRowIds("campaigns") as string[];
  const creatives = useTable("creatives") as Record<string, any>;
  const creativeIds = useRowIds("creatives") as string[];

  const byCampaign = useMemo(() => {
    return campaignIds.map((cid) => {
      const c = campaigns[cid];
      const cs = creativeIds.filter((id) => creatives[id]?.campaignId === cid).map((id) => creatives[id]);
      const impressions = cs.reduce((s, x) => s + (x.impressions ?? 0), 0);
      const clicksRaw = cs.reduce((s, x) => s + (x.clicks ?? 0), 0);
      const suspicious = cs.reduce((s, x) => s + (x.suspiciousClicks ?? 0), 0);
      const clicks = Math.max(0, clicksRaw - suspicious);
      const cpm = impressions > 0 ? (c.budgetSpent / impressions) * 1000 : 0;
      const cpc = clicks > 0 ? c.budgetSpent / clicks : 0;
      // CPA "ingênuo": assume 5% dos cliques viram conversão.
      const conversions = Math.round(clicks * 0.05);
      const cpa = conversions > 0 ? c.budgetSpent / conversions : 0;
      return { cid, c, impressions, clicks, suspicious, cpm, cpc, cpa, conversions };
    });
  }, [campaigns, campaignIds, creatives, creativeIds]);

  if (byCampaign.length === 0) {
    return <EmptyState title="Sem dados para medir" description="Crie campanhas e criativos para ver métricas." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {byCampaign.map(({ cid, c, impressions, clicks, suspicious, cpm, cpc, cpa }) => {
        const overspent = c.budgetSpent >= c.budgetTotal;
        return (
          <div
            key={cid}
            className="flex flex-col gap-3 p-4"
            style={{
              borderRadius: "var(--ds-component-card-radius, 20px)",
              background: "var(--ds-theme-surface-default)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                  {c.name}
                </h3>
                <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                  {brl(c.budgetSpent)} / {brl(c.budgetTotal)} · {objectiveLabels[c.objective]}
                </p>
              </div>
              <StatusBadge status={c.status} overspent={overspent} />
            </div>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Metric label="Impressões" value={fmtN(impressions)} />
              <Metric label="Cliques" value={fmtN(clicks)} sub={suspicious > 0 ? `${fmtN(suspicious)} suspeitos removidos` : undefined} />
              <Metric label="CPM" value={brl(cpm)} sub="por 1k imp" />
              <Metric label="CPC" value={brl(cpc)} sub="por clique" />
              <Metric label="CPA (est.)" value={brl(cpa)} sub="conv. ~5%" />
            </dl>
            {c.targetingBlocked && <TargetingRestrictedNote />}
          </div>
        );
      })}

      <p className="text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
        Fórmulas ingênuas para mockup: CPM = gasto ÷ impressões × 1000; CPC = gasto ÷ cliques
        (excluindo suspeitos); CPA estima 5% de conversão.
      </p>
    </div>
  );
}

/* ────────────────────────── Modais ────────────────────────── */

function CampaignFormModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [objective, setObjective] = useState("trafego");
  const [budgetTotal, setBudgetTotal] = useState("500");
  const [pacing, setPacing] = useState<"uniforme" | "acelerado">("uniforme");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [err, setErr] = useState<string | null>(null);

  const reset = () => {
    setName(""); setObjective("trafego"); setBudgetTotal("500");
    setPacing("uniforme"); setErr(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova campanha</DialogTitle>
          <DialogDescription>Sandbox — nenhuma verba real é comprometida.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const budget = parseFloat(budgetTotal);
            if (!name.trim()) return setErr("Informe o nome da campanha.");
            if (!Number.isFinite(budget) || budget <= 0) return setErr("Informe um orçamento válido.");
            if (endDate < startDate) return setErr("Data final deve ser após a inicial.");
            const id = `ca_${Date.now()}`;
            store.setRow("campaigns", id, {
              name: name.trim(),
              objective,
              budgetTotal: budget,
              budgetSpent: 0,
              pacing,
              status: "ativa",
              startDate,
              endDate,
              targetingBlocked: false,
            });
            reset();
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="ca-name">Nome</Label>
            <Input id="ca-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ca-obj">Objetivo</Label>
            <select
              id="ca-obj"
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="text-sm"
              style={{
                padding: "8px 10px", borderRadius: 8,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-strong)",
                border: "1px solid var(--ds-theme-border-subtle)",
              }}
            >
              {Object.entries(objectiveLabels).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="ca-budget"><Wallet size={12} className="mr-1 inline" aria-hidden />Orçamento total (R$)</Label>
              <Input id="ca-budget" type="number" min="1" step="1" value={budgetTotal} onChange={(e) => setBudgetTotal(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ca-pacing">Ritmo (pacing)</Label>
              <select
                id="ca-pacing"
                value={pacing}
                onChange={(e) => setPacing(e.target.value as "uniforme" | "acelerado")}
                className="text-sm"
                style={{
                  padding: "8px 10px", borderRadius: 8,
                  background: "var(--ds-theme-surface-subdued)",
                  color: "var(--ds-theme-content-strong)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <option value="uniforme">Uniforme</option>
                <option value="acelerado">Acelerado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="ca-start">Início</Label>
              <Input id="ca-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ca-end">Fim</Label>
              <Input id="ca-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          {err && (
            <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
              {err}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Criar campanha</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreativeFormModal({
  open, onOpenChange, campaignId,
}: { open: boolean; onOpenChange: (v: boolean) => void; campaignId: string }) {
  const [headline, setHeadline] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [imageLabel, setImageLabel] = useState("NEW");
  const [err, setErr] = useState<string | null>(null);

  const reset = () => { setHeadline(""); setBodyText(""); setImageLabel("NEW"); setErr(null); };

  const add = useSetRowCallback(
    "creatives",
    (id: string) => id,
    (_id: string) => ({
      campaignId,
      headline: headline.trim(),
      bodyText: bodyText.trim(),
      imageLabel: imageLabel.trim().slice(0, 3).toUpperCase() || "NEW",
      ctr: 0,
      impressions: 0,
      clicks: 0,
      suspiciousClicks: 0,
    }),
    [campaignId, headline, bodyText, imageLabel],
  );

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo criativo</DialogTitle>
          <DialogDescription>Preview aparece imediatamente na lista.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!headline.trim()) return setErr("Informe uma headline.");
            if (!bodyText.trim()) return setErr("Informe o texto do anúncio.");
            add(`cr_${Date.now()}`);
            reset();
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="cr-h">Headline</Label>
            <Input id="cr-h" value={headline} onChange={(e) => setHeadline(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cr-b">Texto</Label>
            <Input id="cr-b" value={bodyText} onChange={(e) => setBodyText(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="cr-i">Imagem (rótulo mock, 3 letras)</Label>
            <Input id="cr-i" value={imageLabel} onChange={(e) => setImageLabel(e.target.value)} maxLength={3} />
          </div>
          {err && (
            <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
              {err}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PromoteItemModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [ref, setRef] = useState("");
  const [budget, setBudget] = useState("200");
  const [err, setErr] = useState<string | null>(null);

  const reset = () => { setRef(""); setBudget("200"); setErr(null); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Promover item existente</DialogTitle>
          <DialogDescription>
            Cria uma campanha que <strong>referencia</strong> um post do Social ou produto do
            Marketplace — <em>não</em> duplica o conteúdo. O item original continua único.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const b = parseFloat(budget);
            if (!ref.trim()) return setErr("Informe a referência ao item (ex.: post p1, produto pr3).");
            if (!Number.isFinite(b) || b <= 0) return setErr("Informe um orçamento válido.");
            const cid = `ca_${Date.now()}`;
            const today = new Date().toISOString().slice(0, 10);
            const end = new Date(); end.setDate(end.getDate() + 7);
            store.setRow("campaigns", cid, {
              name: `Promoção — ${ref.trim()}`,
              objective: "engajamento",
              budgetTotal: b,
              budgetSpent: 0,
              pacing: "uniforme",
              status: "ativa",
              startDate: today,
              endDate: end.toISOString().slice(0, 10),
              targetingBlocked: false,
            });
            store.setRow("creatives", `cr_${Date.now()}`, {
              campaignId: cid,
              headline: `Promovendo: ${ref.trim()}`,
              bodyText: `Referência ao item original (${ref.trim()}). Sem duplicação de conteúdo.`,
              imageLabel: ref.trim().slice(0, 3).toUpperCase(),
              ctr: 0,
              impressions: 0,
              clicks: 0,
              suspiciousClicks: 0,
            });
            reset();
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="pi-ref">Referência ao item</Label>
            <Input id="pi-ref" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="ex.: post p1, produto pr3" autoFocus />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="pi-budget">Orçamento (R$)</Label>
            <Input id="pi-budget" type="number" min="1" step="1" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          {err && (
            <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
              {err}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Promover</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}