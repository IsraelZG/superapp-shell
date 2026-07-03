import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Download, FileDown } from "lucide-react";

type Fmt = "pdf" | "pptx" | "docx";
type Phase = "idle" | "running" | "done";

export function ExportModal({
  open,
  onOpenChange,
  docTitle,
  allowedFormats = ["pdf", "pptx", "docx"],
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  docTitle: string;
  allowedFormats?: Fmt[];
}) {
  const [fmt, setFmt] = useState<Fmt>(allowedFormats[0]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [pct, setPct] = useState(0);

  useEffect(() => {
    if (!open) {
      // reseta ao fechar
      setPhase("idle");
      setPct(0);
      setFmt(allowedFormats[0]);
    }
  }, [open, allowedFormats]);

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => {
      setPct((p) => {
        const next = p + 8 + Math.random() * 12;
        if (next >= 100) {
          clearInterval(t);
          setPhase("done");
          return 100;
        }
        return next;
      });
    }, 180);
    return () => clearInterval(t);
  }, [phase]);

  const start = () => {
    setPct(0);
    setPhase("running");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileDown size={18} aria-hidden style={{ color: "var(--ds-theme-content-strong)" }} />
            <DialogTitle>Exportar</DialogTitle>
          </div>
          <DialogDescription>
            Gerar uma cópia de <strong>{docTitle}</strong> localmente.
          </DialogDescription>
        </DialogHeader>

        {phase === "idle" && (
          <fieldset className="flex flex-col gap-2">
            <Label>Formato</Label>
            <div className="flex flex-wrap gap-2">
              {allowedFormats.map((f) => {
                const active = fmt === f;
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFmt(f)}
                    aria-pressed={active}
                    className="text-xs font-semibold uppercase"
                    style={{
                      padding: "8px 16px",
                      borderRadius: 9999,
                      background: active
                        ? "var(--ds-theme-intent-accent-fill)"
                        : "var(--ds-theme-surface-subdued)",
                      color: active
                        ? "var(--ds-theme-intent-accent-on-fill)"
                        : "var(--ds-theme-content-default)",
                      border: "1px solid var(--ds-theme-border-subtle)",
                    }}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {phase === "running" && (
          <div
            role="status"
            aria-live="polite"
            className="flex flex-col gap-2 p-4"
            style={{
              borderRadius: 16,
              background: "var(--ds-theme-surface-subdued)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <div className="flex items-center justify-between text-xs">
              <span style={{ color: "var(--ds-theme-content-strong)" }}>
                Gerando arquivo {fmt.toUpperCase()}…
              </span>
              <span className="tabular-nums" style={{ color: "var(--ds-theme-content-muted)" }}>
                {Math.round(pct)}%
              </span>
            </div>
            <Progress value={pct} />
          </div>
        )}

        {phase === "done" && (
          <div
            role="status"
            className="flex items-start gap-3 p-4"
            style={{
              borderRadius: 16,
              background: "var(--ds-theme-intent-accent-subtle)",
              color: "var(--ds-theme-content-strong)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <CheckCircle2 size={18} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Exportado (mock) — 2.4 MB</p>
              <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
                Este é um mockup — o download real será conectado depois.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {phase === "idle" && (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="button" onClick={start}>
                Exportar
              </Button>
            </>
          )}
          {phase === "running" && (
            <Button type="button" variant="outline" disabled>
              Cancelar
            </Button>
          )}
          {phase === "done" && (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
              <Button
                type="button"
                disabled
                title="Download mock — desabilitado neste protótipo"
              >
                <Download size={14} className="mr-1" aria-hidden />
                Baixar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}