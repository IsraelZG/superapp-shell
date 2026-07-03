import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTable } from "@/store/hooks";
import { Image as ImageIcon, Music, Video } from "lucide-react";

type MediaRow = { name?: string; kind?: string; size?: string };

const iconFor = (kind?: string) => {
  if (kind === "video") return <Video size={16} aria-hidden />;
  if (kind === "audio") return <Music size={16} aria-hidden />;
  return <ImageIcon size={16} aria-hidden />;
};

export function InsertMediaModal({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onPick: (name: string) => void;
}) {
  const lib = useTable("mediaLibrary") as Record<string, MediaRow>;
  const items = Object.entries(lib);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inserir mídia</DialogTitle>
          <DialogDescription>
            Selecione um arquivo da biblioteca local (mock).
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2">
          {items.map(([id, m]) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  onPick(m.name ?? "arquivo");
                  onOpenChange(false);
                }}
                className="flex w-full items-center gap-3 text-left"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <span
                  className="grid h-9 w-9 place-items-center"
                  style={{
                    borderRadius: 10,
                    background: "var(--ds-theme-intent-accent-subtle)",
                    color: "var(--ds-theme-intent-accent-on-subtle)",
                  }}
                >
                  {iconFor(m.kind)}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className="block truncate text-sm font-semibold"
                    style={{ color: "var(--ds-theme-content-strong)" }}
                  >
                    {m.name}
                  </span>
                  <span
                    className="block text-[11px]"
                    style={{ color: "var(--ds-theme-content-muted)" }}
                  >
                    {m.kind} · {m.size}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}