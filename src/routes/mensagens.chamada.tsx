import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Phone,
  X,
  User,
} from "lucide-react";

export const Route = createFileRoute("/mensagens/chamada")({
  head: () => ({
    meta: [
      { title: "Chamada — SuperApp" },
      { name: "description", content: "Tela de chamada e videoconferência do SuperApp." },
    ],
  }),
  component: CallScreen,
});

type Mode = "incoming" | "one-on-one" | "grid";

function VideoPlaceholder({
  name,
  size = "large",
}: {
  name: string;
  size?: "large" | "small" | "tile";
}) {
  const dims =
    size === "large"
      ? { minHeight: 420 }
      : size === "small"
        ? { width: 160, height: 110 }
        : { minHeight: 140 };
  return (
    <div
      className="relative grid place-items-center overflow-hidden"
      style={{
        ...dims,
        borderRadius: 20,
        background: "var(--ds-theme-surface-subdued)",
        border: "1px solid var(--ds-theme-border-subtle)",
        color: "var(--ds-theme-content-muted)",
      }}
    >
      <User size={size === "small" ? 24 : 40} aria-hidden />
      <span
        className="absolute bottom-2 left-2 text-[11px] font-semibold"
        style={{
          padding: "2px 8px",
          borderRadius: 9999,
          background: "var(--ds-theme-surface-default)",
          color: "var(--ds-theme-content-strong)",
        }}
      >
        {name}
      </span>
    </div>
  );
}

function ControlBar({
  mic,
  cam,
  onToggleMic,
  onToggleCam,
}: {
  mic: boolean;
  cam: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
}) {
  const btn = (
    label: string,
    onClick: (() => void) | undefined,
    children: React.ReactNode,
    intent: "neutral" | "danger" = "neutral",
  ) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid place-items-center"
      style={{
        width: 48,
        height: 48,
        borderRadius: 9999,
        background:
          intent === "danger"
            ? "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))"
            : "var(--ds-theme-surface-default)",
        color:
          intent === "danger"
            ? "var(--ds-theme-intent-danger-on-fill, var(--ds-theme-intent-accent-on-fill))"
            : "var(--ds-theme-content-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {children}
    </button>
  );
  return (
    <div className="flex items-center justify-center gap-3">
      {btn(mic ? "Silenciar microfone" : "Ativar microfone", onToggleMic, mic ? <Mic size={18} /> : <MicOff size={18} />)}
      {btn(cam ? "Desligar câmera" : "Ligar câmera", onToggleCam, cam ? <Video size={18} /> : <VideoOff size={18} />)}
      {btn("Encerrar chamada", undefined, <PhoneOff size={18} />, "danger")}
    </div>
  );
}

function CallScreen() {
  const [mode, setMode] = useState<Mode>("incoming");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);

  const modes: { id: Mode; label: string }[] = [
    { id: "incoming", label: "Entrada" },
    { id: "one-on-one", label: "Em chamada" },
    { id: "grid", label: "Grade" },
  ];

  return (
    <div
      className="flex min-h-screen w-full flex-col"
      style={{ background: "var(--ds-theme-surface-canvas)", color: "var(--ds-theme-content-default)" }}
    >
      <header
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: "var(--ds-theme-border-subtle)", background: "var(--ds-theme-surface-default)" }}
      >
        <div>
          <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
            Chamada — layout demo
          </p>
          <h1 className="text-base font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            LiveKit (mockup)
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Estados da chamada"
            className="flex gap-1 rounded-full p-1"
            style={{ background: "var(--ds-theme-surface-subdued)" }}
          >
            {modes.map((m) => {
              const active = mode === m.id;
              return (
                <button
                  key={m.id}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(m.id)}
                  className="text-xs font-semibold"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 9999,
                    background: active ? "var(--ds-theme-surface-default)" : "transparent",
                    color: active
                      ? "var(--ds-theme-content-strong)"
                      : "var(--ds-theme-content-muted)",
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <Link
            to="/"
            aria-label="Fechar chamada"
            className="grid place-items-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
            }}
          >
            <X size={16} />
          </Link>
        </div>
      </header>

      <main className="flex-1 p-6">
        {mode === "incoming" && (
          <div className="mx-auto flex max-w-md flex-col items-center gap-4">
            <VideoPlaceholder name="Sua câmera" />
            <div className="text-center">
              <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
                Chamada recebida
              </p>
              <h2 className="text-xl font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                Ana Ribeiro
              </h2>
            </div>
            <div className="flex gap-6">
              <button
                type="button"
                aria-label="Recusar chamada"
                className="grid place-items-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 9999,
                  background: "var(--ds-theme-intent-danger-fill, var(--ds-theme-intent-accent-fill))",
                  color: "var(--ds-theme-intent-danger-on-fill, var(--ds-theme-intent-accent-on-fill))",
                }}
              >
                <PhoneOff size={20} />
              </button>
              <button
                type="button"
                aria-label="Aceitar chamada"
                onClick={() => setMode("one-on-one")}
                className="grid place-items-center"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 9999,
                  background: "var(--ds-theme-intent-accent-fill)",
                  color: "var(--ds-theme-intent-accent-on-fill)",
                }}
              >
                <Phone size={20} />
              </button>
            </div>
          </div>
        )}

        {mode === "one-on-one" && (
          <div className="relative mx-auto max-w-4xl">
            <VideoPlaceholder name="Ana Ribeiro" />
            <div className="absolute right-4 top-4">
              <VideoPlaceholder name="Você" size="small" />
            </div>
            <div className="mt-6">
              <ControlBar
                mic={mic}
                cam={cam}
                onToggleMic={() => setMic((v) => !v)}
                onToggleCam={() => setCam((v) => !v)}
              />
            </div>
          </div>
        )}

        {mode === "grid" && (
          <div className="mx-auto max-w-5xl">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {["Ana", "Marina", "Rafael", "Julia", "Pedro", "Você"].map((n) => (
                <VideoPlaceholder key={n} name={n} size="tile" />
              ))}
            </div>
            <div className="mt-6">
              <ControlBar
                mic={mic}
                cam={cam}
                onToggleMic={() => setMic((v) => !v)}
                onToggleCam={() => setCam((v) => !v)}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}