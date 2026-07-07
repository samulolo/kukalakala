import { Save } from "lucide-react";
import { CompanyProfileForm } from "@/components/dashboard/CompanyProfileForm";

export default function DashboardProfilePage() {
  return (
    <div className="flex flex-col gap-5 p-6 sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[0.76rem] font-semibold uppercase tracking-[0.12em] text-[#16813f]">
            Empresa
          </p>
          <h1 className="mt-1 font-display text-[1.65rem] font-semibold text-[#0f172a]">
            Perfil da empresa
          </h1>
          <p className="mt-1 max-w-2xl text-[0.9rem] leading-relaxed text-[#667085]">
            Mantém os dados da empresa consistentes nas vagas e nas páginas vistas pelos candidatos.
          </p>
        </div>

        <div className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#dbe3ee] bg-white px-4 text-[0.85rem] font-semibold text-[#475569]">
          <Save size={16} aria-hidden="true" />
          Dados reais
        </div>
      </div>

      <CompanyProfileForm />
    </div>
  );
}
