
import Link from "next/link";
import { ArrowLeft, MailCheck, RefreshCw } from "lucide-react";

type Props = {
  searchParams?: Promise<{
    email?: string;
    type?: string;
  }>;
};

export default async function MailConfirmationPage({ searchParams }: Props) {
  const params = await searchParams;
  const email = params?.email;
  const loginType = params?.type === "company" ? "company" : "candidate";
  const accountType = loginType === "company" ? "empresa" : "candidato";

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
          <MailCheck size={28} aria-hidden="true" />
        </div>

        <p className="mt-6 text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#16813f]">
          Verifique o seu email
        </p>

        <h1 className="mt-2 font-display text-[1.55rem] font-bold tracking-tight text-[#0f172a]">
          Enviámos um link de confirmação
        </h1>

        <p className="mt-3 text-[0.9rem] leading-relaxed text-[#667085]">
          A conta de {accountType} foi criada. Para ativar o acesso, abra o email que enviámos e clique no link de verificação.
        </p>

        {email && (
          <p className="mt-4 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-4 py-3 text-[0.88rem] font-semibold text-[#0f172a]">
            {email}
          </p>
        )}

        <div className="mt-6 rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-4 py-4 text-left">
          <p className="text-[0.82rem] font-semibold text-[#0f172a]">Não encontrou o email?</p>
          <p className="mt-1 text-[0.8rem] leading-relaxed text-[#667085]">
            Veja a caixa de spam, promoções ou lixo eletrónico. O envio pode demorar alguns minutos.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/login?type=${loginType}`}
            className="inline-flex min-h-10 flex-1 items-center justify-center rounded-xl bg-accent px-4 text-[0.88rem] font-semibold text-white transition hover:bg-accent-dark"
          >
            Ir para login
          </Link>
          <Link
            href="/registo"
            className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-[#e4e7ec] px-4 text-[0.88rem] font-semibold text-[#374151] transition hover:bg-[#f9fafb]"
          >
            <RefreshCw size={15} aria-hidden="true" />
            Recomeçar
          </Link>
        </div>
      </section>

      <Link href="/" className="mt-6 inline-flex items-center gap-2 text-[0.82rem] font-semibold text-[#667085] hover:text-accent">
        <ArrowLeft size={15} aria-hidden="true" />
        Voltar para a página inicial
      </Link>
    </main>
  );
}
