import { CalendarDays, Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div>
        <h1 className="font-display text-[1.65rem] font-semibold text-[#0f172a]">
          Good morning, Maya
        </h1>
        <p className="mt-1 text-[0.9rem] text-[#667085]">
          Here&apos;s what&apos;s happening with your roles today.
        </p>
      </div>
      <div className="flex flex-shrink-0 flex-wrap gap-2.5">
        <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dbe3ee] bg-white px-4 text-[0.85rem] font-semibold text-[#475569] shadow-sm">
          <CalendarDays size={15} aria-hidden="true" />
          Last 30 days
        </button>
        <a
          href="/dashboard/vagas/nova"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-accent px-4 text-[0.85rem] font-semibold text-white shadow-[0_4px_14px_rgba(23,163,74,0.3)] hover:bg-accent-dark"
        >
          <Plus size={16} aria-hidden="true" />
          Post a job
        </a>
      </div>
    </div>
  );
}
