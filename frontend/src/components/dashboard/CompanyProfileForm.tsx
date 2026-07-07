"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, CalendarDays, MapPin, Save, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { getAuthToken, getStoredCompany, saveAuthSession } from "@/lib/auth/auth-session";
import { getAuthenticatedCompany, updateCompany } from "@/lib/company-api";
import type { AuthCompany } from "@/lib/auth/auth-api";

const emptyCompany: AuthCompany = {
  id: "",
  name: "",
  email: "",
  sector: "",
  location: "",
  foundation_date: null,
};

function getFoundationYear(value: string | null) {
  return value ? new Date(value).getFullYear() : "Não definida";
}

export function CompanyProfileForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [company, setCompany] = useState<AuthCompany>(emptyCompany);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedCompany = getStoredCompany();
    if (storedCompany) {
      setCompany(storedCompany);
    }

    getAuthenticatedCompany()
      .then((companyData) => {
        setCompany(companyData);
      })
      .catch((error) => {
        toast({
          title: "Não foi possível carregar a empresa",
          description: error instanceof Error ? error.message : "Inicia sessão novamente.",
          variant: "error",
        });
      })
      .finally(() => setIsLoading(false));
  }, [toast]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!company.id) {
      toast({
        title: "Empresa não encontrada",
        description: "Inicia sessão como empresa para editar este perfil.",
        variant: "warning",
      });
      return;
    }

    if (!company.name.trim() || !company.email.trim() || !company.sector.trim() || !company.location.trim()) {
      toast({
        title: "Campos em falta",
        description: "Preenche nome, email, setor e localização.",
        variant: "warning",
      });
      return;
    }

    setIsSaving(true);

    try {
      const updatedCompany = await updateCompany(company.id, {
        name: company.name,
        email: company.email,
        sector: company.sector,
        location: company.location,
        foundation_date: company.foundation_date || null,
      });

      setCompany(updatedCompany);
      saveAuthSession({
        company: updatedCompany,
        user: updatedCompany,
        access_token: getAuthToken() ?? "",
        token_type: "Bearer",
        expires_in: 604800,
      });
      toast({
        title: "Perfil atualizado",
        description: "Os dados da empresa foram guardados.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      toast({
        title: "Não foi possível guardar",
        description: error instanceof Error ? error.message : "Tenta novamente.",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      <form onSubmit={handleSubmit} className="rounded-xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)] sm:p-6">
        <div className="flex items-center gap-3 border-b border-[#edf1f6] pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#effdf4] text-accent">
            <Building2 size={21} aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-[1.05rem] font-semibold text-[#0f172a]">Dados públicos</h2>
            <p className="mt-1 text-[0.82rem] text-[#667085]">
              {isLoading ? "A carregar empresa..." : "Esta informação aparece associada às vagas publicadas."}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Nome da empresa
            <input className="min-h-11 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 text-[0.9rem] text-[#111827] outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10" value={company.name} onChange={(event) => setCompany((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Email
            <input className="min-h-11 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 text-[0.9rem] text-[#111827] outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10" type="email" value={company.email} onChange={(event) => setCompany((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Setor
            <input className="min-h-11 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 text-[0.9rem] text-[#111827] outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10" value={company.sector} onChange={(event) => setCompany((current) => ({ ...current, sector: event.target.value }))} />
          </label>
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Localização
            <input className="min-h-11 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 text-[0.9rem] text-[#111827] outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10" value={company.location} onChange={(event) => setCompany((current) => ({ ...current, location: event.target.value }))} />
          </label>
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569] sm:col-span-2">
            Data de fundação
            <input className="min-h-11 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 text-[0.9rem] text-[#111827] outline-none transition focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10" type="date" value={company.foundation_date ?? ""} onChange={(event) => setCompany((current) => ({ ...current, foundation_date: event.target.value || null }))} />
          </label>
        </div>

        <div className="mt-5 flex justify-end border-t border-[#edf1f6] pt-5">
          <button disabled={isSaving || isLoading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.85rem] font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60">
            <Save size={16} aria-hidden="true" />
            {isSaving ? "A guardar..." : "Guardar perfil"}
          </button>
        </div>
      </form>

      <aside className="flex flex-col gap-4">
        <div className="rounded-xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#effdf4] text-accent">
            <Building2 size={24} aria-hidden="true" />
          </div>
          <h2 className="mt-4 font-display text-[1.05rem] font-semibold text-[#0f172a]">Cartão público</h2>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-[#667085]">
            O cartão ajuda candidatos a entenderem rapidamente quem está por trás de cada vaga.
          </p>
          <div className="mt-5 rounded-xl border border-[#edf1f6] bg-[#fbfdff] p-4">
            <p className="font-display text-[1rem] font-semibold text-[#0f172a]">{company.name || "Empresa"}</p>
            <div className="mt-3 space-y-2 text-[0.82rem] text-[#667085]">
              <p className="flex items-center gap-2"><ShieldCheck size={15} className="text-accent" aria-hidden="true" />{company.sector || "Setor"}</p>
              <p className="flex items-center gap-2"><MapPin size={15} className="text-accent" aria-hidden="true" />{company.location || "Localização"}</p>
              <p className="flex items-center gap-2"><CalendarDays size={15} className="text-accent" aria-hidden="true" />Desde {getFoundationYear(company.foundation_date)}</p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
