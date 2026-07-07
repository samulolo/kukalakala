import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fb] px-4 py-12">
      <section className="w-full max-w-md rounded-xl border border-[#e5e7eb] bg-white p-6 text-center shadow-[0_8px_28px_rgba(15,23,42,0.06)]">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">404</p>
        <h1 className="mt-2 font-display text-[1.4rem] font-semibold text-[#0f172a]">Página não encontrada</h1>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-[#667085]">
          O endereço pode ter mudado ou já não estar disponível.
        </p>
        <Link href="/" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 text-[0.84rem] font-semibold text-white hover:bg-accent-dark">
          Voltar ao início
        </Link>
      </section>
    </main>
  );
}
