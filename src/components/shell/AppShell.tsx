import { useCallback } from "react";
import { ThemeSync } from "./ThemeSync";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Workspace, MobileWorkspace } from "./Workspace";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSetValueCallback } from "@/store/hooks";

export function AppShell() {
  const isMobile = useIsMobile();
  const openComms = useSetValueCallback("mobileOverlay", () => "", []);
  const openModules = useSetValueCallback("mobileOverlay", () => "", []);
  const noop = useCallback(() => {}, []);
  void noop;

  return (
    <>
      <ThemeSync />
      <div
        className="flex h-screen w-full flex-col overflow-hidden"
        style={{ background: "var(--ds-theme-surface-canvas)" }}
      >
        <Header />
        <div className="flex min-h-0 flex-1 flex-col">
          {isMobile ? (
            <MobileWorkspace onOpenComms={openComms} onOpenModules={openModules} />
          ) : (
            <Workspace />
          )}
        </div>
        <Footer />
      </div>
    </>
  );
}