import Link from "next/link";

type Props = {
  message?: string;
};

export function DashboardAccessBlock({ message }: Props) {
  return (
    <div className="flex min-h-[calc(100svh-120px)] items-center justify-center p-6 sm:p-8">
      <section className="w-full max-w-xl rounded-xl border border-[#fecaca] bg-white p-6 text-center shadow-[0_12px_34px_rgba(15,23,42,0.06)]">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#dc2626]">
          Acesso indisponível
        </p>
        <h1 className="mt-3 font-display text-[1.45rem] font-semibold text-[#0f172a]">
          Perfil da empresa não encontrado
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] leading-relaxed text-[#667085]">
          {message ?? "Não foi possível identificar a empresa autenticada. Entra novamente ou confirma se a conta da empresa ainda existe."}
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#0f172a] px-4 text-[0.86rem] font-semibold text-white hover:bg-[#1e293b]"
          >
            Entrar novamente
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#dbe3ee] px-4 text-[0.86rem] font-semibold text-[#475569] hover:border-accent hover:text-accent"
          >
            Voltar ao início
          </Link>
        </div>
      </section>
    </div>
  );
}
