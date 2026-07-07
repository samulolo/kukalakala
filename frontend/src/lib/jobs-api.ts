export type JobType = "on_site" | "remote" | "hybrid";

export type ApiJob = {
  id: string;
  company_id: string;
  company?: {
    id: string;
    name: string;
    sector: string;
    location: string;
  } | null;
  title: string;
  description: string;
  requirements: string[] | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  application_period_start: string;
  application_period_end: string;
  type: JobType;
  response_time: number | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type ApiResponse<T> = {
  status: number;
  data: T;
  message: string | null;
  timestamp: string;
};

type PaginatedJobs = {
  items: ApiJob[];
  pagination: Pagination;
};

export type JobsQuery = {
  page?: string;
  limit?: string;
  q?: string;
  type?: string;        // workplace: remote | hybrid | on_site
  job_type?: string;   // employment: full_time | contract | internship
  date_posted?: string; // 24h | week | month
  sort?: string;        // relevance | recent
  location?: string;
};

export const API_BASE_URL = process.env.API_BASE_URL ?? "http://127.0.0.1:8000";

export function getJobTypeLabel(type: JobType) {
  const labels: Record<JobType, string> = {
    on_site: "Presencial",
    remote: "Remoto",
    hybrid: "Híbrido",
  };

  return labels[type] ?? type;
}

export function getResponseTimeLabel(responseTime: number | null) {
  if (responseTime === null || responseTime === undefined) {
    return "Resposta não definida";
  }

  if (responseTime === 0) {
    return "Resposta no próprio dia";
  }

  return `Resposta em até ${responseTime} dia${responseTime === 1 ? "" : "s"}`;
}

export function getWorkplaceLabel(job: ApiJob) {
  const typeLabel = getJobTypeLabel(job.type);
  const location = job.company?.location;

  if (!location) {
    return typeLabel;
  }

  if (job.type === "remote") {
    return `${typeLabel} · base ${location}`;
  }

  return `${typeLabel} · ${location}`;
}

export async function getPublicJobs(query: JobsQuery = {}) {
  const params = new URLSearchParams();
  params.set("page", query.page ?? "1");
  params.set("limit", query.limit ?? "5");

  if (query.q) {
    params.set("q", query.q);
  }

  if (query.type && query.type !== "all") {
    params.set("type", query.type);
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/job/public?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possível carregar as vagas");
  }

  const payload = (await response.json()) as ApiResponse<PaginatedJobs>;
  return payload.data;
}

export async function getJobById(jobId: string) {
  const response = await fetch(`${API_BASE_URL}/api/v1/job/${jobId}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Não foi possível carregar os detalhes da vaga");
  }

  const payload = (await response.json()) as ApiResponse<ApiJob>;
  return payload.data;
}
