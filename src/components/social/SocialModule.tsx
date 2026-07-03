import { useState } from "react";
import { Pencil, Users } from "lucide-react";
import { useSortedRowIds, useTable } from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import { PostCard } from "./PostCard";
import { StoryRail } from "./StoryRail";
import { StoryViewer } from "./StoryViewer";
import { Composer } from "./Composer";
import { ProfileView } from "./ProfileView";

type View = { kind: "feed" } | { kind: "profile"; id: string };

export function SocialModule() {
  const postIds = useSortedRowIds("posts", "rank");
  const storyRows = useTable("stories") as Record<string, unknown>;
  const storyIds = Object.keys(storyRows);

  const [view, setView] = useState<View>({ kind: "feed" });
  const [composerOpen, setComposerOpen] = useState(false);
  const [storyComposerOpen, setStoryComposerOpen] = useState(false);
  const [openStoryId, setOpenStoryId] = useState<string | null>(null);

  const openProfile = (id: string) => setView({ kind: "profile", id });

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 sm:p-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
              Módulo
            </p>
            <h2 className="text-2xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
              Social
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openProfile("u_me")}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
              style={{
                borderRadius: 9999,
                background: "var(--ds-theme-surface-default)",
                border: "1px solid var(--ds-theme-border-subtle)",
                color: "var(--ds-theme-content-default)",
              }}
              aria-label="Abrir meu perfil"
            >
              <Users size={14} aria-hidden /> Meu perfil
            </button>
            <button
              type="button"
              onClick={() => setComposerOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold"
              style={{
                borderRadius: 9999,
                background: "var(--ds-theme-intent-accent-fill)",
                color: "var(--ds-theme-intent-accent-on-fill)",
              }}
            >
              <Pencil size={14} aria-hidden /> Publicar
            </button>
          </div>
        </header>

        {view.kind === "profile" ? (
          <ProfileView profileId={view.id} onBack={() => setView({ kind: "feed" })} />
        ) : (
          <>
            <StoryRail
              onOpen={(id) => setOpenStoryId(id)}
              onCompose={() => setStoryComposerOpen(true)}
            />

            {postIds.length === 0 ? (
              <EmptyState
                title="Seu feed está vazio"
                description="Siga pessoas ou publique algo para começar."
                actionLabel="Publicar"
                onAction={() => setComposerOpen(true)}
              />
            ) : (
              <div className="flex flex-col gap-4">
                {postIds.map((id) => (
                  <PostCard key={id} id={id} onOpenProfile={openProfile} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Composer open={composerOpen} onOpenChange={setComposerOpen} mode="post" />
      <Composer open={storyComposerOpen} onOpenChange={setStoryComposerOpen} mode="story" />
      {openStoryId && (
        <StoryViewer
          storyId={openStoryId}
          allIds={storyIds}
          onClose={() => setOpenStoryId(null)}
          onChange={(id) => setOpenStoryId(id)}
        />
      )}
    </div>
  );
}