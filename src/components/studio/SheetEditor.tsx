import { useMemo, useRef, useState } from "react";
import { store, useTable } from "@/store/hooks";
import { EditorChrome } from "./EditorChrome";

const ROWS = 6;
const COLS = 4;

type CellRow = { documentId?: string; row?: number; col?: number; value?: string };

const cellId = (docId: string, r: number, c: number) => `s_${docId}_r${r}c${c}`;

export function SheetEditor({
  documentId,
  onClose,
}: {
  documentId: string;
  onClose: () => void;
}) {
  const sheetTable = useTable("sheets") as Record<string, CellRow>;
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [editing, setEditing] = useState(false);
  const [saveSignal, setSaveSignal] = useState<string>("");
  const [formulaValue, setFormulaValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // grid derivada da tabela sheets, filtrada por documentId
  const grid = useMemo(() => {
    const g: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
    for (const cell of Object.values(sheetTable)) {
      if (
        cell.documentId === documentId &&
        typeof cell.row === "number" &&
        typeof cell.col === "number"
      ) {
        if (cell.row < ROWS && cell.col < COLS) {
          g[cell.row][cell.col] = String(cell.value ?? "");
        }
      }
    }
    return g;
  }, [sheetTable, documentId]);

  const selectedValue = grid[sel.r]?.[sel.c] ?? "";

  const writeCell = (r: number, c: number, value: string) => {
    store.setRow("sheets", cellId(documentId, r, c), {
      documentId,
      row: r,
      col: c,
      value,
    });
    store.setCell("documents", documentId, "updatedAt", new Date().toISOString());
    setSaveSignal(`${Date.now()}`);
  };

  const startEdit = (r: number, c: number) => {
    setSel({ r, c });
    setEditing(true);
    setFormulaValue(grid[r][c] ?? "");
    // dá tempo do input montar antes de focar
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const commitEdit = (moveTo?: { r: number; c: number }) => {
    writeCell(sel.r, sel.c, formulaValue);
    setEditing(false);
    if (moveTo) setSel(moveTo);
  };

  const onCellKey = (e: React.KeyboardEvent) => {
    if (editing) return;
    let next = { ...sel };
    if (e.key === "ArrowDown") next.r = Math.min(ROWS - 1, sel.r + 1);
    else if (e.key === "ArrowUp") next.r = Math.max(0, sel.r - 1);
    else if (e.key === "ArrowRight") next.c = Math.min(COLS - 1, sel.c + 1);
    else if (e.key === "ArrowLeft") next.c = Math.max(0, sel.c - 1);
    else if (e.key === "Enter" || e.key === "F2") {
      e.preventDefault();
      startEdit(sel.r, sel.c);
      return;
    } else {
      return;
    }
    e.preventDefault();
    setSel(next);
  };

  return (
    <EditorChrome
      documentId={documentId}
      onClose={onClose}
      saveSignal={saveSignal}
      allowedFormats={["pdf", "docx"]}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 p-4 sm:p-6">
        {/* Barra de fórmula */}
        <div
          className="flex items-center gap-2 p-2"
          style={{
            borderRadius: 12,
            background: "var(--ds-theme-surface-subdued)",
            border: "1px solid var(--ds-theme-border-subtle)",
          }}
        >
          <span
            className="grid h-7 min-w-[42px] place-items-center text-[11px] font-bold tabular-nums"
            style={{
              borderRadius: 8,
              background: "var(--ds-theme-surface-default)",
              color: "var(--ds-theme-content-strong)",
              padding: "0 8px",
            }}
          >
            {String.fromCharCode(65 + sel.c)}
            {sel.r + 1}
          </span>
          <span
            aria-hidden
            style={{
              width: 1,
              height: 20,
              background: "var(--ds-theme-border-subtle)",
            }}
          />
          <input
            aria-label="Barra de fórmula"
            value={editing ? formulaValue : selectedValue}
            readOnly={!editing}
            onFocus={() => {
              if (!editing) startEdit(sel.r, sel.c);
            }}
            onChange={(e) => setFormulaValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitEdit({ r: Math.min(ROWS - 1, sel.r + 1), c: sel.c });
              } else if (e.key === "Escape") {
                setEditing(false);
                setFormulaValue(selectedValue);
              }
            }}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--ds-theme-content-default)" }}
          />
        </div>

        {/* Grade */}
        <div
          role="grid"
          aria-label="Planilha"
          className="overflow-x-auto"
          onKeyDown={onCellKey}
          tabIndex={0}
          style={{
            borderRadius: 12,
            border: "1px solid var(--ds-theme-border-subtle)",
            background: "var(--ds-theme-surface-default)",
          }}
        >
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="w-10"
                  style={{
                    background: "var(--ds-theme-surface-subdued)",
                    borderBottom: "1px solid var(--ds-theme-border-subtle)",
                  }}
                />
                {Array.from({ length: COLS }).map((_, c) => (
                  <th
                    key={c}
                    scope="col"
                    className="px-2 py-1 text-[11px] font-semibold uppercase"
                    style={{
                      background: "var(--ds-theme-surface-subdued)",
                      color: "var(--ds-theme-content-muted)",
                      borderBottom: "1px solid var(--ds-theme-border-subtle)",
                      borderLeft: "1px solid var(--ds-theme-border-subtle)",
                    }}
                  >
                    {String.fromCharCode(65 + c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, r) => (
                <tr key={r}>
                  <th
                    scope="row"
                    className="px-2 py-1 text-[11px] font-semibold tabular-nums"
                    style={{
                      background: "var(--ds-theme-surface-subdued)",
                      color: "var(--ds-theme-content-muted)",
                      borderTop: "1px solid var(--ds-theme-border-subtle)",
                      textAlign: "center",
                    }}
                  >
                    {r + 1}
                  </th>
                  {row.map((val, c) => {
                    const selected = sel.r === r && sel.c === c;
                    const isEditing = selected && editing;
                    return (
                      <td
                        key={c}
                        role="gridcell"
                        aria-selected={selected}
                        onClick={() => {
                          if (!isEditing) setSel({ r, c });
                        }}
                        onDoubleClick={() => startEdit(r, c)}
                        style={{
                          borderTop: "1px solid var(--ds-theme-border-subtle)",
                          borderLeft: "1px solid var(--ds-theme-border-subtle)",
                          padding: 0,
                          position: "relative",
                          background: selected
                            ? "var(--ds-theme-intent-accent-subtle)"
                            : "transparent",
                          outline: selected
                            ? `2px solid var(--ds-theme-intent-accent-fill)`
                            : "none",
                          outlineOffset: -2,
                          cursor: "cell",
                          minWidth: 120,
                        }}
                      >
                        {isEditing ? (
                          <input
                            ref={inputRef}
                            value={formulaValue}
                            onChange={(e) => setFormulaValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                commitEdit({
                                  r: Math.min(ROWS - 1, r + 1),
                                  c,
                                });
                              } else if (e.key === "Tab") {
                                e.preventDefault();
                                commitEdit({
                                  r,
                                  c: Math.min(COLS - 1, c + 1),
                                });
                              } else if (e.key === "Escape") {
                                setEditing(false);
                                setFormulaValue(val);
                              }
                            }}
                            aria-label={`Célula ${String.fromCharCode(65 + c)}${r + 1}`}
                            className="w-full bg-transparent outline-none"
                            style={{
                              padding: "6px 10px",
                              color: "var(--ds-theme-content-strong)",
                            }}
                          />
                        ) : (
                          <span
                            className="block truncate"
                            style={{
                              padding: "6px 10px",
                              color: "var(--ds-theme-content-default)",
                            }}
                          >
                            {val}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[11px]" style={{ color: "var(--ds-theme-content-muted)" }}>
          Dica: clique numa célula, Enter para editar, Enter confirma e desce, Tab confirma e vai à direita.
        </p>
      </div>
    </EditorChrome>
  );
}