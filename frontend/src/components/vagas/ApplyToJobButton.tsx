"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { getAuthRole } from "@/lib/auth/auth-session";

type Props = {
  jobId: string;
};

export function ApplyToJobButton({ jobId }: Props) {
  const router = useRouter();

  function handleApply() {
    const applyHref = `/candidaturas/nova?job_id=${jobId}`;
    const role = getAuthRole();

    if (role !== "candidate") {
      router.push(`/login?redirect=${encodeURIComponent(applyHref)}`);
      return;
    }

    router.push(applyHref);
  }

  return (
    <button
      type="button"
      onClick={handleApply}
      className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 font-display text-[0.9rem] font-semibold text-white shadow-[0_14px_28px_rgba(37,87,167,0.2)] transition-all hover:-translate-y-0.5 hover:bg-accent-dark hover:shadow-[0_18px_34px_rgba(37,87,167,0.26)] disabled:cursor-not-allowed disabled:opacity-70"
    >
      Candidatar-me
      <ArrowUpRight size={17} aria-hidden="true" />
    </button>
  );
}
