"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquareText,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import type { CandidateDashboardApplication } from "@/lib/candidate-dashboard-api";
import type { Pagination } from "@/lib/jobs-api";

type Props = {
  applications: CandidateDashboardApplication[];
  pagination: Pagination;
  candidateId?: string;
};

const statusLabels: Record<string, string> = {
  submetida: "Submetida",
  em_analise: "Em análise",
  entrevista: "Entrevista",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
};

const statusStyles: Record<string, string> = {
  submetida: "bg-[#eef6ff] text-[#2557a7]",
  em_analise: "bg-[#effdf4] text-[#16813f]",
  entrevista: "bg-violet-50 text-violet-700",
  aprovada: "bg-[#effdf4] text-[#16813f]",
  rejeitada: "bg-slate-100 text-slate-500",
};

function pageHref(candidateId: string | undefined, page: number) {
  const params = new URLSearchParams();
  params.set("page", String(page));

  if (candidateId) {
    params.set("candidateId", candidateId);
  }

  return `/dashboard-candidato?${params.toString()}`;
}

function formatMessageDate(value: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CandidateApplicationsTable({ applications, pagination, candidateId }: Props) {
  const [selectedApplication, setSelectedApplication] = useState<CandidateDashboardApplication | null>(null);
  const totalPages = Math.max(1, pagination.pages || 1);
  const currentPage = pagination.page || 1;
  const firstItem = pagination.total === 0 ? 0 : (currentPage - 1) * pagination.limit + 1;
  const lastItem = Math.min(currentPage * pagination.limit, pagination.total);

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
      <div className="flex flex-col gap-3 border-b border-[#edf1f6] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-[1.05rem] font-semibold text-[#0f172a]">Candidaturas</h2>
          <p className="mt-1 text-[0.82rem] text-[#667085]">Acompanha as vagas às quais aplicaste e vê a análise da IA.</p>
        </div>
        <Link href="/vagas" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.84rem] font-semibold text-white hover:bg-accent-dark">
          Procurar vagas
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="p-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#effdf4] text-accent">
            <FileText size={20} aria-hidden="true" />
          </div>
          <p className="mt-4 font-display text-[1rem] font-semibold text-[#0f172a]">Ainda não existem candidaturas</p>
          <p className="mt-1 text-[0.86rem] text-[#667085]">Quando aplicares a uma vaga, o histórico aparece aqui.</p>
          <Link href="/vagas" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-[0.84rem] font-semibold text-white hover:bg-accent-dark">
            Ver vagas abertas
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-3 p-3 md:hidden">
            {applications.map((application) => (
              <article key={application.id} className="rounded-xl border border-[#edf1f6] bg-white p-4 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#eef6ff] text-[#2557a7]">
                    <BriefcaseBusiness size={17} aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.92rem] font-semibold leading-snug text-[#0f172a]">{application.title}</p>
                    <p className="mt-1 text-[0.8rem] text-[#667085]">{application.company}</p>
                    <p className="mt-1 text-[0.76rem] text-[#94a3b8]">{application.meta}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 min-[380px]:grid-cols-3">
                  <div className="rounded-lg bg-[#f8fafc] p-2">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Data</p>
                    <p className="mt-1 break-words text-[0.78rem] font-medium text-[#475569]">{application.applied}</p>
                  </div>
                  <div className="rounded-lg bg-[#f8fafc] p-2">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Score</p>
                    <p className="mt-1 text-[0.82rem] font-semibold text-[#16813f]">{application.score}%</p>
                  </div>
                  <div className="rounded-lg bg-[#f8fafc] p-2">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Estado</p>
                    <span className={`mt-1 inline-flex max-w-full rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${statusStyles[application.status] ?? "bg-slate-100 text-slate-500"}`}>
                      {statusLabels[application.status] ?? application.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2">
                  {application.messages.length > 0 && (
                    <div className="rounded-lg border border-[#ccefd9] bg-[#fbfffc] px-3 py-2 text-[0.78rem] font-medium text-[#16813f]">
                      Nova mensagem da empresa
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(application)}
                    className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0f172a] px-3 text-[0.8rem] font-semibold text-white hover:bg-[#1e293b]"
                  >
                    {application.messages.length > 0 ? <MessageSquareText size={14} aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
                    {application.messages.length > 0 ? "Ver mensagem" : "Ver análise IA"}
                  </button>
                  <Link href={`/vagas/detalhes?job_id=${application.jobId}`} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-[#dbe3ee] px-3 text-[0.8rem] font-semibold text-[#475569] hover:border-accent hover:text-accent">
                    Ver vaga
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
              <thead>
                <tr className="bg-[#f8fafc] text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                  <th className="border-b border-[#edf1f6] px-4 py-3">Vaga</th>
                  <th className="border-b border-[#edf1f6] px-4 py-3">Empresa</th>
                  <th className="border-b border-[#edf1f6] px-4 py-3">Data</th>
                  <th className="border-b border-[#edf1f6] px-4 py-3">Estado</th>
                  <th className="border-b border-[#edf1f6] px-4 py-3">Score IA</th>
                  <th className="border-b border-[#edf1f6] px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id} className="text-[0.86rem] text-[#475569]">
                    <td className="border-b border-[#edf1f6] px-4 py-4">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#eef6ff] text-[#2557a7]">
                          <BriefcaseBusiness size={17} aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-[#0f172a]">{application.title}</p>
                          <p className="mt-1 truncate text-[0.78rem] text-[#667085]">{application.meta}</p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-[#edf1f6] px-4 py-4 font-medium text-[#0f172a]">{application.company}</td>
                    <td className="border-b border-[#edf1f6] px-4 py-4">{application.applied}</td>
                    <td className="border-b border-[#edf1f6] px-4 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[0.76rem] font-semibold ${statusStyles[application.status] ?? "bg-slate-100 text-slate-500"}`}>
                        {statusLabels[application.status] ?? application.status}
                      </span>
                      {application.messages.length > 0 && (
                        <span className="mt-2 inline-flex items-center gap-1 text-[0.72rem] font-semibold text-[#16813f]">
                          <MessageSquareText size={12} aria-hidden="true" />
                          Mensagem recebida
                        </span>
                      )}
                    </td>
                    <td className="border-b border-[#edf1f6] px-4 py-4">
                      <span className="font-display text-[1rem] font-semibold text-[#16813f]">{application.score}%</span>
                    </td>
                    <td className="border-b border-[#edf1f6] px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(application)}
                          className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-[#0f172a] px-3 text-[0.78rem] font-semibold text-white hover:bg-[#1e293b]"
                        >
                          {application.messages.length > 0 ? <MessageSquareText size={14} aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
                          {application.messages.length > 0 ? "Ver mensagem" : "Ver análise IA"}
                        </button>
                        <Link href={`/vagas/detalhes?job_id=${application.jobId}`} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-[#dbe3ee] px-3 text-[0.78rem] font-semibold text-[#475569] hover:border-accent hover:text-accent">
                          Ver vaga
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[0.82rem] text-[#667085]">
              A mostrar {firstItem}-{lastItem} de {pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <Link
                href={pageHref(candidateId, Math.max(1, currentPage - 1))}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] ${currentPage <= 1 ? "pointer-events-none opacity-40" : "hover:border-accent hover:text-accent"}`}
                aria-label="Página anterior"
              >
                <ChevronLeft size={16} aria-hidden="true" />
              </Link>
              <span className="rounded-lg bg-[#f8fafc] px-3 py-2 text-[0.82rem] font-semibold text-[#475569]">
                Página {currentPage} de {totalPages}
              </span>
              <Link
                href={pageHref(candidateId, Math.min(totalPages, currentPage + 1))}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] ${currentPage >= totalPages ? "pointer-events-none opacity-40" : "hover:border-accent hover:text-accent"}`}
                aria-label="Próxima página"
              >
                <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="candidate-ai-analysis-title">
          <div className="max-h-[calc(100svh-32px)] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#edf1f6] bg-white p-5">
              <div>
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Análise da IA</p>
                <h3 id="candidate-ai-analysis-title" className="mt-1 font-display text-[1.25rem] font-semibold text-[#0f172a]">
                  {selectedApplication.title}
                </h3>
                <p className="mt-1 text-[0.86rem] text-[#667085]">{selectedApplication.company} · {selectedApplication.meta}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#475569] hover:border-accent hover:text-accent"
                aria-label="Fechar análise"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[180px_minmax(0,1fr)]">
              <aside className="rounded-2xl border border-[#ccefd9] bg-[#fbfffc] p-5">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#16813f]">Score IA</p>
                <p className="mt-3 font-display text-[2.4rem] font-semibold leading-none text-[#16813f]">{selectedApplication.score}%</p>
                <p className="mt-2 text-[0.82rem] leading-relaxed text-[#667085]">Compatibilidade estimada entre o CV e a vaga.</p>
              </aside>

              <section className="space-y-5">
                {selectedApplication.messages[0] && (
                  <div className="rounded-2xl border border-[#ccefd9] bg-[#fbfffc] p-5">
                    <div className="flex items-center gap-2">
                      <MessageSquareText size={18} className="text-accent" aria-hidden="true" />
                      <h4 className="font-display text-[1rem] font-semibold text-[#0f172a]">Mensagem da empresa</h4>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-1 text-[0.74rem] font-semibold ${statusStyles[selectedApplication.messages[0].status] ?? "bg-slate-100 text-slate-500"}`}>
                        {statusLabels[selectedApplication.messages[0].status] ?? selectedApplication.messages[0].status}
                      </span>
                      <span className="text-[0.76rem] text-[#94a3b8]">{formatMessageDate(selectedApplication.messages[0].createdAt)}</span>
                    </div>
                    <p className="mt-3 whitespace-pre-line text-[0.9rem] leading-[1.7] text-[#475569]">{selectedApplication.messages[0].message}</p>
                  </div>
                )}

                <div className="rounded-2xl border border-[#e3e8ef] p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-accent" aria-hidden="true" />
                    <h4 className="font-display text-[1rem] font-semibold text-[#0f172a]">Explicação</h4>
                  </div>
                  <p className="mt-3 text-[0.9rem] leading-[1.7] text-[#475569]">{selectedApplication.explanation}</p>
                </div>

                <div className="rounded-2xl border border-[#e3e8ef] p-5">
                  <div className="flex items-center gap-2">
                    <Search size={18} className="text-accent" aria-hidden="true" />
                    <h4 className="font-display text-[1rem] font-semibold text-[#0f172a]">Competências chave</h4>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {selectedApplication.competences.length > 0 ? selectedApplication.competences.map((competence) => (
                      <span key={competence} className="inline-flex items-center gap-1 rounded-full bg-[#effdf4] px-3 py-1 text-[0.78rem] font-semibold text-[#16813f]">
                        <CheckCircle2 size={13} aria-hidden="true" />
                        {competence}
                      </span>
                    )) : (
                      <span className="text-[0.86rem] text-[#667085]">A IA ainda não registou competências chave nesta candidatura.</span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e3e8ef] p-5">
                  <div className="flex items-center gap-2">
                    <MessageSquareText size={18} className="text-accent" aria-hidden="true" />
                    <h4 className="font-display text-[1rem] font-semibold text-[#0f172a]">Mensagens da empresa</h4>
                  </div>
                  <div className="mt-4 space-y-3">
                    {selectedApplication.messages.length > 0 ? selectedApplication.messages.map((item) => (
                      <div key={item.id} className="rounded-xl bg-[#f8fafc] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[0.74rem] font-semibold ${statusStyles[item.status] ?? "bg-slate-100 text-slate-500"}`}>
                            {statusLabels[item.status] ?? item.status}
                          </span>
                          <span className="text-[0.76rem] text-[#94a3b8]">{formatMessageDate(item.createdAt)}</span>
                        </div>
                        <p className="mt-3 whitespace-pre-line text-[0.88rem] leading-[1.7] text-[#475569]">{item.message}</p>
                      </div>
                    )) : (
                      <p className="text-[0.86rem] text-[#667085]">Ainda não recebeste mensagens da empresa para esta candidatura.</p>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
