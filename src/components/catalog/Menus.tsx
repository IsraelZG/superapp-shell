import { useMemo, useState, type ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Check, ChevronsUpDown } from "lucide-react";

export function ContextMenuExample({ children }: { children: ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Abrir</ContextMenuItem>
        <ContextMenuItem>Compartilhar</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>Renomear</ContextMenuItem>
        <ContextMenuItem>Excluir</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function OverflowMenu({ items }: { items: { label: string; onSelect?: () => void }[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mais ações">
          <MoreHorizontal size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((it, i) => (
          <div key={it.label}>
            {i > 0 && i === items.length - 1 && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={it.onSelect}>{it.label}</DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ComboboxSelect({
  options,
  value,
  onChange,
  placeholder = "Selecionar…",
}: {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = useMemo(() => options.find((o) => o.value === value), [options, value]);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between">
          {selected?.label ?? placeholder}
          <ChevronsUpDown size={14} className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar…" />
          <CommandList>
            <CommandEmpty>Nada encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  onSelect={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    size={14}
                    className="mr-2"
                    style={{ opacity: value === o.value ? 1 : 0 }}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function SimpleDropdown({ label, items }: { label: string; items: { label: string; onSelect?: () => void }[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">{label}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {items.map((it) => (
          <DropdownMenuItem key={it.label} onSelect={it.onSelect}>{it.label}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type CommandAction = { id: string; label: string; hint?: string; onSelect: () => void };

export function CommandMenu({
  open,
  onOpenChange,
  actions,
  placeholder = "Digite um comando…",
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  actions: CommandAction[];
  placeholder?: string;
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <span />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>Nenhum comando corresponde.</CommandEmpty>
            <CommandGroup heading="Ações">
              {actions.map((a) => (
                <CommandItem
                  key={a.id}
                  value={a.label}
                  onSelect={() => {
                    a.onSelect();
                    onOpenChange(false);
                  }}
                >
                  <span>{a.label}</span>
                  {a.hint && (
                    <span className="ml-auto text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>{a.hint}</span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}