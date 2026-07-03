/**
 * B12 — Studio (Office & Criação)
 *
 * Decisão de arquitetura (exceção "editor precisa de mais área"):
 * Os editores (doc / sheet / slide / media) abrem num OVERLAY fixed inset-0 por
 * cima de todo o shell FlexLayout. Isso:
 *  1. dá a maior área útil possível (100vw × 100vh) sem quebrar as demais
 *     colunas do shell;
 *  2. mantém o shell montado por trás (Esc/voltar retornam ao estado exato);
 *  3. evita mexer no modelo do FlexLayout ou criar rota nova (mais simples de
 *     implementar dado o que já existe).
 * A Studio home segue o padrão de módulo (renderizada em CentralApp quando
 * activeNav === "studio"), igual a Marketplace/Social.
 */
import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Table2,
  Presentation,
  Image as ImageIcon,
  Plus,
  Palette,
} from "lucide-react";
import { store, useTable } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { NewFileModal, type DocKind } from "./NewFileModal";
import { DocEditor } from "./DocEditor";
import { SheetEditor } from "./SheetEditor";
import { SlidesEditor } from "./SlidesEditor";
import { MediaEditor } from "./MediaEditor";

type DocRow = {
  title?: string;
  kind?: DocKind;
  updatedAt?: string;
  ownerName?: string;
  collaborators?: string;
  syncStatus?: string;
};

const kindMeta: Record<
  DocKind,
  { label: string; icon: React.ReactNode }
> = {
  doc: { label: "Documento", icon: <FileText size={16} aria-hidden /> },
  sheet: { label: "Planilha", icon: <Table2 size={16} aria-hidden /> },
  slide: { label: "Apresentação", icon: <Presentation size={16} aria-hidden /> },
  media: { label: "Mídia", icon: <ImageIcon size={16} aria-hidden /> },
};

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export function StudioModule() {
  const documents = useTable("documents") as Record<string, DocRow>;
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | DocKind>("all");
  const [newOpen, setNewOpen] = useState(false);

  // Esc fecha o editor
  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openId]);

  const rows = useMemo(() => {
    const arr = Object.entries(documents).map(([id, d]) => ({ id, ...d }));
    const filtered = filter === "all" ? arr : arr.filter((r) => r.kind === filter);
    return filtered.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  }, [documents, filter]);

  const openDoc = openId ? (documents[openId] as DocRow | undefined) : undefined;

  const createNew = (name: string, kind: DocKind) => {
    const id = `d_${Date.now()}`;
    store.setRow("documents", id, {
      title: name,
      kind,
      updatedAt: new Date().toISOString(),
      ownerName: "Israel",
      collaborators: "",
      syncStatus: "synced",
    });
    // se for slide, seed com 1 slide
    if (kind === "slide") {
      store.setRow("slides", `sl_${id}_1`, {
        documentId: id,
        order: 1,
        title: name,
        body: "",
      });
    }
    setOpenId(id);
  };

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 sm:p-6">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p
                className="text-[11px] uppercase tracking-wide"
                style={{ color: "var(--ds-theme-content-subtle)" }}
              >
                Módulo
              </p>
              <h2
                className="flex items-center gap-2 text-2xl font-semibold"
                style={{ color: "var(--ds-theme-content-strong)" }}
              >
                <Palette size={22} aria-hidden />
                Studio
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setNewOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{
                padding: "8px 14px",
                borderRadius: 9999,
                background: "var(--ds-theme-intent-accent-fill)",
                color: "var(--ds-theme-intent-accent-on-fill)",
              }}
            >
              <Plus size={12} aria-hidden /> Novo arquivo
            </button>
          </header>

          {/* Filtro por tipo */}
          <nav
            aria-label="Filtrar por tipo"
            className="flex flex-wrap items-center gap-1 p-1"
            style={{
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
              width: "fit-content",
            }}
          >
            {(
              [
                { key: "all" as const, label: "Todos" },
                { key: "doc" as const, label: "Documentos" },
                { key: "sheet" as const, label: "Planilhas" },
                { key: "slide" as const, label: "Slides" },
                { key: "media" as const, label: "Mídia" },
              ]
            ).map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  aria-current={active ? "page" : undefined}
                  className="text-xs font-semibold"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 9999,
                    background: active
                      ? "var(--ds-theme-intent-accent-fill)"
                      : "transparent",
                    color: active
                      ? "var(--ds-theme-intent-accent-on-fill)"
                      : "var(--ds-theme-content-default)",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </nav>

          {rows.length === 0 ? (
            <EmptyState
              title="Nenhum arquivo por aqui"
              description="Crie seu primeiro documento, planilha ou apresentação."
              actionLabel="Novo arquivo"
              onAction={() => setNewOpen(true)}
            />
          ) : (
            <ul
              className="grid gap-2 sm:grid-cols-2"
              aria-label="Documentos"
            >
              {rows.map((r) => {
                const meta = kindMeta[r.kind as DocKind] ?? kindMeta.doc;
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => setOpenId(r.id)}
                      className="flex w-full items-start gap-3 text-left transition-transform hover:-translate-y-0.5"
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "var(--ds-theme-surface-default)",
                        border: "1px solid var(--ds-theme-border-subtle)",
                        boxShadow: "var(--ds-component-card-shadow)",
                      }}
                    >
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center"
                        style={{
                          borderRadius: 12,
                          background: "var(--ds-theme-intent-accent-subtle)",
                          color: "var(--ds-theme-intent-accent-on-subtle)",
                        }}
                      >
                        {meta.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className="block truncate text-sm font-semibold"
                          style={{ color: "var(--ds-theme-content-strong)" }}
                        >
                          {r.title || "Sem título"}
                        </span>
                        <span
                          className="block text-[11px]"
                          style={{ color: "var(--ds-theme-content-muted)" }}
                        >
                          {meta.label} · Atualizado {formatDate(r.updatedAt)}
                        </span>
                        {r.collaborators && (
                          <span
                            className="mt-1 block truncate text-[11px]"
                            style={{ color: "var(--ds-theme-content-subtle)" }}
                          >
                            Com {r.collaborators}
                          </span>
                        )}
                      </span>
                      {r.syncStatus === "conflict-resolved" && (
                        <span
                          className="ml-2 shrink-0 text-[10px] font-semibold uppercase"
                          style={{
                            padding: "2px 8px",
                            borderRadius: 9999,
                            background: "var(--ds-theme-surface-subdued)",
                            color: "var(--ds-theme-content-muted)",
                            border: "1px dashed var(--ds-theme-border-subtle)",
                          }}
                          title="Versão conflitante mesclada automaticamente"
                        >
                          mesclado
                        </span>
                      )}
                      {r.syncStatus === "syncing" && (
                        <span
                          className="ml-2 shrink-0 text-[10px] font-semibold uppercase"
                          style={{
                            padding: "2px 8px",
                            borderRadius: 9999,
                            background: "var(--ds-theme-intent-accent-subtle)",
                            color: "var(--ds-theme-intent-accent-on-subtle)",
                          }}
                        >
                          sincronizando…
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Overlay full-screen com o editor apropriado */}
      {openId && openDoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Editor de ${openDoc.title ?? "documento"}`}
          className="fixed inset-0 z-50"
          style={{ background: "var(--ds-theme-surface-canvas, var(--ds-theme-surface-default))" }}
        >
          {openDoc.kind === "doc" && (
            <DocEditor
              documentId={openId}
              onClose={() => setOpenId(null)}
              onOpenDoc={(id) => setOpenId(id)}
            />
          )}
          {openDoc.kind === "sheet" && (
            <SheetEditor documentId={openId} onClose={() => setOpenId(null)} />
          )}
          {openDoc.kind === "slide" && (
            <SlidesEditor documentId={openId} onClose={() => setOpenId(null)} />
          )}
          {openDoc.kind === "media" && (
            <MediaEditor documentId={openId} onClose={() => setOpenId(null)} />
          )}
        </div>
      )}

      <NewFileModal
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={createNew}
      />
    </>
  );
}