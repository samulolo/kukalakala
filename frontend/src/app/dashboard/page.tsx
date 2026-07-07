import { cookies } from "next/headers";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsRow } from "@/components/dashboard/StatsRow";
import { ApplicantsChart } from "@/components/dashboard/ApplicantsChart";
import { HiringPipeline } from "@/components/dashboard/HiringPipeline";
import { ActivePostings } from "@/components/dashboard/ActivePostings";
import { RecentApplicants } from "@/components/dashboard/RecentApplicants";
import { getDashboardOverview } from "@/lib/dashboard-api";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authToken = cookies().get("kukalakala_session")?.value;
  const overview = await getDashboardOverview(authToken);

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <DashboardHeader />
      {overview.errorMessage && (
        <div className="rounded-lg border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-[0.85rem] font-medium text-[#b91c1c]">
          {overview.errorMessage}
        </div>
      )}
      <StatsRow
        stats={{
          activeJobs: overview.activeJobs,
          newApplicants: overview.newApplicants,
          interviews: overview.interviews,
          averageScore: overview.averageScore,
        }}
      />

      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <ApplicantsChart data={overview.applicantsTrend} />
        <HiringPipeline stages={overview.pipeline} />
      </div>

      <ActivePostings jobs={overview.jobs} />
      <RecentApplicants applications={overview.applications} total={overview.newApplicants} />
    </div>
  );
}
