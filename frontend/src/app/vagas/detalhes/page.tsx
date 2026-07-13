import { notFound } from "next/navigation";
import JobDetailsPage from "../[jobId]/page";

type Props = {
  searchParams: Promise<{
    job_id?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PublicJobDetailsPage({ searchParams }: Props) {
  const { job_id: jobId } = await searchParams;

  if (!jobId) {
    notFound();
  }

  return <JobDetailsPage params={Promise.resolve({ jobId })} />;
}
