import { ThemeSync } from "./ThemeSync";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MainContent } from "./MainContent";

export function AppShell() {
  return (
    <>
      <ThemeSync />
      <div
        className="flex h-screen w-full overflow-hidden"
        style={{ background: "var(--ds-theme-surface-canvas)" }}
      >
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <MainContent />
        </div>
      </div>
    </>
  );
}