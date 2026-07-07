"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { clearAuthSession, getStoredCandidate, getStoredCompany } from "@/lib/auth/auth-session";
import type { AuthCompany } from "@/lib/auth/auth-api";

const navItems = [
  { id: 1, label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { id: 2, label: "Vagas", href: "/dashboard/vagas", icon: BriefcaseBusiness },
  { id: 3, label: "Candidatos", href: "/dashboard/candidatos", icon: UsersRound },
  { id: 4, label: "Perfil da empresa", href: "/dashboard/perfil", icon: Building2 },
  { id: 5, label: "Mensagens", href: "/dashboard/mensagens", icon: MessageSquareText },
  { id: 6, label: "Métricas", href: "/dashboard/metricas", icon: BarChart3 },
];

const candidateNavItem = {
  id: "candidate-profile",
  label: "Perfil do candidato",
  href: "/dashboard-candidato",
  icon: UserRound,
};

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(`${href}/`) || pathname === href;
}

function DashboardSideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [candidateProfileHref, setCandidateProfileHref] = useState(candidateNavItem.href);
  const [company, setCompany] = useState<AuthCompany | null>(null);

  useEffect(() => {
    const candidate = getStoredCandidate();
    if (candidate?.id) {
      setCandidateProfileHref(`${candidateNavItem.href}?candidateId=${candidate.id}`);
    }
    setCompany(getStoredCompany());
  }, []);

  function handleLogout() {
    clearAuthSession();
    setIsOpen(false);
    router.push("/login");
  }

  return (
    <>
      <div className="fixed left-0 top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#e2e8f0] bg-white px-4 lg:hidden">
        <Link href="/dashboard" className="font-display text-[1rem] font-bold tracking-tight text-[#0f172a]">
          Kukalakala<span className="text-accent">.</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#dbe3ee] text-[#334155]"
          aria-label="Abrir menu da dashboard"
          aria-expanded={isOpen}
        >
          <Menu size={20} aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-[#0f172a]/55 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-label="Fechar menu da dashboard"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[260px] flex-shrink-0 flex-col overflow-hidden bg-[#0f172a] text-white transition-transform duration-200 lg:w-[220px] lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full min-h-0 flex-col px-5 py-6">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1 font-display text-[1.1rem] font-bold tracking-tight text-white"
            >
              Kukalakala<span className="text-accent">.</span>
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 lg:hidden"
              aria-label="Fechar menu da dashboard"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

        <p className="mt-7 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">
          Empresa
        </p>

        <nav className="mt-3 flex flex-col gap-0.5" aria-label="Dashboard navigation">
          {navItems.map(({ id, label, href, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <Link
                key={id}
                href={href}
                onClick={() => setIsOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.88rem] font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                }`}
              >
                <Icon
                  size={16}
                  aria-hidden="true"
                  className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <p className="mt-6 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-slate-500">
          Candidato
        </p>

        <nav className="mt-3 flex flex-col gap-0.5" aria-label="Candidate dashboard navigation">
          {(() => {
            const active = pathname === candidateNavItem.href;
            const Icon = candidateNavItem.icon;

            return (
              <Link
                href={candidateProfileHref}
                onClick={() => setIsOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[0.88rem] font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-200"
                }`}
              >
                <Icon
                  size={16}
                  aria-hidden="true"
                  className={active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}
                />
                {candidateNavItem.label}
              </Link>
            );
          })()}
        </nav>

        {/* Hiring boost card */}
        <div className="mt-auto">
          <div className="rounded-xl bg-[#1e293b] p-3.5">
            <p className="text-[0.82rem] font-bold text-white">Hiring boost</p>
            <p className="mt-1 text-[0.76rem] leading-relaxed text-slate-400">
              Feature a role to reach 3x more candidates.
            </p>
            <button className="mt-2.5 w-full rounded-lg bg-accent py-2 text-[0.8rem] font-semibold text-white hover:bg-accent-dark">
              Upgrade plan
            </button>
          </div>

          {/* User row */}
          <div className="mt-3 flex items-center gap-2.5 px-1">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent text-[0.72rem] font-bold text-white">
              {(company?.name ?? "Empresa").slice(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[0.82rem] font-semibold text-white">{company?.name ?? "Empresa"}</p>
              <p className="truncate text-[0.72rem] text-slate-500">{company?.email ?? "Sessão de empresa"}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2.5 text-[0.84rem] font-semibold text-slate-300 transition hover:bg-white/[0.05] hover:text-white"
          >
            <LogOut size={16} aria-hidden="true" />
            Terminar sessão
          </button>
        </div>
      </div>
      </aside>
    </>
  );
}

export default DashboardSideMenu;
