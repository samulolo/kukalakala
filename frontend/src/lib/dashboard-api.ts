import {
  API_BASE_URL,
  ApiJob,
  Pagination,
  getJobTypeLabel,
  getResponseTimeLabel,
  getWorkplaceLabel,
} from "@/lib/jobs-api";
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
  candidate_id: string;
  company_id: string;
  status: string;
  message: string;
  channel: string;
  delivery_status: string;
  created_at: string;
  sent_at: string | null;
};

type ApiCandidate = {
  id: string;
  name: string;
  email: string;
};

type ApiCandidateProfile = {
  candidate_id: string;
  experience_years: number | null;
  resume_url: string | null;
  professional_situation: string | null;
  key_competences: string[] | null;
  created_at: string;
  updated_at: string;
};

type ApiCompany = {
  id: string;
  name: string;
  email: string;
  sector: string;
  location: string;
  foundation_date: string | null;
};

type AiSuggestions = {
  competencias_chave?: string[];
  explicacao?: string;
  explicacao_candidato?: string;
  explicacao_empresa?: string;
};

export type DashboardJob = ApiJob & {
  applicants_count: number;
};

export type DashboardApplication = {
  id: string;
  candidateId: string;
  candidateEmail: string;
  name: string;
  role: string;
  match: number;
  stage: string;
  applied: string;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
  };
  cv: {
    headline: string;
    competences: string[];
    matched: string[];
    gaps: string[];
    resumeUrl: string | null;
  };
  ai: {
    score: number;
    explanation: string;
  };
  messages: {
    id: string;
    status: string;
    message: string;
    deliveryStatus: string;
    createdAt: string;
    sentAt: string | null;
  }[];
};

export type DashboardOverview = {
  activeJobs: number;
  newApplicants: number;
  interviews: number;
  averageScore: number;
  pipeline: {
    status: string;
    label: string;
    value: number;
    percentage: number;
  }[];
  applicantsTrend: {
    label: string;
    applications: number;
  }[];
  jobs: DashboardJob[];
  applications: DashboardApplication[];
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

function clampPage(value: string | undefined) {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? String(page) : "1";
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

const pipelineStages = [
  { status: "submetida", label: "Submetidas" },
  { status: "em_analise", label: "Em análise" },
  { status: "entrevista", label: "Entrevistas" },
  { status: "aprovada", label: "Aprovadas" },
  { status: "rejeitada", label: "Rejeitadas" },
];

function buildPipeline(applications: DashboardApplication[]) {
  const total = applications.length;

  return pipelineStages.map((stage) => {
    const value = applications.filter((application) => application.stage === stage.status).length;

    return {
      ...stage,
      value,
      percentage: total ? Math.round((value / total) * 100) : 0,
    };
  });
}

function buildApplicantsTrend(applications: DashboardApplication[]) {
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() - (6 - index));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return days.map((date) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);
    const applicationsCount = applications.filter((application) => {
      const appliedAt = new Date(application.appliedAt);
      return appliedAt >= date && appliedAt < nextDate;
    }).length;

    return {
      label: new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short" }).format(date),
      applications: applicationsCount,
    };
  });
}

async function getApplicationCount(jobId: string, authToken?: string) {
  try {
    const data = await fetchApi<Paginated<ApiApplication>>(`/api/v1/job/${jobId}/applications?page=1&limit=1`, authToken);
    return data.pagination.total;
  } catch {
    return 0;
  }
}

async function getAuthenticatedCompany(authToken?: string) {
  if (!authToken) {
    return null;
  }

  try {
    return await fetchApi<ApiCompany>("/api/v1/company-auth/me", authToken);
  } catch {
    return null;
  }
}

async function getCandidate(candidateId: string, authToken?: string) {
  try {
    return await fetchApi<ApiCandidate>(`/api/v1/candidate/${candidateId}`, authToken);
  } catch {
    return null;
  }
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

async function getApplicationMessages(applicationId: string, authToken?: string) {
  try {
    return await fetchApi<ApiApplicationMessage[]>(`/api/v1/application/${applicationId}/messages`, authToken);
  } catch {
    return [];
  }
}

async function enrichJob(job: ApiJob, authToken?: string): Promise<DashboardJob> {
  const applicants_count = await getApplicationCount(job.id, authToken);
  return { ...job, applicants_count };
}

async function enrichApplication(application: ApiApplication, authToken?: string): Promise<DashboardApplication> {
  const [candidate, profile, job, messages] = await Promise.all([
    getCandidate(application.candidate_id, authToken),
    getCandidateProfile(application.candidate_id, authToken),
    getJob(application.job_id),
    getApplicationMessages(application.id, authToken),
  ]);
  const suggestions = parseAiSuggestions(application.ai_suggestions);
  const requirements = job?.requirements ?? [];
  const competences = profile?.key_competences ?? [];
  const matched = suggestions.competencias_chave?.length
    ? suggestions.competencias_chave
    : competences.filter((competence) => requirements.some((requirement) => requirement.toLowerCase() === competence.toLowerCase()));
  const gaps = requirements.filter((requirement) => !competences.some((competence) => competence.toLowerCase() === requirement.toLowerCase()));
  const company = job?.company?.name ?? "Empresa";
  const experienceText = profile?.experience_years
    ? `${profile.experience_years} ano${profile.experience_years === 1 ? "" : "s"} de experiência`
    : "Experiência não informada";

  return {
    id: application.id,
    candidateId: application.candidate_id,
    candidateEmail: candidate?.email ?? "",
    name: candidate?.name ?? "Candidato sem nome",
    role: job?.title ?? "Vaga não encontrada",
    match: normalizeScore(application.ai_score),
    stage: application.status,
    applied: formatRelativeDate(application.applied_at),
    appliedAt: application.applied_at,
    updatedAt: application.updated_at,
    job: {
      id: application.job_id,
      title: job?.title ?? "Vaga não encontrada",
      company,
      location: job?.company?.location ?? "Localização não informada",
      type: job ? getJobTypeLabel(job.type) : "Modalidade não informada",
      description: job?.description ?? "Descrição indisponível.",
      requirements,
    },
    cv: {
      headline: `${experienceText}. ${profile?.professional_situation ?? "Situação profissional não informada."}`,
      competences,
      matched,
      gaps,
      resumeUrl: profile?.resume_url ?? null,
    },
    ai: {
      score: normalizeScore(application.ai_score),
      explanation: suggestions.explicacao_empresa ?? suggestions.explicacao ?? "A análise da IA ainda não está disponível para esta candidatura.",
    },
    messages: messages.map((message) => ({
      id: message.id,
      status: message.status,
      message: message.message,
      deliveryStatus: message.delivery_status,
      createdAt: message.created_at,
      sentAt: message.sent_at,
    })),
  };
}

export async function getDashboardJobs(query: { page?: string; limit?: string; status?: string; authToken?: string } = {}) {
  const params = new URLSearchParams();
  params.set("page", clampPage(query.page));
  params.set("limit", query.limit ?? "10");

  const company = await getAuthenticatedCompany(query.authToken);

  if (!company) {
    return {
      items: [] as DashboardJob[],
      pagination: { ...emptyPagination, page: Number(clampPage(query.page)), limit: Number(query.limit ?? "10") },
      errorMessage: "Não foi possível identificar a empresa autenticada.",
    };
  }

  params.set("company_id", company.id);

  if (query.status === "active") {
    params.set("is_active", "true");
  }

  if (query.status === "inactive") {
    params.set("is_active", "false");
  }

  try {
    const data = await fetchApi<Paginated<ApiJob>>(`/api/v1/job/?${params.toString()}`, query.authToken);
    const items = await Promise.all(data.items.map((job) => enrichJob(job, query.authToken)));
    return { ...data, items, errorMessage: undefined };
  } catch {
    return {
      items: [] as DashboardJob[],
      pagination: { ...emptyPagination, page: Number(clampPage(query.page)), limit: Number(query.limit ?? "10") },
      errorMessage: "Não foi possível carregar as vagas reais. Confirma se a API está em execução.",
    };
  }
}

export async function getDashboardJobById(jobId: string, authToken?: string) {
  try {
    const company = await getAuthenticatedCompany(authToken);
    if (!company) {
      return null;
    }

    const job = await fetchApi<ApiJob>(`/api/v1/job/${jobId}`);
    if (job.company_id !== company.id) {
      return null;
    }

    return await enrichJob(job, authToken);
  } catch {
    return null;
  }
}

export async function getDashboardApplications(query: { page?: string; limit?: string; status?: string; authToken?: string } = {}) {
  const page = Number(clampPage(query.page));
  const limit = Number(query.limit ?? "10");

  try {
    const company = await getAuthenticatedCompany(query.authToken);

    if (!company) {
      return {
        items: [] as DashboardApplication[],
        pagination: { ...emptyPagination, page, limit },
        errorMessage: "Não foi possível identificar a empresa autenticada.",
      };
    }

    const jobsData = await fetchApi<Paginated<ApiJob>>(`/api/v1/job/?company_id=${company.id}&page=1&limit=100`, query.authToken);
    const applicationGroups = await Promise.all(
      jobsData.items.map((job) => fetchApi<Paginated<ApiApplication>>(`/api/v1/job/${job.id}/applications?page=1&limit=100`, query.authToken))
    );
    const rawApplications = applicationGroups
      .flatMap((group) => group.items)
      .filter((application) => !query.status || query.status === "all" || application.status === query.status)
      .sort((first, second) => new Date(second.applied_at).getTime() - new Date(first.applied_at).getTime());
    const start = (page - 1) * limit;
    const paginatedApplications = rawApplications.slice(start, start + limit);
    const items = await Promise.all(paginatedApplications.map((application) => enrichApplication(application, query.authToken)));

    return {
      items,
      pagination: {
        page,
        limit,
        total: rawApplications.length,
        pages: Math.ceil(rawApplications.length / limit),
      },
      errorMessage: undefined,
    };
  } catch {
    return {
      items: [] as DashboardApplication[],
      pagination: { ...emptyPagination, page, limit },
      errorMessage: "Não foi possível carregar as candidaturas reais. Confirma se a API está em execução.",
    };
  }
}

export async function getDashboardOverview(authToken?: string): Promise<DashboardOverview> {
  const [jobsData, applicationsData] = await Promise.all([
    getDashboardJobs({ page: "1", limit: "4", status: "active", authToken }),
    getDashboardApplications({ page: "1", limit: "3", authToken }),
  ]);
  const allApplications = await getDashboardApplications({ page: "1", limit: "100", authToken });
  const scores = allApplications.items.map((application) => application.ai.score).filter((score) => score > 0);
  const averageScore = scores.length
    ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
    : 0;

  return {
    activeJobs: jobsData.pagination.total,
    newApplicants: allApplications.pagination.total,
    interviews: allApplications.items.filter((application) => application.stage === "entrevista").length,
    averageScore,
    pipeline: buildPipeline(allApplications.items),
    applicantsTrend: buildApplicantsTrend(allApplications.items),
    jobs: jobsData.items,
    applications: applicationsData.items,
    errorMessage: jobsData.errorMessage ?? applicationsData.errorMessage,
  };
}

export function getDashboardJobMeta(job: ApiJob) {
  return `${getWorkplaceLabel(job)} · ${getResponseTimeLabel(job.response_time)}`;
}
