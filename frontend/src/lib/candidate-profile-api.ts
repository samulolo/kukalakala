import { API_BASE_URL } from "@/lib/jobs-api";
import type { ApiCandidateProfile } from "@/lib/candidate-dashboard-api";
import { getAuthToken } from "@/lib/auth/auth-session";

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

export type CandidateProfilePayload = {
  experience_years: number;
  professional_situation: "employed" | "unempoyed";
  key_competences: string[];
};

export type CandidateProfileUploadResponse = {
  candidate_id: string;
  filename: string;
  content_type: string;
  size: number;
  resume_url: string;
  text_extracted: boolean;
  extracted_text_length: number;
  from_cache: boolean;
  storage: {
    bucket: string;
    path: string;
  };
};

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    const validationMessage = payload.data?.[0]?.msg?.replace("Value error, ", "");
    return validationMessage || payload.message || fallback;
  } catch {
    return fallback;
  }
}

async function requestProfile<T>(path: string, init: RequestInit, fallback: string) {
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

export async function createCandidateProfile(candidateId: string, payload: CandidateProfilePayload) {
  return requestProfile<ApiCandidateProfile>(
    "/api/v1/candidate-profile/",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        candidate_id: candidateId,
        ...payload,
      }),
    },
    "Não foi possível criar o perfil"
  );
}

export async function updateCandidateProfile(candidateId: string, payload: CandidateProfilePayload) {
  return requestProfile<ApiCandidateProfile>(
    `/api/v1/candidate-profile/${candidateId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    "Não foi possível atualizar o perfil"
  );
}

export async function uploadCandidateCv(candidateId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return requestProfile<CandidateProfileUploadResponse>(
    `/api/v1/candidate-profile/${candidateId}/upload/cv`,
    {
      method: "POST",
      body: formData,
    },
    "Não foi possível carregar o CV"
  );
}
