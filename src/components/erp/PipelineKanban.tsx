import { useMemo, useState } from "react";
import { GripVertical } from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { OverflowMenu } from "@/components/catalog/Menus";
import { formatBRL, pipelineStages, type Stage } from "./utils";

type Deal = {
  dealName?: string;
  customerName?: string;
  stage?: Stage;
  value?: number;
  owner?: string;
};

const stageLabel: Record<Stage, string> = {
  "prospecção": "Prospecção",
  "qualificação": "Qualificação",
  "proposta": "Proposta",
  "fechamento": "Fechamento",
};

export function PipelineKanban() {
  const table = useTable("pipeline") as Record<string, Deal>;
  const [dragging, setDragging] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<Stage | null>(null);

  const byStage = useMemo(() => {
    const map: Record<Stage, Array<[string, Deal]>> = {
      "prospecção": [],
      "qualificação": [],
      "proposta": [],
      "fechamento": [],
    };
    for (const [id, d] of Object.entries(table)) {
      const s = (d.stage as Stage) ?? "prospecção";
      if (map[s]) map[s].push([id, d]);
    }
    return map;
  }, [table]);

  const moveTo = (id: string, stage: Stage) => {
    store.setCell("pipeline", id, "stage", stage);
  };

  const shift = (id: string, current: Stage | undefined, dir: 1 | -1) => {
    const idx = pipelineStages.indexOf(current ?? "prospecção");
    const next = pipelineStages[Math.min(Math.max(idx + dir, 0), pipelineStages.length - 1)];
    moveTo(id, next);
  };

  return (
    <section aria-labelledby="pipe-h" className="flex flex-col gap-3">
      <header>
        <h3 id="pipe-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
          Pipeline CRM
        </h3>
        <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Arraste os cards entre colunas ou use o menu ⋯ para mover pelo teclado.
        </p>
      </header>

      <div
        role="list"
        aria-label="Colunas do pipeline"
        className="grid gap-3 lg:grid-cols-4"
      >
        {pipelineStages.map((stage) => {
          const deals = byStage[stage];
          const total = deals.reduce((sum, [, d]) => sum + (d.value ?? 0), 0);
          const isHover = hoverCol === stage;
          return (
            <div
              key={stage}
              role="listitem"
              aria-label={`Coluna ${stageLabel[stage]}`}
              onDragOver={(e) => {
                e.preventDefault();
                setHoverCol(stage);
              }}
              onDragLeave={() => setHoverCol((s) => (s === stage ? null : s))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragging) moveTo(dragging, stage);
                setDragging(null);
                setHoverCol(null);
              }}
              className="flex min-h-40 flex-col gap-2 p-3 transition-colors"
              style={{
                borderRadius: "var(--ds-component-card-radius, 16px)",
                background: isHover
                  ? "var(--ds-theme-intent-accent-subtle)"
                  : "var(--ds-theme-surface-subdued)",
                border: `1px ${isHover ? "solid" : "dashed"} var(--ds-theme-border-subtle)`,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase" style={{ color: "var(--ds-theme-content-strong)" }}>
                  {stageLabel[stage]}
                </span>
                <span className="text-[11px] tabular-nums" style={{ color: "var(--ds-theme-content-muted)" }}>
                  {deals.length} · {formatBRL(total)}
                </span>
              </div>
              <ul className="flex flex-col gap-2" aria-label={`Cards em ${stageLabel[stage]}`}>
                {deals.map(([id, d]) => (
                  <li key={id}>
                    <div
                      draggable
                      onDragStart={(e) => {
                        setDragging(id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDragging(null);
                        setHoverCol(null);
                      }}
                      aria-grabbed={dragging === id}
                      aria-label={`Oportunidade ${d.dealName}, ${formatBRL(d.value)}, cliente ${d.customerName}, etapa ${stageLabel[stage]}`}
                      className="flex cursor-grab flex-col gap-1 p-3 active:cursor-grabbing"
                      style={{
                        borderRadius: 12,
                        background: "var(--ds-theme-surface-default)",
                        border: "1px solid var(--ds-theme-border-subtle)",
                        boxShadow: "var(--ds-component-card-shadow)",
                        opacity: dragging === id ? 0.4 : 1,
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical
                          size={14}
                          aria-hidden
                          style={{ color: "var(--ds-theme-content-subtle)", marginTop: 2 }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                            {d.dealName}
                          </p>
                          <p className="truncate text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                            {d.customerName}
                          </p>
                        </div>
                        <OverflowMenu
                          items={[
                            {
                              label: "Mover para etapa anterior",
                              onSelect: () => shift(id, stage, -1),
                            },
                            {
                              label: "Mover para próxima etapa",
                              onSelect: () => shift(id, stage, 1),
                            },
                            {
                              label: "Excluir oportunidade",
                              onSelect: () => store.delRow("pipeline", id),
                            },
                          ]}
                        />
                      </div>
                      <div className="flex items-center justify-between pl-6">
                        <span className="text-sm font-bold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
                          {formatBRL(d.value)}
                        </span>
                        <span className="text-[10px] font-semibold uppercase" style={{ color: "var(--ds-theme-content-subtle)" }}>
                          {d.owner}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
                {deals.length === 0 && (
                  <li
                    aria-hidden
                    className="grid place-items-center py-6 text-[11px]"
                    style={{ color: "var(--ds-theme-content-subtle)" }}
                  >
                    Solte um card aqui
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}