import { cookies } from "next/headers";
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock3,
  Sparkles,
  UserRound,
} from "lucide-react";
import { getCandidateDashboardData } from "@/lib/candidate-dashboard-api";
import { CandidateProfilePanel } from "@/components/candidate/CandidateProfilePanel";
import { CandidateApplicationsTable } from "@/components/candidate/CandidateApplicationsTable";
import { CandidateDashboardActions } from "@/components/candidate/CandidateDashboardActions";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    candidateId?: string;
    page?: string;
  }>;
};

function getInitials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export default async function CandidateDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const cookieStore = cookies();
  const authToken = cookieStore.get("kukalakala_session")?.value;
  const data = await getCandidateDashboardData({
    candidateId: params?.candidateId,
    page: params?.page ?? "1",
    authToken,
  });
  const activeCandidateId = data.candidate?.id;

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <main className="mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col gap-5 py-5 sm:py-7">
        {data.errorMessage && (
          <div className="rounded-lg border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[0.85rem] font-medium text-[#b91c1c]">
            {data.errorMessage}
          </div>
        )}

        <section className="rounded-xl border border-[#e5e7eb] bg-white p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-[0.9rem] font-bold text-white">
                {data.candidate ? getInitials(data.candidate.name) : <UserRound size={21} aria-hidden="true" />}
              </div>
              <div className="min-w-0">
                <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[#16813f]">Área do candidato</p>
                <h1 className="mt-1 truncate font-display text-[1.45rem] font-semibold leading-tight text-[#0f172a] sm:text-[1.65rem]">
                  {data.candidate?.name ?? "Candidato"}
                </h1>
                <p className="mt-1 truncate text-[0.88rem] text-[#667085]">
                  {data.candidate?.email ?? "Sessão do candidato"}
                </p>
              </div>
            </div>

            <CandidateDashboardActions />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Candidaturas", value: data.stats.total, icon: BriefcaseBusiness },
            { label: "Entrevistas", value: data.stats.interviews, icon: Clock3 },
            { label: "Aprovadas", value: data.stats.approved, icon: BadgeCheck },
            { label: "Score médio", value: `${data.stats.averageScore}%`, icon: Sparkles },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-xl border border-[#e5e7eb] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[0.82rem] font-medium text-[#667085]">{label}</p>
                <Icon size={18} className="text-accent" aria-hidden="true" />
              </div>
              <p className="mt-3 font-display text-[1.65rem] font-semibold leading-none text-[#0f172a]">{value}</p>
            </div>
          ))}
        </section>

        <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <CandidateApplicationsTable
            applications={data.applications}
            pagination={data.pagination}
            candidateId={activeCandidateId}
          />

          <CandidateProfilePanel candidateId={activeCandidateId} profile={data.profile} />
        </section>
      </main>
    </div>
  );
}
