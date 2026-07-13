import { cookies } from "next/headers";
import { CandidateApplications } from "@/components/dashboard/CandidateApplications";
import { getDashboardApplications } from "@/lib/dashboard-api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    page?: string;
    status?: string;
  }>;
};

export default async function DashboardCandidatesPage({ searchParams }: Props) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("kukalakala_session")?.value;
  const applicationsData = await getDashboardApplications({
    page: params?.page ?? "1",
    limit: "10",
    status: params?.status,
    authToken,
  });

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <h1 className="font-display text-[1.65rem] font-semibold text-[#0f172a]">Candidatos</h1>
        <p className="mt-1 text-[0.9rem] text-[#667085]">
          Revê candidaturas reais com score, análise da IA e status do processo.
        </p>
      </div>

      <CandidateApplications
        applications={applicationsData.items}
        pagination={applicationsData.pagination}
        status={params?.status ?? "all"}
        errorMessage={applicationsData.errorMessage}
      />
    </div>
  );
}
