type Props = {
  stats: {
    activeJobs: number;
    newApplicants: number;
    interviews: number;
    averageScore: number;
  };
};

export function StatsRow({ stats }: Props) {
  const items = [
    { label: "Vagas ativas", value: String(stats.activeJobs), delta: "Atual", positive: true },
    { label: "Candidaturas", value: String(stats.newApplicants), delta: "Total", positive: true },
    { label: "Entrevistas", value: String(stats.interviews), delta: "Status", positive: true },
    { label: "Score médio IA", value: `${stats.averageScore}%`, delta: "Match", positive: stats.averageScore >= 50 },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, delta, positive }) => (
        <div
          key={label}
          className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]"
        >
          <p className="text-[0.82rem] font-medium text-[#667085]">{label}</p>
          <div className="mt-3 flex items-end justify-between gap-2">
            <span className="font-display text-[2rem] font-semibold leading-none text-[#0f172a]">
              {value}
            </span>
            <span
              className={`mb-0.5 rounded-full px-2.5 py-1 text-[0.75rem] font-semibold ${
                positive
                  ? "bg-[#effdf4] text-[#16813f]"
                  : "bg-[#fff1f2] text-[#e11d48]"
              }`}
            >
              {delta}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
