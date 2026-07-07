import { MoreHorizontal } from "lucide-react";
import { DashboardJob, getDashboardJobMeta } from "@/lib/dashboard-api";
import { formatRelativeDate } from "@/lib/vagas-utils";

const statusStyles: Record<string, { dot: string; text: string }> = {
  Ativa: { dot: "bg-accent", text: "text-[#16813f]" },
  Inativa: { dot: "bg-slate-300", text: "text-slate-400" },
};

type Props = {
  jobs: DashboardJob[];
};

export function ActivePostings({ jobs }: Props) {
  return (
    <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Vagas ativas</h2>
        <a href="/dashboard/vagas" className="text-[0.82rem] font-semibold text-accent hover:text-accent-dark">
          Gerir todas →
        </a>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#f1f5f9]">
              {["Vaga", "Status", "Candidaturas", "Visualizações", "Publicada"].map((h, i) => (
                <th
                  key={h}
                  className={`pb-2.5 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#94a3b8] ${i >= 2 ? "text-right" : ""}`}
                >
                  {h}
                </th>
              ))}
              <th />
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const status = job.is_active ? "Ativa" : "Inativa";
              const s = statusStyles[status];
              return (
                <tr key={job.id} className="border-b border-[#f8fafc] last:border-0">
                  <td className="py-3.5 pr-4">
                    <p className="text-[0.88rem] font-semibold text-[#0f172a]">{job.title}</p>
                    <p className="mt-0.5 text-[0.78rem] text-[#94a3b8]">{getDashboardJobMeta(job)}</p>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`inline-flex items-center gap-1.5 text-[0.82rem] font-semibold ${s.text}`}>
                      <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                      {status}
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 text-right text-[0.88rem] font-semibold text-[#0f172a]">
                    {job.applicants_count}
                  </td>
                  <td className="py-3.5 pr-4 text-right text-[0.88rem] font-medium text-[#64748b]">
                    -
                  </td>
                  <td className="py-3.5 text-right text-[0.82rem] font-medium text-[#64748b]">
                    {formatRelativeDate(job.created_at)}
                  </td>
                  <td className="py-3.5 pl-3">
                    <button className="text-[#cbd5e1] hover:text-[#64748b]" aria-label="More options">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {jobs.length === 0 && (
        <div className="py-8 text-center text-[0.88rem] text-[#667085]">
          Nenhuma vaga ativa encontrada.
        </div>
      )}
    </div>
  );
}
