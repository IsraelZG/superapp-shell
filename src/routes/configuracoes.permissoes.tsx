import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldOff, User, AppWindow, Ban, Undo2 } from "lucide-react";
import {
  useSortedRowIds,
  useRow,
  useDelRowCallback,
  useSetRowCallback,
} from "@/store/hooks";
import { ThemeSync } from "@/components/shell/ThemeSync";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/configuracoes/permissoes")({
  component: PermissoesPage,
});

function PermissoesPage() {
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
        <div className="mx-auto max-w-4xl">
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
          <h1 className="text-2xl font-semibold">Permissões & segurança</h1>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--ds-theme-content-muted)" }}
          >
            Gerencie quem — pessoas ou apps — pode acessar o quê no seu SuperApp.
          </p>

          <Tabs defaultValue="roles" className="mt-6">
            <TabsList>
              <TabsTrigger value="roles">Quem pode o quê</TabsTrigger>
              <TabsTrigger value="blocks">Bloqueios</TabsTrigger>
            </TabsList>
            <TabsContent value="roles" className="mt-4">
              <RolesPanel />
            </TabsContent>
            <TabsContent value="blocks" className="mt-4">
              <BlocksPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function RolesPanel() {
  const ids = useSortedRowIds("roles", "subjectName");
  const [pending, setPending] = useState<string | null>(null);
  const revoke = useDelRowCallback("roles", () => pending ?? "", [pending]);

  return (
    <div
      className="overflow-hidden"
      style={{
        borderRadius: "var(--ds-component-card-radius, 24px)",
        background: "var(--ds-theme-surface-raised)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {ids.length === 0 ? (
        <div
          className="p-8 text-center text-sm"
          style={{ color: "var(--ds-theme-content-muted)" }}
        >
          Nenhuma permissão concedida ainda.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quem</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Escopo</TableHead>
              <TableHead>Validade</TableHead>
              <TableHead className="text-right">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ids.map((id) => (
              <RoleRow key={id} id={id} onRevoke={() => setPending(id)} />
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog
        open={pending !== null}
        onOpenChange={(v) => !v && setPending(null)}
      >
        <AlertDialogContent
          style={{
            background: "var(--ds-theme-surface-raised)",
            color: "var(--ds-theme-content-default)",
            borderRadius: "var(--ds-component-card-radius, 24px)",
            borderColor: "var(--ds-theme-border-subtle)",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Revogar esta permissão?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>A permissão será removida do seu dispositivo agora.</p>
                <p
                  role="note"
                  className="p-3 text-xs"
                  style={{
                    borderRadius: 12,
                    background: "var(--ds-theme-intent-warning-surface, var(--ds-theme-surface-subdued))",
                    color: "var(--ds-theme-content-default)",
                    border: "1px solid var(--ds-theme-border-subtle)",
                  }}
                >
                  <strong>Revogação por cortesia:</strong> peers que já
                  sincronizaram este acesso podem retê-lo até a próxima
                  sincronização — não há garantia de apagamento imediato em
                  toda a rede.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                revoke();
                setPending(null);
              }}
            >
              Revogar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RoleRow({ id, onRevoke }: { id: string; onRevoke: () => void }) {
  const row = useRow("roles", id) as {
    subjectName?: string;
    subjectType?: "person" | "app";
    capability?: string;
    scope?: string;
    expiresAt?: string;
  };
  const isApp = row.subjectType === "app";
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center"
            style={{
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
            }}
          >
            {isApp ? <AppWindow size={14} /> : <User size={14} />}
          </span>
          <div className="min-w-0">
            <div className="text-sm font-medium">{row.subjectName}</div>
            <div
              className="text-xs"
              style={{ color: "var(--ds-theme-content-muted)" }}
            >
              {isApp ? "Aplicativo" : "Pessoa"}
            </div>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-sm">{row.capability}</TableCell>
      <TableCell className="text-sm">{row.scope}</TableCell>
      <TableCell className="text-sm">
        <Badge
          variant="outline"
          style={{
            borderColor: "var(--ds-theme-border-subtle)",
            color: "var(--ds-theme-content-muted)",
          }}
        >
          {row.expiresAt}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          size="sm"
          variant="outline"
          onClick={onRevoke}
          aria-label={`Revogar acesso de ${row.subjectName}`}
          style={{
            borderRadius: "var(--ds-component-button-radius, 9999px)",
            borderColor: "var(--ds-theme-border-default)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          <ShieldOff size={14} aria-hidden="true" /> Revogar
        </Button>
      </TableCell>
    </TableRow>
  );
}

function BlocksPanel() {
  const ids = useSortedRowIds("blocks", "profileName");
  const [name, setName] = useState("");
  const addBlock = useSetRowCallback(
    "blocks",
    () => `b_${Date.now()}`,
    () => ({ profileName: name, blockedAt: new Date().toISOString().slice(0, 10) }),
    [name],
  );

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap items-center gap-2 p-4"
        style={{
          borderRadius: "var(--ds-component-card-radius, 24px)",
          background: "var(--ds-theme-surface-raised)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do perfil"
          aria-label="Nome do perfil a bloquear"
          className="flex-1 px-3 py-2 text-sm"
          style={{
            borderRadius: 16,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px solid var(--ds-theme-border-subtle)",
            color: "var(--ds-theme-content-default)",
            minWidth: 200,
          }}
        />
        <Button
          type="button"
          onClick={() => {
            if (!name.trim()) return;
            addBlock();
            setName("");
          }}
          style={{
            borderRadius: "var(--ds-component-button-radius, 9999px)",
          }}
        >
          <Ban size={14} aria-hidden="true" /> Bloquear
        </Button>
      </div>

      <div
        className="overflow-hidden"
        style={{
          borderRadius: "var(--ds-component-card-radius, 24px)",
          background: "var(--ds-theme-surface-raised)",
          border: "1px solid var(--ds-theme-border-subtle)",
        }}
      >
        {ids.length === 0 ? (
          <div
            className="p-8 text-center text-sm"
            style={{ color: "var(--ds-theme-content-muted)" }}
          >
            Nenhum perfil bloqueado.
          </div>
        ) : (
          <ul className="divide-y" style={{ borderColor: "var(--ds-theme-border-subtle)" }}>
            {ids.map((id) => (
              <BlockRow key={id} id={id} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function BlockRow({ id }: { id: string }) {
  const row = useRow("blocks", id) as { profileName?: string; blockedAt?: string };
  const unblock = useDelRowCallback("blocks", () => id, [id]);
  return (
    <li className="flex flex-wrap items-center gap-3 p-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{row.profileName}</div>
        <div
          className="text-xs"
          style={{ color: "var(--ds-theme-content-muted)" }}
        >
          Bloqueado em {row.blockedAt} · O conteúdo desta pessoa some do seu feed
          — não foi apagado, só filtrado para você.
        </div>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={unblock}
        aria-label={`Desbloquear ${row.profileName}`}
        style={{
          borderRadius: "var(--ds-component-button-radius, 9999px)",
          borderColor: "var(--ds-theme-border-default)",
          color: "var(--ds-theme-content-default)",
        }}
      >
        <Undo2 size={14} aria-hidden="true" /> Desbloquear
      </Button>
    </li>
  );
}