import { pipeline, steps } from "@/lib/home-data";

export function ProcessSection() {
  return (
    <section className="border-y border-line bg-white py-12 sm:py-14" id="processo">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] grid-cols-1 gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-6">
            <h2 className="m-0 max-w-[540px] font-display text-[clamp(1.55rem,3vw,2.25rem)] leading-[1.1]">
              Como funciona
            </h2>
          </div>
          <div className="grid gap-1">
            {steps.map((step, index) => (
              <div className="grid grid-cols-[34px_1fr] gap-3 border-b border-line py-4 last:border-b-0" key={step.title}>
                <div className="pt-0.5 text-[0.85rem] font-semibold text-accent">
                  0{index + 1}
                </div>
                <div>
                  <h3 className="mb-1 mt-0 text-[0.98rem] font-semibold text-[#0f172a]">{step.title}</h3>
                  <p className="m-0 text-[0.9rem] leading-[1.55] text-muted">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="rounded-lg border border-line bg-[#f8fafc] p-4"
          aria-label="Prévia do painel de recrutamento"
        >
          <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
            <strong className="text-[0.95rem] text-[#0f172a]">Pipeline da empresa</strong>
            <div className="text-[0.82rem] text-muted">
              Candidaturas reais por etapa
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            {pipeline.map((lane) => (
              <div className="rounded-lg border border-line bg-white p-3" key={lane.title}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="m-0 text-[0.82rem] font-semibold text-[#526672]">{lane.title}</h4>
                  <span className="text-[0.78rem] text-muted">{lane.candidates.length}</span>
                </div>
                {lane.candidates.map((candidate) => {
                  const [name, details] = candidate.split(" | ");

                  return (
                    <div className="mb-2 rounded-md border border-line bg-[#fbfdfc] p-2.5 last:mb-0" key={candidate}>
                      <strong className="block text-[0.86rem] text-[#0f172a]">{name}</strong>
                      <span className="mt-1 block text-[0.76rem] leading-[1.35] text-muted">{details}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
