import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { JobsSection } from "@/components/JobsSection";
import { ProcessSection } from "@/components/ProcessSection";
import { ApiJob, getPublicJobs, Pagination } from "@/lib/jobs-api";
import { getFriendlyErrorMessage } from "@/lib/friendly-error";

type HomeJobsData = {
  items: ApiJob[];
  pagination?: Pagination;
  errorMessage?: string;
};

export default async function Home() {
  const jobsData: HomeJobsData = await getPublicJobs({ page: "1", limit: "3" }).catch((error: Error) => ({
    items: [],
    pagination: undefined,
    errorMessage: getFriendlyErrorMessage(error, "Não conseguimos carregar as vagas agora. Tenta novamente dentro de instantes."),
  }));

  return (
    <>
      <Hero />
      <main>
        <JobsSection
          jobs={jobsData.items}
          pagination={jobsData.pagination}
          errorMessage={jobsData.errorMessage}
        />
        <ProcessSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
