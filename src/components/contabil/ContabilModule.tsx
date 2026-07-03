/**
 * B4 — Contábil / Fiscal / RH
 *
 * Módulo renderizado na coluna central do shell FlexLayout (A1) quando
 * `activeNav === "contabil"`. Estruturado como abas internas seguindo o
 * padrão dos módulos anteriores (ERP, Studio, Marketplace, Social).
 *
 * Abas ⭐: Plano de contas · Lançamentos · Apuração fiscal · Visão do contador.
 * Abas ◻: Folha de pagamento.
 */
import { useState } from "react";
import {
  Calculator,
  ListTree,
  BookOpen,
  FileBarChart,
  UserCheck,
  Users,
} from "lucide-react";
import { AccountsTree } from "./AccountsTree";
import { EntriesView } from "./EntriesView";
import { TaxPeriodsView } from "./TaxPeriodsView";
import { AccountantView } from "./AccountantView";
import { EmployeesView } from "./EmployeesView";

type Tab = "accounts" | "entries" | "periods" | "accountant" | "employees";

const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "accounts", label: "Plano de contas", icon: <ListTree size={14} aria-hidden /> },
  { key: "entries", label: "Lançamentos", icon: <BookOpen size={14} aria-hidden /> },
  { key: "periods", label: "Apuração fiscal", icon: <FileBarChart size={14} aria-hidden /> },
  { key: "accountant", label: "Visão do contador", icon: <UserCheck size={14} aria-hidden /> },
  { key: "employees", label: "Folha", icon: <Users size={14} aria-hidden /> },
];

export function ContabilModule() {
  const [tab, setTab] = useState<Tab>("accounts");

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 p-4 sm:p-6">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
              Módulo
            </p>
            <h2
              className="flex items-center gap-2 text-2xl font-semibold"
              style={{ color: "var(--ds-theme-content-strong)" }}
            >
              <Calculator size={22} aria-hidden />
              Contábil · Fiscal · RH
            </h2>
          </div>
        </header>

        <nav
          aria-label="Áreas do módulo Contábil"
          className="flex flex-wrap items-center gap-1 p-1"
          style={{
            borderRadius: 9999,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px solid var(--ds-theme-border-subtle)",
            width: "fit-content",
          }}
        >
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={active ? "page" : undefined}
                className="inline-flex items-center gap-1.5 text-xs font-semibold"
                style={{
                  padding: "6px 12px",
                  borderRadius: 9999,
                  background: active ? "var(--ds-theme-intent-accent-fill)" : "transparent",
                  color: active
                    ? "var(--ds-theme-intent-accent-on-fill)"
                    : "var(--ds-theme-content-default)",
                }}
              >
                {t.icon}
                {t.label}
              </button>
            );
          })}
        </nav>

        {tab === "accounts" && <AccountsTree />}
        {tab === "entries" && <EntriesView />}
        {tab === "periods" && <TaxPeriodsView />}
        {tab === "accountant" && <AccountantView />}
        {tab === "employees" && <EmployeesView />}
      </div>
    </div>
  );
}