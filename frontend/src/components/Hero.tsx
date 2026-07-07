import { Header } from "./Header";
import SearchForm from "./ui/SearchForm";

const popularTags = ["Backend", "Remoto", "Frontend", "Operações", "Atendimento"];

export function Hero() {
  return (
    <header className="relative overflow-hidden border-b border-[#e3e8ef] bg-white">
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.055)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.7),rgba(0,0,0,0.24)_72%,transparent)]"
        aria-hidden="true"
      />

      <div className="relative z-10">
        <Header />
      </div>

      <div className="relative z-10 mx-auto flex w-[min(1180px,calc(100%-32px))] flex-col items-center py-12 text-center sm:py-16 lg:py-20">
        <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-accent">
          Kukalakala
        </p>
        <h1 className="mt-3 max-w-[720px] font-display text-[clamp(2rem,4vw,3.35rem)] leading-[1.08] text-[#0f172a]">
          Vagas abertas, candidatura simples e resposta acompanhada.
        </h1>
        <p className="mt-4 max-w-[560px] text-[1rem] leading-[1.65] text-[#64748b]">
          Procura uma vaga, candidata com o teu perfil e acompanha o estado do processo.
        </p>

        <SearchForm />

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 text-[0.86rem]">
          <span className="text-[#94a3b8]">Pesquisas comuns:</span>
          {popularTags.map((tag) => (
            <a
              key={tag}
              href={`/vagas?q=${encodeURIComponent(tag)}`}
              className="rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-[#475569] transition-colors hover:border-[#bbf7d0] hover:text-[#16a34a]"
            >
              {tag}
            </a>
          ))}
        </div>

        <div className="mt-8 grid w-full max-w-[760px] grid-cols-1 divide-y divide-[#e3e8ef] border-y border-[#e3e8ef] bg-white/70 text-[0.9rem] text-[#475569] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="py-3 sm:pr-5">
            <strong className="block text-[#0f172a]">Perfil e CV</strong>
            Candidatura com dados editáveis.
          </div>
          <div className="py-3 sm:px-5">
            <strong className="block text-[#0f172a]">Score IA</strong>
            Comparação com os requisitos.
          </div>
          <div className="py-3 sm:pl-5">
            <strong className="block text-[#0f172a]">Feedback</strong>
            Mensagens no painel e por email.
          </div>
        </div>
      </div>
    </header>
  );
}
