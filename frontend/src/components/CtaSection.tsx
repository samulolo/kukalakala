import { BriefcaseBusiness, FileText } from "lucide-react";

export function CtaSection() {
  return (
    <section className="bg-white py-12 sm:py-14" id="empresas">
      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] grid-cols-1 items-center gap-5 rounded-lg border border-[#e3e8ef] bg-[#0f172a] p-5 text-white md:grid-cols-[1fr_auto] md:p-6">
        <div>
          <h2 className="m-0 max-w-[680px] font-display text-[1.45rem] leading-[1.15] sm:text-[1.8rem]">
            Está a contratar?
          </h2>
          <p className="mt-2 max-w-[600px] text-[0.94rem] leading-relaxed text-white/70">
            Publique vagas, acompanhe candidatos por etapa e envie feedback sem sair do painel.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white px-4 text-[0.86rem] font-semibold text-[#0f172a] hover:bg-[#f8fafc]"
            href="/dashboard"
          >
            <BriefcaseBusiness size={16} aria-hidden="true" />
            Publicar vaga
          </a>
          <a
            className="inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-white/20 px-4 text-[0.86rem] font-semibold text-white hover:bg-white/10"
            href="/vagas"
          >
            <FileText size={16} aria-hidden="true" />
            Ver vagas
          </a>
        </div>
      </div>
    </section>
  );
}
