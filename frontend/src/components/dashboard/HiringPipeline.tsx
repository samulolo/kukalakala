type Props = {
  stages: {
    status: string;
    label: string;
    value: number;
    percentage: number;
  }[];
};

const barStyles: Record<string, string> = {
  submetida: "bg-[#2557a7]",
  em_analise: "bg-[#0f172a]",
  entrevista: "bg-accent",
  aprovada: "bg-[#16813f]",
  rejeitada: "bg-[#94a3b8]",
};

export function HiringPipeline({ stages }: Props) {
  const total = stages.reduce((sum, stage) => sum + stage.value, 0);

  return (
    <div className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Pipeline de contratação</h2>
          <p className="mt-1 text-[0.82rem] text-[#667085]">Distribuição real por etapa.</p>
        </div>
        <span className="rounded-full bg-[#f8fafc] px-2.5 py-1 text-[0.74rem] font-semibold text-[#475569]">
          {total} total
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-5">
        {stages.map(({ status, label, value, percentage }) => (
          <div key={status}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[0.85rem] text-[#475569]">{label}</span>
              <span className="text-[0.85rem] font-semibold text-[#0f172a]">
                {value} · {percentage}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#f1f5f9]">
              <div className={`h-full rounded-full ${barStyles[status] ?? "bg-accent"}`} style={{ width: `${percentage}%` }} />
            </div>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="mt-5 rounded-lg bg-[#f8fafc] px-3 py-2 text-[0.82rem] text-[#667085]">
          Ainda não há candidaturas para alimentar o pipeline.
        </p>
      )}
    </div>
  );
}
