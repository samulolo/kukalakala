import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type TokenPayload = {
  exp?: number;
  role?: string;
  sub?: string;
  user_metadata?: {
    account_type?: string;
    role?: string;
  };
};

function getTokenPayload(token: string): TokenPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="))) as TokenPayload;
  } catch {
    return null;
  }
}

function getAccountType(payload: TokenPayload | null) {
  const role = payload?.role;
  const metadataRole = payload?.user_metadata?.account_type ?? payload?.user_metadata?.role;

  if (role === "candidate" || role === "company") {
    return role;
  }

  if (metadataRole === "candidate" || metadataRole === "company") {
    return metadataRole;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const session = request.cookies.get("kukalakala_session")?.value;
  const payload = session ? getTokenPayload(session) : null;
  const accountType = getAccountType(payload);
  const hasValidSession = Boolean(
    payload &&
    typeof payload.exp === "number" &&
    payload.exp > Math.floor(Date.now() / 1000) &&
    accountType
  );

  if ((pathname === "/login" || pathname === "/registo") && hasValidSession) {
    const url = request.nextUrl.clone();

    if (accountType === "company") {
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    url.pathname = "/dashboard-candidato";
    url.search = "";
    return NextResponse.redirect(url);
  }

  const topLevelAliases: Record<string, string> = {
    "/candidato": "/dashboard-candidato",
    "/candidate": "/dashboard-candidato",
    "/candidate-dashboard": "/dashboard-candidato",
    "/dashboard-candidate": "/dashboard-candidato",
    "/empresa": "/dashboard",
    "/company": "/dashboard",
    "/company-dashboard": "/dashboard",
    "/dashboard-company": "/dashboard",
    "/painel": "/dashboard",
  };

  if (topLevelAliases[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = topLevelAliases[pathname];
    return NextResponse.redirect(url);
  }

  const routeAliases: Record<string, string> = {
    "/dashboard/job-posting": "/dashboard/vagas",
    "/dashboard/job-postings": "/dashboard/vagas",
    "/dashboard/jobs": "/dashboard/vagas",
    "/dashboard/candidates": "/dashboard/candidatos",
    "/dashboard/candidate": "/dashboard/candidatos",
    "/dashboard/company-profile": "/dashboard/perfil",
    "/dashboard/profile": "/dashboard/perfil",
    "/dashboard/messages": "/dashboard/mensagens",
    "/dashboard/message": "/dashboard/mensagens",
    "/dashboard/analytics": "/dashboard/metricas",
    "/dashboard/metrics": "/dashboard/metricas",
  };

  if (routeAliases[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = routeAliases[pathname];
    return NextResponse.redirect(url);
  }

  if (
    pathname === "/dashboard/job-posting/new" ||
    pathname === "/dashboard/job-postings/new" ||
    pathname === "/dashboard/jobs/new"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard/vagas/nova";
    return NextResponse.redirect(url);
  }

  if (
    pathname.startsWith("/dashboard/job-posting/") ||
    pathname.startsWith("/dashboard/job-postings/") ||
    pathname.startsWith("/dashboard/jobs/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = pathname
      .replace(/^\/dashboard\/jobs/, "/dashboard/vagas")
      .replace(/^\/dashboard\/job-postings/, "/dashboard/vagas")
      .replace(/^\/dashboard\/job-posting/, "/dashboard/vagas")
      .replace(/\/edit$/, "/editar");
    return NextResponse.redirect(url);
  }

  const requiredRole = pathname === "/dashboard" || pathname.startsWith("/dashboard/")
    ? "company"
    : pathname === "/dashboard-candidato" || pathname.startsWith("/dashboard-candidato/")
      ? "candidate"
      : pathname === "/candidaturas/nova" || pathname.startsWith("/candidaturas/nova/")
        ? "candidate"
        : null;

  if (!requiredRole) {
    return NextResponse.next();
  }

  if (
    hasValidSession &&
    accountType === requiredRole
  ) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/dashboard-candidato/:path*",
    "/candidaturas/nova/:path*",
    "/login",
    "/registo",
    "/candidato",
    "/candidate",
    "/candidate-dashboard",
    "/dashboard-candidate",
    "/empresa",
    "/company",
    "/company-dashboard",
    "/dashboard-company",
    "/painel",
  ],
};
