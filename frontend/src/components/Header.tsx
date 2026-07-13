"use client";

import { LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearAuthSession, getStoredDashboardPath, hasValidAuthSession } from "@/lib/auth/auth-session";

function getCookieValue(name: string) {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function getDashboardPathFromCookie() {
  const role = getCookieValue("kukalakala_role");

  if (role === "candidate") {
    return "/dashboard-candidato";
  }

  if (role === "company") {
    return "/dashboard";
  }

  return null;
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [authState, setAuthState] = useState<{
    checked: boolean;
    isAuthenticated: boolean;
    dashboardPath: string;
  }>({
    checked: false,
    isAuthenticated: false,
    dashboardPath: "/dashboard",
  });

  useEffect(() => {
    try {
      const isAuthenticated = hasValidAuthSession() || Boolean(getCookieValue("kukalakala_session"));
      const dashboardPath = getDashboardPathFromCookie() ?? getStoredDashboardPath();
      setAuthState({
        checked: true,
        isAuthenticated,
        dashboardPath: isAuthenticated ? dashboardPath : "/dashboard",
      });
    } catch {
      const hasSessionCookie = Boolean(getCookieValue("kukalakala_session"));
      setAuthState({
        checked: true,
        isAuthenticated: hasSessionCookie,
        dashboardPath: hasSessionCookie ? getDashboardPathFromCookie() ?? "/dashboard" : "/dashboard",
      });
    }
  }, [pathname]);

  function handleLogout() {
    try {
      clearAuthSession();
    } catch {
      document.cookie = "kukalakala_session=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "kukalakala_role=; path=/; max-age=0; SameSite=Lax";
    }
    setAuthState({
      checked: true,
      isAuthenticated: false,
      dashboardPath: "/dashboard",
    });
    router.push("/login");
  }

  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return null;
  }

  return (
    <nav
      className="relative z-10 mx-auto flex min-h-[76px] w-[min(1180px,calc(100%-32px))] items-center justify-between gap-3 sm:gap-6"
      aria-label="Navegação principal"
    >
      {/* Logo */}
      <a
        href="/"
        aria-label="Kukalakala - página inicial"
        className="min-w-0 shrink font-display text-[1rem] font-bold tracking-tight text-[#0f172a] sm:text-[1.05rem]"
      >
        kukalakala<span className="text-accent">.</span>
      </a>

      {/* Nav links */}
      <div className="hidden items-center gap-7 text-[0.88rem] font-medium text-[#64748b] md:flex">
        <a className="transition-colors hover:text-[#0f172a]" href="/vagas">Vagas</a>
        <a className="transition-colors hover:text-[#0f172a]" href="/#empresas">Empresas</a>
        <a className="transition-colors hover:text-[#0f172a]" href="/dashboard">Para empresas</a>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {authState.checked && !authState.isAuthenticated && (
          <a
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-[#dbe3ee] px-3 text-[0.84rem] font-semibold text-[#374151] transition-colors hover:border-accent hover:text-accent sm:px-4 sm:text-[0.88rem]"
          >
            Entrar
          </a>
        )}
        <a
          href={authState.isAuthenticated ? authState.dashboardPath : "/dashboard"}
          className={`${authState.isAuthenticated ? "inline-flex" : "hidden sm:inline-flex"} h-10 items-center justify-center rounded-xl bg-[#0f172a] px-4 text-[0.84rem] font-semibold text-white transition-colors hover:bg-[#1e293b] sm:px-5 sm:text-[0.875rem]`}
        >
          {authState.isAuthenticated ? "Dashboard" : "Publicar vaga"}
        </a>
        {authState.checked && authState.isAuthenticated && (
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#dbe3ee] px-3 text-[0.84rem] font-semibold text-[#374151] transition-colors hover:border-[#ef4444] hover:text-[#dc2626] sm:px-4 sm:text-[0.88rem]"
            aria-label="Sair"
          >
            <LogOut size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        )}
      </div>
    </nav>
  );
}
