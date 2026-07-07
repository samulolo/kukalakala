import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { DashboardJobForm } from "@/components/dashboard/DashboardJobForm";
import { getDashboardJobById } from "@/lib/dashboard-api";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{
    jobId: string;
  }>;
};

export default async function EditDashboardJobPage({ params }: Props) {
  const { jobId } = await params;
  const authToken = cookies().get("kukalakala_session")?.value;
  const job = await getDashboardJobById(jobId, authToken);

  if (!job) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <Link href={`/dashboard/vagas/${job.id}`} className="inline-flex items-center gap-2 text-[0.86rem] font-semibold text-[#667085] hover:text-accent">
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar aos detalhes
        </Link>
        <h1 className="mt-3 font-display text-[1.65rem] font-semibold text-[#0f172a]">Editar vaga</h1>
        <p className="mt-1 text-[0.9rem] text-[#667085]">Atualiza informações reais da vaga, requisitos e janela de candidatura.</p>
      </div>

      <DashboardJobForm mode="edit" job={job} />
    </div>
  );
}
