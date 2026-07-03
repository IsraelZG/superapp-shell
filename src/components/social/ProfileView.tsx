import { ArrowLeft, Image as ImageIcon, Globe, Lock } from "lucide-react";
import { useRow, useTable, store } from "@/store/hooks";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AccessDeniedState } from "@/components/catalog/States";
import { Avatar } from "./Avatar";
import { visibilityLabel } from "./utils";

export function ProfileView({ profileId, onBack }: { profileId: string; onBack?: () => void }) {
  const p = useRow("profiles", profileId) as {
    name?: string;
    bio?: string;
    followers?: number;
    following?: number;
    visibility?: string;
    isFollowing?: boolean;
  };
  const posts = useTable("posts") as Record<
    string,
    { authorId?: string; text?: string; visibility?: string }
  >;

  if (!p.name) {
    return (
      <div className="p-6 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>
        Perfil não encontrado.
      </div>
    );
  }

  const isMe = profileId === "u_me";
  const isPrivateBlocked = !isMe && p.visibility === "private" && !p.isFollowing;

  const myPosts = Object.entries(posts).filter(([, r]) => r.authorId === profileId);

  const toggleVisibility = () => {
    store.setCell("profiles", profileId, "visibility", p.visibility === "public" ? "private" : "public");
  };
  const toggleFollow = () => {
    store.setCell("profiles", profileId, "isFollowing", !p.isFollowing);
  };

  return (
    <div className="flex flex-col gap-4">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex w-fit items-center gap-1 text-xs font-semibold"
          style={{
            padding: "6px 12px",
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          <ArrowLeft size={14} aria-hidden /> Voltar ao feed
        </button>
      )}

      <header
        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
        style={{
          background: "var(--ds-theme-surface-default)",
          border: "1px solid var(--ds-theme-border-subtle)",
          borderRadius: "var(--ds-component-card-radius, 20px)",
        }}
      >
        <Avatar name={p.name} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>{p.name}</h2>
            <span
              className="inline-flex items-center gap-1 text-[11px]"
              style={{
                padding: "2px 8px",
                borderRadius: 9999,
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-muted)",
              }}
            >
              {p.visibility === "private" ? <Lock size={11} aria-hidden /> : <Globe size={11} aria-hidden />}
              {visibilityLabel[p.visibility ?? "public"]}
            </span>
          </div>
          {p.bio && <p className="mt-1 text-sm" style={{ color: "var(--ds-theme-content-muted)" }}>{p.bio}</p>}
          <div className="mt-2 flex gap-4 text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            <span><strong style={{ color: "var(--ds-theme-content-strong)" }}>{p.followers}</strong> seguidores</span>
            <span><strong style={{ color: "var(--ds-theme-content-strong)" }}>{p.following}</strong> seguindo</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          {isMe ? (
            <div className="flex items-center gap-2">
              <Switch id="vis-toggle" checked={p.visibility === "public"} onCheckedChange={toggleVisibility} />
              <Label htmlFor="vis-toggle" className="text-xs">Perfil público</Label>
            </div>
          ) : (
            <Button size="sm" variant={p.isFollowing ? "outline" : "default"} onClick={toggleFollow}>
              {p.isFollowing ? "Deixar de seguir" : "Seguir"}
            </Button>
          )}
        </div>
      </header>

      {isPrivateBlocked ? (
        <AccessDeniedState />
      ) : (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Publicações
          </h3>
          {myPosts.length === 0 ? (
            <div
              className="p-6 text-center text-sm"
              style={{
                borderRadius: "var(--ds-component-card-radius, 20px)",
                background: "var(--ds-theme-surface-subdued)",
                color: "var(--ds-theme-content-muted)",
              }}
            >
              Nenhuma publicação ainda.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {myPosts.map(([id, post]) => (
                <div
                  key={id}
                  className="aspect-square overflow-hidden p-3"
                  style={{
                    borderRadius: 16,
                    background: "var(--ds-theme-surface-default)",
                    border: "1px solid var(--ds-theme-border-subtle)",
                  }}
                >
                  <div
                    className="grid h-full w-full place-items-center"
                    style={{ borderRadius: 12, background: "var(--ds-theme-surface-subdued)", color: "var(--ds-theme-content-subtle)" }}
                  >
                    <ImageIcon size={22} aria-hidden />
                  </div>
                  <p className="mt-2 line-clamp-2 text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {post.text}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}