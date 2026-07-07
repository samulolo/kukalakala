import Link from "next/link";
import { DashboardApplication } from "@/lib/dashboard-api";

type Props = {
  applications: DashboardApplication[];
  total: number;
};

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase();
}

export function RecentApplicants({ applications, total }: Props) {
  return (
    <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Candidaturas recentes</h2>
        <a href="/dashboard/candidatos" className="text-[0.82rem] font-semibold text-accent hover:text-accent-dark">
          Ver todas {total} →
        </a>
      </div>

      <div className="mt-4 flex flex-col divide-y divide-[#f8fafc]">
        {applications.map((application) => (
          <div key={application.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#eef6ff] text-[0.72rem] font-bold text-[#2557a7]"
            >
              {initials(application.name)}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[0.88rem] font-semibold text-[#0f172a]">{application.name}</p>
              <p className="mt-0.5 truncate text-[0.78rem] text-[#94a3b8]">{application.role}</p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-3">
              <span className="text-[0.82rem] font-semibold text-accent">{application.match}% match</span>
              <span className="hidden text-[0.78rem] text-[#94a3b8] sm:block">{application.applied}</span>
            </div>

            <Link href="/dashboard/candidatos" className="flex-shrink-0 rounded-lg bg-[#0f172a] px-3.5 py-2 text-[0.78rem] font-semibold text-white hover:bg-[#1e293b]">
              Rever
            </Link>
          </div>
        ))}
      </div>
      {applications.length === 0 && (
        <div className="py-8 text-center text-[0.88rem] text-[#667085]">
          Nenhuma candidatura recente encontrada.
        </div>
      )}
    </div>
  );
}
