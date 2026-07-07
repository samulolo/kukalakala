import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { DashboardJobForm } from "@/components/dashboard/DashboardJobForm";

export default function NewDashboardJobPage() {
  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div>
        <Link href="/dashboard/vagas" className="inline-flex items-center gap-2 text-[0.86rem] font-semibold text-[#667085] hover:text-accent">
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar para vagas
        </Link>
        <h1 className="mt-3 font-display text-[1.65rem] font-semibold text-[#0f172a]">Publicar vaga</h1>
        <p className="mt-1 text-[0.9rem] text-[#667085]">Cria uma vaga real e guarda os dados na base.</p>
      </div>

      <DashboardJobForm mode="create" />
    </div>
  );
}
