import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, CalendarDays, Eye, MapPin } from "lucide-react";
import { ApiJob, getJobTypeLabel, getResponseTimeLabel } from "@/lib/jobs-api";
import { formatRelativeDate, getCompanyInitials } from "@/lib/vagas-utils";

type Props = {
  job: ApiJob;
  featured?: boolean;
};

export function JobCard({ job, featured = false }: Props) {
  const initials = getCompanyInitials(job.company?.name ?? job.title);
  const typeLabel = getJobTypeLabel(job.type);
  const companyName = job.company?.name ?? "Empresa não informada";
  const companySector = job.company?.sector;
  const location = job.company?.location ?? "Localização não informada";

  const applyHref = `/candidaturas/nova?job_id=${job.id}`;
  const detailsHref = `/vagas/detalhes?job_id=${job.id}`;
  const relativeDate = formatRelativeDate(job.created_at);
  const periodEnd = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(job.application_period_end));

  const tags = (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full border border-[#ccefd9] bg-[#effdf4] px-3 py-1 text-[0.78rem] font-semibold text-[#16813f]">
        {typeLabel}
      </span>
      {job.requirements?.slice(0, 2).map((req) => (
        <span
          key={req}
          className="rounded-full border border-[#dbe3ee] bg-white px-3 py-1 text-[0.78rem] font-medium text-[#475569]"
        >
          {req}
        </span>
      ))}
    </div>
  );

  return (
    <article
      className={`group rounded-2xl border bg-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_46px_rgba(15,23,42,0.08)] ${
        featured
          ? "border-[#b9dbff] shadow-[0_0_0_1px_rgba(37,87,167,0.12),0_16px_40px_rgba(37,87,167,0.08)]"
          : "border-[#dbe3ee] shadow-[0_10px_26px_rgba(15,23,42,0.035)]"
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex min-w-0 flex-1 gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#dbe3ee] bg-[#f8fafc] font-display text-[0.9rem] font-semibold text-[#2557a7]">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {featured && (
                  <span className="rounded-full border border-[#b9dbff] bg-[#eef6ff] px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-accent">
                    Destaque
                  </span>
                )}
                <span className="text-[0.78rem] font-medium text-[#94a3b8]">{relativeDate}</span>
              </div>

              <h3 className="mt-2 font-display text-[1.15rem] font-semibold leading-snug text-[#111827]">
                {job.title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.9rem] text-[#667085]">
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness size={15} aria-hidden="true" />
                  {companyName}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} aria-hidden="true" />
                  {location}
                </span>
              </div>
              {companySector && (
                <p className="mt-2 text-[0.86rem] text-[#94a3b8]">{companySector}</p>
              )}
            </div>
          </div>

          <div className="flex flex-shrink-0 flex-col gap-2.5 sm:min-w-[172px] sm:items-stretch">
            <Link
              href={detailsHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#dbe3ee] bg-[#f8fafc] px-5 font-display text-[0.88rem] font-semibold text-[#334155] transition-all hover:border-[#bfd0e5] hover:bg-white hover:text-accent hover:shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
            >
              <Eye size={15} aria-hidden="true" />
              Ver detalhes
            </Link>
            <a
              href={applyHref}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-5 font-display text-[0.88rem] font-semibold text-white shadow-[0_12px_24px_rgba(37,87,167,0.18)] transition-all hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-[0_16px_30px_rgba(37,87,167,0.24)]"
            >
              Candidatar
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </div>
        </div>

        <p className="mt-5 line-clamp-2 text-[0.95rem] leading-[1.65] text-[#475569]">
          {job.description}
        </p>

        <div className="mt-5 flex flex-col gap-4 border-t border-[#edf1f6] pt-5 lg:flex-row lg:items-center lg:justify-between">
          <div>{tags}</div>

          <div className="flex flex-wrap items-center gap-3 text-[0.84rem] text-[#667085]">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} aria-hidden="true" />
              Até {periodEnd}
            </span>
            <span>{getResponseTimeLabel(job.response_time)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
