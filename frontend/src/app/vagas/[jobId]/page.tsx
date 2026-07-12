import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { ApplyToJobButton } from "@/components/vagas/ApplyToJobButton";
import { getJobById, getJobTypeLabel, getResponseTimeLabel } from "@/lib/jobs-api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    jobId: string;
  }>;
};

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(dateValue: string | null | undefined) {
  if (!dateValue) {
    return "Data não informada";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Data não informada";
  }

  return dateFormatter.format(date);
}

export default async function JobDetailsPage({ params }: Props) {
  const { jobId } = await params;
  const job = await getJobById(jobId).catch(() => null);

  if (!job) {
    notFound();
  }

  const companyName = job.company?.name ?? "Empresa não informada";
  const companySector = job.company?.sector ?? "Setor não informado";
  const location = job.company?.location ?? "Localização não informada";
  const createdAt = formatDate(job.created_at);
  const applicationStart = formatDate(job.application_period_start);
  const applicationEnd = formatDate(job.application_period_end);

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <main className="mx-auto w-[min(1180px,calc(100%-32px))] py-6 sm:py-8">
        <a
          href="/vagas"
          className="inline-flex items-center gap-2 text-[0.88rem] font-semibold text-[#667085] hover:text-accent"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para vagas
        </a>

        <section className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <article className="rounded-2xl border border-[#dbe3ee] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#ccefd9] bg-[#effdf4] px-3 py-1 text-[0.78rem] font-semibold text-[#16813f]">
                {getJobTypeLabel(job.type)}
              </span>
              <span className="rounded-full border border-[#dbe3ee] bg-[#f8fafc] px-3 py-1 text-[0.78rem] font-semibold text-[#475569]">
                {job.is_active ? "Vaga ativa" : "Vaga inativa"}
              </span>
              <span className="text-[0.86rem] font-medium text-[#94a3b8]">
                Publicada em {createdAt}
              </span>
            </div>

            <h1 className="mt-4 max-w-[760px] font-display text-[clamp(1.65rem,3vw,2.35rem)] font-semibold leading-[1.12] text-[#111827]">
              {job.title}
            </h1>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[0.92rem] text-[#667085]">
              <span className="inline-flex items-center gap-2">
                <BriefcaseBusiness size={17} aria-hidden="true" />
                {companyName}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={17} aria-hidden="true" />
                {location}
              </span>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
                  Modalidade
                </p>
                <p className="mt-2 font-semibold text-[#111827]">{getJobTypeLabel(job.type)}</p>
              </div>
              <div className="rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
                  Resposta
                </p>
                <p className="mt-2 font-semibold text-[#111827]">{getResponseTimeLabel(job.response_time)}</p>
              </div>
              <div className="rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-4">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
                  Candidaturas
                </p>
                <p className="mt-2 font-semibold text-[#111827]">Até {applicationEnd}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-[#edf1f6] pt-6">
              <h2 className="font-display text-[1.05rem] font-semibold text-[#111827]">
                Descrição da vaga
              </h2>
              <p className="mt-3 whitespace-pre-line text-[0.94rem] leading-[1.75] text-[#475569]">
                {job.description}
              </p>
            </div>

            <div className="mt-6 border-t border-[#edf1f6] pt-6">
              <h2 className="font-display text-[1.05rem] font-semibold text-[#111827]">
                Requisitos
              </h2>
              {job.requirements && job.requirements.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {job.requirements.map((requirement) => (
                    <div
                      key={requirement}
                      className="flex items-center gap-3 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-4 py-3 text-[0.88rem] font-semibold text-[#475569]"
                    >
                      <CheckCircle2 size={17} className="text-[#16813f]" aria-hidden="true" />
                      {requirement}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[0.9rem] text-[#667085]">Requisitos não informados.</p>
              )}
            </div>

            <div className="mt-6 border-t border-[#edf1f6] pt-6">
              <h2 className="font-display text-[1.05rem] font-semibold text-[#111827]">
                Sobre a empresa
              </h2>
              <div className="mt-4 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] p-4">
                <p className="font-display text-[0.98rem] font-semibold text-[#111827]">{companyName}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[0.88rem] text-[#667085]">
                  <span>{companySector}</span>
                  <span>{location}</span>
                </div>
              </div>
            </div>
          </article>

          <aside className="self-start rounded-2xl border border-[#dbe3ee] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] lg:sticky lg:top-6">
            <ApplyToJobButton jobId={job.id} />

            <div className="mt-5 rounded-2xl border border-[#edf1f6] bg-[#f8fafc] p-4">
              <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">
                Resumo da vaga
              </p>
              <p className="mt-2 font-display text-[0.98rem] font-semibold leading-snug text-[#111827]">
                {job.title}
              </p>
              <p className="mt-2 text-[0.9rem] text-[#667085]">{companyName}</p>
            </div>

            <div className="mt-4 divide-y divide-[#edf1f6] rounded-2xl border border-[#edf1f6]">
              <div className="p-4">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Empresa</p>
                <p className="mt-1 font-semibold text-[#111827]">{companyName}</p>
                <p className="mt-1 text-[0.88rem] text-[#667085]">{companySector}</p>
              </div>
              <div className="p-4">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Localização</p>
                <p className="mt-1 flex items-start gap-2 text-[0.9rem] leading-relaxed text-[#475569]">
                  <MapPin className="mt-0.5 flex-shrink-0" size={16} aria-hidden="true" />
                  <span className="min-w-0 break-words">{location}</span>
                </p>
              </div>
              <div className="p-4">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Período</p>
                <p className="mt-1 flex items-start gap-2 text-[0.9rem] leading-relaxed text-[#475569]">
                  <CalendarDays className="mt-0.5 flex-shrink-0" size={16} aria-hidden="true" />
                  <span className="min-w-0 break-words">
                    {applicationStart} - {applicationEnd}
                  </span>
                </p>
              </div>
              <div className="p-4">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Resposta</p>
                <p className="mt-1 flex items-start gap-2 text-[0.9rem] leading-relaxed text-[#475569]">
                  <Clock3 className="mt-0.5 flex-shrink-0" size={16} aria-hidden="true" />
                  <span className="min-w-0 break-words">{getResponseTimeLabel(job.response_time)}</span>
                </p>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
