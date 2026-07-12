import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JobsList } from "@/components/vagas/JobsList";
import { JobsFilters } from "@/components/vagas/JobsFilters";
import { JobsHeader } from "@/components/vagas/JobsHeader";
import { ActiveFilters } from "@/components/vagas/ActiveFilters";
import { JobsPagination } from "@/components/vagas/JobsPagination";
import { getPublicJobs, JobsQuery } from "@/lib/jobs-api";
import { getFriendlyErrorMessage } from "@/lib/friendly-error";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: JobsQuery;
};

export default async function JobsPage({ searchParams }: Props) {
  const result = await getPublicJobs(searchParams).catch((error) => ({
    items: [],
    pagination: { page: 1, limit: 5, total: 0, pages: 0 },
    errorMessage: getFriendlyErrorMessage(error, "Não conseguimos carregar as vagas agora. Tenta novamente dentro de instantes."),
  }));
  const requestedPage = Number(searchParams.page ?? "1");

  if (
    result.pagination.total > 0 &&
    Number.isFinite(requestedPage) &&
    requestedPage > result.pagination.pages
  ) {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(searchParams).filter(([, value]) => value !== undefined)
      ) as Record<string, string>
    );
    params.set("page", String(result.pagination.pages));
    params.set("limit", searchParams.limit ?? String(result.pagination.limit));
    redirect(`/vagas?${params.toString()}`);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fb]">
      <Header />
      <section className="border-b border-soft-line bg-white">
        <div className="mx-auto w-[min(1180px,calc(100%-32px))] py-6 sm:py-7">
          <p className="font-mono text-[0.75rem] font-semibold uppercase tracking-[0.12em] text-[#16813f]">
            Oportunidades abertas
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[720px]">
              <h1 className="font-display text-[clamp(1.65rem,3vw,2.4rem)] font-semibold leading-[1.12] text-[#111827]">
                Encontra a próxima vaga com menos ruído.
              </h1>
              <p className="mt-3 max-w-[620px] text-[0.94rem] leading-[1.65] text-[#667085]">
                Pesquisa por cargo, empresa ou modalidade e acompanha apenas vagas ativas no período de candidatura.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <div className="rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-4 py-3">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Resultados</p>
                <p className="mt-1 font-display text-xl font-semibold text-[#111827]">{result.pagination.total}</p>
              </div>
              <div className="rounded-xl border border-[#dbe3ee] bg-[#f8fafc] px-4 py-3">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Página</p>
                <p className="mt-1 font-display text-xl font-semibold text-[#111827]">
                  {result.pagination.page}/{Math.max(result.pagination.pages, 1)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-[min(1180px,calc(100%-32px))] flex-1 py-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
          <aside className="hidden self-start lg:sticky lg:top-6 lg:block lg:max-h-[calc(100svh-48px)] lg:overflow-y-auto">
            <JobsFilters searchParams={searchParams} />
          </aside>

          <main className="min-w-0 flex-1">
            <div className="mb-4 flex items-center gap-3 lg:hidden">
              <JobsFilters searchParams={searchParams} />
            </div>

            <JobsHeader
              query={searchParams.q ?? ""}
              total={result.pagination.total}
              searchParams={searchParams}
            />

            <ActiveFilters searchParams={searchParams} />

            <div className="mt-4">
              <JobsList
                jobs={result.items}
                errorMessage={"errorMessage" in result ? result.errorMessage : undefined}
              />
            </div>

            <JobsPagination pagination={result.pagination} searchParams={searchParams} />
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
