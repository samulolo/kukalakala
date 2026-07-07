import { API_BASE_URL } from "@/lib/jobs-api";
import { getAuthToken } from "@/lib/auth/auth-session";

const CLIENT_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? API_BASE_URL;

type ApiErrorResponse = {
  message?: string | null;
  data?: Array<{ msg?: string }> | null;
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

export async function applyToJob(jobId: string) {
  const token = getAuthToken();
  const response = await fetch(`${CLIENT_API_BASE_URL}/api/v1/candidate-auth/me/applications/${jobId}`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Não foi possível submeter a candidatura"));
  }

  return response.json();
}
