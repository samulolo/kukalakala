"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, Send, Upload, UserRound } from "lucide-react";
import { applyToJob } from "@/lib/application-api";
import type { AuthCandidate } from "@/lib/auth/auth-api";
import type { ApiCandidateProfile } from "@/lib/candidate-dashboard-api";
import {
  createCandidateProfile,
  updateCandidateProfile,
  uploadCandidateCv,
} from "@/lib/candidate-profile-api";
import { getAuthToken } from "@/lib/auth/auth-session";
import { API_BASE_URL } from "@/lib/jobs-api";
import { useToast } from "@/components/ui/toast";

type Props = {
  jobId: string;
  candidate: AuthCandidate | null;
  profile: ApiCandidateProfile | null;
};

function formatCompetences(competences: string[] | null | undefined) {
  return competences?.length ? competences.join(", ") : "";
}

function parseCompetences(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function updateCandidateInfo(candidateId: string, payload: { name: string; email: string }) {
  const token = getAuthToken();
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? API_BASE_URL}/api/v1/candidate/${candidateId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Não foi possível atualizar os dados do candidato.");
  }
}

export function ApplicationConfirmationForm({ jobId, candidate, profile }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [name, setName] = useState(candidate?.name ?? "");
  const [email, setEmail] = useState(candidate?.email ?? "");
  const [experienceYears, setExperienceYears] = useState(String(profile?.experience_years ?? ""));
  const [competences, setCompetences] = useState(formatCompetences(profile?.key_competences));
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const applyHref = `/candidaturas/nova?job_id=${jobId}`;
  const loginHref = `/login?redirect=${encodeURIComponent(applyHref)}`;
  const hasProfile = Boolean(profile);
  const hasResume = Boolean(profile?.resume_url);
  const canSubmit = Boolean(
    candidate &&
    jobId &&
    name.trim() &&
    email.trim() &&
    experienceYears.trim() &&
    parseCompetences(competences).length &&
    (hasResume || resumeFile)
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      toast({
        title: "Perfil incompleto",
        description: "Completa o teu perfil e anexa o currículo antes de te candidatares.",
        variant: "error",
      });
      return;
    }

    if (!candidate) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        experience_years: Math.max(0, Number.parseInt(experienceYears, 10) || 0),
        professional_situation: profile?.professional_situation === "employed" ? "employed" as const : "unempoyed" as const,
        key_competences: parseCompetences(competences),
      };

      await updateCandidateInfo(candidate.id, {
        name: name.trim(),
        email: email.trim(),
      });

      if (hasProfile) {
        await updateCandidateProfile(candidate.id, payload);
      } else {
        await createCandidateProfile(candidate.id, payload);
      }

      if (resumeFile) {
        await uploadCandidateCv(candidate.id, resumeFile);
      }

      await applyToJob(jobId);
      toast({
        title: "Candidatura submetida",
        description: "A empresa já consegue ver a tua candidatura com a análise da IA.",
        variant: "success",
      });
      router.push(candidate?.id ? `/dashboard-candidato?candidateId=${candidate.id}` : "/dashboard-candidato");
      router.refresh();
    } catch (error) {
      toast({
        title: "Não foi possível candidatar",
        description: error instanceof Error ? error.message : "Tenta novamente dentro de instantes.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!candidate) {
    return (
      <div className="rounded-xl border border-[#dbe3ee] bg-white p-5 sm:p-6">
        <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[#16813f]">Sessão necessária</p>
        <h1 className="mt-3 font-display text-[1.45rem] font-semibold text-[#111827]">Inicia sessão como candidato.</h1>
        <p className="mt-2 text-[0.9rem] leading-[1.65] text-[#667085]">
          Vamos usar automaticamente os dados do teu perfil para preencher a candidatura.
        </p>
        <Link
          href={loginHref}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-[0.88rem] font-semibold text-white hover:bg-accent-dark"
        >
          Iniciar sessão
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#dbe3ee] bg-white p-5 sm:p-6">
      <p className="text-[0.74rem] font-semibold uppercase tracking-[0.12em] text-[#16813f]">
        Confirmar candidatura
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.45rem,3vw,2rem)] font-semibold leading-tight text-[#111827]">
        Confirma os dados que serão enviados.
      </h1>
      <p className="mt-2 max-w-[620px] text-[0.92rem] leading-[1.65] text-[#667085]">
        Estes campos vêm do teu perfil de candidato e do currículo anexado.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
          Nome completo
          <input
            className="min-h-11 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[#111827] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            name="name"
            onChange={(event) => setName(event.target.value)}
            value={name}
          />
        </label>
        <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
          Email
          <input
            className="min-h-11 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[#111827] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            name="email"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
          Anos de experiência
          <input
            className="min-h-11 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[#111827] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            min="0"
            name="experience_years"
            onChange={(event) => setExperienceYears(event.target.value)}
            type="number"
            value={experienceYears}
          />
        </label>
        <label className="flex flex-col gap-2 text-[0.82rem] font-semibold text-[#475569]">
          Competências chave
          <input
            className="min-h-11 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[#111827] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            name="key_competences"
            onChange={(event) => setCompetences(event.target.value)}
            placeholder="Python, FastAPI, SQL"
            value={competences}
          />
        </label>
      </div>

      <div className="mt-4 rounded-lg border border-[#dbe3ee] bg-[#f8fafc] p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white text-accent">
            <FileText size={18} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[0.86rem] font-semibold text-[#111827]">Currículo</p>
            {hasResume ? (
              <p className="mt-1 break-all text-[0.8rem] leading-relaxed text-[#667085]">{profile?.resume_url}</p>
            ) : (
              <p className="mt-1 text-[0.82rem] leading-relaxed text-[#b45309]">
                Ainda não existe currículo anexado ao teu perfil.
              </p>
            )}
            {resumeFile && (
              <p className="mt-2 text-[0.8rem] font-medium text-[#16813f]">
                Novo CV selecionado: {resumeFile.name}
              </p>
            )}
          </div>
        </div>
        <label className="mt-4 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#dbe3ee] bg-white px-3 text-[0.82rem] font-semibold text-[#475569] hover:border-accent hover:text-accent">
          <Upload size={15} aria-hidden="true" />
          {hasResume ? "Substituir currículo" : "Anexar currículo"}
          <input
            className="sr-only"
            type="file"
            accept="application/pdf"
            onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {!hasResume && !resumeFile ? (
        <div className="mt-4 rounded-lg border border-[#fde68a] bg-[#fffbeb] p-4 text-[0.86rem] leading-relaxed text-[#92400e]">
          Anexa um currículo em PDF para permitir a análise da IA.
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#ccefd9] bg-[#effdf4] p-4 text-[0.86rem] font-medium text-[#16813f]">
          <CheckCircle2 size={17} aria-hidden="true" />
          Perfil e currículo prontos para análise da IA.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 border-t border-[#edf1f6] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[0.82rem] leading-relaxed text-[#667085]">
          Ao submeter, a IA compara o teu CV com os requisitos da vaga.
        </p>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-[0.9rem] font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canSubmit || isSubmitting}
          type="submit"
        >
          {isSubmitting ? "A submeter..." : "Submeter candidatura"}
          {canSubmit ? <Send size={16} aria-hidden="true" /> : <UserRound size={16} aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
