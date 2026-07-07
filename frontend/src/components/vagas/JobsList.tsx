import { ApiJob } from "@/lib/jobs-api";
import { JobCard } from "./JobCard";

type Props = {
  jobs: ApiJob[];
  errorMessage?: string;
};

export function JobsList({ jobs, errorMessage }: Props) {
  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-[#fecaca] bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <h3 className="font-display text-[1.1rem] font-semibold text-[#111827]">
          Não foi possível carregar as vagas.
        </h3>
        <p className="mt-2 text-[0.92rem] text-[#667085]">{errorMessage}</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-2xl border border-[#dbe3ee] bg-white p-8 text-center shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
        <h3 className="font-display text-[1.2rem] font-semibold text-[#111827]">
          Nenhuma vaga encontrada.
        </h3>
        <p className="mx-auto mt-2 max-w-[440px] text-[0.92rem] leading-[1.6] text-[#667085]">
          Ajusta os filtros ou remove a pesquisa atual para veres mais oportunidades disponíveis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {jobs.map((job, index) => (
        <JobCard key={job.id} job={job} featured={index === 0} />
      ))}
    </div>
  );
}
