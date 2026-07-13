import { notFound } from "next/navigation";
import JobDetailsPage from "../[jobId]/page";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    job_id?: string;
    jobId?: string;
  }>;
};

export default async function JobDetailsByQueryPage({ searchParams }: Props) {
  const params = await searchParams;
  const jobId = params.job_id ?? params.jobId;

  if (!jobId) {
    notFound();
  }

  return <JobDetailsPage params={Promise.resolve({ jobId })} />;
}
