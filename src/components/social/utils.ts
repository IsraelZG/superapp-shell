export function relTime(iso: string): string {
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "";
  const diff = Date.now() - d;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h} h`;
  const dias = Math.floor(h / 24);
  if (dias < 7) return `há ${dias} d`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

export function isExpired(iso: string): boolean {
  const t = new Date(iso).getTime();
  return !isNaN(t) && t < Date.now();
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export const visibilityLabel: Record<string, string> = {
  public: "Público",
  connections: "Conexões",
  private: "Somente eu",
};