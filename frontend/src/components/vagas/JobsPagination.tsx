import { ChevronLeft, ChevronRight } from "lucide-react";
import { Pagination, JobsQuery } from "@/lib/jobs-api";

type Props = {
  pagination: Pagination;
  searchParams: JobsQuery;
};

function buildUrl(searchParams: JobsQuery, page: number): string {
  const params = new URLSearchParams(
    Object.fromEntries(
      Object.entries(searchParams).filter(([, v]) => v !== undefined)
    ) as Record<string, string>
  );
  params.set("page", String(page));
  params.set("limit", searchParams.limit ?? String(5));
  return `/vagas?${params.toString()}`;
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const pages = new Set<number>([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

export function JobsPagination({ pagination, searchParams }: Props) {
  if (pagination.pages <= 1) return null;

  const visiblePages = getVisiblePages(pagination.page, pagination.pages);
  const firstItem = (pagination.page - 1) * pagination.limit + 1;
  const lastItem = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <nav
      className="mt-6 flex flex-col gap-4 rounded-2xl border border-[#dbe3ee] bg-white px-4 py-3 text-[0.88rem] text-[#667085] shadow-[0_12px_30px_rgba(15,23,42,0.04)] sm:flex-row sm:items-center sm:justify-between"
      aria-label="Paginação de vagas"
    >
      <span className="font-medium">
        A mostrar {firstItem}-{lastItem} de {pagination.total} vagas
      </span>

      <div className="flex flex-wrap items-center gap-2">
        {pagination.page > 1 && (
          <a
            href={buildUrl(searchParams, pagination.page - 1)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#dbe3ee] bg-white px-3 font-semibold text-[#334155] transition-colors hover:border-accent hover:text-accent"
          >
            <ChevronLeft size={16} aria-hidden="true" />
            Anterior
          </a>
        )}

        <div className="flex items-center gap-1">
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1];
            const hasGap = previousPage && page - previousPage > 1;
            const isCurrent = page === pagination.page;

            return (
              <div className="flex items-center gap-1" key={page}>
                {hasGap && <span className="px-1 text-[#94a3b8]">...</span>}
                <a
                  href={buildUrl(searchParams, page)}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-full px-3 font-semibold transition-colors ${
                    isCurrent
                      ? "bg-accent text-white shadow-[0_10px_22px_rgba(37,87,167,0.2)]"
                      : "border border-[#dbe3ee] bg-white text-[#334155] hover:border-accent hover:text-accent"
                  }`}
                >
                  {page}
                </a>
              </div>
            );
          })}
        </div>

        {pagination.page < pagination.pages && (
          <a
            href={buildUrl(searchParams, pagination.page + 1)}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-[#dbe3ee] bg-white px-3 font-semibold text-[#334155] transition-colors hover:border-accent hover:text-accent"
          >
            Seguinte
            <ChevronRight size={16} aria-hidden="true" />
          </a>
        )}
      </div>
    </nav>
  );
}
