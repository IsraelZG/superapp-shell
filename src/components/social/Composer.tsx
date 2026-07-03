import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxSelect } from "@/components/catalog/Menus";
import { Image as ImageIcon } from "lucide-react";
import { store } from "@/store/hooks";
import { toast } from "sonner";

type Mode = "post" | "story";

export function Composer({
  open,
  onOpenChange,
  mode = "post",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode?: Mode;
}) {
  const [text, setText] = useState("");
  const [visibility, setVisibility] = useState<string>("public");
  const [err, setErr] = useState<string | null>(null);

  const reset = () => {
    setText("");
    setVisibility("public");
    setErr(null);
  };

  const submit = () => {
    if (mode === "post" && !text.trim()) {
      setErr("Escreva algo para publicar.");
      return;
    }
    const id = `p_${Date.now()}`;
    if (mode === "post") {
      // Novo post entra no topo: rank menor. Usamos negativo para ficar sempre acima.
      const nowIso = new Date().toISOString();
      store.setRow("posts", id, {
        authorId: "u_me",
        authorName: "Israel",
        authorAvatar: "",
        text: text.trim(),
        imageUrl: "",
        createdAt: nowIso,
        likes: 0,
        comments: 0,
        visibility,
        isAd: false,
        rank: -Date.now(),
      });
      toast.success("Post publicado");
    } else {
      const now = Date.now();
      const stId = `st_${now}`;
      store.setRow("stories", stId, {
        authorId: "u_me",
        authorName: "Israel",
        authorAvatar: "",
        createdAt: new Date(now).toISOString(),
        // 24h fixo
        expiresAt: new Date(now + 24 * 3600 * 1000).toISOString(),
        viewed: false,
        mediaUrl: "",
      });
      toast.success("Story publicado (24h)");
    }
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset();
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "post" ? "Novo post" : "Novo story"}</DialogTitle>
          <DialogDescription>
            {mode === "post"
              ? "Compartilhe algo com sua rede. Você escolhe quem pode ver."
              : "Stories ficam disponíveis por 24h e somem depois."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {mode === "post" && (
            <div className="flex flex-col gap-1">
              <Label htmlFor="composer-text">Texto</Label>
              <Textarea
                id="composer-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="No que você está pensando?"
                rows={4}
                autoFocus
              />
            </div>
          )}

          <button
            type="button"
            className="flex items-center gap-2 self-start px-3 py-2 text-xs"
            style={{
              borderRadius: 12,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-muted)",
              border: "1px dashed var(--ds-theme-border-subtle)",
            }}
            onClick={() => toast("Upload de mídia (placeholder)")}
          >
            <ImageIcon size={14} aria-hidden />
            Adicionar mídia (placeholder)
          </button>

          {mode === "post" && (
            <div className="flex flex-col gap-1">
              <Label>Visibilidade</Label>
              <ComboboxSelect
                value={visibility}
                onChange={setVisibility}
                options={[
                  { value: "public", label: "Público" },
                  { value: "connections", label: "Conexões" },
                  { value: "private", label: "Somente eu" },
                ]}
              />
            </div>
          )}

          {err && (
            <p role="alert" className="text-xs" style={{ color: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))" }}>
              {err}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancelar</Button>
          <Button onClick={submit}>Publicar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}