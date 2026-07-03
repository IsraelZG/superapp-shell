import { useState } from "react";
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
import { FileText, Table2, Presentation, Image as ImageIcon } from "lucide-react";

export type DocKind = "doc" | "sheet" | "slide" | "media";

const kindOptions: {
  key: DocKind;
  label: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  { key: "doc", label: "Documento", hint: "Texto rico com blocos", icon: <FileText size={16} aria-hidden /> },
  { key: "sheet", label: "Planilha", hint: "Grade editável", icon: <Table2 size={16} aria-hidden /> },
  { key: "slide", label: "Apresentação", hint: "Slides com miniaturas", icon: <Presentation size={16} aria-hidden /> },
  { key: "media", label: "Mídia", hint: "Imagem, vídeo ou áudio", icon: <ImageIcon size={16} aria-hidden /> },
];

export function NewFileModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (name: string, kind: DocKind) => void;
}) {
  const [name, setName] = useState("");
  const [kind, setKind] = useState<DocKind>("doc");
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErr("Informe um nome.");
      return;
    }
    setErr(null);
    onCreate(name.trim(), kind);
    setName("");
    setKind("doc");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo arquivo</DialogTitle>
          <DialogDescription>Escolha o tipo e dê um nome — abrimos o editor em seguida.</DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="nf-name">Nome</Label>
            <Input
              id="nf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Ata da reunião"
              autoFocus
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-xs font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              Tipo
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {kindOptions.map((k) => {
                const active = kind === k.key;
                return (
                  <label
                    key={k.key}
                    className="flex cursor-pointer items-center gap-3 p-3"
                    style={{
                      borderRadius: 12,
                      border: `1px solid ${active ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-border-subtle)"}`,
                      background: active ? "var(--ds-theme-intent-accent-subtle)" : "var(--ds-theme-surface-default)",
                    }}
                  >
                    <input
                      type="radio"
                      name="nf-kind"
                      value={k.key}
                      checked={active}
                      onChange={() => setKind(k.key)}
                      className="sr-only"
                    />
                    <span
                      className="grid h-8 w-8 place-items-center"
                      style={{
                        borderRadius: 8,
                        background: active
                          ? "var(--ds-theme-intent-accent-fill)"
                          : "var(--ds-theme-surface-subdued)",
                        color: active
                          ? "var(--ds-theme-intent-accent-on-fill)"
                          : "var(--ds-theme-content-default)",
                      }}
                    >
                      {k.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block text-sm font-semibold"
                        style={{ color: "var(--ds-theme-content-strong)" }}
                      >
                        {k.label}
                      </span>
                      <span
                        className="block text-[11px]"
                        style={{ color: "var(--ds-theme-content-muted)" }}
                      >
                        {k.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {err && (
            <p
              role="alert"
              className="text-xs"
              style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}
            >
              {err}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Criar e abrir</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}