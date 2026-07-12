import Link from "next/link";
import { ArrowRight, BadgeCheck, BriefcaseBusiness, UserRound } from "lucide-react";

type Props = {
  searchParams?: Promise<{
    type?: string;
  }>;
};

export default async function MailConfirmationSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const isCompany = params?.type === "company";
  const loginType = isCompany ? "company" : "candidate";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#f5f6f8] px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-md bg-accent text-[0.72rem] font-black text-white">
          K
        </span>
        <span className="font-display text-[0.95rem] font-bold tracking-tight text-[#0f172a]">
          kukalakala<span className="text-accent">.</span>
        </span>
      </Link>

      <section className="w-full max-w-[460px] rounded-2xl border border-[#e4e7ec] bg-white p-8 text-center shadow-[0_2px_16px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#effdf4] text-accent">
          <BadgeCheck size={29} aria-hidden="true" />
        </div>

        <p className="mt-6 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#16813f]">
          Email confirmado
        </p>

        <h1 className="mt-2 font-display text-[1.55rem] font-bold tracking-tight text-[#0f172a]">
          A sua conta já está ativa
        </h1>

        <p className="mt-3 text-[0.9rem] leading-relaxed text-[#667085]">
          Obrigado por confirmar o email. Agora já pode iniciar sessão e continuar a configurar a sua conta na Kukalakala.
        </p>

        <div className="mt-6 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-4 py-4 text-left">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white text-accent">
              {isCompany ? <BriefcaseBusiness size={17} aria-hidden="true" /> : <UserRound size={17} aria-hidden="true" />}
            </span>
            <div>
              <p className="text-[0.84rem] font-semibold text-[#0f172a]">
                {isCompany ? "Próximo passo da empresa" : "Próximo passo do candidato"}
              </p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-[#667085]">
                {isCompany
                  ? "Entre na dashboard para publicar vagas, acompanhar candidatos e gerir o pipeline."
                  : "Entre na sua área para completar o perfil, adicionar o currículo e candidatar-se a vagas."}
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/login?type=${loginType}`}
          className="mt-6 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 text-[0.88rem] font-semibold text-white transition hover:bg-accent-dark"
        >
          Iniciar sessão
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>

      <p className="mt-6 text-center text-[0.72rem] text-[#9ca3af]">
        Kukalakala · Conta verificada com segurança.
      </p>
    </main>
  );
}
