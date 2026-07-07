"use client";

import { useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { JobsQuery } from "@/lib/jobs-api";

const WORKPLACE_LABELS: Record<string, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  on_site: "Presencial",
};

const JOB_TYPE_LABELS: Record<string, string> = {
  full_time: "Tempo integral",
  contract: "Contrato",
  internship: "Estágio",
};

type Props = {
  query: string;
  total: number;
  searchParams: JobsQuery;
};

export function JobsHeader({ query, total, searchParams }: Props) {
  const router = useRouter();

  const title = query ? `Vagas para "${query}"` : "Todas as vagas";

  const subtitleParts: string[] = [
    `${total.toLocaleString("pt-PT")} resultado${total === 1 ? "" : "s"}`,
  ];
  if (searchParams.type && WORKPLACE_LABELS[searchParams.type]) {
    subtitleParts.push(WORKPLACE_LABELS[searchParams.type]);
  }
  if (searchParams.job_type && JOB_TYPE_LABELS[searchParams.job_type]) {
    subtitleParts.push(JOB_TYPE_LABELS[searchParams.job_type]);
  }

  const handleSort = (sort: string) => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(searchParams).filter(([, v]) => v !== undefined)
      ) as Record<string, string>
    );
    params.set("sort", sort);
    router.push(`/vagas?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl border border-[#dbe3ee] bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-5">
      <form
        action="/vagas"
        className="grid gap-3 md:grid-cols-[minmax(0,1fr)_190px_auto]"
      >
        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-4 text-[#94a3b8] focus-within:border-accent focus-within:bg-white">
          <Search size={18} aria-hidden="true" />
          <input
            className="w-full border-0 bg-transparent text-[0.95rem] font-medium text-[#111827] outline-none placeholder:text-[#94a3b8]"
            name="q"
            placeholder="Cargo, palavra-chave ou empresa"
            type="search"
            defaultValue={searchParams.q ?? ""}
          />
        </label>

        <select
          className="min-h-12 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-4 text-[0.95rem] font-medium text-[#475569] outline-none focus:border-accent focus:bg-white"
          name="type"
          defaultValue={searchParams.type ?? "all"}
        >
          <option value="all">Todas modalidades</option>
          <option value="remote">Remoto</option>
          <option value="hybrid">Híbrido</option>
          <option value="on_site">Presencial</option>
        </select>

        <button
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-5 font-display text-[0.95rem] font-semibold text-white hover:bg-accent-dark"
          type="submit"
        >
          <SlidersHorizontal size={17} aria-hidden="true" />
          Pesquisar
        </button>
      </form>

      <div className="mt-5 flex flex-col gap-3 border-t border-[#edf1f6] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="font-display text-[1.25rem] font-semibold text-[#111827] sm:text-[1.45rem]">
            {title}
          </h2>
          <p className="mt-1 text-[0.88rem] text-[#667085]">{subtitleParts.join(" · ")}</p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <span className="text-[0.85rem] text-[#667085]">Ordenar por</span>
          <div className="relative">
            <select
              className="appearance-none rounded-xl border border-[#dbe3ee] bg-white py-2.5 pl-3 pr-8 text-[0.85rem] font-semibold text-[#111827] outline-none transition-colors focus:border-accent"
              value={searchParams.sort ?? "relevance"}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="relevance">Relevância</option>
              <option value="recent">Mais recentes</option>
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] text-[#94a3b8]">
              ▾
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
