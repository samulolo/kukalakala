"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { JobsQuery } from "@/lib/jobs-api";

const JOB_TYPES = [
  { value: "full_time", label: "Tempo integral" },
  { value: "contract", label: "Contrato" },
  { value: "internship", label: "Estágio" },
];

const WORKPLACES = [
  { value: "remote", label: "Remoto" },
  { value: "hybrid", label: "Híbrido" },
  { value: "on_site", label: "Presencial" },
];

const DATE_OPTIONS = [
  { value: "24h", label: "Últimas 24 horas" },
  { value: "week", label: "Última semana" },
  { value: "month", label: "Último mês" },
];

type Props = {
  searchParams: JobsQuery;
};

function buildUrl(searchParams: JobsQuery, key: string, value: string | null): string {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(searchParams).filter(([, v]) => v !== undefined)
    ) as Record<string, string>
  );
  if (value === null) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
  params.delete("page");
  return `/vagas?${params.toString()}`;
}

export function JobsFilters({ searchParams }: Props) {
  const router = useRouter();
  const [salaryMax, setSalaryMax] = useState(180);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const update = (key: string, value: string | null) => {
    router.push(buildUrl(searchParams, key, value));
  };

  const clearAll = () => {
    router.push("/vagas");
    setDrawerOpen(false);
  };

  const activeCount = [searchParams.job_type, searchParams.type, searchParams.date_posted].filter(
    Boolean
  ).length;

  const filterSections = (
    <div className="flex flex-col gap-7">
      <div>
        <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
          Tipo de contrato
        </p>
        <div className="flex flex-col gap-2.5">
          {JOB_TYPES.map(({ value, label }) => {
            const checked = searchParams.job_type === value;
            return (
              <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#f8fafc]">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-[#cbd5e1] accent-accent"
                  checked={checked}
                  onChange={() => update("job_type", checked ? null : value)}
                />
                <span className="text-[0.9rem] font-medium text-[#334155]">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
          Modalidade
        </p>
        <div className="flex flex-col gap-2.5">
          {WORKPLACES.map(({ value, label }) => {
            const checked = searchParams.type === value;
            return (
              <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#f8fafc]">
                <input
                  type="checkbox"
                  className="h-4 w-4 cursor-pointer rounded border-[#cbd5e1] accent-accent"
                  checked={checked}
                  onChange={() => update("type", checked ? null : value)}
                />
                <span className="text-[0.9rem] font-medium text-[#334155]">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
          Faixa salarial
        </p>
        <div className="px-0.5">
          <input
            type="range"
            min={0}
            max={300}
            step={10}
            value={salaryMax}
            onChange={(e) => setSalaryMax(+e.target.value)}
            className="w-full cursor-pointer accent-accent"
          />
          <div className="mt-1.5 flex justify-between text-[0.78rem] text-[#667085]">
            <span>$0k</span>
            <span>${salaryMax}k</span>
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">
          Publicação
        </p>
        <div className="flex flex-col gap-2.5">
          {DATE_OPTIONS.map(({ value, label }) => {
            const checked = searchParams.date_posted === value;
            return (
              <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 transition-colors hover:bg-[#f8fafc]">
                <input
                  type="radio"
                  name="date_posted"
                  className="h-4 w-4 cursor-pointer accent-accent"
                  checked={checked}
                  onChange={() => update("date_posted", value)}
                />
                <span className="text-[0.9rem] font-medium text-[#334155]">{label}</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden rounded-2xl border border-[#dbe3ee] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] lg:flex lg:flex-col lg:gap-6">
        <div className="flex items-center justify-between border-b border-[#edf1f6] pb-4">
          <span className="text-[1rem] font-semibold text-[#111827]">Filtros</span>
          <button
            onClick={clearAll}
            className="text-[0.85rem] font-semibold text-accent hover:text-accent-dark"
          >
            Limpar
          </button>
        </div>
        {filterSections}
      </div>

      {/* Mobile trigger button */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="relative inline-flex items-center gap-2 rounded-xl border border-[#dbe3ee] bg-white px-4 py-2.5 text-[0.9rem] font-semibold text-[#111827] shadow-sm transition-colors hover:border-accent hover:text-accent lg:hidden"
      >
        <SlidersHorizontal size={15} />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[0.65rem] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[300px] flex-col overflow-hidden bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-soft-line px-5 py-4">
              <span className="text-[0.95rem] font-semibold text-[#111827]">Filtros</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={clearAll}
                  className="text-[0.82rem] font-semibold text-accent hover:text-accent-dark"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-md p-1 text-[#9baab8] transition-colors hover:bg-[#f1f3f5] hover:text-[#111827]"
                  aria-label="Fechar filtros"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{filterSections}</div>
            <div className="border-t border-soft-line p-4">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-accent py-3 text-[0.9rem] font-semibold text-white hover:bg-accent-dark"
              >
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
