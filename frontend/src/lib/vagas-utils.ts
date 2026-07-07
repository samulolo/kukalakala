export function getCompanyInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Agora mesmo";
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours === 1 ? "" : "s"}`;
  if (diffDays === 1) return "Há 1 dia";
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 14) return "Há 1 semana";
  return `Há ${Math.floor(diffDays / 7)} semanas`;
}
