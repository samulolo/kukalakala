"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Plus, Save } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { ApiJob } from "@/lib/jobs-api";
import { getAuthToken } from "@/lib/auth/auth-session";

type Props = {
  mode: "create" | "edit";
  job?: ApiJob;
};

type ApiErrorResponse = {
  message?: string | null;
};

const CLIENT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

function toDateInput(value?: string) {
  return value ? value.slice(0, 10) : "";
}

function dateToIso(value: FormDataEntryValue | null) {
  const date = String(value ?? "");
  return date ? new Date(`${date}T00:00:00`).toISOString() : "";
}

function requirementsToArray(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.message || "Não foi possível guardar a vaga.";
  } catch {
    return "Não foi possível guardar a vaga.";
  }
}

export function DashboardJobForm({ mode, job }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = mode === "edit";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      ...(isEdit ? { company_id: job?.company_id } : {}),
      title: String(formData.get("title") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      requirements: requirementsToArray(formData.get("requirements")),
      is_active: formData.get("is_active") === "on",
      application_period_start: dateToIso(formData.get("application_period_start")),
      application_period_end: dateToIso(formData.get("application_period_end")),
      type: String(formData.get("type") ?? "remote"),
      response_time: formData.get("response_time") ? Number(formData.get("response_time")) : null,
    };

    if (!payload.title || !payload.description || !payload.application_period_start || !payload.application_period_end) {
      toast({
        title: "Campos em falta",
        description: "Preenche título, descrição e período de candidatura.",
        variant: "warning",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        isEdit ? `${CLIENT_API_BASE_URL}/api/v1/job/${job?.id}` : `${CLIENT_API_BASE_URL}/api/v1/company-auth/me/jobs`,
        {
          method: isEdit ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const result = await response.json();
      const savedJobId = result?.data?.id ?? job?.id;

      toast({
        title: isEdit ? "Vaga atualizada" : "Vaga criada",
        description: isEdit ? "As alterações foram guardadas na base de dados." : "A nova vaga foi guardada na base de dados.",
        variant: "success",
      });

      router.push(savedJobId ? `/dashboard/vagas/${savedJobId}` : "/dashboard/vagas");
      router.refresh();
    } catch (error) {
      toast({
        title: "Não foi possível guardar",
        description: error instanceof Error ? error.message : "Tenta novamente dentro de instantes.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Título
            <input className="min-h-11 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 text-[#111827] outline-none focus:border-accent focus:bg-white" name="title" placeholder="Backend Developer" defaultValue={job?.title ?? ""} />
          </label>
          <div className="rounded-lg border border-[#dbe3ee] bg-[#fbfdff] px-3 py-2">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-[#94a3b8]">Empresa</p>
            <p className="mt-1 text-[0.86rem] font-semibold text-[#0f172a]">
              {isEdit ? job?.company?.name ?? "Empresa da vaga" : "Empresa autenticada"}
            </p>
          </div>
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Modalidade
            <select className="min-h-11 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 text-[#111827] outline-none focus:border-accent focus:bg-white" name="type" defaultValue={job?.type ?? "remote"}>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="on_site">On-site</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Tempo de resposta
            <input className="min-h-11 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] px-3 text-[#111827] outline-none focus:border-accent focus:bg-white" min="0" name="response_time" type="number" placeholder="3" defaultValue={job?.response_time ?? ""} />
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
          Descrição
          <textarea className="min-h-[180px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-3 text-[#111827] outline-none focus:border-accent focus:bg-white" name="description" placeholder="Responsabilidades, contexto da equipa e impacto esperado." defaultValue={job?.description ?? ""} />
        </label>

        <label className="mt-4 flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
          Requisitos
          <textarea className="min-h-[120px] rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-3 text-[#111827] outline-none focus:border-accent focus:bg-white" name="requirements" placeholder={"Python\nFastAPI\nPostgreSQL"} defaultValue={(job?.requirements ?? []).join("\n")} />
        </label>
      </section>

      <aside className="self-start rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Janela de candidatura</p>
        <div className="mt-4 grid gap-4">
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Data inicial
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <input className="min-h-11 w-full rounded-lg border border-[#dbe3ee] bg-[#f8fafc] pl-9 pr-3 text-[#111827] outline-none focus:border-accent focus:bg-white" name="application_period_start" type="date" defaultValue={toDateInput(job?.application_period_start)} />
            </span>
          </label>
          <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
            Data final
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
              <input className="min-h-11 w-full rounded-lg border border-[#dbe3ee] bg-[#f8fafc] pl-9 pr-3 text-[#111827] outline-none focus:border-accent focus:bg-white" name="application_period_end" type="date" defaultValue={toDateInput(job?.application_period_end)} />
            </span>
          </label>
        </div>

        <div className="mt-5 border-t border-[#edf1f6] pt-5">
          <label className="flex items-center justify-between gap-3 text-[0.86rem] font-semibold text-[#475569]">
            Ativa
            <input className="h-4 w-4 accent-[#17a34a]" type="checkbox" name="is_active" defaultChecked={job?.is_active ?? true} />
          </label>
          <button disabled={isSubmitting} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.88rem] font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60">
            {isEdit ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {isSubmitting ? "A guardar..." : isEdit ? "Guardar alterações" : "Publicar vaga"}
          </button>
        </div>
      </aside>
    </form>
  );
}
