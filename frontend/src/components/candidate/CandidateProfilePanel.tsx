"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Save, UploadCloud, X } from "lucide-react";
import type { ApiCandidateProfile } from "@/lib/candidate-dashboard-api";
import {
  createCandidateProfile,
  updateCandidateProfile,
  uploadCandidateCv,
} from "@/lib/candidate-profile-api";
import type { CandidateProfilePayload } from "@/lib/candidate-profile-api";
import { useToast } from "@/components/ui/toast";

type Props = {
  candidateId?: string;
  profile: ApiCandidateProfile | null;
};

function parseCompetences(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatCompetences(competences: string[] | null | undefined) {
  return competences?.join(", ") ?? "";
}

export function CandidateProfilePanel({ candidateId, profile }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [experienceYears, setExperienceYears] = useState(String(profile?.experience_years ?? 0));
  const [professionalSituation, setProfessionalSituation] = useState<CandidateProfilePayload["professional_situation"]>(
    profile?.professional_situation === "employed" ? "employed" : "unempoyed"
  );
  const [competences, setCompetences] = useState(formatCompetences(profile?.key_competences));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const competenceList = useMemo(() => parseCompetences(competences), [competences]);

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!candidateId) {
      toast({
        title: "Seleciona um candidato",
        description: "Não foi possível identificar o candidato ativo.",
        variant: "error",
      });
      return;
    }

    const parsedExperience = Number.parseInt(experienceYears, 10);
    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      toast({
        title: "Experiência inválida",
        description: "Informa um número igual ou maior que zero.",
        variant: "warning",
      });
      return;
    }

    const payload: CandidateProfilePayload = {
      experience_years: parsedExperience,
      professional_situation: professionalSituation,
      key_competences: competenceList,
    };

    setIsSaving(true);

    try {
      if (profile) {
        await updateCandidateProfile(candidateId, payload);
      } else {
        await createCandidateProfile(candidateId, payload);
      }

      toast({
        title: "Perfil atualizado",
        description: "Os dados profissionais foram guardados.",
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

  async function handleUploadCv() {
    if (!candidateId || !selectedFile) {
      return;
    }

    if (!profile) {
      toast({
        title: "Guarda o perfil primeiro",
        description: "Cria o perfil profissional antes de carregar o CV.",
        variant: "warning",
      });
      return;
    }

    if (selectedFile.type !== "application/pdf" && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      toast({
        title: "Formato inválido",
        description: "O CV deve ser enviado em PDF.",
        variant: "warning",
      });
      return;
    }

    setIsUploading(true);

    try {
      const upload = await uploadCandidateCv(candidateId, selectedFile);
      toast({
        title: "CV carregado",
        description: upload.text_extracted
          ? "O texto do CV foi extraído para a análise da IA."
          : "O ficheiro foi guardado, mas não foi possível extrair texto.",
        variant: "success",
      });
      setSelectedFile(null);
      router.refresh();
    } catch (error) {
      toast({
        title: "Não foi possível carregar o CV",
        description: error instanceof Error ? error.message : "Tenta novamente com outro PDF.",
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null);
  }

  return (
    <aside className="min-w-0 self-start rounded-2xl border border-[#e3e8ef] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2">
        <FileText size={18} className="text-accent" aria-hidden="true" />
        <h2 className="font-display text-[1rem] font-semibold text-[#0f172a]">Perfil profissional</h2>
      </div>

      <form className="mt-4 space-y-4" onSubmit={handleSave}>
        <div className="space-y-1.5">
          <label htmlFor="experience_years" className="text-[0.78rem] font-semibold text-[#475569]">
            Anos de experiência
          </label>
          <input
            id="experience_years"
            min={0}
            type="number"
            value={experienceYears}
            onChange={(event) => setExperienceYears(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dbe3ee] px-3 text-[0.9rem] text-[#0f172a] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="professional_situation" className="text-[0.78rem] font-semibold text-[#475569]">
            Situação profissional
          </label>
          <select
            id="professional_situation"
            value={professionalSituation}
            onChange={(event) => setProfessionalSituation(event.target.value as CandidateProfilePayload["professional_situation"])}
            className="h-10 w-full rounded-lg border border-[#dbe3ee] bg-white px-3 text-[0.9rem] text-[#0f172a] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
          >
            <option value="unempoyed">Disponível</option>
            <option value="employed">Empregado</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="key_competences" className="text-[0.78rem] font-semibold text-[#475569]">
            Competências
          </label>
          <textarea
            id="key_competences"
            value={competences}
            onChange={(event) => setCompetences(event.target.value)}
            rows={4}
            placeholder="Python, FastAPI, React"
            className="w-full resize-none rounded-lg border border-[#dbe3ee] px-3 py-2 text-[0.9rem] leading-relaxed text-[#0f172a] outline-none placeholder:text-[#94a3b8] focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
          <p className="text-[0.74rem] text-[#667085]">Separa cada competência com vírgula.</p>
        </div>

        {competenceList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {competenceList.map((competence) => (
              <span key={competence} className="rounded-full bg-[#effdf4] px-3 py-1 text-[0.76rem] font-semibold text-[#16813f]">
                {competence}
              </span>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={isSaving || !candidateId}
          className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.86rem] font-semibold text-white transition hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={16} aria-hidden="true" />
          {isSaving ? "A guardar..." : profile ? "Guardar alterações" : "Criar perfil"}
        </button>
      </form>

      <div className="mt-5 border-t border-[#edf1f6] pt-5">
        <p className="text-[0.78rem] font-semibold text-[#475569]">CV em PDF</p>

        {profile?.resume_url && (
          <div className="mt-3 rounded-xl bg-[#f8fafc] p-4">
            <p className="text-[0.84rem] font-semibold text-[#0f172a]">CV carregado</p>
            <p className="mt-1 break-all text-[0.78rem] text-[#667085]">{profile.resume_url}</p>
          </div>
        )}

        <label className="mt-3 flex min-h-[96px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-[#fbfdff] px-4 py-4 text-center hover:border-accent">
          <UploadCloud size={20} className="text-accent" aria-hidden="true" />
          <span className="mt-2 text-[0.84rem] font-semibold text-[#0f172a]">
            {selectedFile ? selectedFile.name : "Selecionar CV"}
          </span>
          <span className="mt-1 text-[0.74rem] text-[#667085]">PDF até ao limite aceite pelo servidor</span>
          <input className="sr-only" type="file" accept="application/pdf" onChange={handleFileChange} />
        </label>

        {selectedFile && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-[#dbe3ee] px-3 py-2">
            <span className="min-w-0 truncate text-[0.8rem] text-[#475569]">{selectedFile.name}</span>
            <button
              type="button"
              onClick={() => setSelectedFile(null)}
              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-[#94a3b8] hover:bg-[#f8fafc] hover:text-[#475569]"
              aria-label="Remover ficheiro selecionado"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={handleUploadCv}
          disabled={!selectedFile || isUploading || !candidateId}
          className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#dbe3ee] px-4 text-[0.86rem] font-semibold text-[#475569] transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadCloud size={16} aria-hidden="true" />
          {isUploading ? "A carregar..." : "Carregar CV"}
        </button>
      </div>
    </aside>
  );
}
