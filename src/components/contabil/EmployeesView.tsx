/**
 * Item ◻5 — Folha de pagamento (leve).
 *
 * Lista `employees` (ativos) e permite "Gerar folha do mês" — cálculo mock
 * ingênuo (bruto fixo por cargo, líquido = bruto * 0.72). Modal simples
 * "Novo colaborador" grava em `employees`.
 */
import { useMemo, useState } from "react";
import { UserPlus, Play } from "lucide-react";
import {
  useTable,
  useSetRowCallback,
} from "@/store/hooks";
import { EmptyState } from "@/components/catalog/States";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBRL } from "./utils";

type Employee = {
  name: string;
  role: string;
  department: string;
  hiredAt: string;
  status: "ativo" | "desligado";
};

// Salários mock por cargo — usado só para o cálculo ingênuo da folha.
const roleSalary: Record<string, number> = {
  "Designer sênior": 12000,
  "Advogado": 15000,
  "Engenheiro": 14000,
  "Product manager": 16000,
};
function baseSalary(role: string): number {
  return roleSalary[role] ?? 8000;
}

export function EmployeesView() {
  const table = useTable("employees") as Record<string, Employee>;
  const rows = useMemo(() => Object.entries(table), [table]);

  const [payroll, setPayroll] = useState<{ bruto: number; liquido: number; count: number } | null>(
    null,
  );
  const [newOpen, setNewOpen] = useState(false);

  const runPayroll = () => {
    const actives = rows.filter(([, e]) => e.status === "ativo");
    const bruto = actives.reduce((s, [, e]) => s + baseSalary(e.role), 0);
    setPayroll({ bruto, liquido: bruto * 0.72, count: actives.length });
  };

  const addEmployee = useSetRowCallback(
    "employees",
    (data: Employee) => `emp_${Math.random().toString(36).slice(2, 8)}`,
    (data: Employee) => data,
  );

  return (
    <section aria-labelledby="emp-h" className="flex flex-col gap-3">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="emp-h" className="text-lg font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
            Folha de pagamento
          </h3>
          <p className="text-xs" style={{ color: "var(--ds-theme-content-muted)" }}>
            Cálculo ingênuo a partir dos vínculos ativos. Alíquotas reais não aplicadas neste mockup.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{
              padding: "8px 12px",
              borderRadius: 9999,
              background: "var(--ds-theme-surface-subdued)",
              color: "var(--ds-theme-content-default)",
              border: "1px solid var(--ds-theme-border-subtle)",
            }}
          >
            <UserPlus size={14} aria-hidden />
            Novo colaborador
          </button>
          <button
            type="button"
            onClick={runPayroll}
            className="inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{
              padding: "8px 12px",
              borderRadius: 9999,
              background: "var(--ds-theme-intent-accent-fill)",
              color: "var(--ds-theme-intent-accent-on-fill)",
            }}
          >
            <Play size={14} aria-hidden />
            Gerar folha do mês
          </button>
        </div>
      </header>

      {payroll && (
        <div
          className="grid gap-3 sm:grid-cols-3 p-4"
          style={{
            borderRadius: "var(--ds-component-card-radius, 16px)",
            background: "var(--ds-theme-surface-default)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <Metric label="Colaboradores" value={String(payroll.count)} />
          <Metric label="Bruto do mês" value={formatBRL(payroll.bruto)} />
          <Metric label="Líquido (aprox.)" value={formatBRL(payroll.liquido)} />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState
          title="Nenhum colaborador"
          description="Adicione um vínculo para começar a folha."
        />
      ) : (
        <ul aria-label="Colaboradores" className="flex flex-col gap-2">
          {rows.map(([id, e]) => (
            <li key={id}>
              <div
                className="flex items-center gap-3 p-3"
                style={{
                  borderRadius: "var(--ds-component-card-radius, 16px)",
                  background: "var(--ds-theme-surface-default)",
                  border: "1px solid var(--ds-theme-border-subtle)",
                }}
              >
                <span
                  className="grid h-9 w-9 place-items-center text-xs font-bold"
                  style={{
                    borderRadius: 9999,
                    background: "var(--ds-theme-intent-accent-subtle)",
                    color: "var(--ds-theme-intent-accent-on-subtle)",
                  }}
                  aria-hidden
                >
                  {e.name?.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold" style={{ color: "var(--ds-theme-content-strong)" }}>
                    {e.name}
                  </span>
                  <span className="block truncate text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
                    {e.role} · {e.department} · desde {e.hiredAt}
                  </span>
                </span>
                <span
                  className="shrink-0 text-[10px] font-semibold uppercase tracking-wide"
                  style={{
                    padding: "3px 8px",
                    borderRadius: 9999,
                    background:
                      e.status === "ativo"
                        ? "var(--ds-theme-intent-success-subtle, var(--ds-theme-surface-subdued))"
                        : "var(--ds-theme-surface-subdued)",
                    color:
                      e.status === "ativo"
                        ? "var(--ds-theme-intent-success-on-subtle, var(--ds-theme-content-strong))"
                        : "var(--ds-theme-content-muted)",
                  }}
                >
                  {e.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}

      <NewEmployeeModal open={newOpen} onOpenChange={setNewOpen} onSubmit={addEmployee} />
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide" style={{ color: "var(--ds-theme-content-subtle)" }}>
        {label}
      </p>
      <p className="text-lg font-semibold tabular-nums" style={{ color: "var(--ds-theme-content-strong)" }}>
        {value}
      </p>
    </div>
  );
}

function NewEmployeeModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (data: Employee) => void;
}) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setName("");
          setRole("");
          setDepartment("");
        }
        onOpenChange(v);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo colaborador</DialogTitle>
          <DialogDescription>Cadastro simples de vínculo empregatício.</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim() || !role.trim() || !department.trim()) return;
            onSubmit({
              name: name.trim(),
              role: role.trim(),
              department: department.trim(),
              hiredAt: new Date().toISOString().slice(0, 10),
              status: "ativo",
            });
            onOpenChange(false);
          }}
        >
          <div className="flex flex-col gap-1">
            <Label htmlFor="emp-name">Nome</Label>
            <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="emp-role">Cargo</Label>
            <Input id="emp-role" value={role} onChange={(e) => setRole(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="emp-dept">Departamento</Label>
            <Input id="emp-dept" value={department} onChange={(e) => setDepartment(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}