import { API_BASE_URL, ApiJob, Pagination, getJobTypeLabel, getWorkplaceLabel } from "@/lib/jobs-api";
import { formatRelativeDate } from "@/lib/vagas-utils";

type ApiResponse<T> = {
  status: number;
  data: T;
  message: string | null;
  timestamp: string;
};

type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

type ApiCandidate = {
  id: string;
  name: string;
  email: string;
};

export type ApiCandidateProfile = {
  candidate_id: string;
  experience_years: number | null;
  resume_url: string | null;
  professional_situation: string | null;
  key_competences: string[] | null;
  created_at: string;
  updated_at: string;
};

type ApiApplication = {
  id: string;
  candidate_id: string;
  job_id: string;
  applied_at: string;
  status: string;
  ai_score: number | null;
  updated_at: string;
  ai_suggestions: string | null;
};

type ApiApplicationMessage = {
  id: string;
  application_id: string;
  status: string;
  message: string;
  created_at: string;
  sent_at: string | null;
};

type AiSuggestions = {
  competencias_chave?: string[];
  explicacao?: string;
  explicacao_candidato?: string;
  explicacao_empresa?: string;
};

export type CandidateDashboardApplication = {
  id: string;
  jobId: string;
  title: string;
  company: string;
  meta: string;
  status: string;
  applied: string;
  score: number;
  explanation: string;
  competences: string[];
  messages: {
    id: string;
    status: string;
    message: string;
    createdAt: string;
    sentAt: string | null;
  }[];
};

export type CandidateDashboardData = {
  candidate: ApiCandidate | null;
  profile: ApiCandidateProfile | null;
  applications: CandidateDashboardApplication[];
  pagination: Pagination;
  stats: {
    total: number;
    interviews: number;
    approved: number;
    averageScore: number;
  };
  errorMessage?: string;
};

const emptyPagination: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  pages: 0,
};

async function fetchApi<T>(path: string, authToken?: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${path}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

function parseAiSuggestions(value: string | null): AiSuggestions {
  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as AiSuggestions;
  } catch {
    return {};
  }
}

function normalizeScore(score: number | null) {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return 0;
  }

  return Math.round(Math.min(Math.max(score, 0), 100));
}

function formatCandidateExplanation(explanation: string | undefined) {
  const fallback = "A análise da IA ainda não está disponível para esta candidatura.";
  const prefix = "De acordo ao seu perfil e currículo, você possui";
  const cleanExplanation = explanation?.trim() || fallback;

  if (cleanExplanation.toLowerCase().startsWith(prefix.toLowerCase())) {
    return cleanExplanation;
  }

  return `${prefix} ${cleanExplanation.charAt(0).toLowerCase()}${cleanExplanation.slice(1)}`;
}

async function getCandidateProfile(candidateId: string, authToken?: string) {
  try {
    return await fetchApi<ApiCandidateProfile>(`/api/v1/candidate-profile/${candidateId}`, authToken);
  } catch {
    return null;
  }
}

async function getJob(jobId: string) {
  try {
    return await fetchApi<ApiJob>(`/api/v1/job/${jobId}`);
  } catch {
    return null;
  }
}

async function enrichApplication(application: ApiApplication, messages: ApiApplicationMessage[] = []): Promise<CandidateDashboardApplication> {
  const job = await getJob(application.job_id);
  const suggestions = parseAiSuggestions(application.ai_suggestions);

  return {
    id: application.id,
    jobId: application.job_id,
    title: job?.title ?? "Vaga não encontrada",
    company: job?.company?.name ?? "Empresa",
    meta: job ? `${getWorkplaceLabel(job)} · ${getJobTypeLabel(job.type)}` : "Detalhes indisponíveis",
    status: application.status,
    applied: formatRelativeDate(application.applied_at),
    score: normalizeScore(application.ai_score),
    explanation: formatCandidateExplanation(suggestions.explicacao_candidato ?? suggestions.explicacao),
    competences: suggestions.competencias_chave ?? [],
    messages: messages
      .filter((message) => message.application_id === application.id)
      .map((message) => ({
        id: message.id,
        status: message.status,
        message: message.message,
        createdAt: message.created_at,
        sentAt: message.sent_at,
      })),
  };
}

async function getAuthenticatedCandidate(authToken?: string) {
  if (!authToken) {
    return null;
  }

  return fetchApi<ApiCandidate>("/api/v1/candidate-auth/me", authToken);
}

export async function getCandidateDashboardData(query: { candidateId?: string; page?: string; authToken?: string } = {}): Promise<CandidateDashboardData> {
  try {
    const candidate = await getAuthenticatedCandidate(query.authToken);

    if (!candidate) {
      return {
        candidate: null,
        profile: null,
        applications: [],
        pagination: emptyPagination,
        stats: { total: 0, interviews: 0, approved: 0, averageScore: 0 },
        errorMessage: "Não foi possível identificar a sessão do candidato.",
      };
    }

    const page = Number.parseInt(query.page ?? "1", 10);
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const [profile, applicationsData] = await Promise.all([
      getCandidateProfile(candidate.id, query.authToken),
      fetchApi<Paginated<ApiApplication>>(`/api/v1/candidate-auth/me/applications?page=${safePage}&limit=10`, query.authToken),
    ]);
    const messages = await fetchApi<ApiApplicationMessage[]>("/api/v1/candidate-auth/me/messages", query.authToken).catch(() => []);
    const applications = await Promise.all(applicationsData.items.map((application) => enrichApplication(application, messages)));
    const scores = applications.map((application) => application.score).filter((score) => score > 0);
    const averageScore = scores.length
      ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
      : 0;

    return {
      candidate,
      profile,
      applications,
      pagination: applicationsData.pagination,
      stats: {
        total: applicationsData.pagination.total,
        interviews: applications.filter((application) => application.status === "entrevista").length,
        approved: applications.filter((application) => application.status === "aprovada").length,
        averageScore,
      },
    };
  } catch {
    return {
      candidate: null,
      profile: null,
      applications: [],
      pagination: emptyPagination,
      stats: { total: 0, interviews: 0, approved: 0, averageScore: 0 },
      errorMessage: "Não foi possível carregar a dashboard do candidato. Confirma se a API está em execução.",
    };
  }
}
