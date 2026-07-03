import { useMemo, useState, type CSSProperties } from "react";
import { useRowIds, useRow, useTable, store } from "@/store/hooks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState, PendingBadge } from "@/components/catalog/States";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Repeat,
  Users,
  MapPin,
  Download,
  Plus,
  AlertTriangle,
  Globe,
  CheckCircle2,
  X,
  ListOrdered,
} from "lucide-react";

// ============ B11 — Calendário ============
// INVARIANTE CENTRAL: 1 linha na tabela `events` com `rrule` != null pode
// render N ocorrências virtuais no grid do calendário. Nunca criamos linhas
// derivadas em `events` para cada instância — elas são calculadas em memória
// no `useMemo` de `expandEvents` a partir de `startAt` + `rrule`. Editar ou
// excluir "esta ocorrência" grava uma EXCEÇÃO em memória local (não altera a
// série); editar/excluir "toda a série" opera na linha original.

type EventRow = {
  title: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  location: string;
  attendees: string;
  rrule: string | null;
  capacity: number | null;
  bookedCount: number | null;
  externalSource: string | null;
  myRsvp: string | null;
};

type Instance = {
  key: string;           // id-ocorrência único (eventId + data)
  eventId: string;
  isVirtual: boolean;    // true = veio de RRULE, não da row original
  start: Date;
  end: Date;
  row: EventRow;
};

type View = "mes" | "semana" | "dia" | "agenda";

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const RRULE_DAY_MAP: Record<string, number> = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
const RRULE_DAY_INV = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

function startOfDay(d: Date) { const n = new Date(d); n.setHours(0, 0, 0, 0); return n; }
function addDays(d: Date, n: number) { const c = new Date(d); c.setDate(c.getDate() + n); return c; }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function startOfWeek(d: Date) { const c = startOfDay(d); c.setDate(c.getDate() - c.getDay()); return c; }
function startOfMonth(d: Date) { const c = startOfDay(d); c.setDate(1); return c; }
function endOfMonth(d: Date) { const c = startOfDay(d); c.setMonth(c.getMonth() + 1, 0); return c; }
function fmtDate(d: Date) { return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }); }
function fmtTime(d: Date) { return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
function fmtMonth(d: Date) { return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }); }
function toInputDate(d: Date) { return d.toISOString().slice(0, 10); }
function toInputTime(d: Date) { return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; }

// Parser mínimo de RRULE — suporta FREQ=DAILY|WEEKLY|MONTHLY e BYDAY=MO,WE,...
function parseRRule(rrule: string) {
  const parts = Object.fromEntries(
    rrule.split(";").map((p) => {
      const [k, v] = p.split("=");
      return [k, v];
    })
  );
  return {
    freq: parts.FREQ as "DAILY" | "WEEKLY" | "MONTHLY" | undefined,
    byDay: parts.BYDAY ? parts.BYDAY.split(",").map((d) => RRULE_DAY_MAP[d]).filter((n) => n !== undefined) : [],
  };
}

// Gera instâncias visuais (reais + virtuais) para uma janela [rangeStart, rangeEnd).
function expandEvents(
  ids: string[],
  getRow: (id: string) => EventRow,
  rangeStart: Date,
  rangeEnd: Date,
  exceptions: Record<string, "deleted" | "modified">
): Instance[] {
  const out: Instance[] = [];
  for (const id of ids) {
    const row = getRow(id);
    if (!row || !row.startAt) continue;
    const start = new Date(row.startAt);
    const end = new Date(row.endAt || row.startAt);
    const durMs = Math.max(0, end.getTime() - start.getTime());

    if (!row.rrule) {
      if (end >= rangeStart && start < rangeEnd) {
        out.push({ key: id, eventId: id, isVirtual: false, start, end, row });
      }
      continue;
    }
    const parsed = parseRRule(row.rrule);
    // Caminhamos dia-a-dia dentro do range; para cada dia compatível, geramos
    // uma instância com o mesmo horário do startAt original.
    const cursor = new Date(Math.max(startOfDay(rangeStart).getTime(), startOfDay(start).getTime()));
    const hardStop = addDays(rangeEnd, 1);
    let safety = 400; // teto de segurança
    while (cursor < hardStop && safety-- > 0) {
      let matches = false;
      if (parsed.freq === "DAILY") matches = true;
      else if (parsed.freq === "WEEKLY") matches = parsed.byDay.length === 0 ? cursor.getDay() === start.getDay() : parsed.byDay.includes(cursor.getDay());
      else if (parsed.freq === "MONTHLY") matches = cursor.getDate() === start.getDate();

      if (matches) {
        const instStart = new Date(cursor);
        instStart.setHours(start.getHours(), start.getMinutes(), 0, 0);
        const instEnd = new Date(instStart.getTime() + durMs);
        const isOriginal = sameDay(instStart, start);
        const key = isOriginal ? id : `${id}__${toInputDate(instStart)}`;
        if (exceptions[key] === "deleted") {
          cursor.setDate(cursor.getDate() + 1);
          continue;
        }
        out.push({ key, eventId: id, isVirtual: !isOriginal, start: instStart, end: instEnd, row });
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

function EventChip({ inst, onClick }: { inst: Instance; onClick: () => void }) {
  const lotado = inst.row.capacity != null && inst.row.bookedCount != null && inst.row.bookedCount >= inst.row.capacity;
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full truncate text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2"
      style={{
        padding: "2px 6px",
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        background: lotado ? "var(--ds-theme-intent-danger-subtle, var(--ds-theme-surface-subdued))" : "var(--ds-theme-intent-accent-subtle)",
        color: "var(--ds-theme-content-strong)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
      title={inst.row.title}
      aria-label={`${inst.row.title} — ${inst.row.allDay ? "dia inteiro" : fmtTime(inst.start)}`}
    >
      <span className="flex items-center gap-1">
        {inst.row.rrule && <Repeat size={9} aria-hidden />}
        {inst.row.externalSource && <Globe size={9} aria-hidden />}
        {lotado && <span aria-hidden>•</span>}
        <span className="truncate">
          {!inst.row.allDay && `${fmtTime(inst.start)} `}
          {inst.row.title}
        </span>
      </span>
    </button>
  );
}

function MonthView({ cursor, instances, onOpen }: { cursor: Date; instances: Instance[]; onOpen: (i: Instance) => void }) {
  const first = startOfMonth(cursor);
  const gridStart = startOfWeek(first);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) cells.push(addDays(gridStart, i));
  const today = new Date();
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold" style={{ color: "var(--ds-theme-content-muted)" }}>
        {WEEKDAYS_PT.map((w) => (<div key={w}>{w}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const isToday = sameDay(d, today);
          const dayInst = instances.filter((it) => sameDay(it.start, d));
          return (
            <div
              key={i}
              className="flex min-h-[92px] flex-col gap-1 p-1.5"
              style={{
                borderRadius: 10,
                background: inMonth ? "var(--ds-theme-surface-default)" : "var(--ds-theme-surface-subdued)",
                border: `1px solid ${isToday ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-border-subtle)"}`,
                opacity: inMonth ? 1 : 0.5,
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: isToday ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-content-strong)" }}>
                  {d.getDate()}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {dayInst.slice(0, 3).map((inst) => (
                  <EventChip key={inst.key} inst={inst} onClick={() => onOpen(inst)} />
                ))}
                {dayInst.length > 3 && (
                  <span className="text-[10px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    +{dayInst.length - 3} mais
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({ cursor, instances, onOpen }: { cursor: Date; instances: Instance[]; onOpen: (i: Instance) => void }) {
  const weekStart = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
      {days.map((d) => {
        const dayInst = instances.filter((it) => sameDay(it.start, d));
        const isToday = sameDay(d, today);
        return (
          <div
            key={d.toISOString()}
            className="flex min-h-[220px] flex-col gap-2 p-2"
            style={{
              borderRadius: 12,
              background: "var(--ds-theme-surface-default)",
              border: `1px solid ${isToday ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-border-subtle)"}`,
            }}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--ds-theme-content-muted)" }}>
                {WEEKDAYS_PT[d.getDay()]}
              </span>
              <span className="text-lg font-bold" style={{ color: isToday ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-content-strong)" }}>
                {d.getDate()}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {dayInst.length === 0 ? (
                <span className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>—</span>
              ) : (
                dayInst.map((inst) => <EventChip key={inst.key} inst={inst} onClick={() => onOpen(inst)} />)
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ cursor, instances, onOpen }: { cursor: Date; instances: Instance[]; onOpen: (i: Instance) => void }) {
  const dayInst = instances.filter((it) => sameDay(it.start, cursor));
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
        {cursor.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
      </h3>
      {dayInst.length === 0 ? (
        <EmptyState title="Nenhum evento neste dia" description="Use “Novo evento” para agendar." />
      ) : (
        <ul className="flex flex-col gap-2">
          {dayInst.map((inst) => (
            <li key={inst.key}>
              <button
                type="button"
                onClick={() => onOpen(inst)}
                className="flex w-full items-start gap-3 p-3 text-left transition-transform hover:-translate-y-0.5"
                style={{
                  borderRadius: "var(--ds-component-card-radius, 16px)",
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                  boxShadow: "var(--ds-component-card-shadow)",
                }}
              >
                <div className="flex w-20 shrink-0 flex-col text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                  <span className="font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {inst.row.allDay ? "Dia inteiro" : fmtTime(inst.start)}
                  </span>
                  {!inst.row.allDay && <span>{fmtTime(inst.end)}</span>}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {inst.row.title}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {inst.row.location && <span className="inline-flex items-center gap-1"><MapPin size={11} />{inst.row.location}</span>}
                    {inst.row.rrule && <span className="inline-flex items-center gap-1"><Repeat size={11} />recorrente</span>}
                    {inst.row.externalSource && <span className="inline-flex items-center gap-1"><Globe size={11} />{inst.row.externalSource}</span>}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AgendaView({ instances, onOpen }: { instances: Instance[]; onOpen: (i: Instance) => void }) {
  const now = new Date();
  const upcoming = instances.filter((i) => i.end >= now).slice(0, 30);
  if (upcoming.length === 0) return <EmptyState title="Sem próximos eventos" description="Sua agenda está livre." />;
  const byDay = new Map<string, Instance[]>();
  for (const i of upcoming) {
    const k = toInputDate(i.start);
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(i);
  }
  return (
    <div className="flex flex-col gap-4">
      {Array.from(byDay.entries()).map(([k, list]) => (
        <div key={k} className="flex flex-col gap-2">
          <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-muted)" }}>
            {fmtDate(new Date(k + "T00:00:00"))}
          </h4>
          <ul className="flex flex-col gap-1.5">
            {list.map((inst) => (
              <li key={inst.key}>
                <button
                  type="button"
                  onClick={() => onOpen(inst)}
                  className="flex w-full items-center gap-3 p-2.5 text-left"
                  style={{
                    borderRadius: 12,
                    background: "var(--ds-theme-surface-default)",
                    border: "1px solid var(--ds-theme-border-subtle)",
                  }}
                >
                  <span className="w-16 text-xs font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {inst.row.allDay ? "—" : fmtTime(inst.start)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm" style={{ color: "var(--ds-theme-content-default)" }}>
                    {inst.row.title}
                  </span>
                  {inst.row.rrule && <Repeat size={12} aria-hidden style={{ color: "var(--ds-theme-content-muted)" }} />}
                  {inst.row.externalSource && <Globe size={12} aria-hidden style={{ color: "var(--ds-theme-content-muted)" }} />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ---- Editor de recorrência (embutido no form) ----
type RecKind = "none" | "daily" | "weekly" | "monthly";
function rruleToKind(r: string | null): { kind: RecKind; byDay: string[] } {
  if (!r) return { kind: "none", byDay: [] };
  const p = parseRRule(r);
  if (p.freq === "DAILY") return { kind: "daily", byDay: [] };
  if (p.freq === "MONTHLY") return { kind: "monthly", byDay: [] };
  if (p.freq === "WEEKLY") return { kind: "weekly", byDay: p.byDay.map((n) => RRULE_DAY_INV[n]) };
  return { kind: "none", byDay: [] };
}
function kindToRRule(kind: RecKind, byDay: string[]): string | null {
  if (kind === "none") return null;
  if (kind === "daily") return "FREQ=DAILY";
  if (kind === "monthly") return "FREQ=MONTHLY";
  return `FREQ=WEEKLY${byDay.length ? `;BYDAY=${byDay.join(",")}` : ""}`;
}

function RecurrenceEditor({
  kind, byDay, onChange,
}: {
  kind: RecKind;
  byDay: string[];
  onChange: (k: RecKind, b: string[]) => void;
}) {
  const options: { v: RecKind; l: string }[] = [
    { v: "none", l: "Não repete" },
    { v: "daily", l: "Diariamente" },
    { v: "weekly", l: "Semanalmente" },
    { v: "monthly", l: "Mensalmente" },
  ];
  const days = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
  const dayLabels: Record<string, string> = { MO: "Seg", TU: "Ter", WE: "Qua", TH: "Qui", FR: "Sex", SA: "Sáb", SU: "Dom" };
  return (
    <div className="flex flex-col gap-2">
      <Label>Recorrência</Label>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v, o.v === "weekly" ? (byDay.length ? byDay : ["MO"]) : [])}
            className="text-xs font-semibold"
            style={{
              padding: "6px 12px",
              borderRadius: 9999,
              background: kind === o.v ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-surface-subdued)",
              color: kind === o.v ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-default)",
            }}
          >
            {o.l}
          </button>
        ))}
      </div>
      {kind === "weekly" && (
        <div className="flex flex-wrap gap-1.5">
          {days.map((d) => {
            const active = byDay.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  const next = active ? byDay.filter((x) => x !== d) : [...byDay, d];
                  onChange("weekly", next);
                }}
                className="text-[11px] font-semibold"
                style={{
                  padding: "5px 10px",
                  borderRadius: 9999,
                  background: active ? "var(--ds-theme-intent-accent-subtle)" : "var(--ds-theme-surface-default)",
                  color: "var(--ds-theme-content-strong)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                {dayLabels[d]}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---- Form / Editor de evento ----
function EventForm({
  open,
  onOpenChange,
  initial,
  onSubmit,
  title = "Novo evento",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Partial<EventRow>;
  onSubmit: (data: EventRow) => void;
  title?: string;
}) {
  const seed = initial?.startAt ? new Date(initial.startAt) : new Date();
  const seedEnd = initial?.endAt ? new Date(initial.endAt) : new Date(seed.getTime() + 60 * 60000);
  const [t, setT] = useState(initial?.title ?? "");
  const [date, setDate] = useState(toInputDate(seed));
  const [startT, setStartT] = useState(toInputTime(seed));
  const [endT, setEndT] = useState(toInputTime(seedEnd));
  const [allDay, setAllDay] = useState(!!initial?.allDay);
  const [loc, setLoc] = useState(initial?.location ?? "");
  const [att, setAtt] = useState(initial?.attendees ?? "");
  const [cap, setCap] = useState(initial?.capacity != null ? String(initial.capacity) : "");
  const rec0 = rruleToKind(initial?.rrule ?? null);
  const [recKind, setRecKind] = useState<RecKind>(rec0.kind);
  const [recDays, setRecDays] = useState<string[]>(rec0.byDay);
  const [err, setErr] = useState<string | null>(null);

  const capacityFull =
    cap && initial?.bookedCount != null && Number(cap) > 0 && initial.bookedCount >= Number(cap);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Preencha os detalhes do evento.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!t.trim()) return setErr("Informe um título.");
            const s = new Date(`${date}T${allDay ? "00:00" : startT}:00`);
            const en = new Date(`${date}T${allDay ? "23:59" : endT}:00`);
            if (en < s) return setErr("O fim precisa ser depois do início.");
            const capNum = cap ? Number(cap) : null;
            if (capNum != null && initial?.bookedCount != null && capNum < initial.bookedCount) {
              return setErr(`Capacidade abaixo dos ${initial.bookedCount} já reservados.`);
            }
            setErr(null);
            onSubmit({
              title: t.trim(),
              startAt: s.toISOString(),
              endAt: en.toISOString(),
              allDay,
              location: loc,
              attendees: att,
              rrule: kindToRRule(recKind, recDays),
              capacity: capNum,
              bookedCount: initial?.bookedCount ?? null,
              externalSource: initial?.externalSource ?? null,
              myRsvp: initial?.myRsvp ?? null,
            });
          }}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="ev-title">Título</Label>
            <Input id="ev-title" value={t} onChange={(e) => setT(e.target.value)} autoFocus />
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label htmlFor="ev-date">Data</Label>
              <Input id="ev-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ev-start">Início</Label>
              <Input id="ev-start" type="time" value={startT} onChange={(e) => setStartT(e.target.value)} disabled={allDay} />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="ev-end">Fim</Label>
              <Input id="ev-end" type="time" value={endT} onChange={(e) => setEndT(e.target.value)} disabled={allDay} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="ev-allday" checked={allDay} onCheckedChange={(v) => setAllDay(v === true)} />
            <Label htmlFor="ev-allday" className="cursor-pointer text-xs">Dia inteiro</Label>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ev-loc">Local</Label>
            <Input id="ev-loc" value={loc} onChange={(e) => setLoc(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ev-att">Participantes (separados por vírgula)</Label>
            <Input id="ev-att" value={att} onChange={(e) => setAtt(e.target.value)} placeholder="Ana, Pedro, ..." />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ev-cap">Capacidade (opcional)</Label>
            <Input id="ev-cap" type="number" min={0} value={cap} onChange={(e) => setCap(e.target.value)} />
            {capacityFull && (
              <p role="alert" className="text-[11px]" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
                Este evento está com capacidade esgotada ({initial?.bookedCount}/{cap}).
              </p>
            )}
          </div>
          <RecurrenceEditor kind={recKind} byDay={recDays} onChange={(k, b) => { setRecKind(k); setRecDays(b); }} />
          {err && <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>{err}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Prompt "esta ocorrência" vs "toda a série" ----
function ScopePromptModal({
  open, onOpenChange, mode, onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "edit" | "delete";
  onPick: (scope: "instance" | "series") => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar evento recorrente" : "Excluir evento recorrente"}</DialogTitle>
          <DialogDescription>
            Este evento faz parte de uma série. O que você quer {mode === "edit" ? "editar" : "excluir"}?
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Button variant="outline" onClick={() => { onPick("instance"); onOpenChange(false); }}>
            Esta ocorrência
          </Button>
          <Button onClick={() => { onPick("series"); onOpenChange(false); }}>
            Toda a série
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---- Painel de detalhe ----
function EventDetail({
  inst, onClose, onEdit, onDelete, onRsvp,
}: {
  inst: Instance;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRsvp: (v: string) => void;
}) {
  const lotado = inst.row.capacity != null && inst.row.bookedCount != null && inst.row.bookedCount >= inst.row.capacity;
  const badgeStyle: CSSProperties = {
    padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600,
    background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-strong)",
    border: "1px solid var(--ds-theme-border-subtle)",
  };
  return (
    <div
      className="flex h-full w-full flex-col gap-3 overflow-y-auto p-4"
      style={{ background: "var(--ds-theme-surface-default)" }}
      role="region"
      aria-label={`Detalhe: ${inst.row.title}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{inst.row.title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="grid place-items-center"
          style={{ width: 32, height: 32, borderRadius: 12, background: "var(--ds-theme-surface-subdued)" }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {inst.row.rrule && <span style={badgeStyle}><Repeat size={11} className="mr-1 inline" />Repete {inst.row.rrule.includes("WEEKLY") ? "semanalmente" : inst.row.rrule.includes("DAILY") ? "diariamente" : "mensalmente"}</span>}
        {inst.row.externalSource && <span style={badgeStyle}><Globe size={11} className="mr-1 inline" />Importado de {inst.row.externalSource}</span>}
        {lotado && (
          <span
            style={{
              ...badgeStyle,
              background: "var(--ds-theme-intent-danger-subtle, var(--ds-theme-surface-subdued))",
            }}
          >
            Lotado ({inst.row.bookedCount}/{inst.row.capacity})
          </span>
        )}
      </div>

      {lotado && (
        <div
          role="alert"
          className="flex items-start gap-2 p-3 text-xs"
          style={{
            borderRadius: 12,
            background: "var(--ds-theme-intent-danger-subtle, var(--ds-theme-surface-subdued))",
            color: "var(--ds-theme-content-strong)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <AlertTriangle size={14} aria-hidden />
          <span>
            Este evento está com capacidade esgotada ({inst.row.bookedCount}/{inst.row.capacity}). Novas inscrições estão bloqueadas.
          </span>
        </div>
      )}

      <dl className="grid grid-cols-1 gap-2 text-sm">
        <div>
          <dt className="text-[11px] font-semibold uppercase" style={{ color: "var(--ds-theme-content-muted)" }}>Quando</dt>
          <dd style={{ color: "var(--ds-theme-content-default)" }}>
            {fmtDate(inst.start)}{inst.row.allDay ? " · Dia inteiro" : ` · ${fmtTime(inst.start)} – ${fmtTime(inst.end)}`}
          </dd>
        </div>
        {inst.row.location && (
          <div>
            <dt className="text-[11px] font-semibold uppercase" style={{ color: "var(--ds-theme-content-muted)" }}>Local</dt>
            <dd className="inline-flex items-center gap-1" style={{ color: "var(--ds-theme-content-default)" }}><MapPin size={12} />{inst.row.location}</dd>
          </div>
        )}
        {inst.row.attendees && (
          <div>
            <dt className="text-[11px] font-semibold uppercase" style={{ color: "var(--ds-theme-content-muted)" }}>Participantes</dt>
            <dd className="inline-flex items-center gap-1" style={{ color: "var(--ds-theme-content-default)" }}><Users size={12} />{inst.row.attendees}</dd>
          </div>
        )}
      </dl>

      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase" style={{ color: "var(--ds-theme-content-muted)" }}>Sua resposta</span>
        <div className="flex flex-wrap gap-1.5">
          {[
            { v: "aceito", l: "Aceitar" },
            { v: "talvez", l: "Talvez" },
            { v: "recusado", l: "Recusar" },
          ].map((o) => {
            const active = inst.row.myRsvp === o.v;
            return (
              <button
                key={o.v}
                type="button"
                onClick={() => onRsvp(o.v)}
                className="inline-flex items-center gap-1 text-xs font-semibold"
                style={{
                  padding: "6px 12px",
                  borderRadius: 9999,
                  background: active ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-surface-subdued)",
                  color: active ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-default)",
                }}
              >
                {active && <CheckCircle2 size={12} />} {o.l}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-auto flex gap-2 pt-3">
        <Button variant="outline" className="flex-1" onClick={onEdit}>Editar</Button>
        <Button variant="destructive" className="flex-1" onClick={onDelete}>Excluir</Button>
      </div>
    </div>
  );
}

// ---- Placeholder de import .ics ----
function ImportIcsModal({
  open, onOpenChange, onImport,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: () => void;
}) {
  const [file, setFile] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar .ics</DialogTitle>
          <DialogDescription>
            Selecione um arquivo .ics exportado do seu calendário externo. Os eventos importados ficam marcados com a origem.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="ics-file">Arquivo</Label>
          <Input id="ics-file" type="file" accept=".ics" onChange={(e) => setFile(e.target.value)} />
          <p className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
            Mockup: nenhum arquivo real é lido. A importação cria 2 eventos de exemplo com origem “Google Calendar (.ics)”.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={() => { onImport(); onOpenChange(false); setFile(""); }} disabled={!file}>
            Importar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============= Módulo raiz =============
export function CalendarioModule() {
  const eventIds = useRowIds("events");
  const eventsTable = useTable("events") as unknown as Record<string, EventRow>;
  const [view, setView] = useState<View>("mes");
  const [cursor, setCursor] = useState<Date>(() => new Date("2026-07-06T00:00:00"));
  const [openInstance, setOpenInstance] = useState<Instance | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<{ id: string; row: EventRow } | null>(null);
  const [scopePrompt, setScopePrompt] = useState<null | { mode: "edit" | "delete"; inst: Instance }>(null);
  const [importOpen, setImportOpen] = useState(false);
  // Exceções em memória (excluir uma ocorrência específica de série recorrente).
  // Chave: `${eventId}__${YYYY-MM-DD}` — não persiste (mockup).
  const [exceptions, setExceptions] = useState<Record<string, "deleted" | "modified">>({});

  const range = useMemo(() => {
    if (view === "mes") {
      const s = startOfWeek(startOfMonth(cursor));
      return { start: s, end: addDays(s, 42) };
    }
    if (view === "semana") {
      const s = startOfWeek(cursor);
      return { start: s, end: addDays(s, 7) };
    }
    if (view === "dia") {
      const s = startOfDay(cursor);
      return { start: s, end: addDays(s, 1) };
    }
    const s = startOfDay(new Date());
    return { start: s, end: addDays(s, 30) };
  }, [view, cursor]);

  const instances = useMemo(
    () => expandEvents(eventIds, (id) => eventsTable[id], range.start, range.end, exceptions),
    [eventIds, eventsTable, range.start, range.end, exceptions]
  );

  const shift = (dir: 1 | -1) => {
    const c = new Date(cursor);
    if (view === "mes") c.setMonth(c.getMonth() + dir);
    else if (view === "semana") c.setDate(c.getDate() + 7 * dir);
    else c.setDate(c.getDate() + dir);
    setCursor(c);
  };

  const openDetail = (i: Instance) => setOpenInstance(i);

  const saveNewOrEdit = (data: EventRow) => {
    if (editing) {
      store.setRow("events", editing.id, data as unknown as Record<string, string | number | boolean>);
    } else {
      const id = `ev_${Date.now()}`;
      store.setRow("events", id, data as unknown as Record<string, string | number | boolean>);
    }
    setEditing(null);
    setFormOpen(false);
  };

  const handleEditClick = () => {
    if (!openInstance) return;
    if (openInstance.row.rrule) {
      setScopePrompt({ mode: "edit", inst: openInstance });
    } else {
      setEditing({ id: openInstance.eventId, row: openInstance.row });
      setFormOpen(true);
      setOpenInstance(null);
    }
  };
  const handleDeleteClick = () => {
    if (!openInstance) return;
    if (openInstance.row.rrule) {
      setScopePrompt({ mode: "delete", inst: openInstance });
    } else {
      store.delRow("events", openInstance.eventId);
      setOpenInstance(null);
    }
  };

  const applyScope = (scope: "instance" | "series") => {
    if (!scopePrompt) return;
    const { mode, inst } = scopePrompt;
    if (mode === "delete") {
      if (scope === "series") store.delRow("events", inst.eventId);
      else setExceptions((prev) => ({ ...prev, [inst.key]: "deleted" }));
      setOpenInstance(null);
    } else {
      // Edit: se "instance", criamos uma cópia one-off (sem rrule) na data e
      // marcamos a instância original como deleted (padrão calendário clássico).
      if (scope === "series") {
        setEditing({ id: inst.eventId, row: inst.row });
        setFormOpen(true);
        setOpenInstance(null);
      } else {
        setExceptions((prev) => ({ ...prev, [inst.key]: "deleted" }));
        setEditing({
          id: `ev_${Date.now()}`,
          row: {
            ...inst.row,
            startAt: inst.start.toISOString(),
            endAt: inst.end.toISOString(),
            rrule: null,
            title: inst.row.title,
          },
        });
        // Grava como novo ao salvar (id novo já)
        setFormOpen(true);
        setOpenInstance(null);
      }
    }
    setScopePrompt(null);
  };

  const handleRsvp = (v: string) => {
    if (!openInstance) return;
    store.setCell("events", openInstance.eventId, "myRsvp", v);
    setOpenInstance({ ...openInstance, row: { ...openInstance.row, myRsvp: v } });
  };

  const doImportIcs = () => {
    const now = Date.now();
    const base = addDays(startOfDay(cursor), 2);
    store.setRow("events", `ev_ics_${now}_a`, {
      title: "Reunião importada — Design Ops",
      startAt: new Date(base.setHours(15, 0, 0, 0)).toISOString(),
      endAt: new Date(base.setHours(16, 0, 0, 0)).toISOString(),
      allDay: false,
      location: "Chamada externa",
      attendees: "Equipe Aurora",
      rrule: null,
      capacity: null,
      bookedCount: null,
      externalSource: "Google Calendar (.ics)",
      myRsvp: "aceito",
    } as unknown as Record<string, string | number | boolean>);
    const base2 = addDays(startOfDay(cursor), 5);
    store.setRow("events", `ev_ics_${now}_b`, {
      title: "Aniversário — importado",
      startAt: new Date(base2.setHours(0, 0, 0, 0)).toISOString(),
      endAt: new Date(base2.setHours(23, 59, 0, 0)).toISOString(),
      allDay: true,
      location: "",
      attendees: "",
      rrule: null,
      capacity: null,
      bookedCount: null,
      externalSource: "Google Calendar (.ics)",
      myRsvp: null,
    } as unknown as Record<string, string | number | boolean>);
  };

  const title = view === "mes" ? fmtMonth(cursor)
    : view === "semana" ? `Semana de ${fmtDate(startOfWeek(cursor))}`
    : view === "dia" ? fmtDate(cursor)
    : "Agenda";

  const hasEvents = eventIds.length > 0;

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto">
        <header
          className="flex flex-wrap items-center justify-between gap-3 border-b p-4"
          style={{ background: "var(--ds-theme-surface-default)", borderColor: "var(--ds-theme-border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="grid place-items-center"
              style={{ width: 40, height: 40, borderRadius: 12, background: "var(--ds-theme-intent-accent-subtle)", color: "var(--ds-theme-intent-accent-on-subtle)" }}
              aria-hidden
            >
              <CalendarIcon size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-muted)" }}>
                Calendário
              </p>
              <h2 className="text-lg font-semibold capitalize" style={{ color: "var(--ds-theme-content-strong)" }}>
                {title}
              </h2>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Anterior" onClick={() => shift(-1)} className="grid place-items-center" style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ds-theme-surface-subdued)" }}>
                <ChevronLeft size={16} />
              </button>
              <button type="button" onClick={() => setCursor(new Date("2026-07-06T00:00:00"))} className="text-xs font-semibold" style={{ padding: "6px 12px", borderRadius: 9999, background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-default)" }}>
                Hoje
              </button>
              <button type="button" aria-label="Próximo" onClick={() => shift(1)} className="grid place-items-center" style={{ width: 32, height: 32, borderRadius: 10, background: "var(--ds-theme-surface-subdued)" }}>
                <ChevronRight size={16} />
              </button>
            </div>
            <div role="tablist" aria-label="Visões" className="flex gap-1">
              {[
                { v: "mes", l: "Mês" },
                { v: "semana", l: "Semana" },
                { v: "dia", l: "Dia" },
                { v: "agenda", l: "Agenda", icon: <ListOrdered size={12} /> },
              ].map((o) => (
                <button
                  key={o.v}
                  type="button"
                  role="tab"
                  aria-selected={view === o.v}
                  onClick={() => setView(o.v as View)}
                  className="inline-flex items-center gap-1 text-xs font-semibold"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 9999,
                    background: view === o.v ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-surface-subdued)",
                    color: view === o.v ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-default)",
                  }}
                >
                  {o.icon}
                  {o.l}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ padding: "6px 12px", borderRadius: 9999, background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-default)" }}
            >
              <Download size={12} /> Importar .ics
            </button>
            <button
              type="button"
              onClick={() => { setEditing(null); setFormOpen(true); }}
              className="inline-flex items-center gap-1 text-xs font-semibold"
              style={{ padding: "6px 12px", borderRadius: 9999, background: "var(--ds-theme-intent-accent-fill)", color: "var(--ds-theme-intent-accent-on-fill)" }}
            >
              <Plus size={12} /> Novo evento
            </button>
          </div>
        </header>

        <div className="flex flex-col gap-3 p-4">
          {!hasEvents ? (
            <EmptyState title="Nenhum evento" description="Crie seu primeiro evento ou importe um .ics." actionLabel="Novo evento" onAction={() => setFormOpen(true)} />
          ) : view === "mes" ? (
            <MonthView cursor={cursor} instances={instances} onOpen={openDetail} />
          ) : view === "semana" ? (
            <WeekView cursor={cursor} instances={instances} onOpen={openDetail} />
          ) : view === "dia" ? (
            <DayView cursor={cursor} instances={instances} onOpen={openDetail} />
          ) : (
            <AgendaView instances={instances} onOpen={openDetail} />
          )}

          <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
            <Repeat size={11} /> recorrente
            <Globe size={11} /> importado
            <PendingBadge label="parcial" />
          </div>
        </div>
      </div>

      {openInstance && (
        <aside
          className="hidden w-[380px] shrink-0 border-l md:flex"
          style={{ borderColor: "var(--ds-theme-border-subtle)" }}
        >
          <EventDetail
            inst={openInstance}
            onClose={() => setOpenInstance(null)}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onRsvp={handleRsvp}
          />
        </aside>
      )}

      {/* Detalhe em modal para mobile */}
      {openInstance && (
        <Dialog open={true} onOpenChange={(v) => { if (!v) setOpenInstance(null); }}>
          <DialogContent className="md:hidden">
            <EventDetail
              inst={openInstance}
              onClose={() => setOpenInstance(null)}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onRsvp={handleRsvp}
            />
          </DialogContent>
        </Dialog>
      )}

      <EventForm
        open={formOpen}
        onOpenChange={(v) => { setFormOpen(v); if (!v) setEditing(null); }}
        initial={editing?.row}
        onSubmit={saveNewOrEdit}
        title={editing ? "Editar evento" : "Novo evento"}
      />

      <ScopePromptModal
        open={!!scopePrompt}
        onOpenChange={(v) => { if (!v) setScopePrompt(null); }}
        mode={scopePrompt?.mode ?? "edit"}
        onPick={applyScope}
      />

      <ImportIcsModal open={importOpen} onOpenChange={setImportOpen} onImport={doImportIcs} />
    </div>
  );
}

// Consome hook para evitar warning em build caso removido acidentalmente.
// (Placeholder — hook real usado acima.)
void useRow;