"use client";

import { useRouter } from "next/navigation";
import { JobsQuery } from "@/lib/jobs-api";

const FILTER_LABELS: Record<string, Record<string, string>> = {
  type: { remote: "Remoto", hybrid: "Híbrido", on_site: "Presencial" },
  job_type: { full_time: "Tempo integral", contract: "Contrato", internship: "Estágio" },
  date_posted: { "24h": "Últimas 24 horas", week: "Última semana", month: "Último mês" },
};

type Props = {
  searchParams: JobsQuery;
};

export function ActiveFilters({ searchParams }: Props) {
  const router = useRouter();

  const chips: { key: string; label: string }[] = [];

  for (const [key, labels] of Object.entries(FILTER_LABELS)) {
    const val = searchParams[key as keyof JobsQuery];
    if (val && labels[val]) {
      chips.push({ key, label: labels[val] });
    }
  }

  if (searchParams.q) {
    chips.push({ key: "q", label: searchParams.q });
  }

  if (chips.length === 0) return null;

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(searchParams).filter(([, v]) => v !== undefined)
      ) as Record<string, string>
    );
    params.delete(key);
    params.delete("page");
    router.push(`/vagas?${params.toString()}`);
  };

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {chips.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border border-[#ccefd9] bg-[#effdf4] px-3 py-1.5 text-[0.8rem] font-semibold text-[#16813f]"
        >
          {label}
          <button
            onClick={() => removeFilter(key)}
            className="flex h-4 w-4 items-center justify-center rounded-full leading-none transition-colors hover:bg-[#ccefd9]"
            aria-label={`Remover filtro ${label}`}
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}
