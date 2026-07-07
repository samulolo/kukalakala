import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowLeft, BriefcaseBusiness, MapPin } from "lucide-react";
import { Footer } from "@/components/Footer";
import { ApplicationConfirmationForm } from "@/components/applications/ApplicationConfirmationForm";
import { API_BASE_URL, getJobById, getJobTypeLabel } from "@/lib/jobs-api";
import type { AuthCandidate } from "@/lib/auth/auth-api";
import type { ApiCandidateProfile } from "@/lib/candidate-dashboard-api";

export const dynamic = "force-dynamic";

type ApiResponse<T> = {
  status: number;
  data: T;
  message: string | null;
  timestamp: string;
};

type Props = {
  searchParams: {
    job_id?: string;
  };
};

async function fetchWithAuth<T>(path: string, token?: string): Promise<T | null> {
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as ApiResponse<T>;
    return payload.data;
  } catch {
    return null;
  }
}

export default async function NewApplicationPage({ searchParams }: Props) {
  const job = searchParams.job_id ? await getJobById(searchParams.job_id).catch(() => null) : null;
  const token = cookies().get("kukalakala_session")?.value;
  const candidate = await fetchWithAuth<AuthCandidate>("/api/v1/candidate-auth/me", token);
  const profile = candidate
    ? await fetchWithAuth<ApiCandidateProfile>(`/api/v1/candidate-profile/${candidate.id}`, token)
    : null;
  const companyName = job?.company?.name ?? "Empresa não selecionada";
  const location = job?.company?.location ?? "Localização não informada";

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fb]">
      <main className="mx-auto w-[min(1120px,calc(100%-32px))] flex-1 py-6 sm:py-8">
        <Link
          href={job ? `/vagas/${job.id}` : "/vagas"}
          className="inline-flex items-center gap-2 text-[0.88rem] font-semibold text-[#667085] hover:text-accent"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Voltar
        </Link>

        <section className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <ApplicationConfirmationForm
            candidate={candidate}
            jobId={searchParams.job_id ?? ""}
            profile={profile}
          />

          <aside className="self-start rounded-2xl border border-[#dbe3ee] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] lg:sticky lg:top-6">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.1em] text-[#94a3b8]">Vaga selecionada</p>
            <h2 className="mt-2 font-display text-[1.12rem] font-semibold leading-snug text-[#111827]">
              {job?.title ?? "Escolhe uma vaga para candidatar"}
            </h2>
            <div className="mt-4 space-y-3 text-[0.9rem] text-[#667085]">
              <p className="flex items-start gap-2">
                <BriefcaseBusiness className="mt-0.5 flex-shrink-0" size={16} aria-hidden="true" />
                <span>{companyName}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 flex-shrink-0" size={16} aria-hidden="true" />
                <span>{location}</span>
              </p>
            </div>
            {job ? (
              <span className="mt-5 inline-flex rounded-full border border-[#ccefd9] bg-[#effdf4] px-3 py-1 text-[0.78rem] font-semibold text-[#16813f]">
                {getJobTypeLabel(job.type)}
              </span>
            ) : (
              <Link href="/vagas" className="mt-5 inline-flex min-h-10 items-center justify-center rounded-full border border-[#dbe3ee] px-4 text-[0.85rem] font-semibold text-[#475569] hover:border-accent hover:text-accent">
                Ver vagas abertas
              </Link>
            )}
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
