export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#102033] bg-[#07111f] text-white">
      <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-10 sm:py-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.2fr)_minmax(150px,0.45fr)_minmax(150px,0.45fr)]">
          <div className="max-w-[460px]">
            <a
              className="inline-flex items-center gap-3 font-display text-[1.05rem] font-semibold"
              href="/"
              aria-label="Kukalakala - página inicial pelo footer"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent font-black text-white shadow-[0_8px_20px_rgba(23,163,74,0.22)]">
                K
              </span>
              <span>Kukalakala</span>
            </a>
            <p className="mt-4 text-[0.92rem] leading-[1.7] text-white/64">
              Plataforma para candidatos encontrarem oportunidades e empresas acompanharem processos de recrutamento com clareza.
            </p>
          </div>

          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-white/40">
              Plataforma
            </p>
            <div className="mt-4 flex flex-col items-start gap-3 text-[0.9rem] text-white/68">
              <a className="inline-flex w-fit transition-colors hover:text-white" href="/vagas">Vagas</a>
              <a className="inline-flex w-fit transition-colors hover:text-white" href="/#empresas">Empresas</a>
              <a className="inline-flex w-fit transition-colors hover:text-white" href="/#processo">Processo</a>
            </div>
          </div>

          <div>
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-white/40">
              Acesso rápido
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[0.86rem] text-white/72 md:flex-col md:items-start">
              <a
                className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                href="/vagas?type=remote"
              >
                Remotas
              </a>
              <a
                className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                href="/vagas?type=hybrid"
              >
                Híbridas
              </a>
              <a
                className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                href="/vagas?type=on_site"
              >
                Presenciais
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-[0.84rem] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Kukalakala. Todos os direitos reservados.</span>
          <span>Recrutamento com menos ruído.</span>
        </div>
      </div>
    </footer>
  );
}
