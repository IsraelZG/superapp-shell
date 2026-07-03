import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { ThemeSync } from "@/components/shell/ThemeSync";
import { ProfileView } from "@/components/social/ProfileView";

export const Route = createFileRoute("/social/perfil/$id")({
  head: () => ({
    meta: [
      { title: "Perfil — SuperApp Social" },
      { name: "description", content: "Perfil público do SuperApp Social (mockup)." },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { id } = Route.useParams();
  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "var(--ds-theme-surface-canvas)", color: "var(--ds-theme-content-default)" }}
    >
      <ThemeSync />
      <header
        className="flex items-center justify-between border-b px-6 py-4"
        style={{ borderColor: "var(--ds-theme-border-subtle)", background: "var(--ds-theme-surface-default)" }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            SuperApp
          </p>
          <h1 className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Perfil social
          </h1>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-semibold"
          style={{
            padding: "8px 14px",
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          <ArrowLeft size={14} aria-hidden /> Voltar ao app
        </Link>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <ProfileView profileId={id} />
      </div>
    </div>
  );
}