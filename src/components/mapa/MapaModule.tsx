/**
 * B5 — Mapa
 *
 * Módulo renderizado na coluna central do shell FlexLayout (A1). Toda leitura
 * de dados vem de TinyBase via `@/store/hooks`. Todo tom/cor/raio via tokens
 * `--ds-*`.
 *
 * Arquitetura da tela:
 *   ┌──────────────────────────────────────────────────────────────┐
 *   │ Header (título + toggle "simular localização indisponível")  │
 *   ├──────────────────────────────────────────────────────────────┤
 *   │ Banner offline (se !online)  |  Banner permissão negada      │
 *   ├─────────────────────┬────────────────────────────────────────┤
 *   │ Busca + lista       │ Placeholder SVG do mapa com pins        │
 *   │ (ordenada por dist) │  · clique no pin abre painel de detalhe │
 *   └─────────────────────┴────────────────────────────────────────┘
 *
 * Mapa placeholder:
 *   Não usa biblioteca de mapas real. Renderiza um <svg> com uma grade sutil
 *   simulando ruas e projeta `lat`/`lng` normalizados dentro do viewBox usando
 *   o bbox de São Paulo (aprox.). É estritamente visual — sem pan/zoom.
 *
 * Estados cobertos:
 *   - offline (banner + cache label)
 *   - vazio (EmptyState na busca sem match)
 *   - erro de permissão de localização (ErrorState com "Tentar novamente")
 *   - parcial: quando permissão negada, lista/mapa continuam servindo dados de
 *     cache — a UI degrada só o widget de "sua localização", não a tela toda.
 *   - sincronizando (SyncingState quando o usuário aciona "Tentar novamente")
 *
 * Rota (item ◻4):
 *   Botão "Rota até aqui" no detalhe → mock inline com nota de proveniência do
 *   conector externo. Sem cálculo real.
 *
 * Compartilhar localização (modal):
 *   Aviso claro de que é informação efêmera + TTL de 15min. Ao confirmar,
 *   guardamos `shareUntilMs` em state local (não persistimos — é efêmero
 *   por design) e exibimos badge reusando o padrão visual do `TTLLock`.
 */
import { useMemo, useState } from "react";
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  Share2,
  Route as RouteIcon,
  X,
  LocateOff,
  Info,
} from "lucide-react";
import {
  useTable,
  useValue,
  useSortedRowIds,
  useSetCellCallback,
} from "@/store/hooks";
import { SearchInput } from "@/components/catalog/Navigation";
import {
  EmptyState,
  ErrorState,
  OfflineBanner,
  SyncingState,
  TTLLock,
} from "@/components/catalog/States";
import { ConfirmModal } from "@/components/catalog/Modals";

type Place = {
  name: string;
  category: string;
  lat: number;
  lng: number;
  distanceKm: number;
  addressLabel: string;
  savedByMe: boolean;
};

// Bounding box aproximado do miolo de São Paulo — usado só para projetar os
// pins do mockup dentro do SVG. Não é geografia real.
const BBOX = { latMin: -23.6, latMax: -23.53, lngMin: -46.71, lngMax: -46.61 };

function project(lat: number, lng: number) {
  const x = ((lng - BBOX.lngMin) / (BBOX.lngMax - BBOX.lngMin)) * 100;
  // lat cresce pra cima; SVG y cresce pra baixo
  const y = 100 - ((lat - BBOX.latMin) / (BBOX.latMax - BBOX.latMin)) * 100;
  return { x: Math.max(4, Math.min(96, x)), y: Math.max(4, Math.min(96, y)) };
}

function formatShareUntil(ms: number) {
  const d = new Date(ms);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function MapaModule() {
  const online = useValue("online") as boolean;
  const placesTable = useTable("places") as Record<string, Place>;
  const sortedIds = useSortedRowIds("places", "distanceKm");

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareUntilMs, setShareUntilMs] = useState<number | null>(null);
  // Simulação do estado "localização indisponível". Começa `true` como
  // demonstração — a tela sempre mostra o estado degradado para exercitá-lo.
  const [locationDenied, setLocationDenied] = useState(true);
  const [retryingLocation, setRetryingLocation] = useState(false);

  const toggleSaved = useSetCellCallback(
    "places",
    (id: string) => id,
    () => "savedByMe",
    () => (_: unknown, store) => {
      // Ler o valor atual do próprio store — evita staleness da closure.
      return (id: string) => !store.getCell("places", id, "savedByMe");
    },
  );

  // Filtragem: nome OU categoria (substring, case-insensitive).
  const filteredIds = useMemo(() => {
    if (!query.trim()) return sortedIds;
    const q = query.trim().toLowerCase();
    return sortedIds.filter((id) => {
      const p = placesTable[id];
      if (!p) return false;
      return (
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    });
  }, [sortedIds, query, placesTable]);

  const selected = selectedId ? placesTable[selectedId] : null;

  const shareActive = shareUntilMs !== null && shareUntilMs > Date.now();

  const doRetryLocation = () => {
    setRetryingLocation(true);
    // Mock: sempre "falha" no mockup para manter o estado demonstrado.
    window.setTimeout(() => {
      setRetryingLocation(false);
      setLocationDenied(true);
    }, 1200);
  };

  const confirmShare = () => {
    setShareUntilMs(Date.now() + 15 * 60 * 1000);
  };
  const revokeShare = () => setShareUntilMs(null);

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
        {/* Header do módulo */}
        <header className="flex flex-wrap items-start justify-between gap-3">
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
              <MapPin size={22} aria-hidden />
              Mapa
            </h2>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--ds-theme-content-muted)" }}
            >
              Lugares próximos — busca, detalhes e rota via conector externo.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {shareActive && (
              <div className="flex items-center gap-2">
                <TTLLock
                  until={formatShareUntil(shareUntilMs!)}
                  label="Localização compartilhada · expira às"
                />
                <button
                  type="button"
                  onClick={revokeShare}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold"
                  style={{
                    padding: "4px 8px",
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-default)",
                    border: "1px solid var(--ds-theme-border-subtle)",
                  }}
                  aria-label="Revogar compartilhamento de localização"
                >
                  <X size={11} aria-hidden />
                  Revogar
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold"
              style={{
                padding: "8px 12px",
                borderRadius: 9999,
                background: "var(--ds-theme-intent-accent-fill)",
                color: "var(--ds-theme-intent-accent-on-fill)",
              }}
            >
              <Share2 size={14} aria-hidden />
              Compartilhar localização
            </button>
          </div>
        </header>

        {/* Estado offline */}
        {!online && (
          <OfflineBanner label="Mostrando lugares salvos offline — alguns dados podem estar desatualizados." />
        )}

        {/* Estado de localização indisponível — degrada a caixa de "sua
            localização", mas mantém lista/mapa utilizáveis. */}
        {locationDenied && !retryingLocation && (
          <ErrorState
            title="Não foi possível acessar sua localização"
            description="Verifique as permissões do navegador ou digite um endereço manualmente. Os lugares abaixo usam a última posição conhecida."
            onRetry={doRetryLocation}
          />
        )}
        {retryingLocation && (
          <SyncingState label="Tentando acessar sua localização…" />
        )}

        {/* Layout principal: lista + mapa */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          {/* Coluna lista + busca */}
          <aside
            aria-label="Busca e lista de lugares"
            className="flex min-w-0 flex-col gap-3"
          >
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar lugar ou categoria…"
            />

            {filteredIds.length === 0 ? (
              <EmptyState
                title="Nenhum lugar encontrado"
                description="Ajuste a busca ou tente outra categoria."
              />
            ) : (
              <ul
                aria-label="Lugares ordenados por distância"
                className="flex flex-col gap-2"
              >
                {filteredIds.map((id) => {
                  const p = placesTable[id];
                  if (!p) return null;
                  const active = id === selectedId;
                  return (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(id)}
                        aria-pressed={active}
                        className="flex w-full items-start gap-3 p-3 text-left transition-transform focus:outline-none focus-visible:ring-2"
                        style={{
                          borderRadius:
                            "var(--ds-component-card-radius, 16px)",
                          background: active
                            ? "var(--ds-theme-intent-accent-subtle)"
                            : "var(--ds-theme-surface-default)",
                          color: active
                            ? "var(--ds-theme-intent-accent-on-subtle)"
                            : "var(--ds-theme-content-default)",
                          border: "1px solid var(--ds-theme-border-subtle)",
                          // usa outline-ring do design system
                          outlineColor:
                            "var(--ds-theme-intent-accent-fill)",
                        }}
                      >
                        <span
                          aria-hidden
                          className="grid h-9 w-9 shrink-0 place-items-center"
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
                          <MapPin size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="flex items-center justify-between gap-2"
                          >
                            <span
                              className="truncate text-sm font-semibold"
                              style={{
                                color: "var(--ds-theme-content-strong)",
                              }}
                            >
                              {p.name}
                            </span>
                            <span
                              className="shrink-0 text-[11px] font-semibold tabular-nums"
                              style={{
                                color: "var(--ds-theme-content-muted)",
                              }}
                            >
                              {p.distanceKm.toLocaleString("pt-BR", {
                                minimumFractionDigits: 1,
                                maximumFractionDigits: 1,
                              })}{" "}
                              km
                            </span>
                          </span>
                          <span
                            className="mt-0.5 flex items-center gap-2 text-[11px]"
                            style={{ color: "var(--ds-theme-content-muted)" }}
                          >
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wide"
                              style={{
                                padding: "2px 6px",
                                borderRadius: 9999,
                                background:
                                  "var(--ds-theme-surface-subdued)",
                                color: "var(--ds-theme-content-default)",
                              }}
                            >
                              {p.category}
                            </span>
                            {p.savedByMe && (
                              <span
                                className="inline-flex items-center gap-0.5"
                                aria-label="Salvo"
                              >
                                <BookmarkCheck size={11} aria-hidden />
                                salvo
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </aside>

          {/* Coluna mapa placeholder */}
          <section
            aria-label="Mapa"
            className="flex min-w-0 flex-col gap-3"
          >
            <MapCanvas
              places={placesTable}
              visibleIds={filteredIds}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            {selected && selectedId && (
              <PlaceDetail
                id={selectedId}
                place={selected}
                onClose={() => setSelectedId(null)}
                onToggleSave={() => toggleSaved(selectedId)}
              />
            )}
          </section>
        </div>
      </div>

      <ShareLocationModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        onConfirm={confirmShare}
      />
    </div>
  );
}

// ============================================================
// MapCanvas — placeholder visual do mapa (SVG, sem tiles reais)
// ============================================================
function MapCanvas({
  places,
  visibleIds,
  selectedId,
  onSelect,
}: {
  places: Record<string, Place>;
  visibleIds: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        aspectRatio: "16 / 10",
        borderRadius: "var(--ds-component-card-radius, 16px)",
        background: "var(--ds-theme-surface-subdued)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {/* Nota de proveniência do "mapa" — reforça que é mockup, não tiles reais */}
      <div
        className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide"
        style={{
          padding: "3px 8px",
          borderRadius: 9999,
          background: "var(--ds-theme-surface-default)",
          color: "var(--ds-theme-content-muted)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
        aria-hidden
      >
        <Info size={10} />
        Placeholder de mapa · sem tiles reais
      </div>

      <svg
        role="img"
        aria-label="Mapa esquemático com pins dos lugares"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {/* grade sutil simulando quarteirões */}
        <defs>
          <pattern
            id="mapgrid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="var(--ds-theme-border-subtle)"
              strokeWidth="0.3"
            />
          </pattern>
          <pattern
            id="mapgrid-major"
            width="30"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 30 0 L 0 0 0 30"
              fill="none"
              stroke="var(--ds-theme-border-subtle)"
              strokeWidth="0.6"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#mapgrid)" />
        <rect width="100" height="100" fill="url(#mapgrid-major)" />

        {/* "vias" diagonais só para dar textura */}
        <path
          d="M -5 60 L 105 40"
          stroke="var(--ds-theme-border-subtle)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M 20 -5 L 60 105"
          stroke="var(--ds-theme-border-subtle)"
          strokeWidth="1.2"
          fill="none"
        />

        {/* pins */}
        {visibleIds.map((id) => {
          const p = places[id];
          if (!p) return null;
          const { x, y } = project(p.lat, p.lng);
          const active = id === selectedId;
          return (
            <g
              key={id}
              transform={`translate(${x} ${y})`}
              style={{ cursor: "pointer" }}
              onClick={() => onSelect(id)}
              tabIndex={0}
              role="button"
              aria-label={`${p.name}, ${p.category}, ${p.distanceKm.toFixed(1)} km`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(id);
                }
              }}
            >
              {active && (
                <circle
                  r="4.5"
                  fill="var(--ds-theme-intent-accent-fill)"
                  opacity="0.25"
                />
              )}
              <circle
                r={active ? 2.4 : 1.9}
                fill={
                  active
                    ? "var(--ds-theme-intent-accent-fill)"
                    : "var(--ds-theme-surface-default)"
                }
                stroke="var(--ds-theme-intent-accent-fill)"
                strokeWidth="0.8"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ============================================================
// PlaceDetail — item ◻3 + item ◻4 (rota mock com proveniência)
// ============================================================
function PlaceDetail({
  id: _id,
  place,
  onClose,
  onToggleSave,
}: {
  id: string;
  place: Place;
  onClose: () => void;
  onToggleSave: () => void;
}) {
  const [routeMock, setRouteMock] = useState<{
    km: number;
    minutes: number;
  } | null>(null);

  const computeRoute = () => {
    // Cálculo trivial só para gerar um número plausível — a proveniência
    // deixa explícito que veio de conector externo.
    setRouteMock({
      km: place.distanceKm,
      minutes: Math.max(3, Math.round(place.distanceKm * 4.5)),
    });
  };

  return (
    <article
      aria-label={`Detalhes de ${place.name}`}
      className="flex flex-col gap-3 p-4"
      style={{
        borderRadius: "var(--ds-component-card-radius, 16px)",
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
        boxShadow: "var(--ds-component-card-shadow)",
      }}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p
            className="text-[11px] uppercase tracking-wide"
            style={{ color: "var(--ds-theme-content-subtle)" }}
          >
            {place.category} ·{" "}
            {place.distanceKm.toLocaleString("pt-BR", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            km
          </p>
          <h3
            className="text-lg font-semibold"
            style={{ color: "var(--ds-theme-content-strong)" }}
          >
            {place.name}
          </h3>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--ds-theme-content-muted)" }}
          >
            {place.addressLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar detalhes"
          className="grid h-8 w-8 shrink-0 place-items-center"
          style={{
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          <X size={14} aria-hidden />
        </button>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onToggleSave}
          aria-pressed={place.savedByMe}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{
            padding: "8px 12px",
            borderRadius: 9999,
            background: place.savedByMe
              ? "var(--ds-theme-intent-accent-subtle)"
              : "var(--ds-theme-surface-subdued)",
            color: place.savedByMe
              ? "var(--ds-theme-intent-accent-on-subtle)"
              : "var(--ds-theme-content-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          {place.savedByMe ? (
            <BookmarkCheck size={14} aria-hidden />
          ) : (
            <Bookmark size={14} aria-hidden />
          )}
          {place.savedByMe ? "Salvo" : "Salvar lugar"}
        </button>
        <button
          type="button"
          onClick={computeRoute}
          className="inline-flex items-center gap-1.5 text-xs font-semibold"
          style={{
            padding: "8px 12px",
            borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          <RouteIcon size={14} aria-hidden />
          Rota até aqui
        </button>
      </div>

      {routeMock && (
        <div
          role="status"
          className="flex flex-col gap-1 p-3 text-xs"
          style={{
            borderRadius: 12,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <div className="flex items-center gap-2">
            <RouteIcon size={12} aria-hidden />
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: "var(--ds-theme-content-strong)" }}
            >
              {routeMock.km.toLocaleString("pt-BR", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}{" "}
              km · ~{routeMock.minutes} min
            </span>
          </div>
          <p
            className="text-[11px]"
            style={{ color: "var(--ds-theme-content-muted)" }}
          >
            Rota calculada via{" "}
            <strong style={{ color: "var(--ds-theme-content-default)" }}>
              Conector de Mapas Mock
            </strong>{" "}
            — dados podem não refletir condições reais de trânsito.
          </p>
        </div>
      )}
    </article>
  );
}

// ============================================================
// ShareLocationModal — usa ConfirmModal do catálogo com confirmLabel
// ============================================================
function ShareLocationModal({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Compartilhar localização"
      description="Sua localização será compartilhada por 15 minutos e depois expira automaticamente. Você pode revogar antes disso. Trata-se de informação efêmera e sensível — só compartilhe com quem você confia."
      confirmLabel="Compartilhar por 15 min"
      cancelLabel="Cancelar"
      onConfirm={onConfirm}
    />
  );
}

// Export utilitário só para evitar warning caso alguém importe o ícone daqui.
export { LocateOff };