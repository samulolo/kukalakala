import { CtaSection } from "@/components/CtaSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { JobsSection } from "@/components/JobsSection";
import { ProcessSection } from "@/components/ProcessSection";
import { ApiJob, getPublicJobs, Pagination } from "@/lib/jobs-api";

type HomeJobsData = {
  items: ApiJob[];
  pagination?: Pagination;
  errorMessage?: string;
};

export default async function Home() {
  const jobsData: HomeJobsData = await getPublicJobs({ page: "1", limit: "3" }).catch((error: Error) => ({
    items: [],
    pagination: undefined,
    errorMessage: error.message,
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
