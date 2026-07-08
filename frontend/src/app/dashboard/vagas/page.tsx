import Link from "next/link";
import { cookies } from "next/headers";
import { Plus } from "lucide-react";
import { DashboardJobPostings } from "@/components/dashboard/DashboardJobPostings";
import { getDashboardJobs } from "@/lib/dashboard-api";

export const dynamic = "force-dynamic";

type Props = {
  searchParams?: Promise<{
    page?: string;
    status?: string;
  }>;
};

export default async function DashboardJobsPage({ searchParams }: Props) {
  const params = await searchParams;
  const cookieStore = await cookies();
  const authToken = cookieStore.get("kukalakala_session")?.value;
  const status = params?.status ?? "all";
  const jobsData = await getDashboardJobs({
    page: params?.page ?? "1",
    limit: "10",
    status,
    authToken,
  });

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-[1.65rem] font-semibold text-[#0f172a]">Vagas</h1>
          <p className="mt-1 text-[0.9rem] text-[#667085]">Gere vagas reais publicadas na API.</p>
        </div>
        <Link href="/dashboard/vagas/nova" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.85rem] font-semibold text-white shadow-[0_4px_14px_rgba(23,163,74,0.3)] hover:bg-accent-dark">
          <Plus size={16} aria-hidden="true" />
          Publicar vaga
        </Link>
      </div>

      <DashboardJobPostings
        jobs={jobsData.items}
        pagination={jobsData.pagination}
        status={status}
        errorMessage={jobsData.errorMessage}
      />
    </div>
  );
}
