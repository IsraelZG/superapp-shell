import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{cancelLabel}</Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DestructiveModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Excluir definitivamente",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const [ack, setAck] = useState(false);
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setAck(false);
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}
              aria-hidden
            />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div
          role="alert"
          className="flex items-start gap-2 rounded-2xl p-3 text-xs"
          style={{
            background: "var(--ds-theme-intent-danger-subtle, var(--ds-theme-surface-subdued))",
            color: "var(--ds-theme-content-strong)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <Checkbox id="ack-destructive" checked={ack} onCheckedChange={(v) => setAck(v === true)} />
          <Label htmlFor="ack-destructive" className="cursor-pointer text-xs leading-snug">
            Entendo que esta ação não pode ser desfeita.
          </Label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button
            variant="destructive"
            disabled={!ack}
            onClick={() => {
              onConfirm();
              setAck(false);
              onOpenChange(false);
            }}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FormModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: { name: string; email: string }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo contato</DialogTitle>
          <DialogDescription>Preencha os dados abaixo.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) return setErr("Informe um nome.");
            if (!email.includes("@")) return setErr("Email inválido.");
            setErr(null);
            onSubmit({ name, email });
            setName("");
            setEmail("");
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="fm-name">Nome</Label>
            <Input id="fm-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="fm-email">Email</Label>
            <Input id="fm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {err && (
            <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
              {err}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>Ações rápidas para esta tela.</SheetDescription>
        </SheetHeader>
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}

export function WizardModal({
  open,
  onOpenChange,
  onFinish,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onFinish: () => void;
}) {
  const steps = ["Perfil", "Preferências", "Revisão"];
  const [step, setStep] = useState(0);
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) setStep(0);
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configurar conta ({step + 1}/{steps.length})</DialogTitle>
          <DialogDescription>{steps[step]}</DialogDescription>
        </DialogHeader>
        <ol className="flex items-center gap-2" aria-label="Progresso">
          {steps.map((s, i) => (
            <li key={s} className="flex flex-1 items-center gap-2">
              <div
                aria-current={i === step ? "step" : undefined}
                className="grid h-6 w-6 place-items-center text-[11px] font-bold"
                style={{
                  borderRadius: 9999,
                  background: i <= step ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-surface-subdued)",
                  color: i <= step ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-muted)",
                }}
              >
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className="h-[2px] flex-1"
                  style={{ background: i < step ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-surface-subdued)" }}
                />
              )}
            </li>
          ))}
        </ol>
        <div
          className="rounded-2xl p-4 text-sm"
          style={{ background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-default)" }}
        >
          Conteúdo do passo <strong>{steps[step]}</strong> (mockup).
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Voltar
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Próximo</Button>
          ) : (
            <Button
              onClick={() => {
                onFinish();
                setStep(0);
                onOpenChange(false);
              }}
            >
              Concluir
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}