import {
  ApiJob,
  getJobTypeLabel,
  getResponseTimeLabel,
  getWorkplaceLabel,
  Pagination,
} from "@/lib/jobs-api";

type JobsSectionProps = {
  jobs: ApiJob[];
  pagination?: Pagination;
  errorMessage?: string;
};

export function JobsSection({ jobs = [], pagination, errorMessage }: JobsSectionProps) {
  return (
    <section className="bg-[#f8fafc] py-12 sm:py-14" id="vagas">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))]">
        <div className="mb-5 flex flex-col items-start justify-between gap-3 md:flex-row md:items-end">
          <h2 className="m-0 max-w-[680px] font-display text-[clamp(1.55rem,3vw,2.25rem)] leading-[1.1]">
            Vagas abertas
          </h2>
          <p className="m-0 max-w-[390px] text-[0.92rem] leading-relaxed text-muted">
            {pagination
              ? `${pagination.total} vaga${pagination.total === 1 ? "" : "s"} encontrada${
                  pagination.total === 1 ? "" : "s"
                }.`
              : "Explore oportunidades por tipo de trabalho, empresa e competências."}
          </p>
        </div>

        {jobs.length > 0 ? (
          <div className="divide-y divide-[#e3e8ef] rounded-lg border border-[#e3e8ef] bg-white">
            {jobs.map((job) => (
              <article
                className="grid gap-4 p-4 transition-colors hover:bg-[#fbfdfc] md:grid-cols-[minmax(0,1fr)_180px] md:items-center md:p-5"
                key={job.id}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-muted">
                    <strong className="text-[#0f172a]">{job.company?.name ?? "Empresa não informada"}</strong>
                    <span>{getWorkplaceLabel(job)}</span>
                    <span>{getResponseTimeLabel(job.response_time)}</span>
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.74rem] font-semibold text-accent-dark">
                      {getJobTypeLabel(job.type)}
                    </span>
                  </div>
                  <h3 className="mb-1 mt-2 font-display text-[1.1rem] leading-[1.2] text-[#0f172a]">{job.title}</h3>
                  <p className="m-0 line-clamp-2 text-[0.9rem] leading-[1.55] text-muted">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(job.requirements && job.requirements.length > 0 ? job.requirements.slice(0, 4) : ["Sem requisitos listados"]).map((requirement) => (
                      <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[0.78rem] text-[#41515b]" key={requirement}>
                        {requirement}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:items-end md:justify-end">
                  <a
                    className="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-lg border border-line bg-white px-4 text-[0.84rem] font-semibold text-[#475569] hover:border-accent hover:text-accent md:w-auto"
                    href={`/vagas/detalhes?job_id=${job.id}`}
                  >
                    Ver detalhes
                  </a>
                  <a
                    className="inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-lg bg-[#0f172a] px-4 text-[0.84rem] font-semibold text-white hover:bg-[#1e293b] md:w-auto"
                    href={`/candidaturas/nova?job_id=${job.id}`}
                  >
                    Candidatar-se
                  </a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-line bg-white p-[34px]">
            <h3 className="m-0 font-display">{errorMessage ? "Não foi possível carregar as vagas." : "Nenhuma vaga encontrada."}</h3>
            <p className="mt-2.5 max-w-[560px] leading-[1.55] text-muted">
              {errorMessage ??
                "Tenta ajustar os filtros ou verifica se existem vagas ativas dentro do período de candidatura."}
            </p>
          </div>
        )}

        {pagination && pagination.pages > 1 ? (
          <div className="mt-6 flex items-center justify-between gap-4 text-muted">
            <span>
              Página {pagination.page} de {pagination.pages}
            </span>
            <div className="flex gap-2.5">
              {pagination.page > 1 ? (
                <a
                  className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-line bg-white px-3.5 font-extrabold text-accent"
                  href={`/vagas?page=${pagination.page - 1}`}
                >
                  Anterior
                </a>
              ) : null}
              {pagination.page < pagination.pages ? (
                <a
                  className="inline-flex min-h-[38px] items-center justify-center rounded-lg border border-line bg-white px-3.5 font-extrabold text-accent"
                  href={`/vagas?page=${pagination.page + 1}`}
                >
                  Próxima
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
