import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  Gauge,
  ListChecks,
  Target,
  UsersRound,
} from "lucide-react";
import {
  DashboardApplication,
  DashboardJob,
  getDashboardApplications,
  getDashboardJobs,
  isDashboardIdentityError,
} from "@/lib/dashboard-api";
import { DashboardAccessBlock } from "@/components/dashboard/DashboardAccessBlock";

export const dynamic = "force-dynamic";

const stageLabels: Record<string, string> = {
  submetida: "Submetidas",
  em_analise: "Em análise",
  entrevista: "Entrevistas",
  aprovada: "Aprovadas",
  rejeitada: "Rejeitadas",
};

const stageOrder = ["submetida", "em_analise", "entrevista", "aprovada", "rejeitada"];

function percent(value: number, total: number) {
  if (!total) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function average(values: number[]) {
  if (!values.length) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function formatDecisionTime(hours: number) {
  if (!hours) {
    return "0h";
  }

  if (hours < 24) {
    return `${hours}h`;
  }

  const days = Math.round(hours / 24);
  return `${days} dia${days === 1 ? "" : "s"}`;
}

function getDecisionHours(application: DashboardApplication) {
  const decided = application.messages.length > 0 || ["entrevista", "aprovada", "rejeitada"].includes(application.stage);

  if (!decided) {
    return null;
  }

  const start = new Date(application.appliedAt).getTime();
  const end = application.messages[0]?.createdAt
    ? new Date(application.messages[0].createdAt).getTime()
    : new Date(application.updatedAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
    return null;
  }

  return Math.max(1, Math.round((end - start) / 36e5));
}

function getApplicationsForJob(applications: DashboardApplication[], jobId: string) {
  return applications.filter((application) => application.job.id === jobId);
}

function buildJobPerformance(jobs: DashboardJob[], applications: DashboardApplication[]) {
  return jobs
    .map((job) => {
      const jobApplications = getApplicationsForJob(applications, job.id);
      const scores = jobApplications.map((application) => application.ai.score).filter((score) => score > 0);
      const interviews = jobApplications.filter((application) => application.stage === "entrevista").length;
      const approved = jobApplications.filter((application) => application.stage === "aprovada").length;
      const rejected = jobApplications.filter((application) => application.stage === "rejeitada").length;

      return {
        id: job.id,
        title: job.title,
        total: jobApplications.length,
        averageScore: average(scores),
        interviewRate: percent(interviews, jobApplications.length),
        approved,
        rejected,
      };
    })
    .sort((first, second) => second.total - first.total || second.averageScore - first.averageScore);
}

export default async function DashboardMetricsPage() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("kukalakala_session")?.value;
  const [jobsData, applicationsData] = await Promise.all([
    getDashboardJobs({ page: "1", limit: "100", authToken }),
    getDashboardApplications({ page: "1", limit: "100", authToken }),
  ]);
  const errorMessage = jobsData.errorMessage ?? applicationsData.errorMessage;

  if (isDashboardIdentityError(errorMessage)) {
    return <DashboardAccessBlock message={errorMessage} />;
  }

  const jobs = jobsData.items;
  const applications = applicationsData.items;
  const totalApplications = applications.length;
  const interviews = applications.filter((application) => application.stage === "entrevista").length;
  const approved = applications.filter((application) => application.stage === "aprovada").length;
  const rejected = applications.filter((application) => application.stage === "rejeitada").length;
  const scores = applications.map((application) => application.ai.score).filter((score) => score > 0);
  const decisionTimes = applications
    .map(getDecisionHours)
    .filter((value): value is number => value !== null);
  const averageScore = average(scores);
  const averageDecisionHours = average(decisionTimes);
  const stageCounts = stageOrder.map((stage) => ({
    stage,
    label: stageLabels[stage],
    count: applications.filter((application) => application.stage === stage).length,
  }));
  const jobPerformance = buildJobPerformance(jobs, applications);
  const topCandidates = [...applications]
    .sort((first, second) => second.ai.score - first.ai.score)
    .slice(0, 6);

  const metrics = [
    {
      label: "Candidaturas",
      value: totalApplications,
      helper: `${jobs.length} vaga${jobs.length === 1 ? "" : "s"} publicadas`,
      icon: UsersRound,
    },
    {
      label: "Taxa de entrevista",
      value: `${percent(interviews, totalApplications)}%`,
      helper: `${interviews} candidato${interviews === 1 ? "" : "s"} em entrevista`,
      icon: Target,
    },
    {
      label: "Taxa de rejeição",
      value: `${percent(rejected, totalApplications)}%`,
      helper: `${rejected} candidatura${rejected === 1 ? "" : "s"} rejeitada${rejected === 1 ? "" : "s"}`,
      icon: ListChecks,
    },
    {
      label: "Score médio IA",
      value: `${averageScore}%`,
      helper: scores.length ? "Média das análises disponíveis" : "Sem scores disponíveis",
      icon: Gauge,
    },
    {
      label: "Tempo até decisão",
      value: formatDecisionTime(averageDecisionHours),
      helper: decisionTimes.length ? "Média entre aplicação e feedback" : "Sem decisões suficientes",
      icon: Clock3,
    },
    {
      label: "Aprovadas",
      value: approved,
      helper: `${percent(approved, totalApplications)}% das candidaturas`,
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-[1.65rem] font-semibold text-[#0f172a]">Métricas</h1>
          <p className="mt-1 text-[0.9rem] text-[#667085]">
            Analisa o desempenho real das vagas, candidaturas e decisões da empresa.
          </p>
        </div>
        <Link
          href="/dashboard/candidatos"
          className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-lg bg-[#0f172a] px-4 text-[0.84rem] font-semibold text-white hover:bg-[#1e293b]"
        >
          Ver candidatos
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[0.85rem] font-medium text-[#b91c1c]">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map(({ label, value, helper, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.82rem] font-medium text-[#667085]">{label}</p>
              <Icon size={18} className="text-accent" aria-hidden="true" />
            </div>
            <p className="mt-3 font-display text-[2rem] font-semibold leading-none text-[#0f172a]">{value}</p>
            <p className="mt-2 text-[0.8rem] leading-relaxed text-[#94a3b8]">{helper}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Funil de candidaturas</h2>
              <p className="mt-1 text-[0.82rem] text-[#667085]">Distribuição por etapa operacional.</p>
            </div>
            <BarChart3 size={19} className="text-accent" aria-hidden="true" />
          </div>

          <div className="mt-5 space-y-4">
            {stageCounts.map((item) => (
              <div key={item.stage}>
                <div className="flex items-center justify-between gap-3 text-[0.86rem]">
                  <span className="font-semibold text-[#0f172a]">{item.label}</span>
                  <span className="text-[#667085]">{item.count} · {percent(item.count, totalApplications)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-[#edf1f6]">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${percent(item.count, totalApplications)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="rounded-xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Candidatos mais fortes</h2>
          <div className="mt-5 space-y-3">
            {topCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href="/dashboard/candidatos"
                className="flex items-center justify-between gap-3 rounded-xl border border-[#edf1f6] bg-[#f8fafc] p-3 hover:border-accent"
              >
                <div className="min-w-0">
                  <p className="truncate text-[0.86rem] font-semibold text-[#0f172a]">{candidate.name}</p>
                  <p className="mt-0.5 truncate text-[0.76rem] text-[#667085]">{candidate.job.title}</p>
                </div>
                <span className="font-display text-[1rem] font-semibold text-[#16813f]">{candidate.ai.score}%</span>
              </Link>
            ))}

            {topCandidates.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#dbe3ee] bg-[#f8fafc] p-4 text-center text-[0.86rem] text-[#667085]">
                Ainda não há candidatos com score IA.
              </p>
            )}
          </div>
        </aside>
      </section>

      <section className="rounded-xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Desempenho por vaga</h2>
            <p className="mt-1 text-[0.82rem] text-[#667085]">
              Compara volume, score médio e avanço para entrevista.
            </p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#f8fafc] text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#64748b]">
                <th className="border-b border-[#edf1f6] px-4 py-3">Vaga</th>
                <th className="border-b border-[#edf1f6] px-4 py-3">Candidaturas</th>
                <th className="border-b border-[#edf1f6] px-4 py-3">Score médio</th>
                <th className="border-b border-[#edf1f6] px-4 py-3">Entrevista</th>
                <th className="border-b border-[#edf1f6] px-4 py-3">Aprovadas</th>
                <th className="border-b border-[#edf1f6] px-4 py-3">Rejeitadas</th>
              </tr>
            </thead>
            <tbody>
              {jobPerformance.map((job) => (
                <tr key={job.id} className="text-[0.86rem] text-[#475569]">
                  <td className="border-b border-[#edf1f6] px-4 py-4 font-semibold text-[#0f172a]">{job.title}</td>
                  <td className="border-b border-[#edf1f6] px-4 py-4">{job.total}</td>
                  <td className="border-b border-[#edf1f6] px-4 py-4">{job.averageScore}%</td>
                  <td className="border-b border-[#edf1f6] px-4 py-4">{job.interviewRate}%</td>
                  <td className="border-b border-[#edf1f6] px-4 py-4">{job.approved}</td>
                  <td className="border-b border-[#edf1f6] px-4 py-4">{job.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {jobPerformance.length === 0 && (
          <div className="py-10 text-center">
            <p className="font-display text-[1rem] font-semibold text-[#0f172a]">Ainda não existem dados suficientes</p>
            <p className="mt-1 text-[0.86rem] text-[#667085]">Publica vagas e recebe candidaturas para alimentar estas métricas.</p>
          </div>
        )}
      </section>
    </div>
  );
}
