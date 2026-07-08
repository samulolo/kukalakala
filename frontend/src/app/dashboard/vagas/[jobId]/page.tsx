import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, Pencil, UsersRound } from "lucide-react";
import { getDashboardJobById, getDashboardJobMeta } from "@/lib/dashboard-api";
import { getResponseTimeLabel } from "@/lib/jobs-api";
import { formatRelativeDate } from "@/lib/vagas-utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function DashboardJobDetailsPage({ params }: Props) {
  const { jobId } = await params;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("kukalakala_session")?.value;
  const job = await getDashboardJobById(jobId, authToken);

  if (!job) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/dashboard/vagas" className="inline-flex items-center gap-2 text-[0.86rem] font-semibold text-[#667085] hover:text-accent">
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar para vagas
          </Link>
          <h1 className="mt-3 font-display text-[1.65rem] font-semibold text-[#0f172a]">{job.title}</h1>
          <p className="mt-1 text-[0.9rem] text-[#667085]">{job.company?.name ?? "Empresa"} · {getDashboardJobMeta(job)}</p>
        </div>
        <Link href={`/dashboard/vagas/${job.id}/editar`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-4 text-[0.85rem] font-semibold text-white hover:bg-[#1e293b]">
          <Pencil size={15} aria-hidden="true" />
          Editar vaga
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Status", job.is_active ? "Ativa" : "Inativa"],
          ["Candidaturas", String(job.applicants_count)],
          ["Visualizações", "-"],
          ["Publicada", formatRelativeDate(job.created_at)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
            <p className="text-[0.82rem] font-medium text-[#667085]">{label}</p>
            <p className="mt-3 font-display text-[1.55rem] font-semibold leading-none text-[#0f172a]">{value}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <article className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Detalhes da vaga</h2>
          <p className="mt-4 whitespace-pre-line text-[0.94rem] leading-[1.75] text-[#475569]">{job.description}</p>

          <div className="mt-6 border-t border-[#edf1f6] pt-5">
            <h3 className="text-[0.82rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Requisitos</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {(job.requirements ?? []).map((requirement) => (
                <span key={requirement} className="rounded-full border border-[#dbe3ee] bg-[#f8fafc] px-3 py-1 text-[0.82rem] font-semibold text-[#475569]">
                  {requirement}
                </span>
              ))}
            </div>
          </div>
        </article>

        <aside className="self-start rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Atividade</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4">
              <UsersRound size={17} className="text-accent" aria-hidden="true" />
              <span className="text-[0.86rem] font-semibold text-[#475569]">{job.applicants_count} candidaturas</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4">
              <Eye size={17} className="text-accent" aria-hidden="true" />
              <span className="text-[0.86rem] font-semibold text-[#475569]">Visualizações indisponíveis</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] p-4">
              <CalendarDays size={17} className="text-accent" aria-hidden="true" />
              <span className="text-[0.86rem] font-semibold text-[#475569]">{getResponseTimeLabel(job.response_time)}</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
