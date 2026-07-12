import type { AuthCandidate, AuthCompany, AuthSession } from "@/lib/auth/auth-api";

const TOKEN_KEY = "kukalakala_access_token";
const CANDIDATE_KEY = "kukalakala_candidate";
const COMPANY_KEY = "kukalakala_company";
const ROLE_KEY = "kukalakala_auth_role";
const COOKIE_NAME = "kukalakala_session";
const ROLE_COOKIE_NAME = "kukalakala_role";

export type AuthRole = "candidate" | "company";

export function saveAuthSession(session: AuthSession, roleOverride?: AuthRole) {
  localStorage.setItem(TOKEN_KEY, session.access_token);
  const role = roleOverride ?? (session.company ? "company" : "candidate");
  localStorage.setItem(ROLE_KEY, role);

  if (role === "candidate") {
    const candidate = session.candidate ?? (session.user as AuthCandidate | undefined);

    if (candidate) {
      localStorage.setItem(CANDIDATE_KEY, JSON.stringify(candidate));
    }

    localStorage.removeItem(COMPANY_KEY);
  } else {
    const company = session.company ?? (session.user as AuthCompany | undefined);

    if (company) {
      localStorage.setItem(COMPANY_KEY, JSON.stringify(company));
    }

    localStorage.removeItem(CANDIDATE_KEY);
  }

  document.cookie = `${COOKIE_NAME}=${session.access_token}; path=/; max-age=${session.expires_in}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE_NAME}=${role}; path=/; max-age=${session.expires_in}; SameSite=Lax`;
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CANDIDATE_KEY);
  localStorage.removeItem(COMPANY_KEY);
  localStorage.removeItem(ROLE_KEY);
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

function getTokenPayload(token: string): { exp?: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="))) as { exp?: number };
  } catch {
    return null;
  }
}

export function getAuthToken() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return null;
  }

  if (!isTokenValid(token)) {
    clearAuthSession();
    return null;
  }

  return token;
}

export function getAuthSessionExpiresAt() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  const payload = getTokenPayload(token);
  return typeof payload?.exp === "number" ? payload.exp * 1000 : null;
}

function isTokenValid(token: string) {
  const payload = getTokenPayload(token);
  return Boolean(payload?.exp && payload.exp > Math.floor(Date.now() / 1000));
}

export function hasValidAuthSession() {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    return false;
  }

  const isValid = isTokenValid(token);

  if (!isValid) {
    clearAuthSession();
  }

  return isValid;
}

export function getStoredDashboardPath() {
  const role = getAuthRole();

  if (role === "company") {
    return "/dashboard";
  }

  const candidate = getStoredCandidate();
  return candidate?.id ? `/dashboard-candidato?candidateId=${candidate.id}` : "/dashboard-candidato";
}

export function getStoredCandidate(): AuthCandidate | null {
  const storedCandidate = localStorage.getItem(CANDIDATE_KEY);

  if (!storedCandidate) {
    return null;
  }

  try {
    return JSON.parse(storedCandidate) as AuthCandidate;
  } catch {
    return null;
  }
}

export function getStoredCompany(): AuthCompany | null {
  const storedCompany = localStorage.getItem(COMPANY_KEY);

  if (!storedCompany) {
    return null;
  }

  try {
    return JSON.parse(storedCompany) as AuthCompany;
  } catch {
    return null;
  }
}

export function getAuthRole() {
  return localStorage.getItem(ROLE_KEY);
}
