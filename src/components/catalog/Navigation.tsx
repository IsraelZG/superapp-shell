import { useEffect, useRef, useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Início</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/catalogo">Catálogo</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Navegação</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function Paginator({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);
  const btn = (n: number, active = false) => (
    <button
      key={n}
      type="button"
      onClick={() => onChange(n)}
      aria-current={active ? "page" : undefined}
      className="text-xs font-semibold"
      style={{
        padding: "6px 10px",
        minWidth: 32,
        borderRadius: 9999,
        background: active ? "var(--ds-theme-intent-accent-fill)" : "var(--ds-theme-surface-default)",
        color: active ? "var(--ds-theme-intent-accent-on-fill)" : "var(--ds-theme-content-default)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {n}
    </button>
  );
  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center gap-1">
      {pages.map((n) => btn(n, n === page))}
    </nav>
  );
}

export function InfiniteList({ items }: { items: string[] }) {
  const [count, setCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinel.current) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && count < items.length) {
        setLoading(true);
        const t = window.setTimeout(() => {
          setCount((c) => Math.min(items.length, c + 4));
          setLoading(false);
        }, 400);
        return () => window.clearTimeout(t);
      }
    });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [count, items.length]);
  return (
    <div
      className="flex max-h-64 flex-col gap-2 overflow-y-auto p-2"
      style={{
        borderRadius: 16,
        background: "var(--ds-theme-surface-subdued)",
        border: "1px solid var(--ds-theme-border-subtle)",
      }}
    >
      {items.slice(0, count).map((it) => (
        <div
          key={it}
          className="px-3 py-2 text-sm"
          style={{
            borderRadius: 12,
            background: "var(--ds-theme-surface-default)",
            color: "var(--ds-theme-content-default)",
          }}
        >
          {it}
        </div>
      ))}
      <div ref={sentinel} className="grid place-items-center py-2 text-[11px]" style={{ color: "var(--ds-theme-content-subtle)" }}>
        {count < items.length ? (loading ? "Carregando…" : "Role para carregar mais") : "Fim da lista"}
      </div>
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [debouncing, setDebouncing] = useState(false);
  useEffect(() => {
    if (!value) {
      setDebouncing(false);
      return;
    }
    setDebouncing(true);
    const t = window.setTimeout(() => setDebouncing(false), 300);
    return () => window.clearTimeout(t);
  }, [value]);
  return (
    <div className="relative">
      <Search
        size={14}
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        style={{ color: "var(--ds-theme-content-subtle)" }}
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar"
        className="pl-8 pr-8"
      />
      {debouncing && (
        <Loader2
          size={14}
          aria-hidden
          className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin"
          style={{ color: "var(--ds-theme-content-subtle)" }}
        />
      )}
    </div>
  );
}