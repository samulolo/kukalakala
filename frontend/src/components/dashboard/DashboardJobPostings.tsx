"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye, Pencil, Search } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { DashboardJob, getDashboardJobMeta } from "@/lib/dashboard-api";
import { Pagination } from "@/lib/jobs-api";
import { formatRelativeDate } from "@/lib/vagas-utils";

type Props = {
  jobs: DashboardJob[];
  pagination: Pagination;
  status?: string;
  errorMessage?: string;
};

const statusStyles: Record<string, { dot: string; text: string; bg: string; label: string }> = {
  active: { dot: "bg-accent", text: "text-[#16813f]", bg: "bg-[#effdf4]", label: "Ativa" },
  inactive: { dot: "bg-slate-300", text: "text-slate-500", bg: "bg-slate-100", label: "Inativa" },
};

const filters = [
  { label: "Todas", value: "all" },
  { label: "Ativas", value: "active" },
  { label: "Inativas", value: "inactive" },
];

export function DashboardJobPostings({ jobs, pagination, status = "all", errorMessage }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const totalPages = Math.max(1, pagination.pages || 1);
  const firstItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total);

  function goToPage(nextPage: number) {
    const params = new URLSearchParams();
    params.set("page", String(Math.min(Math.max(nextPage, 1), totalPages)));

    if (status && status !== "all") {
      params.set("status", status);
    }

    router.push(`/dashboard/vagas?${params.toString()}`);
  }

  function setFilter(nextStatus: string) {
    const params = new URLSearchParams();
    params.set("page", "1");

    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }

    router.push(`/dashboard/vagas?${params.toString()}`);
    toast({
      title: nextStatus === "all" ? "Todas as vagas" : `Filtro ${nextStatus === "active" ? "ativas" : "inativas"} aplicado`,
      description: "A lista foi atualizada com os dados mais recentes.",
      variant: "info",
    });
  }

  return (
    <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
          <input className="min-h-10 w-full rounded-lg border border-[#dbe3ee] bg-[#f8fafc] pl-9 pr-3 text-[0.88rem] outline-none focus:border-accent focus:bg-white" placeholder="Pesquisar vagas" />
        </div>
        <div className="flex gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`min-h-10 rounded-lg px-3 text-[0.82rem] font-semibold ${item.value === status ? "bg-[#0f172a] text-white" : "border border-[#dbe3ee] bg-white text-[#475569]"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[0.85rem] font-medium text-[#b91c1c]">
          {errorMessage}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#f1f5f9]">
              {["Vaga", "Status", "Candidaturas", "Visualizações", "Publicada", "Ações"].map((header, index) => (
                <th key={header} className={`pb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#94a3b8] ${index >= 2 ? "text-right" : ""}`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const statusKey = job.is_active ? "active" : "inactive";
              const statusConfig = statusStyles[statusKey];
              return (
                <tr key={job.id} className="border-b border-[#f8fafc] last:border-0">
                  <td className="py-4 pr-4">
                    <p className="text-[0.9rem] font-semibold text-[#0f172a]">{job.title}</p>
                    <p className="mt-0.5 text-[0.78rem] text-[#94a3b8]">{getDashboardJobMeta(job)}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.78rem] font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                      <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-right text-[0.9rem] font-semibold text-[#0f172a]">{job.applicants_count}</td>
                  <td className="py-4 pr-4 text-right text-[0.9rem] font-medium text-[#64748b]">-</td>
                  <td className="py-4 text-right text-[0.82rem] font-medium text-[#64748b]">{formatRelativeDate(job.created_at)}</td>
                  <td className="py-4 pl-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/vagas/${job.id}`}
                        aria-label={`Ver detalhes de ${job.title}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe3ee] bg-white text-[#475569] hover:border-accent hover:text-accent"
                      >
                        <Eye size={15} aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/dashboard/vagas/${job.id}/editar`}
                        aria-label={`Editar ${job.title}`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f172a] text-white hover:bg-[#1e293b]"
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {jobs.length === 0 && (
        <div className="py-10 text-center">
          <p className="text-[0.95rem] font-semibold text-[#0f172a]">Nenhuma vaga encontrada</p>
          <p className="mt-1 text-[0.85rem] text-[#667085]">Quando houver vagas publicadas, elas aparecem aqui.</p>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-[#edf1f6] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.82rem] text-[#667085]">
          Mostrando {firstItem}-{lastItem} de {pagination.total} vagas
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              className={`h-9 min-w-9 rounded-lg px-3 text-[0.82rem] font-semibold ${
                pageNumber === pagination.page ? "bg-[#0f172a] text-white" : "border border-[#dbe3ee] bg-white text-[#475569]"
              }`}
            >
              {pageNumber}
            </button>
          ))}
          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Próxima página"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
