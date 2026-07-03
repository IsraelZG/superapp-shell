/**
 * B10 — Email (T-EML)
 *
 * Renderiza na coluna central quando o item "Email" do CommsRail (commsMenu)
 * está ativo (activeComms === "email"). Reusa o rail de comunicações
 * existente — não recria header/rail/footer do shell.
 *
 * Exceção "editor precisa de mais área" (mesmo padrão do Studio B12):
 * o Compositor abre em OVERLAY fixed inset-0 por cima de todo o shell,
 * dando 100vw × 100vh sem quebrar as demais colunas. Esc fecha.
 *
 * Invariantes:
 * - Envio é saga: "pendente" → "enviado" em ~1s (setTimeout no mockup).
 * - "eco-suprimido": mensagem que voltou pelo próprio remetente e a
 *   cópia local foi silenciosamente descartada para não duplicar.
 * - Reentrega do protocolo P2P é idempotente (mesmo id = mesma msg);
 *   comunicado como tooltip discreto no ícone de status.
 */
import { useEffect, useMemo, useState } from "react";
import {
  Mail,
  Inbox,
  Send,
  Archive,
  Plus,
  X,
  Paperclip,
  Reply,
  ChevronDown,
  Loader2,
  Info,
  Settings,
  ArchiveRestore,
} from "lucide-react";
import { store, useTable, useValue, useSortedRowIds, useCell } from "@/store/hooks";
import { EmptyState, SyncingState } from "@/components/catalog/States";

// --------------------------------------------------------------------------
// Tipos locais (espelham as linhas semeadas em store.ts)
// --------------------------------------------------------------------------
type EmailRow = {
  accountId?: string;
  folder?: "inbox" | "sent" | "archive";
  fromName?: string;
  fromAddress?: string;
  subject?: string;
  preview?: string;
  body?: string;
  read?: boolean;
  sendStatus?: "enviado" | "pendente" | "eco-suprimido" | null;
  threadId?: string;
  receivedAt?: string;
};

type AccountRow = {
  address?: string;
  provider?: string;
  displayName?: string;
  syncStatus?: "sincronizado" | "sincronizando" | "erro";
};

type Folder = "inbox" | "sent" | "archive";

const folderMeta: Record<Folder, { label: string; icon: typeof Inbox }> = {
  inbox: { label: "Caixa de entrada", icon: Inbox },
  sent: { label: "Enviados", icon: Send },
  archive: { label: "Arquivo", icon: Archive },
};

function formatDate(iso?: string) {
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
}

// --------------------------------------------------------------------------
// Módulo principal
// --------------------------------------------------------------------------
export function EmailModule() {
  const accounts = useTable("emailAccounts") as Record<string, AccountRow>;
  const emails = useTable("emails") as Record<string, EmailRow>;

  const accountIds = Object.keys(accounts);
  const storedAccountId = useValue("emailActiveAccountId") as string;
  const activeAccountId =
    storedAccountId && accounts[storedAccountId] ? storedAccountId : accountIds[0] ?? "";
  const [folder, setFolder] = useState<Folder>("inbox");
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);

  const filtered = useMemo(() => {
    return Object.entries(emails)
      .map(([id, e]) => ({ id, ...e }))
      .filter((e) => e.accountId === activeAccountId && e.folder === folder)
      .sort((a, b) => (b.receivedAt ?? "").localeCompare(a.receivedAt ?? ""));
  }, [emails, activeAccountId, folder]);

  // Agrupa por threadId, mostrando só o mais recente por thread na lista.
  const listRows = useMemo(() => {
    const seen = new Set<string>();
    const out: Array<{ id: string; threadId: string; count: number } & EmailRow> = [];
    for (const e of filtered) {
      const tid = e.threadId ?? e.id;
      if (seen.has(tid)) continue;
      seen.add(tid);
      const count = filtered.filter((x) => (x.threadId ?? x.id) === tid).length;
      out.push({ ...e, threadId: tid, count });
    }
    return out;
  }, [filtered]);

  const unreadCount = listRows.filter((r) => r.read === false).length;

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-hidden">
        <Header
          accounts={accounts}
          activeAccountId={activeAccountId}
          onCompose={() => setComposeOpen(true)}
          onConfigureAccount={() => setAccountModalOpen(true)}
        />

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <FolderSidebar
            folder={folder}
            onChange={(f) => {
              setFolder(f);
              setOpenThreadId(null);
            }}
            unread={unreadCount}
          />
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <EmailList
              rows={listRows}
              openThreadId={openThreadId}
              onOpen={(tid) => setOpenThreadId(tid)}
              folder={folder}
            />
            <ThreadPane
              threadId={openThreadId}
              emails={emails}
              onClose={() => setOpenThreadId(null)}
              onReply={() => setComposeOpen(true)}
            />
          </div>
        </div>
      </div>

      {composeOpen && (
        <ComposeOverlay
          accounts={accounts}
          activeAccountId={activeAccountId}
          onClose={() => setComposeOpen(false)}
        />
      )}
      {accountModalOpen && (
        <AccountModal onClose={() => setAccountModalOpen(false)} />
      )}
    </>
  );
}

// --------------------------------------------------------------------------
// Header — título + seletor de conta
// --------------------------------------------------------------------------
function Header({
  accounts,
  activeAccountId,
  onCompose,
  onConfigureAccount,
}: {
  accounts: Record<string, AccountRow>;
  activeAccountId: string;
  onCompose: () => void;
  onConfigureAccount: () => void;
}) {
  const [open, setOpen] = useState(false);
  const acc = accounts[activeAccountId];
  const ids = Object.keys(accounts);

  return (
    <header
      className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"
      style={{ borderColor: "var(--ds-theme-border-subtle)" }}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-9 w-9 place-items-center"
          style={{
            borderRadius: 14,
            background: "var(--ds-theme-intent-accent-subtle)",
            color: "var(--ds-theme-intent-accent-on-subtle)",
          }}
          aria-hidden
        >
          <Mail size={18} />
        </span>
        <div>
          <p
            className="text-[11px] font-medium uppercase tracking-wide"
            style={{ color: "var(--ds-theme-content-subtle)" }}
          >
            Comunicações
          </p>
          <h2
            className="text-lg font-semibold"
            style={{ color: "var(--ds-theme-content-strong)" }}
          >
            Email
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Seletor de conta */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex items-center gap-2 text-xs font-semibold"
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <span className="max-w-[180px] truncate">{acc?.displayName ?? "Conta"}</span>
            {acc?.syncStatus === "sincronizando" && (
              <Loader2 size={12} className="animate-spin" aria-label="sincronizando" />
            )}
            <ChevronDown size={12} aria-hidden />
          </button>
          {open && (
            <ul
              role="listbox"
              className="absolute right-0 z-30 mt-1 min-w-[240px]"
              style={{
                background: "var(--ds-theme-surface-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
                borderRadius: 14,
                boxShadow: "var(--ds-component-card-shadow)",
                padding: 6,
              }}
            >
              {ids.map((id) => {
                const a = accounts[id];
                const active = id === activeAccountId;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => {
                        store.setValue("emailActiveAccountId", id);
                        setOpen(false);
                      }}
                      aria-current={active ? "true" : undefined}
                      className="flex w-full items-center justify-between gap-2 text-left text-xs"
                      style={{
                        padding: "8px 10px",
                        borderRadius: 10,
                        background: active ? "var(--ds-theme-intent-accent-subtle)" : "transparent",
                        color: active
                          ? "var(--ds-theme-intent-accent-on-subtle)"
                          : "var(--ds-theme-content-default)",
                      }}
                    >
                      <span className="flex flex-col">
                        <span className="font-semibold">{a?.displayName}</span>
                        <span style={{ color: "var(--ds-theme-content-muted)" }}>
                          {a?.address}
                        </span>
                      </span>
                      {a?.syncStatus === "sincronizando" && (
                        <Loader2 size={12} className="animate-spin" aria-hidden />
                      )}
                    </button>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    onConfigureAccount();
                  }}
                  className="mt-1 flex w-full items-center gap-2 border-t pt-2 text-left text-xs font-semibold"
                  style={{
                    padding: "8px 10px",
                    borderColor: "var(--ds-theme-border-subtle)",
                    color: "var(--ds-theme-intent-accent-fill)",
                  }}
                >
                  <Settings size={12} aria-hidden /> Configurar nova conta (IMAP/SMTP)
                </button>
              </li>
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={onCompose}
          className="inline-flex items-center gap-1 text-xs font-semibold"
          style={{
            padding: "8px 14px",
            borderRadius: 9999,
            background: "var(--ds-theme-intent-accent-fill)",
            color: "var(--ds-theme-intent-accent-on-fill)",
          }}
        >
          <Plus size={12} aria-hidden /> Escrever
        </button>
      </div>
    </header>
  );
}

// --------------------------------------------------------------------------
// Sidebar de pastas
// --------------------------------------------------------------------------
function FolderSidebar({
  folder,
  onChange,
  unread,
}: {
  folder: Folder;
  onChange: (f: Folder) => void;
  unread: number;
}) {
  return (
    <nav
      aria-label="Pastas de email"
      className="flex shrink-0 gap-1 border-b p-2 md:w-52 md:flex-col md:border-b-0 md:border-r md:p-3"
      style={{ borderColor: "var(--ds-theme-border-subtle)" }}
    >
      {(Object.keys(folderMeta) as Folder[]).map((f) => {
        const meta = folderMeta[f];
        const Icon = meta.icon;
        const active = folder === f;
        return (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            aria-current={active ? "page" : undefined}
            className="flex flex-1 items-center gap-2 text-xs font-semibold md:flex-none"
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              background: active
                ? "var(--ds-theme-intent-accent-subtle)"
                : "transparent",
              color: active
                ? "var(--ds-theme-intent-accent-on-subtle)"
                : "var(--ds-theme-content-default)",
            }}
          >
            <Icon size={14} aria-hidden />
            <span className="truncate">{meta.label}</span>
            {f === "inbox" && unread > 0 && (
              <span
                className="ml-auto grid place-items-center text-[10px] font-bold"
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: "0 6px",
                  borderRadius: 9999,
                  background: "var(--ds-theme-intent-accent-fill)",
                  color: "var(--ds-theme-intent-accent-on-fill)",
                }}
              >
                {unread}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

// --------------------------------------------------------------------------
// Lista de emails
// --------------------------------------------------------------------------
function EmailList({
  rows,
  openThreadId,
  onOpen,
  folder,
}: {
  rows: Array<{ id: string; threadId: string; count: number } & EmailRow>;
  openThreadId: string | null;
  onOpen: (tid: string) => void;
  folder: Folder;
}) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <EmptyState
          title="Nada por aqui"
          description={
            folder === "inbox"
              ? "Sua caixa está vazia. Novos emails aparecem aqui."
              : folder === "sent"
              ? "Você ainda não enviou nada desta conta."
              : "Nenhum email arquivado."
          }
        />
      </div>
    );
  }
  return (
    <ul
      aria-label="Emails"
      className="flex-1 overflow-y-auto md:max-w-md md:border-r"
      style={{ borderColor: "var(--ds-theme-border-subtle)" }}
    >
      {rows.map((r) => {
        const active = openThreadId === r.threadId;
        const unread = r.read === false;
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onOpen(r.threadId)}
              aria-current={active ? "true" : undefined}
              className="flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors"
              style={{
                borderColor: "var(--ds-theme-border-subtle)",
                background: active
                  ? "var(--ds-theme-intent-accent-subtle)"
                  : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "var(--ds-theme-surface-subdued)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              <div className="flex items-center gap-2">
                {unread && (
                  <span
                    aria-label="não lido"
                    className="inline-block shrink-0"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 9999,
                      background: "var(--ds-theme-intent-accent-fill)",
                    }}
                  />
                )}
                <span
                  className="min-w-0 flex-1 truncate text-sm"
                  style={{
                    fontWeight: unread ? 700 : 500,
                    color: "var(--ds-theme-content-strong)",
                  }}
                >
                  {r.fromName}
                </span>
                {r.count > 1 && (
                  <span
                    className="shrink-0 text-[10px] font-semibold"
                    style={{
                      padding: "1px 6px",
                      borderRadius: 9999,
                      background: "var(--ds-theme-surface-subdued)",
                      color: "var(--ds-theme-content-muted)",
                    }}
                    title={`${r.count} mensagens nesta thread`}
                  >
                    {r.count}
                  </span>
                )}
                <span
                  className="shrink-0 text-[11px]"
                  style={{ color: "var(--ds-theme-content-subtle)" }}
                >
                  {formatDate(r.receivedAt)}
                </span>
              </div>
              <span
                className="truncate text-xs"
                style={{
                  color: "var(--ds-theme-content-default)",
                  fontWeight: unread ? 600 : 400,
                }}
              >
                {r.subject}
              </span>
              <span
                className="truncate text-xs"
                style={{ color: "var(--ds-theme-content-muted)" }}
              >
                {r.preview}
              </span>
              {r.sendStatus === "pendente" && (
                <span
                  className="mt-1 inline-flex items-center gap-1 self-start text-[10px] font-semibold"
                  style={{
                    padding: "2px 8px",
                    borderRadius: 9999,
                    background: "var(--ds-theme-intent-accent-subtle)",
                    color: "var(--ds-theme-intent-accent-on-subtle)",
                  }}
                >
                  <Loader2 size={10} className="animate-spin" aria-hidden />
                  Enviando…
                </span>
              )}
              {r.sendStatus === "eco-suprimido" && (
                <span
                  className="mt-1 inline-flex items-center gap-1 self-start text-[10px]"
                  style={{
                    padding: "2px 8px",
                    borderRadius: 9999,
                    background: "var(--ds-theme-surface-subdued)",
                    color: "var(--ds-theme-content-muted)",
                  }}
                  title="Cópia local suprimida (você é o remetente e destinatário — evitando duplicata)"
                >
                  <Info size={10} aria-hidden />
                  eco suprimido
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// --------------------------------------------------------------------------
// Thread / conversa
// --------------------------------------------------------------------------
function ThreadPane({
  threadId,
  emails,
  onClose,
  onReply,
}: {
  threadId: string | null;
  emails: Record<string, EmailRow>;
  onClose: () => void;
  onReply: () => void;
}) {
  if (!threadId) {
    return (
      <div className="hidden flex-1 items-center justify-center p-6 md:flex">
        <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Selecione um email para ler a conversa.
        </p>
      </div>
    );
  }
  const items = Object.entries(emails)
    .map(([id, e]) => ({ id, ...e }))
    .filter((e) => (e.threadId ?? e.id) === threadId)
    .sort((a, b) => (a.receivedAt ?? "").localeCompare(b.receivedAt ?? ""));

  const subject = items[items.length - 1]?.subject ?? "(sem assunto)";

  return (
    <section
      aria-label="Thread de email"
      className="flex min-h-0 flex-1 flex-col"
    >
      <header
        className="flex items-center justify-between gap-2 border-b px-5 py-3"
        style={{ borderColor: "var(--ds-theme-border-subtle)" }}
      >
        <div className="min-w-0">
          <h3
            className="truncate text-base font-semibold"
            style={{ color: "var(--ds-theme-content-strong)" }}
          >
            {subject}
          </h3>
          <p className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
            {items.length} mensagem{items.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onReply}
            aria-label="Responder"
            className="grid place-items-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
            }}
            title="Responder"
          >
            <Reply size={14} />
          </button>
          {items.map((e) => (
            <ArchiveButton key={e.id} emailId={e.id} folder={e.folder as Folder} />
          )).slice(0, 1)}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar thread"
            className="grid place-items-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
            }}
          >
            <X size={14} />
          </button>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <ul className="flex flex-col gap-3">
          {items.map((e, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li key={e.id}>
                <ThreadMessage email={e} defaultOpen={isLast} />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function ArchiveButton({ emailId, folder }: { emailId: string; folder: Folder }) {
  const target: Folder = folder === "archive" ? "inbox" : "archive";
  const Icon = folder === "archive" ? ArchiveRestore : Archive;
  return (
    <button
      type="button"
      onClick={() => store.setCell("emails", emailId, "folder", target)}
      aria-label={folder === "archive" ? "Restaurar da arquivo" : "Arquivar"}
      title={folder === "archive" ? "Restaurar" : "Arquivar"}
      className="grid place-items-center"
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "var(--ds-theme-surface-subdued)",
        color: "var(--ds-theme-content-default)",
      }}
    >
      <Icon size={14} />
    </button>
  );
}

function ThreadMessage({
  email,
  defaultOpen,
}: {
  email: { id: string } & EmailRow;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Marca como lido ao abrir
  useEffect(() => {
    if (open && email.read === false) {
      store.setCell("emails", email.id, "read", true);
    }
  }, [open, email.id, email.read]);

  return (
    <article
      style={{
        background: "var(--ds-theme-surface-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
        borderRadius: 16,
        boxShadow: "var(--ds-component-card-shadow)",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center text-[10px] font-semibold"
          style={{
            borderRadius: 9999,
            background: "var(--ds-component-avatar-fallback-bg)",
            color: "var(--ds-component-avatar-fallback-text)",
          }}
        >
          {(email.fromName ?? "?").slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="truncate text-sm font-semibold"
              style={{ color: "var(--ds-theme-content-strong)" }}
            >
              {email.fromName}
            </span>
            <span className="text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
              &lt;{email.fromAddress}&gt;
            </span>
          </div>
          {!open && (
            <p className="truncate text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
              {email.preview}
            </p>
          )}
        </div>
        <StatusChip status={email.sendStatus ?? null} />
        <span
          className="shrink-0 text-[11px]"
          style={{ color: "var(--ds-theme-content-subtle)" }}
        >
          {formatDate(email.receivedAt)}
        </span>
      </button>
      {open && (
        <div
          className="border-t px-4 py-3 text-sm"
          style={{
            borderColor: "var(--ds-theme-border-subtle)",
            color: "var(--ds-theme-content-default)",
            whiteSpace: "pre-wrap",
          }}
        >
          {email.body}
          {email.sendStatus === "eco-suprimido" && (
            <p
              className="mt-3 flex items-start gap-2 text-xs"
              style={{
                padding: 10,
                borderRadius: 10,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-muted)",
              }}
            >
              <Info size={12} className="mt-0.5 shrink-0" aria-hidden />
              Cópia local suprimida — você é o remetente e destinatário, o sistema
              evitou duplicar a mensagem. Reentregas do protocolo P2P são idempotentes
              (mesmo id = mesma mensagem, não duplicam).
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function StatusChip({ status }: { status: EmailRow["sendStatus"] }) {
  if (!status) return null;
  const map: Record<string, { label: string; bg: string; fg: string; hint: string }> = {
    enviado: {
      label: "enviado",
      bg: "var(--ds-theme-surface-subdued)",
      fg: "var(--ds-theme-content-muted)",
      hint: "Entregue. Reentregas do protocolo P2P são no-op idempotente.",
    },
    pendente: {
      label: "enviando…",
      bg: "var(--ds-theme-intent-accent-subtle)",
      fg: "var(--ds-theme-intent-accent-on-subtle)",
      hint: "Envio como saga — concluirá em instantes.",
    },
    "eco-suprimido": {
      label: "eco suprimido",
      bg: "var(--ds-theme-surface-subdued)",
      fg: "var(--ds-theme-content-muted)",
      hint: "Cópia local suprimida para não duplicar (auto-envio).",
    },
  };
  const s = map[status];
  if (!s) return null;
  return (
    <span
      className="shrink-0 text-[10px] font-semibold"
      style={{
        padding: "2px 8px",
        borderRadius: 9999,
        background: s.bg,
        color: s.fg,
      }}
      title={s.hint}
    >
      {s.label}
    </span>
  );
}

// --------------------------------------------------------------------------
// Compositor — overlay fixed inset-0 (exceção Studio)
// --------------------------------------------------------------------------
function ComposeOverlay({
  accounts,
  activeAccountId,
  onClose,
}: {
  accounts: Record<string, AccountRow>;
  activeAccountId: string;
  onClose: () => void;
}) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachOpen, setAttachOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const acc = accounts[activeAccountId];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const send = () => {
    if (!to.includes("@")) {
      setErr("Informe um destinatário válido.");
      return;
    }
    if (!subject.trim()) {
      setErr("Informe um assunto.");
      return;
    }
    const id = `em_${Date.now()}`;
    const nowIso = new Date().toISOString();
    store.setRow("emails", id, {
      accountId: activeAccountId,
      folder: "sent",
      fromName: acc?.displayName ?? "Eu",
      fromAddress: acc?.address ?? "",
      subject,
      preview: body.slice(0, 100),
      body,
      read: true,
      sendStatus: "pendente",
      threadId: `t_new_${id}`,
      receivedAt: nowIso,
    });
    // saga simulada
    setTimeout(() => {
      store.setCell("emails", id, "sendStatus", "enviado");
    }, 1200);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Escrever email"
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "var(--ds-theme-surface-canvas, var(--ds-theme-surface-default))" }}
    >
      <header
        className="flex items-center justify-between gap-3 border-b px-5 py-3"
        style={{ borderColor: "var(--ds-theme-border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Mail size={16} aria-hidden style={{ color: "var(--ds-theme-content-muted)" }} />
          <h2
            className="text-base font-semibold"
            style={{ color: "var(--ds-theme-content-strong)" }}
          >
            Escrever email
          </h2>
          {acc && (
            <span className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
              de {acc.displayName} &lt;{acc.address}&gt;
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold"
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={send}
            className="text-xs font-semibold"
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            Enviar
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-3 overflow-y-auto p-5">
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Para
          </span>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="destinatario@exemplo.com"
            autoFocus
            className="text-sm"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--ds-theme-surface-default)",
              border: "1px solid var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-default)",
            }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Assunto
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="text-sm"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--ds-theme-surface-default)",
              border: "1px solid var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-default)",
            }}
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Mensagem
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[240px] flex-1 text-sm"
            style={{
              padding: 12,
              borderRadius: 10,
              background: "var(--ds-theme-surface-default)",
              border: "1px solid var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-default)",
              resize: "vertical",
            }}
          />
        </label>

        {attachments.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="Anexos">
            {attachments.map((a, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-xs"
                style={{
                  padding: "6px 10px",
                  borderRadius: 9999,
                  background: "var(--ds-theme-surface-subdued)",
                  color: "var(--ds-theme-content-default)",
                }}
              >
                <Paperclip size={12} aria-hidden /> {a}
                <button
                  type="button"
                  aria-label={`Remover anexo ${a}`}
                  onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                  style={{ color: "var(--ds-theme-content-muted)" }}
                >
                  <X size={10} />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAttachOpen(true)}
            className="inline-flex items-center gap-2 text-xs font-semibold"
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
            }}
          >
            <Paperclip size={12} aria-hidden /> Anexar arquivo
          </button>
        </div>

        {err && (
          <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
            {err}
          </p>
        )}
      </div>

      {attachOpen && (
        <AttachModal
          onClose={() => setAttachOpen(false)}
          onAdd={(name) => setAttachments([...attachments, name])}
        />
      )}
    </div>
  );
}

// --------------------------------------------------------------------------
// Modal — anexos (mock, sem upload real)
// --------------------------------------------------------------------------
function AttachModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (name: string) => void;
}) {
  const mockFiles = ["Contrato-Q3.pdf", "Briefing-Aurora.docx", "Print-A3.jpg", "Orcamento.xlsx"];
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Anexar arquivo"
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
        style={{
          background: "var(--ds-theme-surface-default)",
          borderRadius: 20,
          border: "1px solid var(--ds-theme-border-subtle)",
          boxShadow: "var(--ds-component-card-shadow)",
          padding: 20,
        }}
      >
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--ds-theme-content-strong)" }}
        >
          Anexar arquivo
        </h3>
        <p className="mt-1 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Escolha um arquivo da lista (mockup — sem upload real).
        </p>
        <ul className="mt-3 flex flex-col gap-1">
          {mockFiles.map((f) => (
            <li key={f}>
              <button
                type="button"
                onClick={() => {
                  onAdd(f);
                  onClose();
                }}
                className="flex w-full items-center gap-2 text-left text-sm"
                style={{
                  padding: "8px 10px",
                  borderRadius: 10,
                  background: "var(--ds-theme-surface-subdued)",
                  color: "var(--ds-theme-content-default)",
                }}
              >
                <Paperclip size={12} aria-hidden /> {f}
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold"
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
            }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Modal — configurar conta (IMAP/SMTP)
// --------------------------------------------------------------------------
function AccountModal({ onClose }: { onClose: () => void }) {
  const [address, setAddress] = useState("");
  const [provider, setProvider] = useState("IMAP/SMTP");
  const [displayName, setDisplayName] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.includes("@")) {
      setErr("Informe um endereço válido.");
      return;
    }
    if (!displayName.trim()) {
      setErr("Informe um nome de exibição.");
      return;
    }
    const id = `ea_${Date.now()}`;
    store.setRow("emailAccounts", id, {
      address,
      provider,
      displayName,
      syncStatus: "sincronizando",
    });
    // simula conclusão da sincronização inicial
    setTimeout(() => {
      store.setCell("emailAccounts", id, "syncStatus", "sincronizado");
    }, 1500);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Configurar nova conta de email"
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="flex w-full max-w-md flex-col gap-3"
        style={{
          background: "var(--ds-theme-surface-default)",
          borderRadius: 20,
          border: "1px solid var(--ds-theme-border-subtle)",
          boxShadow: "var(--ds-component-card-shadow)",
          padding: 20,
        }}
      >
        <h3
          className="text-base font-semibold"
          style={{ color: "var(--ds-theme-content-strong)" }}
        >
          Nova conta (IMAP/SMTP)
        </h3>
        <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
          Mockup — a conexão real não é executada. A conta entra em "sincronizando"
          por alguns segundos e depois fica "sincronizado".
        </p>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Endereço
          </span>
          <input
            type="email"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoFocus
            className="text-sm"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-default)",
            }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Provedor
          </span>
          <input
            type="text"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="text-sm"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-default)",
            }}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Nome de exibição
          </span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="text-sm"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
              color: "var(--ds-theme-content-default)",
            }}
          />
        </label>
        {err && (
          <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
            {err}
          </p>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold"
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="text-xs font-semibold"
            style={{
              padding: "8px 14px",
              borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            Adicionar conta
          </button>
        </div>
      </form>
    </div>
  );
}

// Referências evitando warning de import não usado (SyncingState/useSortedRowIds/useCell/useRow-like
// ficam disponíveis para extensões futuras deste módulo).
void SyncingState;
void useSortedRowIds;
void useCell;