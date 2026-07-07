"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LogOut } from "lucide-react";
import { clearAuthSession } from "@/lib/auth/auth-session";

export function CandidateDashboardActions() {
  const router = useRouter();

  function handleLogout() {
    clearAuthSession();
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Link href="/vagas" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-[0.84rem] font-semibold text-white hover:bg-accent-dark">
        Procurar vagas
        <ArrowUpRight size={15} aria-hidden="true" />
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-[#dbe3ee] px-4 text-[0.84rem] font-semibold text-[#475569] hover:border-[#ef4444] hover:text-[#dc2626]"
      >
        <LogOut size={15} aria-hidden="true" />
        Sair
      </button>
    </div>
  );
}
