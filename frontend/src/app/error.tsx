"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: Props) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-[#e5e7eb] bg-white p-6 text-center shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#ef4444]">Erro inesperado</p>
        <h1 className="mt-2 font-display text-[1.4rem] font-semibold text-[#0f172a]">Não foi possível carregar esta página</h1>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-[#667085]">
          {error.message || "Tenta atualizar a página ou voltar ao início."}
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-[0.84rem] font-semibold text-white hover:bg-accent-dark"
          >
            Tentar novamente
          </button>
          <Link href="/" className="inline-flex min-h-10 items-center justify-center rounded-lg border border-[#dbe3ee] px-4 text-[0.84rem] font-semibold text-[#475569] hover:border-accent hover:text-accent">
            Voltar ao início
          </Link>
        </div>
      </section>
    </main>
  );
}
