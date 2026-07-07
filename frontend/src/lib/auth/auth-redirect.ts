import type { AuthSession } from "@/lib/auth/auth-api";
import type { AuthRole } from "@/lib/auth/auth-session";

export function getAuthRoleFromSession(session: AuthSession, roleOverride?: AuthRole): AuthRole {
  return roleOverride ?? (session.company ? "company" : "candidate");
}

export function getDefaultDashboardPath(session: AuthSession, roleOverride?: AuthRole) {
  const role = getAuthRoleFromSession(session, roleOverride);

  if (role === "company") {
    return "/dashboard";
  }

  const candidateId = session.candidate?.id ?? session.user?.id;
  return candidateId ? `/dashboard-candidato?candidateId=${candidateId}` : "/dashboard-candidato";
}

export function getSafeRedirectPath(session: AuthSession, redirectTo: string | null, roleOverride?: AuthRole) {
  const role = getAuthRoleFromSession(session, roleOverride);

  if (!redirectTo) {
    return getDefaultDashboardPath(session, role);
  }

  if (role === "company" && (redirectTo === "/dashboard" || redirectTo.startsWith("/dashboard/"))) {
    return redirectTo;
  }

  if (
    role === "candidate" &&
    (
      redirectTo === "/dashboard-candidato" ||
      redirectTo.startsWith("/dashboard-candidato?") ||
      redirectTo.startsWith("/dashboard-candidato/") ||
      redirectTo === "/candidaturas/nova" ||
      redirectTo.startsWith("/candidaturas/nova?")
    )
  ) {
    return redirectTo;
  }

  return getDefaultDashboardPath(session, role);
}
