import { API_BASE_URL } from "@/lib/jobs-api";
import { getAuthToken } from "@/lib/auth/auth-session";
import type { AuthCompany } from "@/lib/auth/auth-api";
import { normalizeErrorMessage } from "@/lib/friendly-error";

const CLIENT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? API_BASE_URL;

type ApiResponse<T> = {
  status: number;
  data: T;
  message: string | null;
  timestamp: string;
};

type ApiErrorResponse = {
  message?: string | null;
  data?: Array<{ msg?: string }> | null;
};

export type CompanyUpdatePayload = {
  name: string;
  email: string;
  sector: string;
  location: string;
  foundation_date: string | null;
};

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    const validationMessage = payload.data?.[0]?.msg?.replace("Value error, ", "");
    return normalizeErrorMessage(validationMessage || payload.message, fallback);
  } catch {
    return fallback;
  }
}

async function requestCompany<T>(path: string, init: RequestInit, fallback: string) {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${CLIENT_API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallback));
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export async function getAuthenticatedCompany() {
  return requestCompany<AuthCompany>(
    "/api/v1/company-auth/me",
    { method: "GET" },
    "Não foi possível carregar a empresa"
  );
}

export async function updateCompany(companyId: string, payload: CompanyUpdatePayload) {
  return requestCompany<AuthCompany>(
    `/api/v1/company/${companyId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Não foi possível atualizar a empresa"
  );
}
